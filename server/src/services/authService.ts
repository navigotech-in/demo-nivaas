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
  public generateAccessToken(user: User, sessionId: string): string {
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
    user: User,
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

    db.createSession(session)

    try {
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email },
          ],
        },
      })

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || null,
            passwordHash: user.passwordHash || '',
            role: user.role,
          },
        })
      }

      await prisma.refreshSession.create({
        data: {
          id: session.id,
          userId: dbUser.id,
          familyId: session.familyId,
          tokenHash: session.tokenHash,
          userAgent: session.userAgent,
          ipAddress: session.ipAddress,
          isRevoked: false,
          expiresAt: new Date(session.expiresAt),
        },
      })
    } catch {}

    return { rawRefreshToken, session }
  }

  // Signup
  public async signup(params: {
    email: string
    password: string
    name: string
    phone?: string
    ipAddress: string
    userAgent: string
  }): Promise<AuthSuccessData & { rawRefreshToken: string }> {
    const normalizedEmail = params.email.trim().toLowerCase()
    const existing = db.findUserByEmail(normalizedEmail)
    if (existing) {
      throw new Error('EMAIL_EXISTS')
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(params.password, saltRounds)

    const userId = 'usr_' + crypto.randomBytes(8).toString('hex')
    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      name: params.name.trim(),
      phone: params.phone?.trim() || undefined,
      passwordHash,
      role: 'USER',
      isEmailVerified: false,
      isPhoneVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.createUser(newUser)

    try {
      await prisma.user.create({
        data: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          phone: newUser.phone || null,
          passwordHash: newUser.passwordHash,
          role: newUser.role,
        },
      })
    } catch {}

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
    let user = db.findUserByEmail(normalized)

    // Check by phone if not found by email
    if (!user && /^\+?[0-9]{10,14}$/.test(params.identifier.trim())) {
      user = db.findUserByPhone(params.identifier.trim())
    }

    if (!user) {
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
          user = {
            id: pUser.id,
            email: pUser.email,
            phone: pUser.phone || undefined,
            name: pUser.name,
            passwordHash: pUser.passwordHash,
            role: pUser.role as any,
            isEmailVerified: pUser.isEmailVerified,
            isPhoneVerified: pUser.isPhoneVerified,
            createdAt: pUser.createdAt.toISOString(),
            updatedAt: pUser.updatedAt.toISOString(),
          }
          db.createUser(user)
        }
      } catch {}
    } else {
      try {
        const pUser = await prisma.user.findUnique({ where: { id: user.id } })
        if (pUser && pUser.passwordHash !== user.passwordHash) {
          user.passwordHash = pUser.passwordHash
        }
      } catch {}
    }

    if (!user) {
      throw new Error('INVALID_CREDENTIALS')
    }

    const isMatch = await bcrypt.compare(params.password, user.passwordHash)
    if (!isMatch) {
      db.logAudit({
        actorRole: 'ANONYMOUS',
        action: 'auth.login_failed',
        entityType: 'User',
        entityId: user.id,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { reason: 'Password mismatch', identifier: params.identifier },
      })
      throw new Error('INVALID_CREDENTIALS')
    }

    const { rawRefreshToken, session } = await this.createSession(
      user,
      params.ipAddress,
      params.userAgent
    )
    const accessToken = this.generateAccessToken(user, session.id)
    const userSummary = db.getUserSummary(user)

    db.logAudit({
      actorId: user.id,
      actorRole: user.role,
      action: 'auth.login_success',
      entityType: 'User',
      entityId: user.id,
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
    const session = db.findSessionByTokenHash(tokenHash)

    if (!session) {
      throw new Error('INVALID_REFRESH_TOKEN')
    }

    // 1. Check if session was already revoked
    if (session.isRevoked) {
      const GRACE_PERIOD_MS = 15 * 1000 // 15 seconds grace window for concurrent browser tabs
      const rotatedAtMs = session.rotatedAt ? new Date(session.rotatedAt).getTime() : 0
      const isWithinGrace = rotatedAtMs > 0 && Date.now() - rotatedAtMs < GRACE_PERIOD_MS

      if (isWithinGrace) {
        // Legitimate concurrent tab race condition -> Do not revoke family!
        throw new Error('TOKEN_ALREADY_ROTATED')
      }

      // True reuse attack detected outside grace period -> Revoke entire session family
      db.revokeSessionFamily(session.familyId)
      db.logAudit({
        actorId: session.userId,
        action: 'auth.token_reuse_detected',
        entityType: 'RefreshSession',
        entityId: session.id,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: { familyId: session.familyId, message: 'All family sessions revoked after breach' },
      })
      throw new Error('TOKEN_REUSE_DETECTED')
    }

    // 2. Check expiry
    if (new Date(session.expiresAt) < new Date()) {
      db.revokeSession(session.id)
      throw new Error('REFRESH_TOKEN_EXPIRED')
    }

    const user = db.findUserById(session.userId)
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
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { id: user.id },
            { email: user.email },
          ],
        },
      })

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            id: user.id,
            email: user.email,
            name: user.name,
            phone: user.phone || null,
            passwordHash: user.passwordHash || '',
            role: user.role,
          },
        })
      }

      await prisma.refreshSession.create({
        data: {
          id: newSession.id,
          userId: dbUser.id,
          familyId: newSession.familyId,
          tokenHash: newSession.tokenHash,
          userAgent: newSession.userAgent,
          ipAddress: newSession.ipAddress,
          isRevoked: false,
          expiresAt: new Date(newSession.expiresAt),
        },
      })
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
    let user = db.findUserById(userId)
    if (!user) {
      try {
        const pUser = await prisma.user.findUnique({ where: { id: userId } })
        if (pUser) {
          user = {
            id: pUser.id,
            email: pUser.email,
            phone: pUser.phone || undefined,
            name: pUser.name,
            passwordHash: pUser.passwordHash,
            role: pUser.role as any,
            isEmailVerified: pUser.isEmailVerified,
            isPhoneVerified: pUser.isPhoneVerified,
            createdAt: pUser.createdAt.toISOString(),
            updatedAt: pUser.updatedAt.toISOString(),
          }
          db.createUser(user)
        }
      } catch {}
    }
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }
    return db.getUserSummary(user)
  }
}

export const authService = new AuthService()
