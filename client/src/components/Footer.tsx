import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site, megaMenus } from '../lib/data'
import { Icons } from './Icons'

const AI_PROMPT = `Using the official Indore House Maker's website at https://indorehousemakers.in and its verified services, explain its house plans, 3D elevations, interior-design services, construction-cost estimator, 3D walkthroughs and consultation options. Summarise the services and tell me how to get started. Use only information available on the official website.`

interface AiPlatform {
  name: string
  label: string
  icon: keyof typeof Icons
  imageSrc: string
  getUrl: (prompt: string) => string
}

const aiPlatforms: AiPlatform[] = [
  {
    name: 'ChatGPT',
    label: 'ChatGPT',
    icon: 'ChatGPT',
    imageSrc: '/icons/ai/ChatGPT.png',
    getUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Gemini',
    label: 'Gemini',
    icon: 'Gemini',
    imageSrc: '/icons/ai/Gemini.png',
    getUrl: () => `https://gemini.google.com/app`,
  },
  {
    name: 'Claude',
    label: 'Claude',
    icon: 'Claude',
    imageSrc: '/icons/ai/Claude.png',
    getUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Perplexity',
    label: 'Perplexity',
    icon: 'Perplexity',
    imageSrc: '/icons/ai/Perplexity.png',
    getUrl: (p) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Copilot',
    label: 'Copilot',
    icon: 'Copilot',
    imageSrc: '/icons/ai/Copilot.png',
    getUrl: (p) => `https://copilot.microsoft.com/?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Grok',
    label: 'Grok',
    icon: 'Grok',
    imageSrc: '/icons/ai/Grok.png',
    getUrl: (p) => `https://x.com/i/grok?text=${encodeURIComponent(p)}`,
  },
]

interface SocialPlatform {
  name: string
  label: string
  icon: keyof typeof Icons
  color: string
  url: string
}

const rawSocialPlatforms: SocialPlatform[] = [
  {
    name: 'Instagram',
    label: 'Instagram',
    icon: 'Instagram',
    color: '#E1306C',
    url: 'https://instagram.com/indorehousemakers',
  },
  {
    name: 'Facebook',
    label: 'Facebook',
    icon: 'Facebook',
    color: '#1877F2',
    url: 'https://facebook.com/indorehousemakers',
  },
  {
    name: 'YouTube',
    label: 'YouTube',
    icon: 'YouTube',
    color: '#FF0000',
    url: 'https://youtube.com/@indorehousemakers',
  },
  {
    name: 'Pinterest',
    label: 'Pinterest',
    icon: 'Pinterest',
    color: '#E60023',
    url: 'https://pinterest.com/indorehousemakers',
  },
  {
    name: 'LinkedIn',
    label: 'LinkedIn',
    icon: 'LinkedIn',
    color: '#0A66C2',
    url: 'https://linkedin.com/company/indore-house-makers',
  },
  {
    name: 'Telegram',
    label: 'Telegram',
    icon: 'Telegram',
    color: '#24A1DE',
    url: 'https://t.me/indorehousemakers',
  },
  {
    name: 'X (Twitter)',
    label: 'X',
    icon: 'XTwitter',
    color: '#292725',
    url: 'https://x.com/indorehousemkrs',
  },
  {
    name: 'WhatsApp',
    label: 'WhatsApp',
    icon: 'WhatsApp',
    color: '#25D366',
    url: `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hi Indore House Maker\'s team, I would like to know more about your house design and architectural services.')}`,
  },
]

const socialPlatforms: SocialPlatform[] = rawSocialPlatforms.filter((s) => Boolean(s.url && s.url !== '#'))

