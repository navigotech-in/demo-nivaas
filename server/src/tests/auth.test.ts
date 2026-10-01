import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { db } from '../db/store.js'
import { creditLedger } from '../services/creditLedger.js'

describe('Indore House Makers — Auth & Credit Ledger API Test Suite', () => {
  const app = createApp()

  beforeEach(() => {
    // Reset test store
    db.users.clear()
    db.sessions.clear()
    db.accessPasses.clear()
    db.creditTransactions = []
    db.auditLogs = []
    db.seedDefaultProduct()
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
    const cookies = res.headers['set-cookie']
    expect(cookies).toBeDefined()
    expect(cookies.some((c: string) => c.includes('ihm_refresh_token'))).toBe(true)
  })

  // 3. Duplicate Email Rejection
  it('POST /api/v1/auth/signup should reject duplicate email with 409', async () => {
    await request(app).post('/api/v1/auth/signup').send({
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      password: 'Password123!',
    })

    const duplicateRes = await request(app).post('/api/v1/auth/signup').send({
      name: 'Another Aarav',
      email: 'aarav@example.com',
      password: 'Password999!',
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
    db.bootstrapAdmin('admin@indorehousemakers.in', 'AdminSecret2026!')

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
    })

    const rawCookies = signupRes.headers['set-cookie']
    const cookieHeader = rawCookies.map((c: string) => c.split(';')[0]).join('; ')

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
    const newCookieHeader = newCookies.map((c: string) => c.split(';')[0]).join('; ')

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
})
