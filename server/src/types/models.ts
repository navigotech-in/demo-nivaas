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
  priceInPaise: number // 29900 paise
  currency: string // 'INR'
  creditType: string // 'THREE_D_GENERATION'
  creditsGranted: number // 5 AI credits
  durationDays: number // 30 days
  autoRenewal: boolean // false
  isActive: boolean
  createdAt: string
}

export interface Purchase {
  id: string
  userId: string
  productId: string
  amountInr: number
  amountInPaise: number
  currency: string
  productName?: string
  durationDays: number
  creditsGranted: number
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
  amountInPaise: number
  currency: string
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
  creditsRemaining?: number
  createdAt: string
  updatedAt: string
}

export type CreditTransactionType =
  | 'PURCHASE_GRANT'
  | 'GRANT'
  | 'RESERVE'
  | 'RELEASE'
  | 'CONSUME'
  | 'EXPIRE'
  | 'ADJUSTMENT'
  | 'AI_CONSUMPTION'
  | 'REFUND_REVERSAL'
  | 'ADMIN_ADJUSTMENT'

export interface CreditTransaction {
  id: string
  userId: string
  passId?: string
  amount: number // e.g. +5 for grant, -1 for reserve, +1 for release, 0 for consume
  balanceAfter: number
  type: CreditTransactionType
  description: string
  idempotencyKey?: string
  referenceType?: 'PURCHASE' | 'GENERATION_JOB' | 'MANUAL'
  referenceId?: string
  createdAt: string
}

export type WizardStatus = 'DRAFT' | 'COMPLETED' | 'CONFIRMED' | 'GENERATING' | 'GENERATED' | 'ARCHIVED'

export interface WizardSession {
  id: string
  userId?: string | null
  schemaVersion: number
  currentStage: number
  status: WizardStatus
  wizardData: Record<string, unknown>
  confirmedSnapshot?: Record<string, unknown> | null
  inputHash?: string | null
  completedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type FreePreviewStatus = 'AVAILABLE' | 'RESERVED' | 'CONSUMED' | 'RELEASED'

export interface FreePreviewEntitlement {
  id: string
  userId: string
  status: FreePreviewStatus
  generationJobId?: string | null
  reservedAt?: string | null
  consumedAt?: string | null
  releasedAt?: string | null
  createdAt: string
  updatedAt: string
}

export type AssetAccessLevel = 'FREE_PREVIEW' | 'DESIGN_PASS' | 'ADMIN_ONLY'

export interface GenerationAsset {
  id: string
  generationJobId: string
  assetType: string // 'FREE_2D_PREVIEW', 'LOCKED_3D_TEASER', 'PAID_3D_EXPERIENCE', 'FLOOR_RENDER', 'EXTERIOR_RENDER', 'PDF_EXPORT', 'DOLLHOUSE_PREVIEW'
  storageKey: string
  mimeType: string
  fileSize: number
  accessLevel: AssetAccessLevel
  status: string
  metadata?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export type GenerationJobStatus = 'QUEUED' | 'PROCESSING' | 'PARTIALLY_COMPLETE' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface GenerationJob {
  id: string
  userId: string
  projectId?: string | null
  wizardSessionId?: string | null
  accessPassId?: string | null
  creditReservationId?: string | null
  freePreviewEntitlementId?: string | null
  jobType: string // 'FREE_2D_PREVIEW' | 'COMPLETE_3D_EXPERIENCE'
  generationType: 'FREE_2D_PREVIEW' | 'COMPLETE_3D_EXPERIENCE'
  status: GenerationJobStatus
  attemptCount: number
  maxAttempts: number
  lockedBy?: string | null
  leaseExpiresAt?: string | null
  heartbeatAt?: string | null
  nextRetryAt?: string | null
  failureCode?: string | null
  progressStage?: string | null
  inputPayload: Record<string, unknown>
  resultPayload?: Record<string, unknown> | null
  errorMessage?: string | null
  creditCost: number
  idempotencyKey?: string | null
  inputHash?: string | null
  createdAt: string
  updatedAt: string
  assets?: GenerationAsset[]
}

export interface ConstructionRate {
  id: string
  city: string
  packageType: string // 'STANDARD' | 'PREMIUM' | 'LUXURY'
  ratePerSqFt: number
  effectiveFrom: string
  effectiveTo?: string | null
  sourceNote?: string | null
  updatedBy?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface WebhookEvent {
  id: string
  providerEventId: string
  eventType: string
  processingStatus: 'PENDING' | 'PROCESSED' | 'FAILED' | 'IGNORED'
  payload: Record<string, unknown>
  failureReason?: string | null
  receivedAt: string
  processedAt?: string | null
}

export type ChatMessageStatus = 'PENDING' | 'STREAMING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'

export interface ChatSession {
  id: string
  userId?: string | null
  guestSessionHash?: string | null
  projectId?: string | null
  wizardSessionId?: string | null
  title: string
  status: string
  summary?: string | null
  createdAt: string
  updatedAt: string
  archivedAt?: string | null
}

export interface ChatMessage {
  id: string
  sessionId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  clientMessageId?: string | null
  status: ChatMessageStatus
  toolName?: string | null
  toolResult?: Record<string, unknown> | null
  providerResponseId?: string | null
  failureCode?: string | null
  createdAt: string
  completedAt?: string | null
}

export interface ChatUsage {
  id: string
  sessionId: string
  messageId?: string | null
  userId?: string | null
  provider: string
  model: string
  inputTokens: number
  outputTokens: number
  estimatedCost: number
  latencyMs: number
  requestId?: string | null
  createdAt: string
}

export interface ChatFeedback {
  id: string
  messageId: string
  userId?: string | null
  rating: number
  reason?: string | null
  createdAt: string
}

export interface ChatQuotaUsage {
  id: string
  subjectId: string
  subjectType: 'USER' | 'GUEST'
  usageDate: string // YYYY-MM-DD
  messageCount: number
  tokenCount: number
  createdAt: string
  updatedAt: string
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'CLOSED'

export interface Lead {
  id: string
  userId?: string | null
  type?: string
  name: string
  phone: string
  email?: string | null
  city?: string
  plotSize?: string | null
  budgetRange?: string | null
  timeline?: string | null
  requirement?: string | null
  message?: string | null
  wizardData?: Record<string, unknown> | null
  status: LeadStatus
  notes?: string | null
  consentGiven: boolean
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  actorId?: string | null
  actorRole?: UserRole | 'SYSTEM' | 'ANONYMOUS'
  action: string
  entityType: string
  entityId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
  metadata?: Record<string, unknown> | null
  createdAt: string
}
