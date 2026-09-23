import { useState } from 'react'
import { Icons } from './Icons'

interface CostCalculatorProps {
  onOpenConsult: (details?: string) => void
}

export default function CostCalculator({ onOpenConsult }: CostCalculatorProps) {
  const [area, setArea] = useState<number>(1800)
  const [quality, setQuality] = useState<'standard' | 'premium' | 'luxury'>('premium')
  const [floors, setFloors] = useState<number>(2)

  const rates = {
    standard: 1650,
    premium: 2150,
    luxury: 2850,
  }

  const ratePerSqft = rates[quality]
  const totalBuiltup = area * (floors === 1 ? 1 : floors === 2 ? 1.85 : floors === 3 ? 2.7 : 3.5)
  const totalCost = Math.round(totalBuiltup * ratePerSqft)

  const civilCost = Math.round(totalCost * 0.52)
  const finishingCost = Math.round(totalCost * 0.28)
  const mepCost = Math.round(totalCost * 0.12)
  const designPermitCost = Math.round(totalCost * 0.08)

  const qualityOptions = [
    { id: 'standard', label: 'Standard', price: '₹1,650' },
    { id: 'premium', label: 'Premium', price: '₹2,150' },
    { id: 'luxury', label: 'Luxury', price: '₹2,850' },
  ] as const

  const breakdown = [
    { label: 'Civil Structure (Cement, Steel, Bricks)', value: civilCost, pct: 52, icon: <Icons.HardHat size={13} className="text-[#E76F2E]" /> },
    { label: 'Finishing (Tiles, Paint, Windows)', value: finishingCost, pct: 28, icon: <Icons.Home size={13} className="text-[#E76F2E]" /> },
    { label: 'MEP (Electrical & Plumbing)', value: mepCost, pct: 12, icon: <Icons.Sun size={13} className="text-[#E76F2E]" /> },
    { label: 'Architecture, CAD & Approvals', value: designPermitCost, pct: 8, icon: <Icons.Blueprint size={13} className="text-[#E76F2E]" /> },
  ]

  return (
    <section id="calculator" className="py-20 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.Calculator size={15} /> Interactive Estimator
          </span>
          <h2 className="section-title mt-2">
            House Construction Cost Estimator (2026)
          </h2>
          <p className="mt-2 text-sm text-[#74706A]">
            Plan your construction budget with realistic material and labor rate breakdowns for Indian residential plots.
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
          {/* Controls Column */}
          <div className="space-y-8">
            {/* Plot Area Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#74706A] flex items-center gap-1.5">
                  <Icons.Grid size={14} className="text-[#74706A]" />
                  <span>Plot Ground Area</span>
                </label>
                <span className="text-sm font-bold text-[#292826]">
                  {area} sq.ft (~{(area / 9).toFixed(0)} sq.yards)
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={5000}
                step={50}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full accent-[#E76F2E] h-2.5 bg-[#E7E0D7] rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#74706A] mt-1.5 font-medium">
                <span>500 sq.ft</span>
                <span>2,500 sq.ft</span>
                <span>5,000 sq.ft</span>
              </div>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#74706A] mb-2.5 flex items-center gap-1.5">
                <Icons.Layers size={14} className="text-[#74706A]" />
                <span>Construction Package & Finishes</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {qualityOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setQuality(opt.id)}
                    className={`py-3 px-2 rounded-lg border text-center transition text-xs font-bold ${
                      quality === opt.id
                        ? 'border-[#E76F2E] bg-[#E76F2E] text-white'
                        : 'border-[#E7E0D7] bg-white text-[#74706A] hover:border-[#C65320]'
                    }`}
                  >
                    {opt.label}
                    <span className={`block mt-0.5 text-[11px] font-semibold ${quality === opt.id ? 'text-white/80' : 'text-[#292826]'}`}>
                      {opt.price}/sqft
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Floors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#74706A] mb-2.5 flex items-center gap-1.5">
                <Icons.Building size={14} className="text-[#74706A]" />
                <span>Number of Floors</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Ground', val: 1 },
                  { label: 'G + 1', val: 2 },
                  { label: 'G + 2', val: 3 },
                  { label: 'G + 3', val: 4 },
                ].map((fl) => (
                  <button
                    key={fl.val}
                    type="button"
                    onClick={() => setFloors(fl.val)}
                    className={`py-2.5 px-1 rounded-lg border text-xs text-center transition font-bold ${
                      floors === fl.val
                        ? 'border-[#E76F2E] bg-[#E76F2E] text-white'
                        : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#C65320]'
                    }`}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:border-l lg:border-[#EEE9E3] lg:pl-12 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-[#74706A] uppercase tracking-wider flex items-center gap-1.5">
                <Icons.Tag size={13} className="text-[#74706A]" />
                <span>Estimated Turnkey Project Cost</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-[#292826]">
                  ₹{(totalCost / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-xs text-[#74706A] font-semibold">
                  (~₹{totalCost.toLocaleString('en-IN')})
                </span>
              </div>
              <p className="mt-1 text-xs text-[#74706A]">
                Total constructed area: <span className="font-bold text-[#292826]">{totalBuiltup.toLocaleString('en-IN')} sq.ft</span>
              </p>

              {/* Progress bars / breakdown */}
              <div className="mt-6 space-y-3.5">
                {breakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold text-[#292826] mb-1">
                      <span className="flex items-center gap-1.5">
                        {item.icon} {item.label}
                      </span>
                      <span>₹{(item.value / 100000).toFixed(2)} L ({item.pct}%)</span>
                    </div>
                    <div className="w-full bg-[#F1ECE5] rounded-full h-2 overflow-hidden">
                      <div className="bg-[#E76F2E] h-2 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenConsult(
                  `Cost Estimate Query: ${area} sq.ft, ${quality.toUpperCase()} grade, ${floors} Floor(s), Est. ₹${(totalCost / 100000).toFixed(2)} Lakhs`
                )
              }
              className="mt-6 w-full rounded-lg bg-[#E76F2E] py-3 text-center text-sm font-bold text-white shadow-sm hover:bg-[#C65320] transition flex items-center justify-center gap-2"
            >
              <Icons.FileText size={16} />
              <span>Get Free Detailed BOQ & Material List →</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}