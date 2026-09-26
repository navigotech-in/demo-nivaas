import { useState } from 'react'
import Projects from './Projects'
import Elevations from './Elevations'
import Interiors from './Interiors'

interface DesignStudioProps {
  onOpenConsult: (details?: string) => void
}

type StudioTab = 'plans' | 'elevations' | 'interiors'

const studioTabs: { id: StudioTab; label: string; emoji: string; subtitle: string }[] = [
  {
    id: 'plans',
    label: 'House Plans (2D/3D)',
    emoji: '🏠',
    subtitle: 'Vastu blueprints & layouts',
  },
  {
    id: 'elevations',
    label: '3D Front Elevations',
    emoji: '🏛️',
    subtitle: 'Modern & classic facades',
  },
  {
    id: 'interiors',
    label: 'Luxury Interiors',
    emoji: '🛋️',
    subtitle: 'Living, modular kitchens & beds',
  },
]

export default function DesignStudio({ onOpenConsult }: DesignStudioProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('plans')

  return (
    <section id="design-studio" className="bg-[#FAF8F5] pt-12 pb-6 border-b border-[#E7E0D7]">
      <div className="container-content">
        {/* Top Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFF6E8] border border-[#E7E0D7] text-xs font-bold text-[#E76F2E] mb-3">
            <span className="text-base">✨</span>
            <span>Interactive Design Studio</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#292826] font-display tracking-tight">
            Explore Curated Architectural Blueprints & Designs
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#74706A]">
            Switch between House Floor Plans, 3D Elevations, and Interior Themes — customized for Indian plot dimensions and Vastu norms.
          </p>
        </div>

        {/* Tab Navigation Bar (House Plans, Front Elevations, Interiors) */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 scrollbar-none gap-2 sm:gap-3 mb-6">
          {studioTabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2.5 px-4 sm:px-6 py-3 rounded-xl border font-bold text-xs sm:text-sm transition-all duration-300 shadow-xs cursor-pointer ${
                  isActive
                    ? 'bg-[#292826] text-white border-[#292826] shadow-md scale-[1.02]'
                    : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]/60 hover:bg-[#FFF6E8]'
                }`}
              >
                <span className="text-lg">{tab.emoji}</span>
                <div className="text-left">
                  <div className={isActive ? 'text-white' : 'text-[#292826]'}>{tab.label}</div>
                  <div className={`text-[10px] font-normal hidden sm:block ${isActive ? 'text-white/70' : 'text-[#74706A]'}`}>
                    {tab.subtitle}
                  </div>
                </div>
                {isActive && (
                  <span className="ml-1 flex h-2 w-2 rounded-full bg-[#E76F2E]" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Render Active Tab Content */}
      <div className="transition-opacity duration-300">
        {activeTab === 'plans' && <Projects onOpenConsult={onOpenConsult} />}
        {activeTab === 'elevations' && <Elevations onOpenConsult={onOpenConsult} />}
        {activeTab === 'interiors' && <Interiors onOpenConsult={onOpenConsult} />}
      </div>
    </section>
  )
}
