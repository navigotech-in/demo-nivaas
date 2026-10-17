import type { Project } from './data'

// In dev, Vite proxies /api -> http://localhost:7000. In production the
// Express server on port 7000 serves this build on the same origin.
const BASE = '/api/v1'

// Session recovery hook: AuthProvider registers a callback so any user-scoped
// request returning 401 can trigger one silent token refresh. The refreshed
// accessToken propagates through context, so callers re-fetch automatically.
let onUnauthorized: (() => void) | null = null

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler
}

function apiError(res: Response, json: any, fallback: string): Error {
  if (res.status === 401) onUnauthorized?.()
  const error: any = new Error(json?.error?.message || fallback)
  error.status = res.status
  error.code = json?.error?.code
  return error
}

export interface LeadPayload {
  name: string
  phone: string
  email?: string
  city: string
  requirement: string
  message: string
}

export interface UserDashboardMetrics {
  totalProjects: number
  availableCredits: number
  activePass: {
    id: string
    passType: string
    status: string
    startsAt: string
    expiresAt: string
    creditsGranted: number
  } | null
  totalConsultations: number
}

export interface UserProject {
  id: string
  jobType: string
  status: string
  inputPayload: Record<string, any>
  resultPayload: Record<string, any>
  outputPayload?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreditTransactionItem {
  id: string
  passId?: string
  amount: number
  type: 'GRANT' | 'RESERVE' | 'RELEASE' | 'CONSUME'
  description: string
  referenceType?: string
  referenceId?: string
  createdAt: string
}

export interface UserSessionItem {
  id: string
  userAgent: string
  ipAddress: string
  createdAt: string
  expiresAt: string
  isCurrent: boolean
}

export interface UserConsultationItem {
  id: string
  type: string
  name: string
  phone: string
  city: string
  requirement: string
  message?: string
  status: string
  createdAt: string
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch(`${BASE}/designs?type=HOUSE_PLAN&limit=6`)
  if (!res.ok) throw new Error(`Failed to load projects (${res.status})`)
  const body = await res.json()
  return body.data
}

export async function submitLead(payload: LeadPayload): Promise<void> {
  const res = await fetch(`${BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'SERVICE_ENQUIRY',
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      city: payload.city,
      requirement: payload.requirement,
      message: payload.message,
    }),
  })
  if (!res.ok) throw new Error(`Submit failed (${res.status})`)
}

// === Phase 2: Authenticated User Panel API Methods ===

export async function fetchUserDashboard(headers: Record<string, string>): Promise<{
  user: any
  metrics: UserDashboardMetrics
  recentProjects: UserProject[]
  recentTransactions: CreditTransactionItem[]
}> {
  const res = await fetch(`${BASE}/users/me/dashboard`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to fetch dashboard data')
  }
  return json.data
}

export async function fetchUserProjects(headers: Record<string, string>): Promise<UserProject[]> {
  if (!hasValidAuthHeader(headers)) {
    return []
  }
  try {
    const res = await fetch(`${BASE}/users/me/projects`, {
      headers: { 'Content-Type': 'application/json', ...headers },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      if (res.status === 401) {
        onUnauthorized?.()
        return []
      }
      throw apiError(res, json, 'Failed to fetch projects')
    }
    return json.data.projects
  } catch (err: any) {
    if (err?.status === 401) {
      onUnauthorized?.()
      return []
    }
    throw err
  }
}

export async function createUserProject(
  data: { jobType?: string; inputPayload: Record<string, any> },
  headers: Record<string, string>
): Promise<UserProject> {
  const res = await fetch(`${BASE}/users/me/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to create project')
  }
  return json.data?.project || json.data
}

export async function fetchUserCredits(headers: Record<string, string>): Promise<{
  availableBalance: number
  transactions: CreditTransactionItem[]
} | null> {
  if (!hasValidAuthHeader(headers)) {
    return null
  }
  try {
    const res = await fetch(`${BASE}/users/me/credits`, {
      headers: { 'Content-Type': 'application/json', ...headers },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      if (res.status === 401) {
        onUnauthorized?.()
        return null
      }
      throw apiError(res, json, 'Failed to fetch credit ledger')
    }
    return json.data
  } catch (err: any) {
    if (err?.status === 401) {
      onUnauthorized?.()
      return null
    }
    throw err
  }
}

export async function fetchUserPass(headers: Record<string, string>): Promise<{
  hasActivePass: boolean
  pass: any
  activePass?: any
  daysRemaining?: number
}> {
  const res = await fetch(`${BASE}/users/me/pass`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to fetch pass status')
  }
  const d = json.data || {}
  const passObj = d.pass || d.activePass || null
  const hasActive = Boolean(d.hasActivePass ?? (passObj && (passObj.status === 'ACTIVE' || passObj.status === 'ACTIVE')))
  return {
    hasActivePass: hasActive,
    pass: passObj,
    activePass: passObj,
    daysRemaining: d.daysRemaining ?? passObj?.daysRemaining ?? 0,
  }
}

export async function fetchUserConsultations(headers: Record<string, string>): Promise<UserConsultationItem[]> {
  const res = await fetch(`${BASE}/users/me/consultations`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to fetch consultations')
  }
  return json.data.consultations
}

export async function fetchUserSessions(headers: Record<string, string>): Promise<UserSessionItem[]> {
  const res = await fetch(`${BASE}/users/me/sessions`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to fetch active sessions')
  }
  return json.data.sessions
}

export async function revokeUserSession(sessionId: string, headers: Record<string, string>): Promise<void> {
  const res = await fetch(`${BASE}/users/me/sessions/${sessionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to revoke device session')
  }
}

export async function revokeAllOtherSessions(headers: Record<string, string>): Promise<void> {
  const res = await fetch(`${BASE}/users/me/sessions`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to revoke other sessions')
  }
}

export async function updateUserProfile(
  payload: { name?: string; phone?: string },
  headers: Record<string, string>
): Promise<any> {
  const res = await fetch(`${BASE}/users/me/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to update profile')
  }
  return json.data.user
}

export async function changeUserPassword(
  payload: { currentPassword: string; newPassword: string },
  headers: Record<string, string>
): Promise<void> {
  const res = await fetch(`${BASE}/users/me/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw apiError(res, json, 'Failed to change password')
  }
}

// === Phase 3: Design Pass, Wizard, 2D/3D Generation & Chatbot APIs ===

export async function fetchDesignPassProduct(): Promise<any> {
  const res = await fetch(`${BASE}/products/design-pass`)
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Failed to fetch product')
  return json.data
}

export interface UserEntitlements {
  free2D?: {
    total: number
    used: number
    remaining: number
  }
  daily2D?: {
    limit: number
    used: number
    remaining: number
    resetAt: string
  }
  freeEntitlement: {
    claimed: boolean
    status: 'AVAILABLE' | 'CONSUMED' | 'RESERVED'
    creditsTotal: number
    creditsUsed: number
    creditsRemaining: number
  }
  designPass: {
    active: boolean
    expiresAt: string | null
    daysRemaining: number
    creditsTotal: number
    creditsUsed?: number
    creditsRemaining: number
    creditsExhausted?: boolean
  }
  canGenerate2D?: boolean
  canGenerate3D?: boolean
  canGenerate: boolean
  generationMode: 'DESIGN_PASS' | 'FREE_2D' | 'UPGRADE_REQUIRED'
}

export function hasValidAuthHeader(headers?: Record<string, string>): boolean {
  const auth = headers?.Authorization || headers?.authorization
  if (!auth) return false
  const trimmed = auth.trim()
  return (
    trimmed.startsWith('Bearer ') &&
    trimmed.length > 15 &&
    !trimmed.includes('null') &&
    !trimmed.includes('undefined')
  )
}

export async function fetchUserEntitlements(headers: Record<string, string>): Promise<UserEntitlements | null> {
  if (!hasValidAuthHeader(headers)) {
    return null
  }
  try {
    const res = await fetch(`${BASE}/users/me/entitlements`, {
      headers: { 'Content-Type': 'application/json', ...headers },
      credentials: 'include',
    })
    const json = await res.json()
    if (!res.ok || !json.success) {
      if (res.status === 401) {
        onUnauthorized?.()
        return null
      }
      throw apiError(res, json, 'Failed to fetch entitlements')
    }
    return json.data
  } catch (err: any) {
    if (err?.status === 401) {
      onUnauthorized?.()
      return null
    }
    throw err
  }
}

export async function createRazorpayOrder(
  headers: Record<string, string>,
  options?: { forceRenewal?: boolean; isCreditTopup?: boolean }
): Promise<{
  orderId: string
  purchaseId: string
  amountInPaise: number
  currency: string
  product: any
  keyId: string
  user?: {
    name?: string
    email?: string
    phone?: string
  }
}> {
  const res = await fetch(`${BASE}/payments/razorpay/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify({
      forceRenewal: !!options?.forceRenewal,
      isCreditTopup: !!options?.isCreditTopup,
    }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    const error: any = new Error(json.error?.message || 'Failed to create order')
    error.status = res.status
    error.code = json.error?.code
    error.activePass = json.error?.activePass
    throw error
  }
  return json.data
}

export async function verifyRazorpayPayment(
  payload: { orderId: string; paymentId: string; signature?: string },
  headers: Record<string, string>
): Promise<any> {
  const res = await fetch(`${BASE}/payments/razorpay/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Payment verification failed')
  return json.data
}

export async function saveWizardDraft(
  payload: { sessionId?: string; stage?: number; wizardData: any },
  headers?: Record<string, string>
): Promise<any> {
  const res = await fetch(`${BASE}/wizard/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include',
    body: JSON.stringify(payload),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Failed to save wizard draft')
  return json.data
}

export async function confirmWizardRequirements(
  sessionId: string,
  headers?: Record<string, string>
): Promise<any> {
  const res = await fetch(`${BASE}/wizard/sessions/${sessionId}/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Failed to confirm requirements')
  return json.data
}

export async function fetchFreePreviewEligibility(headers: Record<string, string>): Promise<{
  eligible: boolean
  status: string
  existingJobId?: string | null
  existing2DPlan?: any | null
}> {
  const res = await fetch(`${BASE}/wizard/entitlements/free-preview`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Failed to check eligibility')
  return json.data
}

export async function generateFree2DPreview(
  payload: { wizardSessionId?: string; wizardData?: any; idempotencyKey?: string } | string,
  headers: Record<string, string>
): Promise<any> {
  const bodyData = typeof payload === 'string' ? { wizardSessionId: payload } : payload
  const res = await fetch(`${BASE}/wizard/generate-free-2d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify(bodyData),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Free generation failed')
  return json.data
}

export async function startPaid3DGeneration(
  wizardSessionId: string,
  headers: Record<string, string>,
  options?: { idempotencyKey?: string; wizardData?: Record<string, unknown> }
): Promise<any> {
  const res = await fetch(`${BASE}/generations/3d`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
    body: JSON.stringify({ wizardSessionId, ...(options || {}) }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, '3D generation request failed')
  return json.data
}

export async function fetchChatQuota(headers?: Record<string, string>): Promise<{
  allowed: boolean
  remaining: number
  limit: number
  resetAt: string
  isPassHolder: boolean
}> {
  const res = await fetch(`${BASE}/ai/chat/quota`, {
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Failed to check chat quota')
  return json.data
}

export interface SendOtpResponse {
  channel: 'sms' | 'email'
  destination: string
  message: string
  cooldownSeconds: number
}

export async function sendOtp(identifier: string, purpose?: 'LOGIN' | 'SIGNUP'): Promise<SendOtpResponse> {
  const res = await fetch(`${BASE}/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, purpose }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Failed to send verification code')
  return json.data
}

export async function verifyOtp(identifier: string, code: string, name?: string): Promise<{
  user: any
  accessToken: string
  isNewUser: boolean
}> {
  const res = await fetch(`${BASE}/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ identifier, code, name }),
  })
  const json = await res.json()
  if (!res.ok || !json.success) throw apiError(res, json, 'Invalid or expired OTP')
  return json.data
}