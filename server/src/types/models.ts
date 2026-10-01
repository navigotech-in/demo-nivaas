import { UserRole } from './contracts.js'

export interface User {
  id: string
  email: string
  passwordHash: string
  name: string
  phone?: string
  role: UserRole
  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface RefreshSession {
  id: string
  userId: string
  familyId: string // Used for refresh token rotation family tracking & breach detection
  tokenHash: string
  userAgent: string
  ipAddress: string
  isRevoked: boolean
  rotatedAt?: string // Timestamp when rotated (for 15s grace handling)
  expiresAt: string
  createdAt: string
  updatedAt: string
}

// Product, Purchase & Payment (Cleanly separated from recurring subscriptions)
export interface Product {
  id: string
  name: string
  code: string // e.g. 'DESIGN_PASS_299'
  description: string
  priceInr: number // ₹299
  creditsGranted: number // 5 AI credits
  durationDays: number // 30 days
  isActive: boolean
  createdAt: string
}

export interface Purchase {
  id: string
  userId: string
  productId: string
  amountInr: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentId?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  purchaseId: string
  userId: string
  orderId: string
  gatewayPaymentId?: string
  signature?: string
  amountInr: number
  status: 'CREATED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
  gateway: 'RAZORPAY'
  rawResponse?: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AccessPass {
  id: string
  userId: string
  purchaseId?: string
  passType: 'DESIGN_PASS_299' | 'PROMOTIONAL_PASS'
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED'
  startsAt: string
  expiresAt: string
  creditsGranted: number
  creditsRemaining: number
  createdAt: string
  updatedAt: string
}

export type CreditTransactionType =
  | 'PURCHASE_GRANT'
  | 'AI_CONSUMPTION'
  | 'REFUND_REVERSAL'
  | 'ADMIN_ADJUSTMENT'

export interface CreditTransaction {
  id: string
  userId: string
  passId?: string
  amount: number // e.g. +5 for grant, -1 for consumption
  balanceAfter: number
  type: CreditTransactionType
  description: string
  referenceType?: 'PURCHASE' | 'GENERATION_JOB' | 'MANUAL'
  referenceId?: string
  createdAt: string
}

export type GenerationJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface GenerationJob {
  id: string
  userId: string
  projectId?: string
  jobType: '2D_FLOOR_PLAN' | '3D_ELEVATION' | 'INTERIOR_RENDER'
  status: GenerationJobStatus
  inputPayload: Record<string, unknown>
  resultPayload?: Record<string, unknown>
  errorMessage?: string
  creditCost: number
  idempotencyKey?: string
  createdAt: string
  updatedAt: string
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'CLOSED'

export interface Lead {
  id: string
  userId?: string
  type: 'DESIGN_CUSTOMIZATION' | 'SERVICE_ENQUIRY' | 'CONSULTATION' | 'WIZARD_SUBMISSION'
  name: string
  phone: string
  email?: string
  city?: string
  plotSize?: string
  budgetRange?: string
  timeline?: string
  requirement?: string
  message?: string
  wizardData?: Record<string, unknown>
  status: LeadStatus
  notes?: string
  consentGiven: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  actorId?: string
  actorRole?: UserRole | 'SYSTEM' | 'ANONYMOUS'
  action: string
  entityType: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, unknown>
  createdAt: string
}
