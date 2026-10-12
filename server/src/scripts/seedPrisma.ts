import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'

const prisma = new PrismaClient()

async function seedComprehensiveDatabase() {
  console.log('[Seed] Starting rich data seeding into Supabase PostgreSQL...')

  // 1. PRODUCTS
  const passProduct = await prisma.product.upsert({
    where: { code: 'DESIGN_PASS_299' },
    update: {
      name: '30-Day Design Pass (5 AI Credits)',
      description: 'Full access to AI Planner & Design Desk with 5 high-definition export credits valid for 30 days.',
      priceInr: 299,
      priceInPaise: 29900,
      currency: 'INR',
      creditType: 'THREE_D_GENERATION',
      creditsGranted: 5,
      durationDays: 30,
      isActive: true,
    },
    create: {
      id: 'prod_design_pass_299',
      name: '30-Day Design Pass (5 AI Credits)',
      code: 'DESIGN_PASS_299',
      description: 'Full access to AI Planner & Design Desk with 5 high-definition export credits valid for 30 days.',
      priceInr: 299,
      priceInPaise: 29900,
      currency: 'INR',
      creditType: 'THREE_D_GENERATION',
      creditsGranted: 5,
      durationDays: 30,
      isActive: true,
    },
  })
  console.log('✅ Product: DESIGN_PASS_299 seeded')

  // 2. INDORE CONSTRUCTION RATES
  const rates = [
    {
      city: 'Indore',
      packageType: 'STANDARD',
      ratePerSqFt: 1650,
      sourceNote: 'Indore Municipal Area Benchmark (Structure + Standard Vitrified + Essential Electrical/Sanitary)',
      isActive: true,
    },
    {
      city: 'Indore',
      packageType: 'PREMIUM',
      ratePerSqFt: 2150,
      sourceNote: 'Indore Premium Residential Benchmark (Branded Jaquar/Kohler, Modular Kitchen, Texture Elevation)',
      isActive: true,
    },
    {
      city: 'Indore',
      packageType: 'LUXURY',
      ratePerSqFt: 2850,
      sourceNote: 'Indore Luxury Architecture Benchmark (Italian Marble, Home Automation, Double-Height Elevation)',
      isActive: true,
    },
  ]

  for (const r of rates) {
    const existing = await prisma.constructionRate.findFirst({
      where: { city: r.city, packageType: r.packageType },
    })
    if (!existing) {
      await prisma.constructionRate.create({ data: r })
    } else {
      await prisma.constructionRate.update({ where: { id: existing.id }, data: r })
    }
  }
  console.log('✅ Construction Rates in sync')

  // 3. USERS (Admin + Multiple Realistic Clients)
  const defaultPasswordHash = await bcrypt.hash('User@123', 10)
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10)

  const usersData = [
    {
      id: 'usr_admin_001',
      email: 'admin@ihm.com',
      name: 'IHM Administrator',
      phone: '+919876543210',
      passwordHash: adminPasswordHash,
      role: 'ADMIN' as const,
    },
    {
      id: 'usr_rohit_002',
      email: 'user@indorehousemakers.in',
      name: 'Rohit Sharma',
      phone: '+919826012345',
      passwordHash: defaultPasswordHash,
      role: 'USER' as const,
    },
    {
      id: 'usr_priya_003',
      email: 'priya.verma@indorehomes.in',
      name: 'Priya Verma',
      phone: '+919876543211',
      passwordHash: defaultPasswordHash,
      role: 'USER' as const,
    },
    {
      id: 'usr_vikram_004',
      email: 'vikram.singh@gmail.com',
      name: 'Vikramaditya Singh',
      phone: '+919425098765',
      passwordHash: defaultPasswordHash,
      role: 'USER' as const,
    },
    {
      id: 'usr_anjali_005',
      email: 'anjali.patel@outlook.com',
      name: 'Anjali Patel',
      phone: '+919893011223',
      passwordHash: defaultPasswordHash,
      role: 'USER' as const,
    },
    {
      id: 'usr_demo_006',
      email: 'user@example.com',
      name: 'Demo Client',
      phone: '+919111222333',
      passwordHash: defaultPasswordHash,
      role: 'USER' as const,
    },
  ]

  const seededUsers: Record<string, any> = {}

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, phone: u.phone, role: u.role },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        phone: u.phone,
        passwordHash: u.passwordHash,
        role: u.role,
        isEmailVerified: true,
        isPhoneVerified: true,
      },
    })
    seededUsers[u.email] = user

    // Ensure Free Preview entitlement
    if (u.role === 'USER') {
      await prisma.freePreviewEntitlement.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          status: 'AVAILABLE',
        },
      })
    }
  }
  console.log(`✅ ${usersData.length} Users seeded (Admins & Clients)`)

  // 4. PURCHASES, PAYMENTS & ACTIVE DESIGN PASSES
  const passHolders = [
    {
      user: seededUsers['user@indorehousemakers.in'],
      orderId: 'order_ihm_live_901',
      payId: 'pay_rzp_mock_901',
      amount: 299,
      credits: 5,
    },
    {
      user: seededUsers['vikram.singh@gmail.com'],
      orderId: 'order_ihm_live_902',
      payId: 'pay_rzp_mock_902',
      amount: 299,
      credits: 5,
    },
    {
      user: seededUsers['anjali.patel@outlook.com'],
      orderId: 'order_ihm_live_903',
      payId: 'pay_rzp_mock_903',
      amount: 299,
      credits: 5,
    },
  ]

  for (const ph of passHolders) {
    const existingPurchase = await prisma.purchase.findFirst({
      where: { userId: ph.user.id, status: 'COMPLETED' },
    })

    if (!existingPurchase) {
      const purchId = 'purch_' + crypto.randomBytes(6).toString('hex')
      const passId = 'pass_' + crypto.randomBytes(6).toString('hex')
      const now = new Date()
      const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

      const purchase = await prisma.purchase.create({
        data: {
          id: purchId,
          userId: ph.user.id,
          productId: passProduct.id,
          amountInr: ph.amount,
          amountInPaise: ph.amount * 100,
          currency: 'INR',
          productName: passProduct.name,
          durationDays: 30,
          creditsGranted: ph.credits,
          status: 'COMPLETED',
          paymentId: ph.payId,
        },
      })

      await prisma.payment.create({
        data: {
          id: 'pay_rec_' + crypto.randomBytes(6).toString('hex'),
          purchaseId: purchase.id,
          userId: ph.user.id,
          orderId: ph.orderId,
          gatewayPaymentId: ph.payId,
          signature: 'sig_mock_verified_' + crypto.randomBytes(4).toString('hex'),
          amountInr: ph.amount,
          amountInPaise: ph.amount * 100,
          currency: 'INR',
          status: 'CAPTURED',
          gateway: 'RAZORPAY',
        },
      })

      const pass = await prisma.accessPass.create({
        data: {
          id: passId,
          userId: ph.user.id,
          purchaseId: purchase.id,
          passType: 'DESIGN_PASS_299',
          status: 'ACTIVE',
          startsAt: now,
          expiresAt: expiry,
          creditsGranted: ph.credits,
        },
      })

      await prisma.creditTransaction.create({
        data: {
          id: 'ctx_grant_' + crypto.randomBytes(6).toString('hex'),
          userId: ph.user.id,
          passId: pass.id,
          amount: ph.credits,
          balanceAfter: ph.credits,
          type: 'GRANT',
          description: `₹299 30-Day Design Pass - ${ph.credits} AI Export Credits Activated (Order: ${ph.orderId})`,
          referenceType: 'PURCHASE',
          referenceId: purchase.id,
        },
      })

      await prisma.auditLog.create({
        data: {
          actorId: ph.user.id,
          actorRole: 'USER',
          action: 'payment.pass_activated',
          entityType: 'AccessPass',
          entityId: pass.id,
          metadata: { orderId: ph.orderId, creditsGranted: ph.credits },
        },
      })
    }
  }
  console.log('✅ Purchases, Razorpay Payments & Passes seeded')

  // 5. SAMPLE REALISTIC INDORE PROJECTS (2D Plan + 3D Elevation)
  const projectSeeds = [
    {
      user: seededUsers['user@indorehousemakers.in'],
      title: '30x50 East Facing 3BHK Modern Villa',
      location: 'Vijay Nagar, Indore',
      plotSize: '30x50 ft (1,500 sq.ft)',
      floors: 2,
      style: 'Modern Contemporary',
      budget: '₹45,50,000',
      summary: 'Vastu-compliant East-facing 3BHK duplex villa with open living, double-height dining, pooja room and covered car porch.',
      img2d: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      img3d: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
    },
    {
      user: seededUsers['vikram.singh@gmail.com'],
      title: '40x60 Luxury 4BHK Grand Bungalow',
      location: 'Nipania (Near Iskcon Temple), Indore',
      plotSize: '40x60 ft (2,400 sq.ft)',
      floors: 3,
      style: 'Neo-Classical Luxury',
      budget: '₹88,00,000',
      summary: 'North-facing 4BHK triplex bungalow with home theatre, terrace infinity lounge, servant quarter and double parking.',
      img2d: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80',
      img3d: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    },
    {
      user: seededUsers['anjali.patel@outlook.com'],
      title: '20x50 Space-Optimized 3BHK Townhouse',
      location: 'Mahalaxmi Nagar, Indore',
      plotSize: '20x50 ft (1,000 sq.ft)',
      floors: 2,
      style: 'Minimalist Scandinavian',
      budget: '₹34,00,000',
      summary: 'Smart narrow-plot 3BHK duplex with internal skylight courtyard, modular open kitchen, and rooftop pergola garden.',
      img2d: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
      img3d: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    },
  ]

  for (const proj of projectSeeds) {
    const existingJob = await prisma.generationJob.findFirst({
      where: { userId: proj.user.id },
    })

    if (!existingJob) {
      const wizId = 'wiz_' + crypto.randomBytes(6).toString('hex')
      const jobId = 'job_' + crypto.randomBytes(6).toString('hex')

      const wizardPayload = {
        plotDimensions: proj.plotSize,
        location: proj.location,
        floors: proj.floors,
        architecturalStyle: proj.style,
        budget: proj.budget,
        vaastuCompliant: true,
      }

      const wizard = await prisma.wizardSession.create({
        data: {
          id: wizId,
          userId: proj.user.id,
          currentStage: 4,
          status: 'COMPLETED',
          wizardData: wizardPayload,
          confirmedSnapshot: wizardPayload,
          completedAt: new Date(),
        },
      })

      const job = await prisma.generationJob.create({
        data: {
          id: jobId,
          userId: proj.user.id,
          wizardSessionId: wizard.id,
          jobType: 'COMPLETE_3D_EXPERIENCE',
          generationType: 'COMPLETE_3D_EXPERIENCE',
          status: 'COMPLETED',
          progressStage: 'COMPLETED',
          creditCost: 1,
          inputPayload: wizardPayload,
          resultPayload: {
            title: proj.title,
            location: proj.location,
            plotSize: proj.plotSize,
            summary: proj.summary,
            estimatedCost: proj.budget,
            floors: proj.floors,
          },
        },
      })

      await prisma.generationAsset.createMany({
        data: [
          {
            id: 'ast_2d_' + crypto.randomBytes(6).toString('hex'),
            generationJobId: job.id,
            assetType: 'FREE_2D_PREVIEW',
            storageKey: proj.img2d,
            mimeType: 'image/jpeg',
            fileSize: 480000,
            accessLevel: 'FREE_PREVIEW',
            status: 'READY',
            metadata: { caption: 'Detailed Dimensioned 2D Architectural Layout' },
          },
          {
            id: 'ast_3d_' + crypto.randomBytes(6).toString('hex'),
            generationJobId: job.id,
            assetType: 'PAID_3D_EXPERIENCE',
            storageKey: proj.img3d,
            mimeType: 'image/jpeg',
            fileSize: 950000,
            accessLevel: 'DESIGN_PASS',
            status: 'READY',
            metadata: { caption: '4K Ultra-HD Photorealistic 3D Exterior Elevation' },
          },
        ],
      })
    }
  }
  console.log('✅ Indore Villa/Bungalow Projects seeded with 2D & 3D Assets')

  // 6. CRM LEADS & CONSULTATIONS (Diverse Indore inquiries)
  const leadsData = [
    {
      name: 'Dr. Anand Joshi',
      phone: '+919425011223',
      email: 'anand.joshi@gmail.com',
      city: 'Indore',
      plotSize: '30x60 (1800 sq.ft)',
      budgetRange: '₹50 - ₹65 Lakhs',
      timeline: 'Within 1 month',
      requirement: 'Turnkey Construction for 3BHK Duplex in Mahalaxmi Nagar with clinic space on ground floor',
      status: 'QUALIFIED' as const,
      notes: 'Client is ready with plot registry. Wants sample site visit in Mahalaxmi Nagar.',
    },
    {
      name: 'Sunil Rathore',
      phone: '+919893044556',
      email: 'sunil.rathore@outlook.com',
      city: 'Indore',
      plotSize: '40x60 (2400 sq.ft)',
      budgetRange: '₹85 Lakhs - ₹1.1 Crore',
      timeline: 'Immediate',
      requirement: 'Architect Consultation & 3D Luxury Elevation for Bungalow near Super Corridor TCS Square',
      status: 'NEW' as const,
      notes: 'Inquired from online AI Planner. Prefers contemporary glass elevation.',
    },
    {
      name: 'Meenal Khandelwal',
      phone: '+919827055443',
      email: 'meenal.k@rediffmail.com',
      city: 'Indore',
      plotSize: '25x50 (1250 sq.ft)',
      budgetRange: '₹35 - ₹45 Lakhs',
      timeline: 'Next 3 months',
      requirement: 'Vastu Consultation + 2D Floor Plan for G+1 House in Rau Bypass',
      status: 'CONTACTED' as const,
      notes: 'First call done on 4th Oct. Shared preliminary rates package.',
    },
    {
      name: 'Rajesh Agrawal',
      phone: '+919755033221',
      email: 'rajesh.agrawal@indoretextiles.com',
      city: 'Indore',
      plotSize: '50x80 (4000 sq.ft)',
      budgetRange: '₹1.5 - ₹2.2 Crore',
      timeline: 'Completed & Handed Over',
      requirement: 'Full Turnkey Premium Construction in Scheme No. 140 Pipliyahana',
      status: 'CONVERTED' as const,
      notes: 'Contract signed. Construction started with Premium package.',
    },
    {
      name: 'Kavita Chhajed',
      phone: '+919926077889',
      email: 'kavita.c@gmail.com',
      city: 'Indore',
      plotSize: '15x45 (675 sq.ft)',
      budgetRange: '₹22 - ₹28 Lakhs',
      timeline: 'Within 6 months',
      requirement: 'Interior and Elevation Redesign for Existing Home in Annapurna Road',
      status: 'CLOSED' as const,
      notes: 'Renovation inquiry closed after initial advisory.',
    },
  ]

  for (const lead of leadsData) {
    const existing = await prisma.lead.findFirst({
      where: { phone: lead.phone },
    })
    if (!existing) {
      await prisma.lead.create({ data: lead })
    }
  }
  console.log('✅ CRM Leads across Indore locations seeded')

  // 7. CHAT SESSIONS & MESSAGES (AI Architecture Assistant)
  const existingChat = await prisma.chatSession.findFirst({
    where: { userId: seededUsers['user@indorehousemakers.in'].id },
  })

  if (!existingChat) {
    const chat = await prisma.chatSession.create({
      data: {
        id: 'chat_session_rohit_01',
        userId: seededUsers['user@indorehousemakers.in'].id,
        title: 'Vastu & Indore Bylaws Consultation for 30x50 Plot',
        status: 'ACTIVE',
        summary: 'User consulted regarding setback rules in Vijay Nagar Indore and kitchen placement as per Vastu.',
      },
    })

    const messages = [
      {
        id: 'msg_01_' + crypto.randomBytes(4).toString('hex'),
        sessionId: chat.id,
        role: 'user',
        content: 'Namaste, mera Indore Vijay Nagar me 30x50 ka East facing plot hai. Front setback kitna chodna hoga as per Indore Nagar Nigam bylaws?',
        status: 'COMPLETED' as const,
      },
      {
        id: 'msg_02_' + crypto.randomBytes(4).toString('hex'),
        sessionId: chat.id,
        role: 'assistant',
        content: 'Namaste Rohit ji! MP Bhumi Vikas Niyam aur Indore Municipal Corporation (IMC) bylaws ke anusaar, 1,500 sq.ft (30x50) residential plot ke liye front road width ke adhar par aamtaur par 1.5 meter se 2.0 meter (approx 5 to 6.5 ft) front open space (setback) chhodna zaroori hota hai. Rear open space lagbhag 1.5 meter rehta hai. Kya aap road width confirm karenge taaki exact permissible FAR calculate kiya ja sake?',
        status: 'COMPLETED' as const,
      },
      {
        id: 'msg_03_' + crypto.randomBytes(4).toString('hex'),
        sessionId: chat.id,
        role: 'user',
        content: 'Front road 30 ft hai. Aur kitchen kis corner me best rahega?',
        status: 'COMPLETED' as const,
      },
      {
        id: 'msg_04_' + crypto.randomBytes(4).toString('hex'),
        sessionId: chat.id,
        role: 'assistant',
        content: 'East facing plot ke liye:\n1. **Kitchen Placement (Vastu Advisory):** Agni Kon (South-East / Aagneya) sabse shubh mana jata hai. Yadi kisi karan se waha sambhav na ho toh Vayu Kon (North-West) secondary vikalp hai. Cooking platform east direction face kare.\n2. **Construction Cost Estimate:** 30x50 duplex (approx 2,400 sq.ft builtup) ke liye Indore me Standard Package lagbhag ₹39.6 Lakhs aur Premium Package lagbhag ₹51.6 Lakhs ka benchmark estimate hai.',
        status: 'COMPLETED' as const,
      },
    ]

    for (const m of messages) {
      await prisma.chatMessage.create({ data: m })
    }
  }
  console.log('✅ Chat Sessions & Vastu/Bylaws Consultation Messages seeded')

  // 8. AUDIT LOGS
  const auditEntries = [
    {
      actorId: seededUsers['admin@ihm.com'].id,
      actorRole: 'ADMIN',
      action: 'admin.overview_viewed',
      entityType: 'System',
      entityId: 'global_metrics',
    },
    {
      actorId: seededUsers['user@indorehousemakers.in'].id,
      actorRole: 'USER',
      action: 'generation.3d_completed',
      entityType: 'GenerationJob',
      entityId: 'job_rohit_villa_01',
    },
    {
      actorId: seededUsers['vikram.singh@gmail.com'].id,
      actorRole: 'USER',
      action: 'payment.order_created',
      entityType: 'Payment',
      entityId: 'order_ihm_live_902',
    },
  ]

  for (const entry of auditEntries) {
    await prisma.auditLog.create({
      data: {
        id: 'aud_' + crypto.randomBytes(6).toString('hex'),
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
      },
    })
  }
  console.log('✅ Platform Audit Logs seeded')

  console.log('🎉 ALL SUPABASE TABLES SUCCESSFULLY POPULATED WITH RICH PRODUCTION-GRADE SEED DATA!')
}

seedComprehensiveDatabase()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
