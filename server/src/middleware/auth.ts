import { Request, Response, NextFunction } from 'express'
import { authService } from '../services/authService.js'
import { db } from '../db/store.js'
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

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
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
  try {
    const decoded = authService.verifyAccessToken(token)
    
    // Server-side active session check
    const session = db.findSessionById(decoded.sessionId)
    if (!session || session.isRevoked) {
      res.status(401).json({
        success: false,
        error: {
          code: ErrorCode.SESSION_REVOKED,
          message: 'Session has been revoked or expired. Please re-authenticate.',
        },
      })
      return
    }

    req.user = decoded
    next()
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
  }
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
