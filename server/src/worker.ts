import crypto from 'node:crypto'
import { prisma } from './db/prisma.js'
import { generationService } from './services/generationService.js'

const WORKER_ID = `worker_${process.pid}_${crypto.randomBytes(4).toString('hex')}`
const POLL_INTERVAL_MS = 3000
const LEASE_DURATION_MS = 60000 // 1 minute lease

console.log(`[Indore House Makers] Generation Job Worker started. ID: ${WORKER_ID}`)

let isShuttingDown = false

async function pollAndProcessJobs() {
  if (isShuttingDown) return

  try {
    const now = new Date()
    const leaseExpiry = new Date(now.getTime() + LEASE_DURATION_MS)

    // 1. Find and claim eligible QUEUED or STUCK jobs with lease
    const claimedJob = await prisma.$transaction(async (tx) => {
      const candidate = await tx.generationJob.findFirst({
        where: {
          OR: [
            { status: 'QUEUED' },
            {
              status: 'PROCESSING',
              leaseExpiresAt: { lt: now },
              attemptCount: { lt: 3 },
            },
          ],
        },
        orderBy: { createdAt: 'asc' },
      })

      if (!candidate) return null

      // Atomically acquire lease
      const updated = await tx.generationJob.update({
        where: { id: candidate.id },
        data: {
          status: 'PROCESSING',
          lockedBy: WORKER_ID,
          leaseExpiresAt: leaseExpiry,
          heartbeatAt: now,
          attemptCount: { increment: 1 },
        },
      })

      return updated
    })

    if (claimedJob) {
      console.log(`[Worker] Claimed job ${claimedJob.id} (${claimedJob.jobType}) for user ${claimedJob.userId}.`)
      
      // Start heartbeat timer
      const heartbeatTimer = setInterval(async () => {
        try {
          await prisma.generationJob.update({
            where: { id: claimedJob.id },
            data: {
              heartbeatAt: new Date(),
              leaseExpiresAt: new Date(Date.now() + LEASE_DURATION_MS),
            },
          })
        } catch {
          // Worker might have finished
        }
      }, 15000)

      try {
        await generationService.processJobAsync(
          claimedJob.id,
          claimedJob.userId,
          claimedJob.creditReservationId || claimedJob.id
        )
        console.log(`[Worker] Job ${claimedJob.id} processed successfully.`)
      } catch (err: any) {
        console.error(`[Worker] Error processing job ${claimedJob.id}:`, err.message)
      } finally {
        clearInterval(heartbeatTimer)
      }
    }
  } catch (err: any) {
    // Database connection error handling
    if (process.env.NODE_ENV === 'development') {
      // In development when DB isn't running, silent skip
    } else {
      console.error('[Worker] Polling error:', err.message)
    }
  }

  if (!isShuttingDown) {
    setTimeout(pollAndProcessJobs, POLL_INTERVAL_MS)
  }
}

// Start polling
pollAndProcessJobs()

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('[Worker] Graceful shutdown initiated...')
  isShuttingDown = true
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('[Worker] SIGTERM received, stopping worker...')
  isShuttingDown = true
  process.exit(0)
})
