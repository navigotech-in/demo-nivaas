import { Link } from 'react-router-dom'
import Blogs from '../components/Blogs'
import { useSeoMeta } from '../components/useSeoMeta'

interface GuidesPageProps {
  onOpenConsult: (query?: string) => void
}

export default function GuidesPage({ onOpenConsult }: GuidesPageProps) {
  useSeoMeta({
    title: 'Architecture, Vastu & Home Construction Guides | NIVAAS',
    description: 'Expert architectural insights, Indian municipal by-laws (GHMC, BBMP, DDA), Vastu tips for plot orientation, and home construction budgeting guides.',
    canonicalUrl: 'https://indorehousemakers.in/guides',
  })

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Guides &amp; Articles</span>
          </nav>
        </div>
      </div>

      <div className="pt-4">
        <Blogs onOpenConsult={onOpenConsult} />
      </div>
    </div>
  )
}
