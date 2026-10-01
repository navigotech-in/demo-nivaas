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
    const user = await prismaDb.findUserById(userId)
    const activePass = user?.passes && user.passes.length > 0 ? user.passes[0] : null

    let daysRemaining = 0
    if (activePass) {
      const diffMs = new Date(activePass.expiresAt).getTime() - Date.now()
      daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
    }

    res.json({
      success: true,
      data: {
        activePass: activePass
          ? {
              id: activePass.id,
              passType: activePass.passType,
              status: activePass.status,
              startsAt: activePass.startsAt.toISOString(),
              expiresAt: activePass.expiresAt.toISOString(),
              creditsGranted: activePass.creditsGranted,
              daysRemaining,
            }
          : null,
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

// 9. Profile Update (Name, Phone)
const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
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
