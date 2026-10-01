import { Link } from 'react-router-dom'
import Contact from '../components/Contact'
import { useSeoMeta } from '../components/useSeoMeta'

export default function ContactPage() {
  useSeoMeta({
    title: 'Contact Indore House Makers Architects & Consult Online | Indore & Pan-India',
    description: 'Get in touch with Indore House Makers chief architects. Book a free consultation, request custom house drawings, or visit our design studio.',
    canonicalUrl: 'https://indorehousemakers.in/contact',
  })

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Contact &amp; Consultation</span>
          </nav>
        </div>
      </div>

      <div className="pt-4">
        <Contact />
      </div>
    </div>
  )
}
