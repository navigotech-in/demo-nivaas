import { db } from '../db/store.js'

async function seed() {
  console.log('[Seed Dev] Seeding development demo fixtures...')
  db.seedDefaultProduct()
  db.seedDevFixtures()
  console.log('[Seed Dev] ✅ Development fixtures seeded: Demo User + ₹299 Pass + 5 Credits.')
}

seed().catch((err) => {
  console.error('[Seed Dev] ❌ Failed:', err)
  process.exit(1)
})
