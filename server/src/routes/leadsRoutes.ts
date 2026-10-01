import crypto from 'node:crypto'
import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { db } from '../db/store.js'
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js'
import { Lead, LeadStatus } from '../types/models.js'

const router = Router()

const leadSubmissionSchema = z.object({
  type: z
    .enum(['DESIGN_CUSTOMIZATION', 'SERVICE_ENQUIRY', 'CONSULTATION', 'WIZARD_SUBMISSION'])
    .default('CONSULTATION'),
  name: z.string().min(2, 'Name is required').max(120),
  phone: z.string().min(10, 'Valid 10-digit phone number is required').max(20),
  email: z.string().email().optional(),
  city: z.string().max(120).optional().default('Indore'),
  plotSize: z.string().max(100).optional(),
  budgetRange: z.string().max(100).optional(),
  timeline: z.string().max(100).optional(),
  requirement: z.string().max(120).optional().default(''),
  message: z.string().max(2000).optional().default(''),
  wizardData: z.record(z.unknown()).optional(),
  consentGiven: z.boolean().default(true),
})

// Public / Authenticated lead submission
router.post(
  '/',
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = leadSubmissionSchema.parse(req.body)
      const userId = req.user?.sub

      const leadId = 'lead_' + crypto.randomBytes(8).toString('hex')
      const newLead: Lead = {
        id: leadId,
        userId,
        type: validated.type,
        name: validated.name.trim(),
        phone: validated.phone.trim(),
        email: validated.email?.trim(),
        city: validated.city?.trim() || 'Indore',
        plotSize: validated.plotSize?.trim(),
        budgetRange: validated.budgetRange?.trim(),
        timeline: validated.timeline?.trim(),
        requirement: validated.requirement?.trim(),
        message: validated.message?.trim(),
        wizardData: validated.wizardData,
        status: 'NEW',
        consentGiven: validated.consentGiven,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      db.leads.set(leadId, newLead)

      db.logAudit({
        actorId: userId,
        actorRole: req.user?.role || 'ANONYMOUS',
        action: 'lead.create',
        entityType: 'Lead',
        entityId: leadId,
        ipAddress: req.ip,
        metadata: { type: validated.type, city: newLead.city },
      })

      res.status(201).json({
        success: true,
        data: {
          id: newLead.id,
          status: newLead.status,
          message: 'Enquiry submitted successfully. Our team will contact you shortly.',
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// Admin: List Leads with Real Filters
router.get(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const statusFilter = req.query.status as LeadStatus | undefined
      const cityFilter = req.query.city as string | undefined
      const search = (req.query.search as string | undefined)?.toLowerCase()

      let list = Array.from(db.leads.values())

      if (statusFilter) {
        list = list.filter((l) => l.status === statusFilter)
      }
      if (cityFilter) {
        list = list.filter((l) => l.city?.toLowerCase().includes(cityFilter.toLowerCase()))
      }
      if (search) {
        list = list.filter(
          (l) =>
            l.name.toLowerCase().includes(search) ||
            l.phone.includes(search) ||
            (l.email && l.email.toLowerCase().includes(search))
        )
      }

      // Sort descending by createdAt
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      res.json({
        success: true,
        data: list,
        meta: {
          total: list.length,
          stages: ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED'],
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

// Admin: Update Lead Status & Notes
const updateLeadStatusSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED']),
  notes: z.string().max(2000).optional(),
})

router.patch(
  '/:id/status',
  requireAuth,
  requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params
      const validated = updateLeadStatusSchema.parse(req.body)

      const lead = db.leads.get(id)
      if (!lead) {
        res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Lead not found.' },
        })
        return
      }

      lead.status = validated.status
      if (validated.notes !== undefined) {
        lead.notes = validated.notes
      }
      lead.updatedAt = new Date().toISOString()
      db.leads.set(id, lead)

      db.logAudit({
        actorId: req.user!.sub,
        actorRole: req.user!.role,
        action: 'lead.update_status',
        entityType: 'Lead',
        entityId: id,
        metadata: { status: validated.status, notes: validated.notes },
      })

      res.json({
        success: true,
        data: lead,
      })
    } catch (err) {
      next(err)
    }
  }
)

export default router
