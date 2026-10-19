import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { prismaDb } from '../db/prismaService.js'

const router = Router()

// All endpoints in this router require authentication
router.use(requireAuth)

// 1. Dashboard Overview (Real DB values, metrics, recent projects & transactions)
router.get('/me/dashboard', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const dashboardData = await prismaDb.getUserDashboardData(userId)

    res.json({
      success: true,
      data: dashboardData,
    })
  } catch (err) {
    next(err)
  }
})

// 2. My Projects / Generated Designs
router.get('/me/projects', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const projects = await prismaDb.getUserProjects(userId)

    res.json({
      success: true,
      data: {
        projects,
        total: projects.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

const createProjectSchema = z.object({
  jobType: z.string().optional(),
  inputPayload: z.record(z.any()),
})

router.post('/me/projects', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const validated = createProjectSchema.parse(req.body)
    const project = await prismaDb.createUserProject(userId, validated)

    res.status(201).json({
      success: true,
      data: project,
    })
  } catch (err) {
    next(err)
  }
})

// 3. Available Credits & Transaction History
router.get('/me/credits', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const balance = await prismaDb.calculateCreditBalance(userId)
    const history = await prismaDb.getCreditHistory(userId)

    res.json({
      success: true,
      data: {
        balance,
        history,
        totalTransactions: history.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// 4. ₹299 Design Pass Status
router.get('/me/pass', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const activePass = await prismaDb.getActivePass(userId)
    const creditsRemaining = await prismaDb.calculateCreditBalance(userId)

    let daysRemaining = 0
    if (activePass) {
      const diffMs = new Date(activePass.expiresAt).getTime() - Date.now()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    // Pass is only "active" while it has both validity left AND unused credits
    const hasActivePass = !!activePass && daysRemaining > 0 && creditsRemaining > 0

    const passPayload = activePass
      ? {
          id: activePass.id,
          passType: activePass.passType,
          status: activePass.status,
          startsAt: activePass.startsAt ? new Date(activePass.startsAt).toISOString() : new Date().toISOString(),
          expiresAt: activePass.expiresAt ? new Date(activePass.expiresAt).toISOString() : new Date().toISOString(),
          creditsGranted: activePass.creditsGranted,
          creditsRemaining,
          daysRemaining,
        }
      : null

    res.json({
      success: true,
      data: {
        hasActivePass,
        activePass: passPayload,
        pass: passPayload,
        creditsRemaining,
        creditsExhausted: !!activePass && creditsRemaining <= 0,
        daysRemaining,
      },
    })
  } catch (err) {
    next(err)
  }
})

// 4b. Single Source of Truth Entitlements (Free 2D 5-count + Daily 2D 5/day for Paid + Paid Pass & 3D Credits)
router.get('/me/entitlements', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const isAdmin = req.user?.role === 'ADMIN'

    // 1. Daily 2D Quota for All Signed-In Users (5 Conceptual Plans / Day Resetting at Midnight UTC)
    const dailyJobsCount = await prismaDb.getDaily2DGenerationsCount(userId)
    const dailyLimit = 5
    const dailyUsed = Math.min(5, dailyJobsCount)
    const dailyRemaining = Math.max(0, dailyLimit - dailyUsed)
    const resetDate = new Date()
    resetDate.setUTCHours(24, 0, 0, 0)
    const resetAt = resetDate.toISOString()

    // 2. Paid Design Pass & 3D Credit Ledger
    const activePass = await prismaDb.getActivePass(userId)
    const paidCreditsRemaining = await prismaDb.calculateCreditBalance(userId)
    const passCreditsTotal = activePass?.creditsGranted || 5
    const passCreditsUsed = Math.max(0, passCreditsTotal - paidCreditsRemaining)

    let daysRemaining = 0
    if (activePass) {
      const diffMs = new Date(activePass.expiresAt).getTime() - Date.now()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    // A pass is only "active" while it is unexpired AND has unused credits left
    const creditsExhausted = !!activePass && paidCreditsRemaining <= 0
    const hasActivePass = !!activePass && daysRemaining > 0 && paidCreditsRemaining > 0
    const hasPaid3DCredits = paidCreditsRemaining > 0
    const canGenerate2D = dailyRemaining > 0 || isAdmin
    const canGenerate3D = (hasActivePass && hasPaid3DCredits) || isAdmin
    const canUseFree2D = canGenerate2D
    const freeCreditsTotal = dailyLimit
    const freeCreditsUsed = dailyUsed
    const freeCreditsRemaining = dailyRemaining
    const freeClaimed = dailyUsed >= dailyLimit

    res.json({
      success: true,
      data: {
        free2D: {
          total: freeCreditsTotal,
          used: freeCreditsUsed,
          remaining: freeCreditsRemaining,
        },
        daily2D: {
          limit: dailyLimit,
          used: dailyUsed,
          remaining: dailyRemaining,
          resetAt,
        },
        designPass: {
          active: hasActivePass,
          expiresAt: activePass?.expiresAt ? new Date(activePass.expiresAt).toISOString() : null,
          daysRemaining,
          creditsTotal: passCreditsTotal,
          creditsUsed: passCreditsUsed,
          creditsRemaining: paidCreditsRemaining,
          creditsExhausted,
        },
        // Backward compatibility
        freeEntitlement: {
          claimed: freeClaimed,
          status: freeClaimed ? 'CONSUMED' : 'AVAILABLE',
          creditsTotal: freeCreditsTotal,
          creditsUsed: freeCreditsUsed,
          creditsRemaining: freeCreditsRemaining,
        },
        canGenerate2D,
        canGenerate3D,
        canGenerate: canGenerate2D || canGenerate3D,
        generationMode: hasActivePass
          ? 'DESIGN_PASS'
          : canUseFree2D
          ? 'FREE_2D'
          : 'UPGRADE_REQUIRED',
      },
    })
  } catch (err) {
    next(err)
  }
})

// 5. User Booked Consultations
router.get('/me/consultations', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const consultations = await prismaDb.getUserConsultations(userId)

    res.json({
      success: true,
      data: {
        consultations,
        total: consultations.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// 6. Active Device Sessions (With current session badge)
router.get('/me/sessions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const currentSessionId = req.user!.sessionId
    const rawSessions = await prismaDb.getUserSessions(userId)

    const sessions = rawSessions.map((s) => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      isCurrent: s.id === currentSessionId,
    }))

    res.json({
      success: true,
      data: {
        sessions,
        total: sessions.length,
      },
    })
  } catch (err) {
    next(err)
  }
})

// 7. Revoke Specific Session (Strict Ownership Verification)
router.delete('/me/sessions/:sessionId', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const { sessionId } = req.params

    await prismaDb.revokeUserSession(userId, sessionId)

    res.json({
      success: true,
      data: {
        message: 'Device session revoked successfully.',
        revokedSessionId: sessionId,
      },
    })
  } catch (err) {
    next(err)
  }
})

// 8. Revoke All Other Sessions (Except current)
router.delete('/me/sessions', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const currentSessionId = req.user!.sessionId

    await prismaDb.revokeAllOtherSessions(userId, currentSessionId)

    res.json({
      success: true,
      data: {
        message: 'All other device sessions have been revoked.',
      },
    })
  } catch (err) {
    next(err)
  }
})

// 9. Profile Update (Name, Phone, Email)
const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10).max(15).optional().or(z.literal('')),
})

router.patch('/me/profile', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const validated = profileUpdateSchema.parse(req.body)

    const updatedUser = await prismaDb.updateUserProfile(userId, validated)

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone || undefined,
          role: updatedUser.role,
          createdAt: updatedUser.createdAt.toISOString(),
        },
      },
    })
  } catch (err) {
    next(err)
  }
})

// 10. Change Password
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters').max(100),
})

router.post('/me/change-password', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.sub
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body)

    await prismaDb.changeUserPassword(userId, currentPassword, newPassword)

    res.json({
      success: true,
      data: {
        message: 'Password changed successfully.',
      },
    })
  } catch (err: any) {
    if (err?.message === 'INVALID_CURRENT_PASSWORD') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CURRENT_PASSWORD',
          message: 'The current password you provided is incorrect.',
        },
      })
      return
    }
    next(err)
  }
})

export default router
