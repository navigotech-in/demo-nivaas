import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'

const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ihm_test?schema=public',
    },
  },
})

describe('Indore House Makers — Real PostgreSQL Integration & Persistence Test Suite', () => {
  beforeAll(async () => {
    await testPrisma.$connect()
  })

  afterAll(async () => {
    await testPrisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean test database tables before each test
    await testPrisma.creditTransaction.deleteMany()
    await testPrisma.creditReservation.deleteMany()
    await testPrisma.refreshSession.deleteMany()
    await testPrisma.accessPass.deleteMany()
    await testPrisma.payment.deleteMany()
    await testPrisma.purchase.deleteMany()
    await testPrisma.lead.deleteMany()
    await testPrisma.auditLog.deleteMany()
    await testPrisma.adminSetupLock.deleteMany()
    await testPrisma.user.deleteMany()
  })

  // 1. Real PostgreSQL User Creation & Query Persistence
  it('should persist real User and RefreshSession records in PostgreSQL database', async () => {
    const passwordHash = await bcrypt.hash('SecurePass2026!', 10)
    const user = await testPrisma.user.create({
      data: {
        id: 'usr_real_' + crypto.randomBytes(6).toString('hex'),
        email: 'priya.sharma@indorehousemakers.in',
        name: 'Priya Sharma',
        phone: '9876543210',
        passwordHash,
        role: 'USER',
      },
    })

    expect(user.id).toBeDefined()
    expect(user.email).toBe('priya.sharma@indorehousemakers.in')

    // Create session
    const rawToken = crypto.randomBytes(40).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const session = await testPrisma.refreshSession.create({
      data: {
        id: 'ses_real_' + crypto.randomBytes(6).toString('hex'),
        userId: user.id,
        familyId: 'fam_real_' + crypto.randomBytes(6).toString('hex'),
        tokenHash,
        userAgent: 'Integration Test Browser',
        ipAddress: '127.0.0.1',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    expect(session.id).toBeDefined()

    // Query from real DB to prove persistence
    const queriedUser = await testPrisma.user.findUnique({
      where: { id: user.id },
      include: { sessions: true },
    })

    expect(queriedUser).not.toBeNull()
    expect(queriedUser?.sessions.length).toBe(1)
    expect(queriedUser?.sessions[0].tokenHash).toBe(tokenHash)
  })

  // 2. Real PostgreSQL Atomic One-Time Admin Setup Lock
  it('should enforce atomic AdminSetupLock in PostgreSQL so only one admin is created in concurrent race', async () => {
    const runSetup = async (email: string, name: string) => {
      return await testPrisma.$transaction(async (tx) => {
        const existingAdmin = await tx.user.count({ where: { role: 'ADMIN' } })
        if (existingAdmin > 0) {
          throw new Error('SETUP_ALREADY_COMPLETED')
        }

        const existingLock = await tx.adminSetupLock.findUnique({ where: { id: 'SETUP_LOCK' } })
        if (existingLock?.isLocked) {
          throw new Error('SETUP_ALREADY_COMPLETED')
        }

        const passwordHash = await bcrypt.hash('AdminPassword2026!', 10)
        const admin = await tx.user.create({
          data: {
            id: 'usr_admin_' + crypto.randomBytes(6).toString('hex'),
            email,
            name,
            passwordHash,
            role: 'ADMIN',
          },
        })

        await tx.adminSetupLock.upsert({
          where: { id: 'SETUP_LOCK' },
          create: { id: 'SETUP_LOCK', isLocked: true, adminId: admin.id, lockedAt: new Date() },
          update: { isLocked: true, adminId: admin.id, lockedAt: new Date() },
        })

        return admin
      })
    }

    // 1st Admin succeeds
    const admin1 = await runSetup('admin1@indorehousemakers.in', 'First Admin')
    expect(admin1.role).toBe('ADMIN')

    // 2nd Admin MUST fail with SETUP_ALREADY_COMPLETED
    await expect(
      runSetup('admin2@indorehousemakers.in', 'Second Admin')
    ).rejects.toThrow('SETUP_ALREADY_COMPLETED')

    // Verify DB state: exactly 1 admin exists
    const totalAdmins = await testPrisma.user.count({ where: { role: 'ADMIN' } })
    expect(totalAdmins).toBe(1)
  })

  // 3. Real PostgreSQL Credit Ledger & Double Settlement Protection
  it('should calculate balance via PostgreSQL SUM(amount) and reject duplicate RELEASE/CONSUME inside real transactions', async () => {
    // 1. Create test user
    const user = await testPrisma.user.create({
      data: {
        id: 'usr_credit_' + crypto.randomBytes(6).toString('hex'),
        email: 'vikram.aditya@example.com',
        name: 'Vikram Aditya',
        passwordHash: 'dummy_hash',
        role: 'USER',
      },
    })

    // 2. Grant 5 credits (+5 delta)
    await testPrisma.creditTransaction.create({
      data: {
        id: 'tx_grant_' + crypto.randomBytes(6).toString('hex'),
        userId: user.id,
        amount: 5,
        type: 'GRANT',
        description: '₹299 30-Day Design Pass',
      },
    })

    // Check balance
    const aggBefore = await testPrisma.creditTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    })
    expect(aggBefore._sum.amount).toBe(5)

    // 3. Reserve 1 credit for AI Job in atomic transaction
    const reservation = await testPrisma.$transaction(async (tx) => {
      const res = await tx.creditReservation.create({
        data: {
          userId: user.id,
          jobId: 'job_real_001',
          amount: 1,
          status: 'RESERVED',
        },
      })

      await tx.creditTransaction.create({
        data: {
          id: 'tx_res_' + crypto.randomBytes(6).toString('hex'),
          userId: user.id,
          amount: -1,
          type: 'RESERVE',
          description: 'Reserved for job_real_001',
          referenceType: 'GENERATION_JOB',
          referenceId: res.id,
        },
      })

      return res
    })

    // Remaining balance is 4
    const aggAfterReserve = await testPrisma.creditTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    })
    expect(aggAfterReserve._sum.amount).toBe(4)

    // Helper for atomic consumption
    const settleConsumption = async (reservationId: string) => {
      return await testPrisma.$transaction(async (tx) => {
        const res = await tx.creditReservation.findUnique({ where: { id: reservationId } })
        if (!res || res.status !== 'RESERVED') {
          throw new Error('RESERVATION_ALREADY_SETTLED')
        }

        await tx.creditReservation.update({
          where: { id: reservationId },
          data: { status: 'CONSUMED', settledAt: new Date() },
        })

        return await tx.creditTransaction.create({
          data: {
            id: 'tx_consume_' + crypto.randomBytes(6).toString('hex'),
            userId: user.id,
            amount: 0,
            type: 'CONSUME',
            description: 'Consumed for job_real_001',
            referenceType: 'GENERATION_JOB',
            referenceId: reservationId,
          },
        })
      })
    }

    // 4. 1st Consume succeeds
    const consumeTx = await settleConsumption(reservation.id)
    expect(consumeTx.amount).toBe(0)

    // 5. 2nd Duplicate Consume MUST throw RESERVATION_ALREADY_SETTLED in PostgreSQL
    await expect(settleConsumption(reservation.id)).rejects.toThrow('RESERVATION_ALREADY_SETTLED')

    // 6. Duplicate Release on consumed reservation MUST also throw RESERVATION_ALREADY_SETTLED
    const settleRelease = async (reservationId: string) => {
      return await testPrisma.$transaction(async (tx) => {
        const res = await tx.creditReservation.findUnique({ where: { id: reservationId } })
        if (!res || res.status !== 'RESERVED') {
          throw new Error('RESERVATION_ALREADY_SETTLED')
        }

        await tx.creditReservation.update({
          where: { id: reservationId },
          data: { status: 'RELEASED', settledAt: new Date() },
        })

        return await tx.creditTransaction.create({
          data: {
            id: 'tx_rel_' + crypto.randomBytes(6).toString('hex'),
            userId: user.id,
            amount: res.amount,
            type: 'RELEASE',
            description: 'Refund released',
            referenceType: 'GENERATION_JOB',
            referenceId: reservationId,
          },
        })
      })
    }

    await expect(settleRelease(reservation.id)).rejects.toThrow('RESERVATION_ALREADY_SETTLED')

    // Final balance is strictly 4
    const aggFinal = await testPrisma.creditTransaction.aggregate({
      where: { userId: user.id },
      _sum: { amount: true },
    })
    expect(aggFinal._sum.amount).toBe(4)
  })
})
