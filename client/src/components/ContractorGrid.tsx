import { contractorTrades } from '../lib/data'
import { Icons } from './Icons'
import Img from './Img'

interface ContractorGridProps {
  onOpenConsult?: (req?: string) => void
}

export default function ContractorGrid({ onOpenConsult }: ContractorGridProps) {
  const handleTradeClick = (tradeTitle: string) => {
    if (onOpenConsult) {
      onOpenConsult(`Hire Contractor: ${tradeTitle}`)
    } else {
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <section id="contractors" className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.HardHat size={14} /> Verified Contractor Network
            </span>
            <h2 className="section-title mt-2">
              Skilled workers &amp; trade contractors, vetted by NIVAAS
            </h2>
            <p className="mt-2 text-sm text-[#54504A]">
              Over 80 partner offices and 2,500+ verified tradesmen ready to execute your drawings — from foundation to finishing.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleTradeClick('General Contractor Inquiry')}
            className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-[#E7E0D7] bg-white px-5 py-2.5 text-xs font-bold text-[#E76F2E] shadow-sm hover:bg-[#C65320] hover:text-white hover:border-[#C65320] transition cursor-pointer"
          >
            <Icons.Briefcase size={15} />
            <span>Hire a Contractor</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {contractorTrades.map((trade) => (
            <article
              key={trade.title}
              onClick={() => handleTradeClick(trade.title)}
              className="group relative h-[240px] sm:h-[260px] overflow-hidden rounded-xl border border-[#E7E0D7] bg-[#292826] shadow-xs transition-all duration-300 hover:border-[#C94F36]/60 hover:shadow-card hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
            >
              {/* Full Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                <Img
                  src={trade.image || 'https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'}
                  alt={trade.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out saturate-[1.1] group-hover:scale-108"
                />
                {/* Transparent Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1F1E1C]/95 via-[#1F1E1C]/40 to-black/20 transition-colors group-hover:via-[#1F1E1C]/50" />
              </div>

              {/* Top Badge: Verified Trade */}
              <div className="relative z-10 p-3 sm:p-3.5 flex items-start justify-between">
                <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md bg-black/60 border border-white/20 text-white">
                  <Icons.HardHat size={11} className="text-[#C94F36]" />
                  Verified
                </span>
              </div>

              {/* Bottom Transparent Overlay: Title, Desc, and Action */}
              <div className="relative z-10 p-3.5 text-white">
                <h3 className="font-display text-xs sm:text-sm font-bold leading-snug text-white transition-colors group-hover:text-[#FFA366] line-clamp-1">
                  {trade.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-[10px] sm:text-[11px] leading-relaxed text-white/80">
                  {trade.desc}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTradeClick(trade.title)
                  }}
                  className="mt-2.5 inline-flex w-full items-center justify-center gap-1 rounded-lg bg-[#C94F36] px-2.5 py-1.5 text-[11px] font-bold text-white shadow-md transition hover:bg-[#B33E26] active:scale-[0.98] cursor-pointer group/btn"
                >
                  <span>Hire Trade</span>
                  <Icons.ChevronRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}