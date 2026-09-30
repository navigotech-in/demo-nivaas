import { useState, useEffect } from 'react'
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
  const [floatingMenu, setFloatingMenu] = useState<'architecture' | 'interior' | 'designs' | 'services' | 'about' | 'faq' | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFloatingMenu(null)
      }
    }
    if (floatingMenu) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [floatingMenu])

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

      {/* Main Footer Links Container: Editorial Index Layout */}
      <div className="container-content py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Brand Column & Quick Contact (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Icons.NivaasMark className="h-6 w-6 text-[#E76F2E] shrink-0" />
                <h4 className="font-display font-black text-xl text-white tracking-tight">
                  {site.name}
                </h4>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-white/70 leading-relaxed max-w-md">
                India's premier AI-powered architecture &amp; residential home design platform. Creating intelligent Vastu blueprints, photorealistic 3D elevations, and turnkey construction.
              </p>
            </div>

            {/* Helpline / Direct Contact Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2.5 text-xs text-white/80 max-w-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E76F2E]">Design Helpline</span>
                <span className="text-[10px] text-white/50">{site.operatingHours}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white/90">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Icons.Phone size={13} className="text-[#E76F2E]" />
                  <span>{site.phone}</span>
                </span>
                <span className="flex items-center gap-1.5 text-white/70">
                  <Icons.MapPin size={13} className="text-[#E76F2E]" />
                  <span>{site.city}</span>
                </span>
              </div>
              <div className="pt-1 flex items-center gap-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E76F2E] text-white text-[11px] font-bold hover:bg-[#C65320] transition cursor-pointer"
                >
                  <Icons.Sparkles size={12} />
                  <span>Book Free Consultation</span>
                </Link>
                <Link
                  to="/cost-estimator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-medium hover:bg-white/15 transition cursor-pointer"
                >
                  <Icons.Calculator size={12} />
                  <span>Cost Estimator</span>
                </Link>
              </div>
            </div>

            {/* Popular Links */}
            <div className="pt-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#E76F2E] block mb-2">
                POPULAR LINKS
              </span>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-white/75 font-medium">
                <Link to="/house-plans" className="hover:text-[#E76F2E] transition">House Plans</Link>
                <span className="text-white/30">·</span>
                <Link to="/cost-estimator" className="hover:text-[#E76F2E] transition">Cost Estimator</Link>
                <span className="text-white/30">·</span>
                <Link to="/guides" className="hover:text-[#E76F2E] transition">Guides</Link>
                <span className="text-white/30">·</span>
                <Link to="/about" className="hover:text-[#E76F2E] transition">About Us</Link>
                <span className="text-white/30">·</span>
                <Link to="/faq" className="hover:text-[#E76F2E] transition">FAQs</Link>
                <span className="text-white/30">·</span>
                <Link to="/contact" className="hover:text-[#E76F2E] transition">Contact</Link>
              </div>
            </div>
          </div>

          {/* Editorial Index Numbered Rows (7 Cols on Desktop) */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                DIRECTORY INDEX
              </span>
              <span className="text-[10px] text-white/40">
                Click any section to view full categories ⊞
              </span>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {/* 01 Architecture */}
              <button
                type="button"
                onClick={() => setFloatingMenu('architecture')}
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#E76F2E] hover:bg-white/[0.02] transition group cursor-pointer text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E] w-6">01</span>
                  <span>Architecture &amp; House Plans</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">
                  <span>Explore 480+ Plans</span>
                  <span>→</span>
                </span>
              </button>

              {/* 02 Interiors */}
              <button
                type="button"
                onClick={() => setFloatingMenu('interior')}
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#E76F2E] hover:bg-white/[0.02] transition group cursor-pointer text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E] w-6">02</span>
                  <span>Interiors Studio</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">
                  <span>Modular &amp; Luxury</span>
                  <span>→</span>
                </span>
              </button>

              {/* 03 Designs */}
              <button
                type="button"
                onClick={() => setFloatingMenu('designs')}
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#E76F2E] hover:bg-white/[0.02] transition group cursor-pointer text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E] w-6">03</span>
                  <span>3D Front Elevations &amp; Facades</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">
                  <span>Design Ideas</span>
                  <span>→</span>
                </span>
              </button>

              {/* 04 Services */}
              <button
                type="button"
                onClick={() => setFloatingMenu('services')}
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#E76F2E] hover:bg-white/[0.02] transition group cursor-pointer text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E] w-6">04</span>
                  <span>Architectural &amp; Turnkey Services</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">
                  <span>CAD &amp; PMC</span>
                  <span>→</span>
                </span>
              </button>

              {/* 05 About NIVAAS */}
              <button
                type="button"
                onClick={() => setFloatingMenu('about')}
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#E76F2E] hover:bg-white/[0.02] transition group cursor-pointer text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E] w-6">05</span>
                  <span>About Indore House Maker's</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">
                  <span>Our Story</span>
                  <span>→</span>
                </span>
              </button>

              {/* 06 Help & FAQs */}
              <button
                type="button"
                onClick={() => setFloatingMenu('faq')}
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#E76F2E] hover:bg-white/[0.02] transition group cursor-pointer text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#E76F2E] w-6">06</span>
                  <span>Help &amp; Frequently Asked Questions</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">
                  <span>Support Desk</span>
                  <span>→</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FLOATED MEGA MENU POPUP CARD ON CLICK (Matching Header Mega Menu)          */}
      {/* ========================================================================= */}
      {floatingMenu && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-xs animate-fadeIn"
          onClick={() => setFloatingMenu(null)}
        >
          <div
            className="bg-white text-[#292826] rounded-2xl shadow-2xl border border-[#E7E0D7] w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Floated Card Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEE9E3] bg-[#FAF8F5]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] flex items-center justify-center text-[#E76F2E]">
                  {floatingMenu === 'architecture' && <Icons.Blueprint size={18} />}
                  {floatingMenu === 'interior' && <Icons.Sofa size={18} />}
                  {floatingMenu === 'designs' && <Icons.Sparkles size={18} />}
                  {floatingMenu === 'services' && <Icons.HardHat size={18} />}
                  {floatingMenu === 'about' && <Icons.Building size={18} />}
                  {floatingMenu === 'faq' && <Icons.Compass size={18} />}
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-[#292826]">
                    {floatingMenu === 'architecture' && 'Architecture & House Plans'}
                    {floatingMenu === 'interior' && 'Interior Design Studio'}
                    {floatingMenu === 'designs' && '3D Front Elevations & Design Gallery'}
                    {floatingMenu === 'services' && 'Architectural & Engineering Services'}
                    {floatingMenu === 'about' && 'About NIVAAS & Insights'}
                    {floatingMenu === 'faq' && 'Help & Frequently Asked Questions'}
                  </h3>
                  <p className="text-[11px] text-[#74706A]">
                    {floatingMenu === 'architecture' && 'Vastu-compliant layouts, modern styles, storey types & BHK floor plans'}
                    {floatingMenu === 'interior' && 'Modular kitchens, living rooms, master bedrooms & pooja spaces'}
                    {floatingMenu === 'designs' && 'Photorealistic 3D elevations, walkthroughs and modern facade concepts'}
                    {floatingMenu === 'services' && 'End-to-end drawings, PMC site supervision & verified contractor network'}
                    {floatingMenu === 'about' && 'India\'s leading residential architecture brand story & resources'}
                    {floatingMenu === 'faq' && 'Answers to common questions, approvals, pricing & architect assistance'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to={
                    floatingMenu === 'architecture'
                      ? '/house-plans'
                      : floatingMenu === 'interior'
                      ? '/interiors'
                      : floatingMenu === 'designs'
                      ? '/designs'
                      : floatingMenu === 'services'
                      ? '/services'
                      : floatingMenu === 'about'
                      ? '/about'
                      : '/faq'
                  }
                  onClick={() => setFloatingMenu(null)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition"
                >
                  <span>Open Full Page</span>
                  <Icons.ChevronRight size={13} />
                </Link>
                <button
                  type="button"
                  onClick={() => setFloatingMenu(null)}
                  aria-label="Close menu"
                  className="w-8 h-8 rounded-lg border border-[#E7E0D7] bg-white hover:bg-slate-100 flex items-center justify-center text-[#54504A] hover:text-[#292826] transition cursor-pointer"
                >
                  <Icons.Close size={16} />
                </button>
              </div>
            </div>

            {/* Floated Card Body with 4-Column / Multi-Column Mega Menu */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-130px)]">
              {floatingMenu === 'architecture' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {megaMenus.architecture.map((col) => (
                    <div key={col.title} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E0D7]/70">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#292826] border-b border-[#E7E0D7] pb-2 mb-3 flex items-center gap-1.5">
                        {col.title.includes('Style') ? <Icons.Building size={14} className="text-[#E76F2E]" /> : col.title.includes('Storey') || col.title.includes('Elevation') ? <Icons.Layers size={14} className="text-[#E76F2E]" /> : col.title.includes('Bedroom') ? <Icons.Bed size={14} className="text-[#E76F2E]" /> : <Icons.Compass size={14} className="text-[#E76F2E]" />}
                        <span>{col.title}</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {col.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              to={item.href}
                              onClick={() => setFloatingMenu(null)}
                              className="text-[#54504A] hover:text-[#E76F2E] hover:font-semibold flex items-center justify-between py-1 px-1.5 rounded hover:bg-white transition"
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] bg-[#FFF6E8] text-[#E76F2E] border border-[#E7E0D7] px-1.5 py-0.2 rounded font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {floatingMenu === 'interior' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {megaMenus.interior.map((col) => (
                    <div key={col.title} className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E7E0D7]/70">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#292826] border-b border-[#E7E0D7] pb-2 mb-3 flex items-center gap-1.5">
                        <Icons.Home size={14} className="text-[#E76F2E]" />
                        <span>{col.title}</span>
                      </h4>
                      <ul className="space-y-1.5 text-xs">
                        {col.items.map((item) => (
                          <li key={item.label}>
                            <Link
                              to={item.href}
                              onClick={() => setFloatingMenu(null)}
                              className="text-[#54504A] hover:text-[#E76F2E] hover:font-semibold flex items-center justify-between py-1 px-1.5 rounded hover:bg-white transition"
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="text-[9px] bg-[#FFF6E8] text-[#E76F2E] border border-[#E7E0D7] px-1.5 py-0.2 rounded font-bold">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {floatingMenu === 'designs' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {megaMenus.designIdeas.map((idea) => (
                    <Link
                      key={idea.label}
                      to={idea.href}
                      onClick={() => setFloatingMenu(null)}
                      className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E] flex items-center justify-between">
                          <span>{idea.label}</span>
                          <span className="text-xs text-[#E76F2E]">→</span>
                        </div>
                        <p className="text-xs text-[#74706A] mt-1.5 leading-relaxed">{idea.desc}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#E7E0D7]/60 text-[10px] font-bold text-[#E76F2E]">
                        Explore Designs →
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {floatingMenu === 'services' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {megaMenus.otherServices.map((srv) => (
                    <Link
                      key={srv.label}
                      to={srv.href}
                      onClick={() => setFloatingMenu(null)}
                      className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E] flex items-center justify-between">
                          <span>{srv.label}</span>
                          <span className="text-xs text-[#E76F2E]">→</span>
                        </div>
                        <p className="text-xs text-[#74706A] mt-1.5 leading-relaxed">{srv.desc}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-[#E7E0D7]/60 text-[10px] font-bold text-[#E76F2E]">
                        Book Service →
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {floatingMenu === 'about' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/about"
                    onClick={() => setFloatingMenu(null)}
                    className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group"
                  >
                    <h4 className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E]">About Indore House Maker's</h4>
                    <p className="text-xs text-[#74706A] mt-1">Transforming Indian residential architecture with AI blueprints and verified trades.</p>
                  </Link>
                  <Link
                    to="/cost-estimator"
                    onClick={() => setFloatingMenu(null)}
                    className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group"
                  >
                    <h4 className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E]">Cost Estimator 2026</h4>
                    <p className="text-xs text-[#74706A] mt-1">Instant construction rate calculations, material pricing and budget breakdown.</p>
                  </Link>
                  <Link
                    to="/guides"
                    onClick={() => setFloatingMenu(null)}
                    className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group"
                  >
                    <h4 className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E]">Vastu Rules &amp; Bylaws Guides</h4>
                    <p className="text-xs text-[#74706A] mt-1">Practical zoning guides written by certified architects and structural engineers.</p>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setFloatingMenu(null)}
                    className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group"
                  >
                    <h4 className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E]">Consult Senior Architects</h4>
                    <p className="text-xs text-[#74706A] mt-1">Book a 1-on-1 virtual design session for custom floor plans and 3D elevations.</p>
                  </Link>
                </div>
              )}

              {floatingMenu === 'faq' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/faq"
                    onClick={() => setFloatingMenu(null)}
                    className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group"
                  >
                    <h4 className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E]">Frequently Asked Questions</h4>
                    <p className="text-xs text-[#74706A] mt-1">Everything about CAD deliverables, delivery timelines, municipal permits &amp; pricing.</p>
                  </Link>
                  <Link
                    to="/contact"
                    onClick={() => setFloatingMenu(null)}
                    className="p-4 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] hover:bg-white hover:border-[#E76F2E] transition group"
                  >
                    <h4 className="text-sm font-bold text-[#292826] group-hover:text-[#E76F2E]">Customer Support Desk</h4>
                    <p className="text-xs text-[#74706A] mt-1">Talk to our project coordinators directly via phone or WhatsApp for quick resolution.</p>
                  </Link>
                </div>
              )}
            </div>

            {/* Floated Card Bottom Bar */}
            <div className="px-6 py-3 border-t border-[#EEE9E3] bg-[#FAF8F5] flex items-center justify-between text-xs text-[#74706A]">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#E7E0D7] text-[10px] font-mono">Esc</kbd> to close</span>
              <button
                type="button"
                onClick={() => setFloatingMenu(null)}
                className="text-xs font-bold text-[#E76F2E] hover:underline cursor-pointer"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

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