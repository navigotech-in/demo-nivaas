import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../db/store.js'
import { requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()

// All admin routes require Authentication + ADMIN role
router.use(requireAuth, requireRole('ADMIN'))

// 1. Overview Metrics (No fake/hardcoded numbers)
router.get('/overview', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const users = Array.from(db.users.values())
    const totalUsers = users.length
    const totalAdmins = users.filter((u) => u.role === 'ADMIN').length
    const totalCustomers = users.filter((u) => u.role === 'USER').length

    const passes = Array.from(db.accessPasses.values())
    const activePasses = passes.filter(
      (p) => p.status === 'ACTIVE' && new Date(p.expiresAt) > new Date()
    ).length

    const leads = Array.from(db.leads.values())
    const leadsByStatus = {
      NEW: leads.filter((l) => l.status === 'NEW').length,
      CONTACTED: leads.filter((l) => l.status === 'CONTACTED').length,
      QUALIFIED: leads.filter((l) => l.status === 'QUALIFIED').length,
      CONVERTED: leads.filter((l) => l.status === 'CONVERTED').length,
      CLOSED: leads.filter((l) => l.status === 'CLOSED').length,
      total: leads.length,
    }

    const sessions = Array.from(db.sessions.values())
    const activeSessions = sessions.filter(
      (s) => !s.isRevoked && new Date(s.expiresAt) > new Date()
    ).length

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalCustomers,
          totalAdmins,
          activePasses,
          activeSessions,
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

// 2. User Management List
router.get('/users', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    const users = Array.from(db.users.values()).map((u) => db.getUserSummary(u))
    res.json({
      success: true,
      data: users,
      meta: { total: users.length },
    })
  } catch (err) {
    next(err)
  }
})

// 3. Audit Logs View
router.get('/audit-logs', (req: Request, res: Response, next: NextFunction): void => {
  try {
    const limit = Number(req.query.limit || 50)
    const logs = db.auditLogs.slice(0, limit)
    res.json({
      success: true,
      data: logs,
      meta: { total: db.auditLogs.length, limit },
    })
  } catch (err) {
    next(err)
  }
})

export default router