export default function Footer() {
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null)
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null)

  const toggleMobileCategory = (cat: string) => {
    setMobileExpanded((prev) => (prev === cat ? null : cat))
  }

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
              alert('Thank you for subscribing to Indore House Maker\'s updates!')
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

      {/* Main Footer Links Container */}
      <div className="container-content py-12 lg:py-16">
        {/* ========================================================================= */}
        {/* MOBILE VIEW: "Editorial Index" with Rich Interactive Sub-Options Accordion */}
        {/* ========================================================================= */}
        <div className="block lg:hidden">
          {/* Brand Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <Icons.NivaasMark className="h-5 w-5 text-[#C94F36] shrink-0" />
              <h4 className="font-display font-black text-lg text-white tracking-tight">
                {site.name}
              </h4>
            </div>
            <p className="mt-1.5 text-xs text-white/70 leading-relaxed max-w-sm">
              India's premier AI-powered architecture &amp; residential home design platform.
            </p>
          </div>

          {/* Numbered Interactive Editorial Accordion Rows */}
          <div className="divide-y divide-white/10 border-y border-white/10">
            {/* 01 Architecture */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleMobileCategory('architecture')}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E]">01</span>
                  <span>Architecture</span>
                </span>
                <span className={`text-white/40 group-hover:text-[#E76F2E] transition-transform ${mobileExpanded === 'architecture' ? 'rotate-90 text-[#E76F2E]' : ''}`}>
                  →
                </span>
              </button>

              {mobileExpanded === 'architecture' && (
                <div className="pt-3 pb-4 px-2 space-y-4 animate-fadeIn bg-white/5 rounded-lg my-1 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#E76F2E] uppercase tracking-wider">House Plans &amp; Blueprints</span>
                    <Link to="/house-plans" className="text-xs font-bold text-[#E76F2E] hover:underline flex items-center gap-1">
                      <span>Open Page</span>
                      <Icons.ChevronRight size={12} />
                    </Link>
                  </div>
                  {megaMenus.architecture.map((group) => (
                    <div key={group.title} className="space-y-1.5">
                      <h5 className="text-[11px] font-bold text-white/90 uppercase tracking-wide flex items-center gap-1.5">
                        <Icons.Layers size={11} className="text-[#E76F2E]" />
                        <span>{group.title}</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                        {group.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="text-xs text-white/70 hover:text-white flex items-center justify-between py-1 transition"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E76F2E]/20 text-[#E76F2E] border border-[#E76F2E]/30">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 02 Interiors */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleMobileCategory('interiors')}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E]">02</span>
                  <span>Interiors</span>
                </span>
                <span className={`text-white/40 group-hover:text-[#E76F2E] transition-transform ${mobileExpanded === 'interiors' ? 'rotate-90 text-[#E76F2E]' : ''}`}>
                  →
                </span>
              </button>

              {mobileExpanded === 'interiors' && (
                <div className="pt-3 pb-4 px-2 space-y-4 animate-fadeIn bg-white/5 rounded-lg my-1 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#E76F2E] uppercase tracking-wider">Interior Design Studio</span>
                    <Link to="/interiors" className="text-xs font-bold text-[#E76F2E] hover:underline flex items-center gap-1">
                      <span>Open Page</span>
                      <Icons.ChevronRight size={12} />
                    </Link>
                  </div>
                  {megaMenus.interior.map((group) => (
                    <div key={group.title} className="space-y-1.5">
                      <h5 className="text-[11px] font-bold text-white/90 uppercase tracking-wide flex items-center gap-1.5">
                        <Icons.Sofa size={11} className="text-[#E76F2E]" />
                        <span>{group.title}</span>
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-3">
                        {group.items.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            className="text-xs text-white/70 hover:text-white flex items-center justify-between py-1 transition"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E76F2E]/20 text-[#E76F2E] border border-[#E76F2E]/30">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 03 Designs */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleMobileCategory('designs')}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E]">03</span>
                  <span>Designs</span>
                </span>
                <span className={`text-white/40 group-hover:text-[#E76F2E] transition-transform ${mobileExpanded === 'designs' ? 'rotate-90 text-[#E76F2E]' : ''}`}>
                  →
                </span>
              </button>

              {mobileExpanded === 'designs' && (
                <div className="pt-3 pb-4 px-2 space-y-3 animate-fadeIn bg-white/5 rounded-lg my-1 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#E76F2E] uppercase tracking-wider">3D Elevations &amp; Concepts</span>
                    <Link to="/designs" className="text-xs font-bold text-[#E76F2E] hover:underline flex items-center gap-1">
                      <span>Open Page</span>
                      <Icons.ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {megaMenus.designIdeas.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block py-1.5 px-2 rounded hover:bg-white/10 transition"
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="text-[#E76F2E]">→</span>
                        </div>
                        <p className="text-[10.5px] text-white/60">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 04 Services */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleMobileCategory('services')}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E]">04</span>
                  <span>Services</span>
                </span>
                <span className={`text-white/40 group-hover:text-[#E76F2E] transition-transform ${mobileExpanded === 'services' ? 'rotate-90 text-[#E76F2E]' : ''}`}>
                  →
                </span>
              </button>

              {mobileExpanded === 'services' && (
                <div className="pt-3 pb-4 px-2 space-y-3 animate-fadeIn bg-white/5 rounded-lg my-1 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#E76F2E] uppercase tracking-wider">Architectural &amp; Site Services</span>
                    <Link to="/services" className="text-xs font-bold text-[#E76F2E] hover:underline flex items-center gap-1">
                      <span>Open Page</span>
                      <Icons.ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="space-y-2">
                    {megaMenus.otherServices.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        className="block py-1.5 px-2 rounded hover:bg-white/10 transition"
                      >
                        <div className="text-xs font-bold text-white flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="text-[#E76F2E]">→</span>
                        </div>
                        <p className="text-[10.5px] text-white/60">{item.desc}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 05 About NIVAAS */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleMobileCategory('about')}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E]">05</span>
                  <span>About NIVAAS</span>
                </span>
                <span className={`text-white/40 group-hover:text-[#E76F2E] transition-transform ${mobileExpanded === 'about' ? 'rotate-90 text-[#E76F2E]' : ''}`}>
                  →
                </span>
              </button>

              {mobileExpanded === 'about' && (
                <div className="pt-3 pb-4 px-2 space-y-2 animate-fadeIn bg-white/5 rounded-lg my-1 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#E76F2E] uppercase tracking-wider">About &amp; Credentials</span>
                    <Link to="/about" className="text-xs font-bold text-[#E76F2E] hover:underline flex items-center gap-1">
                      <span>Open Page</span>
                      <Icons.ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    <Link to="/about" className="text-xs text-white/80 hover:text-white block py-1">About Indore House Maker's Story</Link>
                    <Link to="/cost-estimator" className="text-xs text-white/80 hover:text-white block py-1">Cost Estimator Calculator</Link>
                    <Link to="/guides" className="text-xs text-white/80 hover:text-white block py-1">Architectural Insights &amp; Vastu Guides</Link>
                    <Link to="/contact" className="text-xs text-white/80 hover:text-white block py-1">Architect Consultation &amp; Booking</Link>
                  </div>
                </div>
              )}
            </div>

            {/* 06 Help & FAQs */}
            <div className="py-2">
              <button
                type="button"
                onClick={() => toggleMobileCategory('faq')}
                className="w-full flex items-center justify-between py-2 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E]">06</span>
                  <span>Help &amp; FAQs</span>
                </span>
                <span className={`text-white/40 group-hover:text-[#E76F2E] transition-transform ${mobileExpanded === 'faq' ? 'rotate-90 text-[#E76F2E]' : ''}`}>
                  →
                </span>
              </button>

              {mobileExpanded === 'faq' && (
                <div className="pt-3 pb-4 px-2 space-y-2 animate-fadeIn bg-white/5 rounded-lg my-1 p-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <span className="text-[11px] font-bold text-[#E76F2E] uppercase tracking-wider">Help Desk &amp; FAQs</span>
                    <Link to="/faq" className="text-xs font-bold text-[#E76F2E] hover:underline flex items-center gap-1">
                      <span>Open Page</span>
                      <Icons.ChevronRight size={12} />
                    </Link>
                  </div>
                  <div className="space-y-1.5">
                    <Link to="/faq" className="text-xs text-white/80 hover:text-white block py-1">Frequently Asked Questions</Link>
                    <Link to="/contact" className="text-xs text-white/80 hover:text-white block py-1">Contact Customer Support</Link>
                    <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="text-xs text-[#E76F2E] hover:underline block py-1 font-semibold">
                      Helpline: {site.phone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Popular Links */}
          <div className="mt-6 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E76F2E] block mb-2">
              POPULAR LINKS
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-white/75 font-medium">
              <Link to="/house-plans" className="hover:text-[#E76F2E] transition">House Plans</Link>
              <span className="text-white/30">·</span>
              <Link to="/cost-estimator" className="hover:text-[#E76F2E] transition">Cost Estimator</Link>
              <span className="text-white/30">·</span>
              <Link to="/guides" className="hover:text-[#E76F2E] transition">Guides</Link>
              <span className="text-white/30">·</span>
              <Link to="/contact" className="hover:text-[#E76F2E] transition">Contact</Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW: 6-Column Full Directory with Detailed Rich Sub-Options       */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid grid-cols-6 gap-8 text-xs text-white/80">
          {/* Col 1: Architecture */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center justify-between">
              <Link to="/house-plans" className="flex items-center gap-1.5 hover:text-[#E76F2E] transition">
                <Icons.Blueprint size={13} className="text-[#E76F2E]" />
                <span>Architecture</span>
              </Link>
              <Link to="/house-plans" className="text-[10px] text-[#E76F2E] hover:underline font-normal">All →</Link>
            </h4>
            <div className="space-y-3 text-white/75">
              <div>
                <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1">Architectural Styles</div>
                <ul className="space-y-1">
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition flex items-center justify-between"><span>Modern Contemporary</span> <span className="text-[9px] text-[#E76F2E] font-bold">Hot</span></Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">Kerala Traditional</Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">Neo-Classical / European</Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">Minimalist Zen &amp; Glass</Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">Mediterranean Villa</Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">Rajasthani Haveli</Link></li>
                </ul>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1">By Bedroom &amp; Vastu</div>
                <ul className="space-y-1">
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">2 BHK Compact Homes</Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition flex items-center justify-between"><span>3 BHK Modern Duplex</span> <span className="text-[9px] text-[#E76F2E] font-bold">Trending</span></Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition">4 BHK Luxury Villas</Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition flex items-center justify-between"><span>East Facing (Purva)</span> <span className="text-[9px] text-[#E76F2E] font-bold">Vastu</span></Link></li>
                  <li><Link to="/house-plans" className="hover:text-[#E76F2E] transition flex items-center justify-between"><span>North Facing (Uttar)</span> <span className="text-[9px] text-[#E76F2E] font-bold">Vastu</span></Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Col 2: Interior */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center justify-between">
              <Link to="/interiors" className="flex items-center gap-1.5 hover:text-[#E76F2E] transition">
                <Icons.Sofa size={13} className="text-[#E76F2E]" />
                <span>Interior</span>
              </Link>
              <Link to="/interiors" className="text-[10px] text-[#E76F2E] hover:underline font-normal">All →</Link>
            </h4>
            <div className="space-y-3 text-white/75">
              <div>
                <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1">Living &amp; Kitchen</div>
                <ul className="space-y-1">
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Modular Kitchens</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Luxury Living Rooms</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">TV Unit &amp; Paneling</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Lobby &amp; Foyer Entry</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">False Ceiling &amp; Light</Link></li>
                </ul>
              </div>
              <div className="pt-2 border-t border-white/5">
                <div className="text-[10px] font-bold uppercase text-white/50 tracking-wider mb-1">Bedrooms &amp; Pooja</div>
                <ul className="space-y-1">
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Master Bedroom Suites</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Pooja Mandir Vastu</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Walk-in Wardrobes</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Kids &amp; Study Rooms</Link></li>
                  <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Modern Bathrooms</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Col 3: Designs */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center justify-between">
              <Link to="/designs" className="flex items-center gap-1.5 hover:text-[#E76F2E] transition">
                <Icons.Sparkles size={13} className="text-[#E76F2E]" />
                <span>Designs</span>
              </Link>
              <Link to="/designs" className="text-[10px] text-[#E76F2E] hover:underline font-normal">All →</Link>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">3D Front Elevations</Link></li>
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">Modern Duplex Elevations</Link></li>
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">Tropical Kerala Roofs</Link></li>
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">Contemporary CNC Jaali</Link></li>
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">Neoclassical Villas</Link></li>
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">Exterior Facade Lighting</Link></li>
              <li><Link to="/designs" className="hover:text-[#E76F2E] transition">3D Walkthrough Videos</Link></li>
              <li><Link to="/interiors" className="hover:text-[#E76F2E] transition">Terrace Garden Layouts</Link></li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center justify-between">
              <Link to="/services" className="flex items-center gap-1.5 hover:text-[#E76F2E] transition">
                <Icons.HardHat size={13} className="text-[#E76F2E]" />
                <span>Services</span>
              </Link>
              <Link to="/services" className="text-[10px] text-[#E76F2E] hover:underline font-normal">All →</Link>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">2D Architectural CAD</Link></li>
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">Structural Working Drawings</Link></li>
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">PMC &amp; Site Supervision</Link></li>
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">Astro-Vastu Consultation</Link></li>
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">Municipal By-Laws Support</Link></li>
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">Verified Contractor Network</Link></li>
              <li><Link to="/contact" className="hover:text-[#E76F2E] transition">Turnkey Construction</Link></li>
              <li><Link to="/contact" className="hover:text-[#E76F2E] transition">Home Loan Assistance</Link></li>
            </ul>
          </div>

          {/* Col 5: About & Guides */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center justify-between">
              <Link to="/about" className="flex items-center gap-1.5 hover:text-[#E76F2E] transition">
                <Icons.Building size={13} className="text-[#E76F2E]" />
                <span>About &amp; Guides</span>
              </Link>
              <Link to="/guides" className="text-[10px] text-[#E76F2E] hover:underline font-normal">More →</Link>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><Link to="/about" className="hover:text-[#E76F2E] transition font-medium text-white">About Indore House Maker's</Link></li>
              <li><Link to="/cost-estimator" className="hover:text-[#E76F2E] transition">Cost Estimator 2026</Link></li>
              <li><Link to="/guides" className="hover:text-[#E76F2E] transition">Vastu Rules &amp; Guides</Link></li>
              <li><Link to="/about" className="hover:text-[#E76F2E] transition">Client Video Stories</Link></li>
              <li><Link to="/faq" className="hover:text-[#E76F2E] transition">Help &amp; FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-[#E76F2E] transition">Contact Architects</Link></li>
              <li><Link to="/services" className="hover:text-[#E76F2E] transition">Architect Directory</Link></li>
            </ul>
          </div>

          {/* Col 6: Helpline */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Icons.Phone size={13} className="text-[#E76F2E]" />
              <span>Design Helpline</span>
            </h4>
            <div className="space-y-2 text-white/75">
              <p className="font-bold text-xs text-white">{site.phone}</p>
              <p className="text-[10.5px] text-white/60">{site.operatingHours}</p>
              <p className="pt-1 text-white/60 flex items-center gap-1.5 text-[11px]">
                <Icons.Mail size={12} className="text-[#E76F2E]" />
                <span>{site.email}</span>
              </p>
              <p className="text-white/60 flex items-center gap-1.5 text-[11px]">
                <Icons.MapPin size={12} className="text-[#E76F2E]" />
                <span>{site.city}</span>
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#E76F2E] text-white text-[11px] font-bold hover:bg-[#C65320] transition"
                >
                  <Icons.Sparkles size={12} />
                  <span>Book Free Consultation</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warm-White Inset Band: Ask AI About Indore House Maker's + Connect With Indore House Maker's */}
      <section
        aria-label="AI and Social Connections"
        className="bg-[#FDFCF9] text-[#292725] border-y border-[#E7E0D7] py-4 sm:py-5 px-3 sm:px-4"
      >
        <div className="container-content">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-8">
            {/* Left Column: Ask AI About Indore House Maker's */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-black tracking-tight flex items-center gap-1.5 shrink-0">
                <Icons.Sparkles size={14} className="text-[#C94F36]" />
                <span className="text-black font-extrabold">Ask AI About Indore House Maker's:</span>
              </h4>

              {/* 6 AI Logo Buttons (Refined compact size with nice gap) */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
                {aiPlatforms.map((ai) => {
                  const IconComponent = Icons[ai.icon]
                  return (
                    <button
                      key={ai.name}
                      type="button"
                      onClick={() => handleAiClick(ai)}
                      className="h-7 w-7 sm:h-7.5 sm:w-7.5 flex items-center justify-center rounded-lg hover:scale-110 transition-transform bg-transparent hover:bg-black/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C94F36]/30 group p-0.5"
                      title={`Ask ${ai.name} about Indore House Maker's (Prompt copied automatically)`}
                      aria-label={`Ask ${ai.name} about Indore House Maker's`}
                    >
                      {ai.imageSrc ? (
                        <img
                          src={ai.imageSrc}
                          alt={ai.name}
                          className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        IconComponent && <IconComponent size={19} />
                      )}
                    </button>
                  )
                })}
              </div>

              {copiedStatus && (
                <span
                  aria-live="polite"
                  className="text-[10px] text-[#C94F36] font-semibold flex items-center gap-1 bg-[#C94F36]/10 border border-[#C94F36]/25 px-2 py-0.5 rounded animate-pulse mt-1 sm:mt-0"
                >
                  <Icons.Check size={11} /> {copiedStatus}
                </span>
              )}
            </div>

            {/* Subtle Divider: Desktop vertical, Mobile horizontal */}
            <div className="hidden lg:block w-px h-7 bg-[#E7E0D7] self-center shrink-0" aria-hidden="true" />
            <div className="block lg:hidden w-full h-px bg-[#E7E0D7]/70 my-1" aria-hidden="true" />

            {/* Right Column: Connect With Indore House Maker's */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2.5 sm:gap-3.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-black tracking-tight flex items-center gap-1.5 shrink-0">
                <Icons.Share size={14} className="text-[#C94F36]" />
                <span className="text-black font-extrabold">Connect With Indore House Maker's:</span>
              </h4>

              {/* 8 Social Logo Buttons (Clean compact size with uniform gap) */}
              <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
                {socialPlatforms.map((soc) => {
                  const IconComponent = Icons[soc.icon]
                  return (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 sm:h-7.5 sm:w-7.5 flex items-center justify-center rounded-lg hover:scale-110 transition-transform bg-transparent hover:bg-black/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C94F36]/30 group"
                      title={`Follow Indore House Maker's on ${soc.name}`}
                      aria-label={`Follow Indore House Maker's on ${soc.name}`}
                    >
                      <span
                        style={{ color: soc.color }}
                        className="transition-transform group-hover:scale-105 flex items-center justify-center"
                      >
                        {IconComponent && <IconComponent size={18} />}
                      </span>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secure Payments Via Section */}
      <div className="border-t border-white/10 py-6">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#EAE6DF] text-center md:text-left">
            SECURE PAYMENTS VIA
          </span>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-y-2.5 gap-x-3.5 sm:gap-x-4.5">
            {/* UPI */}
            <div className="flex items-center hover:opacity-80 transition-opacity shrink-0">
              <img
                src="/payment-logos/upi.svg"
                alt="UPI"
                className="h-5 sm:h-5.5 w-auto object-contain"
                loading="lazy"
              />
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-white/15 shrink-0" aria-hidden="true" />

            {/* Card Networks: Visa, Mastercard, RuPay */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/payment-logos/visa.svg"
                  alt="Visa"
                  className="h-3.5 sm:h-4 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/payment-logos/mastercard.svg"
                  alt="Mastercard"
                  className="h-4.5 sm:h-5 w-auto object-contain"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/payment-logos/rupay.svg"
                  alt="RuPay"
                  className="h-4 sm:h-4.5 w-auto object-contain"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-white/15 shrink-0" aria-hidden="true" />

            {/* Net Banking */}
            <span className="text-xs font-semibold text-[#B9B2AB] hover:opacity-80 transition-opacity tracking-tight shrink-0">
              Net Banking
            </span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 pb-20 md:pb-24 lg:pb-6 text-xs text-white/85">
        <div className="container-content flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {site.name} — Residential Architecture & Home Design Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/90">
            <Link to="/about" className="hover:text-[#E76F2E] transition">Privacy Policy</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#E76F2E] transition">Terms &amp; Conditions</Link>
            <span>·</span>
            <Link to="/house-plans" className="hover:text-[#E76F2E] transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}