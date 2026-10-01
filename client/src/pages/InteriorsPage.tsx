import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { interiorCategories } from '../lib/data'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'

interface InteriorsPageProps {
  onOpenConsult: (room?: string) => void
}

const roomFilterPills = [
  'All Rooms',
  'Modular Kitchen',
  'Living Room',
  'Master Bedroom',
  'Pooja Room',
  'Wardrobe & Storage',
]

export default function InteriorsPage({ onOpenConsult }: InteriorsPageProps) {
  const [selectedRoom, setSelectedRoom] = useState('All Rooms')

  useSeoMeta({
    title: 'Luxury Interior Designs & Modular Kitchens for Indian Homes | Indore House Makers',
    description: 'Explore curated Indian interior designs including modular kitchens, living room TV units, master bedroom suites, pooja mandirs, and custom wardrobes.',
    canonicalUrl: 'https://indorehousemakers.in/interiors',
  })

  const filteredItems = useMemo(() => {
    if (selectedRoom === 'All Rooms') return interiorCategories
    return interiorCategories.filter((item) =>
      item.title.toLowerCase().includes(selectedRoom.toLowerCase())
    )
  }, [selectedRoom])

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Interiors</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="container-content pt-8 pb-6 sm:pt-10 sm:pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C94F36] block mb-1.5">
          INTERIOR DESIGN STUDIO
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#292725] tracking-tight leading-tight">
          Luxury Interior Designs for Indian Homes
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-2xl leading-relaxed">
          From German modular kitchens and space-saving wardrobes to Vastu-compliant pooja mandirs and acoustically treated home theatres.
        </p>

        {/* Room Filter Pills */}
        <div className="mt-6 pt-5 border-t border-[#E7E0D7] flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {roomFilterPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setSelectedRoom(pill)}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                selectedRoom === pill
                  ? 'bg-[#C94F36] text-white border-[#C94F36] shadow-xs'
                  : 'bg-white text-[#54504A] border-[#E7E0D7] hover:border-[#C94F36] hover:text-[#292826]'
              }`}
            >
              {pill}
            </button>
          ))}
          {selectedRoom !== 'All Rooms' && (
            <button
              type="button"
              onClick={() => setSelectedRoom('All Rooms')}
              className="shrink-0 text-xs font-bold text-[#C94F36] hover:underline px-2.5 py-1.5 ml-auto"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {/* Interiors Grid - Compact 4-column */}
      <div className="container-content pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filteredItems.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-xl border border-[#E7E0D7] overflow-hidden flex flex-col group transition hover:border-[#C94F36]/50 shadow-xs hover:shadow-sm"
            >
              <div
                className="relative aspect-[16/11] overflow-hidden bg-[#FAF8F5] cursor-pointer"
                onClick={() => onOpenConsult(`Interior Design: ${item.title}`)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.items && (
                  <div className="absolute top-2.5 left-2.5 bg-[#292826]/90 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-xs">
                    {item.items}
                  </div>
                )}
              </div>
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-bold text-sm sm:text-base text-[#292826] group-hover:text-[#C94F36] transition line-clamp-1">
                    {item.title}
                  </h2>
                  <p className="mt-1.5 text-[11px] sm:text-xs text-[#54504A] leading-relaxed line-clamp-2">
                    {item.text}
                  </p>
                </div>
                <div className="mt-3.5 pt-3 border-t border-[#EEE9E3] flex items-center justify-between">
                  <span className="text-[11px] text-[#74706A] font-medium">3D Interior Plan</span>
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Interior Design: ${item.title}`)}
                    className="text-xs font-bold text-[#C94F36] hover:text-[#B33E26] flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Request Details</span>
                    <Icons.ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
