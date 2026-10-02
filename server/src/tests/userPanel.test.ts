import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { authService } from '../services/authService.js'
import { creditLedger } from '../services/creditLedger.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'

describe('Indore House Makers — Phase 2: User Panel API & Ownership Test Suite', () => {
  const app = createApp()
  let userTokenA: string
  let userTokenB: string
  let userAId: string
  let userBId: string

  beforeEach(async () => {
    db.reset()
    // Clean test database tables
    try {
      await prisma.creditTransaction.deleteMany()
      await prisma.creditReservation.deleteMany()
      await prisma.generationJob.deleteMany()
      await prisma.refreshSession.deleteMany()
      await prisma.accessPass.deleteMany()
      await prisma.payment.deleteMany()
      await prisma.purchase.deleteMany()
      await prisma.lead.deleteMany()
      await prisma.auditLog.deleteMany()
      await prisma.adminSetupLock.deleteMany()
      await prisma.user.deleteMany()
    } catch {}

    // Create User A
    const signupA = await authService.signup({
      name: 'Rohan Sharma',
      email: 'rohan@example.com',
      password: 'Password123!',
      phone: '9876543210',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    })
    userTokenA = signupA.accessToken
    userAId = signupA.user.id

    // Create User B (for cross-user ownership isolation testing)
    const signupB = await authService.signup({
      name: 'Ananya Gupta',
      email: 'ananya@example.com',
      password: 'Password999!',
      phone: '9811122233',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    })
    userTokenB = signupB.accessToken
    userBId = signupB.user.id
  })

  // 1. Unauthenticated Request Rejection
  it('GET /api/v1/users/me/dashboard should return 401 Unauthorized without Bearer token', async () => {
    const res = await request(app).get('/api/v1/users/me/dashboard')
    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('UNAUTHORIZED')
  })

  // 2. Real DB Dashboard Overview for New User (Zero-State)
  it('GET /api/v1/users/me/dashboard should return real database zero-states for new user', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/dashboard')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user.email).toBe('rohan@example.com')
    expect(res.body.data.user.name).toBe('Rohan Sharma')
    expect(res.body.data.metrics.totalProjects).toBe(0)
    expect(res.body.data.metrics.availableCredits).toBe(100) // 100 Welcome credits
    expect(res.body.data.metrics.activePass).toBeNull()
    expect(res.body.data.recentProjects).toEqual([])
    expect(res.body.data.recentTransactions.length).toBe(1) // 1 Welcome credit grant
  })

  // 3. Project Creation and Listing
  it('POST & GET /api/v1/users/me/projects should create and list user projects', async () => {
    const createRes = await request(app)
      .post('/api/v1/users/me/projects')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        jobType: '2D_FLOOR_PLAN',
        inputPayload: {
          title: '30x50 East Facing Duplex',
          plotSize: '30x50 ft',
          facing: 'East',
          bhk: '3 BHK',
        },
      })

    expect(createRes.status).toBe(201)
    expect(createRes.body.data.id).toBeDefined()
    expect(createRes.body.data.userId).toBe(userAId)

    // List projects for User A
    const listRes = await request(app)
      .get('/api/v1/users/me/projects')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(listRes.status).toBe(200)
    expect(listRes.body.data.total).toBe(1)
    expect(listRes.body.data.projects[0].id).toBe(createRes.body.data.id)

    // Verify User B cannot see User A's project (Isolation)
    const listResB = await request(app)
      .get('/api/v1/users/me/projects')
      .set('Authorization', `Bearer ${userTokenB}`)

    expect(listResB.status).toBe(200)
    expect(listResB.body.data.total).toBe(0)
    expect(listResB.body.data.projects).toEqual([])
  })

  // 4. Credit Ledger Balance and History
  it('GET /api/v1/users/me/credits should return live balance calculated from ledger and history', async () => {
    // Grant 5 credits to User A
    await prisma.creditTransaction.create({
      data: {
        id: 'tx_test_grant_01',
        userId: userAId,
        amount: 5,
        type: 'GRANT',
        description: '₹299 30-Day Design Pass',
      },
    })

    // Reserve 1 credit for Job
    await prisma.creditTransaction.create({
      data: {
        id: 'tx_test_res_01',
        userId: userAId,
        amount: -1,
        type: 'RESERVE',
        description: 'Credit reserved for AI job',
      },
    })

    const creditsRes = await request(app)
      .get('/api/v1/users/me/credits')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(creditsRes.status).toBe(200)
    expect(creditsRes.body.data.balance).toBe(104) // 100 welcome + 5 - 1 = 104
    expect(creditsRes.body.data.totalTransactions).toBe(3)

    // Verify User B's credit balance is strictly isolated (only their own 100 welcome credits)
    const creditsResB = await request(app)
      .get('/api/v1/users/me/credits')
      .set('Authorization', `Bearer ${userTokenB}`)

    expect(creditsResB.body.data.balance).toBe(100)
    expect(creditsResB.body.data.totalTransactions).toBe(1)
  })

  // 5. Active Pass Status
  it('GET /api/v1/users/me/pass should return active pass with days remaining', async () => {
    const now = new Date()
    const expiry = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000) // 15 days left

    await prisma.accessPass.create({
      data: {
        id: 'pass_test_01',
        userId: userAId,
        passType: 'DESIGN_PASS_299',
        status: 'ACTIVE',
        startsAt: now,
        expiresAt: expiry,
        creditsGranted: 5,
      },
    })

    const passRes = await request(app)
      .get('/api/v1/users/me/pass')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(passRes.status).toBe(200)
    expect(passRes.body.data.activePass).not.toBeNull()
    expect(passRes.body.data.activePass.status).toBe('ACTIVE')
    expect(passRes.body.data.activePass.daysRemaining).toBeGreaterThanOrEqual(14)
  })

  // 6. Active Device Sessions and Revoke Option
  it('GET & DELETE /api/v1/users/me/sessions should list active sessions and revoke device', async () => {
    // Fetch sessions
    const sessionsRes = await request(app)
      .get('/api/v1/users/me/sessions')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(sessionsRes.status).toBe(200)
    expect(sessionsRes.body.data.total).toBe(1)
    expect(sessionsRes.body.data.sessions[0].isCurrent).toBe(true)

    // User creates a 2nd session (e.g. on mobile)
    await authService.createSession({
      id: userAId,
      email: 'rohan@example.com',
      name: 'Rohan Sharma',
      role: 'USER',
    } as any, '192.168.1.10', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')

    const twoSessionsRes = await request(app)
      .get('/api/v1/users/me/sessions')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(twoSessionsRes.body.data.total).toBe(2)

    // Revoke all other sessions
    const revokeAllRes = await request(app)
      .delete('/api/v1/users/me/sessions')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(revokeAllRes.status).toBe(200)

    const finalSessionsRes = await request(app)
      .get('/api/v1/users/me/sessions')
      .set('Authorization', `Bearer ${userTokenA}`)

    expect(finalSessionsRes.body.data.total).toBe(1)
    expect(finalSessionsRes.body.data.sessions[0].isCurrent).toBe(true)
  })

  // 7. Profile Update
  it('PATCH /api/v1/users/me/profile should update name and phone number', async () => {
    const updateRes = await request(app)
      .patch('/api/v1/users/me/profile')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        name: 'Rohan K. Sharma',
        phone: '9988776655',
      })

    expect(updateRes.status).toBe(200)
    expect(updateRes.body.data.user.name).toBe('Rohan K. Sharma')
    expect(updateRes.body.data.user.phone).toBe('9988776655')
  })

  // 8. Change Password
  it('POST /api/v1/users/me/change-password should verify current password and change to new password', async () => {
    // Wrong current password fails with 500 / error
    const wrongRes = await request(app)
      .post('/api/v1/users/me/change-password')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        currentPassword: 'WrongPassword!',
        newPassword: 'BrandNewSecurePass2026!',
      })

    expect(wrongRes.status).toBe(400)
    expect(wrongRes.body.error.code).toBe('INVALID_CURRENT_PASSWORD')

    // Correct password succeeds
    const successRes = await request(app)
      .post('/api/v1/users/me/change-password')
      .set('Authorization', `Bearer ${userTokenA}`)
      .send({
        currentPassword: 'Password123!',
        newPassword: 'BrandNewSecurePass2026!',
      })

    expect(successRes.status).toBe(200)
    expect(successRes.body.success).toBe(true)

    // Login with new password works
    const loginNew = await request(app).post('/api/v1/auth/login').send({
      identifier: 'rohan@example.com',
      password: 'BrandNewSecurePass2026!',
    })

    expect(loginNew.status).toBe(200)
  })
})
