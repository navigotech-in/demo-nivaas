import { Router } from 'express'
import { chatService } from '../services/chatService.js'
import { optionalAuth } from '../middleware/auth.js'

const router = Router()

// GET /api/v1/ai/chat/quota - Check current user/guest quota
router.get('/quota', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub || null
    const guestSessionHash = (req.headers['x-guest-session-id'] as string) || req.cookies?.ihm_guest_id || null
    const quota = await chatService.checkQuota({ userId, guestSessionHash })
    res.json({ success: true, data: quota })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/ai/chat/sessions - Create or get chat session
router.post('/sessions', optionalAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub || null
    const guestSessionHash = (req.headers['x-guest-session-id'] as string) || req.cookies?.ihm_guest_id || null
    const { sessionId, wizardSessionId, title } = req.body

    const session = await chatService.getOrCreateSession({
      sessionId,
      userId,
      guestSessionHash,
      wizardSessionId,
      title,
    })

    res.json({ success: true, data: session })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/ai/chat/sessions/:sessionId/messages - SSE Streaming Message Endpoint
router.post('/sessions/:sessionId/messages', optionalAuth, async (req, res) => {
  const { sessionId } = req.params
  const { message, wizardSessionId } = req.body
  const userId = req.user?.sub || null
  const guestSessionHash = (req.headers['x-guest-session-id'] as string) || req.cookies?.ihm_guest_id || null

  if (!message || typeof message !== 'string') {
    res.status(400).json({ success: false, error: 'Message content is required.' })
    return
  }

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const sendSse = (event: string, data: any) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  try {
    await chatService.streamChatResponse({
      sessionId,
      userMessage: message,
      userId,
      guestSessionHash,
      wizardSessionId,
      onEvent: sendSse,
    })
    res.end()
  } catch (err: any) {
    sendSse('response.failed', {
      code: 'INTERNAL_SERVER_ERROR',
      message: err?.message || 'An unexpected AI error occurred. Please retry.',
    })
    res.end()
  }
})

export default router
