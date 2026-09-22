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
    <section className="py-20 bg-white border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Building size={14} /> Commercial & Mixed-Use
            </span>
            <h2 className="section-title mt-2 text-slate-900">
              Commercial building designs, engineered for business
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Retail, institutional, hospitality and rental schemes drawn to your city's commercial bye-laws with optimized vehicle access and service zones.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {commercialTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          <div className="relative overflow-hidden rounded-3xl border border-slate-300 shadow-card min-h-[260px]">
            <img src={active.image} alt={active.label} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1220]/80 via-[#0F1220]/20 to-transparent" />
            <h3 className="absolute bottom-4 left-5 font-display text-2xl font-extrabold text-white">{active.label}</h3>
          </div>
          <div className="flex flex-col justify-center rounded-3xl border border-slate-300 bg-[#F8FAFC] p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-slate-900">{active.label} Design</h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">{active.desc}</p>
            <ul className="mt-4 space-y-2 text-xs text-slate-700">
              {['Local bye-law & set-back compliance', 'Civil + structural + MEP drawing sets', 'Facade, signage & parking planning'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Icons.Check size={13} className="text-blue-600 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onOpenConsult(`${active.label} Commercial Design`)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                <span>Request a Quote</span>
                <Icons.ChevronRight size={14} />
              </button>
              <a
                href="#interiors"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:border-slate-500 transition"
              >
                <span>See Reference Images</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}