import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientDir = path.resolve(__dirname, '..')
const distDir = path.resolve(clientDir, 'dist')
const distIndexPath = path.resolve(distDir, 'index.html')

if (!fs.existsSync(distIndexPath)) {
  console.error('[Prerender] Error: dist/index.html not found. Run vite build first.')
  process.exit(1)
}

const templateHtml = fs.readFileSync(distIndexPath, 'utf-8')

// Import full blog articles from TypeScript source or JSON definition
// We can define the 10 articles metadata and content here for prerendering
const articles = [
  {
    slug: '30x50-house-plan-vastu-duplex-elevation-cost',
    title: '30x50 House Plan as per Vastu (East & North Facing) with Duplex Layout & Estimated Cost Range',
    subtitle: 'A complete architectural guide for 1500 Sq.Ft plots with 3 BHK & 4 BHK duplex floor layouts, room dimensions, setback rules, and 2026 budget ranges.',
    category: 'House Plans',
    tag: '1500 Sq.Ft Plots',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.pexels.com/photos/31737861/pexels-photo-31737861.jpeg',
    featuredImageAlt: 'Modern 30x50 duplex house architectural front elevation design with car parking porch and terrace garden',
    metaTitle: '30x50 House Plan with Vastu, 3D Elevation & Cost Range | Indore House Makers',
    metaDescription: 'Detailed 30x50 (1500 sq.ft) duplex house plan with 3 BHK & 4 BHK layouts, Vastu room directions, room dimension tables, and estimated construction cost ranges.',
    canonicalUrl: 'https://indorehousemakers.in/guides/30x50-house-plan-vastu-duplex-elevation-cost',
    content: `
      <p class="intro">A 30x50 feet plot (totaling 1,500 square feet or 166.6 square yards) provides the optimal balance of space, front setback, and luxury for modern Indian families. With thoughtful architectural zoning, you can easily build a spacious 3 BHK or 4 BHK G+1 duplex home with a car porch, open lawn, and modular kitchen without compromising on natural daylight or cross-ventilation.</p>
      <h2>Ground Floor Layout (Parking, Living & Master Suite)</h2>
      <p>On a 30x50 plot, the ground floor layout prioritizes functional circulation and privacy. A dedicated 11x16 ft covered porch accommodates a full-size SUV and two-wheelers. The main entrance opens into an auspicious North-East foyer leading to a spacious 14x18 ft formal living hall.</p>
      <h2>Estimated Construction Cost Range (2026 Overview)</h2>
      <p>For a 30x50 plot with G+1 configuration (approx. 2,200 to 2,500 sq.ft of total built-up area), overall construction costs generally fall between ₹1,650 and ₹2,600 per sq.ft depending on whether you choose basic civil structure or luxury turnkey finishes.</p>
      <h2>Frequently Asked Questions</h2>
      <p><strong>Can a 30x50 plot accommodate 4 bedrooms and a car park?</strong><br>Yes, a G+1 duplex on a 30x50 plot easily accommodates 4 bedrooms along with a dedicated car parking porch.</p>
    `,
  },
  {
    slug: 'house-construction-cost-in-indore-madhya-pradesh-2026',
    title: 'House Construction Cost in Indore & Central India (2026): Estimated Rate Ranges & Material Guide',
    subtitle: 'A transparent guide to current construction rates per sq.ft, key material benchmarks (cement, steel, sand), and budgeting strategies for new home builders.',
    category: 'Cost Estimation',
    tag: 'Budgeting & Rates',
    author: 'Er. Anil Verma',
    updatedAt: 'October 2026',
    readTime: '7 min read',
    featuredImage: 'https://images.pexels.com/photos/1216589/pexels-photo-1216589.jpeg',
    featuredImageAlt: 'Residential building construction site with reinforced steel rebar and concrete slab casting work',
    metaTitle: 'House Construction Cost in Indore (2026 Guide) | Indore House Makers',
    metaDescription: 'Explore 2026 residential construction cost ranges in Indore & Central India. Detailed breakdowns of steel, cement, labour rates, and turnkey packages per sq.ft.',
    canonicalUrl: 'https://indorehousemakers.in/guides/house-construction-cost-in-indore-madhya-pradesh-2026',
    content: `
      <p class="intro">Estimating your home construction budget accurately is the most crucial step before breaking ground. In Central India (Indore, Bhopal, Ujjain), residential construction costs in 2026 range from ₹1,650 to ₹2,600 per square foot for turnkey execution.</p>
      <h2>Key Raw Material Price Ranges (2026 Market Estimates)</h2>
      <p>Raw materials account for roughly 65% to 70% of total civil construction expenditure. TMT steel ranges between ₹56-₹62/kg, and cement bags range between ₹360-₹410 per 50kg bag.</p>
      <h2>Turnkey vs Civil-Only Estimated Rate Brackets</h2>
      <p>Standard Turnkey packages with branded material range from ₹1,650 to ₹1,950/sq.ft, while premium luxury finishes range from ₹2,100 to ₹2,600/sq.ft.</p>
    `,
  },
  {
    slug: 'house-construction-checklist-step-by-step-guide',
    title: 'Complete House Construction Checklist: Step-by-Step Guide from Planning to Handover',
    subtitle: 'A practical, chronological checklist covering soil testing, architectural layouts, structural vetting, MEP rough-ins, and final finishing inspections.',
    category: 'Construction Advice',
    tag: 'Construction Guide',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '8 min read',
    featuredImage: 'https://images.pexels.com/photos/17948134/pexels-photo-17948134.jpeg',
    featuredImageAlt: 'Architect reviewing building blueprints and engineering construction checklist on site',
    metaTitle: 'House Construction Checklist: Step-by-Step Building Guide | Indore House Makers',
    metaDescription: 'A practical step-by-step house construction checklist for Indian home builders. Covers site preparation, foundation, RCC casting, MEP work, and finishing quality checks.',
    canonicalUrl: 'https://indorehousemakers.in/guides/house-construction-checklist-step-by-step-guide',
    content: `
      <p class="intro">Building a home is one of life’s most significant financial and emotional investments. Follow this master checklist covering planning, foundation, superstructure, MEP, and final handover inspections.</p>
      <h2>Phase 1: Pre-Construction Planning & Design Finalization</h2>
      <p>Verify physical boundaries, perform soil bearing capacity testing, finalize 2D architectural layouts and structural drawings before signing contracts.</p>
      <h2>Phase 2: Substructure & Foundation Milestones</h2>
      <p>Excavate to hard strata, apply anti-termite treatment, ensure proper cover blocks under rebar mesh, and perform 14 days of water curing.</p>
    `,
  },
  {
    slug: 'vastu-shastra-rules-for-kitchen-pooja-bedroom-entrance',
    title: 'Essential Vastu Shastra Guidelines for Modern Homes: Kitchen, Pooja Room, Master Bedroom & Entrance',
    subtitle: 'A practical, science-backed approach to ancient Indian spatial planning that harmonizes natural sunlight, wind flow, and peaceful family living.',
    category: 'Vastu Planning',
    tag: 'Vastu Shastra',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg',
    featuredImageAlt: 'Peaceful Indian home interior with naturally lit Pooja room and open living space aligned with Vastu',
    metaTitle: 'Vastu Shastra Rules for House Design (Kitchen, Pooja, Bedroom) | Indore House Makers',
    metaDescription: 'Complete Vastu guide for Indian homes. Direction matrix for main entrance, kitchen, pooja room, master bedroom, and staircase placement.',
    canonicalUrl: 'https://indorehousemakers.in/guides/vastu-shastra-rules-for-kitchen-pooja-bedroom-entrance',
    content: `
      <p class="intro">Vastu Shastra is fundamentally an ancient Indian architectural science designed to optimize solar radiation, geomagnetic alignment, and natural cross-ventilation.</p>
      <h2>Room-by-Room Vastu Direction Matrix</h2>
      <p>Main Entrance in North/East, Kitchen in South-East (Agni), Pooja Room in North-East (Ishan), and Master Bedroom in South-West (Nairuthi).</p>
    `,
  },
  {
    slug: '20x40-house-plan-800-sqft-duplex-design',
    title: '20x40 House Plan (800 Sq.Ft): Smart Space-Saving Duplex Design for Narrow Plots',
    subtitle: 'How to maximize space, light, and ventilation in a compact 800 sq.ft plot with smart OTS shafts, 2/3 BHK layouts, and car parking.',
    category: 'House Plans',
    tag: 'Compact Plots',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '5 min read',
    featuredImage: 'https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg',
    featuredImageAlt: 'Modern compact duplex house design on narrow 20x40 plot with vertical wooden slats and large windows',
    metaTitle: '20x40 House Plan (800 Sq.Ft Duplex) Space-Saving Design | Indore House Makers',
    metaDescription: 'Explore 20x40 house plans (800 sq.ft) with 2 BHK and 3 BHK duplex layouts, OTS ventilation shafts, compact parking, and cost estimation.',
    canonicalUrl: 'https://indorehousemakers.in/guides/20x40-house-plan-800-sqft-duplex-design',
    content: `
      <p class="intro">A 20x40 plot (800 square feet) is one of the most accessible urban plot sizes in India. Smart vertical zoning and Open-to-Sky (OTS) shafts transform an 800 sq.ft footprint into an airy 3 BHK duplex.</p>
      <h2>Ground Floor Layout (Compact Parking & Open Living)</h2>
      <p>Open-plan living-dining eliminates unnecessary partition walls, creating a seamless sense of volume.</p>
    `,
  },
  {
    slug: '40x60-luxury-villa-courtyard-house-plan',
    title: '40x60 Luxury Villa & Modern Courtyard House Plan (2400 Sq.Ft): Grand Living Design',
    subtitle: 'Designing a 4 BHK / 5 BHK luxury residence with double car portico, double-height living room, central courtyard (Aangan), and terrace lounge.',
    category: 'House Plans',
    tag: '2400 Sq.Ft Villa',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg',
    featuredImageAlt: 'Ultra luxury modern 40x60 villa architecture with double height glass windows and evening facade illumination',
    metaTitle: '40x60 Luxury Villa & Courtyard House Plan (2400 Sq.Ft) | Indore House Makers',
    metaDescription: 'Architectural guide for 40x60 (2400 sq.ft) luxury villa floor plans. Features double-height living halls, central courtyard aangan, and 4/5 BHK layouts.',
    canonicalUrl: 'https://indorehousemakers.in/guides/40x60-luxury-villa-courtyard-house-plan',
    content: `
      <p class="intro">A 40x60 plot (2,400 sq.ft) is the benchmark for luxury residential architecture in Indian cities, offering generous frontage for dual SUV parking, landscaped setbacks, and grand double-height living spaces.</p>
    `,
  },
  {
    slug: 'modern-3d-front-elevation-designs-for-indian-homes',
    title: 'Modern 3D Front Elevation Design Trends: Exterior Textures, Louvers & Facade Lighting',
    subtitle: 'Elevate your home’s street presence with contemporary materials including HPL sheets, stone cladding, CNC metal jalis, and 3000K warm lighting.',
    category: '3D Elevations',
    tag: 'Elevation & Facade',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.pexels.com/photos/323780/pexels-photo-323780.jpeg',
    featuredImageAlt: 'Contemporary modern house front elevation with wooden louvers, warm exterior lighting, and stone texture',
    metaTitle: 'Modern 3D Front Elevation Designs for Indian Homes | Indore House Makers',
    metaDescription: 'Explore trending 3D front elevation designs for Indian duplexes. Material comparisons for HPL sheets, stone cladding, CNC jalis, and exterior lighting.',
    canonicalUrl: 'https://indorehousemakers.in/guides/modern-3d-front-elevation-designs-for-indian-homes',
    content: `
      <p class="intro">A house’s 3D front elevation combines volume, texture, shade, and light. Modern Indian facades balance sleek contemporary lines with weather-resistant materials.</p>
    `,
  },
  {
    slug: 'modular-kitchen-designs-materials-cost-guide-2026',
    title: 'Modular Kitchen Design Guide: Layouts, Materials (HDHMR vs Marine Ply) & Estimated Budget Ranges',
    subtitle: 'How to plan an ergonomic, moisture-resistant modular kitchen with the golden work triangle, high-performance hardware, and durable finishes.',
    category: 'Interiors',
    tag: 'Kitchen Interiors',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg',
    featuredImageAlt: 'Modern ergonomic modular kitchen interior with acrylic cabinets, quartz countertop, and warm task lighting',
    metaTitle: 'Modular Kitchen Design Guide & Estimated Cost Ranges | Indore House Makers',
    metaDescription: 'Complete modular kitchen planning guide. Compare HDHMR vs Marine Ply, acrylic vs laminate finishes, soft-close hardware, and per-sq.ft cost estimates.',
    canonicalUrl: 'https://indorehousemakers.in/guides/modular-kitchen-designs-materials-cost-guide-2026',
    content: `
      <p class="intro">The kitchen is the heart of an Indian home. Heavy Indian cooking involves high heat, spices, and frequent water usage, making BWP 710 Marine Ply and HDHMR ideal carcass materials.</p>
    `,
  },
  {
    slug: 'turnkey-construction-vs-labour-contract-india',
    title: 'Turnkey (With Material) vs Labour Contract: How to Choose the Right Construction Model',
    subtitle: 'An honest comparison of costs, material wastage, site stress, quality supervision, and milestone management for Indian home builders.',
    category: 'Construction Advice',
    tag: 'Contracts & Planning',
    author: 'Er. Anil Verma',
    updatedAt: 'October 2026',
    readTime: '6 min read',
    featuredImage: 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg',
    featuredImageAlt: 'Civil engineer and homeowner reviewing architectural drawings on a turnkey construction site',
    metaTitle: 'Turnkey Construction vs Labour Contract in India | Indore House Makers',
    metaDescription: 'Detailed comparison of turnkey (with-material) vs labour-only contracts for house building in India. Understand real costs, material wastage, and contract safety.',
    canonicalUrl: 'https://indorehousemakers.in/guides/turnkey-construction-vs-labour-contract-india',
    content: `
      <p class="intro">When embarking on home construction, decide whether a comprehensive turnkey contract or managing procurement on a labour contract suits your schedule and budget best.</p>
    `,
  },
  {
    slug: 'common-house-planning-mistakes-to-avoid',
    title: '10 Costly House-Planning Mistakes to Avoid Before Building Your Dream Home',
    subtitle: 'From inadequate electrical planning and poor ventilation to ignoring future expansion, avoid these common architectural pitfalls before breaking ground.',
    category: 'Construction Advice',
    tag: 'Architectural Advice',
    author: 'Ar. Rajesh Sharma, IIA Certified',
    updatedAt: 'October 2026',
    readTime: '7 min read',
    featuredImage: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg',
    featuredImageAlt: 'Architect pointing out floor plan dimensions and corrections on blueprint draft',
    metaTitle: '10 Costly House Planning Mistakes to Avoid | Indore House Makers',
    metaDescription: 'Avoid these 10 common house planning and floor layout mistakes. Expert architect tips on room sizing, window placement, electrical points, and plumbing alignment.',
    canonicalUrl: 'https://indorehousemakers.in/guides/common-house-planning-mistakes-to-avoid',
    content: `
      <p class="intro">Correcting an error on architectural blueprints costs nothing, but breaking RCC slabs or shifting bathroom plumbing after construction costs lakhs. Avoid these top 10 planning errors.</p>
      <h2>Top Mistakes: Column Placement, Parking Clearance & Kitchen Ergonomics</h2>
      <p>Always coordinate architectural layouts with structural column grids and ensure adequate car door opening clearance in the parking porch.</p>
    `,
  },
]

