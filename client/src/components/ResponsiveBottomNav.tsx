import { useState, useEffect, useRef } from 'react'
import { Icons } from './Icons'

export interface ResponsiveBottomNavProps {
  onOpenConsult: (req?: string) => void
  onOpenAiStudio: () => void
  aiStudioOpen?: boolean
  onSheetStateChange?: (isOpen: boolean) => void
}

type NavTab = 'home' | 'designs' | 'estimate' | 'ai' | 'menu'

export default function ResponsiveBottomNav({
  onOpenConsult,
  onOpenAiStudio,
  aiStudioOpen = false,
  onSheetStateChange,
}: ResponsiveBottomNavProps) {
  const [activeTab, setActiveTab] = useState<NavTab>('home')
  const [exploreSheetOpen, setExploreSheetOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  // Notify parent of sheet open/close state (e.g. to hide floating widgets)
  useEffect(() => {
    onSheetStateChange?.(exploreSheetOpen)
  }, [exploreSheetOpen, onSheetStateChange])

  // Track active navigation tab based on scroll position & open states
  useEffect(() => {
    if (exploreSheetOpen) {
      setActiveTab('menu')
      return
    }
    if (aiStudioOpen) {
      setActiveTab('ai')
      return
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      if (scrollY < 250) {
        setActiveTab('home')
        return
      }

      const calcEl = document.getElementById('calculator')
      if (calcEl) {
        const rect = calcEl.getBoundingClientRect()
        if (rect.top <= window.innerHeight * 0.5 && rect.bottom >= window.innerHeight * 0.2) {
          setActiveTab('estimate')
          return
        }
      }

      const designEl =
        document.getElementById('design-studio') ||
        document.getElementById('plans') ||
        document.getElementById('elevations') ||
        document.getElementById('interiors')
      if (designEl) {
        const rect = designEl.getBoundingClientRect()
        if (rect.top <= window.innerHeight * 0.6 && rect.bottom >= window.innerHeight * 0.2) {
          setActiveTab('designs')
          return
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [exploreSheetOpen, aiStudioOpen])

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
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setActiveTab('home')
      setExploreSheetOpen(false)
    } else if (tab === 'designs') {
      const el =
        document.getElementById('design-studio') ||
        document.getElementById('plans') ||
        document.getElementById('elevations')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.hash = '#plans'
      }
      setActiveTab('designs')
      setExploreSheetOpen(false)
    } else if (tab === 'estimate') {
      const el = document.getElementById('calculator')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else {
        window.location.hash = '#calculator'
      }
      setActiveTab('estimate')
      setExploreSheetOpen(false)
    } else if (tab === 'ai') {
      setActiveTab('ai')
      setExploreSheetOpen(false)
      onOpenAiStudio()
    } else if (tab === 'menu') {
      setExploreSheetOpen((prev) => !prev)
    }
  }

  const sheetLinks = [
    { label: 'Architecture', href: '#plans', icon: Icons.Blueprint },
    { label: 'Interior', href: '#interiors', icon: Icons.Sofa },
    { label: '3D Elevation', href: '#elevations', icon: Icons.Sparkles },
    { label: 'Services', href: '#services', icon: Icons.HardHat },
    { label: 'Guides', href: '#blog', icon: Icons.FileText },
    { label: 'About NIVAAS', href: '#about', icon: Icons.Building },
  ]

  const navItems = [
    { id: 'home' as NavTab, label: 'Home', icon: Icons.House, ariaLabel: 'Go to home page' },
    { id: 'designs' as NavTab, label: 'Designs', icon: Icons.LayoutGrid, ariaLabel: 'Explore house designs & blueprints' },
    { id: 'estimate' as NavTab, label: 'Estimate', icon: Icons.Calculator, ariaLabel: 'Construction cost estimator' },
    { id: 'ai' as NavTab, label: 'AI', icon: Icons.Sparkles, ariaLabel: 'Open NIVAAS AI planner' },
    { id: 'menu' as NavTab, label: 'Menu', icon: Icons.Menu, ariaLabel: 'Open Explore NIVAAS menu' },
  ]

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. EXPLORE NIVAAS BOTTOM SHEET & BACKDROP (Mobile & Tablet)                */}
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
        aria-label="Explore NIVAAS Menu"
        className={`fixed z-[99995] bg-[#FDFCF9] text-[#292826] transition-transform duration-250 ease-out lg:hidden flex flex-col shadow-2xl ${
          // Mobile: Full width bottom sheet
          'inset-x-0 bottom-0 w-full max-h-[85dvh] rounded-t-lg border-t border-[#E7E0D7] ' +
          // Tablet: Centered compact floating sheet
          'md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:w-[92%] md:max-w-[620px] md:rounded-lg md:border md:border-[#E7E0D7]'
        } ${exploreSheetOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
      >
        {/* Drag Handle & Header */}
        <div className="shrink-0 pt-2.5 px-4 pb-3 border-b border-[#EEE9E3]">
          <div className="w-10 h-1 bg-[#E7E0D7] rounded-full mx-auto mb-2" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icons.NivaasMark className="h-5 w-5 text-[#C94F36] shrink-0" />
              <h3 className="font-display font-black text-base sm:text-lg text-[#292725] tracking-tight">
                Explore NIVAAS
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setExploreSheetOpen(false)
                menuButtonRef.current?.focus()
              }}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-[#54504A] hover:text-[#292826] hover:bg-[#FFF6E8] border border-[#E7E0D7] transition cursor-pointer"
              aria-label="Close Explore NIVAAS menu"
            >
              <Icons.Close size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-2 divide-y divide-[#EEE9E3]/70">
          {sheetLinks.map((item) => {
            const IconComp = item.icon
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setExploreSheetOpen(false)}
                className="flex items-center justify-between py-3.5 px-2 rounded-lg text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#C94F36] transition group"
              >
                <span className="flex items-center gap-3">
                  <span className="h-8 w-8 rounded-lg bg-[#FFF6E8] text-[#C94F36] flex items-center justify-center shrink-0 border border-[#E7E0D7]/60">
                    <IconComp size={16} />
                  </span>
                  <span>{item.label}</span>
                </span>
                <Icons.ChevronRight
                  size={16}
                  className="text-[#74706A] group-hover:text-[#C94F36] group-hover:translate-x-0.5 transition-transform"
                />
              </a>
            )
          })}
        </div>

        {/* Bottom Primary CTA */}
        <div className="p-4 border-t border-[#EEE9E3] bg-[#FAF8F5] shrink-0">
          <button
            type="button"
            onClick={() => {
              setExploreSheetOpen(false)
              onOpenConsult()
            }}
            className="w-full py-3 px-4 rounded-lg bg-[#C94F36] hover:bg-[#B33E26] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md active:scale-[0.98] cursor-pointer"
          >
            <span>Book Free Consultation</span>
            <Icons.ChevronRight size={16} />
          </button>
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
