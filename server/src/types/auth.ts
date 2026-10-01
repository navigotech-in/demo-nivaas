import { UserRole } from './contracts.js'
import { AccessPass } from './models.js'

export interface AccessTokenPayload {
  sub: string // userId
  role: UserRole
  email: string
  sessionId: string
  name: string
  iat?: number
  exp?: number
}

export interface UserSummary {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  isEmailVerified: boolean
  isPhoneVerified: boolean
  activePass: AccessPass | null
  totalCredits: number
  createdAt: string
}

export interface AuthSuccessData {
  user: UserSummary
  accessToken: string
}
