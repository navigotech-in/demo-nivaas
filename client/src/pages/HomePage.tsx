import { useState, useEffect, lazy, Suspense } from 'react'
import Hero from '../components/Hero'
import { useSeoMeta } from '../components/useSeoMeta'

const MediaSpotlight = lazy(() => import('../components/MediaSpotlight'))
const StatsCounter = lazy(() => import('../components/StatsCounter'))
const AboutNivaas = lazy(() => import('../components/AboutNivaas'))
const DesignStudio = lazy(() => import('../components/DesignStudio'))
const CommercialDesigns = lazy(() => import('../components/CommercialDesigns'))
const HowItWorks = lazy(() => import('../components/HowItWorks'))
const Services = lazy(() => import('../components/Services'))
const OneStop = lazy(() => import('../components/OneStop'))
const CostCalculator = lazy(() => import('../components/CostCalculator'))
const ContractorGrid = lazy(() => import('../components/ContractorGrid'))
const Reviews = lazy(() => import('../components/Reviews'))
const ProjectCompleted = lazy(() => import('../components/ProjectCompleted'))
const Blogs = lazy(() => import('../components/Blogs'))
const QuickAnswers = lazy(() => import('../components/QuickAnswers'))
const FAQ = lazy(() => import('../components/FAQ'))
const Contact = lazy(() => import('../components/Contact'))
const AppCta = lazy(() => import('../components/AppCta'))
const Achievements = lazy(() => import('../components/Achievements'))

interface HomePageProps {
  onCalculateEstimate: (data: {
    serviceType: string
    depth: number
    width: number
    floors: number
    builtUpArea: number
    direction: string
  }) => void
  onOpenConsult: (details?: string) => void
}

export default function HomePage({ onCalculateEstimate, onOpenConsult }: HomePageProps) {
  const [loadBelowFold, setLoadBelowFold] = useState(false)

  useSeoMeta({
    title: 'House Plans, 3D Front Elevations & Interior Designs for Indian Homes | Indore House Makers',
    description: 'Discover 12,000+ 100% Vastu-compliant Indian house plans, photorealistic 3D front elevations, luxury modular interior designs, and construction cost estimates across 60+ Indian cities. GHMC, BBMP & DDA compliant.',
    keywords: 'house plans India, 30x50 house plan, 20x40 floor plan, 3D front elevation design, Indian house designs, duplex house plan, Vastu approved house plans, modular kitchen designs, turnkey construction cost estimator, GHMC BBMP setback rules',
    canonicalUrl: 'https://indorehousemakers.in/',
  })

  // Defer heavy below-the-fold component streaming until browser main-thread is idle
  useEffect(() => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(
        () => setLoadBelowFold(true),
        { timeout: 600 }
      )
      return () => (window as any).cancelIdleCallback(handle)
    } else {
      const timer = setTimeout(() => setLoadBelowFold(true), 150)
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <main>
      {/* 1. Critical Above-the-Fold Hero Section (Instant FCP & LCP) */}
      <Hero onCalculate={onCalculateEstimate} />

      {/* 2. Below-The-Fold Lazy Loaded Stream with Automatic Layout Containment */}
      {loadBelowFold && (
        <Suspense fallback={<div className="min-h-[200px] bg-transparent" />}>
          <div className="content-auto">
            {/* 2. Media Coverage & Credibility Spotlight */}
            <MediaSpotlight />

            {/* 3. Trusted Numbers & Scale */}
            <StatsCounter />

            {/* 4. Value Proposition & Comparison */}
            <AboutNivaas />

            {/* 5. Interactive Design Studio (House Plans | 3D Elevations | Interiors) */}
            <DesignStudio onOpenConsult={onOpenConsult} />
          </div>

          <div className="content-auto">
            {/* 6. How NIVAAS Works (4-Step Journey) */}
            <HowItWorks onOpenConsult={onOpenConsult} />

            {/* 7. Commercial & Mixed-Use Designs */}
            <CommercialDesigns onOpenConsult={onOpenConsult} />

            {/* 8. Architectural, Structural, MEP & PMC Services */}
            <Services onOpenConsult={onOpenConsult} />

            {/* 9. Interactive Detailed Cost Estimator */}
            <CostCalculator onOpenConsult={onOpenConsult} />
          </div>

          <div className="content-auto">
            {/* 10. One-Stop Turnkey Construction & Financial Ecosystem */}
            <OneStop onOpenConsult={onOpenConsult} />

            {/* 11. Verified Contractors & Trades Grid */}
            <ContractorGrid onOpenConsult={onOpenConsult} />

            {/* 12. Client Reviews & Testimonials */}
            <Reviews />

            {/* 13. Pan-India Completed Projects Proof */}
            <ProjectCompleted />
          </div>

          <div className="content-auto">
            {/* 14. Architecture & Vastu Guides */}
            <Blogs onOpenConsult={onOpenConsult} />

            {/* 15. Quick Answers & Frequently Asked Questions */}
            <QuickAnswers onOpenConsult={onOpenConsult} />
            <FAQ onOpenConsult={() => onOpenConsult('FAQ Architect Consultation')} />

            {/* 16. Contact & Enquiry Form */}
            <Contact />

            {/* 17. Mobile App CTA */}
            <AppCta />

            {/* 18. Achievements & Ventures */}
            <Achievements />
          </div>
        </Suspense>
      )}
    </main>
  )
}
