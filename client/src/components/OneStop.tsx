import { oneStopServices } from '../lib/data'
import { Icons } from './Icons'

interface OneStopProps {
  onOpenConsult: (serviceTitle?: string) => void
}

const serviceIcons: Record<string, React.ReactNode> = {
  briefcase: <Icons.Briefcase size={26} className="text-slate-900" />,
  building: <Icons.Building size={26} className="text-slate-900" />,
  hardhat: <Icons.HardHat size={26} className="text-slate-900" />,
  calculator: <Icons.Calculator size={26} className="text-slate-900" />,
}

export default function OneStop({ onOpenConsult }: OneStopProps) {
  return (
    <section className="py-20 bg-[#E2E8F0] border-t border-slate-300">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.Sparkles size={14} /> One-Stop Destination
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            Everything you need to build, finance & supervise
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            NIVAAS is more than a plan store — we connect you to trusted builders, contractors and lenders to take the project to completion.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {oneStopServices.map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-300 bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-500 group"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-300">
                  {serviceIcons[svc.icon]}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-slate-900">{svc.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{svc.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenConsult(svc.title)}
                className="mt-5 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-bold text-slate-900 hover:bg-blue-600 hover:text-white hover:border-slate-700 transition self-start"
              >
                <span>{svc.cta}</span>
                <Icons.ChevronRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}