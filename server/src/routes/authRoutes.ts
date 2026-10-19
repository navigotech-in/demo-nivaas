import crypto from 'node:crypto'
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { config } from '../config.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { prismaDb } from '../db/prismaService.js'
import { authService } from '../services/authService.js'
import { otpService } from '../services/otpService.js'
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
  phone: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
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
  portal: z.enum(['admin', 'client']).optional(),
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
        portal: validated.portal,
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
      if ((err as Error)?.message === 'ADMIN_PORTAL_ONLY') {
        res.status(403).json({
          success: false,
          error: {
            code: 'ADMIN_PORTAL_ONLY',
            message: 'Access Denied: Only authorized administrators can sign in here.',
          },
        })
        return
      }
      if ((err as Error)?.message === 'CLIENT_PORTAL_ONLY') {
        res.status(403).json({
          success: false,
          error: {
            code: 'CLIENT_PORTAL_ONLY',
            message: 'Access restricted: This account cannot sign in from here.',
          },
        })
        return
      }
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
      if (!rawRefreshToken) {
        res.status(200).json({
          success: false,
          data: null,
          error: {
            code: 'NO_SESSION',
            message: 'No active session found.',
          },
        })
        return
      }

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
    } catch (err: any) {
      // Only clear the cookie on terminal failures. TOKEN_ALREADY_ROTATED is a
      // concurrent-rotation race: the winning request just set a valid new
      // cookie, and clearing it here would log the session out permanently.
      if (err?.message !== 'TOKEN_ALREADY_ROTATED') {
        clearRefreshTokenCookie(res)
      }

      // If the session has expired, is invalid, or was not found, return HTTP 200 with success: false
      // so browser devtools doesn't log a red 401 network error on app load or guest visits.
      if (
        err?.message === 'NO_REFRESH_TOKEN' ||
        err?.message === 'INVALID_REFRESH_TOKEN' ||
        err?.message === 'REFRESH_TOKEN_EXPIRED' ||
        err?.message === 'TOKEN_REUSE_DETECTED' ||
        err?.message === 'USER_NOT_FOUND'
      ) {
        res.status(200).json({
          success: false,
          data: null,
          error: {
            code: err.message,
            message: 'Session has expired or is invalid. Please sign in again.',
          },
        })
        return
      }

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
const forgotPasswordSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
  })
  .refine((data) => Boolean(data.identifier || data.email), {
    message: 'Please provide either an email or phone number',
  })

const resetPasswordSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number is required'),
  code: z.string().min(4, 'Code must be at least 4 digits').max(10),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

router.post(
  '/forgot-password',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = forgotPasswordSchema.parse(req.body)
      const target = (parsed.identifier || parsed.email)!.trim()
      const result = await authService.requestPasswordReset(target)
      res.json({
        success: true,
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
)

router.post(
  '/reset-password',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { identifier, code, newPassword } = resetPasswordSchema.parse(req.body)
      const result = await authService.resetPassword({ identifier, code, newPassword })
      res.json({
        success: true,
        data: result,
      })
    } catch (err) {
      next(err)
    }
  }
)

