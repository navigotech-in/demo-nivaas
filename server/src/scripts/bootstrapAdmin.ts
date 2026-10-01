import { db } from '../db/store.js'

async function bootstrap() {
  const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@indorehousemakers.in'
  const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'Admin@IndoreHouse2026!'
  const name = process.env.ADMIN_NAME || 'Indore House Makers System Admin'

  console.log(`[Bootstrap Admin] Ensuring Admin account for: ${email}...`)
  const admin = db.bootstrapAdmin(email, password, name)
  console.log(`[Bootstrap Admin] ✅ Success! Admin verified: ${admin.email} (ID: ${admin.id}, Role: ${admin.role})`)
}

bootstrap().catch((err) => {
  console.error('[Bootstrap Admin] ❌ Failed:', err)
  process.exit(1)
})
