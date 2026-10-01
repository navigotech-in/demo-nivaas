import { Link } from 'react-router-dom'
import CostCalculator from '../components/CostCalculator'
import { useSeoMeta } from '../components/useSeoMeta'

interface CostEstimatorPageProps {
  onOpenConsult: (details?: string) => void
}

export default function CostEstimatorPage({ onOpenConsult }: CostEstimatorPageProps) {
  useSeoMeta({
    title: 'House Construction Cost Calculator (2026 Rates) | Indore House Makers',
    description: 'Calculate realistic Indian home construction costs based on plot area, floors, material quality & city. Instant breakdown for civil, finishing, MEP & architectural drawings.',
    canonicalUrl: 'https://indorehousemakers.in/cost-estimator',
  })

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Cost Estimator</span>
          </nav>
        </div>
      </div>

      <div className="pt-4">
        <CostCalculator onOpenConsult={onOpenConsult} />
      </div>
    </div>
  )
}
