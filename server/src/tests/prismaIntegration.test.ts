import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaDb } from '../db/prismaService.js'
import { prisma } from '../db/prisma.js'

describe('Indore House Makers — Prisma Service & Atomic Transaction Integration Tests', () => {
  const mockUserId = 'usr_test_db_001'

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  // 1. Credit Ledger Balance Calculation via Prisma Aggregate
  it('calculateCreditBalance should aggregate amount over CreditTransaction table', async () => {
    const aggregateSpy = vi.spyOn(prisma.creditTransaction, 'aggregate').mockResolvedValue({
      _sum: { amount: 5 },
      _count: {},
      _avg: {},
      _min: {},
      _max: {},
    } as any)

    const balance = await prismaDb.calculateCreditBalance(mockUserId)
    expect(balance).toBe(5)
    expect(aggregateSpy).toHaveBeenCalledWith({
      where: { userId: mockUserId },
      _sum: { amount: true },
    })
  })

  // 2. Atomic Credit Reservation & Transaction
  it('reserveCredit should create CreditReservation and negative CreditTransaction in a transaction', async () => {
    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const mockTx = {
        creditTransaction: {
          aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 5 } }),
          create: vi.fn().mockResolvedValue({ id: 'tx_reserve_01', amount: -1 }),
        },
        creditReservation: {
          create: vi.fn().mockResolvedValue({ id: 'res_001', userId: mockUserId, jobId: 'job_01', status: 'RESERVED' }),
        },
        auditLog: {
          create: vi.fn().mockResolvedValue({ id: 'aud_001' }),
        },
      }
      return cb(mockTx)
    })

    const result = await prismaDb.reserveCredit({
      userId: mockUserId,
      jobId: 'job_01',
      cost: 1,
    })

    expect(result.success).toBe(true)
    expect(result.reservationId).toBe('res_001')
    expect(result.remainingBalance).toBe(4)
  })

  // 3. Duplicate Settlement Protection on confirmConsumption
  it('confirmConsumption should reject already settled or non-RESERVED reservations with RESERVATION_ALREADY_SETTLED', async () => {
    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const mockTx = {
        creditReservation: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'res_001',
            userId: mockUserId,
            status: 'CONSUMED', // Already consumed!
          }),
          update: vi.fn(),
        },
        creditTransaction: {
          create: vi.fn(),
        },
        auditLog: {
          create: vi.fn(),
        },
      }
      return cb(mockTx)
    })

    await expect(
      prismaDb.confirmConsumption({
        userId: mockUserId,
        reservationId: 'res_001',
        jobId: 'job_01',
      })
    ).rejects.toThrow('RESERVATION_ALREADY_SETTLED')
  })

  // 4. Duplicate Settlement Protection on releaseReservation
  it('releaseReservation should reject already settled reservations with RESERVATION_ALREADY_SETTLED', async () => {
    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const mockTx = {
        creditReservation: {
          findUnique: vi.fn().mockResolvedValue({
            id: 'res_002',
            userId: mockUserId,
            status: 'RELEASED', // Already released!
          }),
          update: vi.fn(),
        },
        creditTransaction: {
          create: vi.fn(),
        },
        auditLog: {
          create: vi.fn(),
        },
      }
      return cb(mockTx)
    })

    await expect(
      prismaDb.releaseReservation({
        userId: mockUserId,
        reservationId: 'res_002',
        jobId: 'job_02',
        reason: 'Generation failed',
      })
    ).rejects.toThrow('RESERVATION_ALREADY_SETTLED')
  })

  // 5. Atomic Admin Bootstrap Lock
  it('bootstrapAdminAtomically should reject setup if Admin already exists or lock is active', async () => {
    vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
      const mockTx = {
        user: {
          count: vi.fn().mockResolvedValue(1), // Existing admin found
        },
        adminSetupLock: {
          findUnique: vi.fn().mockResolvedValue({ id: 'SETUP_LOCK', isLocked: true }),
        },
      }
      return cb(mockTx)
    })

    await expect(
      prismaDb.bootstrapAdminAtomically('newadmin@indorehousemakers.in', 'Password123!', 'Admin User')
    ).rejects.toThrow('SETUP_ALREADY_COMPLETED')
  })
})
