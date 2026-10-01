import { Router } from 'express'

const router = Router()

router.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      service: 'indore-house-makers-api',
      version: '0.2.0',
      timestamp: new Date().toISOString(),
    },
  })
})

export default router
