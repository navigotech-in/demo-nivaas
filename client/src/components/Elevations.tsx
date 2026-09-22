import { elevations } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface ElevationsProps {
  onOpenConsult: (style?: string) => void
}

export default function Elevations({ onOpenConsult }: ElevationsProps) {
  return (
    <section id="elevations" className="py-20 bg-white border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Home size={14} /> Front Facades & Elevations
            </span>
            <h2 className="section-title mt-2 text-slate-900">
              Indian Home 3D Front Elevations & Facades
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Photorealistic 4K 3D elevation renderings designed for Indian climates — featuring HPL wooden louvers, CNC jali screens, Kerala clay tile roofs, Dholpur sandstone, glass balconies, and warm LED profile lighting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult('Custom 3D Elevation')}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-700 text-white hover:bg-[#0EA5E9] transition shadow-md active:scale-[0.98]"
          >
            <Icons.Sparkles size={15} />
            <span>Get Custom 3D Elevation →</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {elevations.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col overflow-hidden rounded-3xl border border-slate-300/80 bg-slate-50 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-500"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                <Img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-3.5 left-3.5 rounded-full bg-[#0EA5E9]/85 backdrop-blur px-3 py-1 text-[11px] font-bold text-white shadow-md flex items-center gap-1">
                  <Icons.Sparkles size={11} className="text-amber-400" />
                  <span>{item.badge}</span>
                </span>
              </div>

              <div className="p-5 flex flex-1 flex-col justify-between bg-white">
                <div>
                  <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-slate-900 transition">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Elevation Style: ${item.title}`)}
                    className="w-full rounded-xl bg-slate-100 border border-slate-300 py-2.5 text-center text-xs font-bold text-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-700 transition shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Icons.Eye size={14} />
                    <span>View 3D Designs</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}