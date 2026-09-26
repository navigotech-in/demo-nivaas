import { serviceCards } from '../lib/data'
import { Icons } from './Icons'

interface ServicesProps {
  onOpenConsult: (serviceTitle?: string) => void
}

export default function Services({ onOpenConsult }: ServicesProps) {
  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pmc':
        return <Icons.HardHat size={20} className="text-[#E76F2E]" />
      case 'arch-consult':
        return <Icons.Compass size={20} className="text-[#E76F2E]" />
      case 'site-supervision':
        return <Icons.ShieldCheck size={20} className="text-[#E76F2E]" />
      case 'vastu-camp':
        return <Icons.Sun size={20} className="text-[#E76F2E]" />
      case 'interior-design':
        return <Icons.Sofa size={20} className="text-[#E76F2E]" />
      default:
        return <Icons.Blueprint size={20} className="text-[#E76F2E]" />
    }
  }

  return (
    <section id="services" className="py-[68px] bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.ShieldCheck size={14} /> End-to-End Solutions
            </span>
            <h2 className="section-title mt-2">
              Architectural & Construction Services
            </h2>
            <p className="mt-2 text-sm text-[#74706A] max-w-2xl">
              From the initial 2D layout to licensed structural stability certification and on-site engineering supervision.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult()}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-sm"
          >
            <Icons.Sparkles size={15} />
            <span>Request Custom Package →</span>
          </button>
        </div>

        <div className="mt-[34px] max-w-[1360px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[17px]">
          {serviceCards.map((srv) => (
            <div
              key={srv.id}
              className="flex flex-col justify-between rounded-lg border border-[#E7E0D7]/80 bg-white p-[15px] sm:p-[18px] shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-[#E7E0D7] group"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex h-[34px] w-[34px] items-center justify-center rounded-lg bg-[#FFF6E8] border border-[#E7E0D7]">
                    {getServiceIcon(srv.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E76F2E] bg-[#F1ECE5] px-[10px] py-[2px] rounded-lg flex items-center gap-1">
                    <Icons.Check size={12} className="text-[#E76F2E]" />
                    <span>{srv.badge}</span>
                  </span>
                </div>

                <h3 className="mt-[9px] font-display text-xl font-bold leading-tight text-[#292826] group-hover:text-[#292826] transition">
                  {srv.title}
                </h3>
                <p className="text-xs font-semibold text-[#E76F2E] mt-0.5">{srv.tagline}</p>

                <p className="mt-[7px] text-xs text-[#74706A] leading-[17px]">
                  {srv.desc}
                </p>

                <div className="mt-[13px] pt-[11px] border-t border-[#EEE9E3]">
                  <div className="text-[11px] font-bold uppercase text-[#74706A] tracking-wider mb-[6px] flex items-center gap-1">
                    <Icons.Layers size={13} />
                    <span>Key Deliverables:</span>
                  </div>
                  <ul className="space-y-[5px] text-xs leading-[14px] text-[#74706A]">
                    {srv.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Icons.Check size={13} className="text-[#E76F2E] shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-[15px] pt-[11px] border-t border-[#EEE9E3]">
                <button
                  type="button"
                  onClick={() => onOpenConsult(srv.title)}
                  className="w-full rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] py-[6px] text-xs font-bold text-[#292826] hover:bg-[#C65320] hover:text-white hover:border-[#292826] transition shadow-sm flex items-center justify-center gap-2"
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