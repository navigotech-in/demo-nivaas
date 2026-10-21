import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma.js'
import { db } from './store.js'
import { UserSummary } from '../types/auth.js'

export class PrismaDatabaseService {
  // --- Admin Setup with Atomic DB Lock ---
  public async getAdminCount(): Promise<number> {
    return await prisma.user.count({
      where: { role: 'ADMIN' },
    })
  }

  public async bootstrapAdminAtomically(
    email: string,
    password: string,
    name = 'Indore House Makers Admin',
    phone?: string
  ) {
    const normalized = email.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(password, 10)

    try {
      return await prisma.$transaction(
        async (tx) => {
          // 1. Check existing admins inside transaction
          const existingAdmins = await tx.user.count({
            where: { role: 'ADMIN' },
          })
          if (existingAdmins > 0) {
            throw new Error('SETUP_ALREADY_COMPLETED')
          }

          // 2. Lock setup lock record
          const existingLock = await tx.adminSetupLock.findUnique({
            where: { id: 'SETUP_LOCK' },
          })
          if (existingLock?.isLocked) {
            throw new Error('SETUP_ALREADY_COMPLETED')
          }

          // 3. Create Admin User
          const adminId = 'usr_admin_' + crypto.randomBytes(6).toString('hex')
          const adminUser = await tx.user.create({
            data: {
              id: adminId,
              email: normalized,
              name,
              phone: phone || '+919876543210',
              passwordHash,
              role: 'ADMIN',
              isEmailVerified: true,
              isPhoneVerified: true,
            },
          })

          // 4. Record Lock permanently
          await tx.adminSetupLock.upsert({
            where: { id: 'SETUP_LOCK' },
            create: {
              id: 'SETUP_LOCK',
              isLocked: true,
              adminId: adminUser.id,
              lockedAt: new Date(),
            },
            update: {
              isLocked: true,
              adminId: adminUser.id,
              lockedAt: new Date(),
            },
          })

          return adminUser
        },
        {
          isolationLevel: 'Serializable',
        }
      )
    } catch (err: any) {
      if (
        err.code === 'P2002' ||
        err.code === 'P2034' ||
        err.message === 'SETUP_ALREADY_COMPLETED'
      ) {
        throw new Error('SETUP_ALREADY_COMPLETED')
      }
      throw err
    }
  }

  // --- Users ---
  public async findUserByEmail(email: string) {
    const normalized = email.trim().toLowerCase()
    return await prisma.user.findUnique({
      where: { email: normalized },
    })
  }

