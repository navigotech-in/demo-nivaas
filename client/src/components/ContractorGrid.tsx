import { contractorTrades } from '../lib/data'
import { Icons } from './Icons'

const tradeIcons: Record<string, React.ReactNode> = {
  hardhat: <Icons.HardHat size={20} className="text-[#E76F2E]" />,
  building: <Icons.Building size={20} className="text-[#E76F2E]" />,
  shieldcheck: <Icons.ShieldCheck size={20} className="text-[#E76F2E]" />,
  grid: <Icons.Grid size={20} className="text-[#E76F2E]" />,
  calculator: <Icons.Calculator size={20} className="text-[#E76F2E]" />,
  compass: <Icons.Compass size={20} className="text-[#E76F2E]" />,
  sun: <Icons.Sun size={20} className="text-[#E76F2E]" />,
  sofa: <Icons.Sofa size={20} className="text-[#E76F2E]" />,
  home: <Icons.Home size={20} className="text-[#E76F2E]" />,
  layers: <Icons.Layers size={20} className="text-[#E76F2E]" />,
}

export default function ContractorGrid() {
  return (
    <section id="contractors" className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.HardHat size={14} /> Verified Contractor Network
            </span>
            <h2 className="section-title mt-2">
              Skilled workers & trade contractors, vetted by NIVAAS
            </h2>
            <p className="mt-2 text-sm text-[#74706A]">
              Over 80 partner offices and 2,500+ verified tradesmen ready to execute your drawings — from foundation to finishing.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#E7E0D7] bg-white px-5 py-2.5 text-xs font-bold text-[#E76F2E] shadow-sm hover:bg-[#C65320] hover:text-white hover:border-[#C65320] transition"
          >
            <Icons.Briefcase size={15} />
            <span>Hire a Contractor</span>
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {contractorTrades.map((trade) => (
            <div
              key={trade.title}
              className="flex flex-col rounded-lg border border-[#E7E0D7] bg-white px-4 py-6 sm:px-5 sm:py-6 transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-[#E7E0D7] group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] group-hover:bg-[#292826] group-hover:border-[#C65320] transition-colors">
                <div className="group-hover:[&>*]:text-white [&>*]:transition-colors">
                  {tradeIcons[trade.icon]}
                </div>
              </div>
              <h3 className="mt-3 font-display text-sm font-bold text-[#292826] leading-snug">{trade.title}</h3>
              <p className="mt-1 text-[11px] text-[#74706A] leading-relaxed">{trade.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}