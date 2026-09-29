import { useRef } from 'react'
import { elevations } from '../lib/data'
import { Icons } from './Icons'
import { DesignCatalogFilterBar } from './Projects'
import { DesignEmptyState, DesignImageBadge, DesignImageCard } from './DesignImageCard'
import { useDesignCatalogFilters } from './useDesignCatalogFilters'

interface ElevationsProps {
  onOpenConsult: (style?: string) => void
}

export default function Elevations({ onOpenConsult }: ElevationsProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const {
    filters,
    filtered,
    cities,
    openMenu,
    onChange,
    onToggle,
    onClose,
    clearAll,
  } = useDesignCatalogFilters(elevations)

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-slide]')
    const gap = 16
    const amount = card ? card.offsetWidth + gap : track.clientWidth
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section id="elevations" className="py-12 sm:py-14 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Home size={14} /> Front Facades & Elevations
            </span>
            <h2 className="section-title mt-2">
              Indian Home 3D Front Elevations & Facades
            </h2>
            <p className="mt-2 text-sm text-[#54504A] max-w-2xl">
              Photorealistic 4K 3D elevation renderings designed for Indian climates — featuring HPL wooden louvers, CNC jali screens, Kerala clay tile roofs, Dholpur sandstone, glass balconies, and warm LED profile lighting.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Previous elevations"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:bg-[#E76F2E] hover:border-[#E76F2E] hover:text-white active:scale-95"
              >
                <Icons.ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Next elevations"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:bg-[#E76F2E] hover:border-[#E76F2E] hover:text-white active:scale-95"
              >
                <Icons.ChevronRight size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onOpenConsult('Custom 3D Elevation')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-sm active:scale-[0.98] group/link"
            >
              <span>Get Custom 3D Elevation</span>
              <Icons.ChevronRight
                size={15}
                className="transition-transform group-hover/link:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        <DesignCatalogFilterBar
          filters={filters}
          cities={cities}
          openMenu={openMenu}
          onChange={onChange}
          onToggle={onToggle}
          onClose={onClose}
        />

        {/* Horizontal Slider */}
        {filtered.length > 0 ? (
          <div
            ref={trackRef}
            className="mt-6 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
          >
            {filtered.map((item) => (
              <DesignImageCard
                key={item.id}
                dataSlide
                aesthetic
                className="w-[88%] shrink-0 snap-start sm:w-[53%] md:w-[42%] lg:w-[34%] xl:w-[32%]"
                image={item.image}
                alt={item.title}
                title={item.title}
                description={item.text}
                leftBadges={
                  <DesignImageBadge icon={<Icons.Sparkles size={11} className="text-[#FFA366]" />}>
                    3D Elevation
                  </DesignImageBadge>
                }
                rightBadge={<DesignImageBadge variant="accent">{item.badge}</DesignImageBadge>}
                actionIcon={<Icons.Eye size={14} />}
                actionLabel="View 3D Designs"
                onAction={() => onOpenConsult(`Elevation Style: ${item.title}`)}
              />
            ))}
          </div>
        ) : (
          <DesignEmptyState
            message="No elevations match these filters"
            onClear={clearAll}
          />
        )}
      </div>
    </section>
  )
}