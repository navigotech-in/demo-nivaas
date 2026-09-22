import { useState } from 'react'
import Nav from './components/Nav'
import Hero from './components/Hero'
import MediaSpotlight from './components/MediaSpotlight'
import Projects from './components/Projects'
import Elevations from './components/Elevations'
import TrendingPlans from './components/TrendingPlans'
import Interiors from './components/Interiors'
import Services from './components/Services'
import CostCalculator from './components/CostCalculator'
import Reviews from './components/Reviews'
import Blogs from './components/Blogs'
import FAQ from './components/FAQ'
import Contact from './components/Contact'
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
    <div className="min-h-screen bg-base text-ink font-body selection:bg-slate-950 selection:text-white">
      <a
        href="#plans"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-slate-900 focus:px-4 focus:py-2 focus:text-white"
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
        {/* Hero Section with Interactive Calculator */}
        <Hero onCalculate={handleCalculateEstimate} />

        {/* Media Coverage & Credibility Spotlight */}
        <MediaSpotlight />

        {/* House Plans Catalog */}
        <Projects onOpenConsult={handleOpenConsult} />

        {/* 3D Elevations Facade Showcase */}
        <Elevations onOpenConsult={handleOpenConsult} />

        {/* Trending Categories (By Area, BHK, Direction, Location) */}
        <TrendingPlans onOpenConsult={handleOpenConsult} />

        {/* Interior Design by Room */}
        <Interiors onOpenConsult={handleOpenConsult} />

        {/* Architectural, Structural & PMC Services */}
        <Services onOpenConsult={handleOpenConsult} />

        {/* Interactive Construction Cost Estimator */}
        <CostCalculator onOpenConsult={handleOpenConsult} />

        {/* Client Reviews & Video Testimonials */}
        <Reviews />

        {/* Architecture & Vastu Guides */}
        <Blogs onOpenConsult={handleOpenConsult} />

        {/* Frequently Asked Questions */}
        <FAQ onOpenConsult={() => handleOpenConsult('FAQ Architect Consultation')} />

        {/* Contact & Enquiry Form */}
        <Contact />
      </main>

      {/* Global Footer */}
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