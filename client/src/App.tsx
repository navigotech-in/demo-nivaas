import { useState, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import ResponsiveBottomNav from './components/ResponsiveBottomNav'
import WhatsAppWidget from './components/WhatsAppWidget'
import ScrollToTop from './components/ScrollToTop'

// Pages
import HomePage from './pages/HomePage'
const HousePlansPage = lazy(() => import('./pages/HousePlansPage'))
const InteriorsPage = lazy(() => import('./pages/InteriorsPage'))
const DesignsPage = lazy(() => import('./pages/DesignsPage'))
const ServicesPage = lazy(() => import('./pages/ServicesPage'))
const CostEstimatorPage = lazy(() => import('./pages/CostEstimatorPage'))
const GuidesPage = lazy(() => import('./pages/GuidesPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Global Modals Loaded On-Demand
const ConsultModal = lazy(() => import('./components/ConsultModal'))
const LoginModal = lazy(() => import('./components/LoginModal'))
const EstimateModal = lazy(() => import('./components/EstimateModal'))
const NivaasAiStudio = lazy(() => import('./components/NivaasAiStudio'))

function App() {
  const [consultOpen, setConsultOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [estimateOpen, setEstimateOpen] = useState(false)
  const [aiStudioOpen, setAiStudioOpen] = useState(false)
  const [exploreSheetOpen, setExploreSheetOpen] = useState(false)
  const [aiStudioMode, setAiStudioMode] = useState<'generator' | 'chat'>('generator')
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
    <div className="min-h-screen bg-base text-ink font-body selection:bg-[#292826] selection:text-white overflow-x-hidden w-full relative flex flex-col justify-between">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Global Navigation Header */}
      <Nav
        onOpenConsult={() => handleOpenConsult()}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenAiStudio={() => handleOpenAiStudio('generator')}
      />

      {/* Main Routed Content */}
      <div className="flex-1">
        <Suspense fallback={<div className="min-h-[50vh] bg-[#FDFCF9] flex items-center justify-center text-xs text-[#74706A]">Loading Indore House Makers Studio...</div>}>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onCalculateEstimate={handleCalculateEstimate}
                  onOpenConsult={handleOpenConsult}
                />
              }
            />
            <Route
              path="/house-plans"
              element={<HousePlansPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/interiors"
              element={<InteriorsPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/designs"
              element={<DesignsPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/services"
              element={<ServicesPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/cost-estimator"
              element={<CostEstimatorPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/guides"
              element={<GuidesPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/about"
              element={<AboutPage />}
            />
            <Route
              path="/faq"
              element={<FaqPage onOpenConsult={handleOpenConsult} />}
            />
            <Route
              path="/contact"
              element={<ContactPage />}
            />
            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </Suspense>
      </div>

      {/* Global Footer */}
      <Footer
        onOpenConsult={handleOpenConsult}
        onOpenLogin={() => setLoginOpen(true)}
        onOpenAiStudio={() => handleOpenAiStudio('generator')}
      />

      {/* Responsive Bottom Navigation (0–767px Mobile Full-Width Bar, 768–1023px Tablet Dock, Hidden on Desktop 1024px+) */}
      <ResponsiveBottomNav
        onOpenConsult={handleOpenConsult}
        onOpenAiStudio={() => handleOpenAiStudio('generator')}
        aiStudioOpen={aiStudioOpen}
        onSheetStateChange={setExploreSheetOpen}
      />

      {/* Floating Sticky Actions (AI Assistant + WhatsApp Support) */}
      <WhatsAppWidget
        onOpenConsult={handleOpenConsult}
        onOpenAiStudio={() => handleOpenAiStudio('generator')}
        sheetOpen={exploreSheetOpen}
        modalOpen={consultOpen || loginOpen || estimateOpen || aiStudioOpen || exploreSheetOpen}
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