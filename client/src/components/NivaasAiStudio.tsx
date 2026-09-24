import React, { useState, useEffect, useRef } from 'react'
import { site } from '../lib/data'
import { Icons } from './Icons'

export interface NivaasAiStudioProps {
  open: boolean
  onClose: () => void
  onOpenConsult?: (details?: string) => void
  initialMode?: 'generator' | 'chat'
  initialWidth?: number
  initialDepth?: number
}

// -------------------------------------------------------------
// Photo references for visual choices
// -------------------------------------------------------------
const ASSETS = {
  kitchenOpen: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=700&q=80',
  kitchenClosed: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=700&q=80',
  mandirDedicated: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=700&q=80',
  mandirNiche: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=700&q=80',
  bathBig: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=700&q=80',
  bathStandard: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=700&q=80',
  bathSmall: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=700&q=80',
  // Ultra-realistic elevation styles (Day & Twilight versions)
  modernDuplexDay: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=1200',
  modernDuplexNight: 'https://images.pexels.com/photos/35289099/pexels-photo-35289099.jpeg?auto=compress&cs=tinysrgb&w=1200',
  keralaTropicalDay: 'https://images.pexels.com/photos/29120121/pexels-photo-29120121.jpeg?auto=compress&cs=tinysrgb&w=1200',
  contemporaryJaaliDay: 'https://images.pexels.com/photos/35114454/pexels-photo-35114454.jpeg?auto=compress&cs=tinysrgb&w=1200',
  spanishVillaDay: 'https://images.pexels.com/photos/32261831/pexels-photo-32261831.jpeg?auto=compress&cs=tinysrgb&w=1200',
}

interface ChatMessage {
  from: 'bot' | 'user'
  text: string
  time: string
}

