import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../db/store.js'
import { prisma } from '../db/prisma.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { z } from 'zod'

const router = Router()

// All admin routes require Authentication + ADMIN role
router.use(requireAuth, requireRole('ADMIN'))

// 1. Overview Metrics (Real PostgreSQL + fallback)
router.get('/overview', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dbUsers = Array.from(db.users.values())
    let totalUsers = dbUsers.length
    let totalAdmins = dbUsers.filter((u) => u.role === 'ADMIN').length
    let totalCustomers = dbUsers.filter((u) => u.role === 'USER').length

    const dbPasses = Array.from(db.accessPasses.values())
    let activePasses = dbPasses.filter(
      (p) => p.status === 'ACTIVE' && new Date(p.expiresAt) > new Date()
    ).length

    const dbSessions = Array.from(db.sessions.values())
    let activeSessions = dbSessions.filter(
      (s) => !s.isRevoked && new Date(s.expiresAt) > new Date()
    ).length

    let totalJobs = 0
    let totalCreditsIssued = 0
    const dbLeads = Array.from(db.leads.values())
    let leadsByStatus = {
      NEW: dbLeads.filter((l) => l.status === 'NEW').length,
      CONTACTED: dbLeads.filter((l) => l.status === 'CONTACTED').length,
      QUALIFIED: dbLeads.filter((l) => l.status === 'QUALIFIED').length,
      CONVERTED: dbLeads.filter((l) => l.status === 'CONVERTED').length,
      CLOSED: dbLeads.filter((l) => l.status === 'CLOSED').length,
      total: dbLeads.length,
    }

    try {
      const pUsers = await prisma.user.count()
      const pAdmins = await prisma.user.count({ where: { role: 'ADMIN' } })
      const pCustomers = await prisma.user.count({ where: { role: 'USER' } })
      totalUsers = Math.max(totalUsers, pUsers)
      totalAdmins = Math.max(totalAdmins, pAdmins)
      totalCustomers = Math.max(totalCustomers, pCustomers)

      const pPasses = await prisma.accessPass.count({
        where: {
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
      })
      activePasses = Math.max(activePasses, pPasses)

      const pSessions = await prisma.refreshSession.count({
        where: {
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      })
      activeSessions = Math.max(activeSessions, pSessions)

      totalJobs = await prisma.generationJob.count()

      const grantSum = await prisma.creditTransaction.aggregate({
        where: { type: 'GRANT' },
        _sum: { amount: true },
      })
      totalCreditsIssued = grantSum._sum.amount || 0

      const allLeads = await prisma.lead.findMany()
      if (allLeads.length > 0) {
        leadsByStatus = {
          NEW: allLeads.filter((l) => l.status === 'NEW').length,
          CONTACTED: allLeads.filter((l) => l.status === 'CONTACTED').length,
          QUALIFIED: allLeads.filter((l) => l.status === 'QUALIFIED').length,
          CONVERTED: allLeads.filter((l) => l.status === 'CONVERTED').length,
          CLOSED: allLeads.filter((l) => l.status === 'CLOSED').length,
          total: allLeads.length,
        }
      }
    } catch {
      // ignore
    }

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalCustomers,
          totalAdmins,
          activePasses,
          activeSessions,
          totalJobs,
          totalCreditsIssued,
          leads: leadsByStatus,
        },
        systemStatus: {
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          environment: process.env.NODE_ENV || 'development',
        },
      },
    })
  } catch (err) {
    next(err)
  }
})

