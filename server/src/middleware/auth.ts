import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/authService.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { AccessTokenPayload } from '../types/auth.js'
import { ErrorCode, UserRole } from '../types/contracts.js'

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}

// The in-memory session store is wiped on every server restart (tsx watch),
// which would otherwise invalidate every in-flight access token. Rehydrate the
// session from the persistent refresh-session table so 15-min access tokens
// survive restarts and only refreshed/revoked sessions are rejected.
async function rehydrateSessionFromDb(sessionId: string): Promise<boolean> {
  const existing = db.findSessionById(sessionId)
  if (existing && !existing.isRevoked) return true

  try {
    const p = await prisma.refreshSession.findUnique({ where: { id: sessionId } })
    if (!p || p.isRevoked || new Date(p.expiresAt) < new Date()) return false

    db.createSession({
      id: p.id,
      userId: p.userId,
      familyId: p.familyId,
      tokenHash: p.tokenHash,
      userAgent: p.userAgent,
      ipAddress: p.ipAddress,
      isRevoked: false,
      rotatedAt: p.rotatedAt ? p.rotatedAt.toISOString() : undefined,
      expiresAt: p.expiresAt.toISOString(),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })
    return true
  } catch {
    return false
  }
}

function sendSessionRejected(res: Response): void {
  res.status(401).json({
    success: false,
    error: {
      code: ErrorCode.SESSION_REVOKED,
      message: 'Session has been revoked or expired. Please re-authenticate.',
    },
  })
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: 'Authentication token required.',
      },
    })
    return
  }

  const token = authHeader.split(' ')[1]
  let decoded: AccessTokenPayload
  try {
    decoded = authService.verifyAccessToken(token)
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.TOKEN_EXPIRED,
          message: 'Access token has expired. Please refresh your session.',
        },
      })
      return
    }

    res.status(401).json({
      success: false,
      error: {
        code: ErrorCode.TOKEN_INVALID,
        message: 'Invalid access token.',
      },
    })
    return
  }

  const session = db.findSessionById(decoded.sessionId)
  let sessionValid = Boolean(session && !session.isRevoked)
  if (!sessionValid) {
    sessionValid = await rehydrateSessionFromDb(decoded.sessionId)
  }

  if (!sessionValid) {
    sendSessionRejected(res)
    return
  }

  // Verify that the user account still exists in store or database
  let userExists = Boolean(db.findUserById(decoded.sub))
  if (!userExists) {
    try {
      const pUser = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: { id: true },
      })
      userExists = Boolean(pUser)
    } catch {
      userExists = false
    }
  }

  if (!userExists) {
    db.revokeSession(decoded.sessionId)
    try {
      await prisma.refreshSession.update({
        where: { id: decoded.sessionId },
        data: { isRevoked: true },
      })
    } catch {}
    res.status(401).json({
      success: false,
      error: {
        code: ErrorCode.SESSION_REVOKED,
        message: 'Account not found or has been deleted. Session terminated.',
      },
    })
    return
  }

  req.user = decoded
  next()
}

export function requireRole(requiredRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.UNAUTHORIZED,
          message: 'Authentication required.',
        },
      })
      return
    }

    if (req.user.role !== requiredRole) {
      res.status(403).json({
        success: false,
        error: {
          code: ErrorCode.FORBIDDEN,
          message: `Access denied. Requires ${requiredRole} role.`,
        },
      })
      return
    }

    next()
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1]
      const decoded = authService.verifyAccessToken(token)
      const session = db.findSessionById(decoded.sessionId)
      if (session && !session.isRevoked) {
        req.user = decoded
      }
    } catch {
      // Ignore errors for optional auth
    }
  }
  next()
}