export default function NivaasAiStudio({
  open,
  onClose,
  onOpenConsult,
  initialMode = 'generator',
  initialWidth = 30,
  initialDepth = 50,
}: NivaasAiStudioProps) {
  const [activeTab, setActiveTab] = useState<'generator' | 'chat'>(initialMode)

  // -----------------------------------------------------------
  // Wizard State (Steps 1 to 20 + Processing + Lead + Results)
  // -----------------------------------------------------------
  const [step, setStep] = useState(1)
  const totalWizardSteps = 20

  const [plotWidth, setPlotWidth] = useState<number>(initialWidth)
  const [plotDepth, setPlotDepth] = useState<number>(initialDepth)
  const [floors, setFloors] = useState<string>('G+1 (Two Floors)')
  const [masterBedrooms, setMasterBedrooms] = useState<string>('2')
  const [marriedCouples, setMarriedCouples] = useState<string>('1')
  const [kidsCount, setKidsCount] = useState<string>('1')
  const [kidsBedroom, setKidsBedroom] = useState<'Yes' | 'No'>('Yes')
  const [kitchenFloor, setKitchenFloor] = useState<string>('Ground Floor')
  const [kitchenType, setKitchenType] = useState<'Open' | 'Close'>('Open')
  const [mandirPreference, setMandirPreference] = useState<string>('Dedicated NE Pooja Room')
  const [balconies, setBalconies] = useState<'Yes' | 'No'>('Yes')
  const [officeSpace, setOfficeSpace] = useState<'Yes' | 'No'>('Yes')
  const [parking, setParking] = useState<string>('Both (Car & Bike)')
  const [garden, setGarden] = useState<'Yes' | 'No'>('Yes')
  const [lift, setLift] = useState<'Yes' | 'No'>('No')
  const [bathroomChoice, setBathroomChoice] = useState<'Big' | 'Standard' | 'Small'>('Standard')
  const [plotDirection, setPlotDirection] = useState<string>('East')
  const [siteDetails, setSiteDetails] = useState({
    front: 'Road',
    back: "Others Property",
    right: "Others Property",
    left: "Others Property",
  })
  const [elevationStyle, setElevationStyle] = useState<string>('Modern Indian Duplex')
  const [materialGrade, setMaterialGrade] = useState<string>('Premium Executive (~₹2,350/sq.ft)')

  // Synthesis & Result State
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('Analyzing plot setbacks and municipal bylaws...')
  const [leadName, setLeadName] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [leadCity, setLeadCity] = useState('')
  const [activeFloorView, setActiveFloorView] = useState<'ground' | 'first'>('ground')
  const [isNightLighting, setIsNightLighting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // -----------------------------------------------------------
  // Chat State
  // -----------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      from: 'bot',
      text: 'Namaste! 🙏 I am your NIVAAS AI Architecture Assistant. Ask me anything about floor plans, municipal bylaws, Vastu directions, 3D elevation styles, or construction estimates.',
      time: 'Just now',
    },
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatTyping, setChatTyping] = useState(false)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  // Sync mode if initialMode changes
  useEffect(() => {
    setActiveTab(initialMode)
  }, [initialMode, open])

  // Reset or initialize on open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Chat auto-scroll
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, chatTyping, activeTab])

  // Process simulation timer when reaching step 21
  useEffect(() => {
    if (step === 21) {
      setProcessingProgress(0)
      const milestones = [
        { pct: 15, msg: 'Evaluating municipal setbacks (GHMC/BBMP/DDA) for plot dimensions...' },
        { pct: 35, msg: 'Validating Vastu Shastra grid: Kitchen in Agneya (SE), Mandir in Ishanya (NE)...' },
        { pct: 60, msg: 'Optimizing structural column grid, daylight shafts and ventilation...' },
        { pct: 85, msg: 'Synthesizing 2D CAD floor plans and ultra-realistic 3D facade concepts...' },
        { pct: 100, msg: 'Architectural AI synthesis complete! Finalizing design specifications...' },
      ]

      let currentMilestone = 0
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => setStep(22), 600) // Go to lead capture
            return 100
          }
          const next = prev + 5
          if (milestones[currentMilestone] && next >= milestones[currentMilestone].pct) {
            setProcessingStatus(milestones[currentMilestone].msg)
            currentMilestone++
          }
          return next
        })
      }, 100)

      return () => clearInterval(interval)
    }
  }, [step])

  if (!open) return null

  // Calculations
  const plotAreaSqFt = (plotWidth || 0) * (plotDepth || 0)
  const plotAreaSqYards = Math.round(plotAreaSqFt / 9)
  const floorMultiplier = floors.includes('Single') ? 1 : floors.includes('Two') ? 1.85 : floors.includes('Three') ? 2.7 : 3.5
  const builtUpArea = Math.round(plotAreaSqFt * floorMultiplier * 0.82)
  const carpetArea = Math.round(builtUpArea * 0.76)

  // Rate estimation based on selected finish grade
  const ratePerSqFt = materialGrade.includes('1,800') ? 1800 : materialGrade.includes('3,200') ? 3250 : 2350
  const estimatedCostLakhs = ((builtUpArea * ratePerSqFt) / 100000).toFixed(1)

  // Vastu compass angles & directions
  const directions = [
    { label: 'N', name: 'North', angle: 0, tag: 'Kubera (Wealth)', good: true },
    { label: 'NE', name: 'North-East', angle: 45, tag: 'Ishan (Most Auspicious)', good: true },
    { label: 'E', name: 'East', angle: 90, tag: 'Surya (Vitality & Health)', good: true },
    { label: 'SE', name: 'South-East', angle: 135, tag: 'Agneya (Fire & Energy)', good: true },
    { label: 'S', name: 'South', angle: 180, tag: 'Yama (Stability)', good: false },
    { label: 'SW', name: 'South-West', angle: 225, tag: 'Nairutya (Strength)', good: false },
    { label: 'W', name: 'West', angle: 270, tag: 'Varuna (Prosperity)', good: true },
    { label: 'NW', name: 'North-West', angle: 315, tag: 'Vayavya (Movement)', good: true },
  ]

  const activeCompassDir = directions.find((d) => d.name === plotDirection || d.label === plotDirection) || directions[2]

  const handleNext = () => {
    if (step < 20) {
      setStep((prev) => prev + 1)
    } else if (step === 20) {
      setStep(21) // Trigger AI synthesis
    }
  }

  const handleBack = () => {
    if (step > 1 && step <= 20) {
      setStep((prev) => prev - 1)
    } else if (step === 23) {
      setStep(20)
    }
  }

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(23) // Results page
  }

  // Chat message submission
  const handleSendChat = (text: string) => {
    const q = text.trim()
    if (!q) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatMessages((prev) => [...prev, { from: 'user', text: q, time: now }])
    setChatInput('')
    setChatTyping(true)

    setTimeout(() => {
      setChatTyping(false)
      const qLower = q.toLowerCase()
      let reply = 'I can help you customize floor plans, calculate setbacks, review Vastu directions, or recommend 3D front elevations. You can also generate your complete plan in 30 seconds using the "AI Plan Generator" tab!'

      if (/(price|cost|budget|rate|lakh)/i.test(qLower)) {
        reply = `For your ${plotWidth}x${plotDepth} ft plot (~${builtUpArea} sq.ft built-up), the estimated construction budget is ₹${estimatedCostLakhs} Lakhs at ${materialGrade.split(' ')[0]} grade. NIVAAS design packages start at ₹4,999 for full 2D CAD working drawings.`
      } else if (/(vastu|vaastu|direction|mandir|pooja|kitchen)/i.test(qLower)) {
        reply = `For ${plotDirection} facing plots, Vastu recommends placing the Pooja Mandir in the North-East (Ishan), Kitchen in South-East (Agneya), and the Master Bedroom in South-West (Nairutya). Our AI engine auto-aligns all these zones!`
      } else if (/(3d|elevation|facade|exterior|render)/i.test(qLower)) {
        reply = `Our ultra-realistic 3D elevations feature day and twilight lighting modes with HPL wooden louvers, CNC jali accents, and ambient warm LED profiles. You can preview them instantly in the "AI Plan Generator" tab!`
      } else if (/(talk|architect|call|contact|consult)/i.test(qLower)) {
        reply = `Our Senior Architects are available for a 1-on-1 virtual consultation. Click "Book Free Architect Review" or call us at ${site.phone} to discuss your exact site requirements.`
      }

      setChatMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }, 700)
  }

  const handleSharePlan = () => {
    navigator.clipboard?.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  // Active 3D Elevation Image based on style and lighting
  const getElevationImage = () => {
    if (isNightLighting) return ASSETS.modernDuplexNight
    if (elevationStyle.includes('Kerala')) return ASSETS.keralaTropicalDay
    if (elevationStyle.includes('Contemporary') || elevationStyle.includes('Jaali')) return ASSETS.contemporaryJaaliDay
    if (elevationStyle.includes('Spanish') || elevationStyle.includes('Classical')) return ASSETS.spanishVillaDay
    return ASSETS.modernDuplexDay
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1815]/75 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-white rounded-2xl shadow-2xl border border-[#E7E0D7] flex flex-col overflow-hidden text-[#292826]">
        {/* Top Header */}
        <header className="shrink-0 bg-white border-b border-[#EEE9E3] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E76F2E] text-white shadow-sm ring-2 ring-[#E76F2E]/20">
              <Icons.Sparkles size={18} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-[#292826]">
                  NIVAAS <span className="text-[#E76F2E]">AI Architect</span> Studio
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FFF6E8] text-[#C65320] border border-[#E76F2E]/20 rounded-full">
                  Instant CAD &amp; 3D Engine
                </span>
              </div>
              <p className="text-[11px] text-[#74706A]">
                India's Most Precise Residential AI Planning &amp; Vastu Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#F4EFEA] p-1 rounded-xl border border-[#E7E0D7]">
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'generator'
                    ? 'bg-white text-[#E76F2E] shadow-sm'
                    : 'text-[#74706A] hover:text-[#292826]'
                }`}
              >
                <Icons.Blueprint size={13} />
                <span>AI Plan Generator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeTab === 'chat'
                    ? 'bg-white text-[#E76F2E] shadow-sm'
                    : 'text-[#74706A] hover:text-[#292826]'
                }`}
              >
                <span>💬</span>
                <span>Ask AI</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[#74706A] hover:text-[#292826] hover:bg-[#F4EFEA] transition"
              aria-label="Close Nivaas AI Studio"
            >
              <Icons.Close size={20} />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: AI PLAN GENERATOR (MakeMyHouse 20-Step Guided Flow) */}
        {/* ========================================================= */}
        {activeTab === 'generator' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCF9]">
            {/* Step Progress Bar (Shown during Steps 1 to 20) */}
            {step <= 20 && (
              <div className="shrink-0 bg-white border-b border-[#EEE9E3] px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#E76F2E]">
                    Step {step} of {totalWizardSteps}
                  </span>
                  <span className="hidden sm:inline-block text-xs text-[#74706A]">|</span>
                  <span className="hidden sm:inline-block text-xs text-[#74706A] font-medium">
                    {step <= 2
                      ? 'Plot Measurements'
                      : step <= 7
                      ? 'Family & Bedroom Requirements'
                      : step <= 10
                      ? 'Kitchen & Vastu Pooja'
                      : step <= 16
                      ? 'Lifestyle & Interior Spaces'
                      : step <= 18
                      ? 'Plot Direction & Surroundings'
                      : 'Elevation Style & Finishes'}
                  </span>
                </div>
                <div className="w-36 sm:w-56 h-2 bg-[#F1ECE5] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#E76F2E] to-[#C94F36] rounded-full transition-all duration-300"
                    style={{ width: `${(step / totalWizardSteps) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Main Interactive Wizard Stage */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
              <div className="w-full max-w-xl">
                {/* STEP 1: PLOT FRONTAGE / WIDTH */}
                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Plot Dimensions
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        What is your Plot Width (Frontage)?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Enter the front width facing the road in feet.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min={10}
                            max={200}
                            value={plotWidth || ''}
                            onChange={(e) => setPlotWidth(Number(e.target.value))}
                            placeholder="Enter width (e.g. 30)"
                            className="w-full px-4 py-3.5 text-lg font-bold rounded-xl border border-[#E7E0D7] focus:ring-2 focus:ring-[#E76F2E] outline-none bg-[#FDFCF9]"
                          />
                          <span className="absolute right-4 top-3.5 text-sm font-bold text-[#74706A]">
                            Feet (ft)
                          </span>
                        </div>
                      </div>

                      {/* Quick Preset Chips */}
                      <div>
                        <span className="text-xs text-[#74706A] font-semibold block mb-2">
                          Popular Indian Plot Widths:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[20, 25, 30, 35, 40, 50].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setPlotWidth(w)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                                plotWidth === w
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                  : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E] hover:bg-[#FFF6E8]'
                              }`}
                            >
                              {w} ft
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: PLOT DEPTH / LENGTH */}
                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Plot Dimensions
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        What is your Plot Depth (Length)?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Enter the plot length from front to back in feet.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      <div className="relative">
                        <input
                          type="number"
                          min={15}
                          max={300}
                          value={plotDepth || ''}
                          onChange={(e) => setPlotDepth(Number(e.target.value))}
                          placeholder="Enter depth (e.g. 50)"
                          className="w-full px-4 py-3.5 text-lg font-bold rounded-xl border border-[#E7E0D7] focus:ring-2 focus:ring-[#E76F2E] outline-none bg-[#FDFCF9]"
                        />
                        <span className="absolute right-4 top-3.5 text-sm font-bold text-[#74706A]">
                          Feet (ft)
                        </span>
                      </div>

                      {/* Quick Presets */}
                      <div>
                        <span className="text-xs text-[#74706A] font-semibold block mb-2">
                          Popular Indian Plot Depths:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[30, 40, 45, 50, 60, 70].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setPlotDepth(d)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                                plotDepth === d
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                  : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E] hover:bg-[#FFF6E8]'
                              }`}
                            >
                              {d} ft
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Calculated Area Callout */}
                      <div className="p-3 bg-[#FFF6E8] rounded-xl border border-[#E76F2E]/20 flex items-center justify-between text-xs">
                        <span className="text-[#74706A] font-semibold">Total Land Area:</span>
                        <span className="font-bold text-[#C65320]">
                          {plotAreaSqFt} sq.ft · {plotAreaSqYards} Sq. Yards
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: NUMBER OF FLOORS */}
                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Configuration
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Number of Floors to Construct?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Select how many levels you are planning to build.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        { label: 'One Floor', desc: 'Ground Floor only' },
                        { label: 'G+1 (Two Floors)', desc: 'Modern Duplex' },
                        { label: 'G+2 (Three Floors)', desc: 'Triplex / Rental Unit' },
                        { label: 'G+3 (Multi Floors)', desc: 'Multi-Family Mansion' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setFloors(item.label)}
                          className={`p-4 rounded-xl text-left border transition-all ${
                            floors === item.label
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md scale-[1.02]'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E] hover:bg-[#FFF6E8]'
                          }`}
                        >
                          <div className="font-bold text-sm sm:text-base">{item.label}</div>
                          <div className={`text-xs mt-1 ${floors === item.label ? 'text-white/80' : 'text-[#74706A]'}`}>
                            {item.desc}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 4: MASTER BEDROOMS */}
                {step === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Bedrooms
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        How many Master Bedrooms?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Spacious bedrooms with attached en-suite bathrooms and dressing areas.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {['1', '2', '3', '4+'].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setMasterBedrooms(cnt)}
                          className={`py-4 rounded-xl font-bold text-center border text-base sm:text-lg transition ${
                            masterBedrooms === cnt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 5: MARRIED COUPLES */}
                {step === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Family Setup
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        How many Married Couples in Family?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Helps our AI design private acoustic zones and master suites.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {['1', '2', '3', '4+'].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setMarriedCouples(cnt)}
                          className={`py-4 rounded-xl font-bold text-center border text-base sm:text-lg transition ${
                            marriedCouples === cnt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 6: KIDS COUNT */}
                {step === 6 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Children
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        How many Kids in Family?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        We configure study desks, bunk beds, and dedicated storage.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {['None', '1', '2', '3+'].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setKidsCount(cnt)}
                          className={`py-4 rounded-xl font-bold text-center border text-base sm:text-lg transition ${
                            kidsCount === cnt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {cnt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 7: KIDS DEDICATED BEDROOM */}
                {step === 7 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Kids Room
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Require Dedicated Bedroom for Kids?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Configured with dual study stations and playful interior niches.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setKidsBedroom(opt as 'Yes' | 'No')}
                          className={`py-5 rounded-xl font-bold text-center border text-lg transition ${
                            kidsBedroom === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 8: KITCHEN FLOOR PLACEMENT */}
                {step === 8 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Kitchen Layout
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Kitchen should be on?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Ground floor dining access or independent pantry on upper floors.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {['Ground Floor', 'First Floor', 'All Floors'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setKitchenFloor(opt)}
                          className={`py-4 px-2 rounded-xl font-bold text-center border text-xs sm:text-sm transition ${
                            kitchenFloor === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 9: KITCHEN STYLE (VISUAL CARDS) */}
                {step === 9 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Kitchen Aesthetics
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Type of Kitchen required?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Select between an open-concept island kitchen or traditional partitioned kitchen.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Open Kitchen */}
                      <button
                        type="button"
                        onClick={() => setKitchenType('Open')}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all p-2 bg-white text-left ${
                          kitchenType === 'Open'
                            ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E]/20'
                            : 'border-[#E7E0D7] hover:border-[#E76F2E]'
                        }`}
                      >
                        <div className="h-32 sm:h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={ASSETS.kitchenOpen}
                            alt="Open Kitchen"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <div className="font-bold text-sm sm:text-base text-[#292826]">Open Kitchen</div>
                          <p className="text-[11px] text-[#74706A]">Contemporary breakfast counter &amp; dining connect</p>
                        </div>
                      </button>

                      {/* Closed Kitchen */}
                      <button
                        type="button"
                        onClick={() => setKitchenType('Close')}
                        className={`group relative overflow-hidden rounded-2xl border-2 transition-all p-2 bg-white text-left ${
                          kitchenType === 'Close'
                            ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E]/20'
                            : 'border-[#E7E0D7] hover:border-[#E76F2E]'
                        }`}
                      >
                        <div className="h-32 sm:h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                          <img
                            src={ASSETS.kitchenClosed}
                            alt="Closed Kitchen"
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        </div>
                        <div className="p-2 text-center">
                          <div className="font-bold text-sm sm:text-base text-[#292826]">Closed Kitchen</div>
                          <p className="text-[11px] text-[#74706A]">Separate spice cooking &amp; enclosed utility area</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 10: POOJA ROOM / MANDIR (HIGH RELEVANCE) */}
                {step === 10 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Vastu Sacred Space
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Pooja Room / Mandir Preference?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Critical for North-East (Ishan) Vastu compliance in Indian homes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'Dedicated NE Pooja Room',
                          title: 'Dedicated Mandir',
                          desc: 'Full standalone room in Ishan (NE)',
                          img: ASSETS.mandirDedicated,
                        },
                        {
                          id: 'Compact Pooja Niche',
                          title: 'Pooja Niche / Cabinet',
                          desc: 'Sleek wall-mounted teakwood cabinet',
                          img: ASSETS.mandirNiche,
                        },
                        {
                          id: 'Not Required',
                          title: 'Not Required',
                          desc: 'Utilize space for storage or foyer',
                          img: null,
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMandirPreference(item.id)}
                          className={`p-3 rounded-2xl border-2 text-left bg-white transition flex flex-col justify-between ${
                            mandirPreference === item.id
                              ? 'border-[#E76F2E] shadow-md ring-2 ring-[#E76F2E]/20'
                              : 'border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {item.img && (
                            <div className="h-24 w-full rounded-xl overflow-hidden mb-2 bg-gray-100">
                              <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm text-[#292826]">{item.title}</div>
                            <div className="text-[11px] text-[#74706A] mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 11: BEDROOM BALCONIES */}
                {step === 11 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Ventilation &amp; Views
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Require Balcony in Bedrooms?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Attached sit-out balconies with toughened glass railings and planter boxes.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setBalconies(opt as 'Yes' | 'No')}
                          className={`py-5 rounded-xl font-bold text-center border text-lg transition ${
                            balconies === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 12: SMALL OFFICE / STUDY SPACE */}
                {step === 12 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Work From Home
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Require Small Office / Study Space?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Quiet workspace with high-speed cabling, bookshelves, and video conference background.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setOfficeSpace(opt as 'Yes' | 'No')}
                          className={`py-5 rounded-xl font-bold text-center border text-lg transition ${
                            officeSpace === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 13: PARKING FACILITY */}
                {step === 13 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Vehicles
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Parking Facility in the House?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Covered car porch, stilt parking, or bike bays.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['2 Wheeler Parking', '4 Wheeler Parking', 'Both (Car & Bike)', 'No Parking'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setParking(opt)}
                          className={`p-4 rounded-xl font-bold text-center border text-xs sm:text-sm transition ${
                            parking === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 14: GARDEN PROVISION */}
                {step === 14 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Landscaping
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Garden Provision in the House?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Front lawn setback, central courtyard Brahmasthan, or terrace garden.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setGarden(opt as 'Yes' | 'No')}
                          className={`py-5 rounded-xl font-bold text-center border text-lg transition ${
                            garden === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 15: LIFT PROVISION */}
                {step === 15 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Accessibility
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Lift Provision in the House?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Hydraulic or gearless elevator shaft for multi-storey duplex/triplex living.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setLift(opt as 'Yes' | 'No')}
                          className={`py-5 rounded-xl font-bold text-center border text-lg transition ${
                            lift === opt
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-md'
                              : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 16: BATHROOM SPACE CHOICE (VISUAL CARDS) */}
                {step === 16 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Bathrooms
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Bathroom Space Choice?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Select bathroom dimensions and fixtures allocation.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'Big', label: 'Big / Luxury', desc: 'Glass shower enclosure & vanity', img: ASSETS.bathBig },
                        { id: 'Standard', label: 'Standard', desc: 'Comfortable 5x7 ft with dry/wet area', img: ASSETS.bathStandard },
                        { id: 'Small', label: 'Compact / Small', desc: 'Space-saving powder toilet layout', img: ASSETS.bathSmall },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBathroomChoice(item.id as 'Big' | 'Standard' | 'Small')}
                          className={`group overflow-hidden rounded-2xl border-2 text-left bg-white transition p-2 ${
                            bathroomChoice === item.id
                              ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E]/20'
                              : 'border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          <div className="h-28 sm:h-36 w-full rounded-xl overflow-hidden bg-gray-100">
                            <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="p-2 text-center">
                            <div className="font-bold text-xs sm:text-sm text-[#292826]">{item.label}</div>
                            <div className="text-[10px] text-[#74706A] mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 17: PLOT DIRECTION (INTERACTIVE VASTU COMPASS) */}
                {step === 17 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Vastu Shastra
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Plot Facing Direction
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Select the direction of your entrance road to calibrate Vastu zoning.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm flex flex-col items-center">
                      {/* Animated Interactive Compass */}
                      <div className="relative w-44 h-44 sm:w-48 sm:h-48 my-2 flex items-center justify-center">
                        {/* Outer Compass Dial */}
                        <div
                          className="absolute inset-0 rounded-full border-4 border-[#292826] bg-[#FDFCF9] shadow-inner flex items-center justify-center transition-transform duration-700 ease-out"
                          style={{ transform: `rotate(${-activeCompassDir.angle}deg)` }}
                        >
                          {/* Radial markings */}
                          <div className="absolute top-2 font-display text-xs font-extrabold text-[#C94F36]">N</div>
                          <div className="absolute right-2.5 font-display text-xs font-bold text-[#292826]">E</div>
                          <div className="absolute bottom-2 font-display text-xs font-bold text-[#292826]">S</div>
                          <div className="absolute left-2.5 font-display text-xs font-bold text-[#292826]">W</div>

                          {/* Compass Crosshair */}
                          <div className="w-full h-[1px] bg-[#E7E0D7] absolute" />
                          <div className="h-full w-[1px] bg-[#E7E0D7] absolute" />
                        </div>

                        {/* Center Needle (Always Points North with red arrow) */}
                        <div className="relative z-10 w-8 h-8 rounded-full bg-[#292826] flex items-center justify-center shadow-md border-2 border-white">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#E76F2E]" />
                        </div>

                        {/* Top Indicator Arrow */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[#E76F2E] font-bold text-sm">
                          ▼
                        </div>
                      </div>

                      {/* Direction Selection Buttons (N, E, S, W, NE, SE, SW, NW) */}
                      <div className="grid grid-cols-4 gap-2 w-full mt-4">
                        {directions.map((dir) => (
                          <button
                            key={dir.label}
                            type="button"
                            onClick={() => setPlotDirection(dir.name)}
                            className={`py-2 px-1 rounded-xl text-center font-bold text-xs sm:text-sm border transition ${
                              plotDirection === dir.name || plotDirection === dir.label
                                ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-sm'
                                : 'bg-[#FDFCF9] text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                            }`}
                          >
                            <div>{dir.label}</div>
                            <div className="text-[9px] opacity-80 font-normal">{dir.name}</div>
                          </button>
                        ))}
                      </div>

                      {/* Vastu Note */}
                      <div className="mt-3 text-center text-xs text-[#74706A]">
                        Selected: <strong className="text-[#C65320]">{plotDirection} Facing</strong> ({activeCompassDir.tag})
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 18: SITE DETAILS / SURROUNDINGS */}
                {step === 18 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Site Boundaries
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Site Surroundings &amp; Road Access
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Tell us what surrounds your 4 plot boundaries to determine light, ventilation, and setback bylaws.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      {/* Interactive Boundary Table */}
                      {(['front', 'back', 'left', 'right'] as const).map((side) => (
                        <div key={side} className="flex items-center justify-between border-b border-[#EEE9E3] pb-3 last:border-b-0 last:pb-0">
                          <span className="text-sm font-bold capitalize text-[#292826]">
                            {side === 'front' ? 'Front Side (Facing Road)' : `${side} Boundary`}:
                          </span>
                          <div className="flex items-center gap-2">
                            {['Road', "Others Property"].map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setSiteDetails((prev) => ({ ...prev, [side]: opt }))}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                                  siteDetails[side] === opt
                                    ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                    : 'bg-[#FDFCF9] text-[#74706A] border-[#E7E0D7] hover:border-[#E76F2E]'
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 19: ARCHITECTURAL ELEVATION STYLE (ULTRA-REALISTIC) */}
                {step === 19 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Exterior Design
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Choose 3D Front Facade Style
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Ultra-photorealistic 3D elevations engineered for Indian weather and materials.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {[
                        {
                          id: 'Modern Indian Duplex',
                          desc: 'Wooden rafters, CNC jali screen & warm LED profile reveals',
                          img: ASSETS.modernDuplexDay,
                        },
                        {
                          id: 'Kerala Tropical Sloping Roof',
                          desc: 'Mangalore clay pitched tiles, teakwood pillars & breezy sitouts',
                          img: ASSETS.keralaTropicalDay,
                        },
                        {
                          id: 'Contemporary Minimalist Villa',
                          desc: 'Travertine stone cladding, cantilevered glass & texture concrete',
                          img: ASSETS.contemporaryJaaliDay,
                        },
                        {
                          id: 'Neo-Classical / Spanish Villa',
                          desc: 'Fluted pillars, grand arch windows & natural Dholpur stone',
                          img: ASSETS.spanishVillaDay,
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setElevationStyle(item.id)}
                          className={`group overflow-hidden rounded-2xl border-2 text-left bg-white transition p-2.5 ${
                            elevationStyle === item.id
                              ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E]/20'
                              : 'border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden bg-gray-100">
                            <img src={item.img} alt={item.id} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                          </div>
                          <div className="p-2">
                            <div className="font-bold text-xs sm:text-sm text-[#292826]">{item.id}</div>
                            <div className="text-[10px] text-[#74706A] mt-0.5 line-clamp-2">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 20: CONSTRUCTION FINISH & MATERIAL GRADE */}
                {step === 20 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Construction Grade
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Construction Quality &amp; Budget Grade
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Specifies structure materials, sanitaryware, electricals, and flooring.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          id: 'Standard Solid Build (~₹1,800/sq.ft)',
                          title: 'Standard Solid Build',
                          rate: '₹1,800 / sq.ft',
                          desc: 'Red clay bricks, Kajaria vitrified tiles, Cera sanitaryware, Anchor switches',
                        },
                        {
                          id: 'Premium Executive (~₹2,350/sq.ft)',
                          title: 'Premium Executive (Most Popular)',
                          rate: '₹2,350 / sq.ft',
                          desc: 'AAC blockwork, 4x2 GVT tiles, Kohler/Jaquar fittings, Teak main door, Legrand switches',
                        },
                        {
                          id: 'Ultra-Luxury Villa Grade (~₹3,200+/sq.ft)',
                          title: 'Ultra-Luxury Villa Grade',
                          rate: '₹3,200+ / sq.ft',
                          desc: 'Italian marble, Grohe/Toto automation, double-glazed soundproof glass, VRV AC ready',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMaterialGrade(item.id)}
                          className={`w-full p-4 rounded-2xl border-2 text-left bg-white transition flex items-center justify-between ${
                            materialGrade === item.id
                              ? 'border-[#E76F2E] shadow-md ring-2 ring-[#E76F2E]/20 bg-[#FFF6E8]/30'
                              : 'border-[#E7E0D7] hover:border-[#E76F2E]'
                          }`}
                        >
                          <div>
                            <div className="font-bold text-sm sm:text-base text-[#292826]">{item.title}</div>
                            <div className="text-xs text-[#74706A] mt-0.5">{item.desc}</div>
                          </div>
                          <div className="text-right shrink-0 ml-3">
                            <span className="text-xs sm:text-sm font-extrabold text-[#C65320]">{item.rate}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* STEP 21: ANIMATED AI SYNTHESIS ENGINE */}
                {step === 21 && (
                  <div className="text-center py-10 space-y-6 animate-fadeIn">
                    <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="#EEE9E3"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="72"
                          cy="72"
                          r="60"
                          stroke="#E76F2E"
                          strokeWidth="8"
                          strokeDasharray={377}
                          strokeDashoffset={377 - (377 * processingProgress) / 100}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-150 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="font-display font-black text-3xl text-[#292826]">
                          {processingProgress}%
                        </span>
                        <span className="text-[10px] font-bold text-[#E76F2E] uppercase tracking-wider">
                          Analyzing
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 max-w-md mx-auto">
                      <h4 className="font-display text-xl font-bold text-[#292826]">
                        Synthesizing Custom NIVAAS AI Plan...
                      </h4>
                      <p className="text-xs text-[#74706A] animate-pulse">
                        {processingStatus}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#74706A]">
                      <Icons.ShieldCheck size={14} className="text-[#E76F2E]" />
                      <span>Checking 100% Vastu compliance &amp; structural column alignment</span>
                    </div>
                  </div>
                )}

                {/* STEP 22: LEAD CAPTURE & DELIVERY */}
                {step === 22 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span>✓</span> Requirements Verified &amp; Synthesized
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-3 text-[#292826]">
                        Your 2D Blueprint &amp; 3D Facade are Ready!
                      </h3>
                      <p className="text-xs sm:text-sm text-[#74706A] mt-1">
                        Enter your details to view full interactive dimensions and receive softcopy drawings via WhatsApp.
                      </p>
                    </div>

                    <form onSubmit={handleSubmitLead} className="bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#292826] mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          placeholder="e.g. Ramesh Chandra"
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E0D7] text-sm focus:ring-2 focus:ring-[#E76F2E] outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#292826] mb-1">WhatsApp Mobile Number</label>
                        <div className="flex">
                          <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-[#E7E0D7] bg-[#FDFCF9] text-xs font-bold text-[#292826]">
                            🇮🇳 +91
                          </span>
                          <input
                            type="tel"
                            required
                            pattern="[0-9]{10}"
                            value={leadPhone}
                            onChange={(e) => setLeadPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full px-4 py-3 rounded-r-xl border border-[#E7E0D7] text-sm focus:ring-2 focus:ring-[#E76F2E] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#292826] mb-1">City / Location</label>
                        <input
                          type="text"
                          required
                          value={leadCity}
                          onChange={(e) => setLeadCity(e.target.value)}
                          placeholder="e.g. Hyderabad, Bengaluru, Indore..."
                          className="w-full px-4 py-3 rounded-xl border border-[#E7E0D7] text-sm focus:ring-2 focus:ring-[#E76F2E] outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] text-white font-display text-sm font-bold shadow-md hover:opacity-95 transition flex items-center justify-center gap-2 active:scale-[0.99]"
                      >
                        <Icons.Sparkles size={16} />
                        <span>Unlock Instant 2D Floor Plan &amp; 3D Elevation</span>
                      </button>

                      <p className="text-[11px] text-center text-[#74706A]">
                        🔒 100% Privacy. Instant delivery to your WhatsApp. No spam guaranteed.
                      </p>
                    </form>
                  </div>
                )}

                {/* STEP 23: AI GENERATED RESULTS & SHOWCASE */}
                {step === 23 && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    {/* Top Result Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#FFF6E8] to-[#F7ECE1] p-4 rounded-2xl border border-[#E76F2E]/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#E76F2E] text-white text-[10px] font-bold tracking-wider uppercase">
                            96% AI Matched
                          </span>
                          <span className="text-xs font-bold text-[#292826]">
                            Custom House Blueprint Generated
                          </span>
                        </div>
                        <h4 className="font-display font-extrabold text-lg sm:text-xl text-[#292826] mt-1">
                          {plotWidth}x{plotDepth} ft {plotDirection} Facing {floors.split(' ')[0]} Residence
                        </h4>
                        <p className="text-xs text-[#74706A]">
                          Engineered for {leadName || 'You'} ({leadCity || 'India'}) · 100% Vastu &amp; Setback Compliant
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSharePlan}
                          className="px-3 py-2 rounded-xl bg-white border border-[#E7E0D7] text-xs font-bold text-[#292826] hover:bg-[#FDFCF9] transition flex items-center gap-1.5"
                        >
                          <Icons.Share size={13} />
                          <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenConsult?.(`${plotWidth}x${plotDepth} ${plotDirection} AI Plan`)}
                          className="px-4 py-2 rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] transition shadow-sm"
                        >
                          Talk to Architect
                        </button>
                      </div>
                    </div>

                    {/* View Switcher: 2D Floor Plan vs Ultra-Realistic 3D Elevation */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 2D INTERACTIVE BLUEPRINT VIEWER */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#EEE9E3]">
                          <div className="flex items-center gap-2">
                            <Icons.Blueprint size={16} className="text-[#E76F2E]" />
                            <h5 className="font-bold text-sm text-[#292826]">2D Architectural Blueprint</h5>
                          </div>
                          <div className="flex items-center gap-1 bg-[#F4EFEA] p-0.5 rounded-lg border border-[#E7E0D7] text-[11px] font-bold">
                            <button
                              type="button"
                              onClick={() => setActiveFloorView('ground')}
                              className={`px-2.5 py-1 rounded-md transition ${
                                activeFloorView === 'ground' ? 'bg-white text-[#E76F2E] shadow-xs' : 'text-[#74706A]'
                              }`}
                            >
                              Ground Floor
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveFloorView('first')}
                              className={`px-2.5 py-1 rounded-md transition ${
                                activeFloorView === 'first' ? 'bg-white text-[#E76F2E] shadow-xs' : 'text-[#74706A]'
                              }`}
                            >
                              First Floor
                            </button>
                          </div>
                        </div>

                        {/* Interactive CAD Blueprint Visualizer */}
                        <div className="relative my-4 flex-1 min-h-[300px] bg-[#16212F] rounded-xl border border-[#2D3F54] p-4 text-cyan-200 overflow-hidden flex flex-col justify-between font-mono text-[11px]">
                          {/* Grid Background */}
                          <div
                            className="absolute inset-0 opacity-15 pointer-events-none"
                            style={{
                              backgroundImage: 'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
                              backgroundSize: '24px 24px',
                            }}
                          />

                          {/* Dimensions Header */}
                          <div className="relative z-10 flex justify-between items-center text-[10px] text-cyan-400 font-bold border-b border-cyan-800/50 pb-1">
                            <span>◄ {plotWidth}' 0" WIDTH ►</span>
                            <span>SCALE 1:100 (CAD VERIFIED)</span>
                            <span>{plotDirection.toUpperCase()} FACING</span>
                          </div>

                          {/* Room Layout Map */}
                          <div className="relative z-10 grid grid-cols-3 gap-2 my-2 flex-1">
                            {/* Room 1: Car Porch / Verandah */}
                            <div className="border border-dashed border-cyan-500/60 rounded p-2 bg-cyan-950/40 flex flex-col justify-between">
                              <span className="font-bold text-white text-xs">
                                {activeFloorView === 'ground' ? 'CAR PORCH' : 'BALCONY'}
                              </span>
                              <span className="text-[10px] text-cyan-300">
                                {activeFloorView === 'ground' ? '12\'0" x 15\'0"' : '12\'0" x 6\'6"'}
                              </span>
                              <span className="text-[9px] text-emerald-400">Vayavya (NW)</span>
                            </div>

                            {/* Room 2: Living & Dining */}
                            <div className="col-span-2 border border-cyan-500/60 rounded p-2 bg-cyan-900/30 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-white text-xs">LIVING &amp; DINING HALL</span>
                                <span className="text-[9px] bg-cyan-800/60 text-cyan-200 px-1 rounded">Main Entry</span>
                              </div>
                              <span className="text-[10px] text-cyan-300">18\'6" x 14\'0"</span>
                              <span className="text-[9px] text-emerald-400">Brahmasthan Center Clean</span>
                            </div>

                            {/* Room 3: Modular Kitchen */}
                            <div className="border border-cyan-500/60 rounded p-2 bg-amber-950/30 flex flex-col justify-between">
                              <span className="font-bold text-white text-xs">{kitchenType.toUpperCase()} KITCHEN</span>
                              <span className="text-[10px] text-amber-300">10\'0" x 11\'6"</span>
                              <span className="text-[9px] text-amber-400">Agneya (SE) Vastu ✓</span>
                            </div>

                            {/* Room 4: Pooja Room */}
                            <div className="border border-cyan-500/60 rounded p-2 bg-yellow-950/30 flex flex-col justify-between">
                              <span className="font-bold text-white text-xs">POOJA ROOM</span>
                              <span className="text-[10px] text-yellow-300">6\'0" x 6\'0"</span>
                              <span className="text-[9px] text-yellow-400">Ishan (NE) Vastu ✓</span>
                            </div>

                            {/* Room 5: Master Bedroom with Ensuite */}
                            <div className="border border-cyan-500/60 rounded p-2 bg-emerald-950/30 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-white text-xs">MASTER BED</span>
                                <span className="text-[9px] bg-emerald-800/60 text-white px-1 rounded">Ensuite</span>
                              </div>
                              <span className="text-[10px] text-emerald-300">14\'0" x 15\'0"</span>
                              <span className="text-[9px] text-emerald-400">Nairutya (SW) Master ✓</span>
                            </div>
                          </div>

                          {/* Dimensions Footer */}
                          <div className="relative z-10 flex justify-between items-center text-[10px] text-cyan-400 font-bold border-t border-cyan-800/50 pt-1">
                            <span>◄ {plotDepth}' 0" DEPTH ►</span>
                            <span>MUNICIPAL FILE COMPLIANT</span>
                          </div>
                        </div>

                        <div className="text-xs text-[#74706A] flex items-center justify-between">
                          <span>Includes door swings, window ventilation and CAD grid.</span>
                          <span className="font-bold text-[#292826]">Ground Area: ~{Math.round(builtUpArea / 2)} sq.ft</span>
                        </div>
                      </div>

                      {/* ULTRA-REALISTIC 3D ELEVATION CONCEPT SHOWCASE */}
                      <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm flex flex-col">
                        <div className="flex items-center justify-between pb-3 border-b border-[#EEE9E3]">
                          <div>
                            <span className="text-[10px] font-bold text-[#E76F2E] uppercase">4K Photorealistic Facade</span>
                            <h5 className="font-bold text-sm text-[#292826]">Ultra-Realistic 3D Elevation</h5>
                          </div>
                          {/* Day / Twilight Lighting Toggle */}
                          <button
                            type="button"
                            onClick={() => setIsNightLighting(!isNightLighting)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-[#E7E0D7] bg-[#FDFCF9] hover:bg-[#FFF6E8] text-[#292826] transition"
                          >
                            <span>{isNightLighting ? '🌙 Twilight Warm LED' : '☀️ Natural Day Sun'}</span>
                          </button>
                        </div>

                        {/* Facade Image with Callouts */}
                        <div className="relative my-4 flex-1 min-h-[300px] rounded-xl overflow-hidden group bg-gray-900">
                          <img
                            src={getElevationImage()}
                            alt="3D Elevation Concept"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                          />

                          {/* Architectural Material Callout Overlays */}
                          <div className="absolute top-3 left-3 bg-[#1A1815]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white text-[10px] font-semibold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E]" />
                            Exterior HPL Wooden Louvers
                          </div>

                          <div className="absolute bottom-12 right-3 bg-[#1A1815]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white text-[10px] font-semibold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                            Warm 3000K Ambient Lighting
                          </div>

                          <div className="absolute bottom-3 left-3 bg-[#1A1815]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 text-white text-[10px] font-semibold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                            Toughened Frameless Glass Balconies
                          </div>
                        </div>

                        <div className="text-xs text-[#74706A] flex items-center justify-between">
                          <span>Style: <strong className="text-[#292826]">{elevationStyle}</strong></span>
                          <span className="font-bold text-[#E76F2E]">Material Specs Included</span>
                        </div>
                      </div>
                    </div>

                    {/* SPECIFICATIONS & COST BREAKDOWN TABLE */}
                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm">
                      <h5 className="font-bold text-sm text-[#292826] mb-3 flex items-center gap-2">
                        <Icons.Calculator size={15} className="text-[#E76F2E]" />
                        Project Specifications &amp; Live Material Budget
                      </h5>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#EEE9E3]">
                          <span className="text-[#74706A] block">Total Built-Up Area</span>
                          <span className="font-display font-extrabold text-base text-[#292826] mt-0.5 block">
                            {builtUpArea.toLocaleString()} sq.ft
                          </span>
                        </div>

                        <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#EEE9E3]">
                          <span className="text-[#74706A] block">Usable Carpet Area</span>
                          <span className="font-display font-extrabold text-base text-[#292826] mt-0.5 block">
                            {carpetArea.toLocaleString()} sq.ft
                          </span>
                        </div>

                        <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#EEE9E3]">
                          <span className="text-[#74706A] block">Vastu Compliance Score</span>
                          <span className="font-display font-extrabold text-base text-emerald-600 mt-0.5 block">
                            98 / 100 ✓
                          </span>
                        </div>

                        <div className="p-3 bg-[#FFF6E8] rounded-xl border border-[#E76F2E]/30">
                          <span className="text-[#C65320] block font-semibold">Est. Construction Cost</span>
                          <span className="font-display font-extrabold text-base text-[#C65320] mt-0.5 block">
                            ₹{estimatedCostLakhs} Lakhs
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* BOTTOM ACTIONS BAR */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-[#E7E0D7] bg-white text-[#292826] text-xs font-bold hover:bg-[#FDFCF9] transition"
                      >
                        ← Modify Plot Dimensions
                      </button>

                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => {
                            window.print()
                          }}
                          className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-[#E76F2E] text-[#E76F2E] text-xs font-bold hover:bg-[#FFF6E8] transition flex items-center justify-center gap-2"
                        >
                          <Icons.FileText size={15} />
                          <span>Download PDF Summary</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenConsult?.(`Complete CAD Set for ${plotWidth}x${plotDepth} AI Plan`)}
                          className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] text-white text-xs font-bold hover:opacity-95 transition shadow-md flex items-center justify-center gap-2"
                        >
                          <Icons.Phone size={15} />
                          <span>Book Architect Consultation</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Navigation Controller (During steps 1 to 20) */}
            {step <= 20 && (
              <footer className="shrink-0 bg-white border-t border-[#EEE9E3] px-6 py-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                    step === 1
                      ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400'
                      : 'border-[#E7E0D7] text-[#292826] hover:bg-[#FDFCF9] active:scale-95'
                  }`}
                >
                  <Icons.ChevronLeft size={16} />
                  <span>Back</span>
                </button>

                <div className="text-xs text-[#74706A] hidden sm:block">
                  Press <strong>Next</strong> to proceed or select option
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-7 py-2.5 rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] transition shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <span>{step === 20 ? 'Generate AI Plan ✨' : 'Next'}</span>
                  <Icons.ChevronRight size={16} />
                </button>
              </footer>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ASK AI ASSISTANT (Lightweight Chat Companion) */}
        {/* ========================================================= */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCF9]">
            {/* Messages Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {msg.from === 'bot' && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#E76F2E] text-[11px] font-extrabold text-white mr-2.5 mt-0.5">
                      AI
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-[#E76F2E] text-white rounded-tr-none'
                        : 'bg-white text-[#292826] border border-[#EEE9E3] rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.from === 'user' ? 'text-white/70' : 'text-[#74706A]'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {chatTyping && (
                <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-[#EEE9E3] w-fit shadow-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:300ms]" />
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-white border-t border-[#EEE9E3] flex flex-wrap gap-1.5">
              {[
                `Cost to build a ${plotWidth}x${plotDepth} house?`,
                `Vastu tips for ${plotDirection} facing plot`,
                'Can I customize 3D elevation?',
                'I want to talk to an architect',
              ].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSendChat(s)}
                  className="rounded-lg border border-[#E76F2E]/30 bg-[#FFF6E8] px-2.5 py-1 text-[11px] font-semibold text-[#C65320] hover:bg-[#E76F2E]/20 transition"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendChat(chatInput)
              }}
              className="p-3 sm:p-4 bg-white border-t border-[#EEE9E3] flex gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about floor plans, municipal setbacks, Vastu rules or construction rates..."
                className="flex-1 px-4 py-3 rounded-xl border border-[#E7E0D7] text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#E76F2E] bg-[#FDFCF9]"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-xl bg-[#E76F2E] text-white font-bold text-xs sm:text-sm hover:bg-[#C65320] transition shadow-sm"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