// 2. User Management Directory (Lists all users with live credit balance, active sessions, and pass)
router.get('/users', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const search = typeof req.query.search === 'string' ? req.query.search.trim().toLowerCase() : ''
    
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          sessions: {
            where: { isRevoked: false, expiresAt: { gt: new Date() } },
          },
          passes: {
            where: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
            orderBy: { expiresAt: 'desc' },
            take: 1,
          },
          creditLedger: true,
        },
      })

      const userSummaries = users
        .map((u) => {
          const balance = u.creditLedger.reduce((sum, tx) => sum + tx.amount, 0)
          const activePass = u.passes[0] || null
          return {
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || null,
            role: u.role,
            isEmailVerified: u.isEmailVerified,
            isPhoneVerified: u.isPhoneVerified,
            createdAt: u.createdAt,
            creditBalance: balance,
            activeSessionsCount: u.sessions.length,
            activePass: activePass
              ? {
                  type: activePass.type,
                  status: activePass.status,
                  expiresAt: activePass.expiresAt,
                }
              : null,
          }
        })
        .filter((u) => {
          if (!search) return true
          return (
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            (u.phone && u.phone.includes(search))
          )
        })

      res.json({
        success: true,
        data: userSummaries,
        meta: { total: userSummaries.length },
      })
      return
    } catch {
      // Fallback
      let users = Array.from(db.users.values()).map((u) => {
        const balance = db.calculateUserBalance(u.id)
        const userPasses = Array.from(db.accessPasses.values()).filter(
          (p) => p.userId === u.id && p.status === 'ACTIVE' && new Date(p.expiresAt) > new Date()
        )
        const userSessions = Array.from(db.sessions.values()).filter(
          (s) => s.userId === u.id && !s.isRevoked && new Date(s.expiresAt) > new Date()
        )
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone || null,
          role: u.role,
          isEmailVerified: u.isEmailVerified,
          isPhoneVerified: u.isPhoneVerified,
          createdAt: u.createdAt,
          creditBalance: balance,
          activeSessionsCount: userSessions.length,
          activePass: userPasses[0] || null,
        }
      })

      if (search) {
        users = users.filter(
          (u) =>
            u.name.toLowerCase().includes(search) ||
            u.email.toLowerCase().includes(search) ||
            (u.phone && u.phone.includes(search))
        )
      }

      res.json({
        success: true,
        data: users,
        meta: { total: users.length },
      })
    }
  } catch (err) {
    next(err)
  }
})

// 3. Grant/Adjust User Credits
const grantCreditsSchema = z.object({
  amount: z.number().int().min(1, 'Amount must be at least 1 credit').max(10000, 'Max 10,000 credits at once'),
  reason: z.string().min(3, 'Reason must be at least 3 characters'),
})

router.post('/users/:id/credits', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: targetUserId } = req.params
    const body = grantCreditsSchema.parse(req.body)

    let updatedBalance = 0

    try {
      const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
      if (!targetUser) {
        res.status(404).json({ success: false, error: 'USER_NOT_FOUND', message: 'User does not exist.' })
        return
      }

      await prisma.creditTransaction.create({
        data: {
          userId: targetUserId,
          type: 'GRANT',
          amount: body.amount,
          idempotencyKey: `admin_grant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        },
      })

      const agg = await prisma.creditTransaction.aggregate({
        where: { userId: targetUserId },
        _sum: { amount: true },
      })
      updatedBalance = agg._sum.amount || 0
    } catch {
      const targetUser = db.getUserById(targetUserId)
      if (!targetUser) {
        res.status(404).json({ success: false, error: 'USER_NOT_FOUND', message: 'User does not exist.' })
        return
      }
      db.createCreditTransaction({
        userId: targetUserId,
        type: 'GRANT',
        amount: body.amount,
        idempotencyKey: `admin_grant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      })
      updatedBalance = db.calculateUserBalance(targetUserId)
    }

    res.json({
      success: true,
      message: `Successfully granted ${body.amount} credits to user.`,
      data: {
        userId: targetUserId,
        creditsAdded: body.amount,
        newBalance: updatedBalance,
        reason: body.reason,
      },
    })
  } catch (err) {
    next(err)
  }
})

// 4. Leads & Consultations Management
router.get('/leads', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    try {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      })
      res.json({
        success: true,
        data: leads,
        meta: { total: leads.length },
      })
      return
    } catch {
      const leads = Array.from(db.leads.values())
      res.json({
        success: true,
        data: leads,
        meta: { total: leads.length },
      })
    }
  } catch (err) {
    next(err)
  }
})

const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']),
  notes: z.string().optional(),
})

router.patch('/leads/:id/status', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const body = updateLeadStatusSchema.parse(req.body)

    try {
      const lead = await prisma.lead.update({
        where: { id },
        data: {
          status: body.status,
        },
      })
      res.json({
        success: true,
        message: 'Lead status updated successfully.',
        data: lead,
      })
      return
    } catch {
      const lead = db.leads.get(id)
      if (!lead) {
        res.status(404).json({ success: false, error: 'LEAD_NOT_FOUND', message: 'Lead not found.' })
        return
      }
      lead.status = body.status
      db.leads.set(id, lead)
      res.json({
        success: true,
        message: 'Lead status updated successfully.',
        data: lead,
      })
    }
  } catch (err) {
    next(err)
  }
})

// 5. System Audit Logs
router.get('/audit-logs', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Number(req.query.limit || 50)
    try {
      const txs = await prisma.creditTransaction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true, phone: true },
          },
        },
      })
      res.json({
        success: true,
        data: txs,
        meta: { total: txs.length, limit },
      })
      return
    } catch {
      const logs = db.auditLogs.slice(0, limit)
      res.json({
        success: true,
        data: logs,
        meta: { total: db.auditLogs.length, limit },
      })
    }
  } catch (err) {
    next(err)
  }
})

export default router
