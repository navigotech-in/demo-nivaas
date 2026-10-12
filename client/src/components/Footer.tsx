import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../lib/data'
import { Icons } from './Icons'

const AI_PROMPT = `Using the official Indore House Makers website at https://indorehousemakers.in and its verified services, explain its house plans, 3D elevations, interior-design services, construction-cost estimator, 3D walkthroughs and consultation options. Summarise the services and tell me how to get started. Use only information available on the official website.`

interface AiPlatform {
  name: string
  label: string
  icon: keyof typeof Icons
  imageSrc?: string
  getUrl: (prompt: string) => string
}

const aiPlatforms: AiPlatform[] = [
  {
    name: 'ChatGPT',
    label: 'ChatGPT',
    icon: 'ChatGPT',
    imageSrc: '/icons/ai/ChatGPT.webp',
    getUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Gemini',
    label: 'Gemini',
    icon: 'Gemini',
    imageSrc: '/icons/ai/Gemini.webp',
    getUrl: () => `https://gemini.google.com/app`,
  },
  {
    name: 'Claude',
    label: 'Claude',
    icon: 'Claude',
    imageSrc: '/icons/ai/Claude.webp',
    getUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Perplexity',
    label: 'Perplexity',
    icon: 'Perplexity',
    imageSrc: '/icons/ai/Perplexity.webp',
    getUrl: (p) => `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Copilot',
    label: 'Copilot',
    icon: 'Copilot',
    imageSrc: '/icons/ai/Copilot.webp',
    getUrl: (p) => `https://copilot.microsoft.com/?q=${encodeURIComponent(p)}`,
  },
  {
    name: 'Grok',
    label: 'Grok',
    icon: 'Grok',
    imageSrc: '/icons/ai/Grok.webp',
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
    name: 'XTwitter',
    label: 'X (Twitter)',
    icon: 'XTwitter',
    color: '#000000',
    url: 'https://x.com/indorehousemkrs',
  },
  {
    name: 'Telegram',
    label: 'Telegram',
    icon: 'Telegram',
    color: '#229ED9',
    url: 'https://t.me/indorehousemakers',
  },
]

const socialPlatforms: SocialPlatform[] = rawSocialPlatforms

interface FooterProps {
  onOpenConsult?: (query?: string) => void
  onOpenLogin?: () => void
  onOpenAiStudio?: () => void
}

