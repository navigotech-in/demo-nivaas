import { Request, Response, NextFunction } from 'express'
import { ErrorCode } from '../types/contracts.js'

interface RateLimitRecord {
  timestamps: number[]
}

export function createRateLimiter(options: {
  windowMs: number
  maxRequests: number
  message?: string
}) {
  const store = new Map<string, RateLimitRecord>()

  // Cleanup old entries every 5 minutes
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs)
      if (record.timestamps.length === 0) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000).unref()

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip'
    const now = Date.now()
    const record = store.get(ip) || { timestamps: [] }

    // Filter timestamps within current window
    record.timestamps = record.timestamps.filter((ts) => now - ts < options.windowMs)

    if (record.timestamps.length >= options.maxRequests) {
      res.status(429).json({
        success: false,
        error: {
          code: ErrorCode.RATE_LIMITED,
          message:
            options.message ||
            'Too many requests from this IP. Please wait a moment before trying again.',
        },
      })
      return
    }

    record.timestamps.push(now)
    store.set(ip, record)
    next()
  }
}

// Pre-configured rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 20, // 20 requests per 5 mins
  message: 'Too many authentication attempts. Please try again after 5 minutes.',
})

export const refreshRateLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  message: 'Too many session refresh attempts. Please slow down.',
})
