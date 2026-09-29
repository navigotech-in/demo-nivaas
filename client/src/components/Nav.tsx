import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { megaMenus, site } from '../lib/data'
import { Icons } from './Icons'

const NivaasAiStudio = lazy(() => import('./NivaasAiStudio'))

interface NavProps {
  onOpenConsult: (req?: string) => void
  onOpenLogin: () => void
  onOpenAiStudio?: () => void
}

export default function Nav({ onOpenConsult, onOpenLogin, onOpenAiStudio }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newsOpen, setNewsOpen] = useState(false)
  const [aiStudioOpen, setAiStudioOpen] = useState(false)
  const [aiStudioMode, setAiStudioMode] = useState<'generator' | 'chat'>('generator')
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const sampleSearchSuggestions = [
    '30x50 East Facing House Plan',
    '20x40 2 BHK Modern Duplex',
    '40x60 Luxury Villa with Courtyard',
    '25x40 Budget Home Vastu Plan',
    '3 BHK Modular Kitchen Layout',
    '1500 sq.ft G+1 Elevation Design',
    'House Plans in Hyderabad (GHMC)',
    'Modern Duplex in Bengaluru (BBMP)',
    'Luxury Villas in Delhi NCR & Gurugram',
    '2 BHK & 3 BHK Plans in Pune',
    'Heritage Courtyard Plans in Jaipur',
    'Modern Bungalow Plans in Indore',
    'Coastal Duplex Plans in Mumbai',
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <>
      {/* Top Bar / Helpline */}
      <div className="bg-white text-[#292826] text-xs py-2 px-4 border-b border-[#E7E0D7] hidden md:block">
        <div className="container-content flex items-center justify-between" style={{ paddingLeft: 'clamp(0.25rem, 1.25vw, 1.25rem)', paddingRight: 'clamp(0.25rem, 1.25vw, 1.25rem)' }}>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#292826]">
              <span className="text-sm">🇮🇳</span> India's Leading Residential Architecture & Blueprints Platform
            </span>
            <span className="text-[#54504A]">|</span>
            <span className="flex items-center gap-1.5 text-[#292826]">
              <Icons.Blueprint size={14} className="text-[#292826]" /> 12,000+ Verified Floor Plans
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="hover:text-[#292826] transition flex items-center gap-1.5">
              <Icons.Phone size={13} className="text-[#E76F2E]" />
              <span>Call: {site.phone}</span>
            </a>
            <span className="text-[#54504A]">|</span>
            <a
              href={`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#292826] transition flex items-center gap-1.5 font-semibold"
            >
              <Icons.WhatsApp size={14} className="text-[#E76F2E]" />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        ref={navRef}
        className="sticky top-0 z-50 bg-white text-[#292826] border-b border-[#E7E0D7] shadow-xs"
      >
        {/* ========================================================================= */}
        {/* DESKTOP HEADER (1-Tier Unified Bar: visible on xl and up)                 */}
        {/* ========================================================================= */}
        <div className="hidden xl:block bg-white py-3">
          <div className="container-content flex items-center justify-between gap-6" style={{ paddingLeft: 'clamp(0.25rem, 1.25vw, 1.25rem)', paddingRight: 'clamp(0.25rem, 1.25vw, 1.25rem)' }}>
            {/* Brand Logo & Tagline */}
            <a href="#top" className="inline-flex shrink-0 flex-col items-start">
              <div className="flex h-6.5 items-center gap-2 sm:gap-2.5">
                <Icons.NivaasMark className="h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 text-[#C94F36]" />
                <span className="whitespace-nowrap text-[16px] xl:text-[17px] font-black leading-6 text-[#292725] tracking-tight">
                  {site.name}
                </span>
              </div>
              <span className="mt-0.5 w-full whitespace-nowrap text-left text-[7.5px] sm:text-[8px] font-bold leading-none tracking-[0.09em] text-[#54504A]">
                AI-POWERED ARCHITECTURE &amp; DESIGNS
              </span>
            </a>

            {/* Desktop Mega Nav Menu */}
            <nav className="flex items-center gap-4 xl:gap-5 text-[13px] font-medium">
              {/* Architecture Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown('arch')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
                >
                  <Icons.Blueprint size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                  <span>Architecture</span>
                  <Icons.ChevronDown size={13} className="text-[#54504A]" />
                </button>

                {activeDropdown === 'arch' && (
                  <div className="absolute left-0 top-full pt-2 w-[820px] animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-sm border border-[#EEE9E3] p-6 grid grid-cols-4 gap-6 text-[#292826]">
                      {megaMenus.architecture.map((col) => (
                        <div key={col.title}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#292826] border-b border-[#EEE9E3] pb-2 mb-2.5 flex items-center gap-1.5">
                            {col.title.includes('Style') ? <Icons.Building size={13} className="text-[#E76F2E]" /> : col.title.includes('Storey') || col.title.includes('Elevation') ? <Icons.Layers size={13} className="text-[#E76F2E]" /> : col.title.includes('Bedroom') ? <Icons.Bed size={13} className="text-[#E76F2E]" /> : <Icons.Compass size={13} className="text-[#E76F2E]" />}
                            <span>{col.title}</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs">
                            {col.items.map((item) => (
                              <li key={item.label}>
                                <a
                                  href={item.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[#54504A] hover:text-[#292826] hover:font-semibold flex items-center justify-between py-0.5 transition"
                                >
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[9px] bg-[#FFF6E8] text-[#54504A] border border-[#E7E0D7] px-1.5 py-0.2 rounded font-bold">
                                      {item.badge}
                                    </span>
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interior Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown('interior')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
                >
                  <Icons.Sofa size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                  <span>Interior</span>
                  <Icons.ChevronDown size={13} className="text-[#54504A]" />
                </button>

                {activeDropdown === 'interior' && (
                  <div className="absolute left-0 top-full pt-2 w-[760px] animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-sm border border-[#EEE9E3] p-6 grid grid-cols-4 gap-6 text-[#292826]">
                      {megaMenus.interior.map((col) => (
                        <div key={col.title}>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#292826] border-b border-[#EEE9E3] pb-2 mb-2.5 flex items-center gap-1.5">
                            <Icons.Home size={13} className="text-[#E76F2E]" />
                            <span>{col.title}</span>
                          </h4>
                          <ul className="space-y-1.5 text-xs">
                            {col.items.map((item) => (
                              <li key={item.label}>
                                <a
                                  href={item.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[#54504A] hover:text-[#292826] hover:font-semibold py-0.5 block transition"
                                >
                                  {item.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Design Ideas Dropdown */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown('ideas')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
                >
                  <Icons.Sparkles size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                  <span>Designs</span>
                  <Icons.ChevronDown size={13} className="text-[#54504A]" />
                </button>

                {activeDropdown === 'ideas' && (
                  <div className="absolute left-0 top-full pt-2 w-[360px] animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-sm border border-[#EEE9E3] p-4 text-[#292826] space-y-2">
                      {megaMenus.designIdeas.map((idea) => (
                        <a
                          key={idea.label}
                          href={idea.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block p-2.5 rounded-lg hover:bg-[#FFF6E8] transition"
                        >
                          <div className="text-xs font-semibold text-[#292826] flex items-center gap-1.5">
                            <Icons.Layers size={13} className="text-[#E76F2E]" /> {idea.label}
                          </div>
                          <div className="text-[11px] text-[#54504A] mt-0.5">{idea.desc}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Other Services */}
              <div
                className="relative group"
                onMouseEnter={() => setActiveDropdown('services')}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
                >
                  <Icons.HardHat size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                  <span>Services</span>
                  <Icons.ChevronDown size={13} className="text-[#54504A]" />
                </button>

                {activeDropdown === 'services' && (
                  <div className="absolute left-0 top-full pt-2 w-[360px] animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-sm border border-[#EEE9E3] p-4 text-[#292826] space-y-2">
                      {megaMenus.otherServices.map((srv) => (
                        <a
                          key={srv.label}
                          href={srv.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block p-2.5 rounded-lg hover:bg-[#FFF6E8] transition"
                        >
                          <div className="text-xs font-semibold text-[#292826] flex items-center gap-1.5">
                            <Icons.ShieldCheck size={13} className="text-[#E76F2E]" /> {srv.label}
                          </div>
                          <div className="text-[11px] text-[#54504A] mt-0.5">{srv.desc}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* About Section */}
              <a
                href="#about"
                className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
              >
                <Icons.Building size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                <span>About</span>
              </a>

              {/* Cost Estimator */}
              <a
                href="#calculator"
                className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
              >
                <Icons.Calculator size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                <span>Cost Estimator</span>
              </a>

              {/* Guides / Blogs */}
              <a
                href="#blog"
                className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
              >
                <Icons.FileText size={15} className="text-[#292826] group-hover:text-[#E76F2E]" />
                <span>Guides</span>
              </a>
            </nav>

            {/* Desktop Action Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Search Button */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] text-xs font-semibold text-[#54504A] hover:border-[#E76F2E] hover:text-[#292826] transition shadow-xs"
                title="Search House Plans & Designs"
              >
                <Icons.Search size={14} className="text-[#E76F2E]" />
                <span className="hidden 2xl:inline">Search Plans...</span>
              </button>

              {/* Ask AI Studio Button */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenAiStudio) onOpenAiStudio()
                  else {
                    setAiStudioMode('generator')
                    setAiStudioOpen(true)
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg border border-[#E76F2E] bg-[#FFF6E8] text-[#E76F2E] hover:bg-[#E76F2E] hover:text-white transition shadow-xs whitespace-nowrap"
              >
                <Icons.Sparkles size={13} />
                <span>Ask AI Studio</span>
              </button>

              {/* Consult Online Button */}
              <button
                type="button"
                onClick={() => onOpenConsult()}
                className="px-3.5 py-2 rounded-lg text-xs font-bold border border-[#E76F2E] bg-[#E76F2E] text-white hover:bg-[#C65320] transition active:scale-[0.98] flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Icons.Phone size={13} className="shrink-0" />
                <span>Consult Online</span>
              </button>

              {/* Login / Profile Button */}
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center justify-center h-9 w-9 rounded-lg border border-[#E7E0D7] bg-white text-[#E76F2E] hover:bg-[#FFF6E8] transition"
                aria-label="User Account Login or Signup"
                title="Login / Signup"
              >
                <Icons.User size={17} className="text-[#E76F2E] shrink-0" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE HEADER (2-Tier Layout: visible on mobile / tablet < xl)            */}
        {/* ========================================================================= */}
        <div className="xl:hidden">
          {/* Tier 1: 1st Top Header (Logo + Brand + Tagline + Dashboard Trigger + Menu) */}
          <div className="bg-white border-b border-[#E7E0D7]/70 py-2.5 px-3 sm:px-4">
            <div className="flex items-center justify-between w-full gap-2">
              {/* Brand Logo + Title + Subtitle */}
              <a href="#top" className="inline-flex shrink-0 flex-col items-start min-w-0">
                <div className="flex h-6.5 items-center gap-2">
                  <Icons.NivaasMark className="h-5.5 w-5.5 sm:h-6 sm:w-6 shrink-0 text-[#C94F36]" />
                  <span className="whitespace-nowrap text-[15px] sm:text-[17px] font-black leading-tight text-[#292725] tracking-tight truncate">
                    {site.name}
                  </span>
                </div>
                <span className="mt-0.5 w-full whitespace-nowrap text-left text-[7.5px] sm:text-[8px] font-bold leading-none tracking-[0.08em] text-[#54504A]">
                  AI-POWERED ARCHITECTURE &amp; DESIGNS
                </span>
              </a>

              {/* Right Side: Dashboard Button + Hamburger Menu */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] text-xs font-bold text-[#E76F2E] hover:bg-[#E76F2E] hover:text-white transition shadow-xs whitespace-nowrap"
                  title="Open Categories Dashboard"
                >
                  <Icons.Layers size={13} className="text-[#E76F2E]" />
                  <span>Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="flex items-center justify-center h-8.5 w-8.5 rounded-lg text-[#292826] hover:bg-[#FFF6E8] border border-[#E7E0D7] transition"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <Icons.Close size={18} /> : <Icons.Menu size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Tier 2: 2nd Header Sub-Header Row (Search Bar, Ask AI Studio, Consult Online, Login Profile) */}
          <div className="bg-[#FDFCF9] py-2 px-2.5 sm:px-4 border-b border-[#E7E0D7]">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2.5">
              {/* Search Bar Input */}
              <div className="flex-1 min-w-0 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchOpen(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (!searchOpen) setSearchOpen(true)
                  }}
                  placeholder="Search 30x50, 2 BHK, Vastu..."
                  className="w-full rounded-lg border border-[#E7E0D7] bg-white pl-8 pr-2 py-1.5 text-[11.5px] sm:text-xs text-[#292826] placeholder:text-[#54504A]/70 outline-none focus:border-[#E76F2E] focus:ring-1 focus:ring-[#E76F2E]"
                />
                <div className="absolute left-2.5 top-2 text-[#E76F2E]">
                  <Icons.Search size={13} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                {/* Ask AI Studio Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAiStudio) onOpenAiStudio()
                    else {
                      setAiStudioMode('generator')
                      setAiStudioOpen(true)
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-[11px] sm:text-xs font-bold rounded-lg border border-[#E76F2E] bg-[#FFF6E8] text-[#E76F2E] hover:bg-[#E76F2E] hover:text-white transition shadow-xs whitespace-nowrap"
                  title="Ask AI Studio"
                >
                  <Icons.Sparkles size={12} className="shrink-0" />
                  <span className="hidden xs:inline">Ask AI</span>
                </button>

                {/* Consult Online Button */}
                <button
                  type="button"
                  onClick={() => onOpenConsult()}
                  className="px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold border border-[#E76F2E] bg-[#E76F2E] text-white hover:bg-[#C65320] transition active:scale-[0.98] flex items-center gap-1 whitespace-nowrap shadow-xs"
                  title="Consult Online"
                >
                  <Icons.Phone size={12} className="shrink-0" />
                  <span>Consult</span>
                </button>

                {/* User Account Login */}
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="flex items-center justify-center h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 rounded-lg border border-[#E7E0D7] bg-white text-[#E76F2E] hover:bg-[#FFF6E8] transition shrink-0"
                  aria-label="User Account Login or Signup"
                  title="Login / Signup"
                >
                  <Icons.User size={15} className="text-[#E76F2E] shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Search Bar Suggestions Overlay (Does NOT push page content down) */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md text-[#292826] p-3 sm:p-4 shadow-2xl animate-fadeIn border-b border-[#E7E0D7] z-50">
            <div className="container-content max-w-3xl relative">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plot dimensions (e.g. 30x50, 40x60), BHK, Direction or City..."
                    className="w-full rounded-lg border border-[#E7E0D7] pl-9 sm:pl-10 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm outline-none focus:border-[#E76F2E] focus:ring-1 focus:ring-[#E76F2E] bg-[#FDFCF9]"
                  />
                  <div className="absolute left-3 top-2.5 sm:top-3 text-[#E76F2E]">
                    <Icons.Search size={15} />
                  </div>
                </div>
                <a
                  href="#plans"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 bg-[#E76F2E] text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-[#C65320] transition shadow-xs"
                >
                  Search
                </a>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0 flex items-center justify-center h-8 w-8 sm:h-9 sm:w-9 rounded-lg text-[#54504A] hover:text-[#292826] hover:bg-[#FFF6E8] border border-[#E7E0D7] transition"
                  aria-label="Close search dropdown"
                  title="Close Search"
                >
                  <Icons.Close size={16} />
                </button>
              </div>

              {/* Suggestions */}
              {sampleSearchSuggestions.length > 0 && (
                <div className="mt-2.5 rounded-lg border border-[#EEE9E3] bg-white shadow-md p-2 text-xs max-h-[50vh] overflow-y-auto">
                  <div className="px-2 py-1 text-[#54504A] font-bold uppercase text-[10px] flex items-center gap-1">
                    <Icons.Sparkles size={11} className="text-[#E76F2E]" /> Quick Search Queries
                  </div>
                  {sampleSearchSuggestions.map((sug) => (
                    <a
                      key={sug}
                      href="#plans"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FFF6E8] text-[#292826] font-medium transition"
                    >
                      <Icons.Search size={13} className="text-[#E76F2E]" />
                      <span>{sug}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Dashboard & Navigation Drawer (Headings only by default, click to expand data) */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white text-[#292826] border-t border-[#E7E0D7] px-4 py-4 space-y-3 max-h-[85vh] overflow-y-auto">
            {/* Dashboard Categories Header */}
            <div className="flex items-center justify-between border-b border-[#EEE9E3] pb-2.5">
              <div className="flex items-center gap-2">
                <Icons.Layers size={16} className="text-[#E76F2E]" />
                <h3 className="font-display font-bold text-xs sm:text-sm text-[#292826] uppercase tracking-wide">
                  Categories Dashboard
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-bold text-[#54504A] hover:text-[#E76F2E] px-2 py-1"
              >
                Close ✕
              </button>
            </div>

            {/* Accordion Categories: Only Heading visible, click expands */}
            <div className="space-y-2">
              {/* 1. Architecture */}
              <div className="rounded-lg border border-[#EEE9E3] overflow-hidden bg-[#FDFCF9]">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === 'arch' ? null : 'arch')}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[#292826] hover:bg-[#FFF6E8] transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Icons.Blueprint size={15} className="text-[#E76F2E]" />
                    <span>Architecture &amp; House Plans</span>
                  </span>
                  <Icons.ChevronDown
                    size={15}
                    className={`text-[#54504A] transition-transform duration-200 ${
                      expandedCategory === 'arch' ? 'rotate-180 text-[#E76F2E]' : ''
                    }`}
                  />
                </button>
                {expandedCategory === 'arch' && (
                  <div className="p-3 bg-white border-t border-[#EEE9E3] grid grid-cols-2 gap-2 text-xs text-[#54504A] animate-fadeIn">
                    <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">30 x 50 House Plans</a>
                    <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">20 x 40 House Plans</a>
                    <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">25 x 40 House Plans</a>
                    <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">40 x 60 House Plans</a>
                    <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">G+1 Duplex Plans</a>
                    <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">100% Vastu Plans</a>
                  </div>
                )}
              </div>

              {/* 2. Interior */}
              <div className="rounded-lg border border-[#EEE9E3] overflow-hidden bg-[#FDFCF9]">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === 'interior' ? null : 'interior')}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[#292826] hover:bg-[#FFF6E8] transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Icons.Sofa size={15} className="text-[#E76F2E]" />
                    <span>Interior Designs &amp; Rooms</span>
                  </span>
                  <Icons.ChevronDown
                    size={15}
                    className={`text-[#54504A] transition-transform duration-200 ${
                      expandedCategory === 'interior' ? 'rotate-180 text-[#E76F2E]' : ''
                    }`}
                  />
                </button>
                {expandedCategory === 'interior' && (
                  <div className="p-3 bg-white border-t border-[#EEE9E3] grid grid-cols-2 gap-2 text-xs text-[#54504A] animate-fadeIn">
                    <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Living Rooms</a>
                    <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Modular Kitchens</a>
                    <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Master Bedrooms</a>
                    <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Pooja Rooms</a>
                    <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Wardrobe Design</a>
                    <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Dining &amp; Hall</a>
                  </div>
                )}
              </div>

              {/* 3. 3D Elevation */}
              <div className="rounded-lg border border-[#EEE9E3] overflow-hidden bg-[#FDFCF9]">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === 'elevation' ? null : 'elevation')}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[#292826] hover:bg-[#FFF6E8] transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Icons.Sparkles size={15} className="text-[#E76F2E]" />
                    <span>3D Elevation Designs</span>
                  </span>
                  <Icons.ChevronDown
                    size={15}
                    className={`text-[#54504A] transition-transform duration-200 ${
                      expandedCategory === 'elevation' ? 'rotate-180 text-[#E76F2E]' : ''
                    }`}
                  />
                </button>
                {expandedCategory === 'elevation' && (
                  <div className="p-3 bg-white border-t border-[#EEE9E3] grid grid-cols-2 gap-2 text-xs text-[#54504A] animate-fadeIn">
                    <a href="#elevations" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Modern Duplex</a>
                    <a href="#elevations" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Tropical / Kerala</a>
                    <a href="#elevations" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Contemporary Jaali</a>
                    <a href="#elevations" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Neo-Classical Villa</a>
                    <a href="#elevations" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Glass Facade</a>
                    <a href="#elevations" onClick={() => setMobileMenuOpen(false)} className="py-1.5 px-2 rounded-md hover:bg-[#FFF6E8] hover:text-[#E76F2E] font-medium">Wooden Texture</a>
                  </div>
                )}
              </div>

              {/* 4. Services & Contractors */}
              <div className="rounded-lg border border-[#EEE9E3] overflow-hidden bg-[#FDFCF9]">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === 'services' ? null : 'services')}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[#292826] hover:bg-[#FFF6E8] transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Icons.HardHat size={15} className="text-[#E76F2E]" />
                    <span>Services &amp; Contractors</span>
                  </span>
                  <Icons.ChevronDown
                    size={15}
                    className={`text-[#54504A] transition-transform duration-200 ${
                      expandedCategory === 'services' ? 'rotate-180 text-[#E76F2E]' : ''
                    }`}
                  />
                </button>
                {expandedCategory === 'services' && (
                  <div className="p-3 bg-white border-t border-[#EEE9E3] flex flex-col gap-2 text-xs text-[#54504A] animate-fadeIn">
                    <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">2D Architectural &amp; Working Drawings</a>
                    <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">Structural CAD &amp; Engineering Layouts</a>
                    <a href="#contractors" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">Verified Contractor &amp; Trade Network</a>
                    <a href="#services" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">PMC &amp; On-Site Construction Supervision</a>
                  </div>
                )}
              </div>

              {/* 5. About & Guides */}
              <div className="rounded-lg border border-[#EEE9E3] overflow-hidden bg-[#FDFCF9]">
                <button
                  type="button"
                  onClick={() => setExpandedCategory(expandedCategory === 'about' ? null : 'about')}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold uppercase tracking-wider text-[#292826] hover:bg-[#FFF6E8] transition text-left cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Icons.Building size={15} className="text-[#E76F2E]" />
                    <span>About &amp; Guides</span>
                  </span>
                  <Icons.ChevronDown
                    size={15}
                    className={`text-[#54504A] transition-transform duration-200 ${
                      expandedCategory === 'about' ? 'rotate-180 text-[#E76F2E]' : ''
                    }`}
                  />
                </button>
                {expandedCategory === 'about' && (
                  <div className="p-3 bg-white border-t border-[#EEE9E3] flex flex-col gap-2 text-xs text-[#54504A] animate-fadeIn">
                    <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">About Indore House Maker's</a>
                    <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">Real-Time Cost Estimator 2026</a>
                    <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">Vastu Rules &amp; Construction Guides</a>
                    <a href="#reviews" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">Client Testimonial Stories</a>
                    <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="py-1 px-2 rounded hover:bg-[#FFF6E8] hover:text-[#E76F2E]">Frequently Asked Questions</a>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Action CTAs */}
            <div className="border-t border-[#EEE9E3] pt-3 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  if (onOpenAiStudio) onOpenAiStudio()
                  else {
                    setAiStudioMode('generator')
                    setAiStudioOpen(true)
                  }
                }}
                className="w-full py-2.5 rounded-lg border-2 border-[#E76F2E] bg-[#FFF6E8] text-[#E76F2E] font-bold text-xs text-center flex items-center justify-center gap-2 hover:bg-[#E76F2E] hover:text-white transition shadow-xs cursor-pointer"
              >
                <Icons.Sparkles size={14} />
                <span>Ask AI Studio Floor Plan Generator</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenConsult()
                }}
                className="w-full py-2.5 rounded-lg border border-[#E76F2E] bg-[#E76F2E] text-white font-bold text-xs text-center hover:bg-[#C65320] transition shadow-xs cursor-pointer"
              >
                Book Free Architect Consultation
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenLogin()
                }}
                className="w-full py-2 rounded-lg border border-[#E7E0D7] bg-white text-[#292826] font-bold text-xs text-center hover:bg-[#FFF6E8] transition cursor-pointer"
              >
                User Login / Register
              </button>
            </div>
          </div>
        )}
      </header>

      {/* News & Spotlight Modal */}
      {newsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1815]/70 p-4 ">
          <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-[#E7E0D7] text-[#292826]">
            <div className="flex items-center justify-between border-b border-[#EEE9E3] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📰</span>
                <h3 className="font-display text-lg font-bold text-[#292826]">Indore House Maker's in the News</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#54504A] hover:bg-[#FFF6E8] text-[#54504A]"
              >
                <Icons.Close size={16} />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#EEE9E3]">
                <span className="text-[10px] font-bold uppercase text-[#292826] bg-[#F1ECE5] px-2 py-0.5 rounded">
                  Press Release · 2026
                </span>
                <h4 className="font-display text-sm font-bold text-[#292826]">
                  Indore House Maker's crosses 12,000 verified residential plans milestone across India
                </h4>
                <p className="mt-1 text-xs text-[#54504A]">
                  Empowering independent home builders across Tier 1, 2 and 3 cities with instant CAD working drawings and 3D architectural elevations.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[#FDFCF9] border border-[#EEE9E3]">
                <span className="text-[10px] font-bold uppercase text-[#292826] bg-[#F1ECE5] px-2 py-0.5 rounded">
                  Technology Innovation
                </span>
                <h4 className="font-display text-sm font-bold text-[#292826]">
                  AI-Powered Vastu and Setback Compliance Engine launched
                </h4>
                <p className="mt-1 text-xs text-[#54504A]">
                  Automatic layout validation for local municipal bylaws in Hyderabad (GHMC), Bangalore (BBMP), and Delhi NCR (DDA).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Architect Studio (Guided Flow + AI Assistant) */}
      {aiStudioOpen && (
        <Suspense fallback={null}>
          <NivaasAiStudio
            open={aiStudioOpen}
            onClose={() => setAiStudioOpen(false)}
            onOpenConsult={(planDetails) => {
              setAiStudioOpen(false)
              onOpenConsult(planDetails)
            }}
            initialMode={aiStudioMode}
          />
        </Suspense>
      )}
    </>
  )
}