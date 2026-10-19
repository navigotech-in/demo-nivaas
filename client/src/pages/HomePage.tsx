import { useState, useEffect, useRef, lazy, Suspense } from 'react'
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
  const [loadNearFold, setLoadNearFold] = useState(false)
  const [loadDeepFold, setLoadDeepFold] = useState(false)
  const deepSentinelRef = useRef<HTMLDivElement>(null)

  useSeoMeta({
    title: 'House Plans, 3D Front Elevations & Interior Designs for Indian Homes | Indore House Makers',
    description: 'Discover 12,000+ 100% Vastu-compliant Indian house plans, photorealistic 3D front elevations, luxury modular interior designs, and construction cost estimates across 60+ Indian cities. GHMC, BBMP & DDA compliant.',
    keywords: 'house plans India, 30x50 house plan, 20x40 floor plan, 3D front elevation design, Indian house designs, duplex house plan, Vastu approved house plans, modular kitchen designs, turnkey construction cost estimator, GHMC BBMP setback rules',
    canonicalUrl: 'https://indorehousemakers.in/',
  })

  // Phase 1 -> Phase 2: Load near-fold components after initial render settles or on user interaction
  useEffect(() => {
    let idleHandle: any = null
    let timer: any = null

    const activateNearFold = () => setLoadNearFold(true)

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = (window as any).requestIdleCallback(activateNearFold, { timeout: 1200 })
    } else {
      timer = setTimeout(activateNearFold, 500)
    }

    const onUserInteract = () => {
      setLoadNearFold(true)
      window.removeEventListener('scroll', onUserInteract)
      window.removeEventListener('touchstart', onUserInteract)
    }
    window.addEventListener('scroll', onUserInteract, { passive: true, once: true })
    window.addEventListener('touchstart', onUserInteract, { passive: true, once: true })

    return () => {
      if (idleHandle && 'cancelIdleCallback' in window) (window as any).cancelIdleCallback(idleHandle)
      if (timer) clearTimeout(timer)
      window.removeEventListener('scroll', onUserInteract)
      window.removeEventListener('touchstart', onUserInteract)
    }
  }, [])

  // Phase 2 -> Phase 3: Load deep below-the-fold components when approaching middle of page or after delay
  useEffect(() => {
    if (!loadNearFold) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadDeepFold(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' }
    )

    if (deepSentinelRef.current) {
      observer.observe(deepSentinelRef.current)
    }

    const fallbackTimer = setTimeout(() => setLoadDeepFold(true), 3000)

    return () => {
      observer.disconnect()
      clearTimeout(fallbackTimer)
    }
  }, [loadNearFold])

  return (
    <main>
      {/* 1. Critical Above-the-Fold Hero Section (Instant FCP & LCP) */}
      <Hero onCalculate={onCalculateEstimate} />

      {/* 2. Near-Fold Components (Media Spotlight, Counter, About, Design Studio, Services) */}
      {loadNearFold && (
        <Suspense fallback={<div className="min-h-[160px] bg-transparent" />}>
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
          </div>

          {/* Sentinel element to trigger deep fold loading 600px ahead */}
          <div ref={deepSentinelRef} className="h-1 w-full" aria-hidden="true" />
        </Suspense>
      )}

      {/* 3. Deep-Fold Components (Estimator, Contractors, Reviews, Blogs, FAQ, Contact) */}
      {loadDeepFold && (
        <Suspense fallback={<div className="min-h-[160px] bg-transparent" />}>
          <div className="content-auto">
            {/* 9. Interactive Detailed Cost Estimator */}
            <CostCalculator onOpenConsult={onOpenConsult} />

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
