import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { AccessTokenPayload, AuthSuccessData, UserSummary } from '../types/auth.js'
import { RefreshSession, User } from '../types/models.js'

export class AuthService {
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
    db.createCreditTransaction({
      userId: newUser.id,
      type: 'GRANT',
      amount: 100,
      idempotencyKey: `welcome_${newUser.id}`,
    })

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

        // 100 Free Welcome AI Credits
        await tx.creditTransaction.create({
          data: {
            id: 'ctx_' + crypto.randomBytes(8).toString('hex'),
            userId: newUser.id,
            type: 'GRANT',
            amount: 100,
            description: '100 Free Welcome AI Credits',
            referenceType: 'WELCOME_BONUS',
          },
        })
      })
    } catch (dbErr: any) {
      if (dbErr.code === 'P2002') {
        throw new Error('EMAIL_EXISTS')
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
    try {
      const pUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: normalized },
            { phone: params.identifier.trim() },
          ],
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
      if (!storeUser && /^\+?[0-9]{10,14}$/.test(params.identifier.trim())) {
        storeUser = db.findUserByPhone(params.identifier.trim())
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
                passType: activePass.type,
                status: activePass.status,
                startsAt: activePass.startsAt.toISOString(),
                expiresAt: activePass.expiresAt.toISOString(),
                creditsGranted: activePass.creditsGranted,
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
}

export const authService = new AuthService()
