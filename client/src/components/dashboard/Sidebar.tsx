import React from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../Icons'

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  to?: string
  onClick?: () => void
  active?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  isOpen?: boolean
  onClose?: () => void
  footer?: React.ReactNode
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  isOpen = false,
  onClose,
  footer,
  className = '',
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[99985] lg:hidden backdrop-blur-xs transition-opacity duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-[99990] w-64 bg-white border-r border-[#E7E0D7] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 lg:z-10 lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)] ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${className}`}
      >
        {/* Mobile Header with close button */}
        <div className="p-4 border-b border-[#EEE9E3] flex items-center justify-between lg:hidden shrink-0 bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white flex items-center justify-center font-black text-[10px]">
              IHM
            </div>
            <span className="font-display font-extrabold text-xs text-[#292826] tracking-tight">
              Workspace Menu
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-[#54504A] hover:bg-[#FFF6E8] hover:text-[#C94F36] transition cursor-pointer"
            aria-label="Close sidebar"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="p-4 space-y-1 flex-1 overflow-y-auto min-h-0">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-[#74706A] uppercase tracking-wider">
            Navigation
          </div>
          <nav className="space-y-1">
            {items.map((item) => {
              const activeClass = item.active
                ? 'bg-[#FFF6E8] text-[#C94F36] font-semibold border-r-2 border-[#C94F36]'
                : 'text-[#74706A] hover:bg-[#FAF8F5] hover:text-[#292826] font-medium'

              const content = (
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2.5">
                    {item.icon && <span className={item.active ? 'text-[#C94F36]' : 'text-[#74706A]'}>{item.icon}</span>}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[#FAF8F5] text-[#74706A] border border-[#E7E0D7]">
                      {item.badge}
                    </span>
                  )}
                </div>
              )

              if (item.to) {
                return (
                  <Link
                    key={item.id}
                    to={item.to}
                    onClick={onClose}
                    className={`flex items-center px-3 py-2 rounded-md text-xs transition ${activeClass}`}
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick?.()
                    onClose?.()
                  }}
                  className={`w-full flex items-center px-3 py-2 rounded-md text-xs text-left transition ${activeClass}`}
                >
                  {content}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer (Quick Actions) — always visible, pinned, never hidden by bottom nav */}
        {footer && (
          <div className="p-4 border-t border-[#E7E0D7] bg-[#FAF8F5] shrink-0 pb-24 lg:pb-4 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]">
            {footer}
          </div>
        )}
      </aside>
    </>
  )
}