// 1. Prerender individual blog pages
for (const art of articles) {
  const guideDir = path.resolve(distDir, 'guides', art.slug)
  fs.mkdirSync(guideDir, { recursive: true })

  let html = templateHtml

  // Update Title
  html = html.replace(/<title>.*?<\/title>/, `<title>${art.metaTitle}</title>`)

  // Update Description
  if (/<meta\s+name=["']description["'][\s\S]*?>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${art.metaDescription}" />`)
  } else {
    html = html.replace('</head>', `<meta name="description" content="${art.metaDescription}" />\n</head>`)
  }

  // Add/Update Canonical
  if (/<link\s+rel=["']canonical["'][\s\S]*?>/i.test(html)) {
    html = html.replace(/<link\s+rel=["']canonical["'][\s\S]*?>/i, `<link rel="canonical" href="${art.canonicalUrl}" />`)
  } else {
    html = html.replace('</head>', `<link rel="canonical" href="${art.canonicalUrl}" />\n</head>`)
  }

  // Add Open Graph Meta
  const ogTags = `
  <meta property="og:title" content="${art.metaTitle}" />
  <meta property="og:description" content="${art.metaDescription}" />
  <meta property="og:url" content="${art.canonicalUrl}" />
  <meta property="og:image" content="${art.featuredImage}" />
  <meta property="og:type" content="article" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${art.metaTitle}" />
  <meta name="twitter:description" content="${art.metaDescription}" />
  <meta name="twitter:image" content="${art.featuredImage}" />
  `
  // Add Article Schema.org JSON-LD
  const articleSchema = `
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(art.title)},
    "description": ${JSON.stringify(art.metaDescription)},
    "image": [${JSON.stringify(art.featuredImage)}],
    "datePublished": "2026-09-01T08:00:00+05:30",
    "dateModified": "2026-10-01T10:00:00+05:30",
    "author": [{
      "@type": "Person",
      "name": ${JSON.stringify(art.author)}
    }],
    "publisher": {
      "@type": "Organization",
      "name": "Indore House Makers",
      "url": "https://indorehousemakers.in"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": ${JSON.stringify(art.canonicalUrl)}
    }
  }
  </script>
  `
  html = html.replace('</head>', `${ogTags}\n${articleSchema}\n</head>`)

  // Injected Prerendered Semantic HTML in #root
  const prerenderedBody = `
    <main class="prerendered-guide" style="padding: 40px 20px; max-width: 800px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
      <nav aria-label="Breadcrumb" style="font-size: 13px; margin-bottom: 20px;">
        <a href="/">Home</a> / <a href="/guides">Guides</a> / <span>${art.category}</span>
      </nav>
      <header>
        <p style="text-transform: uppercase; font-size: 12px; font-weight: bold; color: #C94F36;">${art.category} · ${art.tag}</p>
        <h1 style="font-size: 2rem; font-weight: bold; color: #E76F2E; line-height: 1.25; margin-top: 8px;">${art.title}</h1>
        <p style="font-size: 1.1rem; color: #54504A; margin-top: 12px;">${art.subtitle}</p>
        <p style="font-size: 13px; color: #74706A; margin-top: 12px;">Written by ${art.author} · Last Updated: ${art.updatedAt} · ${art.readTime}</p>
      </header>
      <figure style="margin: 24px 0;">
        <img src="${art.featuredImage}" alt="${art.featuredImageAlt}" style="width: 100%; height: auto; border-radius: 8px;" />
        <figcaption style="font-size: 11px; color: #74706A; text-align: center; margin-top: 8px;">
          ${art.featuredImageAlt} <br/>
          <span style="font-weight: 600; color: #8C827A;">* Conceptual planning reference — not a construction or structural drawing.</span>
        </figcaption>
      </figure>
      <article style="line-height: 1.7; color: #3D3A37;">
        ${art.content}
      </article>
      <section style="margin-top: 40px; padding: 20px; background: #FAF8F5; border-radius: 12px;">
        <h2 style="font-size: 16px; font-weight: bold; color: #292826;">Related Architectural Resources</h2>
        <ul style="margin-top: 10px; font-size: 14px;">
          <li><a href="/house-plans">Browse Ready House Plans & 2D Layouts</a></li>
          <li><a href="/cost-estimator">Calculate Construction Cost Range</a></li>
          <li><a href="/services">Full Architectural & Turnkey Services</a></li>
          <li><a href="/contact">Book 1-on-1 Architect Consultation</a></li>
        </ul>
      </section>
    </main>
  `

  html = html.replace('<div id="root"></div>', `<div id="root">${prerenderedBody}</div>`)

  fs.writeFileSync(path.resolve(guideDir, 'index.html'), html, 'utf-8')
}

// 2. Prerender Guides Hub Page
const hubDir = path.resolve(distDir, 'guides')
fs.mkdirSync(hubDir, { recursive: true })

let hubHtml = templateHtml
hubHtml = hubHtml.replace(/<title>.*?<\/title>/, `<title>Architecture, Vastu & House Construction Guides | Indore House Makers</title>`)
hubHtml = hubHtml.replace('</head>', `<meta name="description" content="Expert residential guides on 30x50 & 20x40 floor plans, 2026 house construction cost estimates, Vastu rules, modern 3D elevations, and avoiding costly planning mistakes." />\n<link rel="canonical" href="https://indorehousemakers.in/guides" />\n</head>`)

const hubPrerenderedBody = `
  <main class="prerendered-guides-hub" style="padding: 40px 20px; max-width: 1000px; margin: 0 auto; font-family: system-ui, -apple-system, sans-serif;">
    <header style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 2.25rem; font-weight: bold; color: #292826;">Residential Architecture & Construction Guides</h1>
      <p style="font-size: 1.1rem; color: #54504A; margin-top: 12px;">Practical, fact-checked architectural guides written by licensed architects and civil consultants.</p>
    </header>
    <section style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
      ${articles.map(a => `
        <article style="border: 1px solid #E7E0D7; border-radius: 12px; padding: 20px; background: #fff;">
          <p style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: #C94F36;">${a.category}</p>
          <h2 style="font-size: 1.1rem; font-weight: bold; margin-top: 8px;"><a href="/guides/${a.slug}" style="color: #292826; text-decoration: none;">${a.title}</a></h2>
          <p style="font-size: 13px; color: #54504A; margin-top: 8px;">${a.subtitle}</p>
          <a href="/guides/${a.slug}" style="display: inline-block; margin-top: 16px; font-size: 13px; font-weight: bold; color: #C94F36;">Read Guide →</a>
        </article>
      `).join('')}
    </section>
  </main>
`

hubHtml = hubHtml.replace('<div id="root"></div>', `<div id="root">${hubPrerenderedBody}</div>`)
fs.writeFileSync(path.resolve(hubDir, 'index.html'), hubHtml, 'utf-8')

// Copy sitemap-guides.xml to dist if present
const publicSitemap = path.resolve(clientDir, 'public', 'sitemap-guides.xml')
if (fs.existsSync(publicSitemap)) {
  fs.copyFileSync(publicSitemap, path.resolve(distDir, 'sitemap-guides.xml'))
}

console.log(`[Prerender] Successfully prerendered ${articles.length} guides and /guides hub to dist/!`)
