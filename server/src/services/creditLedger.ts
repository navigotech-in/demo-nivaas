import crypto from 'node:crypto'
import { db } from '../db/store.js'
import { CreditTransaction, CreditTransactionType } from '../types/models.js'

export interface ReserveCreditResult {
  success: boolean
  reservationId?: string
  remainingBalance: number
  error?: string
}

export class CreditLedgerService {
  // 1. Calculate Live Balance (Sum of All Immutable Ledger Deltas)
  public calculateBalance(userId: string): number {
    const userTransactions = db.creditTransactions.filter((tx) => tx.userId === userId)
    const balance = userTransactions.reduce((acc, tx) => acc + tx.amount, 0)
    return Math.max(0, balance)
  }

  // 2. Grant Credits (e.g. +5 for ₹299 Pass)
  public grantCredits(params: {
    userId: string
    passId?: string
    amount: number // e.g. +5
    description: string
    referenceId?: string
  }): CreditTransaction {
    if (params.amount <= 0) {
      throw new Error('Grant amount must be positive.')
    }

    const currentBalance = this.calculateBalance(params.userId)
    const newBalance = currentBalance + params.amount

    const transaction: CreditTransaction = {
      id: 'tx_' + crypto.randomBytes(8).toString('hex'),
      userId: params.userId,
      passId: params.passId,
      amount: params.amount, // +5
      balanceAfter: newBalance,
      type: 'PURCHASE_GRANT' as CreditTransactionType,
      description: params.description,
      referenceType: 'PURCHASE',
      referenceId: params.referenceId,
      createdAt: new Date().toISOString(),
    }

    db.creditTransactions.push(transaction)

    db.logAudit({
      actorId: params.userId,
      action: 'ledger.grant',
      entityType: 'CreditTransaction',
      entityId: transaction.id,
      metadata: { amount: params.amount, balanceAfter: newBalance },
    })

    return transaction
  }

  // 3. Reserve Credit for AI Generation Job (Atomic Lock)
  public reserveCredit(params: {
    userId: string
    jobId: string
    cost?: number // Default 1 credit
  }): ReserveCreditResult {
    const cost = params.cost ?? 1
    const currentBalance = this.calculateBalance(params.userId)

    if (currentBalance < cost) {
      return {
        success: false,
        remainingBalance: currentBalance,
        error: 'INSUFFICIENT_CREDITS',
      }
    }

    const reservationId = 'res_' + crypto.randomBytes(8).toString('hex')
    const newBalance = currentBalance - cost

    // Register reservation in state machine
    db.reservations.set(reservationId, {
      id: reservationId,
      userId: params.userId,
      jobId: params.jobId,
      amount: cost,
      status: 'RESERVED',
    })

    const transaction: CreditTransaction = {
      id: 'tx_' + crypto.randomBytes(8).toString('hex'),
      userId: params.userId,
      amount: -cost, // -1
      balanceAfter: newBalance,
      type: 'AI_CONSUMPTION' as CreditTransactionType,
      description: `Credit reserved for AI job ${params.jobId}`,
      referenceType: 'GENERATION_JOB',
      referenceId: reservationId,
      createdAt: new Date().toISOString(),
    }

    db.creditTransactions.push(transaction)

    db.logAudit({
      actorId: params.userId,
      action: 'ledger.reserve',
      entityType: 'CreditTransaction',
      entityId: transaction.id,
      metadata: { reservationId, jobId: params.jobId, cost, balanceAfter: newBalance },
    })

    return {
      success: true,
      reservationId,
      remainingBalance: newBalance,
    }
  }

