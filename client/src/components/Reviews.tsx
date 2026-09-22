import { useState } from 'react'
import { clientReviews } from '../lib/data'
import type { ReviewItem } from '../lib/data'
import { Icons } from './Icons'

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

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
    <section id="reviews" className="py-20 sm:py-24 bg-[#E2E8F0] border-t border-slate-300 overflow-hidden">
      <div className="container-content">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.Star size={14} className="text-amber-500" /> Client Testimonials
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            Real voices, real experiences, Real legacy
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Over 800+ families across 60+ Indian cities built their dream homes with NIVAAS architectural plans and on-site engineering supervision.
          </p>
        </div>

        {/* Interactive Avatar Carousel */}
        <div className="mt-12 max-w-5xl mx-auto">
          {/* Avatar Track */}
          <div className="flex items-center justify-center gap-3 sm:gap-6 py-6 overflow-x-auto scrollbar-none">
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
                        ? 'ring-4 ring-slate-500 shadow-xl'
                        : 'ring-2 ring-transparent'
                    }`}
                  >
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="h-full w-full rounded-full object-cover shadow-sm"
                    />
                    {isSelected && (
                      <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] shadow">
                        <Icons.Play size={10} />
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold whitespace-nowrap ${
                      isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {rev.name.split(' ')[0]}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Review Spotlight Card */}
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-white shadow-lg border border-slate-200 p-5 sm:p-6 flex flex-col sm:flex-row items-start gap-5 sm:gap-6 relative text-left">
              {/* Nav arrows */}
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg border border-slate-300 text-slate-800 hover:bg-blue-600 hover:text-white transition"
                aria-label="Previous review"
              >
                <Icons.ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg border border-slate-300 text-slate-800 hover:bg-blue-600 hover:text-white transition"
                aria-label="Next review"
              >
                <Icons.ChevronRight size={16} />
              </button>

              {/* Big client image */}
              <div className="shrink-0 w-full sm:w-56">
                <div className="relative overflow-hidden rounded-xl border border-slate-200 shadow-md">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-48 w-full sm:h-56 object-cover"
                  />
                  <span className="absolute bottom-2 left-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white shadow">
                    <Icons.Play size={12} />
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 text-amber-500">
                  {[...Array(current.stars)].map((_, i) => (
                    <Icons.Star key={i} size={15} />
                  ))}
                  <span className="ml-1 text-xs font-bold text-slate-900">{current.stars}.0</span>
                </div>
              </div>

              {/* Review content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-1.5">
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">{current.name}</h3>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Icons.MapPin size={12} /> {current.city}
                  </span>
                </div>

                <blockquote className="mt-2 font-display text-sm sm:text-base text-slate-800 leading-relaxed italic">
                  "{(() => {
                    const full = current.quote
                    const short = full.length > 130 ? `${full.slice(0, 130)}\u2026` : full
                    return expanded ? full : short
                  })()}"
                  {current.quote.length > 130 && (
                    <button
                      type="button"
                      onClick={() => setExpanded((v) => !v)}
                      className="mt-1 block text-xs font-bold text-blue-600 hover:text-blue-700 not-italic"
                    >
                      {expanded ? 'Read less' : 'Read more'}
                    </button>
                  )}
                </blockquote>

                <div className="mt-3.5 flex flex-wrap gap-2 text-[11px]">
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 border border-slate-300 flex items-center gap-1.5">
                    <Icons.Ruler size={12} className="text-slate-700" /> {current.plotSize}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-950 border border-slate-300 flex items-center gap-1.5">
                    <Icons.Blueprint size={12} className="text-slate-900" /> {current.service}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setPlayingVideo(current.youtubeId)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                >
                  <Icons.Play size={12} />
                  <span>Watch Client Video Story</span>
                </button>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {clientReviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === activeIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-400 hover:bg-slate-600'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal Player */}
      {playingVideo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
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
                src={`https://www.youtube-nocookie.com/embed/${playingVideo}?autoplay=1`}
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
