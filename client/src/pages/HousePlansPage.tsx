import { useState, useMemo, useRef, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { fallbackProjects } from '../lib/data'
import { Icons } from '../components/Icons'
import { cityAliases, masterIndianCities } from '../components/useDesignCatalogFilters'
import { useSeoMeta } from '../components/useSeoMeta'

interface HousePlansPageProps {
  onOpenConsult: (planTitle?: string) => void
}

const bhkOptions = [
  { label: 'All Plans', value: 'All' },
  { label: '2 BHK', value: '2 BHK' },
  { label: '3 BHK', value: '3 BHK' },
  { label: '4 BHK', value: '4 BHK' },
  { label: '5 BHK', value: '5 BHK' },
]

const areaOptions = [
  'All Areas',
  'Under 1,000 sq.ft',
  '1,000 - 1,500 sq.ft',
  '1,500 - 2,000 sq.ft',
  '2,000 - 3,000 sq.ft',
  'Above 3,000 sq.ft',
]

const directionOptions = [
  'All Directions',
  'East Facing',
  'North Facing',
  'West Facing',
  'South Facing',
  'North-East',
]

const parseBuiltUp = (area: string) => {
  const n = parseInt(area.replace(/[^0-9]/g, ''), 10)
  return Number.isNaN(n) ? 0 : n
}

export default function HousePlansPage({ onOpenConsult }: HousePlansPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const urlQuery = searchParams.get('q') || ''
  const urlBhk = searchParams.get('bhk') || 'All'
  const urlCity = searchParams.get('city') || 'All Cities'
  const urlDirection = searchParams.get('direction') || 'All Directions'

  const [queryTerm, setQueryTerm] = useState(urlQuery)
  const [selectedBhk, setSelectedBhk] = useState(urlBhk)
  const [selectedArea, setSelectedArea] = useState('All Areas')
  const [selectedDirection, setSelectedDirection] = useState(urlDirection)
  const [selectedCity, setSelectedCity] = useState(urlCity)
  const [citySearch, setCitySearch] = useState('')
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (urlQuery !== queryTerm) setQueryTerm(urlQuery)
    if (urlBhk !== selectedBhk && urlBhk !== 'All') setSelectedBhk(urlBhk)
    if (urlCity !== selectedCity && urlCity !== 'All Cities') setSelectedCity(urlCity)
    if (urlDirection !== selectedDirection && urlDirection !== 'All Directions') setSelectedDirection(urlDirection)
  }, [urlQuery, urlBhk, urlCity, urlDirection])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false)
      }
    }
    if (cityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cityDropdownOpen])

  useSeoMeta({
    title: 'House Plans for Indian Plots - 2D & 3D Vastu Floor Blueprints | Indore House Makers',
    description: 'Browse verified modern Indian house plans & working blueprints. Filter by 2 BHK, 3 BHK, 4 BHK, plot size, East/North Vastu direction & 60+ Indian cities.',
    canonicalUrl: 'https://indorehousemakers.in/house-plans',
  })

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return masterIndianCities
    const q = citySearch.toLowerCase()
    return masterIndianCities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (cityAliases[c.name] && cityAliases[c.name].some((a: string) => a.toLowerCase().includes(q)))
    )
  }, [citySearch])

  const filteredProjects = useMemo(() => {
    return fallbackProjects.filter((p) => {
      // Query text search filter
      if (queryTerm.trim()) {
        const q = queryTerm.toLowerCase()
        const matchTitle = p.title.toLowerCase().includes(q)
        const matchDim = (p.dimension || p.size || '').toLowerCase().includes(q)
        const matchBhk = p.bhk.toLowerCase().includes(q)
        const matchCity = (p.city || '').toLowerCase().includes(q)
        const matchPlot = (p.plotDetails || '').toLowerCase().includes(q)
        const matchFacing = (p.facing || '').toLowerCase().includes(q)
        if (!matchTitle && !matchDim && !matchBhk && !matchCity && !matchPlot && !matchFacing) {
          return false
        }
      }

      // BHK filter
      if (selectedBhk !== 'All' && !p.bhk.includes(selectedBhk)) {
        return false
      }

      // Built-up Area filter
      if (selectedArea !== 'All Areas') {
        const sqft = parseBuiltUp(p.area)
        if (selectedArea === 'Under 1,000 sq.ft' && sqft >= 1000) return false
        if (selectedArea === '1,000 - 1,500 sq.ft' && (sqft < 1000 || sqft > 1500)) return false
        if (selectedArea === '1,500 - 2,000 sq.ft' && (sqft < 1500 || sqft > 2000)) return false
        if (selectedArea === '2,000 - 3,000 sq.ft' && (sqft < 2000 || sqft > 3000)) return false
        if (selectedArea === 'Above 3,000 sq.ft' && sqft <= 3000) return false
      }

      // Vastu Direction filter
      if (selectedDirection !== 'All Directions') {
        const dirPrefix = selectedDirection.split(' ')[0].toLowerCase()
        if (!p.facing.toLowerCase().includes(dirPrefix)) return false
      }

      // Major City filter
      if (selectedCity !== 'All Cities' && p.city && p.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false
      }

      return true
    })
  }, [queryTerm, selectedBhk, selectedArea, selectedDirection, selectedCity])

  const hasActiveFilters =
    Boolean(queryTerm.trim()) ||
    selectedBhk !== 'All' ||
    selectedArea !== 'All Areas' ||
    selectedDirection !== 'All Directions' ||
    selectedCity !== 'All Cities'

  const clearAllFilters = () => {
    setQueryTerm('')
    setSelectedBhk('All')
    setSelectedArea('All Areas')
    setSelectedDirection('All Directions')
    setSelectedCity('All Cities')
    setCitySearch('')
    setCityDropdownOpen(false)
    setSearchParams({})
  }

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumb Header */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">House Plans</span>
          </nav>
        </div>
      </div>

      {/* Page Title & Intro */}
      <div className="container-content pt-8 pb-6 sm:pt-10 sm:pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C94F36] block mb-1.5">
          ARCHITECTURE
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#292725] tracking-tight leading-tight">
          House Plans for Every Indian Plot
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-2xl leading-relaxed">
          Thoughtfully designed house plans for modern Indian families. Explore layouts that balance space, light and lifestyle.
        </p>

        {/* Filter Bar Toolbar */}
        <div className="mt-6 pt-5 border-t border-[#E7E0D7] space-y-3.5">
          {queryTerm && (
            <div className="flex items-center gap-2 bg-[#FFF6E8] border border-[#E76F2E]/30 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#292826] w-fit">
              <Icons.Search size={13} className="text-[#E76F2E]" />
              <span>Search: <strong>"{queryTerm}"</strong></span>
              <button
                type="button"
                onClick={() => {
                  setQueryTerm('')
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)
                    next.delete('q')
                    return next
                  })
                }}
                className="ml-1 text-[#54504A] hover:text-[#C94F36] p-0.5 rounded cursor-pointer"
                title="Clear search query"
              >
                <Icons.Close size={13} />
              </button>
            </div>
          )}

          {/* 1. BHK Filter Pills (Horizontally scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {bhkOptions.map((b) => (
              <button
                key={b.value}
                type="button"
                onClick={() => setSelectedBhk(b.value)}
                className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                  selectedBhk === b.value
                    ? 'bg-[#C94F36] text-white border-[#C94F36] shadow-xs'
                    : 'bg-white text-[#54504A] border-[#E7E0D7] hover:border-[#C94F36] hover:text-[#292826]'
                }`}
              >
                {b.label}
              </button>
            ))}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="shrink-0 text-xs font-bold text-[#C94F36] hover:underline px-2.5 py-1.5 ml-auto"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* 2. Secondary Dropdowns Row: Area, Direction, City (Side by Side on All Devices: Mobile, Tablet, Desktop) */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-3 text-xs">
            {/* Built-up Area */}
            <div className="relative min-w-0">
              <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#74706A] mb-1 truncate">
                Built-up Area
              </label>
              <div className="relative min-w-0 w-full">
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  aria-label="Filter by Built-up Area"
                  className="w-full bg-white border border-[#E7E0D7] rounded-lg pl-2 pr-5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-[#292826] font-medium outline-none focus:border-[#C94F36] transition cursor-pointer truncate appearance-none box-border"
                >
                  {areaOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-[#74706A]">
                  <Icons.ChevronDown size={11} />
                </div>
              </div>
            </div>

            {/* Vastu Direction */}
            <div className="relative min-w-0">
              <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#74706A] mb-1 truncate">
                Vastu Direction
              </label>
              <div className="relative min-w-0 w-full">
                <select
                  value={selectedDirection}
                  onChange={(e) => setSelectedDirection(e.target.value)}
                  aria-label="Filter by Vastu Direction"
                  className="w-full bg-white border border-[#E7E0D7] rounded-lg pl-2 pr-5 py-2 sm:py-2.5 text-[11px] sm:text-xs text-[#292826] font-medium outline-none focus:border-[#C94F36] transition cursor-pointer truncate appearance-none box-border"
                >
                  {directionOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-[#74706A]">
                  <Icons.ChevronDown size={11} />
                </div>
              </div>
            </div>

            {/* Major City with Searchable Input */}
            <div className="relative min-w-0">
              <label className="block text-[9px] sm:text-[10px] font-bold uppercase text-[#74706A] mb-1 truncate">
                Major City
              </label>
              <div ref={cityDropdownRef} className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  aria-label="Filter by Major City"
                  className="w-full bg-white border border-[#E7E0D7] rounded-lg px-2 sm:px-3 py-2 sm:py-2.5 text-[11px] sm:text-xs text-left text-[#292826] font-medium flex items-center justify-between outline-none focus:border-[#C94F36] transition cursor-pointer truncate box-border"
                >
                  <span className="truncate">{selectedCity}</span>
                  <Icons.ChevronDown size={11} className="text-[#74706A] shrink-0 ml-1" />
                </button>

                {/* Desktop popover - anchored right-0 to never overflow */}
                {cityDropdownOpen && (
                  <div className="hidden sm:block absolute right-0 w-64 max-w-[calc(100vw-32px)] top-full mt-1 bg-white border border-[#E7E0D7] rounded-xl shadow-xl z-50 p-2.5 text-xs animate-fadeIn">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Search city…"
                      className="w-full bg-[#FAF8F5] border border-[#E7E0D7] rounded-lg px-2.5 py-1.5 text-xs text-[#292826] outline-none focus:border-[#C94F36] mb-1.5"
                      autoFocus
                    />
                    <div className="max-h-48 overflow-y-auto space-y-0.5 no-scrollbar">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity('All Cities')
                          setCityDropdownOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#FFF6E8] hover:text-[#C94F36] font-medium text-xs cursor-pointer"
                      >
                        All Cities
                      </button>
                      {filteredCities.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSelectedCity(c.name)
                            setCityDropdownOpen(false)
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#FFF6E8] hover:text-[#C94F36] font-medium text-xs cursor-pointer flex items-center justify-between ${
                            selectedCity === c.name ? 'bg-[#FFF6E8] text-[#C94F36] font-bold' : 'text-[#292826]'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] text-[#74706A] font-normal ml-1 shrink-0">{c.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mobile Bottom Sheet for City Selection */}
                {cityDropdownOpen && (
                  <div className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-4 pb-6 shadow-2xl animate-fadeIn border-t border-[#E7E0D7]">
                    <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-[#E7E0D7]" />
                    <div className="mb-3 flex items-center justify-between border-b border-[#E7E0D7]/60 pb-2.5">
                      <h4 className="font-display text-sm font-bold text-[#292826] flex items-center gap-1.5">
                        <Icons.MapPin size={15} className="text-[#C94F36]" />
                        Select City
                      </h4>
                      <button
                        type="button"
                        onClick={() => setCityDropdownOpen(false)}
                        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-[#54504A] hover:bg-[#F5F2EC]"
                      >
                        Close <Icons.Close size={12} />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Search city…"
                      className="w-full bg-[#FAF8F5] border border-[#E7E0D7] rounded-lg px-3 py-2 text-xs text-[#292826] outline-none focus:border-[#C94F36] mb-2"
                      autoFocus
                    />
                    <div className="max-h-[45vh] overflow-y-auto space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity('All Cities')
                          setCityDropdownOpen(false)
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#FFF6E8] hover:text-[#C94F36] font-medium text-xs cursor-pointer"
                      >
                        All Cities (Reset)
                      </button>
                      {filteredCities.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setSelectedCity(c.name)
                            setCityDropdownOpen(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg hover:bg-[#FFF6E8] hover:text-[#C94F36] font-medium text-xs cursor-pointer flex items-center justify-between ${
                            selectedCity === c.name ? 'bg-[#FFF6E8] text-[#C94F36] font-bold' : 'text-[#292826]'
                          }`}
                        >
                          <span className="truncate">{c.name}</span>
                          <span className="text-[10px] text-[#74706A] font-normal ml-1 shrink-0">{c.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid: 3-column desktop, 2-column tablet, 1-column mobile */}
      <div className="container-content pb-16">
        {filteredProjects.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-lg border border-[#E7E0D7] p-8">
            <div className="h-12 w-12 rounded-full bg-[#FFF6E8] text-[#C94F36] flex items-center justify-center mx-auto mb-3">
              <Icons.Blueprint size={24} />
            </div>
            <h3 className="font-bold text-base text-[#292826]">No house plans match these filters</h3>
            <p className="text-xs text-[#74706A] mt-1 max-w-sm mx-auto">
              Try adjusting your BHK selection, built-up area, or city to view available floor plans.
            </p>
            <button
              type="button"
              onClick={clearAllFilters}
              className="mt-4 px-4 py-2 bg-[#C94F36] text-white text-xs font-bold rounded-lg hover:bg-[#B33E26] transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProjects.map((plan) => (
              <article
                key={plan.id}
                className="bg-white rounded-xl border border-[#E7E0D7] overflow-hidden flex flex-col group transition hover:border-[#C94F36]/50 shadow-xs hover:shadow-sm"
              >
                {/* Clickable House Image - Compact 16:11 aspect ratio */}
                <div
                  className="relative aspect-[16/11] overflow-hidden bg-[#FAF8F5] cursor-pointer"
                  onClick={() => onOpenConsult(plan.title)}
                >
                  <img
                    src={plan.image}
                    alt={plan.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Maximum one clean badge */}
                  {plan.tag && (
                    <div className="absolute top-2.5 left-2.5 bg-[#292826]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                      {plan.tag}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display font-bold text-sm sm:text-base text-[#292826] group-hover:text-[#C94F36] transition line-clamp-1">
                      {plan.title}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] sm:text-xs text-[#54504A]">
                      <span className="font-semibold text-[#292826]">{plan.dimension || plan.size}</span>
                      <span>·</span>
                      <span>{plan.bhk}</span>
                      {plan.area && (
                        <>
                          <span>·</span>
                          <span>{plan.area}</span>
                        </>
                      )}
                      {plan.city && (
                        <>
                          <span>·</span>
                          <span className="text-[#C94F36] font-medium">{plan.city}</span>
                        </>
                      )}
                    </div>
                    {plan.plotDetails && (
                      <p className="mt-1.5 text-[11px] text-[#74706A] line-clamp-2 leading-relaxed">
                        {plan.plotDetails}
                      </p>
                    )}
                  </div>

                  {/* CTA Action: Request Plan Details */}
                  <div className="mt-3 pt-3 border-t border-[#EEE9E3] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292826]">
                      {plan.price || 'Custom Estimate'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenConsult(plan.title)}
                      className="text-xs font-bold text-[#C94F36] hover:text-[#B33E26] flex items-center gap-1 transition cursor-pointer group-hover:translate-x-0.5"
                    >
                      <span>Request Details</span>
                      <Icons.ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
