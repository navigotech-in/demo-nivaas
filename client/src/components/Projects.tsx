import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '../lib/api'
import { fallbackProjects } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface ProjectsProps {
  onOpenConsult: (planTitle?: string) => void
}

const ARCH_IMAGE =
  'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg'

const tiers = [
  { col: 'col-span-2', row: 'row-span-2' }, // large
  { col: 'col-span-1', row: 'row-span-1' }, // normal
  { col: 'col-span-1', row: 'row-span-2' }, // tall
  { col: 'col-span-1', row: 'row-span-1' }, // normal
  { col: 'col-span-2', row: 'row-span-1' }, // wide
  { col: 'col-span-1', row: 'row-span-1' }, // normal
]

export default function Projects({ onOpenConsult }: ProjectsProps) {
  const [selectedBhk, setSelectedBhk] = useState<string>('All')
  const { data, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  })

  const allProjects = data && !isError ? data : fallbackProjects

  const filtered = selectedBhk === 'All'
    ? allProjects
    : selectedBhk === 'Rental'
    ? allProjects.filter((p) => p.floors.includes('Rental') || p.title.includes('Rental') || p.tag?.includes('Rental'))
    : allProjects.filter((p) => p.bhk.includes(selectedBhk))

  const selectBhk = (value: string) => {
    setSelectedBhk(value)
  }

  return (
    <section id="plans" className="py-20 sm:py-28 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        {/* Editorial Split Intro — Architecture: text left, image right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Blueprint size={14} /> Architecture
            </span>
            <h2 className="section-title mt-2">
              Floor plans designed around your plot, sunlight and daily routine.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-[#74706A] leading-relaxed">
              Every house plan is crafted for standard Indian plot sizes (30x50,
              20x40, 40x60, 25x50) and municipal setbacks (GHMC, BBMP, DDA,
              PMRDA), with 100% Vastu compliance, covered car parking, and
              complete structural CAD drawings.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row sm:items-center gap-4">
              <button
                type="button"
                onClick={() => onOpenConsult('Architecture Consultation: Floor Plan Design')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E76F2E] text-white text-sm font-bold transition hover:bg-[#C65320] active:scale-[0.98] group/link"
              >
                <span>Explore architecture</span>
                <Icons.ChevronRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-0.5"
                />
              </button>
              <span className="text-xs font-medium text-[#74706A]">
                12,000+ verified plans · Dimensions from 20x40 to 60x80
              </span>
            </div>
          </div>
          <div className="relative overflow-hidden bg-[#FFF6E8]">
            <Img
              src={ARCH_IMAGE}
              alt="Modern Indian architecture under construction"
              className="h-full w-full object-cover aspect-[45/20]"
            />
          </div>
        </div>

        {/* BHK Filter Tabs */}
        <div className="mt-16 flex items-center gap-7 overflow-x-auto pb-3 scrollbar-none border-b border-[#E7E0D7]">
          {[
            { label: 'All House Plans', value: 'All' },
            { label: '2 BHK Compact', value: '2 BHK' },
            { label: '3 BHK Duplex', value: '3 BHK' },
            { label: '4 BHK Luxury Villa', value: '4 BHK' },
            { label: '5 BHK Joint Family', value: '5 BHK' },
            { label: 'Rental Income Units', value: 'Rental' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => selectBhk(tab.value)}
              className={`pb-2.5 -mb-px text-xs sm:text-sm font-bold whitespace-nowrap transition border-b-2 ${
                selectedBhk === tab.value
                  ? 'border-[#E76F2E] text-[#E76F2E]'
                  : 'border-transparent text-[#74706A] hover:text-[#292826]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Masonry-style Plan Grid */}
        <div className="mt-14 grid grid-cols-2 auto-rows-[130px] grid-flow-dense gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {filtered.map((project, index) => {
            const tier = tiers[index % tiers.length]
            return (
              <button
                key={project.id}
                type="button"
                onClick={() => onOpenConsult(`Plan: ${project.title} (${project.size})`)}
                className={`${tier.col} ${tier.row} relative overflow-hidden rounded-xl bg-[#FFF6E8] text-left group cursor-pointer`}
                aria-label={`View plan: ${project.title}`}
              >
                <Img
                  src={project.image}
                  alt={project.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/0 to-transparent" />
                {project.featured && (
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-[#E76F2E] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white">
                    Featured
                  </span>
                )}
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-display text-[13px] font-bold leading-snug text-white line-clamp-2">
                    {project.title}
                  </p>
                  <p className="mt-1 text-[10px] font-medium text-white/80">
                    {project.size} · {project.bhk}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-[10px] font-bold text-[#292826]">
                    View plan
                    <Icons.ChevronRight size={12} />
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onOpenConsult('Browse 12,000+ House Plans Catalog')}
            className="inline-flex items-center gap-2 text-sm font-bold text-[#E76F2E] transition hover:text-[#292826] group/link underline underline-offset-4 decoration-[#E7E0D7] hover:decoration-[#E76F2E]"
          >
            <span>Browse All 12,000+ House Plans by Dimension</span>
            <Icons.ChevronRight
              size={16}
              className="transition-transform group-hover/link:translate-x-0.5"
            />
          </button>
        </div>
      </div>
    </section>
  )
}