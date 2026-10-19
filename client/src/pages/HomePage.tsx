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
  const [loadProofFold, setLoadProofFold] = useState(false)
  const [loadStudioFold, setLoadStudioFold] = useState(false)
  const [loadDeepFold, setLoadDeepFold] = useState(false)

  const [heroSentinelEl, setHeroSentinelEl] = useState<HTMLDivElement | null>(null)
  const [proofSentinelEl, setProofSentinelEl] = useState<HTMLDivElement | null>(null)
  const [studioSentinelEl, setStudioSentinelEl] = useState<HTMLDivElement | null>(null)

  useSeoMeta({
    title: 'House Plans, 3D Front Elevations & Interior Designs for Indian Homes | Indore House Makers',
    description: 'Discover 12,000+ 100% Vastu-compliant Indian house plans, photorealistic 3D front elevations, luxury modular interior designs, and construction cost estimates across 60+ Indian cities. GHMC, BBMP & DDA compliant.',
    keywords: 'house plans India, 30x50 house plan, 20x40 floor plan, 3D front elevation design, Indian house designs, duplex house plan, Vastu approved house plans, modular kitchen designs, turnkey construction cost estimator, GHMC BBMP setback rules',
    canonicalUrl: 'https://indorehousemakers.in/',
  })

  // Tier 1 -> Tier 2 (Proof Fold): On user interaction, Hero scroll, or gentle idle fallback (4.5s)
  useEffect(() => {
    let idleHandle: any = null
    let fallbackTimer: any = null

    const activateProof = () => setLoadProofFold(true)

    const onUserInteract = () => {
      activateProof()
      window.removeEventListener('scroll', onUserInteract)
      window.removeEventListener('touchstart', onUserInteract)
      window.removeEventListener('pointerdown', onUserInteract)
      window.removeEventListener('keydown', onUserInteract)
    }

    window.addEventListener('scroll', onUserInteract, { passive: true, once: true })
    window.addEventListener('touchstart', onUserInteract, { passive: true, once: true })
    window.addEventListener('pointerdown', onUserInteract, { passive: true, once: true })
    window.addEventListener('keydown', onUserInteract, { passive: true, once: true })

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      idleHandle = (window as any).requestIdleCallback(activateProof, { timeout: 4500 })
    } else {
      fallbackTimer = setTimeout(activateProof, 4000)
    }

    return () => {
      if (idleHandle && 'cancelIdleCallback' in window) (window as any).cancelIdleCallback(idleHandle)
      if (fallbackTimer) clearTimeout(fallbackTimer)
      window.removeEventListener('scroll', onUserInteract)
      window.removeEventListener('touchstart', onUserInteract)
      window.removeEventListener('pointerdown', onUserInteract)
      window.removeEventListener('keydown', onUserInteract)
    }
  }, [])

  // Hero bottom sentinel observer (loads Proof fold 300px before user reaches bottom of Hero)
  useEffect(() => {
    if (!heroSentinelEl || loadProofFold) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadProofFold(true)
          observer.disconnect()
        }
      },
      { rootMargin: '300px 0px' }
    )
    observer.observe(heroSentinelEl)
    return () => observer.disconnect()
  }, [heroSentinelEl, loadProofFold])

  // Tier 2 -> Tier 3 (Studio Fold): Triggered 350px before user reaches DesignStudio
  useEffect(() => {
    if (!loadProofFold || !proofSentinelEl || loadStudioFold) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadStudioFold(true)
          observer.disconnect()
        }
      },
      { rootMargin: '350px 0px' }
    )
    observer.observe(proofSentinelEl)
    return () => observer.disconnect()
  }, [loadProofFold, proofSentinelEl, loadStudioFold])

  // Tier 3 -> Tier 4 (Deep Fold): Triggered 450px before user reaches Cost Calculator & lower sections
  useEffect(() => {
    if (!loadStudioFold || !studioSentinelEl || loadDeepFold) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setLoadDeepFold(true)
          observer.disconnect()
        }
      },
      { rootMargin: '450px 0px' }
    )
    observer.observe(studioSentinelEl)
    return () => observer.disconnect()
  }, [loadStudioFold, studioSentinelEl, loadDeepFold])

  return (
    <div>
      {/* 1. Critical Above-the-Fold Hero Section (Instant FCP & LCP with 0ms TBT) */}
      <Hero onCalculate={onCalculateEstimate} />
      <div ref={setHeroSentinelEl} className="h-px w-full pointer-events-none" aria-hidden="true" />

      {/* 2. Tier 2: Proof & Authority Fold (Media Spotlight, Counter, About Nivaas) */}
      {loadProofFold && (
        <Suspense fallback={<div className="min-h-[140px] bg-transparent" />}>
          <div className="content-auto">
            {/* Media Coverage & Credibility Spotlight */}
            <MediaSpotlight />

            {/* Trusted Numbers & Scale */}
            <StatsCounter />

            {/* Value Proposition & Comparison */}
            <AboutNivaas />
          </div>

          <div ref={setProofSentinelEl} className="h-px w-full pointer-events-none" aria-hidden="true" />
        </Suspense>
      )}

      {/* 3. Tier 3: Interactive Architecture & Engineering Studio (Plans, Elevations, Services) */}
      {loadStudioFold && (
        <Suspense fallback={<div className="min-h-[160px] bg-transparent" />}>
          <div className="content-auto">
            {/* Interactive Design Studio (House Plans | 3D Elevations | Interiors) */}
            <DesignStudio onOpenConsult={onOpenConsult} />

            {/* How NIVAAS Works (4-Step Journey) */}
            <HowItWorks onOpenConsult={onOpenConsult} />

            {/* Commercial & Mixed-Use Designs */}
            <CommercialDesigns onOpenConsult={onOpenConsult} />

            {/* Architectural, Structural, MEP & PMC Services */}
            <Services onOpenConsult={onOpenConsult} />
          </div>

          <div ref={setStudioSentinelEl} className="h-px w-full pointer-events-none" aria-hidden="true" />
        </Suspense>
      )}

      {/* 4. Tier 4: Deep Conversion & Discovery Fold (Estimator, Contractors, Reviews, FAQ, Contact) */}
      {loadDeepFold && (
        <Suspense fallback={<div className="min-h-[160px] bg-transparent" />}>
          <div className="content-auto">
            {/* Interactive Detailed Cost Estimator */}
            <CostCalculator onOpenConsult={onOpenConsult} />

            {/* One-Stop Turnkey Construction & Financial Ecosystem */}
            <OneStop onOpenConsult={onOpenConsult} />

            {/* Verified Contractors & Trades Grid */}
            <ContractorGrid onOpenConsult={onOpenConsult} />

            {/* Client Reviews & Testimonials */}
            <Reviews />

            {/* Pan-India Completed Projects Proof */}
            <ProjectCompleted />
          </div>

          <div className="content-auto">
            {/* Architecture & Vastu Guides */}
            <Blogs onOpenConsult={onOpenConsult} />

            {/* Quick Answers & Frequently Asked Questions */}
            <QuickAnswers onOpenConsult={onOpenConsult} />
            <FAQ onOpenConsult={() => onOpenConsult('FAQ Architect Consultation')} />

            {/* Contact & Enquiry Form */}
            <Contact />

            {/* Mobile App CTA */}
            <AppCta />

            {/* Achievements & Ventures */}
            <Achievements />
          </div>
        </Suspense>
      )}
    </div>
  )
}
