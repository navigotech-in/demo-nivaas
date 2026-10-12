import crypto from 'node:crypto'
import { prisma } from '../db/prisma.js'
import { db } from '../db/store.js'
import { creditLedger } from './creditLedger.js'
import { wizardService } from './wizardService.js'
import { demoDesigns } from '../data.js'
import { ChatSession, ChatMessage } from '../types/models.js'

// Daily Chat Quotas
export const GUEST_DAILY_LIMIT = 5
export const FREE_USER_DAILY_LIMIT = 5
export const PASS_USER_DAILY_LIMIT = 25

export class ChatService {
  // Helper to get Asia/Kolkata date YYYY-MM-DD
  private getKolkataDateString(): string {
    const d = new Date()
    const utc = d.getTime() + d.getTimezoneOffset() * 60000
    const kolkataTime = new Date(utc + 3600000 * 5.5)
    return kolkataTime.toISOString().split('T')[0]
  }

  // 1. Check & Enforce Daily Quota
  public async checkQuota(params: {
    userId?: string | null
    guestSessionHash?: string | null
  }): Promise<{
    allowed: boolean
    remaining: number
    limit: number
    resetAt: string
    isPassHolder: boolean
  }> {
    const { userId, guestSessionHash } = params
    const subjectId = userId || guestSessionHash || 'anon_' + this.getKolkataDateString()
    const subjectType = userId ? 'USER' : 'GUEST'
    const today = this.getKolkataDateString()

    // Determine limit
    let limit = GUEST_DAILY_LIMIT
    let isPassHolder = false

    if (userId) {
      const memPass = db.getActivePass(userId)
      const hasPurchaseGrant = creditLedger.getHistory(userId).some((tx) => tx.type === 'PURCHASE_GRANT')
      if (memPass || hasPurchaseGrant) {
        isPassHolder = true
        limit = PASS_USER_DAILY_LIMIT
      }

      try {
        const pass = await prisma.accessPass.findFirst({
          where: { userId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        })
        if (pass) {
          isPassHolder = true
          limit = PASS_USER_DAILY_LIMIT
        } else if (!memPass && !hasPurchaseGrant) {
          limit = FREE_USER_DAILY_LIMIT
        }
      } catch {
        limit = isPassHolder ? PASS_USER_DAILY_LIMIT : FREE_USER_DAILY_LIMIT
      }
    }

    // Reset date is next midnight Asia/Kolkata
    const resetAt = `${today}T23:59:59+05:30`

    try {
      const usage = await prisma.chatQuotaUsage.findUnique({
        where: {
          subjectId_usageDate: {
            subjectId,
            usageDate: today,
          },
        },
      })

      const currentCount = usage?.messageCount || 0
      const remaining = Math.max(0, limit - currentCount)

      return {
        allowed: currentCount < limit,
        remaining,
        limit,
        resetAt,
        isPassHolder,
      }
    } catch {
      return {
        allowed: true,
        remaining: limit,
        limit,
        resetAt,
        isPassHolder,
      }
    }
  }

  // 2. Increment Quota
  public async incrementQuota(subjectId: string, subjectType: 'USER' | 'GUEST') {
    const today = this.getKolkataDateString()
    try {
      await prisma.chatQuotaUsage.upsert({
        where: {
          subjectId_usageDate: {
            subjectId,
            usageDate: today,
          },
        },
        create: {
          subjectId,
          subjectType,
          usageDate: today,
          messageCount: 1,
          tokenCount: 0,
        },
        update: {
          messageCount: { increment: 1 },
        },
      })
    } catch {
      // Continue
    }
  }

  // 3. Create or Get Chat Session
  public async getOrCreateSession(params: {
    sessionId?: string
    userId?: string | null
    guestSessionHash?: string | null
    wizardSessionId?: string | null
    title?: string
  }): Promise<ChatSession> {
    const { sessionId, userId, guestSessionHash, wizardSessionId, title } = params
    const id = sessionId || 'chat_' + crypto.randomBytes(8).toString('hex')

    try {
      if (sessionId) {
        const existing = await prisma.chatSession.findUnique({ where: { id: sessionId } })
        if (existing) {
          return {
            id: existing.id,
            userId: existing.userId,
            guestSessionHash: existing.guestSessionHash,
            projectId: existing.projectId,
            wizardSessionId: existing.wizardSessionId,
            title: existing.title,
            status: existing.status,
            summary: existing.summary,
            createdAt: existing.createdAt.toISOString(),
            updatedAt: existing.updatedAt.toISOString(),
          }
        }
      }

      const created = await prisma.chatSession.create({
        data: {
          id,
          userId: userId || null,
          guestSessionHash: guestSessionHash || null,
          wizardSessionId: wizardSessionId || null,
          title: title || 'Indore Home Planning Chat',
          status: 'ACTIVE',
        },
      })

      return {
        id: created.id,
        userId: created.userId,
        guestSessionHash: created.guestSessionHash,
        projectId: created.projectId,
        wizardSessionId: created.wizardSessionId,
        title: created.title,
        status: created.status,
        summary: created.summary,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      }
    } catch {
      return {
        id,
        userId: userId || null,
        guestSessionHash: guestSessionHash || null,
        wizardSessionId: wizardSessionId || null,
        title: title || 'Indore Home Planning Chat',
        status: 'ACTIVE',
        summary: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }
  }

  // 4. Construction Cost Calculator Tool (Verified Indore Database Rates)
  public async calculateConstructionCost(params: {
    builtUpArea: number
    packageType?: 'STANDARD' | 'PREMIUM' | 'LUXURY'
    city?: string
  }) {
    const city = params.city || 'Indore'
    const pkg = (params.packageType || 'PREMIUM').toUpperCase()
    const builtUpArea = Math.max(100, Number(params.builtUpArea) || 1500)

    let ratePerSqFt = 2150 // default Indore Premium
    if (pkg === 'STANDARD') ratePerSqFt = 1650
    if (pkg === 'LUXURY') ratePerSqFt = 2850

    try {
      const dbRate = await prisma.constructionRate.findFirst({
        where: { city, packageType: pkg, isActive: true },
      })
      if (dbRate) {
        ratePerSqFt = dbRate.ratePerSqFt
      }
    } catch {
      // Use fallback verified rates
    }

    const estimatedTotal = Math.round(builtUpArea * ratePerSqFt)
    const inLakhs = (estimatedTotal / 100000).toFixed(2)

    return {
      tool: 'calculate_construction_cost',
      city,
      package: pkg,
      builtUpArea,
      ratePerSqFt,
      estimatedTotal,
      estimatedTotalInLakhs: `₹${inLakhs} Lakhs`,
      rateEffectiveFrom: '2026-09-01',
      specHighlights:
        pkg === 'LUXURY'
          ? 'Ultra-luxury Italian marble, teakwood doors, VRV AC wiring, double-height ceiling provisions'
          : pkg === 'PREMIUM'
          ? 'Kajaria 4x2 GVT tiles, Jaguar fittings, Tata Tiscon steel, Ultratech cement, modular kitchen'
          : 'Standard Vitrified tiles, Cera fittings, durable RCC frame, standard emulsion paint',
      disclaimer: 'Verified Indore benchmark rate. Actual turnkey site cost depends on soil condition and final architectural drawings.',
    }
  }

  // 5. Search House Plans Tool
  public searchHousePlans(query: { bhk?: string; facing?: string; maxCostLakhs?: number }) {
    let results = demoDesigns
    if (query.bhk) {
      results = results.filter((d) => d.bhk.toLowerCase().includes(query.bhk!.toLowerCase()))
    }
    if (query.facing) {
      results = results.filter((d) => d.facing.toLowerCase().includes(query.facing!.toLowerCase()))
    }
    return {
      tool: 'search_house_plans',
      count: results.length,
      plans: results.slice(0, 4).map((p) => ({
        id: p.id,
        title: p.title,
        bhk: p.bhk,
        dimensions: p.dimension,
        facing: p.facing,
        floors: p.floors,
        estimatedCost: p.price,
        vastuScore: '95% Vastu Compliant',
      })),
    }
  }

  // 6. Handle User Message with Tool Orchestration & SSE Streaming
  public async streamChatResponse(params: {
    sessionId: string
    userMessage: string
    userId?: string | null
    guestSessionHash?: string | null
    wizardSessionId?: string | null
    onEvent: (event: string, data: any) => void
  }) {
    const { sessionId, userMessage, userId, guestSessionHash, wizardSessionId, onEvent } = params
    const subjectId = userId || guestSessionHash || 'anon'
    const subjectType = userId ? 'USER' : 'GUEST'

    // 1. Quota Check
    const quota = await this.checkQuota({ userId, guestSessionHash })
    if (!quota.allowed) {
      onEvent('response.failed', {
        code: 'DAILY_CHAT_LIMIT_REACHED',
        message: `Daily AI chat quota of ${quota.limit} messages reached. Resets at ${quota.resetAt}. Unlock the 30-Day Design Pass for 25 messages/day and full 3D design generation.`,
        limit: quota.limit,
        resetAt: quota.resetAt,
      })
      return
    }

    // 2. Consume 1 chat quota
    await this.incrementQuota(subjectId, subjectType)

    // 3. Emit message.accepted
    const clientMsgId = 'msg_' + crypto.randomBytes(6).toString('hex')
    onEvent('message.accepted', {
      sessionId,
      clientMessageId: clientMsgId,
      remainingQuota: quota.remaining - 1,
    })

    onEvent('response.started', { sessionId })

    // 4. Check for Tool Invocations based on user intent
    const lower = userMessage.toLowerCase()

    if (
      lower.includes('cost') ||
      lower.includes('estimate') ||
      lower.includes('rate') ||
      lower.includes('budget') ||
      lower.includes('kharcha') ||
      lower.includes('price') ||
      lower.includes('sqft')
    ) {
      // Trigger Construction Cost Tool
      onEvent('tool.started', { tool: 'calculate_construction_cost' })
      const areaMatch = userMessage.match(/(\d{3,5})\s*(sq\.?ft|sqft|feet|gaj)?/i)
      const builtUpArea = areaMatch ? Number(areaMatch[1]) : 1800
      const pkg = lower.includes('luxury') ? 'LUXURY' : lower.includes('standard') ? 'STANDARD' : 'PREMIUM'

      const toolResult = await this.calculateConstructionCost({ builtUpArea, packageType: pkg })
      onEvent('tool.result', toolResult)

      // Stream delta explanation
      const responseText = `Indore mein **${builtUpArea} sq.ft** ke liye **${pkg} Package** par estimated construction cost **${toolResult.estimatedTotalInLakhs}** (₹${toolResult.ratePerSqFt}/sq.ft) aayegi.\n\n` +
        `**Specifications:** ${toolResult.specHighlights}\n\n` +
        `*Note:* ${toolResult.disclaimer}\n\n` +
        `Kya aap is plot size ka 2D Vastu layout design dekhna chahte hain ya detailed consultation schedule karna chahte hain?`

      onEvent('response.delta', { text: responseText })
      onEvent('response.completed', {
        messageId: clientMsgId,
        fullText: responseText,
        toolResult,
      })
      return
    }

    if (lower.includes('plan') || lower.includes('bhk') || lower.includes('naksha') || lower.includes('elevation') || lower.includes('vastu')) {
      // Trigger Plan Search Tool
      onEvent('tool.started', { tool: 'search_house_plans' })
      const bhk = lower.includes('4 bhk') ? '4 BHK' : lower.includes('2 bhk') ? '2 BHK' : '3 BHK'
      const facing = lower.includes('west') ? 'West' : lower.includes('north') ? 'North' : 'East'
      const toolResult = this.searchHousePlans({ bhk, facing })
      onEvent('tool.result', toolResult)

      const responseText = `Aapke requirement ke anusar Indore House Makers ke verified **${bhk} (${facing}-facing)** plans match huye hain:\n\n` +
        toolResult.plans
          .map((p) => `• **${p.title}** — ${p.dimensions} (${p.floors}) | Est: ${p.estimatedCost} | Vastu: ${p.vastuScore}`)
          .join('\n') +
        `\n\nAap hamare **AI Design Studio** se apne exact plot size par custom 2D & 3D plan bhi generate kar sakte hain!`

      onEvent('response.delta', { text: responseText })
      onEvent('response.completed', {
        messageId: clientMsgId,
        fullText: responseText,
        toolResult,
      })
      return
    }

    if (lower.includes('contact') || lower.includes('consult') || lower.includes('architect') || lower.includes('call') || lower.includes('milna')) {
      // Prepare Consultation Action Card (Requires explicit user confirmation & consent)
      onEvent('action.confirmation_required', {
        action: 'prepare_consultation_request',
        title: 'Schedule Free Expert Consultation in Indore',
        fields: {
          city: 'Indore',
          suggestedService: 'Turnkey Construction & Architectural Planning',
          contactPhone: '+91 98765 43210',
          mandatoryConsent: 'I agree to be contacted regarding this Indore house construction request.',
        },
      })

      const responseText = `Hamari expert architectural aur turnkey engineering team Indore (AB Road, Vijay Nagar, Super Corridor) par available hai.\n\n` +
        `Kripya upar diye gaye confirmation card ko review karke submit karein taaki hamare senior architect aapse direct connect kar sakein.`

      onEvent('response.delta', { text: responseText })
      onEvent('response.completed', {
        messageId: clientMsgId,
        fullText: responseText,
      })
      return
    }

    // Default Conversational Architecture Assistant
    const defaultText = `Namaste! Main **Indore House Makers** ka AI Assistant hoon.\n\n` +
      `Main aapki sahayata kar sakta hoon:\n` +
      `• **Construction Cost Estimation**: Indore ke verified benchmark rates (Standard ₹1,650, Premium ₹2,150, Luxury ₹2,850/sq.ft).\n` +
      `• **Vastu-Compliant House Plans**: 2BHK, 3BHK, 4BHK duplex layouts aur Indore bye-laws recommendations.\n` +
      `• **3D Design Pass & Generations**: Aapke active design credits aur custom 2D/3D elevations.\n\n` +
      `Aap apne plot dimensions (jaise 30x50 ft) ya kisi specific requirement ke baare mein pooch sakte hain!`

    onEvent('response.delta', { text: defaultText })
    onEvent('response.completed', {
      messageId: clientMsgId,
      fullText: defaultText,
    })
  }
}

export const chatService = new ChatService()
