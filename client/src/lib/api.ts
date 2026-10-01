import type { Project } from './data'

// In dev, Vite proxies /api -> http://localhost:7000. In production the
// Express server on port 7000 serves this build on the same origin.
const BASE = '/api/v1'

export interface LeadPayload {
  name: string
  phone: string
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
    throw new Error(json.error?.message || 'Failed to fetch dashboard data')
  }
  return json.data
}

export async function fetchUserProjects(headers: Record<string, string>): Promise<UserProject[]> {
  const res = await fetch(`${BASE}/users/me/projects`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch projects')
  }
  return json.data.projects
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
    throw new Error(json.error?.message || 'Failed to create project')
  }
  return json.data.project
}

export async function fetchUserCredits(headers: Record<string, string>): Promise<{
  availableBalance: number
  transactions: CreditTransactionItem[]
}> {
  const res = await fetch(`${BASE}/users/me/credits`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch credit ledger')
  }
  return json.data
}

export async function fetchUserPass(headers: Record<string, string>): Promise<{
  hasActivePass: boolean
  pass: any
  daysRemaining?: number
}> {
  const res = await fetch(`${BASE}/users/me/pass`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch pass status')
  }
  return json.data
}

export async function fetchUserConsultations(headers: Record<string, string>): Promise<UserConsultationItem[]> {
  const res = await fetch(`${BASE}/users/me/consultations`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    credentials: 'include',
  })
  const json = await res.json()
  if (!res.ok || !json.success) {
    throw new Error(json.error?.message || 'Failed to fetch consultations')
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
    throw new Error(json.error?.message || 'Failed to fetch active sessions')
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
    throw new Error(json.error?.message || 'Failed to revoke device session')
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
    throw new Error(json.error?.message || 'Failed to revoke other sessions')
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
    throw new Error(json.error?.message || 'Failed to update profile')
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
    throw new Error(json.error?.message || 'Failed to change password')
  }
}