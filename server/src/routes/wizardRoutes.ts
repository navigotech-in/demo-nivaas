import { Router } from 'express'
import { wizardService } from '../services/wizardService.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/v1/wizard/entitlements/free-preview - Check lifetime free preview status
router.get('/entitlements/free-preview', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const isAdmin = req.user?.role === 'ADMIN'
    const eligibility = await wizardService.checkFreePreviewEligibility(userId)
    if (isAdmin) {
      eligibility.status = 'AVAILABLE'
      eligibility.eligible = true
    }
    res.json({
      success: true,
      data: eligibility,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/wizard/generate-free-2d - Generate 1-time free 2D preview (atomic entitlement consumption)
router.post('/generate-free-2d', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.sub
    const isAdmin = req.user?.role === 'ADMIN'
    const { wizardSessionId, wizardData, idempotencyKey } = req.body

    let sessionId = wizardSessionId
    if (!sessionId) {
      const draft = await wizardService.saveDraft({
        userId,
        stage: 20,
        wizardData: wizardData || {},
      })
      sessionId = draft.id
    }

    try {
      const result = await wizardService.generateFree2DPreview({
        userId,
        wizardSessionId: sessionId,
        idempotencyKey,
      })

      res.json({
        success: true,
        message: 'Free 2D conceptual layout generated and saved to your account.',
        data: result,
      })
    } catch (err: any) {
      if (isAdmin && err.message === 'FREE_PREVIEW_ALREADY_CONSUMED') {
        // Return simulated admin test preview result
        res.json({
          success: true,
          message: 'Admin Test Mode: 2D conceptual layout generated without consuming credits.',
          data: {
            jobId: 'admin_test_job_' + Date.now(),
            status: 'COMPLETED',
            floorPlanUrl: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=1200',
            elevationUrl: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=1200',
            isAdminTest: true,
          },
        })
        return
      }
      throw err
    }
  } catch (err: any) {
    if (err.message === 'FREE_PREVIEW_ALREADY_CONSUMED' || err.message === 'DAILY_LIMIT_REACHED') {
      res.status(403).json({
        success: false,
        error: {
          code: 'DAILY_LIMIT_REACHED',
          message: 'You have reached your daily limit of 5 free 2D conceptual layouts for today. Quota resets at midnight.',
        },
      })
      return
    }
    next(err)
  }
})

// POST /api/v1/wizard/sessions - Create or update draft
router.post('/sessions', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub || null
    const { sessionId, stage, wizardData } = req.body

    const session = await wizardService.saveDraft({
      sessionId,
      userId,
      stage: stage || 1,
      wizardData: wizardData || {},
    })

    res.json({
      success: true,
      data: session,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/wizard/sessions/:id - Restore draft
router.get('/sessions/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub
    const session = await wizardService.getSession(req.params.id, userId)

    if (!session) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wizard session not found' },
      })
      return
    }

    res.json({
      success: true,
      data: session,
    })
  } catch (err) {
    next(err)
  }
})

// PATCH /api/v1/wizard/sessions/:id - Autosave answers
router.patch('/sessions/:id', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub
    const { stage, wizardData } = req.body

    const session = await wizardService.saveDraft({
      sessionId: req.params.id,
      userId,
      stage,
      wizardData: wizardData || {},
    })

    res.json({
      success: true,
      data: session,
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/wizard/sessions/:id/confirm - Lock confirmed snapshot
router.post('/sessions/:id/confirm', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub
    const result = await wizardService.confirmRequirements(req.params.id, userId)

    res.json({
      success: true,
      data: result,
    })
  } catch (err: any) {
    if (err.message === 'WIZARD_SESSION_NOT_FOUND') {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wizard session not found' },
      })
      return
    }
    next(err)
  }
})

export default router

