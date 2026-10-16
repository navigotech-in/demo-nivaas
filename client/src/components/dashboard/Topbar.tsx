import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/authContext'
import { Icons } from '../Icons'
import LogoutConfirmModal from '../LogoutConfirmModal'

interface TopbarProps {
  title?: string
  badgeText?: string
  onMenuToggle?: () => void
  showVisitWebsite?: boolean
  onProfileClick?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  title = 'Indore House Makers',
  onMenuToggle,
  onProfileClick,
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = user?.name || (user?.role === 'ADMIN' ? 'IHM Administrator' : 'User')
  const displayEmail = user?.email || (user?.role === 'ADMIN' ? 'admin@ihm.com' : 'user@ihm.com')
  const shortName = user?.role === 'ADMIN' ? 'Admin' : (user?.name?.split(' ')[0] || 'User')
  const initial = displayName.charAt(0).toUpperCase() || (user?.role === 'ADMIN' ? 'I' : 'U')

  const handleOpenProfile = () => {
    setDropdownOpen(false)
    if (onProfileClick) {
      onProfileClick()
    } else {
      navigate(user?.role === 'ADMIN' ? '/admin?tab=profile' : '/dashboard?tab=profile')
    }
  }

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      setLogoutModalOpen(false)
      navigate('/', { replace: true })
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white border-b border-[#E7E0D7] sticky top-0 z-30 px-2.5 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Hamburger (mobile) + Logo & Platform Title (strictly shrink-0, always 100% visible) */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-md text-[#74706A] hover:text-[#292826] hover:bg-[#FAF8F5] transition cursor-pointer shrink-0"
            aria-label="Toggle navigation"
          >
            <Icons.Menu size={18} />
          </button>
        )}
        <Link
          to="/"
          title="Return to Indore House Makers Homepage"
          className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 hover:opacity-90"
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white flex items-center justify-center font-black text-[10px] sm:text-[11px] shrink-0 shadow-xs">
            IHM
          </div>
          <span className="font-display tracking-tight text-xs sm:text-base font-extrabold text-[#111827] whitespace-nowrap">
            {title}
          </span>
        </Link>
      </div>

      {/* Right: Interactive User/Admin Profile Dropdown (Ultra-compact on Mobile so Title Never Gets Hidden) */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-1 sm:gap-2 px-1.5 py-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#FFF6E8] border border-[#E7E0D7] hover:border-[#E76F2E]/40 transition cursor-pointer shadow-xs active:scale-[0.98]"
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
          title={`${displayName} (${displayEmail})`}
        >
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white flex items-center justify-center text-[10px] sm:text-xs font-black shrink-0 shadow-xs">
            {initial}
          </div>
          <div className="flex flex-col text-left min-w-0">
            {/* Mobile: Ultra-compact short name (max 42px) */}
            <span className="sm:hidden text-[10px] font-bold text-[#292826] leading-none truncate max-w-[42px]">
              {shortName}
            </span>
            {/* Tablet/Desktop: Full name & email */}
            <span className="hidden sm:inline text-xs font-bold text-[#292826] leading-tight truncate max-w-[140px]">
              {displayName}
            </span>
            <span className="hidden sm:inline text-[10px] text-[#74706A] leading-tight truncate max-w-[140px]">
              {displayEmail}
            </span>
          </div>
          <Icons.ChevronDown
            size={11}
            className={`text-[#74706A] transition-transform duration-200 shrink-0 ${
              dropdownOpen ? 'rotate-180 text-[#E76F2E]' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-2.5 shadow-2xl border border-[#E7E0D7] z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Dropdown Header Info (Clickable: Opens Profile tab like Overview or My Projects) */}
            <button
              type="button"
              onClick={handleOpenProfile}
              className="w-full flex items-start gap-2.5 p-2.5 rounded-xl bg-[#FDFCF9] hover:bg-[#FFF6E8] border border-[#EEE9E3] hover:border-[#E76F2E]/40 mb-2 transition group cursor-pointer text-left"
              title={user?.role === 'ADMIN' ? 'Open Admin Profile' : 'Open My Profile'}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white flex items-center justify-center text-xs font-black shrink-0 shadow-xs mt-0.5 group-hover:scale-105 transition-transform">
                {initial}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-xs font-black text-[#111827] group-hover:text-[#C94F36] truncate transition-colors">
                    {displayName}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      user?.role === 'ADMIN'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-900 border border-amber-200'
                    }`}
                  >
                    {user?.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'}
                  </span>
                </div>
                <span className="text-[10.5px] text-[#74706A] truncate">
                  {displayEmail}
                </span>
                {user?.phone && (
                  <span className="text-[10px] text-[#74706A] font-mono truncate mt-0.5">
                    📞 {user.phone}
                  </span>
                )}
              </div>
            </button>

            {/* Menu Links */}
            <div className="space-y-1">
              {/* My Profile Action */}
              <button
                type="button"
                onClick={handleOpenProfile}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#292826] hover:bg-[#FFF6E8] hover:text-[#C94F36] transition cursor-pointer text-left"
              >
                <Icons.User size={15} className="text-[#C94F36] shrink-0" />
                <span>{user?.role === 'ADMIN' ? 'Admin Profile' : 'My Profile'}</span>
              </button>

              <div className="my-1 border-t border-[#EEE9E3]" />

              {/* Logout / Sign Out */}
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false)
                  setLogoutModalOpen(true)
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:bg-rose-50 transition text-left cursor-pointer"
              >
                <Icons.LogOut size={15} className="text-rose-600 shrink-0" />
                <span>Logout / Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </header>
  )
}
