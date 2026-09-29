import { useState } from 'react'
import { commercialTabs } from '../lib/data'
import { Icons } from './Icons'

interface CommercialDesignsProps {
  onOpenConsult: (serviceTitle?: string) => void
}

export default function CommercialDesigns({ onOpenConsult }: CommercialDesignsProps) {
  const [activeTab, setActiveTab] = useState(commercialTabs[0].id)
  const active = commercialTabs.find((t) => t.id === activeTab) || commercialTabs[0]

  return (
    <section className="py-20 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Building size={14} /> Commercial & Mixed-Use
            </span>
            <h2 className="section-title mt-2">
              Commercial building designs, engineered for business
            </h2>
            <p className="mt-2 text-sm text-[#54504A] max-w-2xl">
              Retail, institutional, hospitality and rental schemes drawn to your city's commercial bye-laws with optimized vehicle access and service zones.
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 max-w-full overflow-x-auto pb-1 scrollbar-none shrink-0 -mt-1 lg:-mt-3">
            {commercialTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-lg text-xs font-bold transition shrink-0 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#E76F2E] text-white shadow-sm'
                    : 'bg-[#FFF6E8] text-[#54504A] hover:bg-[#F1ECE5]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Single Unified Commercial Card */}
        <div key={active.id} className="relative overflow-hidden rounded-lg border border-[#E7E0D7] shadow-card animate-fadeIn">
          <img src={active.image} alt={active.label} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#292826]/90 via-[#292826]/45 to-[#292826]/10" />

          <div className="relative min-h-[360px] sm:min-h-[408px] flex flex-col justify-end p-6 sm:p-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#E76F2E] ring-1 ring-[#E7E0D7]">
                {active.label}
              </span>
              <h3 className="mt-3 font-display text-2xl sm:text-3xl font-extrabold text-white">
                {active.label} Design
              </h3>
              <p className="mt-2 text-sm text-white/85 leading-relaxed max-w-xl">
                {active.desc}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-white/80">
                {['Local bye-law & set-back compliance', 'Civil + structural + MEP drawing sets', 'Facade, signage & parking planning'].map((f) => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Icons.Check size={13} className="text-[#E76F2E] shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onOpenConsult(`${active.label} Commercial Design`)}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-[#E76F2E] shadow-sm hover:bg-[#F1ECE5] transition"
                >
                  <span>Request a Quote</span>
                  <Icons.ChevronRight size={14} />
                </button>
                <a
                  href="#interiors"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-[#292826]/90 px-5 py-2.5 text-xs font-bold text-white hover:bg-[#292826] transition transition"
                >
                  <span>See Reference Images</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}