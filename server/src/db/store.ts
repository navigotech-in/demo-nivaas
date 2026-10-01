import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import {
  User,
  RefreshSession,
  Product,
  Purchase,
  Payment,
  AccessPass,
  CreditTransaction,
  GenerationJob,
  Lead,
  AuditLog,
} from '../types/models.js'
import { UserSummary } from '../types/auth.js'

class DatabaseStore {
  public users: Map<string, User> = new Map()
  public sessions: Map<string, RefreshSession> = new Map()
  public products: Map<string, Product> = new Map()
  public purchases: Map<string, Purchase> = new Map()
  public payments: Map<string, Payment> = new Map()
  public accessPasses: Map<string, AccessPass> = new Map()
  public creditTransactions: CreditTransaction[] = []
  public generationJobs: Map<string, GenerationJob> = new Map()
  public leads: Map<string, Lead> = new Map()
  public auditLogs: AuditLog[] = []

  constructor() {
    this.seedDefaultProduct()
  }

  // 1. Seed Product Definition (Always required for system operations)
  public seedDefaultProduct() {
    const passProduct: Product = {
      id: 'prod_design_pass_299',
      name: '30-Day Design Pass (5 AI Credits)',
      code: 'DESIGN_PASS_299',
      description: 'Full access to AI Planner & Design Desk with 5 high-definition export credits valid for 30 days.',
      priceInr: 299,
      creditsGranted: 5,
      durationDays: 30,
      isActive: true,
      createdAt: new Date().toISOString(),
    }
    this.products.set(passProduct.id, passProduct)
  }

  // 2. Explicit Development/Test Fixtures (Only called in dev or test runner)
  public seedDevFixtures() {
    // Seed Demo User
    const demoUserId = 'usr_demo_002'
    if (!this.users.has(demoUserId)) {
      const demoPasswordHash = bcrypt.hashSync('User@IndoreHouse2026!', 10)
      const demoUser: User = {
        id: demoUserId,
        email: 'user@indorehousemakers.in',
        name: 'Rohit Sharma',
        phone: '+919123456780',
        passwordHash: demoPasswordHash,
        role: 'USER',
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.users.set(demoUserId, demoUser)

      // Seed Active Pass for demo user
      const now = new Date()
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      const demoPass: AccessPass = {
        id: 'pass_demo_001',
        userId: demoUserId,
        passType: 'DESIGN_PASS_299',
        status: 'ACTIVE',
        startsAt: now.toISOString(),
        expiresAt: expiry.toISOString(),
        creditsGranted: 5,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      }
      this.accessPasses.set(demoPass.id, demoPass)

      this.creditTransactions.push({
        id: 'tx_seed_001',
        userId: demoUserId,
        passId: demoPass.id,
        amount: 5,
        balanceAfter: 5,
        type: 'PURCHASE_GRANT',
        description: 'Welcome credit grant for ₹299 30-Day Design Pass',
        referenceType: 'PURCHASE',
        referenceId: 'purch_seed_001',
        createdAt: now.toISOString(),
      })
    }
  }

  // 3. Explicit Bootstrap Admin Helper (Called by `npm run bootstrap:admin`)
  public bootstrapAdmin(email: string, password: string, name = 'Indore House Makers Admin'): User {
    const normalized = email.trim().toLowerCase()
    const existing = this.findUserByEmail(normalized)
    if (existing) {
      if (existing.role !== 'ADMIN') {
        existing.role = 'ADMIN'
        existing.updatedAt = new Date().toISOString()
      }
      return existing
    }

    const adminId = 'usr_admin_' + crypto.randomBytes(6).toString('hex')
    const passwordHash = bcrypt.hashSync(password, 10)
    const adminUser: User = {
      id: adminId,
      email: normalized,
      name,
      phone: '+919876543210',
      passwordHash,
      role: 'ADMIN',
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.users.set(adminId, adminUser)
    return adminUser
  }

  // --- Users ---
  public findUserByEmail(email: string): User | undefined {
    const normalized = email.trim().toLowerCase()
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user
      }
    }
    return undefined
  }

  public findUserByPhone(phone: string): User | undefined {
    const cleanPhone = phone.replace(/\D/g, '')
    for (const user of this.users.values()) {
      if (user.phone && user.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))) {
        return user
      }
    }
    return undefined
  }

  public findUserById(id: string): User | undefined {
    return this.users.get(id)
  }

  public createUser(user: User): User {
    this.users.set(user.id, user)
    return user
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const existing = this.users.get(id)
    if (!existing) return undefined
    const updated: User = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    this.users.set(id, updated)
    return updated
  }

  // --- Access Pass & Live Ledger Balance ---
  public getActivePass(userId: string): AccessPass | null {
    const now = new Date().toISOString()
    for (const pass of this.accessPasses.values()) {
      if (
        pass.userId === userId &&
        pass.status === 'ACTIVE' &&
        pass.expiresAt > now
      ) {
        return pass
      }
    }
    return null
  }

  public getUserSummary(user: User): UserSummary {
    const activePass = this.getActivePass(user.id)
    // Pure calculation from immutable ledger transactions
    const totalCredits = this.creditTransactions
      .filter((tx) => tx.userId === user.id)
      .reduce((sum, tx) => sum + tx.amount, 0)

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      activePass,
      totalCredits: Math.max(0, totalCredits),
      createdAt: user.createdAt,
    }
  }

  // --- Sessions & Token Rotation with Grace Window ---
  public createSession(session: RefreshSession): RefreshSession {
    this.sessions.set(session.id, session)
    return session
  }

  public findSessionById(id: string): RefreshSession | undefined {
    return this.sessions.get(id)
  }

  public findSessionByTokenHash(tokenHash: string): RefreshSession | undefined {
    for (const session of this.sessions.values()) {
      if (session.tokenHash === tokenHash) {
        return session
      }
    }
    return undefined
  }

  public rotateSession(oldSessionId: string, newSession: RefreshSession): void {
    const oldSession = this.sessions.get(oldSessionId)
    if (oldSession) {
      oldSession.isRevoked = true
      oldSession.rotatedAt = new Date().toISOString()
      oldSession.updatedAt = new Date().toISOString()
      this.sessions.set(oldSessionId, oldSession)
    }
    this.sessions.set(newSession.id, newSession)
  }

  public revokeSession(sessionId: string): void {
    const session = this.sessions.get(sessionId)
    if (session) {
      session.isRevoked = true
      session.updatedAt = new Date().toISOString()
      this.sessions.set(sessionId, session)
    }
  }

  public revokeSessionFamily(familyId: string): void {
    for (const session of this.sessions.values()) {
      if (session.familyId === familyId) {
        session.isRevoked = true
        session.updatedAt = new Date().toISOString()
      }
    }
  }

  // --- Audit Logs ---
  public logAudit(log: Omit<AuditLog, 'id' | 'createdAt'>): AuditLog {
    const entry: AuditLog = {
      id: 'aud_' + crypto.randomBytes(8).toString('hex'),
      ...log,
      createdAt: new Date().toISOString(),
    }
    this.auditLogs.unshift(entry)
    if (this.auditLogs.length > 2000) {
      this.auditLogs.pop()
    }
    return entry
  }
}

export const db = new DatabaseStore()
