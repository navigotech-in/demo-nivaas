import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
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
  const [selectedBhk, setSelectedBhk] = useState('All')
  const [selectedArea, setSelectedArea] = useState('All Areas')
  const [selectedDirection, setSelectedDirection] = useState('All Directions')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [citySearch, setCitySearch] = useState('')
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)

  useSeoMeta({
    title: 'House Plans for Indian Plots - 2D & 3D Vastu Floor Blueprints | NIVAAS',
    description: 'Browse 12,000+ modern Indian house plans & working blueprints. Filter by 2 BHK, 3 BHK, 4 BHK, plot size, East/North Vastu direction & 60+ Indian cities.',
    canonicalUrl: 'https://indorehousemakers.in/house-plans',
  })

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return masterIndianCities.slice(0, 15)
    const q = citySearch.toLowerCase()
    return masterIndianCities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (cityAliases[c.name] && cityAliases[c.name].some((a: string) => a.toLowerCase().includes(q)))
    )
  }, [citySearch])

  const filteredProjects = useMemo(() => {
    return fallbackProjects.filter((p) => {
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
  }, [selectedBhk, selectedArea, selectedDirection, selectedCity])

  const hasActiveFilters =
    selectedBhk !== 'All' ||
    selectedArea !== 'All Areas' ||
    selectedDirection !== 'All Directions' ||
    selectedCity !== 'All Cities'

  const clearAllFilters = () => {
    setSelectedBhk('All')
    setSelectedArea('All Areas')
    setSelectedDirection('All Directions')
    setSelectedCity('All Cities')
    setCitySearch('')
    setCityDropdownOpen(false)
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

          {/* 2. Secondary Dropdowns Row: Area, Direction, City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Built-up Area */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-[#74706A] mb-1">
                Built-up Area
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                aria-label="Filter by Built-up Area"
                className="w-full bg-white border border-[#E7E0D7] rounded-lg px-3 py-2.5 text-xs text-[#292826] font-medium outline-none focus:border-[#C94F36] transition cursor-pointer"
              >
                {areaOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Vastu Direction */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-[#74706A] mb-1">
                Vastu Direction
              </label>
              <select
                value={selectedDirection}
                onChange={(e) => setSelectedDirection(e.target.value)}
                aria-label="Filter by Vastu Direction"
                className="w-full bg-white border border-[#E7E0D7] rounded-lg px-3 py-2.5 text-xs text-[#292826] font-medium outline-none focus:border-[#C94F36] transition cursor-pointer"
              >
                {directionOptions.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Major City with Searchable Input */}
            <div className="relative">
              <label className="block text-[10px] font-bold uppercase text-[#74706A] mb-1">
                Major City
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                  aria-label="Filter by Major City"
                  className="w-full bg-white border border-[#E7E0D7] rounded-lg px-3 py-2.5 text-xs text-left text-[#292826] font-medium flex items-center justify-between outline-none focus:border-[#C94F36] transition cursor-pointer"
                >
                  <span className="truncate">{selectedCity}</span>
                  <Icons.ChevronDown size={13} className="text-[#74706A]" />
                </button>

                {cityDropdownOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E7E0D7] rounded-lg shadow-lg z-50 p-2 text-xs">
                    <input
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      placeholder="Search city (e.g. Indore, Pune)…"
                      className="w-full bg-[#FAF8F5] border border-[#E7E0D7] rounded px-2.5 py-1.5 text-xs text-[#292826] outline-none focus:border-[#C94F36] mb-2"
                      autoFocus
                    />
                    <div className="max-h-48 overflow-y-auto space-y-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity('All Cities')
                          setCityDropdownOpen(false)
                        }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-[#FFF6E8] hover:text-[#C94F36] font-medium text-xs cursor-pointer"
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
                          className={`w-full text-left px-2 py-1.5 rounded hover:bg-[#FFF6E8] hover:text-[#C94F36] font-medium text-xs cursor-pointer flex items-center justify-between ${
                            selectedCity === c.name ? 'bg-[#FFF6E8] text-[#C94F36] font-bold' : 'text-[#292826]'
                          }`}
                        >
                          <span>{c.name}</span>
                          <span className="text-[10px] text-[#74706A] font-normal">{c.state}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProjects.map((plan) => (
              <article
                key={plan.id}
                className="bg-white rounded-lg border border-[#E7E0D7] overflow-hidden flex flex-col group transition hover:border-[#C94F36]/50 shadow-xs"
              >
                {/* Large Clickable House Image */}
                <div
                  className="relative aspect-[4/3] overflow-hidden bg-[#FAF8F5] cursor-pointer"
                  onClick={() => onOpenConsult(plan.title)}
                >
                  <img
                    src={plan.image}
                    alt={plan.title}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Maximum one clean badge */}
                  {plan.tag && (
                    <div className="absolute top-3 left-3 bg-[#292826]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-xs">
                      {plan.tag}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="font-display font-bold text-base sm:text-lg text-[#292826] group-hover:text-[#C94F36] transition line-clamp-1">
                      {plan.title}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#54504A]">
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
                      <p className="mt-2 text-[11px] text-[#74706A] line-clamp-2 leading-relaxed">
                        {plan.plotDetails}
                      </p>
                    )}
                  </div>

                  {/* CTA Action: Request Plan Details */}
                  <div className="mt-4 pt-3.5 border-t border-[#EEE9E3] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#292826]">
                      {plan.price || 'Custom Estimate'}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenConsult(plan.title)}
                      className="text-xs font-bold text-[#C94F36] hover:text-[#B33E26] flex items-center gap-1.5 transition cursor-pointer group-hover:translate-x-0.5"
                    >
                      <span>Request Plan Details</span>
                      <Icons.ChevronRight size={14} />
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
