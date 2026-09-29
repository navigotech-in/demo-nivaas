import { useMemo, useState } from 'react'

export type CatalogOpenMenu = 'bhk' | 'homeType' | 'area' | 'direction' | 'city' | null

export const masterIndianCities = [
  { name: 'Mumbai', state: 'Maharashtra', aliases: ['Bombay', 'Thane', 'Navi Mumbai', 'Kalyan', 'MCGM'] },
  { name: 'Delhi NCR', state: 'Delhi / Haryana / UP', aliases: ['Delhi', 'Noida', 'Gurugram', 'Gurgaon', 'Faridabad', 'Ghaziabad', 'Greater Noida', 'New Delhi'] },
  { name: 'Bengaluru', state: 'Karnataka', aliases: ['Bangalore', 'Whitefield', 'Electronic City', 'BBMP'] },
  { name: 'Hyderabad', state: 'Telangana', aliases: ['Secunderabad', 'Cyberabad', 'Gachibowli', 'GHMC', 'Telangana'] },
  { name: 'Pune', state: 'Maharashtra', aliases: ['PMRDA', 'PCMC', 'Hinjewadi', 'Kothrud'] },
  { name: 'Chennai', state: 'Tamil Nadu', aliases: ['Madras', 'OMR', 'Anna Nagar', 'CMDA'] },
  { name: 'Kolkata', state: 'West Bengal', aliases: ['Calcutta', 'Howrah', 'Salt Lake', 'New Town', 'KMC'] },
  { name: 'Ahmedabad', state: 'Gujarat', aliases: ['Amdavad', 'Gandhinagar', 'SG Highway', 'AMC'] },
  { name: 'Jaipur', state: 'Rajasthan', aliases: ['Pink City', 'Mansarovar', 'Vaishali Nagar', 'JDA'] },
  { name: 'Surat', state: 'Gujarat', aliases: ['Varachha', 'Vesu', 'SMC'] },
  { name: 'Lucknow', state: 'Uttar Pradesh', aliases: ['Gomti Nagar', 'Alambagh', 'LDA'] },
  { name: 'Indore', state: 'Madhya Pradesh', aliases: ['Vijay Nagar', 'Super Corridor', 'IDA'] },
  { name: 'Chandigarh', state: 'Punjab / Haryana', aliases: ['Mohali', 'Panchkula', 'Zirakpur'] },
  { name: 'Kochi', state: 'Kerala', aliases: ['Cochin', 'Ernakulam', 'Kakkanad'] },
  { name: 'Bhopal', state: 'Madhya Pradesh', aliases: ['MP Nagar', 'Arera Colony'] },
  { name: 'Nagpur', state: 'Maharashtra', aliases: ['Orange City', 'NMC'] },
  { name: 'Patna', state: 'Bihar', aliases: ['Kankarbagh', 'Boring Road'] },
  { name: 'Vadodara', state: 'Gujarat', aliases: ['Baroda', 'Alkapuri', 'VMC'] },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', aliases: ['Vizag', 'Madhurawada', 'GVMC'] },
  { name: 'Coimbatore', state: 'Tamil Nadu', aliases: ['Kovai', 'RS Puram'] },
  { name: 'Bhubaneswar', state: 'Odisha', aliases: ['BDA', 'Cuttack'] },
  { name: 'Dehradun', state: 'Uttarakhand', aliases: ['Rajpur Road', 'Mussoorie'] },
  { name: 'Agra', state: 'Uttar Pradesh', aliases: ['Taj City', 'Fatehabad Road'] },
  { name: 'Varanasi', state: 'Uttar Pradesh', aliases: ['Kashi', 'Banaras'] },
  { name: 'Nashik', state: 'Maharashtra', aliases: ['Nasik', 'Gangapur Road'] },
  { name: 'Ranchi', state: 'Jharkhand', aliases: ['Harmu', 'Morabadi'] },
  { name: 'Raipur', state: 'Chhattisgarh', aliases: ['Naya Raipur', 'Pandri'] },
  { name: 'Guwahati', state: 'Assam', aliases: ['GS Road', 'Dispur'] },
  { name: 'Mysuru', state: 'Karnataka', aliases: ['Mysore', 'Gokulam'] },
  { name: 'Vijayawada', state: 'Andhra Pradesh', aliases: ['Amaravati', 'Benz Circle'] },
  { name: 'Madurai', state: 'Tamil Nadu', aliases: ['Temple City', 'KK Nagar'] },
  { name: 'Jodhpur', state: 'Rajasthan', aliases: ['Sun City', 'Ratanada'] },
  { name: 'Thiruvananthapuram', state: 'Kerala', aliases: ['Trivandrum', 'Technopark'] },
  { name: 'Udaipur', state: 'Rajasthan', aliases: ['City of Lakes', 'Sukher'] },
  { name: 'Ludhiana', state: 'Punjab', aliases: ['Civil Lines', 'Sarabha Nagar'] },
  { name: 'Kanpur', state: 'Uttar Pradesh', aliases: ['Swaroop Nagar', 'Civil Lines'] },
  { name: 'Mangalore', state: 'Karnataka', aliases: ['Mangaluru', 'Kadri'] },
  { name: 'Goa (Panaji / Margao)', state: 'Goa', aliases: ['Panjim', 'Margao', 'Porvorim', 'Goa'] },
  { name: 'Gwalior', state: 'Madhya Pradesh', aliases: ['City Center', 'Morar'] },
  { name: 'Jabalpur', state: 'Madhya Pradesh', aliases: ['Wright Town', 'Civil Lines'] },
  { name: 'Amritsar', state: 'Punjab', aliases: ['Ranjit Avenue', 'Golden Temple Area'] },
  { name: 'Aurangabad', state: 'Maharashtra', aliases: ['Chhatrapati Sambhajinagar', 'Cidco', 'Sambhajinagar'] },
]

export const cityAliases: Record<string, string[]> = Object.fromEntries(
  masterIndianCities.map((c) => [c.name, [c.state, ...(c.aliases ?? [])]])
)

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

    return items.filter((item) => {
      if (selectedBhk !== null && !item.bhks.includes(selectedBhk)) return false
      if (filters.homeType && !item.homeTypes.includes(filters.homeType)) return false
      if (!catalogAreaMatches(filters.area, item.builtUpAreaRange)) return false
      if (filters.direction && !item.vastuDirections.includes(filters.direction)) return false
      if (filters.city) {
        // Match specific city, alias, or general Pan-India design
        if (item.cities.length > 0 && !item.cities.includes(filters.city)) {
          const aliases = cityAliases[filters.city] ?? []
          const hasAliasMatch = item.cities.some((c) =>
            aliases.some((a) => c.toLowerCase().includes(a.toLowerCase()))
          )
          if (!hasAliasMatch && item.cities.length < 5) return false
        }
      }
      return true
    })
  }, [filters, items])

  const cities = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach((item) => {
      item.cities.forEach((city) => counts.set(city, (counts.get(city) ?? 0) + 1))
    })

    // Populate all master Indian cities with their designs count
    return masterIndianCities.map((c) => ({
      name: c.name,
      slug: c.name.toLowerCase(),
      state: c.state,
      aliases: [c.state, ...(c.aliases ?? [])],
      planCount: counts.get(c.name) ?? Math.max(1, items.length),
    }))
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
