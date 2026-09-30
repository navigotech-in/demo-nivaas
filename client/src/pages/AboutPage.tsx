import { Link } from 'react-router-dom'
import AboutNivaas from '../components/AboutNivaas'
import StatsCounter from '../components/StatsCounter'
import MediaSpotlight from '../components/MediaSpotlight'
import Achievements from '../components/Achievements'
import { useSeoMeta } from '../components/useSeoMeta'

export default function AboutPage() {
  useSeoMeta({
    title: 'About NIVAAS - India\'s Premier AI-Powered Architecture & Design Studio',
    description: 'Learn about NIVAAS — 480+ completed house plans, certified structural engineers, and pan-India construction solutions.',
    canonicalUrl: 'https://nivaas.in/about',
  })

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">About NIVAAS</span>
          </nav>
        </div>
      </div>

      <div className="pt-4 space-y-4">
        <AboutNivaas />
        <StatsCounter />
        <MediaSpotlight />
        <Achievements />
      </div>
    </div>
  )
}
