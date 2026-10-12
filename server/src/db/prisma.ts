import { PrismaClient } from '@prisma/client'
import { resolve } from 'node:path'

// `.env` is NOT auto-loaded by tsx/node. Bootstrap it here deterministically so
// the process reaches the real PostgreSQL instance instead of silently falling
// back to the in-memory store (which vanishes on every restart).
// Already-set vars (e.g. vitest's DATABASE_URL override) are never overwritten.
if (!process.env.DATABASE_URL) {
  try {
    process.loadEnvFile?.(resolve(process.cwd(), '.env'))
  } catch {
    // .env missing — fall through to the default URL below
  }
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

let defaultDbUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'test'
    ? 'postgresql://postgres:postgres@localhost:5432/ihm_test?schema=public'
    : 'postgresql://postgres:postgres@localhost:5432/ihm_dev?schema=public')

if (!defaultDbUrl.includes('connection_limit')) {
  const separator = defaultDbUrl.includes('?') ? '&' : '?'
  defaultDbUrl = `${defaultDbUrl}${separator}connection_limit=20&pool_timeout=30`
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: defaultDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

