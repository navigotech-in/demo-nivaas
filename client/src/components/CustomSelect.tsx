import { useState, useRef, useEffect } from 'react'
import { Icons } from './Icons'

export interface SelectOption {
  label: string
  value: string
}

interface CustomSelectProps {
  id?: string
  value: string
  options: (string | SelectOption)[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  placement?: 'bottom' | 'top' | 'auto'
  'aria-label'?: string
}

export default function CustomSelect({
  id,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  placement = 'auto',
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [resolvedPlacement, setResolvedPlacement] = useState<'bottom' | 'top'>('bottom')
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Normalize options into { label, value } objects
  const normalizedOptions: SelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  )

  const selectedOption = normalizedOptions.find((opt) => opt.value === value)

  // Calculate smart placement ("usi ke upar ya niche" based on screen room)
  useEffect(() => {
    if (isOpen && containerRef.current) {
      if (placement === 'top') {
        setResolvedPlacement('top')
      } else if (placement === 'bottom') {
        setResolvedPlacement('bottom')
      } else {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        // If less than 230px space below but plenty of space above, open upwards on top of field
        if (spaceBelow < 230 && rect.top > 200) {
          setResolvedPlacement('top')
        } else {
          setResolvedPlacement('bottom')
        }
      }
    }
  }, [isOpen, placement])

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Scroll active item into view on open
  useEffect(() => {
    if (isOpen && listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative w-full min-w-0 max-w-full">
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full min-w-0 max-w-full box-border rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-xs sm:text-sm text-[#111827] outline-none flex items-center justify-between text-left transition cursor-pointer select-none ${
          isOpen
            ? 'border-[#E76F2E] ring-2 ring-[#E76F2E]/15'
            : 'hover:border-[#9CA3AF] focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/15'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''} ${className}`}
      >
        <span className="truncate pr-2 font-medium text-[#111827]">
          {selectedOption ? selectedOption.label : <span className="text-[#9CA3AF]">{placeholder}</span>}
        </span>
        <Icons.ChevronDown
          size={14}
          className={`text-[#6B7280] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#E76F2E]' : ''
          }`}
        />
      </button>

      {/* Floating Popup Menu: "Usi ke upar ya niche" with 100% readable text and zero screen overflow */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className={`absolute left-0 right-0 z-50 w-full min-w-0 max-w-full rounded-xl border border-[#E7E0D7] bg-white p-1.5 shadow-2xl animate-fadeIn max-h-48 sm:max-h-56 overflow-y-auto overscroll-contain ${
            resolvedPlacement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
          style={{ boxSizing: 'border-box' }}
        >
          {normalizedOptions.map((opt) => {
            const isSelected = opt.value === value
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                data-selected={isSelected}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
                className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                  isSelected
                    ? 'bg-[#FFF6E8] text-[#E76F2E] font-bold'
                    : 'text-[#1F2937] hover:bg-[#F9FAFB] hover:text-[#E76F2E]'
                }`}
              >
                <span className="leading-snug break-words flex-1 text-left">{opt.label}</span>
                {isSelected && (
                  <Icons.Check size={14} className="shrink-0 text-[#E76F2E]" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
