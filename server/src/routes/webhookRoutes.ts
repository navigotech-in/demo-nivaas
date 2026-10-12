import { Router } from 'express'
import { paymentService } from '../services/paymentService.js'

const router = Router()

// POST /api/v1/webhooks/razorpay - Authoritative Razorpay Webhook
router.post('/razorpay', async (req, res, next) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || ''
    // req.body is raw Buffer when parsed with express.raw
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body))
    const payload = typeof req.body === 'object' && !Buffer.isBuffer(req.body) ? req.body : JSON.parse(rawBody.toString('utf8'))

    const result = await paymentService.handleWebhook(rawBody, signature, payload)
    res.json({ success: true, result })
  } catch (err: any) {
    if (err.message === 'INVALID_WEBHOOK_SIGNATURE') {
      res.status(400).json({ success: false, error: 'Invalid webhook signature' })
      return
    }
    next(err)
  }
})

export default router
