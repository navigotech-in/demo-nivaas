import { useMemo, useRef, useState, type MouseEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchProjects } from '../lib/api'
import { fallbackProjects, type Project } from '../lib/data'
import { Icons } from './Icons'
import { cityAliases, masterIndianCities, type CatalogOpenMenu, type DesignFilterState } from './useDesignCatalogFilters'
import { DesignEmptyState, DesignImageCard } from './DesignImageCard'

interface ProjectsProps {
  onOpenConsult: (planTitle?: string) => void
}

const bhkPills = [
  { label: 'All Plans', value: 'All', icon: Icons.Grid },
  { label: '2 BHK', value: '2 BHK', icon: Icons.Bed },
  { label: '3 BHK', value: '3 BHK', icon: Icons.Bed },
  { label: '4 BHK', value: '4 BHK', icon: Icons.Bed },
  { label: '5 BHK', value: '5 BHK', icon: Icons.Bed },
]

const homeTypeOptions = ['Compact Home', 'Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units']
const areaOptions = ['Under 1,000 sq.ft', '1,000 - 1,500 sq.ft', '1,500 - 2,000 sq.ft', '2,000 - 3,000 sq.ft', 'Above 3,000 sq.ft']
const directionOptions = ['East Facing', 'West Facing', 'North Facing', 'South Facing']

interface CityOption {
  name: string
  slug: string
  state?: string
  aliases?: string[]
  planCount: number
}

type OpenMenu = CatalogOpenMenu

