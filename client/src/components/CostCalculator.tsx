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

  return (
    <section id="calculator" className="py-20 bg-white border-t border-slate-300">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.Calculator size={15} /> Interactive Estimator
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            House Construction Cost Estimator (2026)
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Plan your construction budget with realistic material and labor rate breakdowns for Indian residential plots.
          </p>
        </div>

        <div className="mt-12 max-w-5xl mx-auto rounded-3xl bg-[#F8FAFC] p-6 sm:p-10 shadow-xl border border-slate-300 grid grid-cols-1 lg:grid-cols-12 gap-8 text-slate-800">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Plot Area Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Icons.Grid size={14} className="text-slate-700" />
                  <span>Plot Ground Area</span>
                </label>
                <span className="text-sm font-bold text-slate-950 bg-slate-200 px-3 py-1 rounded-full border border-slate-300">
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
                className="w-full accent-slate-700 h-2.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                <span>500 sq.ft</span>
                <span>2,500 sq.ft</span>
                <span>5,000 sq.ft</span>
              </div>
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                <Icons.Layers size={14} className="text-slate-700" />
                <span>Construction Package & Finishes</span>
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuality('standard')}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    quality === 'standard'
                      ? 'border-slate-700 bg-white text-slate-900 font-bold shadow-md ring-2 ring-slate-500/20'
                      : 'border-slate-300 bg-white/60 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Standard</div>
                  <div className="text-[11px] font-semibold text-slate-900 mt-1">₹1,650/sqft</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuality('premium')}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    quality === 'premium'
                      ? 'border-slate-700 bg-white text-slate-900 font-bold shadow-md ring-2 ring-slate-500/20'
                      : 'border-slate-300 bg-white/60 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Premium</div>
                  <div className="text-[11px] font-semibold text-slate-900 mt-1">₹2,150/sqft</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuality('luxury')}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    quality === 'luxury'
                      ? 'border-slate-700 bg-white text-slate-900 font-bold shadow-md ring-2 ring-slate-500/20'
                      : 'border-slate-300 bg-white/60 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">Luxury</div>
                  <div className="text-[11px] font-semibold text-slate-900 mt-1">₹2,850/sqft</div>
                </button>
              </div>
            </div>

            {/* Floors */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2.5 flex items-center gap-1.5">
                <Icons.Building size={14} className="text-slate-700" />
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
                    className={`py-2.5 px-1 rounded-xl border text-xs text-center transition ${
                      floors === fl.val
                        ? 'border-slate-700 bg-blue-600 text-white font-bold shadow'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400'
                    }`}
                  >
                    {fl.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 rounded-2xl bg-white p-6 sm:p-7 border border-slate-300 shadow-sm flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Icons.Tag size={13} className="text-slate-700" />
                <span>Estimated Turnkey Project Cost</span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  ₹{(totalCost / 100000).toFixed(2)} Lakhs
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  (~₹{totalCost.toLocaleString('en-IN')})
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Total constructed area: <span className="font-bold text-slate-800">{totalBuiltup.toLocaleString('en-IN')} sq.ft</span>
              </p>

              {/* Progress bars / breakdown */}
              <div className="mt-6 space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Icons.HardHat size={13} className="text-slate-900" /> Civil Structure (Cement, Steel, Bricks)
                    </span>
                    <span>₹{(civilCost / 100000).toFixed(2)} L (52%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '52%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Icons.Home size={13} className="text-slate-500" /> Finishing (Tiles, Paint, Windows)
                    </span>
                    <span>₹{(finishingCost / 100000).toFixed(2)} L (28%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-slate-500 h-2 rounded-full" style={{ width: '28%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Icons.Sun size={13} className="text-amber-500" /> MEP (Electrical & Plumbing)
                    </span>
                    <span>₹{(mepCost / 100000).toFixed(2)} L (12%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: '12%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Icons.Blueprint size={13} className="text-blue-500" /> Architecture, CAD & Approvals
                    </span>
                    <span>₹{(designPermitCost / 100000).toFixed(2)} L (8%)</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '8%' }} />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onOpenConsult(
                  `Cost Estimate Query: ${area} sq.ft, ${quality.toUpperCase()} grade, ${floors} Floor(s), Est. ₹${(totalCost / 100000).toFixed(2)} Lakhs`
                )
              }
              className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-center text-sm font-bold text-white shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
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