export default function Footer({ onOpenConsult, onOpenLogin, onOpenAiStudio }: FooterProps) {
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
      <div className="border-b border-white/10 py-10 lg:py-12">
        <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF8A50] flex items-center gap-1.5">
              <Icons.Sparkles size={14} /> Stay Inspired &amp; Informed
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Architecture &amp; House Plan Newsletter
            </h3>
            <p className="text-xs sm:text-sm text-white/80 mt-1 max-w-lg">
              Get verified house plans, Vastu layout tips, and material cost updates delivered straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Thank you for subscribing to Indore House Makers architectural updates!')
            }}
            className="flex w-full lg:w-auto gap-2"
          >
            <div className="relative w-full sm:w-80">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-white/20 bg-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/70 outline-none focus:border-[#FF8A50] transition"
              />
              <div className="absolute left-3.5 top-3.5 text-[#FF8A50]">
                <Icons.Mail size={15} />
              </div>
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#C94F36] hover:bg-[#B33E26] px-6 py-3 text-xs font-bold text-white transition active:scale-[0.98] cursor-pointer shadow-xs"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links Container: Editorial Index Layout */}
      <div className="container-content py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Brand Column & Quick Actions (5 Cols on Desktop) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="flex items-center gap-2.5">
                <Icons.NivaasMark className="h-6 w-6 text-[#FF8A50] shrink-0" />
                <h4 className="font-display font-black text-xl text-white tracking-tight">
                  {site.name}
                </h4>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-md">
                India's premier AI-powered architecture &amp; residential home design platform. Creating intelligent Vastu blueprints, photorealistic 3D elevations, and turnkey construction support.
              </p>
            </div>

            {/* Helpline / Direct Contact & Quick Actions Card */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3 text-xs text-white/90 max-w-md">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#FF8A50]">Design Helpline</span>
                <span className="text-[10.5px] text-white/80">{site.operatingHours}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-white">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Icons.Phone size={13} className="text-[#FF8A50]" />
                  <span>{site.phone}</span>
                </span>
                <span className="flex items-center gap-1.5 text-white/80">
                  <Icons.MapPin size={13} className="text-[#FF8A50]" />
                  <span>{site.city}</span>
                </span>
              </div>

              {/* Quick Header Actions in Footer (Consult, Profile/Login, AI Studio, Cost Estimator) */}
              <div className="pt-1.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenConsult) onOpenConsult('Footer Free Consultation')
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C94F36] text-white text-[11px] font-bold hover:bg-[#B33E26] transition cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <Icons.Sparkles size={12} />
                  <span>Book Free Consultation</span>
                </button>

                {onOpenLogin && (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold hover:bg-white/20 transition cursor-pointer border border-white/15 active:scale-[0.98]"
                  >
                    <Icons.User size={12} className="text-[#FF8A50]" />
                    <span>Profile (Login / Sign Up)</span>
                  </button>
                )}

                {onOpenAiStudio && (
                  <button
                    type="button"
                    onClick={onOpenAiStudio}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-semibold hover:bg-white/20 transition cursor-pointer border border-white/15 active:scale-[0.98]"
                  >
                    <Icons.Sparkles size={12} className="text-[#FFA366]" />
                    <span>AI Studio</span>
                  </button>
                )}

                <Link
                  to="/cost-estimator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-white text-[11px] font-medium hover:bg-white/15 transition cursor-pointer border border-white/15"
                >
                  <Icons.Calculator size={12} className="text-[#FF8A50]" />
                  <span>Cost Estimator</span>
                </Link>
              </div>
            </div>

            {/* Popular Links */}
            <div className="pt-1">
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#FF8A50] block mb-2">
                POPULAR LINKS
              </span>
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-white/85 font-medium">
                <Link to="/house-plans" className="hover:text-[#FF8A50] transition">House Plans</Link>
                <span className="text-white/50">·</span>
                <Link to="/cost-estimator" className="hover:text-[#FF8A50] transition">Cost Estimator</Link>
                <span className="text-white/50">·</span>
                <Link to="/guides" className="hover:text-[#FF8A50] transition">Guides</Link>
                <span className="text-white/50">·</span>
                <Link to="/about" className="hover:text-[#FF8A50] transition">About Us</Link>
                <span className="text-white/50">·</span>
                <Link to="/faq" className="hover:text-[#FF8A50] transition">FAQs</Link>
                <span className="text-white/50">·</span>
                <Link to="/contact" className="hover:text-[#FF8A50] transition">Contact</Link>
                {onOpenLogin && (
                  <>
                    <span className="text-white/50">·</span>
                    <button
                      type="button"
                      onClick={onOpenLogin}
                      className="hover:text-[#FF8A50] transition cursor-pointer font-semibold"
                    >
                      Login / Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Editorial Index Numbered Rows (Direct Navigation) */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-white/80">
                DIRECTORY INDEX
              </span>
              <span className="text-[10.5px] text-white/75">
                Direct page access →
              </span>
            </div>

            <div className="divide-y divide-white/10 border-y border-white/10">
              {/* 01 Architecture */}
              <Link
                to="/house-plans"
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">01</span>
                  <span>Architecture &amp; House Plans</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                  <span>Explore House Plans</span>
                  <span>→</span>
                </span>
              </Link>

              {/* 02 Interiors */}
              <Link
                to="/interiors"
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">02</span>
                  <span>Interiors Studio</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                  <span>Modular &amp; Luxury</span>
                  <span>→</span>
                </span>
              </Link>

              {/* 03 Designs */}
              <Link
                to="/designs"
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">03</span>
                  <span>3D Front Elevations &amp; Facades</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                  <span>Design Ideas</span>
                  <span>→</span>
                </span>
              </Link>

              {/* 04 Services */}
              <Link
                to="/services"
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">04</span>
                  <span>Architectural &amp; Turnkey Services</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                  <span>CAD &amp; PMC</span>
                  <span>→</span>
                </span>
              </Link>

              {/* 05 About Indore House Makers */}
              <Link
                to="/about"
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">05</span>
                  <span>About Indore House Makers</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                  <span>Our Story</span>
                  <span>→</span>
                </span>
              </Link>

              {/* 06 Help & FAQs */}
              <Link
                to="/faq"
                className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left"
              >
                <span className="flex items-center gap-3.5">
                  <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">06</span>
                  <span>Help &amp; Frequently Asked Questions</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                  <span>Support Desk</span>
                  <span>→</span>
                </span>
              </Link>

              {/* 07 User Account & Login */}
              {onOpenLogin && (
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="w-full flex items-center justify-between py-4 px-2 text-sm sm:text-base font-bold text-white hover:text-[#FF8A50] hover:bg-white/[0.02] transition group text-left cursor-pointer"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="font-mono text-xs font-semibold text-[#FF8A50] w-6">07</span>
                    <span className="flex items-center gap-2">
                      <Icons.User size={16} className="text-[#FF8A50]" />
                      <span>User Account (Login / Sign Up)</span>
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-white/75 group-hover:text-[#FF8A50] group-hover:translate-x-1 transition-all">
                    <span>Access Plans &amp; Dashboard</span>
                    <span>→</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Warm-White Inset Band: Ask AI About Indore House Makers + Connect With Indore House Makers */}
      <section
        aria-label="AI and Social Connections"
        className="bg-[#FDFCF9] text-[#292725] border-y border-[#E7E0D7] py-4 sm:py-5 px-3 sm:px-4"
      >
        <div className="container-content">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-5 lg:gap-8">
            {/* Left Column: Ask AI About Indore House Makers */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-black tracking-tight flex items-center gap-1.5 shrink-0">
                <Icons.Sparkles size={14} className="text-[#B83E26]" />
                <span className="text-black font-extrabold">Ask AI About Indore House Makers:</span>
              </h4>

              {/* 6 AI Logo Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                {aiPlatforms.map((ai) => {
                  const IconComponent = Icons[ai.icon]
                  return (
                    <button
                      key={ai.name}
                      type="button"
                      onClick={() => handleAiClick(ai)}
                      className="h-9 w-9 sm:h-10 sm:w-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:scale-105 transition-transform bg-transparent hover:bg-black/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B83E26]/30 group p-1.5"
                      title={`Ask ${ai.name} about Indore House Makers (Prompt copied automatically)`}
                      aria-label={`Ask ${ai.name} about Indore House Makers`}
                    >
                      {ai.imageSrc ? (
                        <img
                          src={ai.imageSrc}
                          alt={ai.name}
                          width={22}
                          height={22}
                          className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain transition-transform group-hover:scale-105"
                          loading="lazy"
                          decoding="async"
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
                  className="text-[10px] text-[#B83E26] font-semibold flex items-center gap-1 bg-[#B83E26]/10 border border-[#B83E26]/25 px-2 py-0.5 rounded animate-pulse mt-1 sm:mt-0"
                >
                  <Icons.Check size={11} /> {copiedStatus}
                </span>
              )}
            </div>

            {/* Subtle Divider: Desktop vertical, Mobile horizontal */}
            <div className="hidden lg:block w-px h-7 bg-[#E7E0D7] self-center shrink-0" aria-hidden="true" />
            <div className="block lg:hidden w-full h-px bg-[#E7E0D7]/70 my-1" aria-hidden="true" />

            {/* Right Column: Connect With Indore House Makers */}
            <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-2.5 sm:gap-3.5">
              <h4 className="text-xs sm:text-sm font-extrabold text-black tracking-tight flex items-center gap-1.5 shrink-0">
                <Icons.Share size={14} className="text-[#B83E26]" />
                <span className="text-black font-extrabold">Connect With Indore House Makers:</span>
              </h4>

              {/* 8 Social Logo Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
                {socialPlatforms.map((soc) => {
                  const IconComponent = Icons[soc.icon]
                  return (
                    <a
                      key={soc.name}
                      href={soc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-9 w-9 sm:h-10 sm:w-10 min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-lg hover:scale-105 transition-transform bg-transparent hover:bg-black/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#B83E26]/30 group p-1.5"
                      title={`Follow Indore House Makers on ${soc.name}`}
                      aria-label={`Follow Indore House Makers on ${soc.name}`}
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
                width={50}
                height={22}
                className="h-5 sm:h-5.5 w-auto object-contain"
                loading="lazy"
                decoding="async"
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
                  width={48}
                  height={16}
                  className="h-3.5 sm:h-4 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/payment-logos/mastercard.svg"
                  alt="Mastercard"
                  width={34}
                  height={20}
                  className="h-4.5 sm:h-5 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/payment-logos/rupay.svg"
                  alt="RuPay"
                  width={60}
                  height={18}
                  className="h-4 sm:h-4.5 w-auto object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="h-4 w-px bg-white/15 shrink-0" aria-hidden="true" />

            {/* Net Banking */}
            <span className="text-xs font-semibold text-[#E0DBD5] hover:opacity-80 transition-opacity tracking-tight shrink-0">
              Net Banking
            </span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 pb-20 md:pb-24 lg:pb-6 text-xs text-white/85">
        <div className="container-content flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {site.name} — Residential Architecture &amp; Home Design Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-white/90">
            <Link to="/about" className="hover:text-[#FF8A50] transition">Privacy Policy</Link>
            <span>·</span>
            <Link to="/about" className="hover:text-[#FF8A50] transition">Terms &amp; Conditions</Link>
            <span>·</span>
            <Link to="/house-plans" className="hover:text-[#FF8A50] transition">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}