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
      <div className="bg-[#0C2E1F] text-[#CFE4D6] text-xs py-2 px-4 border-b border-[#1F5037] hidden md:block">
        <div className="container-content flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 font-medium text-[#EBF6EE]">
              <span className="text-sm">🇮🇳</span> India's Leading Residential Architecture & Blueprints Platform
            </span>
            <span className="text-[#2B5940]">|</span>
            <span className="flex items-center gap-1.5 text-[#CFE4D6]">
              <Icons.Blueprint size={14} className="text-[#6FC39A]" /> 12,000+ Verified Floor Plans
            </span>
          </div>
          <div className="flex items-center gap-5">
            <a href={`tel:${site.phone.replace(/\D/g, '')}`} className="hover:text-white transition flex items-center gap-1.5">
              <Icons.Phone size={13} className="text-[#6FC39A]" />
              <span>Call: {site.phone}</span>
            </a>
            <span className="text-[#2B5940]">|</span>
            <a
              href={`https://wa.me/${site.whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition flex items-center gap-1.5 text-[#6FC39A] font-semibold"
            >
              <Icons.WhatsApp size={14} />
              <span>WhatsApp Support</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header
        ref={navRef}
        className="sticky top-0 z-50 bg-[#11402C] text-white py-3 border-b border-[#1F5037]"
      >
        <div className="container-content flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <a href="#top" className="flex items-center gap-2.5 group">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#6FC39A] to-[#166C46] flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:from-[#35C98A] group-hover:to-[#1F9D66] transition">
                <Icons.Blueprint size={22} className="text-white" />
              </div>
              <div>
                <span className="flex items-center gap-2.5">
                  <span className="font-display text-2xl font-extrabold tracking-tight block leading-none text-[#F3FAF6]">
                    {site.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    title="Create your first AI floor plan"
                    data-toggle="tooltip"
                    data-placement="top"
                    className="group/ai relative flex flex-col items-center gap-0.5 pt-0.5 cursor-pointer"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFD86B] via-[#F0B429] to-[#D98E1F] font-display text-[13px] font-extrabold tracking-wide text-[#3B2400] shadow-md ring-1 ring-white/40 transition group-hover/ai:scale-105 group-hover/ai:from-[#FFE08A] group-hover/ai:to-[#E6A426]">
                      AI
                    </span>
                    <span className="rounded-sm bg-[#D98E1F] px-1.5 text-[7px] font-extrabold uppercase tracking-wider leading-none text-white">
                      NEW
                    </span>
                  </button>
                </span>
                <span className="text-[10px] tracking-wider uppercase block font-semibold mt-0.5 text-[#8BE4BC]">
                  AI-Powered Architecture & Designs
                </span>
              </div>
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
                className="flex items-center gap-1.5 py-2 transition hover:text-white font-semibold text-[#CFE4D6]"
              >
                <Icons.Blueprint size={16} className="text-[#6FC39A]" />
                <span>Architecture</span>
                <Icons.ChevronDown size={13} className="text-[#6FC39A]" />
              </button>

              {activeDropdown === 'arch' && (
                <div className="absolute left-0 top-full pt-2 w-[820px] animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-4 gap-6 text-slate-800">
                    {megaMenus.architecture.map((col) => (
                      <div key={col.title}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-2.5 flex items-center gap-1.5">
                          {col.title.includes('Size') ? <Icons.Ruler size={13} className="text-slate-900" /> : col.title.includes('Area') ? <Icons.Grid size={13} className="text-slate-900" /> : col.title.includes('Bedroom') ? <Icons.Bed size={13} className="text-slate-900" /> : <Icons.Compass size={13} className="text-slate-900" />}
                          <span>{col.title}</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs">
                          {col.items.map((item) => (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="text-slate-600 hover:text-slate-900 hover:font-semibold flex items-center justify-between py-0.5 transition"
                              >
                                <span>{item.label}</span>
                                {item.badge && (
                                  <span className="text-[9px] bg-slate-100 text-slate-700 border border-slate-300 px-1.5 py-0.2 rounded font-bold">
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
                className="flex items-center gap-1.5 py-2 transition hover:text-white font-semibold text-[#CFE4D6]"
              >
                <Icons.Sofa size={16} className="text-[#6FC39A]" />
                <span>Interior</span>
                <Icons.ChevronDown size={13} className="text-[#6FC39A]" />
              </button>

              {activeDropdown === 'interior' && (
                <div className="absolute left-0 top-full pt-2 w-[760px] animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 grid grid-cols-4 gap-6 text-slate-800">
                    {megaMenus.interior.map((col) => (
                      <div key={col.title}>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-2 mb-2.5 flex items-center gap-1.5">
                          <Icons.Home size={13} className="text-slate-900" />
                          <span>{col.title}</span>
                        </h4>
                        <ul className="space-y-1.5 text-xs">
                          {col.items.map((item) => (
                            <li key={item.label}>
                              <a
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className="text-slate-600 hover:text-slate-900 hover:font-semibold py-0.5 block transition"
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
                className="flex items-center gap-1.5 py-2 transition hover:text-white font-semibold text-[#CFE4D6]"
              >
                <Icons.Sparkles size={16} className="text-[#6FC39A]" />
                <span>Designs</span>
                <Icons.ChevronDown size={13} className="text-[#6FC39A]" />
              </button>

              {activeDropdown === 'ideas' && (
                <div className="absolute left-0 top-full pt-2 w-[360px] animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-slate-800 space-y-2">
                    {megaMenus.designIdeas.map((idea) => (
                      <a
                        key={idea.label}
                        href={idea.href}
                        onClick={() => setActiveDropdown(null)}
                        className="block p-2.5 rounded-xl hover:bg-slate-100 transition"
                      >
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Icons.Layers size={13} className="text-slate-900" /> {idea.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{idea.desc}</div>
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
                className="flex items-center gap-1.5 py-2 transition hover:text-white font-semibold text-[#CFE4D6]"
              >
                <Icons.HardHat size={16} className="text-[#6FC39A]" />
                <span>Services</span>
                <Icons.ChevronDown size={13} className="text-[#6FC39A]" />
              </button>

              {activeDropdown === 'services' && (
                <div className="absolute left-0 top-full pt-2 w-[360px] animate-fadeIn">
                  <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 text-slate-800 space-y-2">
                    {megaMenus.otherServices.map((srv) => (
                      <a
                        key={srv.label}
                        href={srv.href}
                        onClick={() => setActiveDropdown(null)}
                        className="block p-2.5 rounded-xl hover:bg-slate-100 transition"
                      >
                        <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                          <Icons.ShieldCheck size={13} className="text-slate-900" /> {srv.label}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{srv.desc}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cost Calculator */}
            <a
              href="#calculator"
              className="flex items-center gap-1.5 py-2 transition hover:text-white font-semibold text-[#CFE4D6]"
            >
              <Icons.Calculator size={16} className="text-[#6FC39A]" />
              <span>Cost Estimator</span>
            </a>

            {/* Guides / Blogs */}
            <a
              href="#blog"
              className="flex items-center gap-1.5 py-2 transition hover:text-white font-semibold text-[#CFE4D6]"
            >
              <Icons.FileText size={15} className="text-[#6FC39A]" />
              <span>Guides</span>
            </a>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Trigger */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 rounded-xl border border-[#2B5940] bg-[#13412B] text-[#D8D2C3] hover:bg-[#1A5236] transition"
              aria-label="Search plans"
            >
              <Icons.Search size={18} />
            </button>

            {/* News button */}
            <button
              type="button"
              onClick={() => setNewsOpen(true)}
              className="hidden md:inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#2B5940] bg-[#13412B] text-[#D8D2C3] hover:bg-[#1A5236] transition"
            >
              <span>📰</span> News
            </button>

            {/* Consult Online Now Button */}
            <button
              type="button"
              onClick={() => onOpenConsult()}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1F9D66] text-[#FFFFFF] hover:bg-[#2BB578] shadow-md transition active:scale-[0.98] flex items-center gap-2"
            >
              <Icons.Phone size={15} />
              <span>Consult Online</span>
            </button>

            {/* User Account Login */}
            <button
              type="button"
              onClick={onOpenLogin}
              className="p-2.5 rounded-xl border border-[#2B5940] bg-[#13412B] text-[#D8D2C3] hover:bg-[#1A5236] transition"
              aria-label="User Account"
            >
              <Icons.User size={18} />
            </button>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl xl:hidden text-[#CFE4D6]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <Icons.Close size={22} /> : <Icons.Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Global Expandable Search Bar */}
        {searchOpen && (
          <div className="border-t border-slate-200 bg-white text-slate-800 p-4 shadow-xl animate-fadeIn">
            <div className="container-content max-w-3xl relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search plot dimensions (e.g. 30x50, 40x60), BHK, Direction or City..."
                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-slate-50"
                  />
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Icons.Search size={16} />
                  </div>
                </div>
                <a
                  href="#plans"
                  onClick={() => setSearchOpen(false)}
                  className="shrink-0 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition"
                >
                  Search
                </a>
              </div>

              {/* Suggestions */}
              {sampleSearchSuggestions.length > 0 && (
                <div className="mt-2.5 rounded-xl border border-slate-200 bg-white shadow-lg p-2 text-xs">
                  <div className="px-2 py-1 text-slate-500 font-bold uppercase text-[10px] flex items-center gap-1">
                    <Icons.Sparkles size={11} className="text-slate-900" /> Quick Search Queries
                  </div>
                  {sampleSearchSuggestions.map((sug) => (
                    <a
                      key={sug}
                      href="#plans"
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-800 font-medium transition"
                    >
                      <Icons.Search size={13} className="text-slate-900" />
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
          <div className="xl:hidden bg-[#0A2818] text-[#CFE4D6] border-t border-[#1F5037] px-6 py-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div>
              <h4 className="text-xs font-bold uppercase text-[#6FC39A] tracking-wider mb-2 flex items-center gap-1.5">
                <Icons.Blueprint size={14} /> House Plans by Plot Size
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">30 x 50 House Plans</a>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">20 x 40 House Plans</a>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">25 x 40 House Plans</a>
                <a href="#plans" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">40 x 60 House Plans</a>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4">
              <h4 className="text-xs font-bold uppercase text-[#6FC39A] tracking-wider mb-2 flex items-center gap-1.5">
                <Icons.Sofa size={14} /> Browse Rooms & Interiors
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">Living Rooms</a>
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">Modular Kitchens</a>
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">Master Bedrooms</a>
                <a href="#interiors" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[#EBF6EE]">Pooja Rooms</a>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
              <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Icons.Calculator size={16} className="text-[#6FC39A]" /> Cost Estimator Tool
              </a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Icons.HardHat size={16} className="text-[#6FC39A]" /> Architectural & PMC Services
              </a>
              <a href="#blog" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Icons.FileText size={16} className="text-[#6FC39A]" /> Design Guides & Blogs
              </a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Icons.HelpCircle size={16} className="text-[#6FC39A]" /> Frequently Asked Questions
              </a>
            </div>

            <div className="border-t border-slate-800 pt-5 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenConsult()
                }}
                className="w-full py-3 rounded-xl bg-[#1F9D66] text-[#FFFFFF] font-bold text-sm text-center shadow-lg hover:bg-white"
              >
                Book Free Consultation
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenLogin()
                }}
                className="w-full py-3 rounded-xl border border-[#2B5940] bg-[#13412B] text-white font-bold text-sm text-center hover:bg-[#1A5236]"
              >
                User Login / Register
              </button>
            </div>
          </div>
        )}
      </header>

      {/* News & Spotlight Modal */}
      {newsOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl border border-slate-300 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📰</span>
                <h3 className="font-display text-lg font-bold text-slate-900">NIVAAS in the News</h3>
              </div>
              <button
                type="button"
                onClick={() => setNewsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 text-slate-700"
              >
                <Icons.Close size={16} />
              </button>
            </div>
            <div className="py-4 space-y-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                  Press Release · 2026
                </span>
                <h4 className="mt-1.5 text-sm font-bold text-slate-900">
                  NIVAAS crosses 12,000 verified residential plans milestone across India
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Empowering independent home builders across Tier 1, 2 and 3 cities with instant CAD working drawings and 3D architectural elevations.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase text-slate-800 bg-slate-200 px-2 py-0.5 rounded">
                  Technology Innovation
                </span>
                <h4 className="mt-1.5 text-sm font-bold text-slate-900">
                  AI-Powered Vastu and Setback Compliance Engine launched
                </h4>
                <p className="mt-1 text-xs text-slate-600">
                  Automatic layout validation for local municipal bylaws in Hyderabad (GHMC), Bangalore (BBMP), and Delhi NCR (DDA).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Assistant */}
      <ChatAi open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}