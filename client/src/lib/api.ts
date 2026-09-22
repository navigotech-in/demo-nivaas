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