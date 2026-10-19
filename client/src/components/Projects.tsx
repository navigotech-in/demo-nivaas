import { useMemo, useRef, useState, useEffect } from 'react'
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

export const homeTypeOptions = ['Compact Home', 'Duplex', 'Luxury Villa', 'Joint Family Home', 'Rental Units']
export const areaOptions = ['Under 1,500 sq.ft', '1,500 - 2,500 sq.ft', '2,500 - 3,500 sq.ft', 'Above 3,500 sq.ft']
export const directionOptions = ['East Facing', 'North Facing', 'West Facing', 'South Facing', 'North-East (Ishan)']

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
    case 'Under 1,500 sq.ft': return builtUp > 0 && builtUp <= 1500
    case '1,500 - 2,500 sq.ft': return builtUp >= 1500 && builtUp <= 2500
    case '2,500 - 3,500 sq.ft': return builtUp >= 2500 && builtUp <= 3500
    case 'Above 3,500 sq.ft': return builtUp >= 3500
    default: return true
  }
}

const homeTypeMatches = (p: Project, homeType: string) => {
  if (!homeType) return true
  const builtUp = parseBuiltUp(p.area)
  const hay = `${p.title} ${p.bhk} ${p.floors} ${p.tag ?? ''} ${(p.keyFeatures ?? []).join(' ')}`.toLowerCase()
  switch (homeType) {
    case 'Compact Home':
      return builtUp <= 1800 || p.bhk.includes('2 BHK') || /compact|narrow frontage|smart urban/.test(hay)
    case 'Duplex':
      return hay.includes('duplex') || /g\+1|g\+2/.test(hay)
    case 'Luxury Villa':
      return builtUp >= 2800 || p.bhk.includes('4 BHK') || p.bhk.includes('5 BHK') || /luxury|villa|haveli|home theatre|royal|estate/.test(hay)
    case 'Joint Family Home':
      return builtUp >= 2800 || p.bhk.includes('4 BHK') || p.bhk.includes('5 BHK') || /joint|family|estate|parent|multi-family/.test(hay)
    case 'Rental Units':
      return /rental|multi-unit|shops|commercial|high yield/.test(hay)
    default:
      return true
  }
}

const directionMatches = (facing: string, direction: string) => {
  if (!direction) return true
  const f = (facing || '').toLowerCase()
  const d = direction.toLowerCase()
  if (d.includes('east')) {
    return f.includes('east')
  }
  if (d.includes('north')) {
    return f.includes('north')
  }
  if (d.includes('west')) {
    return f.includes('west')
  }
  if (d.includes('south')) {
    return f.includes('south')
  }
  return f.includes(d.split(' ')[0])
}

interface FilterDropdownProps {
  placeholder: string
  icon: typeof Icons.Ruler
  value: string
  options: string[]
  isOpen: boolean
  onToggle: () => void
  onChange: (v: string) => void
  onClose?: () => void
  align?: 'left' | 'right'
}

