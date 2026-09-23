import { useState } from 'react'
import { trendingTabs } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface TrendingPlansProps {
  onOpenConsult: (details?: string) => void
}

type TabType = 'byArea' | 'byBHK' | 'byDirection' | 'byLocation'

const pad = (n: number) => String(n + 1).padStart(2, '0')

const tabs: { id: keyof typeof trendingTabs; label: string }[] = [
  { id: 'byArea', label: 'By Built-up Area' },
  { id: 'byBHK', label: 'By Bedroom (BHK)' },
  { id: 'byDirection', label: 'By Vastu Direction' },
  { id: 'byLocation', label: 'By Major Cities' },
]

export default function TrendingPlans({ onOpenConsult }: TrendingPlansProps) {
  const [activeTab, setActiveTab] = useState<TabType>('byArea')
  const [active, setActive] = useState(0)

  const items = trendingTabs[activeTab]
  const activeItem = items[active % items.length]

  const selectTab = (tab: TabType) => {
    setActiveTab(tab)
    setActive(0)
  }

  return (
    <section className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.TrendUp size={14} /> Discover by Category
            </span>
            <h2 className="section-title mt-2">
              Latest Trends in House Plans and Home Designs
            </h2>
            <p className="mt-2 text-sm text-[#74706A] max-w-2xl">
              Explore thousands of curated residential blueprints filtered by your exact plot specifications, bedroom counts and Vastu orientations.
            </p>
          </div>
          <a
            href="#plans"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-sm group/link"
          >
            <Icons.Grid size={15} />
            <span>Explore Full Catalog</span>
            <Icons.ChevronRight
              size={14}
              className="transition-transform group-hover/link:translate-x-0.5"
            />
          </a>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex gap-7 border-b border-[#E7E0D7] pb-3.5 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={`pb-2.5 -mb-px whitespace-nowrap transition border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#E76F2E] text-[#E76F2E]'
                  : 'border-transparent text-[#74706A] hover:text-[#292826]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Numbered Category Index + Hover Preview Image */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Index List */}
          <div className="lg:col-span-5">
            {items.map((item, idx) => {
              const isActive = idx === active % items.length
              return (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => setActive(idx)}
                  onFocus={() => setActive(idx)}
                  onClick={() =>
                    onOpenConsult(`Interested in ${item.label} (${item.size})`)
                  }
                  className={`group flex w-full items-center gap-5 border-b border-[#E7E0D7] py-5 text-left transition ${
                    isActive ? 'bg-[#FDFCF9]' : ''
                  }`}
                >
                  <span
                    className={`text-xs font-bold tracking-[0.2em] transition ${
                      isActive ? 'text-[#E76F2E]' : 'text-[#74706A] group-hover:text-[#C65320]'
                    }`}
                  >
                    {pad(idx)}
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-lg font-bold text-[#E76F2E] leading-snug">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs font-semibold text-[#74706A]">
                      {item.size} · {item.bhk}
                    </span>
                  </span>
                  <Icons.ChevronRight
                    size={16}
                    className={`shrink-0 transition ${
                      isActive
                        ? 'translate-x-0.5 text-[#E76F2E]'
                        : 'text-[#74706A] group-hover:translate-x-0.5 group-hover:text-[#74706A]'
                    }`}
                  />
                </button>
              )
            })}
          </div>

          {/* Hover Preview Image */}
          <div className="lg:col-span-7 lg:sticky lg:top-8">
            <div key={active} className="relative overflow-hidden bg-[#FFF6E8] animate-fadeIn">
              <Img
                src={activeItem.img}
                alt={activeItem.label}
                className="h-full w-full object-cover aspect-[45/20]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[#292826]/70 to-transparent p-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                    {activeItem.bhk}
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-white leading-snug">
                    {activeItem.label}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    onOpenConsult(`Get Floor Plan for ${activeItem.label} (${activeItem.size})`)
                  }
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-4 py-2 text-xs font-bold text-[#E76F2E] transition hover:bg-white group/link"
                >
                  <Icons.FileText size={13} />
                  <span>Get Floor Plan</span>
                  <Icons.ChevronRight
                    size={14}
                    className="transition-transform group-hover/link:translate-x-0.5"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}