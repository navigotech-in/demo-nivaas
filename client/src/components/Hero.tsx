import { useState } from 'react'
import { Icons } from './Icons'
import heroBgWebp from '../assets/hero-bg.webp'
import heroBgMobileWebp from '../assets/hero-bg-mobile.webp'

const stats = [
  { value: '12,000+', label: 'Verified House Plans', icon: Icons.Blueprint },
  { value: '8,500+', label: '3D Front Elevations', icon: Icons.Home },
  { value: '60+', label: 'Indian Cities Served', icon: Icons.MapPin },
  { value: '98.6%', label: 'Vastu Compliance Score', icon: Icons.ShieldCheck },
]

interface HeroProps {
  onCalculate: (data: {
    serviceType: string
    depth: number
    width: number
    floors: number
    builtUpArea: number
    direction: string
  }) => void
}

const rates = {
  standard: 1650,
  premium: 2150,
  luxury: 2850,
}

type QualityKey = keyof typeof rates

export default function Hero({ onCalculate }: HeroProps) {
  const [area, setArea] = useState<number>(1800)
  const [quality, setQuality] = useState<QualityKey>('premium')
  const [floors, setFloors] = useState<number>(2)

  const totalBuiltup = area * (floors === 1 ? 1 : floors === 2 ? 1.85 : floors === 3 ? 2.7 : 3.5)
  const totalCost = Math.round(totalBuiltup * rates[quality])
  const ratePerSqft = rates[quality]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCalculate({
      serviceType: 'Quick Construction Estimate',
      depth: 30,
      width: 50,
      floors,
      builtUpArea: totalBuiltup,
      direction: 'East Facing',
    })
  }

  return (
    <>
      <section id="top" className="relative bg-[#292826] overflow-hidden">
      {/* Hero Background Image with Atmospheric Lighting */}
      <div className="absolute inset-0">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroBgMobileWebp} type="image/webp" width="768" height="1660" />
          <source srcSet={heroBgWebp} type="image/webp" width="1920" height="1072" />
          <img
            src={heroBgWebp}
            alt="Modern Indian residential building design with warm ambient architectural lighting"
            className="h-full w-full object-cover object-center brightness-[1.05] contrast-[1.02]"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            width="1920"
            height="1072"
          />
        </picture>
        {/* Soft, Light Cinematic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/25 pointer-events-none" />
      </div>

      {/* Hero Central Content Container (Optimized padding to prevent horizontal side crop) */}
      <div className="container-content relative z-10 pt-16 sm:pt-20 md:pt-24 pb-6 sm:pb-8 md:pb-10">
        {/* Headline & Subtitle */}
        <div className="text-center text-white mb-6 sm:mb-8 md:mb-10 animate-fadeIn max-w-3xl mx-auto px-2">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-extrabold tracking-tight text-white leading-[1.18] sm:leading-tight drop-shadow-lg">
            House Plans & Home Designs For Every Indian Plot
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-white/95 max-w-xl mx-auto leading-relaxed drop-shadow-md font-medium">
            Explore 12,000+ curated 2D floor plans, photorealistic 3D elevations, and complete structural CAD blueprints tailored for Indian plot sizes and Vastu norms.
          </p>
        </div>

        {/* Cost Estimator Box with Lightened Master Back Card */}
        <div className="relative max-w-[820px] mx-auto mt-4 sm:mt-6 md:mt-8">
          {/* Master Lightened Smoked Glass Frame (Piche wala card - 10% more light) */}
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden w-full rounded-2xl sm:rounded-3xl border border-white/28 bg-white/[0.16] p-3.5 sm:p-5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] transition-all group"
          >
            {/* Top Bar of Card */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-[#E76F2E] text-white shadow-md border border-white/25">
                  <Icons.Calculator size={18} />
                </div>
                <div>
                  <div className="font-display text-sm sm:text-base font-extrabold text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex items-center gap-2">
                    <span>Quick Construction Cost Estimator</span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#E76F2E] text-white shadow-sm border border-white/25">Instant</span>
                  </div>
                  <div className="text-[11px] text-white/95 font-medium mt-0.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    Instant turnkey budget & material calculation for your plot
                  </div>
                </div>
              </div>

              {/* Cost Output Badge with Smoked Finish */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between bg-black/[0.18] px-3.5 py-1.5 sm:py-2 rounded-xl border border-white/18 shadow-sm">
                <div className="text-[9px] font-bold uppercase tracking-wider text-[#FFA366] flex items-center gap-1.5 drop-shadow">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-pulse" />
                  Est. Turnkey Cost
                </div>
                <div className="font-display text-lg sm:text-xl md:text-2xl font-black text-white leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                  ₹{(totalCost / 100000).toFixed(2)} <span className="text-[#FFA366] text-base font-bold">Lakhs</span>
                </div>
              </div>
            </div>

            {/* 3 Smoked Glass Pods Grid: Area Slider | Quality | Floors */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-3 items-stretch">
              {/* Ground Area Slider Pod */}
              <div className="bg-black/[0.15] hover:bg-black/[0.10] rounded-xl p-3 sm:p-3.5 border border-white/15 transition-all duration-200 flex flex-col justify-between">
                <div>
                  <label className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-white mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    <span className="flex items-center gap-1.5">
                      <Icons.Grid size={13} className="text-[#FFA366]" />
                      <span>Plot Ground Area</span>
                    </span>
                    <span className="text-white font-extrabold text-[11px] normal-case bg-[#E76F2E] px-2.5 py-0.5 rounded-full shadow-sm border border-white/25">
                      {area} sq.ft
                    </span>
                  </label>
                  <input
                    type="range"
                    min={500}
                    max={5000}
                    step={50}
                    value={area}
                    aria-label="Plot ground area in square feet"
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full accent-[#E76F2E] h-1.5 bg-white/25 rounded-full cursor-pointer transition shadow-inner border border-white/20"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-white/90 mt-2 font-medium pt-1.5 border-t border-white/15 drop-shadow">
                  <span>500 sq.ft</span>
                  <span className="text-white font-bold">2,500</span>
                  <span>5,000 sq.ft</span>
                </div>
              </div>

              {/* Build Quality Package Pod */}
              <div className="bg-black/[0.15] hover:bg-black/[0.10] rounded-xl p-3 sm:p-3.5 border border-white/15 transition-all duration-200 flex flex-col justify-between">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  <Icons.Layers size={13} className="text-[#FFA366]" />
                  <span>Build Quality Package</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(rates) as QualityKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Select ${key} construction quality`}
                      onClick={() => setQuality(key)}
                      className={`py-2 px-1 rounded-lg border text-[10px] font-extrabold text-center transition-all duration-150 ${
                        quality === key
                          ? 'border-white/60 bg-[#E76F2E] text-white shadow-md'
                          : 'border-white/15 bg-black/[0.18] hover:bg-white/10 text-white drop-shadow active:scale-95'
                      }`}
                    >
                      {key[0].toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floors Pod */}
              <div className="bg-black/[0.15] hover:bg-black/[0.10] rounded-xl p-3 sm:p-3.5 border border-white/15 transition-all duration-200 flex flex-col justify-between">
                <label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                  <Icons.Building size={13} className="text-[#FFA366]" />
                  <span>Number of Floors</span>
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { label: 'G', val: 1 },
                    { label: 'G+1', val: 2 },
                    { label: 'G+2', val: 3 },
                    { label: 'G+3', val: 4 },
                  ].map((fl) => (
                    <button
                      key={fl.val}
                      type="button"
                      aria-label={`Select ${fl.label} floor plan`}
                      onClick={() => setFloors(fl.val)}
                      className={`py-2 px-0.5 rounded-lg border text-[10px] font-extrabold text-center transition-all duration-150 ${
                        floors === fl.val
                          ? 'border-white/60 bg-[#E76F2E] text-white shadow-md'
                          : 'border-white/15 bg-black/[0.18] hover:bg-white/10 text-white drop-shadow active:scale-95'
                      }`}
                    >
                      {fl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer of Card */}
            <div className="relative z-10 mt-3 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/20">
              <div className="flex items-center gap-2 text-[11px] text-white font-medium text-center sm:text-left drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                <div className="p-1 rounded-md bg-white/15 border border-white/25">
                  <Icons.HelpCircle size={13} className="text-white shrink-0" />
                </div>
                <span>
                  <strong className="text-white font-bold">{totalBuiltup.toLocaleString('en-IN')} sq.ft</strong> builtup @ <span className="text-[#FFA366] font-bold">₹{ratePerSqft.toLocaleString('en-IN')}/sq.ft</span>
                </span>
              </div>
              <button
                type="submit"
                aria-label="Send me detailed construction estimate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF7A29] via-[#E76F2E] to-[#C85418] hover:from-[#FF8C42] hover:via-[#F27E3D] hover:to-[#D95D20] px-5 sm:px-6 py-2.5 text-xs font-bold text-white shadow-md hover:brightness-105 transition-all duration-200 border border-white/30 tracking-wide"
              >
                <span>Get Detailed Blueprint & Cost Plan</span>
                <Icons.ChevronRight size={15} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>

    {/* App Store & Stats Ribbon (Modern Grey Theme) */}
    <div className="border-b border-[#E7E0D7] bg-[#FDFCF9] py-4.5 sm:py-5 shadow-inner">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto">
            {stats.map((s) => {
              const StatIcon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-[#E7E0D7]/80 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F1ECE5] text-[#E76F2E]">
                    <StatIcon size={20} />
                  </div>
                  <div>
                    <div className="font-display text-lg sm:text-xl font-bold text-[#E76F2E] leading-none">
                      {s.value}
                    </div>
                    <div className="text-[11px] text-[#54504A] font-medium mt-1">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* App download pills */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-[#54504A] hidden lg:inline">
              Download Official App:
            </span>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Official App on Google Play Store"
              className="flex items-center gap-2 bg-[#E76F2E] text-white px-4 py-2 rounded-lg text-xs hover:bg-[#C65320] transition shadow-sm"
            >
              <span aria-hidden="true">🤖</span>
              <div className="text-left">
                <div className="text-[9px] text-[#FFF6E8]/80 leading-none font-semibold">GET IT ON</div>
                <div className="font-bold text-[11px] leading-none mt-0.5">Google Play</div>
              </div>
            </a>
            <a
              href="https://apple.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Official App on Apple App Store"
              className="flex items-center gap-2 bg-[#E76F2E] text-white px-4 py-2 rounded-lg text-xs hover:bg-[#C65320] transition shadow-sm"
            >
              <span aria-hidden="true">🍏</span>
              <div className="text-left">
                <div className="text-[9px] text-[#FFF6E8]/80 leading-none font-semibold">DOWNLOAD ON</div>
                <div className="font-bold text-[11px] leading-none mt-0.5">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </>
  )
}