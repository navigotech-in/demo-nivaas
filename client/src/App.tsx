import { useState, lazy, Suspense } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import WhatsAppWidget from './components/WhatsAppWidget'
import { useSeoMeta } from './components/useSeoMeta'

// Code-split below-the-fold components for blazing fast initial render & 98+ Lighthouse Performance
const MediaSpotlight = lazy(() => import('./components/MediaSpotlight'))
const StatsCounter = lazy(() => import('./components/StatsCounter'))
const AboutNivaas = lazy(() => import('./components/AboutNivaas'))
const DesignStudio = lazy(() => import('./components/DesignStudio'))
const CommercialDesigns = lazy(() => import('./components/CommercialDesigns'))
const HowItWorks = lazy(() => import('./components/HowItWorks'))
const Services = lazy(() => import('./components/Services'))
const OneStop = lazy(() => import('./components/OneStop'))
const CostCalculator = lazy(() => import('./components/CostCalculator'))
const ContractorGrid = lazy(() => import('./components/ContractorGrid'))
const Reviews = lazy(() => import('./components/Reviews'))
const ProjectCompleted = lazy(() => import('./components/ProjectCompleted'))
const Blogs = lazy(() => import('./components/Blogs'))
const QuickAnswers = lazy(() => import('./components/QuickAnswers'))
const FAQ = lazy(() => import('./components/FAQ'))
const Contact = lazy(() => import('./components/Contact'))
const AppCta = lazy(() => import('./components/AppCta'))
const Achievements = lazy(() => import('./components/Achievements'))
const Footer = lazy(() => import('./components/Footer'))
const ConsultModal = lazy(() => import('./components/ConsultModal'))
const LoginModal = lazy(() => import('./components/LoginModal'))
const EstimateModal = lazy(() => import('./components/EstimateModal'))
const NivaasAiStudio = lazy(() => import('./components/NivaasAiStudio'))