function FilterDropdown({
  placeholder,
  icon: Icon,
  value,
  options,
  isOpen,
  onToggle,
  onChange,
  onClose,
  align = 'left',
}: FilterDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 220 && rect.top > 200) {
        setPlacement('top')
      } else {
        setPlacement('bottom')
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (e: globalThis.MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-label={`Filter by ${placeholder}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        className={`w-full min-w-0 box-border rounded-xl border px-3 py-2 text-xs font-semibold flex items-center justify-between text-left transition cursor-pointer select-none ${
          value
            ? 'border-[#B84718] bg-[#FFF6E8] text-[#B84718] font-bold shadow-xs'
            : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
        } ${isOpen ? 'ring-2 ring-[#E76F2E]/20 border-[#E76F2E]' : ''}`}
      >
        <span className="flex items-center gap-1.5 truncate pr-1">
          <Icon size={14} className={value ? 'text-[#B84718] shrink-0' : 'text-[#74706A] shrink-0'} />
          <span className="truncate">{value || placeholder}</span>
        </span>
        <Icons.ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#E76F2E]' : 'text-[#74706A]'
          }`}
        />
      </button>

      {/* Anchored In-Place Popup */}
      {isOpen && (
        <div
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 w-full min-w-[200px] sm:min-w-[220px] rounded-xl border border-[#E7E0D7] bg-white p-1.5 shadow-2xl animate-fadeIn max-h-56 overflow-y-auto overscroll-contain ${
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="mb-1 flex w-full items-center justify-between rounded-lg border-b border-[#E7E0D7]/60 px-3 py-2 text-xs font-semibold text-[#74706A] hover:bg-[#F5F2EC] hover:text-[#292826] transition cursor-pointer"
            >
              <span>Any {placeholder} (Clear)</span>
              <Icons.Close size={12} />
            </button>
          )}
          {options.map((opt) => {
            const active = value === opt
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onChange(opt)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-[#FFF6E8] text-[#E76F2E] font-bold'
                    : 'text-[#292826] hover:bg-[#FAF8F5] hover:text-[#E76F2E]'
                }`}
              >
                <span className="truncate">{opt}</span>
                {active && <Icons.Check size={14} className="shrink-0 text-[#E76F2E]" />}
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
    <div className="max-h-[220px] overflow-y-auto divide-y divide-[#F5F2EC]/60 overscroll-contain">
      {trimmed && !isExactMatch && (
        <button
          type="button"
          onClick={() => onSelect(trimmed)}
          className="flex w-full items-center justify-between gap-2 rounded-lg bg-[#FFF6E8] p-2 text-left text-xs font-bold text-[#E76F2E] hover:bg-[#FFEBD0] transition mb-1 cursor-pointer"
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
            className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition cursor-pointer ${
              active ? 'bg-[#FFF6E8] text-[#E76F2E] font-bold' : 'text-[#292826] hover:bg-[#FAF8F5]'
            }`}
          >
            <div className="flex flex-col truncate">
              <span className="truncate">{c.name}</span>
              {c.state && (
                <span className="text-[10px] font-normal text-[#74706A] truncate">{c.state}</span>
              )}
            </div>
            <span className={`text-[10px] font-semibold shrink-0 ${active ? 'text-[#E76F2E]' : 'text-[#74706A]'}`}>
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
  onClose,
  cities,
  resultNoun = 'plan',
  align = 'right',
}: {
  value: string
  open: boolean
  onToggle: () => void
  onSelect: (name: string) => void
  onClose?: () => void
  cities: CityOption[]
  resultNoun?: 'plan' | 'design'
  align?: 'left' | 'right'
}) {
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom')

  useEffect(() => {
    if (open) {
      setSearch('')
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        if (spaceBelow < 280 && rect.top > 260) {
          setPlacement('top')
        } else {
          setPlacement('bottom')
        }
      }
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (e: globalThis.MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose?.()
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.()
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  const query = search.trim().toLowerCase()
  const filtered = query
    ? cities.filter((c) =>
        [c.name, c.state ?? '', ...(c.aliases ?? [])].some((t) => t.toLowerCase().includes(query)),
      )
    : cities

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        type="button"
        aria-label="Filter plans by city"
        aria-expanded={open}
        onClick={onToggle}
        className={`w-full min-w-0 box-border rounded-xl border px-3 py-2 text-xs font-semibold flex items-center justify-between text-left transition cursor-pointer select-none ${
          value
            ? 'border-[#B84718] bg-[#FFF6E8] text-[#B84718] font-bold shadow-xs'
            : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
        } ${open ? 'ring-2 ring-[#E76F2E]/20 border-[#E76F2E]' : ''}`}
      >
        <span className="flex items-center gap-1.5 truncate pr-1">
          <Icons.MapPin size={14} className={value ? 'text-[#B84718] shrink-0' : 'text-[#74706A] shrink-0'} />
          <span className="truncate">{value || 'Search City'}</span>
        </span>
        <Icons.ChevronDown
          size={13}
          className={`shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-[#E76F2E]' : 'text-[#74706A]'
          }`}
        />
      </button>

      {/* Anchored In-Place Popup */}
      {open && (
        <div
          className={`absolute z-50 w-[270px] sm:w-[300px] max-w-[calc(100vw-32px)] rounded-xl border border-[#E7E0D7] bg-white p-2.5 shadow-2xl animate-fadeIn ${
            placement === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          } ${align === 'right' ? 'right-0' : 'left-0'}`}
        >
          <div className="relative mb-2">
            <Icons.Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#74706A]" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Search city name for house plans"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type city (e.g. Indore, Pune, Delhi)..."
              className="w-full rounded-lg border border-[#E7E0D7] bg-[#FAF8F5] py-2 pl-8 pr-3 text-xs font-medium text-[#292826] placeholder:text-[#9CA3AF] focus:border-[#E76F2E] focus:bg-white focus:outline-none"
            />
          </div>

          {value && (
            <button
              type="button"
              onClick={() => {
                onSelect('')
                setSearch('')
              }}
              className="mb-1.5 flex w-full items-center justify-between rounded-lg border-b border-[#E7E0D7]/60 px-2.5 py-1.5 text-xs font-semibold text-[#74706A] hover:bg-[#F5F2EC] hover:text-[#292826] transition cursor-pointer"
            >
              <span>Clear city filter</span>
              <Icons.Close size={12} />
            </button>
          )}

          <CityOptionsList
            cities={filtered}
            value={value}
            searchQuery={search}
            onSelect={(name) => {
              onSelect(name)
              onClose?.()
            }}
            resultNoun={resultNoun}
          />
        </div>
      )}
    </div>
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
  const hasActiveFilters = Boolean(
    (filters.bhk && filters.bhk !== 'All') ||
    filters.homeType ||
    filters.area ||
    filters.direction ||
    filters.city
  )

  return (
    <div className="relative z-30 mt-6 rounded-2xl border border-[#E7E0D7] bg-white p-3.5 sm:p-5 shadow-xs">
      {/* Row 1: BHK Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {bhkPills.map((tab) => {
          const isActive = (filters.bhk || 'All') === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange('bhk', tab.value)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 sm:py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-[#B84718] bg-[#B84718] text-white shadow-xs'
                  : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
              }`}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          )
        })}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => {
              onChange('bhk', 'All')
              onChange('homeType', '')
              onChange('area', '')
              onChange('direction', '')
              onChange('city', '')
              onClose()
            }}
            className="shrink-0 text-xs font-bold text-[#B84718] hover:text-[#C65320] hover:underline px-2.5 py-1 ml-auto whitespace-nowrap cursor-pointer flex items-center gap-1"
          >
            <Icons.Close size={12} />
            Clear all
          </button>
        )}
      </div>

      <div className="h-px bg-[#E7E0D7]/60 my-2.5 sm:my-3" />

      {/* Row 2: Secondary Dropdowns Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <FilterDropdown
          placeholder="Home Type"
          icon={Icons.Layers}
          value={filters.homeType}
          options={homeTypeOptions}
          isOpen={openMenu === 'homeType'}
          onToggle={() => onToggle('homeType')}
          onChange={(value) => onChange('homeType', value)}
          onClose={onClose}
          align="left"
        />
        <FilterDropdown
          placeholder="Built-up Area"
          icon={Icons.Ruler}
          value={filters.area}
          options={areaOptions}
          isOpen={openMenu === 'area'}
          onToggle={() => onToggle('area')}
          onChange={(value) => onChange('area', value)}
          onClose={onClose}
          align="left"
        />
        <FilterDropdown
          placeholder="Vastu Direction"
          icon={Icons.Compass}
          value={filters.direction}
          options={directionOptions}
          isOpen={openMenu === 'direction'}
          onToggle={() => onToggle('direction')}
          onChange={(value) => onChange('direction', value)}
          onClose={onClose}
          align="right"
        />
        <CityDropdown
          value={filters.city}
          open={openMenu === 'city'}
          onToggle={() => onToggle('city')}
          onSelect={(value) => onChange('city', value)}
          onClose={onClose}
          cities={cities}
          resultNoun="design"
          align="right"
        />
      </div>
    </div>
  )
}

let cachedProjects: Project[] | null = null
let fetchPromise: Promise<Project[]> | null = null

function useProjectsData(): Project[] {
  const [projects, setProjects] = useState<Project[]>(() => cachedProjects ?? fallbackProjects)

  useEffect(() => {
    if (cachedProjects) return
    if (!fetchPromise) {
      fetchPromise = fetchProjects()
        .then((data) => {
          cachedProjects = data && data.length > 0 ? data : fallbackProjects
          return cachedProjects
        })
        .catch(() => {
          cachedProjects = fallbackProjects
          return fallbackProjects
        })
    }
    let isMounted = true
    fetchPromise.then((data) => {
      if (isMounted) setProjects(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  return projects
}

export default function Projects({ onOpenConsult }: ProjectsProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [bhk, setBhk] = useState('All')
  const [homeType, setHomeType] = useState('')
  const [areaRange, setAreaRange] = useState('')
  const [direction, setDirection] = useState('')
  const [city, setCity] = useState('')
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null)

  const allProjects = useProjectsData()

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

  const filtered = useMemo(() => {
    // 1. Strict filter with city
    const strict = allProjects.filter((p) => {
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

    if (strict.length > 0) return strict

    // 2. If strict filtering with city yielded 0 results, fall back to matching filters without city
    // so user gets matching BHK/Area/Home Type blueprints with a friendly notice
    if (city) {
      const relaxed = allProjects.filter((p) => {
        if (bhk !== 'All' && !p.bhk.includes(bhk)) return false
        if (!homeTypeMatches(p, homeType)) return false
        if (!areaMatches(areaRange, parseBuiltUp(p.area))) return false
        if (!directionMatches(p.facing, direction)) return false
        return true
      })
      if (relaxed.length > 0) return relaxed
    }

    return []
  }, [allProjects, bhk, homeType, areaRange, direction, city])

  const isCityRelaxed = useMemo(() => {
    if (!city) return false
    const strictCount = allProjects.filter((p) => {
      if (bhk !== 'All' && !p.bhk.includes(bhk)) return false
      if (!homeTypeMatches(p, homeType)) return false
      if (!areaMatches(areaRange, parseBuiltUp(p.area))) return false
      if (!directionMatches(p.facing, direction)) return false
      if (p.city && p.city.toLowerCase() === city.toLowerCase()) return true
      const aliases = cityAliases[city] ?? [city]
      return aliases.some((a) => (p.city ?? '').toLowerCase().includes(a.toLowerCase()))
    }).length
    return strictCount === 0 && filtered.length > 0
  }, [allProjects, bhk, homeType, areaRange, direction, city, filtered.length])

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

        {/* Compact Trust & Specification Cards Bar */}
        <div className="rounded-2xl bg-white border border-[#E7E0D7] p-3 sm:p-4 shadow-2xs mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* Card 1: GHMC & BBMP Setbacks */}
            <div className="flex flex-col items-center justify-center text-center p-2 sm:p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D7] hover:border-[#E76F2E]/40 hover:bg-[#FFF6E8] transition group">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center mb-1.5 border border-[#E76F2E]/20 shadow-xs group-hover:scale-105 transition-transform">
                <Icons.ShieldCheck size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-[#292826] leading-tight">
                GHMC &amp; BBMP Setbacks
              </span>
            </div>

            {/* Card 2: 100% Vastu Approved */}
            <div className="flex flex-col items-center justify-center text-center p-2 sm:p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D7] hover:border-[#E76F2E]/40 hover:bg-[#FFF6E8] transition group">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center mb-1.5 border border-[#E76F2E]/20 shadow-xs group-hover:scale-105 transition-transform">
                <Icons.Sun size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-[#292826] leading-tight">
                100% Vastu Approved
              </span>
            </div>

            {/* Card 3: Structural CAD Sets */}
            <div className="flex flex-col items-center justify-center text-center p-2 sm:p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E0D7] hover:border-[#E76F2E]/40 hover:bg-[#FFF6E8] transition group">
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center mb-1.5 border border-[#E76F2E]/20 shadow-xs group-hover:scale-105 transition-transform">
                <Icons.Blueprint size={16} />
              </div>
              <span className="text-[10px] sm:text-xs font-extrabold text-[#292826] leading-tight">
                Structural CAD Sets
              </span>
            </div>
          </div>

          {/* Centered Custom Layout Action Button */}
          <div className="mt-3 sm:mt-3.5 flex items-center justify-center">
            <button
              type="button"
              onClick={() => onOpenConsult('Custom Architecture Consultation')}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#E76F2E] via-[#F27E3D] to-[#E76F2E] px-5 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:brightness-105 active:scale-[0.98] transition cursor-pointer"
            >
              <span>Custom Layout</span>
              <Icons.ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Single Seamless Studio Filter Bar */}
        <div className="rounded-2xl border border-[#E7E0D7] bg-white p-3.5 sm:p-5 shadow-xs mb-8">
          {/* Row 1: BHK Filter Pills (Horizontally scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {bhkPills.map((tab) => {
              const isActive = bhk === tab.value
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setBhk(tab.value)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 sm:py-2 text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'border-[#B84718] bg-[#B84718] text-white shadow-xs'
                      : 'border-[#E7E0D7] bg-white text-[#54504A] hover:border-[#C65320] hover:text-[#292826]'
                  }`}
                >
                  <tab.icon size={13} />
                  {tab.label}
                </button>
              )
            })}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAll}
                className="shrink-0 text-xs font-bold text-[#B84718] hover:text-[#C65320] hover:underline px-2.5 py-1 ml-auto whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                <Icons.Close size={12} />
                Clear all
              </button>
            )}
          </div>

          <div className="h-px bg-[#E7E0D7]/60 my-2.5 sm:my-3" />

          {/* Row 2: Secondary Dropdowns Grid (Visible overflow, anchored in place) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <FilterDropdown
              placeholder="Home Type"
              icon={Icons.Layers}
              value={homeType}
              options={homeTypeOptions}
              isOpen={openMenu === 'homeType'}
              onToggle={() => setOpenMenu(openMenu === 'homeType' ? null : 'homeType')}
              onChange={(v) => { setHomeType(v); closeMenu() }}
              onClose={closeMenu}
              align="left"
            />
            <FilterDropdown
              placeholder="Built-up Area"
              icon={Icons.Ruler}
              value={areaRange}
              options={areaOptions}
              isOpen={openMenu === 'area'}
              onToggle={() => setOpenMenu(openMenu === 'area' ? null : 'area')}
              onChange={(v) => { setAreaRange(v); closeMenu() }}
              onClose={closeMenu}
              align="left"
            />
            <FilterDropdown
              placeholder="Vastu Direction"
              icon={Icons.Compass}
              value={direction}
              options={directionOptions}
              isOpen={openMenu === 'direction'}
              onToggle={() => setOpenMenu(openMenu === 'direction' ? null : 'direction')}
              onChange={(v) => { setDirection(v); closeMenu() }}
              onClose={closeMenu}
              align="right"
            />
            <CityDropdown
              value={city}
              open={openMenu === 'city'}
              onToggle={() => setOpenMenu(openMenu === 'city' ? null : 'city')}
              onSelect={(v) => { setCity(v); closeMenu() }}
              onClose={closeMenu}
              cities={availableCities}
              resultNoun="plan"
              align="right"
            />
          </div>
        </div>

        {isCityRelaxed && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-[#E76F2E]/30 bg-[#FFF6E8] px-3.5 py-2.5 text-xs font-semibold text-[#B84718]">
            <Icons.MapPin size={15} className="shrink-0 text-[#E76F2E]" />
            <span>
              Showing verified turnkey blueprints with custom architectural engineering available for <strong>{city}</strong>.
            </span>
          </div>
        )}

        {filtered.length === 0 ? (
          <DesignEmptyState
            message="No house plans match these filters"
            onClear={clearAll}
          />
        ) : (
          <>
            <div
              ref={trackRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-none pb-2"
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

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => scrollPlans(-1)}
                aria-label="Previous house plans"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:border-[#E76F2E] hover:bg-[#E76F2E] hover:text-white active:scale-95 cursor-pointer"
              >
                <Icons.ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={() => scrollPlans(1)}
                aria-label="Next house plans"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E0D7] bg-white text-[#292826] shadow-sm transition hover:border-[#E76F2E] hover:bg-[#E76F2E] hover:text-white active:scale-95 cursor-pointer"
              >
                <Icons.ChevronRight size={16} />
              </button>
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
              className="ml-1 inline-flex items-center gap-1.5 rounded-full border border-[#B84718] bg-[#FFF6E8] px-3.5 py-1.5 text-[11px] font-bold text-[#B84718] transition hover:bg-[#B84718] hover:text-white"
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
            className="inline-flex items-center gap-2 text-sm font-bold text-[#B84718] transition hover:text-[#292826] group/link underline underline-offset-4 decoration-[#E7E0D7] hover:decoration-[#B84718]"
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