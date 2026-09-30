import { useState } from 'react'
import { site } from '../lib/data'
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
        {/* MOBILE VIEW: "Editorial Index" (Short, readable, numbered full-width rows) */}
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

          {/* Numbered Full-Width Editorial Rows */}
          <div className="divide-y divide-white/10 border-y border-white/10">
            <a
              href="#plans"
              className="flex items-center justify-between py-3 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#E76F2E]">01</span>
                <span>Architecture</span>
              </span>
              <span className="text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a
              href="#interiors"
              className="flex items-center justify-between py-3 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#E76F2E]">02</span>
                <span>Interiors</span>
              </span>
              <span className="text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a
              href="#elevations"
              className="flex items-center justify-between py-3 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#E76F2E]">03</span>
                <span>Designs</span>
              </span>
              <span className="text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a
              href="#services"
              className="flex items-center justify-between py-3 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#E76F2E]">04</span>
                <span>Services</span>
              </span>
              <span className="text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a
              href="#about"
              className="flex items-center justify-between py-3 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#E76F2E]">05</span>
                <span>About NIVAAS</span>
              </span>
              <span className="text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">→</span>
            </a>
            <a
              href="#faq"
              className="flex items-center justify-between py-3 px-1 text-sm font-bold text-white hover:text-[#E76F2E] transition group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs font-semibold text-[#E76F2E]">06</span>
                <span>Help &amp; FAQs</span>
              </span>
              <span className="text-white/40 group-hover:text-[#E76F2E] group-hover:translate-x-1 transition-all">→</span>
            </a>
          </div>

          {/* Popular Links */}
          <div className="mt-6 pt-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#E76F2E] block mb-2">
              POPULAR LINKS
            </span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-white/75 font-medium">
              <a href="#plans" className="hover:text-[#E76F2E] transition">House Plans</a>
              <span className="text-white/30">·</span>
              <a href="#calculator" className="hover:text-[#E76F2E] transition">Cost Estimator</a>
              <span className="text-white/30">·</span>
              <a href="#blog" className="hover:text-[#E76F2E] transition">Guides</a>
              <span className="text-white/30">·</span>
              <a href="#contact" className="hover:text-[#E76F2E] transition">Contact</a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DESKTOP VIEW: 6-Column Full Directory                                     */}
        {/* ========================================================================= */}
        <div className="hidden lg:grid grid-cols-6 gap-8 text-xs text-white/80">
          {/* Col 1: Architecture */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Icons.Blueprint size={13} className="text-[#E76F2E]" />
              <span>Architecture</span>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><a href="#plans" className="hover:text-[#E76F2E] transition">30 x 50 House Plans</a></li>
              <li><a href="#plans" className="hover:text-[#E76F2E] transition">20 x 40 House Plans</a></li>
              <li><a href="#plans" className="hover:text-[#E76F2E] transition">25 x 40 House Plans</a></li>
              <li><a href="#plans" className="hover:text-[#E76F2E] transition">40 x 60 Luxury Villas</a></li>
              <li><a href="#plans" className="hover:text-[#E76F2E] transition">G+1 Duplex Plans</a></li>
              <li><a href="#plans" className="hover:text-[#E76F2E] transition">100% Vastu Blueprints</a></li>
            </ul>
          </div>

          {/* Col 2: Interior */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Icons.Sofa size={13} className="text-[#E76F2E]" />
              <span>Interior</span>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Modular Kitchens</a></li>
              <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Luxury Living Rooms</a></li>
              <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Master Bedroom Suites</a></li>
              <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Pooja Room Mandirs</a></li>
              <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Wardrobe &amp; Storage</a></li>
              <li><a href="#interiors" className="hover:text-[#E76F2E] transition">3D Interior Renders</a></li>
            </ul>
          </div>

          {/* Col 3: Designs */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Icons.Sparkles size={13} className="text-[#E76F2E]" />
              <span>Designs</span>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><a href="#elevations" className="hover:text-[#E76F2E] transition">3D Front Elevations</a></li>
              <li><a href="#elevations" className="hover:text-[#E76F2E] transition">Modern Duplex Elevations</a></li>
              <li><a href="#elevations" className="hover:text-[#E76F2E] transition">Tropical Kerala Roofs</a></li>
              <li><a href="#elevations" className="hover:text-[#E76F2E] transition">Contemporary CNC Jaali</a></li>
              <li><a href="#elevations" className="hover:text-[#E76F2E] transition">Neoclassical Villas</a></li>
              <li><a href="#elevations" className="hover:text-[#E76F2E] transition">Exterior Lighting</a></li>
            </ul>
          </div>

          {/* Col 4: Services */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Icons.HardHat size={13} className="text-[#E76F2E]" />
              <span>Services</span>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><a href="#services" className="hover:text-[#E76F2E] transition">2D Architectural CAD</a></li>
              <li><a href="#services" className="hover:text-[#E76F2E] transition">Structural Drawings</a></li>
              <li><a href="#services" className="hover:text-[#E76F2E] transition">PMC &amp; Site Supervision</a></li>
              <li><a href="#services" className="hover:text-[#E76F2E] transition">Vastu Consultation</a></li>
              <li><a href="#services" className="hover:text-[#E76F2E] transition">Municipal By-Laws</a></li>
              <li><a href="#contractors" className="hover:text-[#E76F2E] transition">Contractor Network</a></li>
            </ul>
          </div>

          {/* Col 5: About & Guides */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
              <Icons.Building size={13} className="text-[#E76F2E]" />
              <span>About &amp; Guides</span>
            </h4>
            <ul className="space-y-2 text-white/75">
              <li><a href="#about" className="hover:text-[#E76F2E] transition font-medium text-white">About Indore House Maker's</a></li>
              <li><a href="#calculator" className="hover:text-[#E76F2E] transition">Cost Estimator 2026</a></li>
              <li><a href="#blog" className="hover:text-[#E76F2E] transition">Vastu Rules &amp; Guides</a></li>
              <li><a href="#reviews" className="hover:text-[#E76F2E] transition">Client Video Stories</a></li>
              <li><a href="#faq" className="hover:text-[#E76F2E] transition">Help &amp; FAQs</a></li>
              <li><a href="#contact" className="hover:text-[#E76F2E] transition">Contact Architects</a></li>
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