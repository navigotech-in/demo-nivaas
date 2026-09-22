import { interiorCategories } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface InteriorsProps {
  onOpenConsult: (room?: string) => void
}

export default function Interiors({ onOpenConsult }: InteriorsProps) {
  return (
    <section id="interiors" className="py-20 bg-white border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Sofa size={14} /> Space & Comfort
            </span>
            <h2 className="section-title mt-2 text-slate-900">
              Interior Design Ideas by Room
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Complete room-by-room modular kitchen designs, living room TV units, tranquil pooja corners, and wardrobe space planning.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult('Complete Interior 3D Design')}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-700 text-white hover:bg-[#0EA5E9] transition shadow-md"
          >
            <Icons.Sparkles size={15} />
            <span>Get 3D Interior Quotation →</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {interiorCategories.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:border-slate-400"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                <Img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
                  <span className="select-none -rotate-12 rounded-md border border-white/30 bg-white/15 px-3 py-1 font-display text-xl font-extrabold tracking-[0.25em] text-white/85 shadow-sm backdrop-blur-[1px]">
                    NIVAAS
                  </span>
                </div>
                <span className="absolute bottom-3.5 left-3.5 z-[2] rounded-md border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-800 backdrop-blur shadow-sm">
                  {item.items}
                </span>
              </div>

              <div className="p-5 sm:p-6 flex flex-1 flex-col justify-between bg-white">
                <div>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-slate-900 transition">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Interior Category: ${item.title}`)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-white hover:border-slate-500 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Explore {item.title}</span>
                    <Icons.ChevronRight size={14} />
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