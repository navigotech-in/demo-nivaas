import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
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

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('mobile-menu-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('mobile-menu-open')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false)
        setSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('mobile-menu-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [mobileMenuOpen])

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
              <Icons.Blueprint size={14} className="text-[#292826]" /> 480+ Verified House Plans
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
            <Link to="/" className="inline-flex shrink-0 flex-col items-start">
              <div className="flex h-6.5 items-center gap-2 sm:gap-2.5">
                <Icons.NivaasMark className="h-5 w-5 sm:h-5.5 sm:w-5.5 shrink-0 text-[#C94F36]" />
                <span className="whitespace-nowrap text-[16px] xl:text-[17px] font-black leading-6 text-[#292725] tracking-tight">
                  {site.name}
                </span>
              </div>
              <span className="mt-0.5 w-full whitespace-nowrap text-left text-[7.5px] sm:text-[8px] font-bold leading-none tracking-[0.09em] text-[#54504A]">
                AI-POWERED ARCHITECTURE &amp; DESIGNS
              </span>
            </Link>

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
                                <Link
                                  to={item.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[#54504A] hover:text-[#292826] hover:font-semibold flex items-center justify-between py-0.5 transition"
                                >
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="text-[9px] bg-[#FFF6E8] text-[#54504A] border border-[#E7E0D7] px-1.5 py-0.2 rounded font-bold">
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
                                <Link
                                  to={item.href}
                                  onClick={() => setActiveDropdown(null)}
                                  className="text-[#54504A] hover:text-[#292826] hover:font-semibold py-0.5 block transition"
                                >
                                  {item.label}
                                </Link>
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
                        <Link
                          key={idea.label}
                          to={idea.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block p-2.5 rounded-lg hover:bg-[#FFF6E8] transition"
                        >
                          <div className="text-xs font-semibold text-[#292826] flex items-center gap-1.5">
                            <Icons.Layers size={13} className="text-[#E76F2E]" /> {idea.label}
                          </div>
                          <div className="text-[11px] text-[#54504A] mt-0.5">{idea.desc}</div>
                        </Link>
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
                        <Link
                          key={srv.label}
                          to={srv.href}
                          onClick={() => setActiveDropdown(null)}
                          className="block p-2.5 rounded-lg hover:bg-[#FFF6E8] transition"
                        >
                          <div className="text-xs font-semibold text-[#292826] flex items-center gap-1.5">
                            <Icons.ShieldCheck size={13} className="text-[#E76F2E]" /> {srv.label}
                          </div>
                          <div className="text-[11px] text-[#54504A] mt-0.5">{srv.desc}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* About Section */}
              <Link
                to="/about"
                className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
              >
                <Icons.Building size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                <span>About</span>
              </Link>

              {/* Cost Estimator */}
              <Link
                to="/cost-estimator"
                className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
              >
                <Icons.Calculator size={16} className="text-[#292826] group-hover:text-[#E76F2E]" />
                <span>Cost Estimator</span>
              </Link>

              {/* Guides / Blogs */}
              <Link
                to="/guides"
                className="flex items-center gap-1.5 py-1.5 transition hover:text-[#E76F2E] font-semibold text-[#292826]"
              >
                <Icons.FileText size={15} className="text-[#292826] group-hover:text-[#E76F2E]" />
                <span>Guides</span>
              </Link>
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
              <Link to="/" className="inline-flex shrink-0 flex-col items-start min-w-0">
                <div className="flex h-6.5 items-center gap-2">
                  <Icons.NivaasMark className="h-5.5 w-5.5 sm:h-6 sm:w-6 shrink-0 text-[#C94F36]" />
                  <span className="whitespace-nowrap text-[15px] sm:text-[17px] font-black leading-tight text-[#292725] tracking-tight truncate">
                    {site.name}
                  </span>
                </div>
                <span className="mt-0.5 w-full whitespace-nowrap text-left text-[7.5px] sm:text-[8px] font-bold leading-none tracking-[0.08em] text-[#54504A]">
                  AI-POWERED ARCHITECTURE &amp; DESIGNS
                </span>
              </Link>

              {/* Right Side: Hamburger Icon + Menu Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] text-xs font-bold text-[#292826] hover:text-[#E76F2E] hover:border-[#E76F2E] transition shadow-xs whitespace-nowrap cursor-pointer active:scale-95"
                  aria-label="Open Navigation Menu"
                  title="Open Menu"
                >
                  <Icons.Menu size={16} className="text-[#E76F2E]" />
                  <span>Menu</span>
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
                    <Link
                      key={sug}
                      to="/house-plans"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#FFF6E8] text-[#292826] font-medium transition"
                    >
                      <Icons.Search size={13} className="text-[#E76F2E]" />
                      <span>{sug}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </header>

      {/* ========================================================================= */}
      {/* MOBILE RIGHT-SIDE SLIDE-IN ACCORDION DRAWER & DARK BACKDROP OVERLAY       */}
      {/* ========================================================================= */}
      {/* 1. Dark Transparent Overlay Backdrop */}
      <div
        className={`fixed inset-0 z-[99990] bg-black/60 backdrop-blur-[2px] transition-opacity duration-250 ease-out xl:hidden ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Slide Drawer from Right (Width: 88%, max 360px, Duration 200-250ms) */}
      <aside
        id="mobile-nav-drawer"
        aria-label="Mobile Navigation Menu"
        className={`fixed top-0 right-0 bottom-0 z-[99995] w-[88%] max-w-[360px] bg-white text-[#292826] shadow-2xl flex flex-col justify-between transition-transform duration-250 ease-out transform xl:hidden ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top: Header & Search */}
        <div className="shrink-0 bg-white border-b border-[#EEE9E3]">
          {/* Drawer Brand Header */}
          <div className="p-4 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-2 min-w-0"
            >
              <Icons.NivaasMark className="h-6 w-6 text-[#C94F36] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="font-display font-black text-sm sm:text-base text-[#292725] tracking-tight leading-tight truncate">
                  {site.name}
                </span>
                <span className="text-[7.5px] font-bold text-[#54504A] tracking-wider mt-0.5 leading-none">
                  AI-POWERED ARCHITECTURE
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-[#54504A] hover:text-[#292826] hover:bg-[#FFF6E8] border border-[#E7E0D7] transition cursor-pointer shrink-0"
              aria-label="Close navigation menu"
              title="Close Menu"
            >
              <Icons.Close size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div className="px-4 pb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setMobileMenuOpen(false)
                    setSearchOpen(true)
                  }
                }}
                placeholder="Search house plans, 30x50, Vastu…"
                className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] pl-9 pr-3 py-2 text-xs text-[#292826] placeholder:text-[#54504A]/70 outline-none focus:border-[#E76F2E] focus:ring-1 focus:ring-[#E76F2E]"
              />
              <div className="absolute left-3 top-2.5 text-[#E76F2E]">
                <Icons.Search size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Scrollable Accordion Rows (Full-width, Single-open at a time) */}
        <div className="flex-1 overflow-y-auto px-4 py-3 divide-y divide-[#EEE9E3]/70">
          {/* 1. Architecture Accordion */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'arch' ? null : 'arch')}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Icons.Blueprint size={16} className="text-[#E76F2E]" />
                <span>Architecture</span>
              </span>
              <Icons.ChevronRight
                size={15}
                className={`text-[#54504A] transition-transform duration-200 ${
                  expandedCategory === 'arch' ? 'rotate-90 text-[#E76F2E]' : ''
                }`}
              />
            </button>
            {expandedCategory === 'arch' && (
              <div className="pl-4 pr-1 py-2 space-y-3.5 animate-fadeIn text-xs">
                {megaMenus.architecture.map((col) => (
                  <div key={col.title} className="bg-[#FAF8F5] rounded-lg p-2.5 border border-[#EEE9E3]">
                    <h5 className="font-bold text-[11px] uppercase tracking-wider text-[#292826] pb-1.5 mb-1.5 border-b border-[#E7E0D7] flex items-center gap-1.5">
                      {col.title.includes('Style') ? (
                        <Icons.Building size={12} className="text-[#E76F2E]" />
                      ) : col.title.includes('Storey') || col.title.includes('Elevation') ? (
                        <Icons.Layers size={12} className="text-[#E76F2E]" />
                      ) : col.title.includes('Bedroom') ? (
                        <Icons.Bed size={12} className="text-[#E76F2E]" />
                      ) : (
                        <Icons.Compass size={12} className="text-[#E76F2E]" />
                      )}
                      <span>{col.title}</span>
                    </h5>
                    <div className="space-y-1">
                      {col.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-1 px-1.5 rounded hover:text-[#E76F2E] hover:bg-[#FFF6E8] text-[#54504A] font-medium transition"
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] bg-[#FFF6E8] text-[#E76F2E] border border-[#E7E0D7] px-1.5 py-0.5 rounded font-bold">
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

          {/* 2. Interior Accordion */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'interior' ? null : 'interior')}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Icons.Sofa size={16} className="text-[#E76F2E]" />
                <span>Interior</span>
              </span>
              <Icons.ChevronRight
                size={15}
                className={`text-[#54504A] transition-transform duration-200 ${
                  expandedCategory === 'interior' ? 'rotate-90 text-[#E76F2E]' : ''
                }`}
              />
            </button>
            {expandedCategory === 'interior' && (
              <div className="pl-4 pr-1 py-2 space-y-3.5 animate-fadeIn text-xs">
                {megaMenus.interior.map((col) => (
                  <div key={col.title} className="bg-[#FAF8F5] rounded-lg p-2.5 border border-[#EEE9E3]">
                    <h5 className="font-bold text-[11px] uppercase tracking-wider text-[#292826] pb-1.5 mb-1.5 border-b border-[#E7E0D7] flex items-center gap-1.5">
                      <Icons.Home size={12} className="text-[#E76F2E]" />
                      <span>{col.title}</span>
                    </h5>
                    <div className="space-y-1">
                      {col.items.map((item) => (
                        <Link
                          key={item.label}
                          to={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between py-1 px-1.5 rounded hover:text-[#E76F2E] hover:bg-[#FFF6E8] text-[#54504A] font-medium transition"
                        >
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className="text-[9px] bg-[#FFF6E8] text-[#E76F2E] border border-[#E7E0D7] px-1.5 py-0.5 rounded font-bold">
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

          {/* 3. Designs / 3D Elevation Accordion */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'elevation' ? null : 'elevation')}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Icons.Sparkles size={16} className="text-[#E76F2E]" />
                <span>Designs &amp; Elevations</span>
              </span>
              <Icons.ChevronRight
                size={15}
                className={`text-[#54504A] transition-transform duration-200 ${
                  expandedCategory === 'elevation' ? 'rotate-90 text-[#E76F2E]' : ''
                }`}
              />
            </button>
            {expandedCategory === 'elevation' && (
              <div className="pl-4 pr-1 py-2 space-y-2 animate-fadeIn text-xs">
                {megaMenus.designIdeas.map((idea) => (
                  <Link
                    key={idea.label}
                    to={idea.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:bg-[#FFF6E8] transition"
                  >
                    <div className="font-bold text-[#292826] flex items-center gap-1.5 text-xs">
                      <Icons.Layers size={13} className="text-[#E76F2E]" />
                      <span>{idea.label}</span>
                    </div>
                    <p className="text-[11px] text-[#54504A] mt-0.5 leading-snug">{idea.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 4. Services Accordion */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => setExpandedCategory(expandedCategory === 'services' ? null : 'services')}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left cursor-pointer"
            >
              <span className="flex items-center gap-2.5">
                <Icons.HardHat size={16} className="text-[#E76F2E]" />
                <span>Services</span>
              </span>
              <Icons.ChevronRight
                size={15}
                className={`text-[#54504A] transition-transform duration-200 ${
                  expandedCategory === 'services' ? 'rotate-90 text-[#E76F2E]' : ''
                }`}
              />
            </button>
            {expandedCategory === 'services' && (
              <div className="pl-4 pr-1 py-2 space-y-2 animate-fadeIn text-xs">
                {megaMenus.otherServices.map((srv) => (
                  <Link
                    key={srv.label}
                    to={srv.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:bg-[#FFF6E8] transition"
                  >
                    <div className="font-bold text-[#292826] flex items-center gap-1.5 text-xs">
                      <Icons.ShieldCheck size={13} className="text-[#E76F2E]" />
                      <span>{srv.label}</span>
                    </div>
                    <p className="text-[11px] text-[#54504A] mt-0.5 leading-snug">{srv.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 5. Flat Direct Link: Cost Estimator */}
          <div className="py-1">
            <Link
              to="/cost-estimator"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left"
            >
              <span className="flex items-center gap-2.5">
                <Icons.Calculator size={16} className="text-[#E76F2E]" />
                <span>Cost Estimator</span>
              </span>
            </Link>
          </div>

          {/* 6. Flat Direct Link: About Indore House Makers */}
          <div className="py-1">
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#C94F36] transition text-left"
            >
              <span className="flex items-center gap-2.5">
                <Icons.Building size={16} className="text-[#C94F36]" />
                <span>About Indore House Makers</span>
              </span>
            </Link>
          </div>

          {/* 7. Flat Direct Link: Guides */}
          <div className="py-1">
            <Link
              to="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left"
            >
              <span className="flex items-center gap-2.5">
                <Icons.FileText size={16} className="text-[#E76F2E]" />
                <span>Guides</span>
              </span>
            </Link>
          </div>

          {/* 8. Flat Direct Link: FAQ */}
          <div className="py-1">
            <Link
              to="/faq"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left"
            >
              <span className="flex items-center gap-2.5">
                <Icons.HelpCircle size={16} className="text-[#E76F2E]" />
                <span>Frequently Asked Questions</span>
              </span>
            </Link>
          </div>

          {/* 9. Flat Direct Link: Contact */}
          <div className="py-1">
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-between py-2.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition text-left"
            >
              <span className="flex items-center gap-2.5">
                <Icons.Phone size={16} className="text-[#E76F2E]" />
                <span>Contact &amp; Support</span>
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Actions: Fixed at Drawer Bottom */}
        <div className="p-4 border-t border-[#EEE9E3] bg-[#FDFCF9] shrink-0 space-y-2.5">
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
            className="w-full py-2.5 rounded-lg border border-[#E76F2E] bg-[#FFF6E8] text-[#E76F2E] font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#E76F2E] hover:text-white transition shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Icons.Sparkles size={14} />
            <span>Ask AI Studio</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenConsult()
            }}
            className="w-full py-2.5 rounded-lg border border-[#E76F2E] bg-[#E76F2E] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#C65320] transition shadow-xs cursor-pointer active:scale-[0.98]"
          >
            <Icons.Phone size={13} />
            <span>Book Free Consultation</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false)
              onOpenLogin()
            }}
            className="w-full py-2 rounded-lg border border-[#E7E0D7] bg-white text-[#54504A] hover:text-[#292826] font-semibold text-xs text-center hover:bg-[#FFF6E8] transition cursor-pointer"
          >
            User Login / Register
          </button>
        </div>
      </aside>

      {/* News & Spotlight Modal */}
      {newsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1815]/70 p-4 ">
          <div className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 shadow-sm border border-[#E7E0D7] text-[#292826]">
            <div className="flex items-center justify-between border-b border-[#EEE9E3] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📰</span>
                <h3 className="font-display text-lg font-bold text-[#292826]">Indore House Makers in the News</h3>
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
                  Indore House Makers crosses 1,200+ delivered architectural projects across India
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