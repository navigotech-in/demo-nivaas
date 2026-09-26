import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import MediaSpotlight from './components/MediaSpotlight'
import StatsCounter from './components/StatsCounter'
import AboutNivaas from './components/AboutNivaas'
import DesignStudio from './components/DesignStudio'
import CommercialDesigns from './components/CommercialDesigns'
import HowItWorks from './components/HowItWorks'
import Services from './components/Services'
import OneStop from './components/OneStop'
import CostCalculator from './components/CostCalculator'
import ContractorGrid from './components/ContractorGrid'
import Reviews from './components/Reviews'
import ProjectCompleted from './components/ProjectCompleted'
import Blogs from './components/Blogs'
import QuickAnswers from './components/QuickAnswers'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
import AppCta from './components/AppCta'
import Achievements from './components/Achievements'
import Footer from './components/Footer'
import ConsultModal from './components/ConsultModal'
import LoginModal from './components/LoginModal'
import EstimateModal from './components/EstimateModal'
import WhatsAppWidget from './components/WhatsAppWidget'

function App() {
  const [consultOpen, setConsultOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [estimateOpen, setEstimateOpen] = useState(false)
  const [selectedRequirement, setSelectedRequirement] = useState<string | undefined>()
  const [selectedPlanDetails, setSelectedPlanDetails] = useState<string | undefined>()

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
    <div className="min-h-screen bg-base text-ink font-body selection:bg-[#292826] selection:text-white">
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
      />

      {/* Main Content Sections */}
      <main>
        {/* 1. Hero Section with Quick Instant Calculator */}
        <Hero onCalculate={handleCalculateEstimate} />

        {/* 2. Media Coverage & Credibility Spotlight */}
        <MediaSpotlight />

        {/* 3. Trusted Numbers & Scale */}
        <StatsCounter />

        {/* 4. Value Proposition & Comparison */}
        <AboutNivaas />

        {/* 5. Interactive Design Studio (House Plans | 3D Elevations | Interiors) */}
        <DesignStudio onOpenConsult={handleOpenConsult} />

        {/* 6. Commercial & Mixed-Use Designs (Standalone Section) */}
        <CommercialDesigns onOpenConsult={handleOpenConsult} />

        {/* 7. How NIVAAS Works (Pattern Breaker: 4-Step Journey) */}
        <HowItWorks onOpenConsult={handleOpenConsult} />

        {/* 8. Architectural, Structural, MEP & PMC Services */}
        <Services onOpenConsult={handleOpenConsult} />

        {/* 9. One-Stop Turnkey Construction & Financial Ecosystem */}
        <OneStop onOpenConsult={handleOpenConsult} />

        {/* 10. Interactive Detailed Cost Estimator */}
        <CostCalculator onOpenConsult={handleOpenConsult} />

        {/* 11. Verified Contractors & Trades Grid */}
        <ContractorGrid />

        {/* 12. Client Reviews & Video Testimonials */}
        <Reviews />

        {/* 13. Pan-India Completed Projects Proof */}
        <ProjectCompleted />

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
      </main>

      {/* Global Footer with Newsletter */}
      <Footer />

      {/* Floating WhatsApp & Help Widget */}
      <WhatsAppWidget onOpenConsult={handleOpenConsult} />

      {/* Modals */}
      <ConsultModal
        isOpen={consultOpen}
        onClose={() => setConsultOpen(false)}
        initialRequirement={selectedRequirement}
        initialPlanDetails={selectedPlanDetails}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
      />

      <EstimateModal
        isOpen={estimateOpen}
        onClose={() => setEstimateOpen(false)}
        onBookConsult={handleBookConsultFromEstimate}
        data={estimateData}
      />
    </div>
  )
}

export default App