import { Link } from 'react-router-dom'
import { serviceCards, contractorTrades } from '../lib/data'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'

interface ServicesPageProps {
  onOpenConsult: (serviceTitle?: string) => void
}

export default function ServicesPage({ onOpenConsult }: ServicesPageProps) {
  useSeoMeta({
    title: 'Architectural, Structural, MEP & Contractor Services | NIVAAS',
    description: 'Comprehensive architectural services: 2D CAD working drawings, structural engineering, MEP layouts, verified contractor network, site supervision & Vastu consultation.',
    canonicalUrl: 'https://indorehousemakers.in/services',
  })

  const getServiceIcon = (id: string) => {
    switch (id) {
      case 'pmc':
        return <Icons.HardHat size={20} className="text-[#C94F36]" />
      case 'arch-consult':
        return <Icons.Compass size={20} className="text-[#C94F36]" />
      case 'site-supervision':
        return <Icons.ShieldCheck size={20} className="text-[#C94F36]" />
      case 'vastu-camp':
        return <Icons.Sun size={20} className="text-[#C94F36]" />
      case 'interior-design':
        return <Icons.Sofa size={20} className="text-[#C94F36]" />
      default:
        return <Icons.Blueprint size={20} className="text-[#C94F36]" />
    }
  }

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Services</span>
          </nav>
        </div>
      </div>

      {/* Page Header */}
      <div className="container-content pt-8 pb-6 sm:pt-10 sm:pb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C94F36] block mb-1.5">
          END-TO-END ARCHITECTURAL SOLUTIONS
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#292725] tracking-tight leading-tight">
          Architectural, Structural &amp; Engineering Services
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-2xl leading-relaxed">
          From initial 2D architectural layouts to licensed structural stability calculations, MEP drawings, and verified on-site trade execution.
        </p>
      </div>

      {/* Main Core Services Grid */}
      <div className="container-content pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCards.map((srv) => (
            <div
              key={srv.id}
              className="bg-white rounded-lg border border-[#E7E0D7] p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:border-[#C94F36]/50 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 rounded-lg bg-[#FFF6E8] border border-[#E7E0D7] flex items-center justify-center">
                    {getServiceIcon(srv.id)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C94F36] bg-[#FFF6E8] border border-[#E7E0D7] px-2 py-0.5 rounded">
                    {srv.badge}
                  </span>
                </div>
                <h2 className="font-display font-bold text-base text-[#292826] group-hover:text-[#C94F36] transition">
                  {srv.title}
                </h2>
                <p className="text-xs font-semibold text-[#C94F36] mt-0.5">{srv.tagline}</p>
                <p className="mt-2 text-xs text-[#54504A] leading-relaxed">
                  {srv.desc}
                </p>
                <div className="mt-4 pt-3 border-t border-[#EEE9E3]/80 space-y-1.5">
                  {srv.features.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 text-[11px] text-[#74706A]">
                      <Icons.Check size={12} className="text-[#C94F36] shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-[#EEE9E3]">
                <button
                  type="button"
                  onClick={() => onOpenConsult(`Service: ${srv.title}`)}
                  className="w-full py-2.5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] hover:bg-[#C94F36] hover:text-white hover:border-[#C94F36] text-xs font-bold text-[#292826] transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Book This Service</span>
                  <Icons.ChevronRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Contractor Network Section */}
      <div className="bg-[#FAF8F5] border-t border-[#E7E0D7] py-12 sm:py-16">
        <div className="container-content">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-widest text-[#C94F36] block mb-1">
              VERIFIED TRADE CONTRACTORS
            </span>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#292826] tracking-tight">
              Skilled Workers &amp; Trade Contractors Across India
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-[#54504A]">
              Vetted licensed contractors ready to execute your drawings — from foundation excavation to final painting.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {contractorTrades.map((c) => (
              <div key={c.title} className="bg-white rounded-lg border border-[#E7E0D7] p-3.5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="h-28 rounded-md overflow-hidden bg-[#FAF8F5] mb-2.5">
                    <img src={c.image} alt={c.title} className="h-full w-full object-cover" />
                  </div>
                  <h3 className="font-bold text-xs text-[#292826]">{c.title}</h3>
                  <p className="text-[10px] text-[#74706A] mt-1 leading-snug">{c.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-[#EEE9E3]">
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Contractor: ${c.title}`)}
                    className="w-full text-center text-xs font-bold text-[#C94F36] hover:underline cursor-pointer"
                  >
                    Hire Trade →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
