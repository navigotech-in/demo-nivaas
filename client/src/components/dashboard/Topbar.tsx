import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/authContext'
import { Icons } from '../Icons'
import LogoutConfirmModal from '../LogoutConfirmModal'

interface TopbarProps {
  title?: string
  badgeText?: string
  onMenuToggle?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  title = 'Indore House Makers — Admin',
  badgeText,
  onMenuToggle,
}) => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setLogoutModalOpen(false)
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <header className="bg-white border-b border-[#E7E0D7] sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left: Logo & Platform Title */}
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-md text-[#74706A] hover:text-[#292826] hover:bg-[#FAF8F5] transition cursor-pointer"
            aria-label="Toggle navigation"
          >
            <Icons.Menu size={20} />
          </button>
        )}
        <Link to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 text-sm font-bold text-[#292826] hover:opacity-90">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white flex items-center justify-center font-black text-[11px] shrink-0 shadow-xs">
            IHM
          </div>
          <span className="font-display tracking-tight text-sm sm:text-base font-extrabold text-[#111827]">
            {title}
          </span>
        </Link>
        {badgeText && (
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-[#FFF6E8] text-[#C94F36] border border-[#E7E0D7]">
            {badgeText}
          </span>
        )}
      </div>

      {/* Right: [Admin Profile] [Sign Out] */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* [Admin Profile] Item */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#FAF8F5] border border-[#E7E0D7]">
          <div className="w-6 h-6 rounded-full bg-[#C94F36] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-semibold text-[#292826] leading-tight">{user?.name || 'Admin'}</span>
            <span className="text-[10px] text-[#74706A] leading-tight">{user?.email || 'admin@nivaas.in'}</span>
          </div>
        </div>

        {/* [Sign Out] Button */}
        <button
          type="button"
          onClick={() => setLogoutModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-rose-700 bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200 transition cursor-pointer"
          title="Sign Out"
        >
          <Icons.LogOut size={13} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
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
