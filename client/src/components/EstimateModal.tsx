import { Icons } from './Icons'

interface EstimateModalProps {
  isOpen: boolean
  onClose: () => void
  onBookConsult: (details: string) => void
  data: {
    serviceType: string
    depth: number
    width: number
    floors: number
    builtUpArea: number
    direction: string
  }
}

export default function EstimateModal({
  isOpen,
  onClose,
  onBookConsult,
  data,
}: EstimateModalProps) {
  if (!isOpen) return null

  const area = data.builtUpArea || data.depth * data.width * data.floors || 1500
  const plotSize = `${data.depth || 30} x ${data.width || 50} ft`

  let planPrice = 3999
  let elevationPrice = 4999
  let structuralPrice = 6999
  let totalEstimate = 8999

  if (data.serviceType === '2D Layout Plan') {
    planPrice = Math.max(2999, Math.round(area * 2.2))
    totalEstimate = planPrice
  } else if (data.serviceType === '3D Front Elevation') {
    elevationPrice = Math.max(3999, Math.round(area * 2.8))
    totalEstimate = elevationPrice
  } else if (data.serviceType === 'Structural Drawings') {
    structuralPrice = Math.max(4999, Math.round(area * 3.5))
    totalEstimate = structuralPrice
  } else {
    planPrice = Math.round(area * 2.0)
    elevationPrice = Math.round(area * 2.5)
    structuralPrice = Math.round(area * 3.0)
    totalEstimate = Math.round(area * 5.8)
  }

  const approxConstructionCost = area * 1850

  const handleConsult = () => {
    const details = `${data.serviceType} for ${plotSize} (${area} sq.ft), ${data.floors} Floor(s), Facing: ${data.direction}`
    onClose()
    onBookConsult(details)
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-300 animate-fadeIn text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-6 py-4">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-950 bg-slate-200 px-2.5 py-0.5 rounded-md">
              <Icons.Calculator size={12} /> Instant Architectural Estimate
            </span>
            <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
              {data.serviceType} Package Breakdown
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            <Icons.Close size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Summary badges */}
          <div className="grid grid-cols-3 gap-2.5 rounded-2xl bg-slate-50 p-3.5 text-center border border-slate-200">
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <Icons.Ruler size={11} /> Plot Size
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{plotSize}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <Icons.Grid size={11} /> Built-up Area
              </div>
              <div className="text-sm font-bold text-slate-950 mt-0.5">{area.toLocaleString('en-IN')} sq.ft</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 uppercase flex items-center justify-center gap-1">
                <Icons.Compass size={11} /> Direction
              </div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">{data.direction}</div>
            </div>
          </div>

          {/* Pricing cards */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Icons.Blueprint size={14} className="text-slate-900" /> Architectural Design Package
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Includes 2D Furniture Layout, Room Dimensions & Vastu Map</div>
              </div>
              <div className="text-sm font-bold text-slate-900">₹{planPrice.toLocaleString('en-IN')}</div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Icons.Home size={14} className="text-slate-900" /> 3D Ultra-Realistic Elevations
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">2 Concept renders + Material & Color specifications</div>
              </div>
              <div className="text-sm font-bold text-slate-900">₹{elevationPrice.toLocaleString('en-IN')}</div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Icons.HardHat size={14} className="text-slate-900" /> Structural & MEP Engineering
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Footing, Column CAD, Beam schedules, Plumbing & Electrical</div>
              </div>
              <div className="text-sm font-bold text-slate-900">₹{structuralPrice.toLocaleString('en-IN')}</div>
            </div>

            <div className="rounded-2xl bg-slate-100 p-4 border border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Icons.Sparkles size={14} className="text-amber-500" /> All-Inclusive Package Offer
                  </div>
                  <div className="text-xs text-slate-900">Special online discounted rate with 2 free revisions</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-slate-900">₹{totalEstimate.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-slate-900 line-through">₹{(totalEstimate * 1.4).toFixed(0)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Civil Construction reference */}
          <div className="rounded-2xl bg-slate-100 p-3.5 text-xs text-slate-600 border border-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Icons.HardHat size={14} className="text-slate-500" /> Estimated Turnkey Construction Budget:
            </span>
            <span className="font-bold text-slate-900">
              ₹{(approxConstructionCost / 100000).toFixed(2)} Lakhs (~₹1,850/sq.ft)
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleConsult}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-center text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition flex items-center justify-center gap-1.5"
            >
              <Icons.Phone size={14} />
              <span>Consult Architect for this Plan →</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Modify Dimensions
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
