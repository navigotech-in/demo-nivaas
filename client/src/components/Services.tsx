import { serviceCards } from '../lib/data'
import { Icons } from './Icons'

interface ServicesProps {
  onOpenConsult: (serviceTitle?: string) => void
}

export default function Services({ onOpenConsult }: ServicesProps) {
  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pmc':
        return <Icons.HardHat size={26} className="text-slate-900" />
      case 'arch-consult':
        return <Icons.Compass size={26} className="text-slate-900" />
      case 'site-supervision':
        return <Icons.ShieldCheck size={26} className="text-slate-900" />
      case 'vastu-camp':
        return <Icons.Sun size={26} className="text-amber-600" />
      case 'interior-design':
        return <Icons.Sofa size={26} className="text-slate-900" />
      default:
        return <Icons.Blueprint size={26} className="text-slate-900" />
    }
  }

  return (
    <section id="services" className="py-20 bg-[#F1F5F9] border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.ShieldCheck size={14} /> End-to-End Solutions
            </span>
            <h2 className="section-title mt-2 text-slate-900">
              Architectural & Construction Services
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              From the initial 2D layout to licensed structural stability certification and on-site engineering supervision.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult()}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-700 text-white hover:bg-[#0EA5E9] transition shadow-md"
          >
            <Icons.Sparkles size={15} />
            <span>Request Custom Package →</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-7 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-500 group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-300">
                    {getServiceIcon(srv.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-slate-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <Icons.Check size={12} className="text-slate-900" />
                    <span>{srv.badge}</span>
                  </span>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold text-slate-900 group-hover:text-slate-900 transition">
                  {srv.title}
                </h3>
                <p className="text-xs font-semibold text-slate-900 mt-0.5">{srv.tagline}</p>

                <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                  {srv.desc}
                </p>

                <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2.5 flex items-center gap-1">
                    <Icons.Layers size={13} />
                    <span>Key Deliverables:</span>
                  </div>
                  <ul className="space-y-2 text-xs text-slate-700">
                    {srv.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Icons.Check size={13} className="text-slate-700 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onOpenConsult(srv.title)}
                  className="w-full rounded-xl bg-slate-100 border border-slate-300 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-700 hover:text-white hover:border-slate-700 transition shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Enquire for {srv.title}</span>
                  <Icons.ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}