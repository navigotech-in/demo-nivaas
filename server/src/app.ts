import { existsSync } from 'node:fs'
import path from 'node:path'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { errorHandler } from './middleware/errorHandler.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import designsRoutes from './routes/designsRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import leadsRoutes from './routes/leadsRoutes.js'
import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import webhookRoutes from './routes/webhookRoutes.js'
import wizardRoutes from './routes/wizardRoutes.js'
import generationRoutes from './routes/generationRoutes.js'
import chatRoutes from './routes/chatRoutes.js'
import blogRoutes from './routes/blogRoutes.js'

export function createApp() {
  const app = express()

  // Middlewares
  app.use(
    cors({
      origin: (origin, callback) => {
        callback(null, true)
      },
      credentials: true,
    })
  )
  app.use(cookieParser())

  // 1. Authoritative Webhook endpoint MUST receive raw body for HMAC signature verification
  app.use('/api/v1/webhooks', express.raw({ type: 'application/json' }), webhookRoutes)

  // 2. Standard JSON body parser for all other REST routes
  app.use(express.json({ limit: '128kb' }))

  // API v1 Routes
  app.use('/api/v1/health', healthRoutes)
  app.use('/api/v1/auth', authRoutes)
  app.use('/api/v1/users', userRoutes)
  app.use('/api/v1/leads', leadsRoutes)
  app.use('/api/v1/admin', adminRoutes)
  app.use('/api/v1/blogs', blogRoutes)
  app.use('/api/v1/designs', designsRoutes)
  app.use('/api/v1/products', productRoutes)
  app.use('/api/v1/payments', paymentRoutes)
  app.use('/api/v1/wizard', wizardRoutes)
  app.use('/api/v1/generations', generationRoutes)
  app.use('/api/v1/ai/chat', chatRoutes)

  // Dynamic XML Sitemaps
  app.get('/sitemap.xml', (_req, res) => {
    res.header('Content-Type', 'application/xml')
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://indorehousemakers.in/sitemap-guides.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://indorehousemakers.in/sitemaps/house-plans.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://indorehousemakers.in/sitemaps/elevations.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://indorehousemakers.in/sitemaps/cities.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`
    res.send(xml)
  })

  app.get('/sitemap-guides.xml', (_req, res) => {
    const sitemapPath = path.join(config.clientDist, 'sitemap-guides.xml')
    if (existsSync(sitemapPath)) {
      res.header('Content-Type', 'application/xml')
      res.sendFile(sitemapPath)
    } else {
      res.redirect('/sitemap.xml')
    }
  })

  // Serve client static assets if available
  if (existsSync(config.clientDist)) {
    app.use(express.static(config.clientDist))
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'API route not found' } })
        return
      }
      res.sendFile(path.join(config.clientDist, 'index.html'), (err) => {
        if (err) next(err)
      })
    })
  }

  // Global Error Handler
  app.use(errorHandler)

  return app
}
