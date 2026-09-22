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
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-hover hover:border-slate-400">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Img
          src={project.image}
          alt={project.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 95vw"
        />
        <div className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center">
          <span className="select-none -rotate-12 rounded-md border border-white/30 bg-white/15 px-3 py-1 font-display text-xl font-extrabold tracking-[0.25em] text-white/85 shadow-sm backdrop-blur-[1px]">
            NIVAAS
          </span>
        </div>
        {project.tag && (
          <span className="absolute left-3.5 top-3.5 z-[2] rounded-md border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 backdrop-blur shadow-sm">
            {project.tag}
          </span>
        )}
        {project.vastuCompliant && (
          <span className="absolute bottom-3.5 left-3.5 z-[2] rounded-md bg-[#0EA5E9]/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur flex items-center gap-1">
            <Icons.Check size={12} />
            <span>100% Vastu Approved</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => setSaved(!saved)}
          className={`absolute right-3.5 top-3.5 z-[2] flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all shadow-md ${
            saved ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-700 hover:text-red-500 hover:scale-105'
          }`}
          aria-label={`Save ${project.title} to favourites`}
        >
          <Icons.Heart size={17} filled={saved} />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6 bg-white">
        <h3 className="font-display text-lg sm:text-xl font-bold leading-snug text-slate-900 group-hover:text-slate-900 transition">
          {project.title}
        </h3>
        {project.plotDetails && (
          <p className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
            <Icons.MapPin size={12} className="text-slate-700 shrink-0" />
            <span className="truncate">{project.plotDetails}</span>
          </p>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <Icons.Ruler size={13} className="text-slate-700 shrink-0" />
            {project.size}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Icons.Bed size={13} className="text-slate-700 shrink-0" />
            {project.bhk}
          </span>
          <span className="text-slate-300">·</span>
          <span className="flex items-center gap-1.5">
            <Icons.Building size={13} className="text-slate-700 shrink-0" />
            {project.floors}
          </span>
        </div>

        {project.keyFeatures && (
          <div className="mt-3.5 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-slate-600">
            {project.keyFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate font-medium">
                <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3.5 text-xs">
          <span className="text-slate-600 font-medium flex items-center gap-1.5">
            <Icons.Compass size={14} className="text-slate-700" />
            <span>{project.facing}</span>
            <span className="text-slate-300">·</span>
            <span>{project.area}</span>
          </span>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block font-semibold uppercase">Drawing Set</span>
            <span className="text-base font-extrabold text-slate-950">{project.price}</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => onOpenConsult(`Customize Plan: ${project.title} (${project.size})`)}
            className="w-full rounded-xl bg-slate-700 py-2.5 text-center text-xs font-bold text-white shadow-sm transition hover:bg-[#0EA5E9] active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Icons.Ruler size={13} />
            <span>Customize</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenConsult(`Request CAD sample for ${project.title}`)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 text-center text-xs font-bold text-slate-800 transition hover:bg-slate-100 hover:border-slate-500 flex items-center justify-center gap-1.5"
          >
            <Icons.FileText size={13} />
            <span>Sample CAD</span>
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
                    ? 'bg-slate-700 text-white shadow-md'
                    : 'bg-white border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.value !== 'All' && <Icons.Bed size={13} />}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpenConsult={onOpenConsult}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => onOpenConsult('Browse 12,000+ House Plans Catalog')}
            className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-slate-700 bg-white px-8 py-3.5 text-sm font-bold text-slate-950 shadow-md hover:bg-slate-100 transition active:scale-[0.98]"
          >
            <Icons.Blueprint size={18} className="text-slate-700" />
            <span>Browse All 12,000+ House Plans by Dimension →</span>
          </button>
        </div>
      </div>
    </section>
  )
}