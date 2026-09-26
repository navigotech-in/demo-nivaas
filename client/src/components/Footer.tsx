import { useState } from 'react'
import { site, paymentPartners } from '../lib/data'
import { Icons } from './Icons'

const AI_PROMPT = `Using the official NIVAAS website at https://nivaas.in and its verified services, explain its house plans, 3D elevations, interior-design services, construction-cost estimator, 3D walkthroughs and consultation options. Summarise the services and tell me how to get started. Use only information available on the official website.`

interface AiPlatform {
  name: string
  icon: keyof typeof Icons
  getUrl: (prompt: string) => string
}

const aiPlatforms: AiPlatform[] = [
  {
    name: 'ChatGPT',
    icon: 'ChatGPT',
    getUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Gemini',
    icon: 'Gemini',
    getUrl: () => `https://gemini.google.com/app`,
  },
  {
    name: 'Claude',
    icon: 'Claude',
    getUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Perplexity',
    icon: 'Perplexity',
    getUrl: (p) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Copilot',
    icon: 'Copilot',
    getUrl: (p) => `https://copilot.microsoft.com/?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Grok',
    icon: 'Grok',
    getUrl: (p) => `https://x.com/i/grok?text=${encodeURIComponent(p)}`,
  },
]

interface SocialPlatform {
  name: string
  icon: keyof typeof Icons
  color: string
  url: string
}

const rawSocialPlatforms: SocialPlatform[] = [
  {
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E1306C',
    url: 'https://instagram.com/nivaas.official',
  },
  {
    name: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    url: 'https://facebook.com/nivaas.official',
  },
  {
    name: 'YouTube',
    icon: 'YouTube',
    color: '#FF0000',
    url: 'https://youtube.com/@nivaas.official',
  },
  {
    name: 'Pinterest',
    icon: 'Pinterest',
    color: '#E60023',
    url: 'https://pinterest.com/nivaas_official',
  },
  {
    name: 'LinkedIn',
    icon: 'LinkedIn',
    color: '#0A66C2',
    url: 'https://linkedin.com/company/nivaas-official',
  },
  {
    name: 'Telegram',
    icon: 'Telegram',
    color: '#24A1DE',
    url: 'https://t.me/nivaas_official',
  },
  {
    name: 'X (Twitter)',
    icon: 'XTwitter',
    color: '#F8FAFC',
    url: 'https://x.com/nivaas_official',
  },
  {
    name: 'WhatsApp',
    icon: 'WhatsApp',
    color: '#25D366',
    url: `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi NIVAAS, I would like to know more about your house design and architectural services.')}`,
  },
]

const socialPlatforms: SocialPlatform[] = rawSocialPlatforms.filter((s) => Boolean(s.url && s.url !== '#'))

