import { useState } from 'react'
import Img from './Img'
import { Icons } from './Icons'

const HERO_BG =
  'https://images.pexels.com/photos/34968154/pexels-photo-34968154.jpeg?auto=compress&cs=tinysrgb&w=2000&h=1200&fit=crop'

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

type TabKey = '2d' | '3d' | 'structural' | 'presentation' | 'more'

export default function Hero({ onCalculate }: HeroProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('2d')
  const [depth, setDepth] = useState<number | ''>(30)
  const [width, setWidth] = useState<number | ''>(50)
  const [floors, setFloors] = useState<number>(2)
  const [builtUpArea, setBuiltUpArea] = useState<number | ''>(2100)
  const [direction, setDirection] = useState<string>('East Facing')

  const handleDimensionChange = (newDepth: number | '', newWidth: number | '', newFloors: number) => {
    setDepth(newDepth)
    setWidth(newWidth)
    setFloors(newFloors)
    if (typeof newDepth === 'number' && typeof newWidth === 'number' && newDepth > 0 && newWidth > 0) {
      setBuiltUpArea(Math.round(newDepth * newWidth * (newFloors || 1) * 0.75))
    }
  }

  const getServiceTitle = () => {
    switch (activeTab) {
      case '2d':
        return '2D Layout Plan'
      case '3d':
        return '3D Front Elevation'
      case 'structural':
        return 'Structural Drawings'
      case 'presentation':
        return 'Presentation Plan'
      default:
        return 'Complete Architectural Package'
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCalculate({
      serviceType: getServiceTitle(),
      depth: Number(depth) || 30,
      width: Number(width) || 50,
      floors: floors || 1,
      builtUpArea: Number(builtUpArea) || 1500,
      direction,
    })
  }

  return (
    <section id="top" className="relative bg-base">
      {/* Hero Image & Overlay */}
      <div className="relative min-h-[600px] lg:min-h-[660px] overflow-hidden">
        <Img
          src={HERO_BG}
          alt="Modern Indian residential home design with warm ambient lighting"
          className="h-[640px] lg:h-[700px] w-full object-cover"
          loading="eager"
        />
        {/* Cool Slate Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/65 to-[#0F172A]/35" />

        {/* Hero Central Content */}
        <div className="container-content absolute inset-0 flex flex-col justify-center py-10 sm:py-12">
          {/* Hindi / English Headline */}
          <div className="text-center text-white mb-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-500/20 border border-slate-400/30 px-4 py-1.5 text-xs font-bold text-slate-300 uppercase tracking-widest backdrop-blur-md mb-3 shadow-sm">
              <Icons.Sparkles size={14} className="text-amber-300" />
              <span>India's #1 Architectural & Home Planning Network</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-tight">
              House Plans & Home Designs For Every Indian Plot
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Explore 12,000+ curated 2D floor plans, photorealistic 3D elevations, and complete structural CAD engineering blueprints tailored for Indian bylaws.
            </p>
          </div>

          {/* Interactive Calculator Widget (Glass: house image visible behind) */}
          <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white/60 backdrop-blur-xl p-4 sm:p-7 shadow-2xl border border-white/40 text-slate-800">
            {/* Service Selection Tabs */}
            <div className="flex items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-3.5 border-b border-slate-200 scrollbar-none text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('2d')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 ${
                  activeTab === '2d'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icons.Blueprint size={16} />
                <span>2D Layout Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('3d')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 ${
                  activeTab === '3d'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icons.Home size={16} />
                <span>3D Front Elevation</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('structural')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'structural'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icons.HardHat size={16} />
                <span>Structural Drawings</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('presentation')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'presentation'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icons.FileText size={16} />
                <span>Presentation Plan</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('more')}
                className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 ${
                  activeTab === 'more'
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icons.Layers size={16} />
                <span>More Services</span>
              </button>
            </div>

            {/* Tab Form Content */}
            {activeTab !== 'more' ? (
              <>
              <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
                {/* Depth */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <Icons.Ruler size={13} className="text-slate-700" />
                    <span>Plot Depth (ft)</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={depth}
                    onChange={(e) =>
                      handleDimensionChange(
                        e.target.value === '' ? '' : Number(e.target.value),
                        width,
                        floors
                      )
                    }
                    placeholder="e.g. 30"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:bg-white transition"
                    required
                  />
                </div>

                {/* Width */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <Icons.Ruler size={13} className="text-slate-700" />
                    <span>Plot Width (ft)</span>
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    value={width}
                    onChange={(e) =>
                      handleDimensionChange(
                        depth,
                        e.target.value === '' ? '' : Number(e.target.value),
                        floors
                      )
                    }
                    placeholder="e.g. 50"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:bg-white transition"
                    required
                  />
                </div>

                {/* Floors */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <Icons.Building size={13} className="text-slate-700" />
                    <span>Floors</span>
                  </label>
                  <select
                    value={floors}
                    onChange={(e) =>
                      handleDimensionChange(depth, width, Number(e.target.value))
                    }
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:bg-white transition"
                  >
                    <option value={1}>G (Single Floor)</option>
                    <option value={2}>G+1 (Duplex)</option>
                    <option value={3}>G+2 (Triple)</option>
                    <option value={4}>G+3 (Multi-Storey)</option>
                    <option value={5}>G+4 (Apartment)</option>
                  </select>
                </div>

                {/* Built-up Area */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <Icons.Grid size={13} className="text-slate-700" />
                    <span>Est. Area (sq.ft)</span>
                  </label>
                  <input
                    type="number"
                    value={builtUpArea}
                    onChange={(e) =>
                      setBuiltUpArea(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Area"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:bg-white transition"
                  />
                </div>

                {/* Direction */}
                <div>
                  <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    <Icons.Compass size={13} className="text-slate-700" />
                    <span>Vastu Facing</span>
                  </label>
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-700 focus:bg-white transition"
                  >
                    <option value="East Facing">East (Purva)</option>
                    <option value="North Facing">North (Uttar)</option>
                    <option value="West Facing">West (Pashchim)</option>
                    <option value="South Facing">South (Dakshin)</option>
                    <option value="North-East Facing">North-East (Ishan)</option>
                    <option value="South-East Facing">South-East (Agneya)</option>
                  </select>
                </div>

                {/* Submit Action */}
                <div className="col-span-2 sm:col-span-1 lg:col-span-1">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-slate-700 py-2.5 px-4 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-[#0EA5E9] transition active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Icons.Calculator size={16} />
                    <span>Calculate Price</span>
                  </button>
                </div>
              </form>

              {/* Popular Indian Plot Dimensions Chips */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
                <span className="font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <Icons.Ruler size={11} className="text-slate-700" />
                  <span>Popular Plots:</span>
                </span>
                {[
                  { label: '30x50 ft (167 Sq.Yd)', d: 50, w: 30, f: 2 },
                  { label: '20x40 ft (88 Sq.Yd)', d: 40, w: 20, f: 2 },
                  { label: '40x60 ft (266 Sq.Yd)', d: 60, w: 40, f: 2 },
                  { label: '25x50 ft (138 Sq.Yd)', d: 50, w: 25, f: 2 },
                  { label: '50x80 ft (444 Sq.Yd)', d: 80, w: 50, f: 2 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleDimensionChange(chip.d, chip.w, chip.f)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 font-semibold transition shrink-0"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
              </>
            ) : (
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <a
                  href="#services"
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-500 hover:bg-slate-100/50 transition text-center group"
                >
                  <div className="flex justify-center mb-1 text-slate-900">
                    <Icons.HardHat size={28} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    Site Supervision
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Quality checks by senior site engineers</div>
                </a>
                <a
                  href="#contact"
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-500 hover:bg-slate-100/50 transition text-center group"
                >
                  <div className="flex justify-center mb-1 text-slate-900">
                    <Icons.Compass size={28} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    Vastu Consultancy
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">100% Vastu verification for your plot</div>
                </a>
                <a
                  href="#calculator"
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-500 hover:bg-slate-100/50 transition text-center group"
                >
                  <div className="flex justify-center mb-1 text-slate-900">
                    <Icons.Calculator size={28} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    Cost Estimator
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Instant construction material budget</div>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* App Store & Stats Ribbon (Modern Grey Theme) */}
      <div className="border-b border-slate-300 bg-[#E2E8F0] py-6 shadow-inner">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full md:w-auto">
            {stats.map((s) => {
              const StatIcon = s.icon
              return (
                <div key={s.label} className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl border border-slate-300/80 shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-900">
                    <StatIcon size={20} />
                  </div>
                  <div>
                    <div className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-none">
                      {s.value}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium mt-1">{s.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* App download pills */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-bold text-slate-700 hidden lg:inline">
              Download NIVAAS App:
            </span>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0EA5E9] text-white px-4 py-2 rounded-xl text-xs hover:bg-[#0369A1] transition shadow-md"
            >
              <span>🤖</span>
              <div className="text-left">
                <div className="text-[9px] text-slate-400 leading-none font-semibold">GET IT ON</div>
                <div className="font-bold text-[11px] leading-none mt-0.5">Google Play</div>
              </div>
            </a>
            <a
              href="https://apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0EA5E9] text-white px-4 py-2 rounded-xl text-xs hover:bg-[#0369A1] transition shadow-md"
            >
              <span>🍏</span>
              <div className="text-left">
                <div className="text-[9px] text-slate-400 leading-none font-semibold">DOWNLOAD ON</div>
                <div className="font-bold text-[11px] leading-none mt-0.5">App Store</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}