import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { subscribeOpenLogin } from './lib/uiEvents'
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
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const FaqPage = lazy(() => import('./pages/FaqPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const AdminSetupPage = lazy(() => import('./pages/AdminSetupPage'))
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

// Protected Route Guard
import ProtectedRoute from './components/ProtectedRoute'

// Global Modals Loaded On-Demand
const ConsultModal = lazy(() => import('./components/ConsultModal'))
const LoginModal = lazy(() => import('./components/LoginModal'))
const EstimateModal = lazy(() => import('./components/EstimateModal'))
const NivaasAiStudio = lazy(() => import('./components/NivaasAiStudio'))

function App() {
  const location = useLocation()
  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/setup-admin') ||
    location.pathname.startsWith('/setup/admin')
  const isDashboardRoute = location.pathname.startsWith('/dashboard')
  const isPortalRoute = isAdminRoute || isDashboardRoute

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

  // Route guards (ProtectedRoute) request the global login popup via this event,
  // so an expired session or a direct hit on /admin surfaces login instead of a dead end.
  useEffect(() => {
    return subscribeOpenLogin(() => setLoginOpen(true))
  }, [])

  // Public routes present the visitor experience: a login popup left over from a
  // protected route (e.g. expired session on /admin) must close on an actual
  // pathname change — never merely because the modal itself is open.
  useEffect(() => {
    if (!isPortalRoute) setLoginOpen(false)
  }, [location.pathname, isPortalRoute])

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
    <div className="min-h-screen bg-page-base text-ink font-body selection:bg-[#292826] selection:text-white overflow-x-hidden w-full relative flex flex-col justify-between">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Public Navigation Header (Hidden completely on Admin and Dashboard routes) */}
      {!isPortalRoute && (
        <Nav
          onOpenConsult={() => handleOpenConsult()}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenAiStudio={() => handleOpenAiStudio('generator')}
        />
      )}

      {/* Main Routed Content Landmark */}
      <main id="main-content" className="flex-1">
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
              path="/guides/:slug"
              element={<GuideDetailPage onOpenConsult={handleOpenConsult} />}
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
              path="/setup/admin"
              element={<AdminSetupPage />}
            />
            <Route
              path="/setup-admin"
              element={<AdminSetupPage />}
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage
                    onOpenConsult={handleOpenConsult}
                    onOpenAiStudio={() => handleOpenAiStudio('generator')}
                    onOpenLogin={() => setLoginOpen(true)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </Suspense>
      </main>

      {/* Global Footer (Hidden on Portal / Dashboard routes) */}
      {!isPortalRoute && (
        <Footer
          onOpenConsult={handleOpenConsult}
          onOpenLogin={() => setLoginOpen(true)}
          onOpenAiStudio={() => handleOpenAiStudio('generator')}
        />
      )}

      {/* Responsive Bottom Navigation (Public routes + User Dashboard mobile view; hidden on Admin routes) */}
      {!isAdminRoute && (
        <ResponsiveBottomNav
          onOpenConsult={handleOpenConsult}
          onOpenAiStudio={(mode = 'chat') => handleOpenAiStudio(mode)}
          onOpenLogin={() => setLoginOpen(true)}
          aiStudioOpen={aiStudioOpen}
          onSheetStateChange={setExploreSheetOpen}
        />
      )}

      {/* Floating Sticky Actions: AI Assistant + WhatsApp Support (Hidden on Portal / Dashboard routes) */}
      {!isPortalRoute && (
        <WhatsAppWidget
          onOpenConsult={handleOpenConsult}
          onOpenAiStudio={() => handleOpenAiStudio('chat')}
          sheetOpen={exploreSheetOpen}
          modalOpen={consultOpen || loginOpen || estimateOpen || aiStudioOpen || exploreSheetOpen}
        />
      )}

      {/* Login Modal (Globally available — including on /admin — so an expired admin
          session or a direct hit on a protected route can re-authenticate) */}
      <Suspense fallback={null}>
        {loginOpen && (
          <LoginModal
            isOpen={loginOpen}
            onClose={() => setLoginOpen(false)}
          />
        )}
      </Suspense>

      {/* Public & User-Dashboard Modals Loaded On-Demand (Hidden on Admin routes) */}
      {!isAdminRoute && (
        <Suspense fallback={null}>
          {consultOpen && (
            <ConsultModal
              isOpen={consultOpen}
              onClose={() => setConsultOpen(false)}
              initialRequirement={selectedRequirement}
              initialPlanDetails={selectedPlanDetails}
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
              onOpenLogin={() => {
                setLoginOpen(true)
              }}
              initialMode={aiStudioMode}
            />
          )}
        </Suspense>
      )}
    </div>
  )
}

export default App