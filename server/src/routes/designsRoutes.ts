import { Router } from 'express'
import { demoDesigns } from '../data.js'

const router = Router()

router.get('/', (req, res) => {
  const type = (req.query.type as string | undefined) ?? ''
  const limit = Number(req.query.limit ?? 12)

  const designs = type && type !== 'HOUSE_PLAN' ? [] : demoDesigns
  res.json({
    success: true,
    data: designs.slice(0, limit),
    meta: { page: 1, pageSize: limit, total: designs.length },
  })
})

export default router
