import type { ReactNode } from 'react'
import Img from './Img'
import { Icons } from './Icons'

interface DesignImageBadgeProps {
  children: ReactNode
  icon?: ReactNode
  variant?: 'dark' | 'accent' | 'light' | 'amber'
  className?: string
}

export function DesignImageBadge({ children, icon, variant = 'dark', className = '' }: DesignImageBadgeProps) {
  const variants = {
    dark: 'border border-white/15 bg-black/60 text-white',
    accent: 'bg-[#E76F2E]/90 text-white',
    light: 'bg-white/90 text-[#292826]',
    amber: 'bg-amber-500/90 text-white',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${variants[variant]} ${className}`}>
      {icon}
      {children}
    </span>
  )
}

interface DesignImageCardProps {
  image: string
  alt: string
  title: string
  description: string
  leftBadges: ReactNode
  rightBadge?: ReactNode
  meta?: ReactNode
  actionLabel: string
  onAction: () => void
  actionIcon?: ReactNode
  className?: string
  dataSlide?: boolean
  aesthetic?: boolean
}

export function DesignImageCard({
  image,
  alt,
  title,
  description,
  leftBadges,
  rightBadge,
  meta,
  actionLabel,
  onAction,
  actionIcon,
  className = '',
  dataSlide = false,
  aesthetic = false,
}: DesignImageCardProps) {
  return (
    <article
      data-slide={dataSlide ? 'true' : undefined}
      className={`group relative h-[256px] overflow-hidden rounded-lg border border-[#E7E0D7] bg-[#292826] shadow-sm transition-all duration-300 hover:border-[#E76F2E]/50 hover:shadow-card sm:h-[280px] xl:h-[296px] ${aesthetic ? 'ring-1 ring-inset ring-white/10' : ''} ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <Img
          src={image}
          alt={alt}
          loading="lazy"
          className={`h-full w-full object-cover transition-transform duration-700 ease-out ${aesthetic ? 'saturate-[1.12] contrast-[1.06] group-hover:scale-[1.08]' : 'group-hover:scale-105'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F1E1C]/95 via-[#1F1E1C]/25 to-transparent transition-colors group-hover:via-[#1F1E1C]/35" />
        {aesthetic && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFF6E8]/10 via-transparent to-[#E76F2E]/10" />
            <div className="absolute inset-0 border border-white/10" />
          </>
        )}
      </div>

      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-4">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">{leftBadges}</div>
        {rightBadge}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-white">
        {meta && <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-white/80">{meta}</div>}
        <h3 className="font-display text-base font-bold leading-snug text-white transition-colors group-hover:text-[#FFA366]">
          {title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/75">
          {description}
        </p>
        <button
          type="button"
          onClick={onAction}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#E76F2E] px-4 py-2 text-xs font-bold text-white shadow-md transition hover:bg-[#C65320] active:scale-[0.98] group/link"
        >
          {actionIcon}
          <span>{actionLabel}</span>
          <Icons.ChevronRight size={14} className="transition-transform group-hover/link:translate-x-0.5" />
        </button>
      </div>
    </article>
  )
}

interface DesignEmptyStateProps {
  message: string
  onClear: () => void
}

export function DesignEmptyState({ message, onClear }: DesignEmptyStateProps) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-[#E7E0D7] bg-white px-5 py-9 text-center">
      <Icons.Search size={20} className="mx-auto text-[#74706A]" />
      <p className="mt-2 text-sm font-bold text-[#292826]">{message}</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#E76F2E] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#C65320]"
      >
        <Icons.Close size={12} />
        Clear Filters
      </button>
    </div>
  )
}
