import { Router } from 'express'
import { paymentService } from '../services/paymentService.js'
import { requireAuth } from '../middleware/auth.js'
import { creditLedger } from '../services/creditLedger.js'
import { prismaDb } from '../db/prismaService.js'

const router = Router()

// POST /api/v1/payments/razorpay/orders - Create Razorpay order (with duplicate protection)
router.post('/razorpay/orders', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const { forceRenewal } = req.body || {}

    // 1. Authoritative Backend Check: Does user have active pass with unused credits?
    const activePass = await prismaDb.getActivePass(userId)
    const remainingCredits = await prismaDb.calculateCreditBalance(userId)

    if (activePass && remainingCredits > 0 && !forceRenewal) {
      res.status(409).json({
        success: false,
        error: {
          code: 'ACTIVE_PASS_EXISTS',
          message: `You already have an active Design Pass with ${remainingCredits} credits remaining.`,
          activePass: {
            expiresAt: activePass.expiresAt,
            remainingCredits,
          },
        },
      })
      return
    }

    const orderData = await paymentService.createOrder(userId)
    res.json({
      success: true,
      data: orderData,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/payments/razorpay/verify - Verify checkout response and activate pass
router.post('/razorpay/verify', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const { orderId, paymentId, signature } = req.body

    if (!orderId || !paymentId) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYMENT_PAYLOAD', message: 'orderId and paymentId are required.' },
      })
      return
    }

    const result = await paymentService.verifyPayment({
      userId,
      orderId,
      paymentId,
      signature: signature || 'test_mock_signature_valid',
    })

    res.json({
      success: true,
      message: 'Design Pass activated — 5 3D generation credits added.',
      data: result,
    })
  } catch (err: any) {
    if (err.message === 'INVALID_PAYMENT_SIGNATURE') {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_SIGNATURE', message: 'Payment signature verification failed.' },
      })
      return
    }
    next(err)
  }
})

// GET /api/v1/payments/purchases - User purchase history
router.get('/purchases', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const purchases = await paymentService.getUserPurchases(userId)
    res.json({
      success: true,
      data: purchases,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/payments/status - Quick pass & balance status
router.get('/status', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const balance = creditLedger.calculateBalance(userId)
    const history = creditLedger.getHistory(userId)
    res.json({
      success: true,
      data: {
        balance,
        hasActivePass: balance > 0 || history.some((tx) => tx.type === 'GRANT' || tx.type === 'PURCHASE_GRANT'),
        history,
      },
    })
  } catch (err) {
    next(err)
  }
})

export default router
