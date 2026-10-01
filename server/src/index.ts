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
import { demoDesigns } from './data.js'

const app = express()

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow localhost, preview, and client domains
      callback(null, true)
    },
    credentials: true,
  })
)
app.use(cookieParser())
app.use(express.json({ limit: '128kb' }))

// API v1 Routes
app.use('/api/v1/health', healthRoutes)
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/leads', leadsRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/designs', designsRoutes)

// Dynamic XML Sitemaps
app.get('/sitemap.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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

app.get('/sitemaps/house-plans.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const urls = demoDesigns.map((d) => `  <url>
    <loc>https://indorehousemakers.in/#plans?id=${d.id}</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://indorehousemakers.in/#plans</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
${urls}
</urlset>`
  res.send(xml)
})

app.get('/sitemaps/elevations.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://indorehousemakers.in/#elevations</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://indorehousemakers.in/#interiors</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
  res.send(xml)
})

app.get('/sitemaps/cities.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const majorCities = ['indore', 'bhopal', 'ujjain', 'dewas', 'mumbai', 'delhi-ncr', 'bengaluru', 'hyderabad', 'pune', 'jaipur', 'ahmedabad']
  const urls = majorCities.map((c) => `  <url>
    <loc>https://indorehousemakers.in/#plans?city=${c}</loc>
    <lastmod>2026-09-30</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  res.send(xml)
})

// Serve the built client (production mode) when it exists.
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

// Global API Error Handler
app.use(errorHandler)

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Indore House Makers API listening on http://0.0.0.0:${config.port}`)
})