const parseBuiltUp = (area: string) => {
  const n = parseInt(area.replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

const areaMatches = (range: string, builtUp: number) => {
  switch (range) {
    case 'Under 1,000 sq.ft': return builtUp > 0 && builtUp < 1000
    case '1,000 - 1,500 sq.ft': return builtUp >= 1000 && builtUp < 1500
    case '1,500 - 2,000 sq.ft': return builtUp >= 1500 && builtUp < 2000
    case '2,000 - 3,000 sq.ft': return builtUp >= 2000 && builtUp < 3000
    case 'Above 3,000 sq.ft': return builtUp >= 3000
    default: return true
  }
}

const homeTypeMatches = (p: Project, homeType: string) => {
  if (!homeType) return true
  const hay = `${p.title} ${p.bhk} ${p.floors} ${p.tag ?? ''} ${(p.keyFeatures ?? []).join(' ')}`.toLowerCase()
  switch (homeType) {
    case 'Compact Home': return /compact|narrow frontage/.test(hay)
    case 'Duplex': return hay.includes('duplex')
    case 'Luxury Villa': return /luxury|villa|haveli|home theatre/.test(hay)
    case 'Joint Family Home': return /joint|family|estate|parent/.test(hay)
    case 'Rental Units': return hay.includes('rental')
    default: return true
  }
}

const directionMatches = (facing: string, direction: string) => {
  if (!direction) return true
  return facing.toLowerCase().startsWith(direction.split(' ')[0].toLowerCase())
}

interface FilterDropdownProps {
  placeholder: string
  icon: typeof Icons.Ruler
  value: string
  options: string[]
  isOpen: boolean
  onToggle: (e: MouseEvent<HTMLButtonElement>) => void
  onChange: (v: string) => void
}

function FilterDropdown({ placeholder, icon: Icon, value, options, isOpen, onToggle, onChange }: FilterDropdownProps) {
  const [pos, setPos] = useState({ left: 0, top: 0 })

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      const rect = e.currentTarget.getBoundingClientRect()
      const left = Math.min(Math.max(8, rect.left), window.innerWidth - 228)
      setPos({ left, top: rect.bottom + 6 })
    }
    onToggle(e)
  }

  return (
    <div className="shrink-0">
      <button
        type="button"
        aria-label={`Filter by ${placeholder}`}
        aria-expanded={isOpen}
        onClick={handleToggle}
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition ${
          value
            ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-sm'
            : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
        }`}
      >
        <Icon size={13} />
        <span className="max-w-[120px] truncate">{value || placeholder}</span>
        <Icons.ChevronDown size={12} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="fixed z-50 w-[220px] rounded-xl border border-[#E7E0D7] bg-white p-1.5 shadow-xl animate-fadeIn"
          style={{ left: pos.left, top: pos.top }}
        >
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mb-1 flex w-full items-center justify-between rounded-lg border-b border-[#E7E0D7] px-3 py-2 text-xs font-semibold text-[#54504A] transition hover:bg-[#F5F2EC]"
            >
              Any {placeholder}
              <Icons.Close size={11} />
            </button>
          )}
          {options.map((opt) => {
            const active = value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${
                  active ? 'bg-[#FFF6E8] text-[#E76F2E]' : 'text-[#292826] hover:bg-[#F5F2EC]'
                }`}
              >
                <span>{opt}</span>
                {active && <Icons.ChevronRight size={13} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function CityOptionsList({
  cities,
  value,
  searchQuery,
  onSelect,
  resultNoun = 'plan',
}: {
  cities: CityOption[]
  value: string
  searchQuery?: string
  onSelect: (name: string) => void
  resultNoun?: 'plan' | 'design'
}) {
  const trimmed = searchQuery?.trim()
  const isExactMatch = cities.some((c) => c.name.toLowerCase() === trimmed?.toLowerCase())

  return (
    <div className="max-h-[260px] overflow-y-auto divide-y divide-[#F5F2EC]/60">
      {trimmed && !isExactMatch && (
        <button
          type="button"
          onClick={() => onSelect(trimmed)}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-[#FFF6E8] p-2.5 text-left text-xs font-bold text-[#E76F2E] hover:bg-[#FFEBD0] transition mb-1"
        >
          <div className="flex items-center gap-1.5 truncate">
            <Icons.Check size={13} className="shrink-0" />
            <span className="truncate">Select &quot;{trimmed}&quot; (Custom City)</span>
          </div>
          <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-white text-[#E76F2E] border border-[#E76F2E]/30 shrink-0">
            Apply
          </span>
        </button>
      )}

      {cities.length === 0 && !trimmed && (
        <p className="px-3 py-4 text-center text-xs text-[#54504A]">No city found</p>
      )}

      {cities.map((c) => {
        const active = value.toLowerCase() === c.name.toLowerCase()
        return (
          <button
            key={c.name}
            type="button"
            onClick={() => onSelect(c.name)}
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-xs font-bold transition ${
              active ? 'bg-[#FFF6E8] text-[#E76F2E]' : 'text-[#292826] hover:bg-[#F5F2EC]'
            }`}
          >
            <div className="flex flex-col truncate">
              <span className="truncate">{c.name}</span>
              {c.state && (
                <span className="text-[10px] font-normal text-[#54504A] truncate">{c.state}</span>
              )}
            </div>
            <span className={`text-[10px] font-semibold shrink-0 ${active ? 'text-[#E76F2E]' : 'text-[#54504A]'}`}>
              {c.planCount} {c.planCount === 1 ? resultNoun : `${resultNoun}s`}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function CityDropdown({
  value,
  open,
  onToggle,
  onSelect,
  cities,
  resultNoun = 'plan',
}: {
  value: string
  open: boolean
  onToggle: () => void
  onSelect: (name: string) => void
  cities: CityOption[]
  resultNoun?: 'plan' | 'design'
}) {
  const [search, setSearch] = useState('')
  const [pos, setPos] = useState({ left: 0, top: 0 })

  const query = search.trim().toLowerCase()
  const filtered = query
    ? cities.filter((c) =>
        [c.name, c.state ?? '', ...(c.aliases ?? [])].some((t) => t.toLowerCase().includes(query)),
      )
    : cities

  const handleToggle = (e: MouseEvent<HTMLButtonElement>) => {
    if (!open) {
      setSearch('')
      const rect = e.currentTarget.getBoundingClientRect()
      setPos({
        left: Math.min(Math.max(8, rect.left), window.innerWidth - 290),
        top: rect.bottom + 6,
      })
    }
    onToggle()
  }

  const searchInput = (
    <div className="relative">
      <Icons.Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#54504A]" />
      <input
        autoFocus
        type="text"
        aria-label="Search city name for house plans"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Type any city (e.g. Mumbai, Pune, Delhi)..."
        className="w-full rounded-lg border border-[#E7E0D7] bg-white py-2 pl-8 pr-3 text-xs font-medium text-[#292826] placeholder:text-[#54504A] focus:border-[#C94F36] focus:outline-none"
      />
    </div>
  )

  const clearRow = (
    <button
      type="button"
      onClick={() => { onSelect(''); setSearch('') }}
      className="mb-1 flex w-full items-center justify-between rounded-lg border-b border-[#E7E0D7] px-3 py-2 text-xs font-semibold text-[#54504A] transition hover:bg-[#F5F2EC]"
    >
      Clear city filter
      <Icons.Close size={11} />
    </button>
  )

  return (
    <>
      <div className="shrink-0">
        <button
          type="button"
          aria-label="Filter plans by city"
          aria-expanded={open}
          onClick={handleToggle}
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-bold transition ${
            value
              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-sm'
              : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
          }`}
        >
          <Icons.MapPin size={13} />
          <span className="max-w-[120px] truncate">{value || 'Search City'}</span>
          <Icons.ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Desktop searchable popover */}
      {open && (
        <div
          className="hidden sm:block fixed z-50 w-[280px] rounded-xl border border-[#E7E0D7] bg-white p-2.5 shadow-xl animate-fadeIn"
          style={{ left: pos.left, top: pos.top }}
        >
          {searchInput}
          <div className="mt-2">
            {value && clearRow}
            <CityOptionsList cities={filtered} value={value} searchQuery={search} onSelect={onSelect} resultNoun={resultNoun} />
          </div>
        </div>
      )}

      {/* Mobile searchable bottom sheet */}
      {open && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-4 pb-6 shadow-xl animate-fadeIn">
          <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#E7E0D7]" />
          <div className="mb-2 flex items-center justify-between">
            <h4 className="font-display text-base font-bold text-[#292826]">Select Your City</h4>
            <button
              type="button"
              onClick={onToggle}
              className="flex items-center gap-1.5 rounded-full text-[11px] font-bold text-[#C94F36]"
            >
              Done
            </button>
          </div>
          <div className="relative">{searchInput}</div>
          <div className="mt-2">
            {value && clearRow}
            <CityOptionsList cities={filtered} value={value} searchQuery={search} onSelect={onSelect} resultNoun={resultNoun} />
          </div>
        </div>
      )}
    </>
  )
}

interface DesignCatalogFilterBarProps {
  filters: DesignFilterState
  cities: CityOption[]
  openMenu: OpenMenu
  onChange: (key: keyof DesignFilterState, value: string) => void
  onToggle: (menu: OpenMenu) => void
  onClose: () => void
}

export function DesignCatalogFilterBar({
  filters,
  cities,
  openMenu,
  onChange,
  onToggle,
  onClose,
}: DesignCatalogFilterBarProps) {
  return (
    <>
      <div className="relative z-50 mt-6 rounded-xl border border-[#E7E0D7] bg-white p-3.5 shadow-xs">
        <div className="flex flex-nowrap items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
          <FilterDropdown
            placeholder="Home Type"
            icon={Icons.Layers}
            value={filters.homeType}
            options={homeTypeOptions}
            isOpen={openMenu === 'homeType'}
            onToggle={() => onToggle('homeType')}
            onChange={(value) => onChange('homeType', value)}
          />
          <FilterDropdown
            placeholder="Built-up Area"
            icon={Icons.Ruler}
            value={filters.area}
            options={areaOptions}
            isOpen={openMenu === 'area'}
            onToggle={() => onToggle('area')}
            onChange={(value) => onChange('area', value)}
          />
          <FilterDropdown
            placeholder="BHK"
            icon={Icons.Bed}
            value={filters.bhk === 'All' ? '' : filters.bhk}
            options={bhkPills.map((tab) => tab.value)}
            isOpen={openMenu === 'bhk'}
            onToggle={() => onToggle('bhk')}
            onChange={(value) => onChange('bhk', value)}
          />
          <FilterDropdown
            placeholder="Vastu Direction"
            icon={Icons.Compass}
            value={filters.direction}
            options={directionOptions}
            isOpen={openMenu === 'direction'}
            onToggle={() => onToggle('direction')}
            onChange={(value) => onChange('direction', value)}
          />
          <CityDropdown
            value={filters.city}
            open={openMenu === 'city'}
            onToggle={() => onToggle('city')}
            onSelect={(value) => onChange('city', value)}
            cities={cities}
            resultNoun="design"
          />
        </div>
      </div>

      {openMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/30 sm:bg-transparent"
          aria-hidden="true"
          onClick={onClose}
        />
      )}
    </>
  )
}

export default function Projects({ onOpenConsult }: ProjectsProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [bhk, setBhk] = useState('All')
  const [homeType, setHomeType] = useState('')
  const [areaRange, setAreaRange] = useState('')
  const [direction, setDirection] = useState('')
  const [city, setCity] = useState('')
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)

  const { data, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000,
  })

  const allProjects = data && !isError ? data : fallbackProjects

  const availableCities = useMemo<CityOption[]>(() => {
    const counts = new Map<string, number>()
    for (const p of allProjects) {
      if (p.city) counts.set(p.city, (counts.get(p.city) ?? 0) + 1)
    }
    return masterIndianCities.map((c) => ({
      name: c.name,
      slug: c.name.toLowerCase(),
      state: c.state,
      aliases: [c.state, ...(c.aliases ?? [])],
      planCount: counts.get(c.name) ?? Math.max(1, allProjects.length),
    }))
  }, [allProjects])

  const filtered = allProjects.filter((p) => {
    if (bhk !== 'All' && !p.bhk.includes(bhk)) return false
    if (!homeTypeMatches(p, homeType)) return false
    if (!areaMatches(areaRange, parseBuiltUp(p.area))) return false
    if (!directionMatches(p.facing, direction)) return false
    if (city) {
      if (p.city && p.city.toLowerCase() === city.toLowerCase()) return true
      const aliases = cityAliases[city] ?? [city]
      const matchesAlias = aliases.some((a) => (p.city ?? '').toLowerCase().includes(a.toLowerCase()))
      if (matchesAlias) return true
      const hasStrictCityProjects = allProjects.some((proj) => proj.city?.toLowerCase() === city.toLowerCase())
      if (hasStrictCityProjects) return false
    }
    return true
  })

  const chips: { key: string; label: string; onRemove: () => void }[] = []
  if (bhk !== 'All') chips.push({ key: 'bhk', label: bhk, onRemove: () => setBhk('All') })
  if (homeType) chips.push({ key: 'homeType', label: homeType, onRemove: () => setHomeType('') })
  if (areaRange) chips.push({ key: 'area', label: areaRange, onRemove: () => setAreaRange('') })
  if (direction) chips.push({ key: 'direction', label: direction, onRemove: () => setDirection('') })
  if (city) chips.push({ key: 'city', label: city, onRemove: () => setCity('') })
  const hasActiveFilters = chips.length > 0

  const clearAll = () => {
    setBhk('All')
    setHomeType('')
    setAreaRange('')
    setDirection('')
    setCity('')
    setOpenMenu(null)
  }

  const closeMenu = () => setOpenMenu(null)

  const scrollPlans = (dir: 1 | -1) => {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector<HTMLElement>('[data-slide]')
    const gap = 16
    const amount = card ? card.offsetWidth + gap : track.clientWidth
    track.scrollBy({ left: dir * amount, behavior: 'smooth' })
  }

  return (
    <div id="plans" className="pt-4 pb-12">
      <div className="container-content">
        <div className="mb-6">
          <span className="eyebrow flex items-center gap-1.5">
            <Icons.Blueprint size={14} /> House Plans & Blueprints
          </span>
          <h2 className="section-title mt-2">
            Indian House Plans with 2D & 3D Layouts
          </h2>
          <p className="mt-2 text-sm text-[#54504A] max-w-2xl">
            Vastu-compliant house plans with practical space planning, structural clarity, and photorealistic 3D previews — designed for Indian plot sizes, family needs, and contemporary living.
          </p>
        </div>

        {/* Compact Trust & Specification Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white border border-[#E7E0D7] shadow-2xs mb-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#54504A]">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] px-3 py-1 text-[#E76F2E] font-bold">
              <Icons.ShieldCheck size={13} />
              <span>GHMC & BBMP Setbacks</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] px-3 py-1 text-[#E76F2E] font-bold">
              <Icons.Sun size={13} />
              <span>100% Vastu Approved</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] px-3 py-1 text-[#E76F2E] font-bold">
              <Icons.Blueprint size={13} />
              <span>Structural CAD Sets</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-[#54504A] hidden sm:inline">
              12,000+ verified plans available
            </span>
            <button
              type="button"
              onClick={() => onOpenConsult('Custom Architecture Consultation')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#E76F2E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#C65320] transition active:scale-[0.98]"
            >
              <span>Custom Layout</span>
              <Icons.ChevronRight size={13} />
            </button>
          </div>
        </div>

        {/* Single Seamless Studio Filter Bar */}
        <div className="rounded-2xl border border-[#E7E0D7] bg-white p-4 sm:p-5 shadow-xs mb-8">
          <div className="flex flex-nowrap items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible sm:pb-0">
            {bhkPills.map((tab) => {
              const isActive = bhk === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setBhk(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-sm'
                      : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              )
            })}

            <span className="hidden sm:block h-6 w-px bg-[#E7E0D7] shrink-0" />

            <FilterDropdown
              placeholder="Home Type"
              icon={Icons.Layers}
              value={homeType}
              options={homeTypeOptions}
              isOpen={openMenu === 'homeType'}
              onToggle={() => setOpenMenu(openMenu === 'homeType' ? null : 'homeType')}
              onChange={(v) => { setHomeType(v); closeMenu() }}
            />
            <FilterDropdown
              placeholder="Built-up Area"
              icon={Icons.Ruler}
              value={areaRange}
              options={areaOptions}
              isOpen={openMenu === 'area'}
              onToggle={() => setOpenMenu(openMenu === 'area' ? null : 'area')}
              onChange={(v) => { setAreaRange(v); closeMenu() }}
            />
            <FilterDropdown
              placeholder="Vastu Direction"
              icon={Icons.Compass}
              value={direction}
              options={directionOptions}
              isOpen={openMenu === 'direction'}
              onToggle={() => setOpenMenu(openMenu === 'direction' ? null : 'direction')}
              onChange={(v) => { setDirection(v); closeMenu() }}
            />
            <CityDropdown
              value={city}
              open={openMenu === 'city'}
              onToggle={() => setOpenMenu(openMenu === 'city' ? null : 'city')}
              onSelect={(v) => { setCity(v); closeMenu() }}
              cities={availableCities}
            />
          </div>
        </div>

        {/* Backdrop closes any open dropdown */}
        {openMenu && (
          <div className="fixed inset-0 z-40" aria-hidden="true" onClick={closeMenu} />
        )}
        {openMenu === 'city' && (
          <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" aria-hidden="true" onClick={closeMenu} />
        )}

        {filtered.length === 0 ? (
          <DesignEmptyState
            message="No house plans match these filters"
            onClear={clearAll}
          />
        ) : (
          <>
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollPlans(-1)}
                aria-label="Previous house plans"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:border-[#E76F2E] hover:bg-[#E76F2E] hover:text-white active:scale-95"
              >
                <Icons.ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollPlans(1)}
                aria-label="Next house plans"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:border-[#E76F2E] hover:bg-[#E76F2E] hover:text-white active:scale-95"
              >
                <Icons.ChevronRight size={16} />
              </button>
            </div>

            <div
              ref={trackRef}
              className="mt-3 flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
            >
              {filtered.map((project) => (
                <DesignImageCard
                  key={project.id}
                  dataSlide
                  aesthetic
                  className="w-[88%] shrink-0 snap-start sm:w-[53%] md:w-[42%] lg:w-[34%] xl:w-[32%]"
                  image={project.image}
                  alt={project.title}
                  title={project.title}
                  description={project.plotDetails ?? 'Complete architectural working drawing with structural reinforcement, electrical & plumbing CAD sets.'}
                  meta={
                    <>
                      <span className="rounded border border-white/10 bg-[#FFF6E8]/20 px-2 py-0.5 text-white/90">
                        {project.size}
                      </span>
                      <span className="text-white/60">•</span>
                      <span className="text-white/90">{project.bhk}</span>
                      {project.area && (
                        <>
                          <span className="text-white/60">•</span>
                          <span className="text-white/80">{project.area}</span>
                        </>
                      )}
                    </>
                  }
                  actionIcon={<Icons.Blueprint size={14} />}
                  actionLabel="View Blueprint"
                  onAction={() => onOpenConsult(`Plan: ${project.title} (${project.size})`)}
                />
              ))}
            </div>
          </>
        )}

        {/* Active filter summary + Clear Filters */}
        {hasActiveFilters && (
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#54504A]">Active filters:</span>
            {chips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#E7E0D7] bg-white px-3 py-1.5 text-[11px] font-bold text-[#292826] transition hover:border-[#E76F2E] hover:text-[#E76F2E]"
              >
                {chip.label}
                <Icons.Close size={11} />
              </button>
            ))}
            <button
              type="button"
              onClick={clearAll}
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-[#E76F2E] bg-[#FFF6E8] px-3.5 py-1.5 text-[11px] font-bold text-[#E76F2E] transition hover:bg-[#E76F2E] hover:text-white"
            >
              <Icons.Close size={11} />
              Clear Filters
            </button>
          </div>
        )}

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
    </div>
  )
}