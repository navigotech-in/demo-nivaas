import { Router } from 'express'
import { paymentService } from '../services/paymentService.js'

const router = Router()

// GET /api/v1/products/design-pass - Public product information
router.get('/design-pass', async (_req, res, next) => {
  try {
    const product = await paymentService.getDesignPassProduct()
    res.json({
      success: true,
      data: product,
    })
  } catch (err) {
    next(err)
  }
})

export default router
