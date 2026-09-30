import { oneStopServices } from '../lib/data'
import { Icons } from './Icons'

interface OneStopProps {
  onOpenConsult: (serviceTitle?: string) => void
}

const serviceIcons: Record<string, React.ReactNode> = {
  briefcase: <Icons.Briefcase size={26} className="text-[#E76F2E]" />,
  building: <Icons.Building size={26} className="text-[#E76F2E]" />,
  hardhat: <Icons.HardHat size={26} className="text-[#E76F2E]" />,
  calculator: <Icons.Calculator size={26} className="text-[#E76F2E]" />,
}

export default function OneStop({ onOpenConsult }: OneStopProps) {
  return (
    <section className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.Sparkles size={14} /> One-Stop Destination
          </span>
          <h2 className="section-title mt-2">
            Everything you need to build, finance & supervise
          </h2>
          <p className="mt-2 text-sm text-[#54504A]">
            NIVAAS is more than a plan store — we connect you to trusted builders, contractors and lenders to take the project to completion.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {oneStopServices.map((svc) => (
            <div
              key={svc.id}
              className="flex flex-col justify-between rounded-lg border border-[#E7E0D7] bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-[#E7E0D7] group"
            >
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FFF6E8] border border-[#E7E0D7]">
                  {serviceIcons[svc.icon]}
                </div>
                <h3 className="mt-4 font-display text-lg font-bold text-[#292826]">{svc.title}</h3>
                <p className="mt-2 text-xs text-[#54504A] leading-relaxed">{svc.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenConsult(svc.title)}
                className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-[#E7E0D7] bg-[#F1ECE5] px-4 py-2 text-[11px] font-bold text-[#E76F2E] hover:bg-[#C65320] hover:text-white hover:border-[#C65320] transition self-start"
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