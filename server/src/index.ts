import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import cors from 'cors'
import express from 'express'
import { z } from 'zod'
import { demoDesigns } from './data.js'

const PORT = Number(process.env.PORT ?? 7000)
const CLIENT_DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist')

const app = express()
app.use(cors())
app.use(express.json({ limit: '64kb' }))

app.get('/api/v1/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'nivaas-api', version: '0.1.0' } })
})

app.get('/api/v1/designs', (req, res) => {
  const type = (req.query.type as string | undefined) ?? ''
  const limit = Number(req.query.limit ?? 6)

  const designs = type && type !== 'HOUSE_PLAN' ? [] : demoDesigns
  res.json({
    success: true,
    data: designs.slice(0, limit),
    meta: { page: 1, pageSize: limit, total: designs.length },
  })
})

const leadSchema = z.object({
  type: z.enum(['DESIGN_CUSTOMIZATION', 'SERVICE_ENQUIRY', 'CONSULTATION']),
  name: z.string().min(2).max(120),
  phone: z.string().min(10).max(20),
  city: z.string().max(120).optional().default(''),
  requirement: z.string().max(120).optional().default(''),
  message: z.string().max(2000).optional().default(''),
})

app.post('/api/v1/leads', (req, res) => {
  const parsed = leadSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(422).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid lead payload', details: parsed.error.issues },
    })
    return
  }
  // Demo handler: real implementation persists to PostgreSQL via Prisma and
  // queues a notification job.
  console.log('[lead]', JSON.stringify({ ...parsed.data, submittedAt: new Date().toISOString() }))
  res.status(201).json({ success: true, data: { id: 'LEAD_DEMO_' + Date.now(), status: 'NEW' } })
})

// Dynamic XML Sitemaps
app.get('/sitemap.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://nivaas.in/sitemaps/house-plans.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://nivaas.in/sitemaps/elevations.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://nivaas.in/sitemaps/cities.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`
  res.send(xml)
})

app.get('/sitemaps/house-plans.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const urls = demoDesigns.map((d) => `  <url>
    <loc>https://nivaas.in/#plans?id=${d.id}</loc>
    <lastmod>2026-09-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nivaas.in/#plans</loc>
    <lastmod>2026-09-28</lastmod>
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
    <loc>https://nivaas.in/#elevations</loc>
    <lastmod>2026-09-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://nivaas.in/#interiors</loc>
    <lastmod>2026-09-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`
  res.send(xml)
})

app.get('/sitemaps/cities.xml', (_req, res) => {
  res.header('Content-Type', 'application/xml')
  const majorCities = ['mumbai', 'delhi-ncr', 'bengaluru', 'hyderabad', 'pune', 'jaipur', 'indore', 'ahmedabad', 'kochi', 'lucknow', 'chandigarh', 'kolkata']
  const urls = majorCities.map((c) => `  <url>
    <loc>https://nivaas.in/#plans?city=${c}</loc>
    <lastmod>2026-09-28</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  res.send(xml)
})

// Serve the built client (demo/production mode) when it exists. Unknown
// non-API routes fall through to index.html for the React app; unknown API
// routes return a real 404 JSON.
if (existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST))
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } })
      return
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'), (err) => {
      if (err) next(err)
    })
  })
} else {
  console.warn(`Client build not found at ${CLIENT_DIST} — run "npm run build" in ../client first.`)
}

app.listen(PORT, () => {
  console.log(`NIVAAS API listening on http://localhost:${PORT}`)
  console.log(`Serving client build from ${CLIENT_DIST}`)
})