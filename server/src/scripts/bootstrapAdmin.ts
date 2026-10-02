import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import bcrypt from 'bcryptjs'
import crypto from 'node:crypto'
import { prisma } from '../db/prisma.js'
import { db } from '../db/store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const credentialsPath = path.resolve(__dirname, '../../admin.credentials.json')

async function bootstrap() {
  let email = process.env.ADMIN_EMAIL || 'admin@ihm.com'
  let password = process.env.ADMIN_PASSWORD || 'Admin@123'
  let name = process.env.ADMIN_NAME || 'IHM Administrator'
  let phone = process.env.ADMIN_PHONE || '+919876543210'

  if (fs.existsSync(credentialsPath)) {
    try {
      const fileData = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'))
      if (fileData.email) email = fileData.email.trim().toLowerCase()
      if (fileData.password) password = fileData.password.trim()
      if (fileData.name) name = fileData.name.trim()
      if (fileData.phone) phone = fileData.phone.trim()
      console.log(`[Admin Config] Loaded credentials from: ${credentialsPath}`)
    } catch (e) {
      console.warn('[Admin Config] Failed to parse admin.credentials.json, using defaults/env.')
    }
  }

  const normalizedEmail = email.toLowerCase()
  const passwordHash = await bcrypt.hash(password, 10)

  console.log(`\n======================================================`)
  console.log(`[Indore House Makers] Setting Up Sole Administrator`)
  console.log(`======================================================`)
  console.log(`Email    : ${normalizedEmail}`)
  console.log(`Name     : ${name}`)
  console.log(`Phone    : ${phone}`)
  console.log(`Password : ${password}`)

  try {
    await prisma.$connect()

    // 1. Check if an admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    })

    let adminId: string

    if (existingAdmin) {
      // Update existing admin credentials
      const updated = await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          email: normalizedEmail,
          passwordHash,
          name,
          phone,
          isEmailVerified: true,
          isPhoneVerified: true,
        },
      })
      adminId = updated.id
      console.log(`\n✅ Existing Admin updated successfully in PostgreSQL!`)
    } else {
      // Create fresh admin user
      adminId = 'usr_admin_' + crypto.randomBytes(6).toString('hex')
      await prisma.user.create({
        data: {
          id: adminId,
          email: normalizedEmail,
          passwordHash,
          name,
          phone,
          role: 'ADMIN',
          isEmailVerified: true,
          isPhoneVerified: true,
        },
      })

      // Lock admin setup permanently
      await prisma.adminSetupLock.upsert({
        where: { id: 'SETUP_LOCK' },
        create: {
          id: 'SETUP_LOCK',
          isLocked: true,
          adminId,
          lockedAt: new Date(),
        },
        update: {
          isLocked: true,
          adminId,
          lockedAt: new Date(),
        },
      })
      console.log(`\n✅ New Admin created successfully in PostgreSQL!`)
    }

    // Mirror to store
    db.bootstrapAdmin(normalizedEmail, password, name)

    console.log(`\n------------------------------------------------------`)
    console.log(`🎉 Admin is ready to login!`)
    console.log(`👉 Login URL : http://localhost:5173/`)
    console.log(`👉 Email     : ${normalizedEmail}`)
    console.log(`👉 Password  : ${password}`)
    console.log(`👉 Dashboard : http://localhost:5173/admin`)
    console.log(`======================================================\n`)
  } catch (err) {
    console.error('❌ Failed to setup Admin in PostgreSQL:', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

bootstrap()
