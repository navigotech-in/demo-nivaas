import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { ErrorCode } from '../types/contracts.js'

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Unhandled Error]', err)

  // Zod Validation Error
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Invalid request data.',
        details: err.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      },
    })
    return
  }

  // Known Business Errors
  const statusMap: Record<string, { status: number; code: ErrorCode; message: string }> = {
    EMAIL_EXISTS: {
      status: 409,
      code: ErrorCode.CONFLICT,
      message: 'An account with this email already exists.',
    },
    INVALID_CREDENTIALS: {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: 'Incorrect email/phone or password.',
    },
    NO_REFRESH_TOKEN: {
      status: 401,
      code: ErrorCode.UNAUTHORIZED,
      message: 'No refresh token provided in cookies.',
    },
    INVALID_REFRESH_TOKEN: {
      status: 401,
      code: ErrorCode.TOKEN_INVALID,
      message: 'Invalid or unrecognized refresh token.',
    },
    TOKEN_ALREADY_ROTATED: {
      status: 401,
      code: ErrorCode.TOKEN_ALREADY_ROTATED,
      message: 'Token was recently rotated by another concurrent request. Please retry.',
    },
    TOKEN_REUSE_DETECTED: {
      status: 401,
      code: ErrorCode.SESSION_REVOKED,
      message: 'Session token reuse detected. All active sessions have been invalidated for security.',
    },
    REFRESH_TOKEN_EXPIRED: {
      status: 401,
      code: ErrorCode.TOKEN_EXPIRED,
      message: 'Session has expired. Please sign in again.',
    },
    USER_NOT_FOUND: {
      status: 404,
      code: ErrorCode.NOT_FOUND,
      message: 'User account not found.',
    },
  }

  if (err.message && statusMap[err.message]) {
    const info = statusMap[err.message]
    res.status(info.status).json({
      success: false,
      error: {
        code: info.code,
        message: info.message,
      },
    })
    return
  }

  // Fallback 500
  res.status(500).json({
    success: false,
    error: {
      code: ErrorCode.INTERNAL_SERVER_ERROR,
      message: 'An unexpected internal server error occurred.',
    },
  })
}
