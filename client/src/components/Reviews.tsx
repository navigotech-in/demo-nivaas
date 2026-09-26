import { useState } from 'react'
import { clientReviews } from '../lib/data'
import type { ReviewItem } from '../lib/data'
import { Icons } from './Icons'

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [, setExpanded] = useState(false)

  const current: ReviewItem = clientReviews[activeIndex]

  const handlePrev = () => {
    setExpanded(false)
    setActiveIndex((prev) => (prev === 0 ? clientReviews.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setExpanded(false)
    setActiveIndex((prev) => (prev === clientReviews.length - 1 ? 0 : prev + 1))
  }

  return (
    <section id="reviews" className="py-[68px] sm:py-[82px] bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.Star size={14} className="text-[#E76F2E]" /> Client Testimonials
          </span>
          <h2 className="section-title mt-2">
            Real voices, real experiences, Real legacy
          </h2>
          <p className="mt-2 text-sm text-[#74706A]">
            Over 800+ families across 60+ Indian cities built their dream homes with NIVAAS architectural plans and on-site engineering supervision.
          </p>
        </div>

        {/* Interactive Avatar Carousel */}
        <div className="mt-[41px] max-w-5xl mx-auto">
          {/* Avatar Track */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-5 overflow-x-auto scrollbar-none">
            {clientReviews.map((rev, idx) => {
              const isSelected = idx === activeIndex
              return (
                <button
                  key={rev.id}
                  type="button"
                  onClick={() => { setExpanded(false); setActiveIndex(idx) }}
                  className={`relative flex flex-col items-center transition-all duration-300 group ${
                    isSelected ? 'scale-110' : 'opacity-60 hover:opacity-90'
                  }`}
                  aria-label={`View review from ${rev.name}`}
                >
                  <div
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-full p-1 transition-all ${
                      isSelected
                        ? 'ring-4 ring-[#74706A] shadow-sm'
                        : 'ring-2 ring-transparent'
                    }`}
                  >
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="h-full w-full rounded-full object-cover shadow-sm"
                    />
                    {isSelected && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          setPlayingVideo(rev.youtubeId)
                        }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setPlayingVideo(rev.youtubeId)
                          }
                        }}
                        aria-label={`Play ${rev.name} video story`}
                        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#E76F2E] text-white text-[10px] shadow cursor-pointer hover:bg-[#C65320] transition"
                      >
                        <Icons.Play size={10} />
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold whitespace-nowrap ${
                      isSelected ? 'text-[#292826] font-bold' : 'text-[#74706A]'
                    }`}
                  >
                    {rev.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Review Spotlight Card */}
          <div className="relative mt-[27px] max-w-3xl mx-auto" key={current.id}>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-2 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-[#E7E0D7] text-[#292826] hover:bg-[#C65320] hover:text-white transition"
              aria-label="Previous review"
            >
              <Icons.ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-2 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm border border-[#E7E0D7] text-[#292826] hover:bg-[#C65320] hover:text-white transition"
              aria-label="Next review"
            >
              <Icons.ChevronRight size={16} />
            </button>

            <div className="rounded-lg border border-[#E7E0D7] bg-white shadow-sm p-5 sm:p-[31px] flex flex-col items-center text-center">
              <div className="flex items-start gap-4">
                <div
                  className="relative shrink-0 cursor-pointer"
                  onClick={() => setPlayingVideo(current.youtubeId)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPlayingVideo(current.youtubeId)
                    }
                  }}
                  aria-label={`Play ${current.name} video story`}
                >
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-[#E76F2E]"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#E76F2E] text-white text-[10px] shadow cursor-pointer">
                    <Icons.Play size={10} />
                  </span>
                </div>
                <div className="text-left pt-0.5">
                  <h3 className="font-display text-base sm:text-lg font-bold text-[#292826]">{current.name}</h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#74706A] flex items-center gap-1 mt-0.5">
                    <Icons.MapPin size={12} className="text-[#E76F2E]" /> {current.city}
                  </span>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[#E76F2E]">
                    {[...Array(current.stars)].map((_, i) => (
                      <Icons.Star key={i} size={14} />
                    ))}
                    <span className="ml-1 text-xs font-bold text-[#292826]">{current.stars}.0</span>
                  </div>
                </div>
              </div>

              <blockquote className="mt-5 font-display text-lg sm:text-xl lg:text-2xl font-bold text-[#292826] leading-snug max-w-2xl mx-auto">
                <span className="select-none text-[#E76F2E]">“</span>
                {current.quote}
                <span className="select-none text-[#E76F2E]">”</span>
              </blockquote>

              <div className="mt-4 flex flex-wrap gap-2 justify-center text-[11px]">
                <span className="rounded-lg bg-[#FFF6E8] px-3 py-1 font-semibold text-[#292826] border border-[#E7E0D7] flex items-center gap-1.5">
                  <Icons.Ruler size={12} className="text-[#E76F2E]" /> {current.plotSize}
                </span>
                <span className="rounded-lg bg-[#FFF6E8] px-3 py-1 font-semibold text-[#292826] border border-[#E7E0D7] flex items-center gap-1.5">
                  <Icons.Blueprint size={12} className="text-[#E76F2E]" /> {current.service}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPlayingVideo(current.youtubeId)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#E76F2E] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#C65320] transition"
              >
                <Icons.Play size={12} />
                <span>Watch Client Video Story</span>
              </button>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-5 flex justify-center gap-2">
            {clientReviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-[#E76F2E]' : 'w-2 bg-[#D8D2CC] hover:bg-[#74706A]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {playingVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1815]/80 p-4">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-lg bg-black shadow-sm border border-[#292826]">
            <div className="flex items-center justify-between bg-[#E76F2E] px-4 py-3 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-white/90 flex items-center gap-1.5">
                <Icons.Play size={12} /> Client Story · {current.name} ({current.city})
              </span>
              <button
                type="button"
                onClick={() => setPlayingVideo(null)}
                className="text-white hover:text-red-400 text-lg font-bold px-2"
              >
                <Icons.Close size={18} />
              </button>
            </div>
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${playingVideo}?autoplay=1&rel=0`}
                title="Client Review Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
