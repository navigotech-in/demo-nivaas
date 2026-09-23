import { useState } from 'react'
import Img from './Img'
import { Icons } from './Icons'
import heroBg from '../assets/hero-bg.jpg'

const HERO_BG = heroBg

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
    <section id="top" className="relative bg-base">
      {/* Hero Image & Overlay */}
      <div className="relative min-h-[600px] lg:min-h-[660px] overflow-hidden">
        <Img
          src={HERO_BG}
          alt="Modern Indian residential building design with warm ambient lighting"
          className="aspect-[4/3] w-full object-cover sm:aspect-[16/9] -mt-[30px]"
          loading="eager"
        />
        {/* Restrained Warm Image Overlay (keeps headline readable, house colours stay clear) */}
        <div
          className="absolute inset-0"
          style={{
background:
                'linear-gradient(rgba(41, 40, 38, 0.25), rgba(41, 40, 38, 0.38))',
          }}
        />

        {/* Hero Central Content */}
        <div className="container-content absolute inset-0 flex flex-col justify-end pb-[136px] sm:pb-[144px] lg:pb-[155px]">
          {/* Hindi / English Headline */}
          <div className="text-center text-[#FDFCF9] mb-8 sm:mb-10 animate-fadeIn">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#FDFCF9] max-w-5xl mx-auto leading-tight">
              House Plans & Home Designs For Every Indian Plot
            </h1>
            <p className="mt-4 sm:mt-5 text-sm sm:text-base text-[rgba(253,252,249,0.88)] max-w-3xl mx-auto leading-relaxed">
              Explore 12,000+ curated 2D floor plans, photorealistic 3D elevations, and complete structural CAD engineering blueprints tailored for Indian bylaws.
            </p>
          </div>

          {/* Quick Estimate Strip (Glass: house image visible behind) */}
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto rounded-lg border border-white/15 bg-white/15 backdrop-blur-[4px] p-5 sm:p-7 text-[#292826]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E76F2E] text-white">
                  <Icons.Calculator size={18} />
                </div>
                <div>
                  <div className="font-display text-sm sm:text-base font-bold text-[#FDFCF9] leading-none">
                    Quick Construction Estimate
                  </div>
                  <div className="text-[11px] text-[#FDFCF9]/80 mt-1">Instant turnkey budget for your plot</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#FDFCF9]/80">Est. Turnkey Cost</div>
                <div className="font-display text-lg sm:text-xl font-extrabold text-[#FDFCF9] leading-tight">
                  ₹{(totalCost / 100000).toFixed(2)} Lakhs
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-end">
              {/* Ground Area */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#FDFCF9]/80 mb-2">
                  <Icons.Grid size={13} className="text-[#FDFCF9]/90" />
                  <span>Ground Area</span>
                  <span className="ml-auto text-[#FDFCF9] font-bold normal-case">{area} sq.ft</span>
                </label>
                <input
                  type="range"
                  min={500}
                  max={5000}
                  step={50}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                  className="w-full accent-[#E76F2E] h-2.5 bg-[#E7E0D7] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#FDFCF9]/80 mt-1.5 font-medium">
                  <span>500</span>
                  <span>2,500</span>
                  <span>5,000</span>
                </div>
              </div>

              {/* Build Quality */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#FDFCF9]/80 mb-2">
                  <Icons.Layers size={13} className="text-[#FDFCF9]/90" />
                  <span>Build Quality</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(rates) as QualityKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setQuality(key)}
                      className={`py-2.5 rounded-lg border text-[11px] font-bold text-center transition ${
                        quality === key
                          ? 'border-[#E76F2E] bg-[#E76F2E] text-white'
                          : 'border-[#E7E0D7] bg-white text-[#74706A] hover:border-[#E7E0D7]'
                      }`}
                    >
                      {key[0].toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floors */}
              <div>
                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#FDFCF9]/80 mb-2">
                  <Icons.Building size={13} className="text-[#FDFCF9]/90" />
                  <span>Floors</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: 'G', val: 1 },
                    { label: 'G+1', val: 2 },
                    { label: 'G+2', val: 3 },
                    { label: 'G+3', val: 4 },
                  ].map((fl) => (
                    <button
                      key={fl.val}
                      type="button"
                      onClick={() => setFloors(fl.val)}
                      className={`py-2.5 rounded-lg border text-[11px] font-bold text-center transition ${
                        floors === fl.val
                          ? 'border-[#E76F2E] bg-[#E76F2E] text-white'
                          : 'border-[#E7E0D7] bg-white text-[#74706A] hover:border-[#E7E0D7]'
                      }`}
                    >
                      {fl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/20">
              <p className="text-[11px] text-[#FDFCF9]/85 flex items-center gap-1.5">
                <Icons.HelpCircle size={12} className="text-[#FDFCF9]/90" />
                <span>
                  {totalBuiltup.toLocaleString('en-IN')} sq.ft built-up @ ₹{ratePerSqft.toLocaleString('en-IN')}/sq.ft
                </span>
              </p>
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#E76F2E] px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#C65320] transition active:scale-[0.98]"
              >
                <Icons.ChevronRight size={15} />
                <span>Send Me Detailed Estimate</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* App Store & Stats Ribbon (Modern Grey Theme) */}
      <div className="border-b border-[#E7E0D7] bg-[#FDFCF9] py-6 shadow-inner">
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
                    <div className="text-[11px] text-[#74706A] font-medium mt-1">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* App download pills */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-[#74706A] hidden lg:inline">
              Download NIVAAS App:
            </span>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#E76F2E] text-white px-4 py-2 rounded-lg text-xs hover:bg-[#C65320] transition shadow-sm"
            >
              <span>🤖</span>
              <div className="text-left">
                <div className="text-[9px] text-[#FFF6E8]/80 leading-none font-semibold">GET IT ON</div>
                <div className="font-bold text-[11px] leading-none mt-0.5">Google Play</div>
              </div>
            </a>
            <a
              href="https://apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#E76F2E] text-white px-4 py-2 rounded-lg text-xs hover:bg-[#C65320] transition shadow-sm"
            >
              <span>🍏</span>
              <div className="text-left">
                <div className="text-[9px] text-[#FFF6E8]/80 leading-none font-semibold">DOWNLOAD ON</div>
                <div className="font-bold text-[11px] leading-none mt-0.5">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}