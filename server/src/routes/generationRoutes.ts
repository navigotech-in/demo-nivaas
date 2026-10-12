import { Router } from 'express'
import { wizardService } from '../services/wizardService.js'
import { generationService } from '../services/generationService.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/v1/generations/free-preview-eligibility
router.get('/free-preview-eligibility', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const eligibility = await wizardService.checkFreePreviewEligibility(userId)
    res.json({
      success: true,
      data: eligibility,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/generations/free-2d-preview - Generate Free Conceptual 2D Plan
router.post('/free-2d-preview', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const { wizardSessionId, idempotencyKey } = req.body

    if (!wizardSessionId) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'wizardSessionId is required' },
      })
      return
    }

    const result = await wizardService.generateFree2DPreview({
      userId,
      wizardSessionId,
      idempotencyKey,
    })

    res.json({
      success: true,
      message: 'Free 2D conceptual layout preview generated successfully.',
      data: result,
    })
  } catch (err: any) {
    if (err.message === 'FREE_PREVIEW_ALREADY_CONSUMED') {
      res.status(400).json({
        success: false,
        error: {
          code: 'FREE_PREVIEW_EXHAUSTED',
          message: 'You have already used your lifetime free 2D preview. Unlock the 30-Day Design Pass to generate custom 3D designs.',
        },
      })
      return
    }
    next(err)
  }
})

// POST /api/v1/generations/3d - Reserve 1 Credit & Start Full Paid 3D Generation
router.post('/3d', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const { wizardSessionId, idempotencyKey } = req.body

    if (!wizardSessionId) {
      res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'wizardSessionId is required' },
      })
      return
    }

    const result = await generationService.startPaid3DGeneration({
      userId,
      wizardSessionId,
      idempotencyKey,
    })

    res.status(202).json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    if (err.message === 'INSUFFICIENT_CREDITS' || err.message === 'ACTIVE_DESIGN_PASS_REQUIRED') {
      res.status(403).json({
        success: false,
        error: {
          code: 'DESIGN_PASS_REQUIRED',
          message: 'Unlock the ₹299 30-Day Design Pass (5 Credits) to generate complete 3D architectural designs.',
        },
      })
      return
    }
    next(err)
  }
})

// GET /api/v1/generations/:id - Job status & assets
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const job = await generationService.getJob(req.params.id, userId)

    if (!job) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Generation job not found' },
      })
      return
    }

    res.json({
      success: true,
      data: job,
    })
  } catch (err: any) {
    if (err.message === 'UNAUTHORIZED_JOB_ACCESS') {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not own this generation job' },
      })
      return
    }
    next(err)
  }
})

// GET /api/v1/generations/me/history - User generation history
router.get('/me/history', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const history = await generationService.getUserGenerations(userId)
    res.json({
      success: true,
      data: history,
    })
  } catch (err) {
    next(err)
  }
})

export default router
