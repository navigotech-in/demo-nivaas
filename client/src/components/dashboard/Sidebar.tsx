import React from 'react'
import { Link } from 'react-router-dom'

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
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-[#E7E0D7] flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${className}`}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-[11px] font-semibold text-[#74706A] uppercase tracking-wider">
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

        {footer && <div className="p-4 border-t border-[#E7E0D7] bg-[#FAF8F5]">{footer}</div>}
      </aside>
    </>
  )
}