  // 4. Consume Reservation (AI Generation Succeeded)
  public confirmConsumption(params: {
    userId: string
    reservationId: string
    jobId: string
  }): CreditTransaction {
    const resEntry = db.reservations.get(params.reservationId)
    if (!resEntry || resEntry.userId !== params.userId) {
      // Fallback check in creditTransactions
      const hasReservationTx = db.creditTransactions.some(
        (tx) => tx.userId === params.userId && tx.referenceId === params.reservationId && tx.amount < 0
      )
      if (!hasReservationTx) {
        throw new Error('RESERVATION_NOT_FOUND')
      }
    }

    if (resEntry && resEntry.status !== 'RESERVED') {
      throw new Error('RESERVATION_ALREADY_SETTLED')
    }

    // Protection against duplicate consume/release in transaction history
    const alreadySettledTx = db.creditTransactions.some(
      (tx) =>
        tx.userId === params.userId &&
        tx.referenceId === params.reservationId &&
        tx.amount >= 0
    )
    if (alreadySettledTx) {
      throw new Error('RESERVATION_ALREADY_SETTLED')
    }

    if (resEntry) {
      resEntry.status = 'CONSUMED'
    }

    const currentBalance = this.calculateBalance(params.userId)

    const transaction: CreditTransaction = {
      id: 'tx_' + crypto.randomBytes(8).toString('hex'),
      userId: params.userId,
      amount: 0, // 0 delta
      balanceAfter: currentBalance,
      type: 'AI_CONSUMPTION' as CreditTransactionType,
      description: `Reservation ${params.reservationId} successfully fulfilled for job ${params.jobId}`,
      referenceType: 'GENERATION_JOB',
      referenceId: params.reservationId,
      createdAt: new Date().toISOString(),
    }

    db.creditTransactions.push(transaction)

    db.logAudit({
      actorId: params.userId,
      action: 'ledger.consume_success',
      entityType: 'CreditTransaction',
      entityId: transaction.id,
      metadata: { reservationId: params.reservationId, jobId: params.jobId },
    })

    return transaction
  }

  // 5. Release Reservation (AI Generation Failed or Cancelled)
  public releaseReservation(params: {
    userId: string
    reservationId: string
    jobId: string
    reason?: string
    amount?: number
  }): CreditTransaction {
    const resEntry = db.reservations.get(params.reservationId)
    if (!resEntry || resEntry.userId !== params.userId) {
      // Fallback check in creditTransactions
      const reservationTx = db.creditTransactions.find(
        (tx) => tx.userId === params.userId && tx.referenceId === params.reservationId && tx.amount < 0
      )
      if (!reservationTx) {
        throw new Error('RESERVATION_NOT_FOUND')
      }
    }

    if (resEntry && resEntry.status !== 'RESERVED') {
      throw new Error('RESERVATION_ALREADY_SETTLED')
    }

    // Protection against duplicate consume/release in transaction history
    const alreadySettledTx = db.creditTransactions.some(
      (tx) =>
        tx.userId === params.userId &&
        tx.referenceId === params.reservationId &&
        tx.amount >= 0
    )
    if (alreadySettledTx) {
      throw new Error('RESERVATION_ALREADY_SETTLED')
    }

    const refundAmount = params.amount ?? resEntry?.amount ?? 1
    if (resEntry) {
      resEntry.status = 'RELEASED'
    }

    const currentBalance = this.calculateBalance(params.userId)
    const newBalance = currentBalance + refundAmount

    const transaction: CreditTransaction = {
      id: 'tx_' + crypto.randomBytes(8).toString('hex'),
      userId: params.userId,
      amount: refundAmount, // +1
      balanceAfter: newBalance,
      type: 'REFUND_REVERSAL' as CreditTransactionType,
      description: `Reservation ${params.reservationId} released: ${params.reason || 'System failure refund'}`,
      referenceType: 'GENERATION_JOB',
      referenceId: params.reservationId,
      createdAt: new Date().toISOString(),
    }

    db.creditTransactions.push(transaction)

    db.logAudit({
      actorId: params.userId,
      action: 'ledger.release_refund',
      entityType: 'CreditTransaction',
      entityId: transaction.id,
      metadata: {
        reservationId: params.reservationId,
        jobId: params.jobId,
        refundAmount,
        balanceAfter: newBalance,
        reason: params.reason,
      },
    })

    return transaction
  }

  // 6. User History
  public getHistory(userId: string): CreditTransaction[] {
    return db.creditTransactions
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export const creditLedger = new CreditLedgerService()
