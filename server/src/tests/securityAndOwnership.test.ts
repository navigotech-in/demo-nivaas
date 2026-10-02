import { describe, it, expect, beforeAll, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'

describe('Indore House Makers — Phase 2 & 3 Security, IDOR & Role Governance Test Suite', () => {
  const app = createApp()
  let userAToken: string
  let userAId: string
  let userBToken: string
  let userBId: string
  let adminToken: string
  let adminId: string

  beforeAll(async () => {
    try {
      await prisma.$connect()
    } catch {}
  })

  beforeEach(async () => {
    db.reset()
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

    // 1. Create User A
    const resA = await request(app).post('/api/v1/auth/signup').send({
      name: 'User Alpha',
      email: 'alpha@example.com',
      phone: '9876543201',
      password: 'Password123!',
    })
    userAToken = resA.body.data.accessToken
    userAId = resA.body.data.user.id

    // 2. Create User B
    const resB = await request(app).post('/api/v1/auth/signup').send({
      name: 'User Beta',
      email: 'beta@example.com',
      phone: '9876543202',
      password: 'Password123!',
    })
    userBToken = resB.body.data.accessToken
    userBId = resB.body.data.user.id

    // 3. Setup Admin
    const adminRes = await request(app).post('/api/v1/auth/setup-admin').send({
      name: 'System Administrator',
      email: 'admin.lead@example.com',
      phone: '9876543200',
      password: 'AdminSuperPassword123!',
      setupSecret: process.env.SETUP_SECRET || 'ihm_initial_admin_setup_secret_2026',
    })
    adminToken = adminRes.body.data.accessToken
    adminId = adminRes.body.data.user.id
  })

  // 1. Public Signup Role Injection Prevention
  it('Public signup should force role to USER even if role: ADMIN is sent in request body', async () => {
    const maliciousRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Hacker User',
      email: 'hacker@example.com',
      phone: '9876543299',
      password: 'Password123!',
      role: 'ADMIN', // Malicious attempt to self-elevate
    })

    expect(maliciousRes.status).toBe(201)
    expect(maliciousRes.body.data.user.role).toBe('USER')

    // Verify in database
    try {
      const dbUser = await prisma.user.findUnique({ where: { email: 'hacker@example.com' } })
      if (dbUser) {
        expect(dbUser.role).toBe('USER')
      }
    } catch {}
  })

  // 2. IDOR / User Isolation
  it('User A should strictly see only their own data and cannot access User B projects/sessions', async () => {
    // User A creates a project
    await request(app)
      .post('/api/v1/users/me/projects')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        jobType: '2D_FLOOR_PLAN',
        inputPayload: { title: 'Alpha 30x50 Villa', bhk: '3 BHK' },
      })

    // User B fetches their projects -> should be empty (0 projects)
    const userBProjects = await request(app)
      .get('/api/v1/users/me/projects')
      .set('Authorization', `Bearer ${userBToken}`)

    expect(userBProjects.status).toBe(200)
    expect(userBProjects.body.data.total).toBe(0)
    expect(userBProjects.body.data.projects.length).toBe(0)

    // User A fetches their projects -> 1 project
    const userAProjects = await request(app)
      .get('/api/v1/users/me/projects')
      .set('Authorization', `Bearer ${userAToken}`)

    expect(userAProjects.status).toBe(200)
    expect(userAProjects.body.data.total).toBe(1)
  })

  // 3. Admin API Route Protection (403 for regular USER)
  it('Regular USER must be rejected with 403 Forbidden from accessing any /api/v1/admin/* endpoints', async () => {
    const overviewRes = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${userAToken}`)

    expect(overviewRes.status).toBe(403)
    expect(overviewRes.body.error.code).toBe('FORBIDDEN')

    const usersRes = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${userAToken}`)

    expect(usersRes.status).toBe(403)

    const grantRes = await request(app)
      .post(`/api/v1/admin/users/${userBId}/credits`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({ amount: 50, reason: 'Unauthorized grant' })

    expect(grantRes.status).toBe(403)
  })

  // 4. Duplicate Mobile Uniqueness on Profile Update
  it('Profile update should reject duplicate phone number with 409 Conflict', async () => {
    // User B tries to update phone to User A's phone number
    const conflictRes = await request(app)
      .patch('/api/v1/users/me/profile')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({ phone: '9876543201' }) // Already belongs to User A

    expect(conflictRes.status).toBe(409)
    expect(conflictRes.body.error.code).toBe('CONFLICT')
  })

  // 5. Admin Credit Grant Security & Idempotency
  it('Admin Credit Grant must enforce mandatory reason, max limit, and prevent duplicate idempotency', async () => {
    // A. Reject missing reason
    const noReasonRes = await request(app)
      .post(`/api/v1/admin/users/${userAId}/credits`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 100 })

    expect(noReasonRes.status).toBe(422)

    // B. Reject excessive amount (> 1000)
    const tooManyRes = await request(app)
      .post(`/api/v1/admin/users/${userAId}/credits`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 5000, reason: 'Too many credits' })

    expect(tooManyRes.status).toBe(422)

    // C. Valid Grant with Idempotency Key
    const key = `test_idem_${Date.now()}`
    const grantRes = await request(app)
      .post(`/api/v1/admin/users/${userAId}/credits`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 200, reason: 'Approved bonus allowance', idempotencyKey: key })

    expect(grantRes.status).toBe(200)
    expect(grantRes.body.data.creditsAdded).toBe(200)
    expect(grantRes.body.data.newBalance).toBe(300) // 100 welcome + 200 granted

    // D. Duplicate Grant with same key must return existing without double-adding
    const dupRes = await request(app)
      .post(`/api/v1/admin/users/${userAId}/credits`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ amount: 200, reason: 'Approved bonus allowance', idempotencyKey: key })

    expect(dupRes.status).toBe(200)
    expect(dupRes.body.data.newBalance).toBe(300) // Stays 300, not 500
  })

  // 6. Admin Users Table Server-Side Pagination
  it('Admin Users Directory should paginate correctly and strip sensitive fields', async () => {
    const pagedRes = await request(app)
      .get('/api/v1/admin/users?page=1&pageSize=2')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(pagedRes.status).toBe(200)
    expect(pagedRes.body.data.length).toBeLessThanOrEqual(2)
    expect(pagedRes.body.meta.pageSize).toBe(2)
    expect(pagedRes.body.meta.total).toBeGreaterThanOrEqual(3) // User A, User B, Admin

    // Ensure sensitive fields are NEVER exposed
    const firstUser = pagedRes.body.data[0]
    expect(firstUser.passwordHash).toBeUndefined()
    expect(firstUser.tokenHash).toBeUndefined()
    expect(firstUser.setupSecret).toBeUndefined()
  })

  // 7. Revoked Session Immediate Rejection
  it('Revoked device session should be immediately rejected on refresh', async () => {
    // Sign in User A on Device 2
    const login2Res = await request(app).post('/api/v1/auth/login').send({
      identifier: 'alpha@example.com',
      password: 'Password123!',
    })
    const refreshToken2 = login2Res.headers['set-cookie'][0].split(';')[0].split('=')[1]

    // Revoke all other sessions from Device 1
    await request(app)
      .delete('/api/v1/users/me/sessions')
      .set('Authorization', `Bearer ${userAToken}`)

    // Device 2 tries to refresh token -> must be rejected
    const refreshRes = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', [`ihm_refresh_token=${refreshToken2}`])

    expect(refreshRes.status).toBe(401)
  })
})
