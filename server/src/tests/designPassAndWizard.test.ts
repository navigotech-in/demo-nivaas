import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../app.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { authService } from '../services/authService.js'

describe('Indore House Makers — Design Pass, Wizard & Chatbot API Suite', () => {
  const app = createApp()
  let userToken: string
  let testUserId: string

  beforeEach(async () => {
    db.reset()
    // Create test user in memory
    const user = db.createUser({
      id: 'usr_test_101',
      email: 'testuser@indorehousemakers.in',
      passwordHash: 'hash123',
      name: 'Indore Client',
      phone: '+919876500000',
      role: 'USER',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    testUserId = user.id

    try {
      await prisma.accessPass.deleteMany({ where: { userId: user.id } })
      await prisma.payment.deleteMany({ where: { userId: user.id } })
      await prisma.creditTransaction.deleteMany({ where: { userId: user.id } })
      await prisma.generationJob.deleteMany({ where: { userId: user.id } })
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          name: user.name,
          phone: user.phone,
          role: 'USER',
          isEmailVerified: true,
          isPhoneVerified: true,
        },
      })
    } catch {
      // Ignored if in mock mode
    }

    const session = db.createSession({
      id: 'sess_test_101',
      userId: user.id,
      familyId: 'fam_test_101',
      tokenHash: 'tokenhash123',
      userAgent: 'TestBrowser',
      ipAddress: '127.0.0.1',
      isRevoked: false,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    userToken = authService.generateAccessToken(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
      },
      session.id
    )
  })

  // 1. Product Contract
  it('GET /api/v1/products/design-pass should return ₹299 (29900 paise) product details', async () => {
    const res = await request(app).get('/api/v1/products/design-pass')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.code).toBe('DESIGN_PASS_299')
    expect(res.body.data.priceInPaise).toBe(29900)
    expect(res.body.data.priceInr).toBe(299)
    expect(res.body.data.creditsGranted).toBe(5)
    expect(res.body.data.durationDays).toBe(30)
    expect(res.body.data.autoRenewal).toBe(false)
  })

  // 2. Wizard Draft Autosave & Requirements Confirmation
  it('POST /api/v1/wizard/sessions and /confirm should save draft and lock confirmed snapshot', async () => {
    // Autosave draft
    const saveRes = await request(app)
      .post('/api/v1/wizard/sessions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        stage: 20,
        wizardData: {
          plotWidth: 30,
          plotLength: 50,
          plotArea: '1500 sq.ft',
          facing: 'East',
          bhk: '3 BHK',
          tier: 'Premium Luxury',
        },
      })

    expect(saveRes.status).toBe(200)
    expect(saveRes.body.data.id).toBeDefined()
    const sessionId = saveRes.body.data.id

    // Confirm requirements
    const confirmRes = await request(app)
      .post(`/api/v1/wizard/sessions/${sessionId}/confirm`)
      .set('Authorization', `Bearer ${userToken}`)
      .send()

    expect(confirmRes.status).toBe(200)
    expect(confirmRes.body.data.session.status).toBe('CONFIRMED')
    expect(confirmRes.body.data.inputHash).toBeDefined()
    expect(confirmRes.body.data.summary.facing).toBe('East')
  })

  // 3. Free 2D Conceptual Preview Generation
  it('POST /api/v1/generations/free-2d-preview should generate watermarked 2D layout & locked 3D teaser', async () => {
    const draftRes = await request(app)
      .post('/api/v1/wizard/sessions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        wizardData: { plotWidth: 30, plotLength: 60, facing: 'North', bhk: '4 BHK' },
      })
    const sessionId = draftRes.body.data.id

    const genRes = await request(app)
      .post('/api/v1/generations/free-2d-preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ wizardSessionId: sessionId })

    expect(genRes.status).toBe(200)
    expect(genRes.body.success).toBe(true)
    expect(genRes.body.data.assets.watermark).toContain('INDORE HOUSE MAKERS')
    expect(genRes.body.data.assets.roomZoning.length).toBeGreaterThan(0)
    expect(genRes.body.data.assets.is3DLocked).toBe(true)
    expect(genRes.body.data.assets.locked3DTeaserUrl).toBeDefined()
  })

  // 4. ₹299 Razorpay Order Creation & Verification with 5 Credits Grant
  it('POST /api/v1/payments/razorpay/orders & /verify should atomically grant 5 3D credits', async () => {
    // 1. Create order
    const orderRes = await request(app)
      .post('/api/v1/payments/razorpay/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send()

    expect(orderRes.status).toBe(200)
    expect(orderRes.body.data.orderId).toBeDefined()
    expect(orderRes.body.data.amountInPaise).toBe(29900)

    const { orderId } = orderRes.body.data

    // 2. Verify payment (Test Mock)
    const verifyRes = await request(app)
      .post('/api/v1/payments/razorpay/verify')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        orderId,
        paymentId: 'pay_test_999',
        signature: 'test_mock_signature_valid',
      })

    expect(verifyRes.status).toBe(200)
    expect(verifyRes.body.data.creditsGranted).toBe(5)
    expect(verifyRes.body.data.totalCredits).toBe(5)
    expect(verifyRes.body.data.pass.status).toBe('ACTIVE')
  })

  // 5. Paid 3D Generation & Credit Deduction
  it('POST /api/v1/generations/3d should reserve 1 credit and complete 3D package', async () => {
    // Seed 5 credits for user in memory and prisma
    db.createCreditTransaction({
      userId: testUserId,
      amount: 5,
      type: 'PURCHASE_GRANT',
      description: 'Initial 5 Credits',
    })

    try {
      await prisma.creditTransaction.create({
        data: {
          id: 'tx_seed_' + Date.now(),
          userId: testUserId,
          amount: 5,
          type: 'GRANT',
          description: 'Initial 5 Credits',
        },
      })
    } catch {
      // Ignored
    }

    const gen3dRes = await request(app)
      .post('/api/v1/generations/3d')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ wizardSessionId: 'wiz_test_3d' })

    expect(gen3dRes.status).toBe(202)
    expect(gen3dRes.body.data.creditsRemaining).toBe(4)
    expect(gen3dRes.body.data.status).toBe('QUEUED')
  })

  // 6. AI Chatbot API & SSE Quota
  it('GET /api/v1/ai/chat/quota should enforce daily limit and reset time', async () => {
    // Seed active pass for usr_test_101 to verify active pass tier quota of 25
    const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    db.accessPasses.set('pass_test_quota', {
      id: 'pass_test_quota',
      userId: testUserId,
      passType: 'DESIGN_PASS_299',
      status: 'ACTIVE',
      startsAt: new Date().toISOString(),
      expiresAt: expiry.toISOString(),
      creditsGranted: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    try {
      await prisma.accessPass.create({
        data: {
          id: 'pass_test_quota_' + Date.now(),
          userId: testUserId,
          passType: 'DESIGN_PASS_299',
          status: 'ACTIVE',
          startsAt: new Date(),
          expiresAt: expiry,
          creditsGranted: 5,
        },
      })
    } catch {}

    const quotaRes = await request(app)
      .get('/api/v1/ai/chat/quota')
      .set('Authorization', `Bearer ${userToken}`)

    expect(quotaRes.status).toBe(200)
    expect(quotaRes.body.data.limit).toBe(25) // Active Design Pass holder
    expect(quotaRes.body.data.remaining).toBeGreaterThan(0)
    expect(quotaRes.body.data.resetAt).toContain('+05:30')
  })
})