// 7. One-Time Admin Setup Routes (Only available when 0 admins exist)
router.get('/setup-status', async (_req: Request, res: Response): Promise<void> => {
  let adminCount = Array.from(db.users.values()).filter((u) => u.role === 'ADMIN').length
  try {
    const prismaAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
    adminCount = Math.max(adminCount, prismaAdmins)
  } catch {
    // ignore
  }

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
  phone: z.string().min(10, 'Mobile number must be at least 10 digits').max(15, 'Mobile number must not exceed 15 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  setupSecret: z.string().min(1, 'Setup secret key is required'),
})

router.post(
  '/setup-admin',
  authRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let adminCount = Array.from(db.users.values()).filter((u) => u.role === 'ADMIN').length
      try {
        const prismaAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
        adminCount = Math.max(adminCount, prismaAdmins)
      } catch {
        // ignore
      }

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

      // Timing-safe secret comparison
      const userSecretBuf = Buffer.from(validated.setupSecret)
      const expectedSecretBuf = Buffer.from(expectedSecret)
      const isSecretMatch =
        userSecretBuf.length === expectedSecretBuf.length &&
        crypto.timingSafeEqual(userSecretBuf, expectedSecretBuf)

      if (!isSecretMatch) {
        db.logAudit({
          actorRole: 'ANONYMOUS',
          action: 'auth.setup_admin_failed',
          entityType: 'User',
          ipAddress: req.ip,
          metadata: { reason: 'Invalid setup secret attempt' },
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

      let admin: any = null

      // Persist in real PostgreSQL first
      try {
        const pAdmin = await prismaDb.bootstrapAdminAtomically(
          validated.email,
          validated.password,
          validated.name,
          validated.phone
        )
        admin = {
          id: pAdmin.id,
          email: pAdmin.email,
          name: pAdmin.name,
          phone: pAdmin.phone || undefined,
          passwordHash: pAdmin.passwordHash,
          role: 'ADMIN',
          isEmailVerified: pAdmin.isEmailVerified,
          isPhoneVerified: pAdmin.isPhoneVerified,
          createdAt: pAdmin.createdAt.toISOString(),
          updatedAt: pAdmin.updatedAt.toISOString(),
        }
        db.createUser(admin)
        db.isSetupLocked = true
      } catch (dbErr: any) {
        if (dbErr.message === 'SETUP_ALREADY_COMPLETED') {
          throw dbErr
        }
        if (config.dataStore === 'postgres') {
          // Admin must be persisted in the real DB — never silently create a
          // memory-only admin that disappears on restart.
          throw dbErr
        }
        // Fallback for store-only testing
        admin = db.bootstrapAdminAtomically(validated.email, validated.password, validated.name)
        if (validated.phone) {
          db.updateUser(admin.id, { phone: validated.phone })
        }
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
    } catch (err: any) {
      if (err?.message === 'SETUP_ALREADY_COMPLETED') {
        res.status(403).json({
          success: false,
          error: {
            code: 'SETUP_ALREADY_COMPLETED',
            message: 'Admin setup is permanently closed. An administrator already exists.',
          },
        })
        return
      }
      next(err)
    }
  }
)

// 8. OTP Authentication Routes (Mobile SMS via Twilio + Email via Nodemailer)
const sendOtpSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  purpose: z.enum(['LOGIN', 'SIGNUP']).optional(),
})

router.post(
  '/otp/send',
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, purpose } = sendOtpSchema.parse(req.body)
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1'

      const result = await otpService.sendOtp({
        identifier,
        purpose,
        ipAddress,
      })

      res.json({
        success: true,
        data: result,
      })
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'OTP_SEND_FAILED',
          message: err.message || 'Failed to dispatch verification code.',
        },
      })
    }
  }
)

const verifyOtpSchema = z.object({
  identifier: z.string().min(3, 'Email or Phone is required'),
  code: z.string().min(6, 'Verification code must be 6 digits').max(6),
  name: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
})

router.post(
  '/otp/verify',
  authRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { identifier, code, name, email, password } = verifyOtpSchema.parse(req.body)
      const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1'
      const userAgent = (req.headers['user-agent'] as string) || 'Unknown'

      const result = await otpService.verifyOtp({
        identifier,
        code,
        name,
        email,
        password,
        ipAddress,
        userAgent,
      })

      setRefreshTokenCookie(res, result.rawRefreshToken)

      res.json({
        success: true,
        data: {
          user: result.user,
          accessToken: result.accessToken,
          isNewUser: result.isNewUser,
        },
      })
    } catch (err: any) {
      res.status(400).json({
        success: false,
        error: {
          code: 'OTP_VERIFY_FAILED',
          message: err.message || 'Invalid or expired verification code.',
        },
      })
    }
  }
)

export default router
