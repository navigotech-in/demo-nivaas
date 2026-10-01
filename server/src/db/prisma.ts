import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const defaultDbUrl =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV === 'test'
    ? 'postgresql://postgres:postgres@localhost:5432/ihm_test?schema=public'
    : 'postgresql://postgres:postgres@localhost:5432/ihm_dev?schema=public')

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
