import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import twilio from 'twilio'
import { config } from '../config.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { AccessTokenPayload, AuthSuccessData, UserSummary } from '../types/auth.js'
import { RefreshSession, User } from '../types/models.js'
import { emailService } from './emailService.js'

interface PasswordResetRecord {
  identifier: string
  code: string
  codeHash: string
  expiresAt: number
  attempts: number
}

export class AuthService {
  private passwordResetStore = new Map<string, PasswordResetRecord>()
  private twilioClient: twilio.Twilio | null = null

  constructor() {
    if (config.otp.twilio.accountSid && config.otp.twilio.authToken) {
      try {
        this.twilioClient = twilio(config.otp.twilio.accountSid, config.otp.twilio.authToken)
      } catch (err: any) {
        console.warn('[AuthService] Failed to initialize Twilio client:', err.message)
      }
    }
  }

  // Hash token for secure storage
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex')
  }

  // Generate short-lived (15-min) Access Token with approved claims
  public generateAccessToken(user: { id: string; role: 'USER' | 'ADMIN'; email: string; name: string }, sessionId: string): string {
    const payload: AccessTokenPayload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      sessionId,
      name: user.name,
    }
    return jwt.sign(payload, config.jwt.accessTokenSecret, {
      expiresIn: '15m',
    })
  }

  // Verify Access Token
  public verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.accessTokenSecret) as AccessTokenPayload
  }

  // Generate and record Refresh Token + Session with Family ID
  public async createSession(
    user: { id: string; email: string; name: string; role: 'USER' | 'ADMIN' },
    ipAddress: string,
    userAgent: string,
    existingFamilyId?: string
  ): Promise<{ rawRefreshToken: string; session: RefreshSession }> {
    const rawRefreshToken = crypto.randomBytes(40).toString('hex')
    const tokenHash = this.hashToken(rawRefreshToken)
    const sessionId = 'ses_' + crypto.randomBytes(12).toString('hex')
    const familyId = existingFamilyId || 'fam_' + crypto.randomBytes(12).toString('hex')

    const expiresAt = new Date(
      Date.now() + config.jwt.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
    ).toISOString()

    const session: RefreshSession = {
      id: sessionId,
      userId: user.id,
      familyId,
      tokenHash,
      userAgent: userAgent || 'Unknown Agent',
      ipAddress: ipAddress || '127.0.0.1',
      isRevoked: false,
      expiresAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In-memory test mirror
    db.createSession(session)

    try {
      await prisma.refreshSession.create({
        data: {
          id: session.id,
          userId: user.id,
          familyId: session.familyId,
          tokenHash: session.tokenHash,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          isRevoked: false,
          expiresAt: new Date(session.expiresAt),
        },
      })
    } catch {
      // ignore
    }

    return { rawRefreshToken, session }
  }

  // Signup (Strictly creates role: USER and initializes 100 free AI credits)
  public async signup(params: {
    email: string
    password: string
    name: string
    phone?: string
    ipAddress: string
    userAgent: string
  }): Promise<AuthSuccessData & { rawRefreshToken: string }> {
    const normalizedEmail = params.email.trim().toLowerCase()
    const cleanPhone = params.phone ? params.phone.trim() : undefined

    // 1. Check duplicate email in PostgreSQL
    try {
      const existingEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (existingEmail) {
        throw new Error('EMAIL_EXISTS')
      }

      if (cleanPhone) {
        const existingPhone = await prisma.user.findFirst({ where: { phone: cleanPhone } })
        if (existingPhone) {
          throw new Error('PHONE_EXISTS')
        }
      }
    } catch (err: any) {
      if (err.message === 'EMAIL_EXISTS' || err.message === 'PHONE_EXISTS') {
        throw err
      }
      // Check in-memory store if DB is offline/testing
      const memExisting = db.findUserByEmail(normalizedEmail)
      if (memExisting) {
        throw new Error('EMAIL_EXISTS')
      }
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(params.password, saltRounds)
    const userId = 'usr_' + crypto.randomBytes(8).toString('hex')

    // Always strictly assign USER role on public signup
    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      name: params.name.trim(),
      phone: cleanPhone,
      passwordHash,
      role: 'USER',
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In-memory test mirror
    db.createUser(newUser)

    try {
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            phone: newUser.phone || null,
            passwordHash: newUser.passwordHash,
            role: 'USER',
          },
        })
      })
    } catch (dbErr: any) {
      if (dbErr.code === 'P2002') {
        throw new Error('EMAIL_EXISTS')
      }
      if (config.dataStore === 'postgres') {
        // Never silently hide persistence failures in postgres mode — the user
        // record must land in the real database or signup fails loudly instead
        // of existing only in memory and vanishing on the next restart.
        throw dbErr
      }
    }

    // Log audit
    db.logAudit({
      actorId: newUser.id,
      actorRole: newUser.role,
      action: 'auth.signup',
      entityType: 'User',
      entityId: newUser.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })

    const { rawRefreshToken, session } = await this.createSession(
      newUser,
      params.ipAddress,
      params.userAgent
    )
    const accessToken = this.generateAccessToken(newUser, session.id)
    const userSummary = db.getUserSummary(newUser)

    return {
      user: userSummary,
      accessToken,
      rawRefreshToken,
    }
  }

  // Login
  public async login(params: {
    identifier: string // email or phone
    password: string
    portal?: 'admin' | 'client'
    ipAddress: string
    userAgent: string
  }): Promise<AuthSuccessData & { rawRefreshToken: string }> {
    const normalized = params.identifier.trim().toLowerCase()
    let foundUser: {
      id: string
      email: string
      name: string
      phone?: string | null
      passwordHash: string
      role: 'USER' | 'ADMIN'
      isEmailVerified: boolean
      isPhoneVerified: boolean
      createdAt: Date | string
      updatedAt: Date | string
    } | null = null

    // 1. Primary Query to PostgreSQL
    const rawTrimmed = params.identifier.trim()
    const digits = rawTrimmed.replace(/\D/g, '')
    const phoneCandidates = Array.from(
      new Set(
        [
          rawTrimmed,
          digits,
          digits.length >= 10 ? digits.slice(-10) : null,
          digits.length >= 10 ? `+91${digits.slice(-10)}` : null,
          digits.length >= 10 ? `91${digits.slice(-10)}` : null,
        ].filter(Boolean) as string[]
      )
    )

    const orConditions: any[] = [{ email: normalized }]
    for (const p of phoneCandidates) {
      orConditions.push({ phone: p })
    }
    if (digits.length >= 10) {
      const tenDigits = digits.slice(-10)
      orConditions.push({ email: `${tenDigits}@phone.indorehousemakers.com` })
      orConditions.push({ email: `91${tenDigits}@phone.indorehousemakers.com` })
    }

    try {
      const pUser = await prisma.user.findFirst({
        where: {
          OR: orConditions,
        },
      })
      if (pUser) {
        foundUser = pUser
      }
    } catch {
      // In-memory test mirror
    }

    if (!foundUser) {
      let storeUser = db.findUserByEmail(normalized)
      if (!storeUser && digits.length >= 10) {
        storeUser =
          db.findUserByPhone(digits.slice(-10)) ||
          db.findUserByEmail(`91${digits.slice(-10)}@phone.indorehousemakers.com`) ||
          db.findUserByEmail(`${digits.slice(-10)}@phone.indorehousemakers.com`)
      }
      if (!storeUser && rawTrimmed) {
        storeUser = db.findUserByPhone(rawTrimmed)
      }
      if (storeUser) {
        foundUser = storeUser
      }
    }

    if (!foundUser) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isMatch = await bcrypt.compare(params.password, foundUser.passwordHash)
    if (!isMatch) {
      db.logAudit({
        actorRole: 'ANONYMOUS',
        action: 'auth.login_failed',
        entityType: 'User',
        entityId: foundUser.id,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { reason: 'Password mismatch', identifier: params.identifier },
      })
      throw new Error('INVALID_CREDENTIALS')
    }

    // Portal isolation enforcement:
    // Admin can ONLY login from /admin portal. Regular users CANNOT login from /admin.
    if (params.portal === 'admin' && foundUser.role !== 'ADMIN') {
      db.logAudit({
        actorRole: foundUser.role,
        action: 'auth.login_denied_admin_portal_only',
        entityType: 'User',
        entityId: foundUser.id,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { reason: 'Non-admin user attempted login via admin portal', identifier: params.identifier },
      })
      throw new Error('ADMIN_PORTAL_ONLY')
    }

    if (params.portal === 'client' && foundUser.role === 'ADMIN') {
      db.logAudit({
        actorRole: foundUser.role,
        action: 'auth.login_denied_admin_on_client_portal',
        entityType: 'User',
        entityId: foundUser.id,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { reason: 'Admin user attempted login via client portal', identifier: params.identifier },
      })
      throw new Error('CLIENT_PORTAL_ONLY')
    }

    const { rawRefreshToken, session } = await this.createSession(
      foundUser,
      params.ipAddress,
      params.userAgent
    )
    const accessToken = this.generateAccessToken(foundUser, session.id)
    const userSummary: UserSummary = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      phone: foundUser.phone || undefined,
      role: foundUser.role,
      isEmailVerified: foundUser.isEmailVerified,
      isPhoneVerified: foundUser.isPhoneVerified,
      activePass: null,
      totalCredits: db.calculateUserBalance(foundUser.id),
      createdAt: typeof foundUser.createdAt === 'string' ? foundUser.createdAt : foundUser.createdAt.toISOString(),
    }

    db.logAudit({
      actorId: foundUser.id,
      actorRole: foundUser.role,
      action: 'auth.login_success',
      entityType: 'User',
      entityId: foundUser.id,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      metadata: { sessionId: session.id },
    })

    return {
      user: userSummary,
      accessToken,
      rawRefreshToken,
    }
  }

  // Refresh Token with 15s Grace Window & Reuse Detection
  public async refresh(params: {
    rawRefreshToken: string
    ipAddress: string
    userAgent: string
  }): Promise<{ accessToken: string; newRawRefreshToken: string; user: UserSummary }> {
    if (!params.rawRefreshToken) {
      throw new Error('NO_REFRESH_TOKEN')
    }

    const tokenHash = this.hashToken(params.rawRefreshToken)
    let session: RefreshSession | undefined

    try {
      const pSession = await prisma.refreshSession.findUnique({
        where: { tokenHash },
      })
      if (pSession) {
        session = {
          id: pSession.id,
          userId: pSession.userId,
          familyId: pSession.familyId,
          tokenHash: pSession.tokenHash,
          userAgent: pSession.userAgent,
          ipAddress: pSession.ipAddress,
          isRevoked: pSession.isRevoked,
          rotatedAt: pSession.rotatedAt ? pSession.rotatedAt.toISOString() : undefined,
          expiresAt: pSession.expiresAt.toISOString(),
          createdAt: pSession.createdAt.toISOString(),
          updatedAt: pSession.updatedAt.toISOString(),
        }
      }
    } catch {}

    if (!session) {
      session = db.findSessionByTokenHash(tokenHash)
    }

    if (!session) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    // 1. Check if session was already revoked
    if (session.isRevoked) {
      const now = Date.now()
      const rotatedAt = session.rotatedAt ? new Date(session.rotatedAt).getTime() : 0
      const isWithinGrace = rotatedAt > 0 && now - rotatedAt <= config.jwt.refreshGraceSeconds * 1000

      if (isWithinGrace) {
        throw new Error('TOKEN_ALREADY_ROTATED')
      }

      // Reuse breach detected outside grace window: Revoke family
      db.revokeSessionFamily(session.familyId)
      try {
        await prisma.refreshSession.updateMany({
          where: { familyId: session.familyId },
          data: { isRevoked: true },
        })
      } catch {}

      db.logAudit({
        actorId: session.userId,
        action: 'auth.token_reuse_detected',
        entityType: 'RefreshSession',
        entityId: session.id,
        metadata: { familyId: session.familyId, ip: params.ipAddress },
      })
      throw new Error('TOKEN_REUSE_DETECTED')
    }

    // 2. Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      db.revokeSession(session.id)
      try {
        await prisma.refreshSession.update({
          where: { id: session.id },
          data: { isRevoked: true },
        })
      } catch {}
      throw new Error('REFRESH_TOKEN_EXPIRED')
    }

    let user = db.findUserById(session.userId)
    if (!user) {
      try {
        const pUser = await prisma.user.findUnique({ where: { id: session.userId } })
        if (pUser) {
          user = {
            id: pUser.id,
            email: pUser.email,
            name: pUser.name,
            phone: pUser.phone || undefined,
            passwordHash: pUser.passwordHash,
            role: pUser.role as any,
            isEmailVerified: pUser.isEmailVerified,
            isPhoneVerified: pUser.isPhoneVerified,
            createdAt: pUser.createdAt.toISOString(),
            updatedAt: pUser.updatedAt.toISOString(),
          }
        }
      } catch {}
    }

    if (!user) {
      db.revokeSession(session.id)
      throw new Error('USER_NOT_FOUND')
    }

    // 3. Rotate: Create new session in same family & mark old session rotated with timestamp
    const rawRefreshToken = crypto.randomBytes(40).toString('hex')
    const newTokenHash = this.hashToken(rawRefreshToken)
    const newSessionId = 'ses_' + crypto.randomBytes(12).toString('hex')

    const newSession: RefreshSession = {
      id: newSessionId,
      userId: user.id,
      familyId: session.familyId,
      tokenHash: newTokenHash,
      userAgent: params.userAgent || 'Unknown Agent',
      ipAddress: params.ipAddress || '127.0.0.1',
      isRevoked: false,
      expiresAt: new Date(
        Date.now() + config.jwt.refreshTokenExpiresDays * 24 * 60 * 60 * 1000
      ).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.rotateSession(session.id, newSession)

    try {
      await prisma.$transaction([
        prisma.refreshSession.update({
          where: { id: session.id },
          data: { isRevoked: true, rotatedAt: new Date() },
        }),
        prisma.refreshSession.create({
          data: {
            id: newSession.id,
            userId: user.id,
            familyId: newSession.familyId,
            tokenHash: newSession.tokenHash,
            userAgent: newSession.userAgent,
            ipAddress: newSession.ipAddress,
            isRevoked: false,
            expiresAt: new Date(newSession.expiresAt),
          },
        }),
      ])
    } catch {}

    const accessToken = this.generateAccessToken(user, newSession.id)
    const userSummary = db.getUserSummary(user)

    return {
      accessToken,
      newRawRefreshToken: rawRefreshToken,
      user: userSummary,
    }
  }

  // Logout
  public async logout(params: {
    sessionId?: string
    rawRefreshToken?: string
    userId?: string
  }): Promise<void> {
    if (params.sessionId) {
      db.revokeSession(params.sessionId)
      try {
        await prisma.refreshSession.update({
          where: { id: params.sessionId },
          data: { isRevoked: true },
        })
      } catch {}
    } else if (params.rawRefreshToken) {
      const tokenHash = this.hashToken(params.rawRefreshToken)
      const session = db.findSessionByTokenHash(tokenHash)
      if (session) {
        db.revokeSession(session.id)
        try {
          await prisma.refreshSession.update({
            where: { id: session.id },
            data: { isRevoked: true },
          })
        } catch {}
      }
    }

    if (params.userId) {
      db.logAudit({
        actorId: params.userId,
        action: 'auth.logout',
        entityType: 'User',
        entityId: params.userId,
      })
    }
  }

  // Get Me
  public async getMe(userId: string): Promise<UserSummary> {
    try {
      const pUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          passes: {
            where: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
            orderBy: { expiresAt: 'desc' },
            take: 1,
          },
          creditLedger: true,
        },
      })

      if (pUser) {
        const totalCredits = pUser.creditLedger.reduce((sum, tx) => sum + tx.amount, 0)
        const activePass = pUser.passes[0]
        return {
          id: pUser.id,
          email: pUser.email,
          name: pUser.name,
          phone: pUser.phone || undefined,
          role: pUser.role,
          isEmailVerified: pUser.isEmailVerified,
          isPhoneVerified: pUser.isPhoneVerified,
          activePass: activePass
            ? {
                id: activePass.id,
                userId: pUser.id,
                passType: activePass.passType as any,
                status: activePass.status as any,
                startsAt: activePass.startsAt.toISOString(),
                expiresAt: activePass.expiresAt.toISOString(),
                creditsGranted: activePass.creditsGranted,
                createdAt: activePass.createdAt.toISOString(),
                updatedAt: activePass.updatedAt.toISOString(),
              }
            : null,
          totalCredits,
          createdAt: pUser.createdAt.toISOString(),
        }
      }
    } catch {}

    const user = db.findUserById(userId)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    return db.getUserSummary(user)
  }

  // Request Password Reset (Dispatches 6-digit code via SMS and/or Email)
  public async requestPasswordReset(rawIdentifier: string): Promise<{
    channel: 'email' | 'sms'
    destination: string
    message: string
    devCode?: string
  }> {
    const trimmed = rawIdentifier.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    const digits = trimmed.replace(/\D/g, '')
    const tenDigits = digits.length >= 10 ? digits.slice(-10) : ''
    const normalized = isEmail
      ? trimmed.toLowerCase()
      : digits.length === 10
      ? `+91${digits}`
      : digits.length === 12 && digits.startsWith('91')
      ? `+${digits}`
      : trimmed.startsWith('+')
      ? trimmed
      : `+91${digits}`

    // 1. Identify destination email and phone
    let targetEmail: string | null = isEmail ? normalized : null
    let targetPhone: string | null = !isEmail ? normalized : null

    const lookupOrConditions: any[] = [{ email: normalized }]
    if (tenDigits) {
      lookupOrConditions.push({ phone: tenDigits })
      lookupOrConditions.push({ phone: `+91${tenDigits}` })
      lookupOrConditions.push({ phone: `91${tenDigits}` })
      lookupOrConditions.push({ phone: trimmed })
      lookupOrConditions.push({ email: `${tenDigits}@phone.indorehousemakers.com` })
      lookupOrConditions.push({ email: `91${tenDigits}@phone.indorehousemakers.com` })
    }

    // Check DB / Prisma
    try {
      const pUser = await prisma.user.findFirst({
        where: { OR: lookupOrConditions },
      })
      if (pUser) {
        if (pUser.email && !pUser.email.endsWith('@phone.indorehousemakers.com')) {
          targetEmail = pUser.email
        }
        if (pUser.phone) {
          const pDigits = pUser.phone.replace(/\D/g, '')
          targetPhone = pUser.phone.startsWith('+') ? pUser.phone : `+91${pDigits.slice(-10)}`
        }
      }
    } catch {}

    // Check Memory Store
    if (!targetEmail || !targetPhone) {
      let memUser = db.findUserByEmail(normalized)
      if (!memUser && tenDigits) {
        memUser =
          db.findUserByPhone(tenDigits) ||
          db.findUserByEmail(`91${tenDigits}@phone.indorehousemakers.com`) ||
          db.findUserByEmail(`${tenDigits}@phone.indorehousemakers.com`)
      }
      if (memUser) {
        if (memUser.email && !memUser.email.endsWith('@phone.indorehousemakers.com')) {
          targetEmail = memUser.email
        }
        if (memUser.phone) {
          const mDigits = memUser.phone.replace(/\D/g, '')
          targetPhone = memUser.phone.startsWith('+') ? memUser.phone : `+91${mDigits.slice(-10)}`
        }
      }
    }

    // 2. Generate secure 6-digit reset code
    const resetCode = String(crypto.randomInt(100000, 999999))
    const codeHash = crypto.createHash('sha256').update(`${resetCode}_ihm_reset_salt_2026`).digest('hex')
    const expiresAt = Date.now() + 10 * 60 * 1000 // 10 minutes

    const resetRecord: PasswordResetRecord = {
      identifier: normalized,
      code: resetCode,
      codeHash,
      expiresAt,
      attempts: 0,
    }

    // Store under all relevant identifiers
    this.passwordResetStore.set(normalized, resetRecord)
    if (trimmed !== normalized) {
      this.passwordResetStore.set(trimmed, resetRecord)
    }
    if (tenDigits) {
      this.passwordResetStore.set(tenDigits, resetRecord)
      this.passwordResetStore.set(`+91${tenDigits}`, resetRecord)
    }
    if (targetEmail && targetEmail !== normalized) {
      this.passwordResetStore.set(targetEmail, resetRecord)
    }
    if (targetPhone && targetPhone !== normalized) {
      this.passwordResetStore.set(targetPhone, resetRecord)
    }

    // 3. Dispatch Email if email is available
    if (targetEmail) {
      try {
        await emailService.sendPasswordResetEmail(targetEmail, resetCode)
        console.log(`[AuthService] Password reset email successfully dispatched to ${targetEmail}`)
      } catch (err: any) {
        console.error(`[AuthService] Failed to send password reset email to ${targetEmail}:`, err.message)
      }
    }

    // 4. Dispatch SMS via Twilio Verify if phone is available
    if (targetPhone && this.twilioClient && config.otp.twilio.verifyServiceSid) {
      try {
        await this.twilioClient.verify.v2
          .services(config.otp.twilio.verifyServiceSid)
          .verifications.create({ to: targetPhone, channel: 'sms' })
        console.log(`[AuthService] Twilio Verify SMS dispatched successfully to ${targetPhone}`)
      } catch (verifyErr: any) {
        console.warn(`[AuthService] Twilio Verify dispatch failed: ${verifyErr.message}`)
      }
    }

    console.log(`\n======================================================`)
    console.log(`🔐 [PASSWORD RESET CODE] ${normalized}`)
    console.log(`   👉 Local Dev / Email Reset Code: ${resetCode}`)
    if (targetPhone && this.twilioClient && config.otp.twilio.verifyServiceSid) {
      console.log(`   📱 Twilio Verify SMS sent to: ${targetPhone}`)
      console.log(`   💡 You can enter either the SMS code from your phone or the Dev Code (${resetCode})`)
    }
    console.log(`======================================================\n`)

    const maskedDestination = isEmail
      ? normalized.replace(/^(.{2})(.*)(@.*)$/, (_m, a, b, c) => `${a}${'*'.repeat(Math.max(2, b.length))}${c}`)
      : normalized.replace(/(\+\d{2})(\d{2})\d{4}(\d{4})/, '$1 $2****$3')

    return {
      channel: isEmail ? 'email' : 'sms',
      destination: maskedDestination,
      message: `A 6-digit password reset code has been sent to ${maskedDestination}.`,
      devCode: !config.isProduction ? resetCode : undefined,
    }
  }

  // Reset Password with Verified Code
  public async resetPassword(params: {
    identifier: string
    code: string
    newPassword: string
  }): Promise<{ message: string }> {
    const trimmed = params.identifier.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    const digits = trimmed.replace(/\D/g, '')
    const normalized = isEmail
      ? trimmed.toLowerCase()
      : digits.length === 10
      ? `+91${digits}`
      : digits.length === 12 && digits.startsWith('91')
      ? `+${digits}`
      : trimmed.startsWith('+')
      ? trimmed
      : `+91${digits}`

    const cleanCode = params.code.trim().replace(/\D/g, '')
    let isApproved = false
    let twilioNetworkError: string | null = null

    // 1. Try Twilio Verify check for phone number (with automatic retry for transient DNS/network glitches)
    if (!isEmail && this.twilioClient && config.otp.twilio.verifyServiceSid) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const check = await this.twilioClient.verify.v2
            .services(config.otp.twilio.verifyServiceSid)
            .verificationChecks.create({ to: normalized, code: cleanCode })

          if (check.status === 'approved') {
            isApproved = true
            this.passwordResetStore.delete(normalized)
            twilioNetworkError = null
            break
          } else {
            twilioNetworkError = null
            break
          }
        } catch (err: any) {
          const isTransientNetwork =
            err.code === 'EAI_AGAIN' ||
            err.code === 'ETIMEDOUT' ||
            err.code === 'ECONNRESET' ||
            err.message?.includes('EAI_AGAIN') ||
            err.message?.includes('ETIMEDOUT') ||
            err.message?.includes('ECONNRESET')

          if (isTransientNetwork && attempt === 1) {
            console.warn(`[AuthService] Twilio Verify DNS/network retry (attempt 1/2): ${err.message}`)
            await new Promise((resolve) => setTimeout(resolve, 600))
            continue
          }

          if (isTransientNetwork) {
            twilioNetworkError = err.message
          }
          console.warn(`[AuthService] Twilio Verify check error: ${err.message}`)
          break
        }
      }
    }

    // 2. Check local memory reset store
    const tenDigits = digits.length >= 10 ? digits.slice(-10) : ''
    const record =
      this.passwordResetStore.get(normalized) ||
      this.passwordResetStore.get(trimmed) ||
      (tenDigits ? this.passwordResetStore.get(tenDigits) : undefined) ||
      (tenDigits ? this.passwordResetStore.get(`+91${tenDigits}`) : undefined)

    if (!isApproved) {
      if (!record) {
        throw new Error('No active password reset request found. Please request a new reset code.')
      }

      if (Date.now() > record.expiresAt) {
        this.passwordResetStore.delete(normalized)
        if (tenDigits) {
          this.passwordResetStore.delete(tenDigits)
          this.passwordResetStore.delete(`+91${tenDigits}`)
        }
        throw new Error('Password reset code has expired. Please request a fresh code.')
      }

      if (record.attempts >= 4) {
        this.passwordResetStore.delete(normalized)
        if (tenDigits) {
          this.passwordResetStore.delete(tenDigits)
          this.passwordResetStore.delete(`+91${tenDigits}`)
        }
        throw new Error('Too many incorrect attempts. Please request a fresh reset code.')
      }

      const inputHash = crypto.createHash('sha256').update(`${cleanCode}_ihm_reset_salt_2026`).digest('hex')
      if (inputHash === record.codeHash || cleanCode === record.code) {
        isApproved = true
        this.passwordResetStore.delete(normalized)
        if (tenDigits) {
          this.passwordResetStore.delete(tenDigits)
          this.passwordResetStore.delete(`+91${tenDigits}`)
        }
      } else {
        // If Twilio failed due to network/DNS timeout, inform the user instead of decrementing attempts
        if (twilioNetworkError) {
          throw new Error(
            `SMS verification server connection timed out (${twilioNetworkError}). Please retry in a few seconds or enter the code from the server console.`
          )
        }

        record.attempts += 1
        const remaining = 4 - record.attempts
        throw new Error(`Invalid reset code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`)
      }
    }

    if (params.newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long.')
    }

    // Hash new password
    const newHash = await bcrypt.hash(params.newPassword, 10)

    // Update in Prisma
    let targetUserId: string | null = null
    const userOrConditions: any[] = [{ email: normalized }]
    if (tenDigits) {
      userOrConditions.push({ phone: tenDigits })
      userOrConditions.push({ phone: `+91${tenDigits}` })
      userOrConditions.push({ phone: `91${tenDigits}` })
      userOrConditions.push({ phone: trimmed })
      userOrConditions.push({ email: `${tenDigits}@phone.indorehousemakers.com` })
      userOrConditions.push({ email: `91${tenDigits}@phone.indorehousemakers.com` })
    }

    try {
      const pUser = await prisma.user.findFirst({
        where: { OR: userOrConditions },
      })
      if (pUser) {
        targetUserId = pUser.id
        await prisma.user.update({
          where: { id: pUser.id },
          data: { passwordHash: newHash },
        })

        // Revoke all existing sessions for security
        await prisma.refreshSession.updateMany({
          where: { userId: pUser.id },
          data: { isRevoked: true },
        })
      }
    } catch (dbErr: any) {
      console.warn('[AuthService] Prisma update failed during reset:', dbErr.message)
    }

    // Update in memory store if present
    let memUser = db.findUserByEmail(normalized)
    if (!memUser && tenDigits) {
      memUser =
        db.findUserByPhone(tenDigits) ||
        db.findUserByEmail(`91${tenDigits}@phone.indorehousemakers.com`) ||
        db.findUserByEmail(`${tenDigits}@phone.indorehousemakers.com`)
    }
    if (memUser) {
      targetUserId = targetUserId || memUser.id
      memUser.passwordHash = newHash
      db.users.set(memUser.id, memUser)
    }

    // Clear reset records
    this.passwordResetStore.delete(normalized)
    this.passwordResetStore.delete(trimmed)
    if (tenDigits) {
      this.passwordResetStore.delete(tenDigits)
      this.passwordResetStore.delete(`+91${tenDigits}`)
    }

    if (!targetUserId) {
      throw new Error('User account not found to update password. Please check your registered mobile or email.')
    }

    db.logAudit({
      actorId: targetUserId,
      action: 'auth.password_reset',
      entityType: 'User',
      entityId: targetUserId,
    })

    return {
      message: 'Password reset successfully! You can now log in with your new password.',
    }
  }
}

export const authService = new AuthService()
