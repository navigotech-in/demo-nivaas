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
              Skilled workers &amp; trade contractors, vetted by Indore House Maker's
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
            <div
              key={trade.title}
              className="text-left flex flex-col rounded-xl border border-[#E7E0D7] bg-white overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-[#E76F2E] group"
            >
              {/* Image Container with Smooth Zoom */}
              <div
                className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 cursor-pointer"
                onClick={() => handleTradeClick(trade.title)}
              >
                <Img
                  src={trade.image || 'https://images.pexels.com/photos/585419/pexels-photo-585419.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'}
                  alt={trade.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />
              </div>

              {/* Body */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between bg-transparent">
                <div>
                  <h3
                    onClick={() => handleTradeClick(trade.title)}
                    className="font-display text-xs sm:text-sm font-bold text-[#292826] leading-snug cursor-pointer mb-1.5 truncate"
                  >
                    {trade.title}
                  </h3>
                  <p className="text-[11px] text-[#54504A] leading-relaxed line-clamp-2">
                    {trade.desc}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[#EEE9E3]">
                  <button
                    type="button"
                    onClick={() => handleTradeClick(trade.title)}
                    className="w-full py-1.5 px-3 rounded-lg bg-[#E76F2E] text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#C65320] transition shadow-xs cursor-pointer active:scale-[0.98]"
                  >
                    <span>Book Now</span>
                    <Icons.ChevronRight size={13} className="transform group-hover:translate-x-0.5 transition-transform" />
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