import { useMemo, useState } from 'react'

export type CatalogOpenMenu = 'bhk' | 'homeType' | 'area' | 'direction' | 'city' | null

export const cityAliases: Record<string, string[]> = {
  'Delhi NCR': ['Delhi', 'Noida', 'Gurugram', 'Gurgaon'],
  Bengaluru: ['Bangalore', 'Karnataka'],
  Hyderabad: ['Telangana', 'GHMC'],
  Pune: ['Maharashtra'],
  Jaipur: ['Rajasthan'],
  Indore: ['Madhya Pradesh'],
}

interface DesignFilterMetadata {
  bhks: number[]
  homeTypes: string[]
  builtUpAreaRange: { min: number; max: number }
  vastuDirections: string[]
  cities: string[]
}

export interface DesignFilterState {
  bhk: string
  homeType: string
  area: string
  direction: string
  city: string
}

const initialDesignFilters: DesignFilterState = {
  bhk: 'All',
  homeType: '',
  area: '',
  direction: '',
  city: '',
}

const catalogAreaRanges: Record<string, [number, number]> = {
  'Under 1,000 sq.ft': [0, 999],
  '1,000 - 1,500 sq.ft': [1000, 1500],
  '1,500 - 2,000 sq.ft': [1501, 2000],
  '2,000 - 3,000 sq.ft': [2001, 3000],
  'Above 3,000 sq.ft': [3001, Number.POSITIVE_INFINITY],
}

const catalogAreaMatches = (range: string, area: DesignFilterMetadata['builtUpAreaRange']) => {
  if (!range) return true
  const bounds = catalogAreaRanges[range]
  if (!bounds) return true
  return area.max >= bounds[0] && area.min <= bounds[1]
}

export function useDesignCatalogFilters<T extends DesignFilterMetadata>(items: readonly T[]) {
  const [filters, setFilters] = useState<DesignFilterState>({ ...initialDesignFilters })
  const [openMenu, setOpenMenu] = useState<CatalogOpenMenu>(null)

  const filtered = useMemo(() => {
    const selectedBhk = filters.bhk === 'All' ? null : Number.parseInt(filters.bhk, 10)

    return items.filter((item) => (
      (selectedBhk === null || item.bhks.includes(selectedBhk)) &&
      (!filters.homeType || item.homeTypes.includes(filters.homeType)) &&
      catalogAreaMatches(filters.area, item.builtUpAreaRange) &&
      (!filters.direction || item.vastuDirections.includes(filters.direction)) &&
      (!filters.city || item.cities.includes(filters.city))
    ))
  }, [filters, items])

  const cities = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach((item) => {
      item.cities.forEach((city) => counts.set(city, (counts.get(city) ?? 0) + 1))
    })

    return Array.from(counts, ([name, planCount]) => ({
      name,
      slug: name.toLowerCase(),
      aliases: cityAliases[name],
      planCount,
    })).sort((a, b) => b.planCount - a.planCount || a.name.localeCompare(b.name))
  }, [items])

  const setFilter = (key: keyof DesignFilterState, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setOpenMenu(null)
  }

  const toggleMenu = (menu: CatalogOpenMenu) => {
    setOpenMenu((current) => current === menu ? null : menu)
  }

  const closeMenu = () => setOpenMenu(null)

  const clearAll = () => {
    setFilters({ ...initialDesignFilters })
    setOpenMenu(null)
  }

  return {
    filters,
    filtered,
    cities,
    openMenu,
    onChange: setFilter,
    onToggle: toggleMenu,
    onClose: closeMenu,
    clearAll,
  }
}
