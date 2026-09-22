import { processSteps } from '../lib/data'
import { Icons } from './Icons'

interface HowItWorksProps {
  onOpenConsult: (serviceTitle?: string) => void
}

const stepIcons: Record<string, React.ReactNode> = {
  blueprint: <Icons.Blueprint size={24} className="text-slate-900" />,
  layers: <Icons.Layers size={24} className="text-slate-900" />,
  hardhat: <Icons.HardHat size={24} className="text-slate-900" />,
}

export default function HowItWorks({ onOpenConsult }: HowItWorksProps) {
  return (
    <section className="py-20 bg-white border-t border-slate-300">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.TrendUp size={14} /> How NIVAAS Works
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            From empty plot to finished home in 3 steps
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            A structured, milestone-driven process that removes guesswork, rework and budget surprises from house construction.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {processSteps.map((step, i) => (
            <div key={step.step} className="relative flex flex-col rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-card transition-all hover:shadow-card-hover hover:border-slate-500">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 border border-slate-300">
                  {stepIcons[step.icon]}
                </div>
                <span className="font-display text-3xl font-extrabold text-slate-200">{step.step}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <Icons.Check size={14} className="text-blue-600" />
                <h3 className="font-display text-lg font-bold text-slate-900">{step.title}</h3>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed flex-1">
                {step.text}
              </p>
              <div className="mt-5 pt-4 border-t border-slate-200">
                <a
                  href={i === 0 ? '#calculator' : i === 1 ? '#plans' : '#contact'}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
                >
                  <span>{step.cta}</span>
                  <Icons.ChevronRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border border-slate-300 bg-[#F8FAFC] p-6 sm:p-8">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-300">
              <Icons.Phone size={18} className="text-slate-900" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Prefer to talk?</p>
              <p className="font-display text-sm font-bold text-slate-900">Get a free expert consultation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult('Free Expert Consultation')}
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-blue-600 hover:text-white hover:border-slate-700 transition"
          >
            <Icons.Sparkles size={15} />
            <span>Consult Online Now →</span>
          </button>
        </div>
      </div>
    </section>
  )
}