  public async findUserByPhone(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '')
    // Match exact or trailing 10 digits
    return await prisma.user.findFirst({
      where: {
        phone: {
          endsWith: cleanPhone.slice(-10),
        },
      },
    })
  }

  public async findUserById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: {
          passes: {
            where: {
              status: 'ACTIVE',
              expiresAt: { gt: new Date() },
            },
          },
        },
      })
    } catch {
      // In-memory test mirror
      return db.findUserById(id) as any
    }
  }

  public async createUser(data: {
    email: string
    name: string
    passwordHash: string
    phone?: string
    role?: 'USER' | 'ADMIN'
  }) {
    return await prisma.user.create({
      data: {
        id: 'usr_' + crypto.randomBytes(8).toString('hex'),
        email: data.email.trim().toLowerCase(),
        name: data.name.trim(),
        passwordHash: data.passwordHash,
        phone: data.phone?.trim() || null,
        role: data.role || 'USER',
        isEmailVerified: false,
        isPhoneVerified: false,
      },
    })
  }

  public async getUserSummary(userId: string): Promise<UserSummary> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        passes: {
          where: {
            status: 'ACTIVE',
            expiresAt: { gt: new Date() },
          },
          orderBy: { expiresAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    const creditAgg = await prisma.creditTransaction.aggregate({
      where: { userId },
      _sum: { amount: true },
    })

    const totalCredits = Math.max(0, creditAgg._sum.amount ?? 0)
    const activePass = user.passes[0]
      ? {
          id: user.passes[0].id,
          userId: user.passes[0].userId,
          passType: user.passes[0].passType,
          status: user.passes[0].status,
          startsAt: user.passes[0].startsAt.toISOString(),
          expiresAt: user.passes[0].expiresAt.toISOString(),
          creditsGranted: user.passes[0].creditsGranted,
          createdAt: user.passes[0].createdAt.toISOString(),
          updatedAt: user.passes[0].updatedAt.toISOString(),
        }
      : null

    const isSyntheticEmail = Boolean(user.email && user.email.endsWith('@phone.indorehousemakers.com'))
    const cleanEmail = isSyntheticEmail ? '' : user.email
    const cleanName =
      user.name === 'Client User' && user.phone
        ? `User (${user.phone.slice(-4)})`
        : user.name

    return {
      id: user.id,
      name: cleanName,
      email: cleanEmail,
      phone: user.phone || undefined,
      role: user.role,
      isEmailVerified: user.isEmailVerified && !isSyntheticEmail,
      isPhoneVerified: user.isPhoneVerified,
      activePass,
      totalCredits,
      createdAt: user.createdAt.toISOString(),
    }
  }

  // --- Sessions & Token Rotation ---
  public async createSession(data: {
    userId: string
    familyId?: string
    tokenHash: string
    userAgent: string
    ipAddress: string
    expiresAt: Date
  }) {
    const sessionId = 'ses_' + crypto.randomBytes(12).toString('hex')
    const familyId = data.familyId || 'fam_' + crypto.randomBytes(12).toString('hex')

    return await prisma.refreshSession.create({
      data: {
        id: sessionId,
        userId: data.userId,
        familyId,
        tokenHash: data.tokenHash,
        userAgent: data.userAgent || 'Unknown Agent',
        ipAddress: data.ipAddress || '127.0.0.1',
        isRevoked: false,
        expiresAt: data.expiresAt,
      },
    })
  }

  public async findSessionByTokenHash(tokenHash: string) {
    return await prisma.refreshSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    })
  }

  public async rotateSession(
    oldSessionId: string,
    newSessionData: {
      userId: string
      familyId: string
      tokenHash: string
      userAgent: string
      ipAddress: string
      expiresAt: Date
    }
  ) {
    const newSessionId = 'ses_' + crypto.randomBytes(12).toString('hex')

    return await prisma.$transaction([
      prisma.refreshSession.update({
        where: { id: oldSessionId },
        data: {
          isRevoked: true,
          rotatedAt: new Date(),
        },
      }),
      prisma.refreshSession.create({
        data: {
          id: newSessionId,
          userId: newSessionData.userId,
          familyId: newSessionData.familyId,
          tokenHash: newSessionData.tokenHash,
          userAgent: newSessionData.userAgent,
          ipAddress: newSessionData.ipAddress,
          isRevoked: false,
          expiresAt: newSessionData.expiresAt,
        },
      }),
    ])
  }

  public async revokeSession(sessionId: string) {
    return await prisma.refreshSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    })
  }

  public async revokeSessionFamily(familyId: string) {
    return await prisma.refreshSession.updateMany({
      where: { familyId },
      data: { isRevoked: true },
    })
  }

  // --- Audit Logs ---
  public async logAudit(data: {
    actorId?: string
    actorRole?: string
    action: string
    entityType: string
    entityId?: string
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }) {
    return await prisma.auditLog.create({
      data: {
        id: 'aud_' + crypto.randomBytes(8).toString('hex'),
        actorId: data.actorId || null,
        actorRole: data.actorRole || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
      },
    })
  }

  // --- Credit Ledger Operations ---
  public async calculateCreditBalance(userId: string): Promise<number> {
    try {
      const agg = await prisma.creditTransaction.aggregate({
        where: { userId },
        _sum: { amount: true },
      })
      return Math.max(0, agg._sum.amount ?? 0)
    } catch {
      return db.calculateUserBalance(userId)
    }
  }

  public async grantCredits(params: {
    userId: string
    passId?: string
    amount: number
    description: string
    referenceId?: string
  }) {
    if (params.amount <= 0) {
      throw new Error('Grant amount must be positive.')
    }

    return await prisma.$transaction(async (tx) => {
      const txId = 'tx_' + crypto.randomBytes(8).toString('hex')
      const transaction = await tx.creditTransaction.create({
        data: {
          id: txId,
          userId: params.userId,
          passId: params.passId || null,
          amount: params.amount,
          type: 'GRANT',
          description: params.description,
          referenceType: 'PURCHASE',
          referenceId: params.referenceId || null,
        },
      })

      await tx.auditLog.create({
        data: {
          id: 'aud_' + crypto.randomBytes(8).toString('hex'),
          actorId: params.userId,
          action: 'ledger.grant',
          entityType: 'CreditTransaction',
          entityId: transaction.id,
          metadata: { amount: params.amount },
        },
      })

      return transaction
    })
  }

  public async reserveCredit(params: {
    userId: string
    jobId: string
    cost?: number
  }) {
    const cost = params.cost ?? 1

    return await prisma.$transaction(async (tx) => {
      const agg = await tx.creditTransaction.aggregate({
        where: { userId: params.userId },
        _sum: { amount: true },
      })
      const currentBalance = Math.max(0, agg._sum.amount ?? 0)

      if (currentBalance < cost) {
        return {
          success: false,
          remainingBalance: currentBalance,
          error: 'INSUFFICIENT_CREDITS',
        }
      }

      // Create atomic reservation record
      const reservation = await tx.creditReservation.create({
        data: {
          userId: params.userId,
          jobId: params.jobId,
          amount: cost,
          status: 'RESERVED',
        },
      })

      // Record negative ledger entry
      const txId = 'tx_' + crypto.randomBytes(8).toString('hex')
      await tx.creditTransaction.create({
        data: {
          id: txId,
          userId: params.userId,
          amount: -cost,
          type: 'RESERVE',
          description: `Credit reserved for AI job ${params.jobId}`,
          referenceType: 'GENERATION_JOB',
          referenceId: reservation.id,
        },
      })

      await tx.auditLog.create({
        data: {
          id: 'aud_' + crypto.randomBytes(8).toString('hex'),
          actorId: params.userId,
          action: 'ledger.reserve',
          entityType: 'CreditTransaction',
          entityId: txId,
          metadata: {
            reservationId: reservation.id,
            jobId: params.jobId,
            cost,
            balanceAfter: currentBalance - cost,
          },
        },
      })

      return {
        success: true,
        reservationId: reservation.id,
        remainingBalance: currentBalance - cost,
      }
    })
  }

  public async confirmConsumption(params: {
    userId: string
    reservationId: string
    jobId: string
  }) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.creditReservation.findUnique({
        where: { id: params.reservationId },
      })

      if (!reservation || reservation.userId !== params.userId) {
        throw new Error('RESERVATION_NOT_FOUND')
      }

      if (reservation.status !== 'RESERVED') {
        throw new Error('RESERVATION_ALREADY_SETTLED')
      }

      // Transition status atomically to CONSUMED
      await tx.creditReservation.update({
        where: { id: params.reservationId },
        data: {
          status: 'CONSUMED',
          settledAt: new Date(),
        },
      })

      // Add zero delta ledger entry
      const txId = 'tx_' + crypto.randomBytes(8).toString('hex')
      const ledgerEntry = await tx.creditTransaction.create({
        data: {
          id: txId,
          userId: params.userId,
          amount: 0,
          type: 'CONSUME',
          description: `Reservation ${params.reservationId} successfully fulfilled for job ${params.jobId}`,
          referenceType: 'GENERATION_JOB',
          referenceId: params.reservationId,
        },
      })

      await tx.auditLog.create({
        data: {
          id: 'aud_' + crypto.randomBytes(8).toString('hex'),
          actorId: params.userId,
          action: 'ledger.consume_success',
          entityType: 'CreditTransaction',
          entityId: ledgerEntry.id,
          metadata: { reservationId: params.reservationId, jobId: params.jobId },
        },
      })

      return ledgerEntry
    })
  }

  public async releaseReservation(params: {
    userId: string
    reservationId: string
    jobId: string
    reason?: string
    amount?: number
  }) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.creditReservation.findUnique({
        where: { id: params.reservationId },
      })

      if (!reservation || reservation.userId !== params.userId) {
        throw new Error('RESERVATION_NOT_FOUND')
      }

      if (reservation.status !== 'RESERVED') {
        throw new Error('RESERVATION_ALREADY_SETTLED')
      }

      // Transition status atomically to RELEASED
      await tx.creditReservation.update({
        where: { id: params.reservationId },
        data: {
          status: 'RELEASED',
          settledAt: new Date(),
        },
      })

      const refundAmount = params.amount ?? reservation.amount
      const txId = 'tx_' + crypto.randomBytes(8).toString('hex')
      const refundEntry = await tx.creditTransaction.create({
        data: {
          id: txId,
          userId: params.userId,
          amount: refundAmount,
          type: 'RELEASE',
          description: `Reservation ${params.reservationId} released: ${params.reason || 'System failure refund'}`,
          referenceType: 'GENERATION_JOB',
          referenceId: params.reservationId,
        },
      })

      await tx.auditLog.create({
        data: {
          id: 'aud_' + crypto.randomBytes(8).toString('hex'),
          actorId: params.userId,
          action: 'ledger.release_refund',
          entityType: 'CreditTransaction',
          entityId: refundEntry.id,
          metadata: {
            reservationId: params.reservationId,
            jobId: params.jobId,
            refundAmount,
            reason: params.reason,
          },
        },
      })

      return refundEntry
    })
  }

  public async getCreditHistory(userId: string) {
    return await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  public async getFree2DGenerationsCount(userId: string): Promise<number> {
    try {
      return await prisma.generationJob.count({
        where: {
          userId,
          generationType: 'FREE_2D_PREVIEW',
          status: 'COMPLETED',
        },
      })
    } catch {
      return 0
    }
  }

  public async getDaily2DGenerationsCount(userId: string): Promise<number> {
    try {
      const startOfDay = new Date()
      startOfDay.setUTCHours(0, 0, 0, 0)
      return await prisma.generationJob.count({
        where: {
          userId,
          generationType: 'FREE_2D_PREVIEW',
          status: 'COMPLETED',
          createdAt: { gte: startOfDay },
        },
      })
    } catch {
      return 0
    }
  }

  public async getActivePass(userId: string) {
    try {
      return await prisma.accessPass.findFirst({
        where: {
          userId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      return db.getActivePass(userId)
    }
  }

  // --- User Panel Methods (Phase 2) ---
  public async getUserDashboardData(userId: string) {
    const user = await this.findUserById(userId)
    if (!user) {
      throw new Error('USER_NOT_FOUND')
    }

    const availableCredits = await this.calculateCreditBalance(userId)
    const totalProjects = await prisma.generationJob.count({ where: { userId } })
    const totalConsultations = await prisma.lead.count({ where: { userId } })
    
    const activePass = user.passes && user.passes.length > 0 ? user.passes[0] : null

    const recentProjects = await prisma.generationJob.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    })

    const recentTransactions = await prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || undefined,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      metrics: {
        totalProjects,
        availableCredits,
        activePass: activePass
          ? {
              id: activePass.id,
              passType: activePass.passType,
              status: activePass.status,
              startsAt: activePass.startsAt.toISOString(),
              expiresAt: activePass.expiresAt.toISOString(),
              creditsGranted: activePass.creditsGranted,
            }
          : null,
        totalConsultations,
      },
      recentProjects,
      recentTransactions,
    }
  }

  public async getUserProjects(userId: string) {
    try {
      const rawJobs = await prisma.generationJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      // Group jobs by Project Title so that 2D floor plan and 3D elevation belong to the SAME project
      const projectMap = new Map<string, typeof rawJobs[0]>()

      for (const job of rawJobs) {
        const payload: any = job.inputPayload || {}
        const resPayload: any = job.resultPayload || {}
        const title = payload.title || resPayload.title || `Custom Project ${job.id}`

        if (!projectMap.has(title)) {
          projectMap.set(title, { ...job })
        } else {
          const existing = projectMap.get(title)!
          const existingPayload: any = existing.inputPayload || {}

          // Merge payloads so 2D layout + 3D elevation reside in 1 single project
          const mergedPayload = {
            ...existingPayload,
            ...payload,
            is3DUnlocked: Boolean(existingPayload.is3DUnlocked || payload.is3DUnlocked || job.jobType === 'THREE_D_GENERATION'),
            has3D: Boolean(existingPayload.has3D || payload.has3D || existingPayload.image || payload.image || job.jobType === 'THREE_D_GENERATION'),
            image: payload.image || existingPayload.image,
          }

          const isFullPackage =
            existing.jobType === 'THREE_D_GENERATION' ||
            job.jobType === 'THREE_D_GENERATION' ||
            existing.jobType === 'FULL_2D_3D_PLAN' ||
            mergedPayload.has3D

          projectMap.set(title, {
            ...existing,
            jobType: isFullPackage ? 'FULL_2D_3D_PLAN' : existing.jobType,
            inputPayload: mergedPayload,
            resultPayload: {
              ...((existing.resultPayload as any) || {}),
              ...(resPayload || {}),
            },
          })
        }
      }

      return Array.from(projectMap.values())
    } catch {
      // In-memory fallback
      return Array.from(db.generationJobs.values()).filter((j) => j.userId === userId)
    }
  }

  public async createUserProject(userId: string, data: {
    jobType?: string
    inputPayload: Record<string, unknown>
  }) {
    const title = (data.inputPayload.title as string) || 'Custom Floor Plan'

    try {
      // Look for existing project with same title to merge 2D & 3D into 1 single project
      const allUserJobs = await prisma.generationJob.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      })

      const existing = allUserJobs.find((j) => {
        const p: any = j.inputPayload || {}
        const r: any = j.resultPayload || {}
        return p.title === title || r.title === title
      })

      if (existing) {
        const existingPayload: any = existing.inputPayload || {}
        const is3D =
          data.jobType === 'THREE_D_GENERATION' ||
          Boolean(data.inputPayload.is3DUnlocked) ||
          Boolean(data.inputPayload.image)

        const mergedPayload = {
          ...existingPayload,
          ...data.inputPayload,
          is3DUnlocked: Boolean(existingPayload.is3DUnlocked || is3D),
          has3D: Boolean(existingPayload.has3D || is3D),
          image: data.inputPayload.image || existingPayload.image,
        }

        return await prisma.generationJob.update({
          where: { id: existing.id },
          data: {
            jobType: is3D || existing.jobType === 'THREE_D_GENERATION' ? 'FULL_2D_3D_PLAN' : existing.jobType,
            status: 'COMPLETED',
            inputPayload: JSON.parse(JSON.stringify(mergedPayload)),
            resultPayload: {
              ...((existing.resultPayload as any) || {}),
              title,
              plotSize: (data.inputPayload.plotSize as string) || existingPayload.plotSize || '30x50 ft',
              facing: (data.inputPayload.facing as string) || existingPayload.facing || 'East',
              bhk: (data.inputPayload.bhk as string) || existingPayload.bhk || '3 BHK',
            },
          },
        })
      }

      return await prisma.generationJob.create({
        data: {
          id: 'job_' + crypto.randomBytes(8).toString('hex'),
          userId,
          jobType: data.jobType || '2D_FLOOR_PLAN',
          status: 'COMPLETED',
          inputPayload: JSON.parse(JSON.stringify(data.inputPayload)),
          resultPayload: {
            title,
            plotSize: (data.inputPayload.plotSize as string) || '30x50 ft',
            facing: (data.inputPayload.facing as string) || 'East',
            bhk: (data.inputPayload.bhk as string) || '3 BHK',
          },
        },
      })
    } catch {
      // In-memory fallback
      const inMemJob: any = {
        id: 'job_' + crypto.randomBytes(8).toString('hex'),
        userId,
        jobType: data.jobType || '2D_FLOOR_PLAN',
        status: 'COMPLETED',
        inputPayload: data.inputPayload,
        resultPayload: {
          title,
          plotSize: (data.inputPayload.plotSize as string) || '30x50 ft',
          facing: (data.inputPayload.facing as string) || 'East',
          bhk: (data.inputPayload.bhk as string) || '3 BHK',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      db.generationJobs.set(inMemJob.id, inMemJob)
      return inMemJob
    }
  }

  public async getUserSessions(userId: string) {
    try {
      return await prisma.refreshSession.findMany({
        where: {
          userId,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      })
    } catch {
      const memSessions = db.getUserSessions(userId)
      return memSessions.map((s: any) => ({
        id: s.id,
        userId: s.userId,
        familyId: s.familyId,
        tokenHash: s.tokenHash,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        isRevoked: s.isRevoked,
        expiresAt: new Date(s.expiresAt),
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
      }))
    }
  }

  public async revokeUserSession(userId: string, sessionId: string) {
    const session = await prisma.refreshSession.findUnique({
      where: { id: sessionId },
    })
    if (!session || session.userId !== userId) {
      throw new Error('SESSION_NOT_FOUND_OR_UNAUTHORIZED')
    }

    return await prisma.refreshSession.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    })
  }

  public async revokeAllOtherSessions(userId: string, currentSessionId: string) {
    return await prisma.refreshSession.updateMany({
      where: {
        userId,
        id: { not: currentSessionId },
        isRevoked: false,
      },
      data: { isRevoked: true },
    })
  }

  public async updateUserProfile(userId: string, data: { name?: string; phone?: string; email?: string }) {
    const cleanPhone = data.phone !== undefined ? (data.phone ? data.phone.trim() : null) : undefined
    const cleanEmail = data.email !== undefined ? (data.email ? data.email.trim().toLowerCase() : undefined) : undefined

    if (cleanPhone) {
      try {
        const existing = await prisma.user.findFirst({
          where: {
            phone: cleanPhone,
            id: { not: userId },
          },
        })
        if (existing) {
          throw new Error('PHONE_EXISTS')
        }
      } catch (err: any) {
        if (err.message === 'PHONE_EXISTS') throw err
      }
    }

    if (cleanEmail) {
      try {
        const existingEmail = await prisma.user.findFirst({
          where: {
            email: cleanEmail,
            id: { not: userId },
          },
        })
        if (existingEmail) {
          throw new Error('EMAIL_EXISTS')
        }
      } catch (err: any) {
        if (err.message === 'EMAIL_EXISTS') throw err
      }
    }

    try {
      return await prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name ? data.name.trim() : undefined,
          email: cleanEmail,
          phone: cleanPhone,
          isPhoneVerified: cleanPhone !== undefined ? false : undefined,
        },
      })
    } catch {
      // In-memory test mirror
      const storeUser = db.findUserById(userId)
      if (storeUser) {
        if (data.name) storeUser.name = data.name.trim()
        if (cleanEmail) storeUser.email = cleanEmail
        if (data.phone !== undefined) storeUser.phone = cleanPhone || undefined
        return storeUser as any
      }
      throw new Error('USER_NOT_FOUND')
    }
  }

  public async changeUserPassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const storeUser = db.findUserById(userId)

    const hashToCompare = user?.passwordHash || storeUser?.passwordHash
    if (!hashToCompare) {
      throw new Error('USER_NOT_FOUND')
    }

    const isMatch = await bcrypt.compare(currentPassword, hashToCompare)
    if (!isMatch) {
      throw new Error('INVALID_CURRENT_PASSWORD')
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    if (storeUser) {
      storeUser.passwordHash = newHash
    }

    if (user) {
      return await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      })
    }
    return storeUser
  }

  public async getUserConsultations(userId: string) {
    return await prisma.lead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export const prismaDb = new PrismaDatabaseService()

