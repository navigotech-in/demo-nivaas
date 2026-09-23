import { useState, useEffect, useRef } from 'react'
import { megaMenus, site } from '../lib/data'
import { Icons } from './Icons'
import ChatAi from './ChatAi'

interface NavProps {
  onOpenConsult: (req?: string) => void
  onOpenLogin: () => void
}

export default function Nav({ onOpenConsult, onOpenLogin }: NavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [newsOpen, setNewsOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
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
            <span className="text-[#74706A]">|</span>
            <span className="flex items-center gap-1.5 text-[#292826]">
              <Icons.Blueprint size={14} className="text-[#292826]" /> 12,000+ Verified Floor Plans
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="hover:text-[#292826] transition flex items-center gap-1.5">
              <Icons.Phone size={13} className="text-[#E76F2E]" />
              <span>Call: {site.phone}</span>
            </a>
            <span className="text-[#74706A]">|</span>
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
        className="sticky top-0 z-50 bg-white text-[#292826] py-3 border-b border-[#E7E0D7]"
      >
        <div className="container-content flex items-center justify-between gap-4" style={{ paddingLeft: 'clamp(0.25rem, 1.25vw, 1.25rem)', paddingRight: 'clamp(0.25rem, 1.25vw, 1.25rem)' }}>
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <a href="#top" className="inline-flex shrink-0 flex-col items-stretch">
              <div className="flex h-7 items-center gap-3">
                <Icons.NivaasMark className="h-7 w-7 shrink-0 text-[#C94F36]" />

                <span className="whitespace-nowrap text-[26px] font-bold leading-7 text-[#292725]">
                  {site.name}
                </span>
              </div>

              <span className="mt-2 w-full whitespace-nowrap text-center text-[9px] font-medium leading-none tracking-[0.08em] text-[#706C67]">
                AI-POWERED ARCHITECTURE &amp; DESIGNS
              </span>
            </a>
          </div>

          {/* Desktop Mega Nav Links */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium">
            {/* Architecture Dropdown */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown('arch')}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 py-2 transition hover:text-[#292826] font-semibold text-[#292826]"
              >
                <Icons.Blueprint size={16} className="text-[#292826]" />
                <span>Architecture</span>
                <Icons.ChevronDown size={13} className="text-[#74706A]" />
              </button>

              {activeDropdown === 'arch' && (
                <div className="absolute left-0 top-full pt-2 w-[820px] animate-fadeIn">
                  <div className="bg-white rounded-lg shadow-sm border border-[#EEE9E3] p-6 grid grid-cols-4 gap-6 text-[#292826]">
                    {megaMenus.architecture.map((col) => (
                      <div key={col.title}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-[#292826] border-b border-[#EEE9E3] pb-2 mb-2.5 flex items-center gap-1.5">
                          {col.title.includes('Size') ? <Icons.Ruler size={13} className="text-[#E76F2E]" /> : col.title.includes('Area') ? <Icons.Grid size={13} className="text-[#E76F2E]" /> : col.title.includes('Bedroom') ? <Icons.Bed size={13} className="text-[#E76F2E]" /> : <Icons.Compass size={13} className="text-[#E76F2E]" />}
                          <span>{col.title}</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs">
                          {col.items.map((item) => (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="text-[#74706A] hover:text-[#292826] hover:font-semibold flex items-center justify-between py-0.5 transition"
                              >
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9px] bg-[#FFF6E8] text-[#74706A] border border-[#E7E0D7] px-1.5 py-0.2 rounded font-bold">
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
                className="flex items-center gap-1.5 py-2 transition hover:text-[#292826] font-semibold text-[#292826]"
              >
                <Icons.Sofa size={16} className="text-[#292826]" />
                <span>Interior</span>
                <Icons.ChevronDown size={13} className="text-[#74706A]" />
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
                                className="text-[#74706A] hover:text-[#292826] hover:font-semibold py-0.5 block transition"
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
                className="flex items-center gap-1.5 py-2 transition hover:text-[#292826] font-semibold text-[#292826]"
              >
                <Icons.Sparkles size={16} className="text-[#292826]" />
                <span>Designs</span>
                <Icons.ChevronDown size={13} className="text-[#74706A]" />
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
                        <div className="text-[11px] text-[#74706A] mt-0.5">{idea.desc}</div>
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
                className="flex items-center gap-1.5 py-2 transition hover:text-[#292826] font-semibold text-[#292826]"
              >
                <Icons.HardHat size={16} className="text-[#292826]" />
                <span>Services</span>
                <Icons.ChevronDown size={13} className="text-[#74706A]" />
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
                        <div className="text-[11px] text-[#74706A] mt-0.5">{srv.desc}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cost Calculator */}
            <a
              href="#calculator"
              className="flex items-center gap-1.5 py-2 transition hover:text-[#292826] font-semibold text-[#292826]"
            >
              <Icons.Calculator size={16} className="text-[#292826]" />
              <span>Cost Estimator</span>
            </a>

            {/* Guides / Blogs */}
            <a
              href="#blog"
              className="flex items-center gap-1.5 py-2 transition hover:text-[#292826] font-semibold text-[#292826]"
            >
              <Icons.FileText size={15} className="text-[#292826]" />
              <span>Guides</span>
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-lg border border-[#E7E0D7] bg-white text-[#E76F2E] hover:bg-[#FFF6E8] transition"
              aria-label="Search plans"
            >
              <Icons.Search size={18} className="text-[#E76F2E]" />
            </button>

            {/* News button */}
            <button
              type="button"
              onClick={() => setNewsOpen(true)}
              className="hidden md:inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#E7E0D7] bg-white text-[#E76F2E] hover:bg-[#FFF6E8] transition"
            >
              <span>📰</span> News
            </button>

            {/* Consult Online Now Button */}
            <button
              type="button"
              onClick={() => onOpenConsult()}
              className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-bold border border-[#E76F2E] bg-white text-[#E76F2E] hover:bg-[#FFF6E8] transition active:scale-[0.98] flex items-center gap-2"
            >
              <Icons.Phone size={15} className="text-[#E76F2E]" />
              <span>Consult Online</span>
            </button>

            {/* User Account Login */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="p-2.5 rounded-lg border border-[#E7E0D7] bg-white text-[#E76F2E] hover:bg-[#FFF6E8] transition"
              aria-label="User Account"
            >
              <Icons.User size={18} className="text-[#E76F2E]" />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg xl:hidden text-[#292826]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <Icons.Close size={22} /> : <Icons.Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Global Expandable Search Bar */}
        {searchOpen && (
          <div className="bg-white text-[#292826] p-4 shadow-sm animate-fadeIn">
            <div className="container-content max-w-3xl relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plot dimensions (e.g. 30x50, 40x60), BHK, Direction or City..."
                    className="w-full rounded-lg border border-[#E7E0D7] pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#292826] focus:ring-1 focus:ring-[#E76F2E] bg-[#FDFCF9]"
                  />
                  <div className="absolute left-3.5 top-3 text-[#74706A]">
                    <Icons.Search size={16} />
                  </div>
                </div>
                <a
                  href="#plans"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0 px-6 py-2.5 bg-[#E76F2E] text-white text-sm font-bold rounded-lg hover:bg-[#C65320] transition"
                >
                  Search
                </a>
              </div>

              {/* Suggestions */}
              {sampleSearchSuggestions.length > 0 && (
                <div className="mt-2.5 rounded-lg border border-[#EEE9E3] bg-white shadow-sm p-2 text-xs">
                  <div className="px-2 py-1 text-[#74706A] font-bold uppercase text-[10px] flex items-center gap-1">
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

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white text-[#292826] border-t border-[#E7E0D7] px-6 py-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icons.Blueprint size={14} /> House Plans by Plot Size
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#74706A]">
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">30 x 50 House Plans</a>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">20 x 40 House Plans</a>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">25 x 40 House Plans</a>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">40 x 60 House Plans</a>
              </div>
            </div>

            <div className="border-t border-[#EEE9E3] pt-4">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Icons.Sofa size={14} /> Browse Rooms & Interiors
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-[#74706A]">
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">Living Rooms</a>
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">Modular Kitchens</a>
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">Master Bedrooms</a>
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#292826]">Pooja Rooms</a>
              </div>
            </div>

            <div className="border-t border-[#EEE9E3] pt-4 flex flex-col gap-3">
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#292826] flex items-center gap-2">
                <Icons.Calculator size={16} className="text-[#292826]" /> Cost Estimator Tool
              </a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#292826] flex items-center gap-2">
                <Icons.HardHat size={16} className="text-[#292826]" /> Architectural & PMC Services
              </a>
              <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#292826] flex items-center gap-2">
                <Icons.FileText size={16} className="text-[#292826]" /> Design Guides & Blogs
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-[#292826] flex items-center gap-2">
                <Icons.HelpCircle size={16} className="text-[#292826]" /> Frequently Asked Questions
              </a>
            </div>

            <div className="border-t border-[#EEE9E3] pt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenConsult()
                }}
                className="w-full py-3 rounded-lg border border-[#E76F2E] bg-white text-[#E76F2E] font-bold text-sm text-center hover:bg-[#FFF6E8]"
              >
                Book Free Consultation
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenLogin()
                }}
                className="w-full py-3 rounded-lg border border-[#E7E0D7] bg-white text-[#292826] font-bold text-sm text-center hover:bg-[#FFF6E8]"
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
                <h3 className="font-display text-lg font-bold text-[#292826]">NIVAAS in the News</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[#74706A] hover:bg-[#FFF6E8] text-[#74706A]"
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
                  NIVAAS crosses 12,000 verified residential plans milestone across India
                </h4>
                <p className="mt-1 text-xs text-[#74706A]">
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
                <p className="mt-1 text-xs text-[#74706A]">
                  Automatic layout validation for local municipal bylaws in Hyderabad (GHMC), Bangalore (BBMP), and Delhi NCR (DDA).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <ChatAi open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* Floating AI Assistant (sits above the WhatsApp FAB, like the callback pill) */}
      <div className="fixed bottom-32 right-6 z-50 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => setChatOpen(true)}
          className="hidden sm:inline-flex items-center gap-2 bg-white text-[#E76F2E] border border-[#E7E0D7] px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-[#FFF6E8] transition"
        >
          <Icons.Sparkles size={14} className="text-[#E76F2E]" />
          <span>Ask NIVAAS AI</span>
        </button>

        <button
          type="button"
          onClick={() => setChatOpen(true)}
          aria-label="Open NIVAAS AI floor plan assistant"
          title="Ask NIVAAS AI"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E76F2E] font-display text-sm font-extrabold tracking-wide text-white shadow-sm transition hover:scale-105 hover:bg-[#C65320]"
        >
          AI
        </button>
      </div>
    </>
  )
}