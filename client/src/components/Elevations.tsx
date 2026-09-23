import { useRef } from 'react'
import { elevations } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface ElevationsProps {
  onOpenConsult: (style?: string) => void
}

export default function Elevations({ onOpenConsult }: ElevationsProps) {
  const trackRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-slide]')
    const gap = 24
    const amount = card ? card.offsetWidth + gap : track.clientWidth
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <section id="elevations" className="py-20 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Home size={14} /> Front Facades & Elevations
            </span>
            <h2 className="section-title mt-2">
              Indian Home 3D Front Elevations & Facades
            </h2>
            <p className="mt-2 text-sm text-[#74706A] max-w-2xl">
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

        {/* Horizontal Slider */}
        <div
          ref={trackRef}
          className="mt-10 flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
        >
          {elevations.map((item, idx) => (
            <article
              key={idx}
              data-slide
              className="relative shrink-0 snap-start w-[85%] sm:w-[55%] md:w-[46%] lg:w-[38%] rounded-lg border border-[#E7E0D7] bg-white overflow-hidden shadow-sm group"
            >
              {/* Image */}
              <div className="relative overflow-hidden bg-[#FFF6E8]">
                <Img
                  src={item.image}
                  alt={item.title}
                  className="w-full object-cover aspect-[4/3] sm:aspect-[45/20] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute top-4 left-4 rounded-lg bg-[#292826] px-3 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                  <Icons.Sparkles size={11} className="text-[#E76F2E]" />
                  <span>{item.badge}</span>
                </span>
              </div>

              {/* Slide content */}
              <div className="p-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#74706A]">
                  3D Elevation
                </span>
                <h3 className="mt-1 font-display text-base font-bold text-[#292826] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#74706A] leading-relaxed line-clamp-3">
                  {item.text}
                </p>
                <button
                  type="button"
                  onClick={() => onOpenConsult(`Elevation Style: ${item.title}`)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#E76F2E] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#C65320] active:scale-[0.98] group/link"
                >
                  <Icons.Eye size={14} />
                  <span>View 3D Designs</span>
                  <Icons.ChevronRight
                    size={14}
                    className="transition-transform group-hover/link:translate-x-0.5"
                  />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}