import { useState } from 'react'
import { trendingTabs } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface TrendingPlansProps {
  onOpenConsult: (details?: string) => void
}

type TabType = 'area' | 'bhk' | 'direction' | 'location'

export default function TrendingPlans({ onOpenConsult }: TrendingPlansProps) {
  const [activeTab, setActiveTab] = useState<TabType>('area')

  const getItems = () => {
    switch (activeTab) {
      case 'area':
        return trendingTabs.byArea
      case 'bhk':
        return trendingTabs.byBHK
      case 'direction':
        return trendingTabs.byDirection
      case 'location':
        return trendingTabs.byLocation
    }
  }

  const items = getItems()

  return (
    <section className="py-20 bg-[#F1F5F9] border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.TrendUp size={14} /> Discover by Category
            </span>
            <h2 className="section-title mt-2 text-slate-900">
              Latest Trends in House Plans and Home Designs
            </h2>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl">
              Explore thousands of curated residential blueprints filtered by your exact plot specifications, bedroom counts and Vastu orientations.
            </p>
          </div>
          <a
            href="#plans"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white border border-slate-300 text-slate-800 hover:border-slate-500 hover:text-slate-900 transition shadow-sm"
          >
            <Icons.Grid size={15} />
            <span>Explore Full Catalog →</span>
          </a>
        </div>

        {/* Category Tabs */}
        <div className="mt-8 flex gap-2 border-b border-slate-300 pb-3.5 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('area')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'area'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icons.Grid size={15} />
            <span>By Built-up Area</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bhk')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'bhk'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icons.Bed size={15} />
            <span>By Bedroom (BHK)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('direction')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'direction'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icons.Compass size={15} />
            <span>By Vastu Direction</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('location')}
            className={`px-4 py-2.5 rounded-xl transition shrink-0 flex items-center gap-2 ${
              activeTab === 'location'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Icons.MapPin size={15} />
            <span>By Major Cities</span>
          </button>
        </div>

        {/* Trending Card Grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Img
                  src={item.img}
                  alt={item.label}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3.5 top-3.5 z-[2] rounded-md border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 backdrop-blur shadow-sm">
                  {item.label}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Icons.Ruler size={13} className="text-slate-700" />
                      {item.size}
                    </span>
                    <span className="rounded-md bg-slate-100 border border-slate-300 px-2 py-0.5 text-[11px] font-bold text-slate-950">
                      {item.bhk}
                    </span>
                  </div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-slate-900">
                    {item.label} Architectural Blueprint
                  </h3>
                </div>
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Package Starting
                    </span>
                    <span className="mt-0.5 block text-base font-extrabold text-slate-950">
                      {item.price}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Interested in ${item.label} (${item.size})`)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <Icons.FileText size={13} />
                    <span>Get Floor Plan →</span>
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
