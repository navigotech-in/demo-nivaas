import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { authService } from '../services/authService.js'
import { requireAuth } from '../middleware/auth.js'
import { authRateLimiter, refreshRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

// Helper to set secure refresh cookie
function setRefreshTokenCookie(res: Response, rawToken: string) {
  res.cookie(config.cookie.name, rawToken, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: config.cookie.path,
    maxAge: config.cookie.maxAge,
  })
}

// Helper to clear refresh cookie
function clearRefreshTokenCookie(res: Response) {
  res.clearCookie(config.cookie.name, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: config.cookie.path,
  })
}

// 1. Signup Schema & Route
const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  phone: z.string().min(10, 'Phone must be at least 10 digits').max(15).optional(),
})

router.post(
  '/signup',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = signupSchema.parse(req.body)
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1'
      const userAgent = req.headers['user-agent'] || 'Unknown'

      const result = await authService.signup({
        ...validated,
        ipAddress,
        userAgent,
      })

      setRefreshTokenCookie(res, result.rawRefreshToken)

      res.status(201).json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// 2. Login Schema & Route
const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
})

router.post(
  '/login',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = loginSchema.parse(req.body)
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1'
      const userAgent = req.headers['user-agent'] || 'Unknown'

      const result = await authService.login({
        identifier: validated.identifier,
        password: validated.password,
        ipAddress,
        userAgent,
      })

      setRefreshTokenCookie(res, result.rawRefreshToken)

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// 3. Refresh Route (Called on App Start or Token Expiry)
router.post(
  '/refresh',
  refreshRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.[config.cookie.name]
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1'
      const userAgent = req.headers['user-agent'] || 'Unknown'

      const result = await authService.refresh({
        rawRefreshToken,
        ipAddress,
        userAgent,
      })

      // Set new rotated refresh token cookie
      setRefreshTokenCookie(res, result.newRawRefreshToken)

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
        },
      })
    } catch (err) {
      // Clear cookie on refresh failure
      clearRefreshTokenCookie(res)
      next(err)
    }
  }
)

// 4. Logout Route (Revokes Session)
router.post(
  '/logout',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rawRefreshToken = req.cookies?.[config.cookie.name]
      const sessionId = req.user?.sessionId
      const userId = req.user?.sub

      await authService.logout({
        sessionId,
        rawRefreshToken,
        userId,
      })

      clearRefreshTokenCookie(res)

      res.json({
        success: true,
        data: {
          message: 'Successfully logged out and session revoked.',
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// 5. Get Me (Protected User Profile & Active Pass)
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub
      const userSummary = await authService.getMe(userId)

      res.json({
        success: true,
        data: userSummary,
      })
    } catch (err) {
      next(err)
    }
  }
)

// 6. Password Reset Request & Confirmation Schemas
const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

router.post(
  '/forgot-password',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body)
      // Standard safe response: Always return 200 without leaking user existence
      res.json({
        success: true,
        data: {
          message: `If an account exists for ${email}, a password reset link has been dispatched.`,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// 7. One-Time Admin Setup Routes (Only available when 0 admins exist)
router.get('/setup-status', (_req: Request, res: Response): void => {
  const adminCount = Array.from(db.users.values()).filter((u) => u.role === 'ADMIN').length
  res.json({
    success: true,
    data: {
      isSetupAllowed: adminCount === 0,
    },
  })
})

const setupAdminSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15).optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  setupSecret: z.string().min(1, 'Setup secret key is required'),
})

router.post(
  '/setup-admin',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const adminCount = Array.from(db.users.values()).filter((u) => u.role === 'ADMIN').length
      if (adminCount > 0) {
        res.status(403).json({
          success: false,
          error: {
            code: 'SETUP_ALREADY_COMPLETED',
            message: 'Admin setup is permanently closed. An administrator already exists.',
          },
        })
        return
      }

      const validated = setupAdminSchema.parse(req.body)
      const expectedSecret = process.env.SETUP_SECRET || 'ihm_initial_admin_setup_secret_2026'

      if (validated.setupSecret !== expectedSecret) {
        db.logAudit({
          actorRole: 'ANONYMOUS',
          action: 'auth.setup_admin_failed',
          entityType: 'User',
          ipAddress: req.ip,
          metadata: { reason: 'Invalid setup secret' },
        })
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_SETUP_SECRET',
            message: 'Invalid setup secret key provided.',
          },
        })
        return
      }

      const admin = db.bootstrapAdmin(validated.email, validated.password, validated.name)
      if (validated.phone) {
        db.updateUser(admin.id, { phone: validated.phone })
      }

      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1'
      const userAgent = req.headers['user-agent'] || 'Setup Wizard'

      const { rawRefreshToken, session } = await authService.createSession(admin, ipAddress, userAgent)
      const accessToken = authService.generateAccessToken(admin, session.id)
      const userSummary = db.getUserSummary(admin)

      setRefreshTokenCookie(res, rawRefreshToken)

      db.logAudit({
        actorId: admin.id,
        actorRole: 'ADMIN',
        action: 'auth.first_admin_setup_completed',
        entityType: 'User',
        entityId: admin.id,
        ipAddress,
        userAgent,
        metadata: { message: 'Initial Admin account bootstrapped and setup locked' },
      })

      res.status(201).json({
        success: true,
        data: {
          user: userSummary,
          accessToken,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

export default router
