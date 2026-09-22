import { contractorTrades } from '../lib/data'
import { Icons } from './Icons'

const tradeIcons: Record<string, React.ReactNode> = {
  hardhat: <Icons.HardHat size={20} className="text-slate-900" />,
  building: <Icons.Building size={20} className="text-slate-900" />,
  shieldcheck: <Icons.ShieldCheck size={20} className="text-slate-900" />,
  grid: <Icons.Grid size={20} className="text-slate-900" />,
  calculator: <Icons.Calculator size={20} className="text-slate-900" />,
  compass: <Icons.Compass size={20} className="text-slate-900" />,
  sun: <Icons.Sun size={20} className="text-slate-900" />,
  sofa: <Icons.Sofa size={20} className="text-slate-900" />,
  home: <Icons.Home size={20} className="text-slate-900" />,
  layers: <Icons.Layers size={20} className="text-slate-900" />,
}

export default function ContractorGrid() {
  return (
    <section id="contractors" className="py-20 bg-[#F1F5F9] border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.HardHat size={14} /> Verified Contractor Network
            </span>
            <h2 className="section-title mt-2 text-slate-900">
              Skilled workers & trade contractors, vetted by NIVAAS
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Over 80 partner offices and 2,500+ verified tradesmen ready to execute your drawings — from foundation to finishing.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:bg-blue-600 hover:text-white hover:border-slate-700 transition"
          >
            <Icons.Briefcase size={15} />
            <span>Hire a Contractor</span>
          </a>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {contractorTrades.map((trade) => (
            <div
              key={trade.title}
              className="flex flex-col rounded-2xl border border-slate-300 bg-white p-4 sm:p-5 transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-500 group"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 border border-slate-300 group-hover:bg-slate-900 group-hover:border-slate-900 transition-colors">
                <div className="group-hover:[&>*]:text-white [&>*]:transition-colors">
                  {tradeIcons[trade.icon]}
                </div>
              </div>
              <h3 className="mt-3 font-display text-sm font-bold text-slate-900 leading-snug">{trade.title}</h3>
              <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">{trade.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}