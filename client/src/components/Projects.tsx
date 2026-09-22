import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '../lib/api'
import { fallbackProjects } from '../lib/data'
import type { Project } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface ProjectsProps {
  onOpenConsult: (planTitle?: string) => void
}

function ProjectCard({
  project,
  onOpenConsult,
}: {
  project: Project
  onOpenConsult: (title: string) => void
}) {
  const [saved, setSaved] = useState(false)
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-card-hover">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
        {project.tag && (
          <span className="absolute left-3.5 top-3.5 z-[2] rounded-md border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 backdrop-blur shadow-sm">
            {project.tag}
          </span>
        )}
        {project.vastuCompliant && (
          <span className="absolute bottom-3.5 left-3.5 z-[2] rounded-md bg-slate-950/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur flex items-center gap-1">
            <Icons.Check size={12} />
            <span>100% Vastu Approved</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-label={saved ? 'Remove from saved' : 'Save this plan'}
          className={`absolute right-3.5 top-3.5 z-[2] flex h-8 w-8 items-center justify-center rounded-full backdrop-blur transition ${
            saved ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Icons.Heart size={15} className={saved ? 'fill-current' : ''} />
        </button>
      </div>

      <div className="flex flex-1 flex-col bg-white p-5 sm:p-6">
        <h3 className="font-display text-lg font-bold text-slate-900 line-clamp-1 transition group-hover:text-blue-700">
          {project.title}
        </h3>
        {project.plotDetails && (
          <p className="mt-1.5 text-xs font-medium text-slate-600 leading-relaxed">{project.plotDetails}</p>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1">
            <Icons.Ruler size={13} className="text-slate-700" />
            {project.size}
          </span>
          <span className="flex items-center gap-1">
            <Icons.Bed size={13} className="text-slate-700" />
            {project.bhk}
          </span>
          <span className="flex items-center gap-1">
            <Icons.Building size={13} className="text-slate-700" />
            {project.floors}
          </span>
        </div>

        {project.keyFeatures && (
          <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-slate-200 pt-3.5 text-[11px] font-medium text-slate-600">
            {project.keyFeatures.map((feat, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                {feat}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-200 pt-3.5">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {project.facing} · {project.area}
            </span>
            <span className="mt-0.5 block text-base font-extrabold text-slate-950">{project.price}</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult(`Customize Plan: ${project.title} (${project.size})`)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Icons.Ruler size={13} />
            <span>Customize</span>
          </button>
        </div>
      </div>
    </div>
  )
}

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

  return (
    <section id="plans" className="py-20 sm:py-24 bg-[#F1F5F9] border-t border-slate-300">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Blueprint size={14} /> Verified Blueprint Catalog
            </span>
            <h2 className="section-title mt-2 max-w-xl text-slate-900">
              Indian House Plans & Working Blueprints
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Every house plan is crafted for standard Indian plot sizes (30x50, 20x40, 40x60, 25x50) and municipal setbacks (GHMC, BBMP, DDA, PMRDA), with 100% Vastu compliance, covered car parking, and complete structural CAD drawings.
            </p>
          </div>

          {/* BHK Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                onClick={() => setSelectedBhk(tab.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                  selectedBhk === tab.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.value !== 'All' && <Icons.Bed size={13} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} onOpenConsult={onOpenConsult} />
          ))}
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Showing {filtered.length} plans from {allProjects.length} verified catalog entries · Request custom dimensions anytime
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => onOpenConsult('Browse 12,000+ House Plans Catalog')}
            className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-blue-600 bg-white px-8 py-3.5 text-sm font-bold text-blue-700 shadow-md hover:bg-blue-50 transition active:scale-[0.98]"
          >
            <Icons.Blueprint size={18} className="text-blue-600" />
            <span>Browse All 12,000+ House Plans by Dimension →</span>
          </button>
        </div>
      </div>
    </section>
  )
}