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
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
          >
            <Icons.Sparkles size={15} />
            <span>Get 3D Interior Quotation →</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {interiorCategories.map((item, idx) => (
            <div key={idx} className="group flex flex-col overflow-hidden rounded-2xl bg-white transition-transform hover:-translate-y-0.5">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                <Img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
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

                <div className="mt-5 pt-3.5 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    From ₹599 / sq.ft
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Interior Category: ${item.title}`)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition group/link"
                  >
                    <span>Explore {item.title}</span>
                    <Icons.ChevronRight size={14} className="transition group-hover/link:translate-x-0.5" />
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