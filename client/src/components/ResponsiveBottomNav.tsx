import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Icons } from './Icons'

export interface ResponsiveBottomNavProps {
  onOpenConsult: (req?: string) => void
  onOpenAiStudio: (mode?: 'generator' | 'chat') => void
  onOpenLogin?: () => void
  aiStudioOpen?: boolean
  onSheetStateChange?: (isOpen: boolean) => void
}

type NavTab = 'home' | 'designs' | 'estimate' | 'ai' | 'menu'

export default function ResponsiveBottomNav({
  onOpenConsult,
  onOpenAiStudio,
  onOpenLogin,
  aiStudioOpen = false,
  onSheetStateChange,
}: ResponsiveBottomNavProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [exploreSheetOpen, setExploreSheetOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Notify parent of sheet open/close state
  useEffect(() => {
    onSheetStateChange?.(exploreSheetOpen)
  }, [exploreSheetOpen, onSheetStateChange])

  // Track active navigation tab based on route pathname
  useEffect(() => {
    if (exploreSheetOpen) {
      setActiveTab('menu')
      return
    }
    if (aiStudioOpen) {
      setActiveTab('ai')
      return
    }

    const path = location.pathname
    if (path === '/') {
      setActiveTab('home')
    } else if (path.startsWith('/designs') || path.startsWith('/house-plans') || path.startsWith('/interiors')) {
      setActiveTab('designs')
    } else if (path.startsWith('/cost-estimator')) {
      setActiveTab('estimate')
    } else {
      setActiveTab('home')
    }
  }, [location.pathname, exploreSheetOpen, aiStudioOpen])

  // Sheet keyboard & body scroll management
  useEffect(() => {
    if (exploreSheetOpen) {
      document.body.style.overflow = 'hidden'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setExploreSheetOpen(false)
          menuButtonRef.current?.focus()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleKeyDown)
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [exploreSheetOpen])

  const handleNavClick = (tab: NavTab) => {
    if (tab === 'home') {
      navigate('/')
      setActiveTab('home')
      setExploreSheetOpen(false)
    } else if (tab === 'designs') {
      navigate('/designs')
      setActiveTab('designs')
      setExploreSheetOpen(false)
    } else if (tab === 'estimate') {
      navigate('/cost-estimator')
      setActiveTab('estimate')
      setExploreSheetOpen(false)
    } else if (tab === 'ai') {
      setActiveTab('ai')
      setExploreSheetOpen(false)
      onOpenAiStudio('chat')
    } else if (tab === 'menu') {
      setExploreSheetOpen((prev) => !prev)
    }
  }

  const sheetLinks = [
    { label: 'Architecture & House Plans', href: '/house-plans', icon: Icons.Blueprint },
    { label: 'Interiors Studio', href: '/interiors', icon: Icons.Sofa },
    { label: '3D Elevation & Designs', href: '/designs', icon: Icons.Sparkles },
    { label: 'Services & Contractors', href: '/services', icon: Icons.HardHat },
    { label: 'Cost Estimator', href: '/cost-estimator', icon: Icons.Calculator },
    { label: 'Guides & Articles', href: '/guides', icon: Icons.FileText },
    { label: 'About Indore House Makers', href: '/about', icon: Icons.Building },
    { label: 'Help & FAQs', href: '/faq', icon: Icons.HelpCircle },
    { label: 'Contact & Support', href: '/contact', icon: Icons.Phone },
  ]

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Icons.House, ariaLabel: 'Go to home page' },
    { id: 'designs' as NavTab, label: 'Designs', icon: Icons.LayoutGrid, ariaLabel: 'Explore house designs & blueprints' },
    { id: 'estimate' as NavTab, label: 'Estimate', icon: Icons.Calculator, ariaLabel: 'Construction cost estimator' },
    { id: 'ai' as NavTab, label: 'AI', icon: Icons.Sparkles, ariaLabel: 'Open Indore House Makers AI assistant' },
    { id: 'menu' as NavTab, label: 'Menu', icon: Icons.Menu, ariaLabel: 'Open Explore menu' },
  ]

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. EXPLORE BOTTOM SHEET & BACKDROP (Mobile & Tablet)                       */}
      {/* ========================================================================= */}
      {exploreSheetOpen && (
        <div
          className="fixed inset-0 z-[99990] bg-black/60 backdrop-blur-[2px] transition-opacity duration-200 lg:hidden"
          onClick={() => {
            setExploreSheetOpen(false)
            menuButtonRef.current?.focus()
          }}
          aria-hidden="true"
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Explore Menu"
        className={`fixed z-[99995] bg-[#FDFCF9] text-[#292826] transition-transform duration-250 ease-out lg:hidden flex flex-col shadow-2xl ${
          // Mobile: Full width bottom sheet
          'inset-x-0 bottom-0 w-full max-h-[88dvh] rounded-t-2xl border-t border-[#E7E0D7] ' +
          // Tablet: Centered compact floating sheet
          'md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:w-[92%] md:max-w-[620px] md:rounded-2xl md:border md:border-[#E7E0D7]'
        } ${exploreSheetOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
      >
        {/* Drag Handle & Header */}
        <div className="shrink-0 pt-2.5 px-4 pb-3 border-b border-[#EEE9E3] bg-white rounded-t-2xl">
          <div className="w-10 h-1 bg-[#E7E0D7] rounded-full mx-auto mb-2" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.NivaasMark className="h-5.5 w-5.5 text-[#C94F36] shrink-0" />
              <div className="flex flex-col">
                <h3 className="font-display font-black text-sm sm:text-base text-[#292725] tracking-tight leading-tight">
                  Indore House Makers
                </h3>
                <span className="text-[7.5px] font-bold text-[#54504A] tracking-wider leading-none">
                  AI-POWERED ARCHITECTURE
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setExploreSheetOpen(false)
                menuButtonRef.current?.focus()
              }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-[#54504A] hover:text-[#292826] hover:bg-[#FFF6E8] border border-[#E7E0D7] transition cursor-pointer"
              aria-label="Close Explore menu"
            >
              <Icons.Close size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-2 divide-y divide-[#EEE9E3]/70">
          {sheetLinks.map((item) => {
            const IconComp = item.icon
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setExploreSheetOpen(false)}
                className="flex items-center justify-between py-3 px-2 rounded-xl text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#C94F36] transition group"
              >
                <span className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-[#FFF6E8] text-[#C94F36] flex items-center justify-center shrink-0 border border-[#E7E0D7]/60">
                    <IconComp size={16} />
                  </span>
                  <span>{item.label}</span>
                </span>
                <Icons.ChevronRight
                  size={15}
                  className="text-[#74706A] group-hover:text-[#C94F36] group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            )
          })}

          {/* User Account Login & Register Link */}
          {onOpenLogin && (
            <button
              type="button"
              onClick={() => {
                setExploreSheetOpen(false)
                onOpenLogin()
              }}
              className="w-full flex items-center justify-between py-3 px-2 rounded-xl text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#E76F2E] transition group text-left cursor-pointer"
            >
              <span className="flex items-center gap-3">
                <span className="h-8 w-8 rounded-lg bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center shrink-0 border border-[#E7E0D7]/60">
                  <Icons.User size={16} />
                </span>
                <span className="flex items-center gap-2">
                  <span>User Login / Register</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#FFF6E8] text-[#E76F2E] border border-[#E76F2E]/30">
                    Account
                  </span>
                </span>
              </span>
              <Icons.ChevronRight
                size={15}
                className="text-[#74706A] group-hover:text-[#E76F2E] group-hover:translate-x-0.5 transition-transform"
              />
            </button>
          )}
        </div>

        {/* Bottom Primary Actions Card (Ask AI, Consult, Login) */}
        <div className="p-3.5 border-t border-[#EEE9E3] bg-[#FAF8F5] shrink-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setExploreSheetOpen(false)
                onOpenAiStudio('chat')
              }}
              className="py-2.5 px-3 rounded-xl border border-[#E76F2E] bg-[#FFF6E8] text-[#E76F2E] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#E76F2E] hover:text-white transition shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Icons.Sparkles size={13} />
              <span>Ask AI Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setExploreSheetOpen(false)
                onOpenConsult()
              }}
              className="py-2.5 px-3 rounded-xl bg-[#C94F36] hover:bg-[#B33E26] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <Icons.Phone size={12} />
              <span>Consultation</span>
            </button>
          </div>

          {onOpenLogin && (
            <button
              type="button"
              onClick={() => {
                setExploreSheetOpen(false)
                onOpenLogin()
              }}
              className="w-full py-2 rounded-xl border border-[#E7E0D7] bg-white text-[#54504A] hover:text-[#292826] font-semibold text-xs text-center hover:bg-[#FFF6E8] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Icons.User size={13} className="text-[#E76F2E]" />
              <span>User Profile (Login / Sign Up)</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION (0–767px: Full-Width Fixed)                   */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 w-full bg-[#FDFCF9] border-t border-[#E7E0D7] z-[99980] block md:hidden shadow-[0_-2px_8px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]"
      >
        <div className="grid grid-cols-5 h-16 items-center px-1">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeTab === item.id || (item.id === 'menu' && exploreSheetOpen)
            const isMenu = item.id === 'menu'

            return (
              <button
                key={item.id}
                ref={isMenu ? menuButtonRef : undefined}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-label={item.ariaLabel}
                aria-current={isActive && !isMenu ? 'page' : undefined}
                aria-expanded={isMenu ? exploreSheetOpen : undefined}
                aria-controls={isMenu ? 'explore-nivaas-sheet' : undefined}
                className="flex flex-col items-center justify-center h-full min-h-[44px] py-1 transition-colors relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F36]/50"
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <span className="absolute top-0 w-6 h-0.5 bg-[#C94F36] rounded-full" aria-hidden="true" />
                )}
                <span className={`transition-transform duration-150 ${isActive ? 'scale-110 text-[#C94F36]' : 'text-[#74706A] group-hover:text-[#292826]'}`}>
                  <IconComponent size={20} />
                </span>
                <span
                  className={`text-[10px] font-bold mt-1 tracking-tight leading-none ${
                    isActive ? 'text-[#C94F36]' : 'text-[#74706A] group-hover:text-[#292826]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. TABLET DOCK (768–1023px: Centred Compact Dock)                         */}
      {/* ========================================================================= */}
      <nav
        aria-label="Tablet Bottom Dock"
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[99980] hidden md:flex lg:hidden w-auto min-w-[480px] max-w-[580px] bg-[#FDFCF9] border border-[#E7E0D7] rounded-lg shadow-lg items-center justify-around px-3 py-1.5"
      >
        <div className="flex items-center justify-between w-full gap-2">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeTab === item.id || (item.id === 'menu' && exploreSheetOpen)
            const isMenu = item.id === 'menu'

            return (
              <button
                key={item.id}
                ref={isMenu ? menuButtonRef : undefined}
                type="button"
                onClick={() => handleNavClick(item.id)}
                aria-label={item.ariaLabel}
                aria-current={isActive && !isMenu ? 'page' : undefined}
                aria-expanded={isMenu ? exploreSheetOpen : undefined}
                aria-controls={isMenu ? 'explore-nivaas-sheet' : undefined}
                className={`flex flex-col items-center justify-center flex-1 min-h-[44px] py-1 px-2.5 rounded-md transition-all relative group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C94F36]/50 ${
                  isActive ? 'bg-[#FFF6E8]/60 text-[#C94F36]' : 'text-[#74706A] hover:text-[#292826] hover:bg-black/5'
                }`}
              >
                <span className={`transition-transform duration-150 ${isActive ? 'scale-110 text-[#C94F36]' : 'text-[#74706A] group-hover:text-[#292826]'}`}>
                  <IconComponent size={20} />
                </span>
                <span
                  className={`text-[11px] font-bold mt-1 tracking-tight leading-none ${
                    isActive ? 'text-[#C94F36]' : 'text-[#74706A] group-hover:text-[#292826]'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
