import { Link } from 'react-router-dom'
import FAQ from '../components/FAQ'
import QuickAnswers from '../components/QuickAnswers'
import { useSeoMeta } from '../components/useSeoMeta'

interface FaqPageProps {
  onOpenConsult: (query?: string) => void
}

export default function FaqPage({ onOpenConsult }: FaqPageProps) {
  useSeoMeta({
    title: 'Frequently Asked Questions & Help Center | NIVAAS',
    description: 'Find clear answers on house blueprint revisions, municipal approvals, Vastu compliance, online architecture fees, and contractor hiring.',
    canonicalUrl: 'https://indorehousemakers.in/faq',
  })

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Help &amp; FAQs</span>
          </nav>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <QuickAnswers onOpenConsult={onOpenConsult} />
        <FAQ onOpenConsult={onOpenConsult} />
      </div>
    </div>
  )
}
