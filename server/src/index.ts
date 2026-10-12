import { createApp } from './app.js'
import { config } from './config.js'
import { db } from './db/store.js'
import { prisma } from './db/prisma.js'

if (config.nodeEnv !== 'production') {
  db.seedDefaultProduct()
  db.seedDevFixtures()
  console.log('[Dev Server] 💡 Dev fixtures seeded for offline/fallback testing:')
  console.log('             User: user@indorehousemakers.in / User@IndoreHouse2026!')
}

async function verifyDataStoreReachable() {
  if (config.dataStore !== 'postgres') {
    console.log(`[Server] DATA_STORE=memory — in-memory only (for tests/offline). Data will NOT persist across restarts.`)
    return
  }
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log(`[Server] DATA_STORE=postgres — connected to PostgreSQL. Writes will persist.`)
  } catch {
    console.warn(
      `\n[WARN] DATA_STORE=postgres but PostgreSQL is UNREACHABLE.\n` +
        `       Writes will NOT persist and accounts created now will be lost on restart.\n` +
        `       Check DATABASE_URL in server/.env and network connectivity.\n`
    )
  }
}

await verifyDataStoreReachable()

const app = createApp()

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Indore House Makers API listening on http://0.0.0.0:${config.port}`)
})