import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../lib/authContext'
import { Icons } from '../Icons'

interface TopbarProps {
  title?: string
  badgeText?: string
  onMenuToggle?: () => void
}

export const Topbar: React.FC<TopbarProps> = ({
  title = 'Indore House Makers',
  badgeText,
  onMenuToggle,
}) => {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white border-b border-[#E7E0D7] sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            type="button"
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-md text-[#74706A] hover:text-[#292826] hover:bg-[#FAF8F5] transition"
            aria-label="Toggle navigation"
          >
            <Icons.Menu size={20} />
          </button>
        )}
        <Link to="/" className="flex items-center gap-2 text-sm font-bold text-[#292826] hover:opacity-90">
          <div className="w-6 h-6 rounded bg-[#C94F36] text-white flex items-center justify-center font-black text-xs">
            I
          </div>
          <span className="hidden sm:inline font-display">{title}</span>
        </Link>
        {badgeText && (
          <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-[#FFF6E8] text-[#C94F36] border border-[#E7E0D7]">
            {badgeText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-[#292826]">{user?.name || 'User'}</span>
          <span className="text-[11px] text-[#74706A]">{user?.email}</span>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex items-center gap-2">
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#292826] bg-[#FAF8F5] hover:bg-[#FFF6E8] border border-[#E7E0D7] transition"
            >
              <Icons.Shield size={14} className="text-[#C94F36]" />
              <span>Admin</span>
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-[#74706A] hover:text-rose-700 hover:bg-rose-50 border border-[#E7E0D7] transition"
          title="Sign Out"
        >
          <Icons.LogOut size={14} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
