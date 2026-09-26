import { useRef } from 'react'
import { interiorCategories } from '../lib/data'
import { Icons } from './Icons'
import { DesignCatalogFilterBar } from './Projects'
import { DesignEmptyState, DesignImageBadge, DesignImageCard } from './DesignImageCard'
import { useDesignCatalogFilters } from './useDesignCatalogFilters'

interface InteriorsProps {
  onOpenConsult: (room?: string) => void
}

export default function Interiors({ onOpenConsult }: InteriorsProps) {
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
  } = useDesignCatalogFilters(interiorCategories)

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-slide]')
    const gap = 16
    const amount = card ? card.offsetWidth + gap : track.clientWidth
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section id="interiors" className="py-12 sm:py-14 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Sofa size={14} /> Luxury Interiors
            </span>
            <h2 className="section-title mt-2">
              Luxury Interior Designs for Indian Homes
            </h2>
            <p className="mt-2 text-sm text-[#74706A] max-w-2xl">
              Explore thoughtfully planned modular kitchens, living room TV units, pooja corners, wardrobes, and space-efficient storage — with photorealistic 3D views and practical solutions for Indian homes.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Previous interiors"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:border-[#E76F2E] hover:bg-[#E76F2E] hover:text-white active:scale-95"
              >
                <Icons.ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Next interiors"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:border-[#E76F2E] hover:bg-[#E76F2E] hover:text-white active:scale-95"
              >
                <Icons.ChevronRight size={16} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onOpenConsult('Complete Interior 3D Design')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-sm active:scale-[0.98] group/link"
            >
              <span>Get 3D Interior Quotation</span>
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

        {filtered.length > 0 ? (
          <div
            ref={trackRef}
            className="mt-6 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
          >
            {filtered.map((item) => (
              <DesignImageCard
                key={item.id}
                dataSlide
                className="w-[88%] shrink-0 snap-start sm:w-[53%] md:w-[42%] lg:w-[34%] xl:w-[32%]"
                image={item.image}
                alt={item.title}
                title={item.title}
                description={item.text}
                leftBadges={
                  <DesignImageBadge icon={<Icons.Sparkles size={11} className="shrink-0 text-[#FFA366]" />}>
                    {item.items}
                  </DesignImageBadge>
                }
                rightBadge={<DesignImageBadge variant="accent">Interior</DesignImageBadge>}
                meta={
                  <>
                    <Icons.Tag size={12} className="text-[#FFA366]" />
                    <span className="text-[#FFA366]">From ₹599 / sq.ft</span>
                  </>
                }
                actionIcon={<Icons.Sofa size={13} />}
                actionLabel="Get 3D Interior Quotation"
                onAction={() => onOpenConsult(`Interior Category: ${item.title}`)}
              />
            ))}
          </div>
        ) : (
          <DesignEmptyState
            message="No interiors match these filters"
            onClear={clearAll}
          />
        )}
      </div>
    </section>
  )
}
