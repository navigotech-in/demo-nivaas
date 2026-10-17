import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { prismaDb } from '../db/prismaService.js'
import { creditLedger } from '../services/creditLedger.js'

describe('Indore House Makers — Auth & Credit Ledger API Test Suite', () => {
  const app = createApp()

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
    } catch (e) {
      console.error('CLEANUP ERROR:', e)
    }
  })

  // 1. Health Endpoint
  it('GET /api/v1/health should return ok status', async () => {
    const res = await request(app).get('/api/v1/health')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.service).toBe('indore-house-makers-api')
  })

  // 2. User Signup & Cookie Setting
  it('POST /api/v1/auth/signup should register a user and set HttpOnly refresh cookie', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signup')
      .send({
        name: 'Aarav Sharma',
        email: 'aarav@example.com',
        password: 'Password123!',
        phone: '9876543210',
      })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBeDefined()
    expect(res.body.data.user.email).toBe('aarav@example.com')
    expect(res.body.data.user.role).toBe('USER')

    // Verify Set-Cookie header
    const rawCookies = res.headers['set-cookie']
    const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies].filter(Boolean) as string[]
    expect(cookies.length).toBeGreaterThan(0)
    expect(cookies.some((c: string) => c.includes('ihm_refresh_token'))).toBe(true)
  })

  // 3. Duplicate Email Rejection
  it('POST /api/v1/auth/signup should reject duplicate email with 409', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'Password123!',
      phone: '9876543210',
    })

    const duplicateRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Another Aarav',
      email: 'aarav@example.com',
      password: 'Password999!',
      phone: '9876543211',
    })

    expect(duplicateRes.status).toBe(409)
    expect(duplicateRes.body.success).toBe(false)
    expect(duplicateRes.body.error.code).toBe('CONFLICT')
  })

  // 4. User Login & /auth/me Profile Fetch
  it('POST /api/v1/auth/login and GET /api/v1/auth/me should restore user session', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      name: 'Neha Patel',
      email: 'neha@example.com',
      password: 'Password123!',
      phone: '9811122233',
    })

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'neha@example.com',
      password: 'Password123!',
    })

    expect(loginRes.status).toBe(200)
    const token = loginRes.body.data.accessToken

    // Fetch me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)

    expect(meRes.status).toBe(200)
    expect(meRes.body.data.email).toBe('neha@example.com')
    expect(meRes.body.data.name).toBe('Neha Patel')
  })

  // 5. Server Guard: Regular user cannot access Admin endpoints (403)
  it('GET /api/v1/admin/overview should return 403 Forbidden for regular USER', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Regular Customer',
      email: 'cust@example.com',
      password: 'Password123!',
      phone: '9876543212',
    })

    const token = signupRes.body.data.accessToken

    const adminRes = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${token}`)

    expect(adminRes.status).toBe(403)
    expect(adminRes.body.success).toBe(false)
    expect(adminRes.body.error.code).toBe('FORBIDDEN')
  })

  // 6. Bootstrap Admin can access Admin endpoints
  it('Bootstrap Admin should access /api/v1/admin/overview successfully', async () => {
    await prismaDb.bootstrapAdminAtomically('admin@indorehousemakers.in', 'AdminSecret2026!', 'Indore House Makers Admin')

    const loginRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'admin@indorehousemakers.in',
      password: 'AdminSecret2026!',
    })

    expect(loginRes.status).toBe(200)
    const adminToken = loginRes.body.data.accessToken

    const adminRes = await request(app)
      .get('/api/v1/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`)

    expect(adminRes.status).toBe(200)
    expect(adminRes.body.success).toBe(true)
    expect(adminRes.body.data.metrics.totalAdmins).toBe(1)
  })

  // 7. Refresh Token Rotation with 15s Grace Window
  it('POST /api/v1/auth/refresh should rotate token and handle concurrent 15s grace without revoking family', async () => {
    const signupRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Vikram Singh',
      email: 'vikram@example.com',
      password: 'Password123!',
      phone: '9876543213',
    })

    const rawCookies = signupRes.headers['set-cookie']
    const cookieList = Array.isArray(rawCookies) ? rawCookies : [rawCookies].filter(Boolean) as string[]
    const cookieHeader = cookieList.map((c: string) => c.split(';')[0]).join('; ')

    // 1st Refresh: Rotates token successfully
    const firstRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieHeader)

    expect(firstRefresh.status).toBe(200)
    expect(firstRefresh.body.data.accessToken).toBeDefined()

    // 2nd Concurrent Refresh using the OLD cookie within 15s grace
    const concurrentOldRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', cookieHeader)

    // Should return 401 TOKEN_ALREADY_ROTATED without deleting family
    expect(concurrentOldRefresh.status).toBe(401)
    expect(concurrentOldRefresh.body.error.code).toBe('TOKEN_ALREADY_ROTATED')

    // Verify the newly issued cookie is still valid
    const newCookies = firstRefresh.headers['set-cookie']
    const newCookieList = Array.isArray(newCookies) ? newCookies : [newCookies].filter(Boolean) as string[]
    const newCookieHeader = newCookieList.map((c: string) => c.split(';')[0]).join('; ')

    const validNewRefresh = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', newCookieHeader)

    expect(validNewRefresh.status).toBe(200)
  })

  // 8. Credit Transaction Ledger: Grant, Reserve, Release and Consume Integrity
  it('Credit Ledger should calculate balance accurately through immutable delta events', () => {
    const userId = 'usr_test_credit_01'

    // Initial balance should be 0
    expect(creditLedger.calculateBalance(userId)).toBe(0)

    // 1. Grant 5 credits
    creditLedger.grantCredits({
      userId,
      amount: 5,
      description: '₹299 30-Day Design Pass',
    })
    expect(creditLedger.calculateBalance(userId)).toBe(5)

    // 2. Reserve 1 credit for Job A
    const resA = creditLedger.reserveCredit({ userId, jobId: 'job_001' })
    expect(resA.success).toBe(true)
    expect(resA.remainingBalance).toBe(4)
    expect(creditLedger.calculateBalance(userId)).toBe(4)

    // 3. Confirm consumption for Job A (Success outcome: 0 delta)
    creditLedger.confirmConsumption({
      userId,
      reservationId: resA.reservationId!,
      jobId: 'job_001',
    })
    expect(creditLedger.calculateBalance(userId)).toBe(4)

    // 4. Reserve 1 credit for Job B
    const resB = creditLedger.reserveCredit({ userId, jobId: 'job_002' })
    expect(resB.success).toBe(true)
    expect(creditLedger.calculateBalance(userId)).toBe(3)

    // 5. Release reservation for Job B (Failure refund: +1 delta)
    creditLedger.releaseReservation({
      userId,
      reservationId: resB.reservationId!,
      jobId: 'job_002',
      reason: 'AI generation timeout',
    })
    expect(creditLedger.calculateBalance(userId)).toBe(4)
  })

  // 9. Credit Ledger: Duplicate Settlement Protection (Double Release / Double Consume)
  it('Credit Ledger should reject duplicate release or consume for the same reservation', () => {
    const userId = 'usr_test_credit_02'
    creditLedger.grantCredits({ userId, amount: 5, description: 'Pass' })

    // Reserve 1 credit
    const res = creditLedger.reserveCredit({ userId, jobId: 'job_999' })
    expect(res.success).toBe(true)

    // 1st Consume succeeds
    creditLedger.confirmConsumption({
      userId,
      reservationId: res.reservationId!,
      jobId: 'job_999',
    })

    // 2nd Duplicate Consume MUST throw RESERVATION_ALREADY_SETTLED
    expect(() => {
      creditLedger.confirmConsumption({
        userId,
        reservationId: res.reservationId!,
        jobId: 'job_999',
      })
    }).toThrow('RESERVATION_ALREADY_SETTLED')

    // Subsequent Release on already consumed reservation MUST also throw RESERVATION_ALREADY_SETTLED
    expect(() => {
      creditLedger.releaseReservation({
        userId,
        reservationId: res.reservationId!,
        jobId: 'job_999',
      })
    }).toThrow('RESERVATION_ALREADY_SETTLED')
  })

  // 10. One-Time Setup Admin: Wrong Secret Rejected
  it('POST /api/v1/auth/setup-admin should reject wrong or missing setup secret with 401', async () => {
    const res = await request(app)
      .post('/api/v1/auth/setup-admin')
      .send({
        name: 'Super Admin',
        email: 'admin@indorehousemakers.in',
        phone: '9876543210',
        password: 'AdminPassword2026!',
        setupSecret: 'wrong_secret_key_12345',
      })

    expect(res.status).toBe(401)
    expect(res.body.success).toBe(false)
    expect(res.body.error.code).toBe('INVALID_SETUP_SECRET')
  })

  // 11. One-Time Setup Admin: First Admin Success & Second Attempt Permanent Lock
  it('POST /api/v1/auth/setup-admin should create first admin and permanently lock subsequent requests', async () => {
    // 1. Initial status is allowed
    const statusBefore = await request(app).get('/api/v1/auth/setup-status')
    expect(statusBefore.status).toBe(200)
    expect(statusBefore.body.data.isSetupAllowed).toBe(true)

    // 2. First Admin setup with valid secret
    const setupRes = await request(app)
      .post('/api/v1/auth/setup-admin')
      .send({
        name: 'Founding Admin',
        email: 'founder@indorehousemakers.in',
        phone: '9876543210',
        password: 'SecureAdminPass2026!',
        setupSecret: process.env.SETUP_SECRET || 'ihm_initial_admin_setup_secret_2026',
      })

    expect(setupRes.status).toBe(201)
    expect(setupRes.body.success).toBe(true)
    expect(setupRes.body.data.user.role).toBe('ADMIN')
    expect(setupRes.body.data.accessToken).toBeDefined()

    // 3. Status now indicates setup closed
    const statusAfter = await request(app).get('/api/v1/auth/setup-status')
    expect(statusAfter.body.data.isSetupAllowed).toBe(false)

    // 4. Second Admin setup attempt MUST be rejected with 403
    const secondSetupRes = await request(app)
      .post('/api/v1/auth/setup-admin')
      .send({
        name: 'Second Admin Attempter',
        email: 'hacker@example.com',
        phone: '9876543211',
        password: 'AnotherPassword2026!',
        setupSecret: process.env.SETUP_SECRET || 'ihm_initial_admin_setup_secret_2026',
      })

    expect(secondSetupRes.status).toBe(403)
    expect(secondSetupRes.body.error.code).toBe('SETUP_ALREADY_COMPLETED')
  })

  // 12. Race Condition Protection: Simultaneous Bootstrap Admin creates only ONE admin
  it('Atomic Admin Setup should ensure only one admin is created in concurrent race', async () => {
    db.reset()
    try {
      await prisma.user.deleteMany()
    } catch {}

    const results = await Promise.allSettled([
      request(app)
        .post('/api/v1/auth/setup-admin')
        .send({
          name: 'Concurrent Admin 1',
          email: 'admin1@indorehousemakers.in',
          phone: '9876543210',
          password: 'Password12345!',
          setupSecret: process.env.SETUP_SECRET || 'ihm_initial_admin_setup_secret_2026',
        }),
      request(app)
        .post('/api/v1/auth/setup-admin')
        .send({
          name: 'Concurrent Admin 2',
          email: 'admin2@indorehousemakers.in',
          phone: '9876543211',
          password: 'Password12345!',
          setupSecret: process.env.SETUP_SECRET || 'ihm_initial_admin_setup_secret_2026',
        }),
    ])

    const successful = results.filter(
      (r) => r.status === 'fulfilled' && (r.value as any).status === 201
    )
    const rejected = results.filter(
      (r) => r.status === 'fulfilled' && (r.value as any).status === 403
    )

    expect(successful.length).toBe(1)
    expect(rejected.length).toBe(1)
  })

  // 13. Portal Isolation: Admin only on admin portal, User only on client portal
  it('Portal Isolation: rejects admin login on client portal and user login on admin portal', async () => {
    // Register user
    await request(app).post('/api/v1/auth/signup').send({
      name: 'Portal Test User',
      email: 'user_portal@example.com',
      password: 'UserPass123!',
      phone: '9876543222',
    })

    // Setup an admin directly in db
    const bcrypt = await import('bcryptjs')
    const adminPasswordHash = await bcrypt.default.hash('AdminPass123!', 10)
    db.createUser({
      id: 'admin_test_id',
      email: 'admin_portal@ihm.com',
      name: 'IHM Administrator',
      phone: '9876543233',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    // 1. Regular user trying to login on admin portal -> 403 ADMIN_PORTAL_ONLY
    const userOnAdminRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'user_portal@example.com',
      password: 'UserPass123!',
      portal: 'admin',
    })
    expect(userOnAdminRes.status).toBe(403)
    expect(userOnAdminRes.body.error.code).toBe('ADMIN_PORTAL_ONLY')

    // 2. Admin trying to login on client portal -> 403 CLIENT_PORTAL_ONLY
    const adminOnClientRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'admin_portal@ihm.com',
      password: 'AdminPass123!',
      portal: 'client',
    })
    expect(adminOnClientRes.status).toBe(403)
    expect(adminOnClientRes.body.error.code).toBe('CLIENT_PORTAL_ONLY')

    // 3. Regular user on client portal -> 200 OK
    const userOnClientRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'user_portal@example.com',
      password: 'UserPass123!',
      portal: 'client',
    })
    expect(userOnClientRes.status).toBe(200)
    expect(userOnClientRes.body.data.user.role).toBe('USER')

    // 4. Admin on admin portal -> 200 OK
    const adminOnAdminRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'admin_portal@ihm.com',
      password: 'AdminPass123!',
      portal: 'admin',
    })
    expect(adminOnAdminRes.status).toBe(200)
    expect(adminOnAdminRes.body.data.user.role).toBe('ADMIN')
  })

  // 15. Password Reset Flow: /forgot-password & /reset-password
  it('should complete end-to-end forgot password and reset password flow', async () => {
    // 1. Sign up user
    await request(app).post('/api/v1/auth/signup').send({
      name: 'Reset Test User',
      email: 'resetuser@example.com',
      password: 'OldPassword123!',
      phone: '9822334455',
    })

    // 2. Request reset code
    const forgotRes = await request(app).post('/api/v1/auth/forgot-password').send({
      identifier: 'resetuser@example.com',
    })
    expect(forgotRes.status).toBe(200)
    expect(forgotRes.body.success).toBe(true)
    const devCode = forgotRes.body.data.devCode
    expect(devCode).toBeDefined()
    expect(devCode.length).toBe(6)

    // 3. Reset with wrong code -> Should fail
    const wrongCodeRes = await request(app).post('/api/v1/auth/reset-password').send({
      identifier: 'resetuser@example.com',
      code: '000000',
      newPassword: 'BrandNewPassword123!',
    })
    expect(wrongCodeRes.body.success).toBe(false)

    // 4. Reset with valid code
    const resetRes = await request(app).post('/api/v1/auth/reset-password').send({
      identifier: 'resetuser@example.com',
      code: devCode,
      newPassword: 'BrandNewPassword123!',
    })
    expect(resetRes.status).toBe(200)
    expect(resetRes.body.success).toBe(true)
    expect(resetRes.body.data.message).toContain('Password reset successfully')

    // 5. Old password login should now fail
    const oldLoginRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'resetuser@example.com',
      password: 'OldPassword123!',
      portal: 'client',
    })
    expect(oldLoginRes.status).toBe(401)

    // 6. New password login should succeed
    const newLoginRes = await request(app).post('/api/v1/auth/login').send({
      identifier: 'resetuser@example.com',
      password: 'BrandNewPassword123!',
      portal: 'client',
    })
    expect(newLoginRes.status).toBe(200)
    expect(newLoginRes.body.success).toBe(true)
    expect(newLoginRes.body.data.user.email).toBe('resetuser@example.com')
  })
})
