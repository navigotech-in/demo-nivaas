import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { elevations } from '../lib/data'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'

interface DesignsPageProps {
  onOpenConsult: (designTitle?: string) => void
}

const styleFilterPills = [
  'All Styles',
  'Modern Duplex',
  'Kerala Traditional',
  'Multi-Storey Floors',
  'Courtyard Haveli',
]

export default function DesignsPage({ onOpenConsult }: DesignsPageProps) {
  const [selectedStyle, setSelectedStyle] = useState('All Styles')

  useSeoMeta({
    title: '3D Front Elevations & Architectural Facade Designs | NIVAAS',
    description: 'Discover photorealistic 3D front elevations for Indian homes. Modern contemporary duplexes, Kerala pitched roofs, classical villas and Rajasthani havelis.',
    canonicalUrl: 'https://indorehousemakers.in/designs',
  })

  const filteredDesigns = useMemo(() => {
    if (selectedStyle === 'All Styles') return elevations
    return elevations.filter(
      (e) => e.title.toLowerCase().includes(selectedStyle.toLowerCase()) || (e.badge && e.badge.toLowerCase().includes(selectedStyle.toLowerCase()))
    )
  }, [selectedStyle])

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Designs &amp; Elevations</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="container-content pt-8 pb-6 sm:pt-10 sm:pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C94F36] block mb-1.5">
          3D FRONT ELEVATIONS &amp; FACADES
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#292725] tracking-tight leading-tight">
          Photorealistic 3D Front Elevation Designs
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-2xl leading-relaxed">
          Premium exterior styling with accurate material textures, ambient LED illumination profiles, CNC jaali screens and climate-responsive shading.
        </p>

        {/* Style Filter Pills */}
        <div className="mt-6 pt-5 border-t border-[#E7E0D7] flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {styleFilterPills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setSelectedStyle(pill)}
              className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer border ${
                selectedStyle === pill
                  ? 'bg-[#C94F36] text-white border-[#C94F36] shadow-xs'
                  : 'bg-white text-[#54504A] border-[#E7E0D7] hover:border-[#C94F36] hover:text-[#292826]'
              }`}
            >
              {pill}
            </button>
          ))}
          {selectedStyle !== 'All Styles' && (
            <button
              type="button"
              onClick={() => setSelectedStyle('All Styles')}
              className="shrink-0 text-xs font-bold text-[#C94F36] hover:underline px-2.5 py-1.5 ml-auto"
            >
              Show all
            </button>
          )}
        </div>
      </div>

      {/* Designs Grid */}
      <div className="container-content pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDesigns.map((item) => (
            <article
              key={item.id}
              className="bg-white rounded-lg border border-[#E7E0D7] overflow-hidden flex flex-col group transition hover:border-[#C94F36]/50 shadow-xs"
            >
              <div
                className="relative aspect-[4/3] overflow-hidden bg-[#FAF8F5] cursor-pointer"
                onClick={() => onOpenConsult(`3D Elevation: ${item.title}`)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.badge && (
                  <div className="absolute top-3 left-3 bg-[#292826]/90 text-white text-[10px] font-bold px-2.5 py-1 rounded backdrop-blur-xs">
                    {item.badge}
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-[#292826] group-hover:text-[#C94F36] transition">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-xs text-[#54504A] leading-relaxed line-clamp-3">
                    {item.text}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.homeTypes.map((ht) => (
                      <span key={ht} className="text-[10px] bg-[#FAF8F5] border border-[#E7E0D7] px-2 py-0.5 rounded text-[#54504A] font-medium">
                        {ht}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-3.5 border-t border-[#EEE9E3] flex items-center justify-between">
                  <span className="text-xs text-[#74706A] font-medium">Full 3D Elevation Package</span>
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`3D Elevation: ${item.title}`)}
                    className="text-xs font-bold text-[#C94F36] hover:text-[#B33E26] flex items-center gap-1 transition cursor-pointer"
                  >
                    <span>Request 3D Views</span>
                    <Icons.ChevronRight size={14} />
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