export default function Footer() {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null)

  const handleAiClick = async (platform: AiPlatform) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(AI_PROMPT)
      }
    } catch {
      // Fallback
    }
    setCopiedStatus(`Question copied for ${platform.name} — opening...`)
    const targetUrl = platform.getUrl(AI_PROMPT)
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    setTimeout(() => {
      setCopiedStatus(null)
    }, 3500)
  }

  return (
    <footer className="bg-[#292826] text-white border-t border-[#E7E0D7]">
      {/* Top Banner / Newsletter */}
      <div className="border-b border-white/10 py-12">
        <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E76F2E] flex items-center gap-1.5">
              <Icons.Sparkles size={14} /> Stay Inspired & Informed
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Join 50,000+ Indian Home Builders
            </h3>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-lg">
              Get weekly curated house plans, Vastu layout tips, and material cost updates delivered straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Thank you for subscribing to NIVAAS updates!')
            }}
            className="flex w-full lg:w-auto gap-2"
          >
            <div className="relative w-full sm:w-80">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/50 outline-none focus:border-[#E76F2E] transition"
              />
              <div className="absolute left-3.5 top-3.5 text-[#E76F2E]">
                <Icons.Mail size={15} />
              </div>
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#E76F2E] px-6 py-3 text-xs font-bold text-white hover:bg-[#C65320] transition active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-content py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-xs text-white/80">
        {/* Col 1: Popular Sizes */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Ruler size={13} className="text-[#E76F2E]" />
            <span>Plans by Size</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">30 x 50 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">30 x 40 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">25 x 40 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">20 x 50 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">40 x 60 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">50 x 80 Luxury Plans</a></li>
          </ul>
        </div>

        {/* Col 2: By Area */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Grid size={13} className="text-[#E76F2E]" />
            <span>Plans by Area</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">500 - 700 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">900 - 1,100 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">1,150 - 1,300 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">1,350 - 1,500 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">1,700 - 2,000 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">3,000 sq.ft & above</a></li>
          </ul>
        </div>

        {/* Col 3: Services */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.HardHat size={13} className="text-[#E76F2E]" />
            <span>Services</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#services" className="hover:text-[#E76F2E] transition">2D Layout Design</a></li>
            <li><a href="#elevations" className="hover:text-[#E76F2E] transition">3D Front Elevation</a></li>
            <li><a href="#services" className="hover:text-[#E76F2E] transition">Structural CAD Sets</a></li>
            <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Interior 3D Renders</a></li>
            <li><a href="#services" className="hover:text-[#E76F2E] transition">Vastu Consultation</a></li>
            <li><a href="#services" className="hover:text-[#E76F2E] transition">PMC & Site Supervision</a></li>
          </ul>
        </div>

        {/* Col 4: Top Cities */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.MapPin size={13} className="text-[#E76F2E]" />
            <span>Cities Covered</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Hyderabad (GHMC)</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Bengaluru (BBMP)</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Delhi NCR (DDA)</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Mumbai & Pune</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Indore & Bhopal</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Chennai & Jaipur</a></li>
          </ul>
        </div>

        {/* Col 5: Tools & Resources */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Layers size={13} className="text-[#E76F2E]" />
            <span>Tools & Links</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#calculator" className="hover:text-[#E76F2E] transition">Cost Estimator 2026</a></li>
            <li><a href="#reviews" className="hover:text-[#E76F2E] transition">Client Video Stories</a></li>
            <li><a href="#blog" className="hover:text-[#E76F2E] transition">Vastu Guide & Blogs</a></li>
            <li><a href="#faq" className="hover:text-[#E76F2E] transition">Help & FAQs</a></li>
            <li><a href="#contact" className="hover:text-[#E76F2E] transition">Partner With Us</a></li>
            <li><a href="#contact" className="hover:text-[#E76F2E] transition">Contractor Network</a></li>
          </ul>
        </div>

        {/* Col 6: Helpline */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Phone size={13} className="text-[#E76F2E]" />
            <span>Design Helpline</span>
          </h4>
          <div className="space-y-2 text-white/80">
            <p className="font-bold text-sm text-white">{site.phone}</p>
            <p className="text-[11px] text-white/60">{site.operatingHours}</p>
            <p className="pt-2 text-white/60 flex items-center gap-1.5">
              <Icons.Mail size={13} className="text-[#E76F2E]" />
              <span>{site.email}</span>
            </p>
            <p className="text-white/60 flex items-center gap-1.5">
              <Icons.MapPin size={13} className="text-[#E76F2E]" />
              <span>{site.city}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Ask AI & Social Channels Strip (Sleek Single-Line Format with Partition) */}
      <div className="border-t border-white/10 py-6 bg-white/[0.02]">
        <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
          {/* Ask AI About Us */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 flex items-center gap-1.5 shrink-0">
              <Icons.Sparkles size={14} className="text-[#E76F2E]" /> Ask AI About Us:
            </span>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {aiPlatforms.map((ai) => {
                const IconComponent = Icons[ai.icon]
                return (
                  <button
                    key={ai.name}
                    type="button"
                    onClick={() => handleAiClick(ai)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/80 hover:text-white transition-all hover:scale-110 hover:border-white/30 hover:bg-white/10 active:scale-95 cursor-pointer group shadow-sm"
                    title={`Ask ${ai.name} about NIVAAS (Auto-copies prompt)`}
                    aria-label={`Ask ${ai.name} about NIVAAS`}
                  >
                    <div className="w-[22px] h-[22px] flex items-center justify-center transition-transform group-hover:scale-105">
                      {IconComponent && <IconComponent size={22} />}
                    </div>
                  </button>
                )
              })}
            </div>
            {copiedStatus && (
              <span
                aria-live="polite"
                className="text-[10px] text-[#E76F2E] font-medium flex items-center gap-1 bg-[#E76F2E]/10 border border-[#E76F2E]/30 px-2.5 py-1 rounded ml-1 animate-pulse"
              >
                <Icons.Check size={11} /> {copiedStatus}
              </span>
            )}
          </div>

          {/* Central Partition Divider */}
          <div className="hidden lg:block w-px h-7 bg-white/15 shrink-0" aria-hidden="true" />
          <div className="block lg:hidden w-full h-px bg-white/10" aria-hidden="true" />

          {/* Connect With Us */}
          <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90 flex items-center gap-1.5 shrink-0">
              <Icons.Share size={14} className="text-[#E76F2E]" /> Connect With Us:
            </span>
            <div className="flex items-center gap-2 sm:gap-2.5">
              {socialPlatforms.map((soc) => {
                const IconComponent = Icons[soc.icon]
                return (
                  <a
                    key={soc.name}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 transition-all hover:scale-110 hover:border-white/30 hover:bg-white/10 active:scale-95 cursor-pointer group shadow-sm"
                    title={`Follow NIVAAS on ${soc.name}`}
                    aria-label={`Follow NIVAAS on ${soc.name}`}
                  >
                    <span style={{ color: soc.color }} className="transition-transform group-hover:scale-110 flex items-center justify-center">
                      {IconComponent && <IconComponent size={17} />}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Partners */}
      <div className="border-t border-white/10 py-6">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <Icons.ShieldCheck size={14} className="text-[#E76F2E]" /> Secure Payments via
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {paymentPartners.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white/70"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 text-xs text-white/60">
        <div className="container-content flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {site.name} — Residential Architecture & Home Design Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-[#E76F2E] transition">Privacy Policy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-[#E76F2E] transition">Terms & Conditions</a>
            <span>·</span>
            <a href="#sitemap" className="hover:text-[#E76F2E] transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}