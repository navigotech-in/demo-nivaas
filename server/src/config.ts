import path from 'node:path'
import { fileURLToPath } from 'node:url'

const isProduction = process.env.NODE_ENV === 'production'

export const config = {
  port: Number(process.env.PORT ?? 7000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,
  
  // Security & JWT
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_SECRET || 'nivaas_dev_access_secret_change_in_production_2026',
    accessTokenExpiresIn: '15m', // Short-lived 15 minutes
    refreshTokenSecret: process.env.JWT_REFRESH_SECRET || 'nivaas_dev_refresh_secret_change_in_production_2026',
    refreshTokenExpiresDays: 30, // 30 days
    refreshGraceSeconds: 15, // 15s grace window for concurrent rotation
  },

  // Cookie Settings for Refresh Token
  cookie: {
    name: 'ihm_refresh_token',
    httpOnly: true,
    secure: isProduction,
    sameSite: (process.env.COOKIE_SAMESITE as 'lax' | 'strict' | 'none') || 'lax',
    path: '/api/v1/auth',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  },

  // Client Assets Path
  clientDist: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist'),
}
