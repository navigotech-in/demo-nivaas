import { useState, useRef, useEffect } from 'react'
import { clientReviews } from '../lib/data'
import type { ReviewItem } from '../lib/data'
import { Icons } from './Icons'

// Testimonial walkthrough and client interview video sources
const reviewVideos: Record<string, { videoUrl: string; posterUrl: string }> = {
  'rev-1': {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-house-with-a-swimming-pool-and-garden-42616-large.mp4',
    posterUrl: 'https://images.pexels.com/photos/1396122/pexels-photo-1396122.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  'rev-2': {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-architect-discussing-a-project-over-blueprints-40742-large.mp4',
    posterUrl: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  'rev-3': {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-house-with-a-swimming-pool-and-garden-42616-large.mp4',
    posterUrl: 'https://images.pexels.com/photos/258160/pexels-photo-258160.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  'rev-4': {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-architect-discussing-a-project-over-blueprints-40742-large.mp4',
    posterUrl: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
  'rev-5': {
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-modern-house-with-a-swimming-pool-and-garden-42616-large.mp4',
    posterUrl: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop',
  },
}

export default function Reviews() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const current: ReviewItem = clientReviews[activeIndex]
  const currentMedia = reviewVideos[current.id] || reviewVideos['rev-1']

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? clientReviews.length - 1 : prev - 1))
    setIsPlaying(false)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev === clientReviews.length - 1 ? 0 : prev + 1))
    setIsPlaying(false)
  }

  useEffect(() => {
    setIsPlaying(false)
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = 0
    }
  }, [activeIndex])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
      } else {
        videoRef.current.play().catch(() => {})
        setIsPlaying(true)
      }
    }
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
          <p className="mt-2 text-sm text-[#54504A]">
            Over 800+ families across Indore and 60+ Indian cities built their dream homes with NIVAAS architectural plans and on-site engineering supervision.
          </p>
        </div>

        {/* Interactive Avatar Carousel */}
        <div className="mt-[41px] max-w-5xl mx-auto">
          {/* Avatar Track */}
          <div className="flex items-center justify-start md:justify-center gap-3.5 sm:gap-6 py-5 px-4 md:px-0 overflow-x-auto scrollbar-none max-w-full">
            {clientReviews.map((rev, idx) => {
              const isSelected = idx === activeIndex
              const displayName = rev.name.replace(/^(Mr\.|Mrs\.|Ms\.|Dr\.)\s+/i, '').split(' ')[0] || rev.name
              return (
                <button
                  key={rev.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`relative flex flex-col items-center transition-all duration-300 group cursor-pointer shrink-0 ${
                    isSelected ? 'scale-110' : 'opacity-60 hover:opacity-90'
                  }`}
                  aria-label={`View review from ${rev.name}`}
                >
                  <div
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 rounded-full p-1 transition-all ${
                      isSelected
                        ? 'ring-4 ring-[#E76F2E] shadow-sm'
                        : 'ring-2 ring-transparent'
                    }`}
                  >
                    <img
                      src={rev.avatar}
                      alt={rev.name}
                      className="h-full w-full rounded-full object-cover shadow-sm"
                    />
                  </div>
                  <span
                    className={`mt-2 text-[11px] font-semibold whitespace-nowrap ${
                      isSelected ? 'text-[#292826] font-bold' : 'text-[#54504A]'
                    }`}
                  >
                    {displayName}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Active Review Spotlight Card (Decreased 25% H & V, Zero Clipping) */}
          <div className="relative mt-6 max-w-xl mx-auto" key={current.id}>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg border border-[#E7E0D7] text-[#292826] hover:bg-[#E76F2E] hover:text-white transition cursor-pointer"
              aria-label="Previous review"
            >
              <Icons.ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-lg border border-[#E7E0D7] text-[#292826] hover:bg-[#E76F2E] hover:text-white transition cursor-pointer"
              aria-label="Next review"
            >
              <Icons.ChevronRight size={16} />
            </button>

            <div className="rounded-2xl border border-[#E7E0D7] bg-white shadow-md p-4 sm:p-5 flex flex-col items-center text-center">
              {/* Actual Video Player (Decreased Height by 25%) */}
              <div
                className="relative w-full aspect-[16/9] max-h-[220px] rounded-xl overflow-hidden bg-black shadow-inner mb-4 group cursor-pointer"
                onClick={togglePlay}
              >
                <video
                  ref={videoRef}
                  src={currentMedia.videoUrl}
                  poster={currentMedia.posterUrl}
                  playsInline
                  controls={isPlaying}
                  className="w-full h-full object-cover"
                  onEnded={() => setIsPlaying(false)}
                />

                {/* Video Play Overlay */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-black/35 flex items-center justify-center transition-all group-hover:bg-black/25">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-[#E76F2E] text-white flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110 border-2 border-white">
                      <Icons.Play size={20} className="ml-0.5 text-white" />
                    </div>
                    <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-bold drop-shadow-md flex items-center gap-1.5 bg-black/60 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      <span>▶ Watch Client Story &amp; House Tour</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Client Quote (Always 100% visible, fully padded) */}
              <blockquote className="text-xs sm:text-sm md:text-[14px] font-medium text-[#292826] leading-relaxed max-w-lg mx-auto px-1">
                <span className="select-none text-[#E76F2E] font-bold">“</span>
                {current.quote}
                <span className="select-none text-[#E76F2E] font-bold">”</span>
              </blockquote>

              {/* Client Name & Location at Bottom (Clean & Fully Visible) */}
              <div className="mt-4 pt-3 border-t border-[#EEE9E3] w-full flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                <div className="flex items-center gap-2.5">
                  <img
                    src={current.avatar}
                    alt={current.name}
                    className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover ring-2 ring-[#E76F2E] shrink-0"
                  />
                  <div>
                    <h3 className="font-display text-xs sm:text-sm font-bold text-[#292826] leading-tight">
                      {current.name}
                    </h3>
                    <div className="text-[11px] font-semibold text-[#54504A] flex items-center gap-1 mt-0.5">
                      <Icons.MapPin size={11} className="text-[#E76F2E]" />
                      <span>{current.city}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[#E76F2E]">
                  {[...Array(current.stars)].map((_, i) => (
                    <Icons.Star key={i} size={13} />
                  ))}
                  <span className="ml-1 text-[10px] font-black text-[#292826] bg-[#FFF6E8] border border-[#E7E0D7] px-1.5 py-0.5 rounded">
                    5.0 Rating
                  </span>
                </div>
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
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  i === activeIndex ? 'w-6 bg-[#E76F2E]' : 'w-2 bg-[#D8D2CC] hover:bg-[#54504A]'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