function App() {
  const [consultOpen, setConsultOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [estimateOpen, setEstimateOpen] = useState(false)
  const [aiStudioOpen, setAiStudioOpen] = useState(false)
  const [aiStudioMode, setAiStudioMode] = useState<'generator' | 'chat'>('generator')
  const [selectedRequirement, setSelectedRequirement] = useState<string | undefined>()
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<string | undefined>()

  useSeoMeta({
    title: 'House Plans, 3D Front Elevations & Interior Designs for Indian Homes',
    description: 'Discover 12,000+ 100% Vastu-compliant Indian house plans, photorealistic 3D front elevations, luxury modular interior designs, and construction cost estimates across 60+ Indian cities. GHMC, BBMP & DDA compliant.',
    keywords: 'house plans India, 30x50 house plan, 20x40 floor plan, 3D front elevation design, Indian house designs, duplex house plan, Vastu approved house plans, modular kitchen designs, turnkey construction cost estimator, GHMC BBMP setback rules',
    canonicalUrl: 'https://indorehousemakers.in/',
  })

  const [estimateData, setEstimateData] = useState({
    serviceType: '2D Layout Plan',
    depth: 30,
    width: 50,
    floors: 2,
    builtUpArea: 2100,
    direction: 'East Facing',
  })

  const handleOpenConsult = (details?: string) => {
    setSelectedRequirement(undefined)
    setSelectedPlanDetails(details)
    setConsultOpen(true)
  }

  const handleOpenAiStudio = (mode: 'generator' | 'chat' = 'generator') => {
    setAiStudioMode(mode)
    setAiStudioOpen(true)
  }

  const handleCalculateEstimate = (data: {
    serviceType: string
    depth: number
    width: number
    floors: number
    builtUpArea: number
    direction: string
  }) => {
    setEstimateData(data)
    setEstimateOpen(true)
  }

  const handleBookConsultFromEstimate = (details: string) => {
    setSelectedPlanDetails(details)
    setConsultOpen(true)
  }

  return (
    <div className="min-h-screen bg-base text-ink font-body selection:bg-[#292826] selection:text-white overflow-x-hidden w-full relative">
      <a
        href="#design-studio"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-[#292826] focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      {/* Global Navigation */}
      <Nav
        onOpenConsult={() => handleOpenConsult()}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenAiStudio={() => handleOpenAiStudio('generator')}
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section with Quick Instant Calculator (Instant Critical Above Fold) */}
        <Hero onCalculate={handleCalculateEstimate} />

        {/* Below-The-Fold Lazy Loaded Stream with Automatic Layout Containment */}
        <Suspense fallback={<div className="min-h-[160px] bg-transparent" />}>
          <div className="content-auto">
            {/* 2. Media Coverage & Credibility Spotlight */}
            <MediaSpotlight />

            {/* 3. Trusted Numbers & Scale */}
            <StatsCounter />

            {/* 4. Value Proposition & Comparison */}
            <AboutNivaas />

            {/* 5. Interactive Design Studio (House Plans | 3D Elevations | Interiors) */}
            <DesignStudio onOpenConsult={handleOpenConsult} />
          </div>

          <div className="content-auto">
            {/* 6. Commercial & Mixed-Use Designs (Standalone Section) */}
            <CommercialDesigns onOpenConsult={handleOpenConsult} />

            {/* 7. How NIVAAS Works (Pattern Breaker: 4-Step Journey) */}
            <HowItWorks onOpenConsult={handleOpenConsult} />

            {/* 8. Architectural, Structural, MEP & PMC Services */}
            <Services onOpenConsult={handleOpenConsult} />

            {/* 9. One-Stop Turnkey Construction & Financial Ecosystem */}
            <OneStop onOpenConsult={handleOpenConsult} />
          </div>

          <div className="content-auto">
            {/* 10. Interactive Detailed Cost Estimator */}
            <CostCalculator onOpenConsult={handleOpenConsult} />

            {/* 11. Verified Contractors & Trades Grid */}
            <ContractorGrid onOpenConsult={handleOpenConsult} />

            {/* 12. Client Reviews & Testimonials */}
            <Reviews />

            {/* 13. Pan-India Completed Projects Proof */}
            <ProjectCompleted />
          </div>

          <div className="content-auto">
            {/* 14. Architecture & Vastu Guides */}
            <Blogs onOpenConsult={handleOpenConsult} />

            {/* 15. Quick Answers & Frequently Asked Questions */}
            <QuickAnswers onOpenConsult={handleOpenConsult} />
            <FAQ onOpenConsult={() => handleOpenConsult('FAQ Architect Consultation')} />

            {/* 16. Contact & Enquiry Form */}
            <Contact />

            {/* 17. Mobile App CTA */}
            <AppCta />

            {/* 18. Achievements & Ventures */}
            <Achievements />

            {/* Global Footer with Newsletter */}
            <Footer />
          </div>
        </Suspense>
      </main>

      {/* Floating Sticky Actions (AI Assistant + WhatsApp Support) */}
      <WhatsAppWidget
        onOpenConsult={handleOpenConsult}
        onOpenAiStudio={() => handleOpenAiStudio('generator')}
      />

      {/* Modals Loaded On-Demand */}
      <Suspense fallback={null}>
        {consultOpen && (
          <ConsultModal
            isOpen={consultOpen}
            onClose={() => setConsultOpen(false)}
            initialRequirement={selectedRequirement}
            initialPlanDetails={selectedPlanDetails}
          />
        )}

        {loginOpen && (
          <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
          />
        )}

        {estimateOpen && (
          <EstimateModal
            isOpen={estimateOpen}
            onClose={() => setEstimateOpen(false)}
            onBookConsult={handleBookConsultFromEstimate}
            data={estimateData}
          />
        )}

        {aiStudioOpen && (
          <NivaasAiStudio
            open={aiStudioOpen}
            onClose={() => setAiStudioOpen(false)}
            onOpenConsult={(planDetails) => {
              setAiStudioOpen(false)
              handleOpenConsult(planDetails)
            }}
            initialMode={aiStudioMode}
          />
        )}
      </Suspense>
    </div>
  )
}

export default App