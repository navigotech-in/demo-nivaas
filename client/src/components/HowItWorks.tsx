import { processSteps } from '../lib/data'
import { Icons } from './Icons'

interface HowItWorksProps {
  onOpenConsult: (serviceTitle?: string) => void
}

const stepIcons: Record<string, React.ReactNode> = {
  blueprint: <Icons.Blueprint size={24} className="text-[#E76F2E]" />,
  layers: <Icons.Layers size={24} className="text-[#E76F2E]" />,
  hardhat: <Icons.HardHat size={24} className="text-[#E76F2E]" />,
}

export default function HowItWorks({ onOpenConsult }: HowItWorksProps) {
  return (
    <section className="py-20 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.TrendUp size={14} /> How Indore House Makers Works
          </span>
          <h2 className="section-title mt-2">
            From empty plot to finished home in 3 steps
          </h2>
          <p className="mt-2 text-sm text-[#54504A]">
            A structured, milestone-driven process that removes guesswork, rework and budget surprises from house construction.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {processSteps.map((step, i) => (
            <div key={step.step} className="relative flex flex-col rounded-lg border border-[#E7E0D7]/80 bg-white p-6 sm:p-8 shadow-card transition-all hover:shadow-card-hover hover:border-[#E7E0D7]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF6E8] border border-[#E7E0D7]">
                  {stepIcons[step.icon]}
                </div>
                <span className="font-display text-3xl font-extrabold text-[#E76F2E]">{step.step}</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <Icons.Check size={14} className="text-[#E76F2E]" />
                <h3 className="font-display text-lg font-bold text-[#292826]">{step.title}</h3>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-[#54504A] leading-relaxed flex-1">
                {step.text}
              </p>
              <div className="mt-5 pt-4 border-t border-[#EEE9E3]">
                <a
                  href={i === 0 ? '#calculator' : i === 1 ? '#plans' : '#contact'}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#E76F2E] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#C65320] transition"
                >
                  <span>{step.cta}</span>
                  <Icons.ChevronRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] p-6 sm:p-8">
          <div className="flex items-center gap-3 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white border border-[#E7E0D7]">
              <Icons.Phone size={18} className="text-[#E76F2E]" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#54504A]">Prefer to talk?</p>
              <p className="font-display text-sm font-bold text-[#E76F2E]">Get a free expert consultation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult('Free Expert Consultation')}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#E7E0D7] bg-white px-5 py-2.5 text-xs font-bold text-[#E76F2E] shadow-sm hover:bg-[#C65320] hover:text-white hover:border-[#C65320] transition"
          >
            <Icons.Sparkles size={15} />
            <span>Consult Online Now →</span>
          </button>
        </div>
      </div>
    </section>
  )
}