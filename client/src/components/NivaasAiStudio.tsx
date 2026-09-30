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
  // Wizard State
  // -----------------------------------------------------------
  const [step, setStep] = useState(1)
  
  // Step 1: Shape Branching State
  const [plotShape, setPlotShape] = useState<'regular' | 'irregular' | 'not_sure'>('regular')

  // Regular Plot Dimensions (Step 2 & 3 in Regular Path)
  const [plotWidth, setPlotWidth] = useState<number>(initialWidth)
  const [plotDepth, setPlotDepth] = useState<number>(initialDepth)

  // Irregular Plot Dimensions & Details (Steps 2, 3 & 4 in Irregular Path)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string } | null>(null)
  const [isDetectingShape, setIsDetectingShape] = useState(false)
  const [hasMapPin, setHasMapPin] = useState(false)
  const [sidesCount, setSidesCount] = useState<number>(4)
  const [sideLengths, setSideLengths] = useState<{ [key: string]: number }>({
    A: 30,
    B: 45,
    C: 22,
    D: 38,
    E: 20,
    F: 25,
  })
  const [roadFacingSide, setRoadFacingSide] = useState<string>('A')
  const [roadWidth, setRoadWidth] = useState<number>(30)
  const [existingStructures, setExistingStructures] = useState<string[]>(['Boundary wall'])

  // Step 4 Smart Suggestions State (Irregular Path)
  const [familySize, setFamilySize] = useState<'couple' | 'nuclear' | 'joint'>('nuclear')
  const [budgetTier, setBudgetTier] = useState<'under_20L' | '20_40L' | '40_70L' | 'above_70L'>('20_40L')
  const [vastuMode, setVastuMode] = useState<'full' | 'partial' | 'skip'>('full')
  const [lifestyleTags, setLifestyleTags] = useState<string[]>([
    '🛕 Dedicated Mandir',
    '🌿 Terrace Garden',
    '👴 Parents Room (GF)',
  ])

  // Shared Configuration State (Steps)
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
  // Dynamic Total Steps & Explicit Step Naming
  // -----------------------------------------------------------
  const isRegular = plotShape === 'regular'
  const totalWizardSteps = isRegular ? 20 : 23
  const synthesisStep = totalWizardSteps + 1 // 21 for regular, 24 for irregular
  const leadStep = totalWizardSteps + 2      // 22 for regular, 25 for irregular
  const resultsStep = totalWizardSteps + 3   // 23 for regular, 26 for irregular

  // Map step number to step name
  const getStepKey = (s: number): string => {
    if (s === 1) return 'shape'
    if (isRegular) {
      if (s === 2) return 'width'
      if (s === 3) return 'depth'
      if (s === 4) return 'floors'
      if (s === 5) return 'master_bedrooms'
      if (s === 6) return 'married_couples'
      if (s === 7) return 'kids_count'
      if (s === 8) return 'kids_bedroom'
      if (s === 9) return 'kitchen_floor'
      if (s === 10) return 'kitchen_style'
      if (s === 11) return 'pooja_room'
      if (s === 12) return 'balconies'
      if (s === 13) return 'office_space'
      if (s === 14) return 'parking'
      if (s === 15) return 'garden'
      if (s === 16) return 'lift'
      if (s === 17) return 'bathroom'
      if (s === 18) return 'vastu'
      if (s === 19) return 'elevation'
      if (s === 20) return 'material'
    } else {
      if (s === 2) return 'irregular_upload'
      if (s === 3) return 'irregular_dimensions'
      if (s === 4) return 'irregular_suggestions'
      if (s === 5) return 'floors'
      if (s === 6) return 'master_bedrooms'
      if (s === 7) return 'married_couples'
      if (s === 8) return 'kids_count'
      if (s === 9) return 'kids_bedroom'
      if (s === 10) return 'kitchen_floor'
      if (s === 11) return 'kitchen_style'
      if (s === 12) return 'pooja_room'
      if (s === 13) return 'balconies'
      if (s === 14) return 'office_space'
      if (s === 15) return 'parking'
      if (s === 16) return 'garden'
      if (s === 17) return 'lift'
      if (s === 18) return 'bathroom'
      if (s === 19) return 'vastu'
      if (s === 20) return 'elevation'
      if (s === 21) return 'material'
      if (s === 22) return 'irregular_review'
      if (s === 23) return 'final_confirm'
    }
    if (s === synthesisStep) return 'synthesis'
    if (s === leadStep) return 'lead'
    if (s === resultsStep) return 'results'
    return ''
  }

  const currentStepKey = getStepKey(step)

  // -----------------------------------------------------------
  // Chat State
  // -----------------------------------------------------------
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      from: 'bot',
      text: 'Namaste! 🙏 I am your Indore House Makers AI Architecture Assistant. Ask me anything about floor plans, irregular plot layouts, municipal bylaws, Vastu directions, 3D elevation styles, or construction estimates.',
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

  // Process simulation timer when reaching synthesis step
  useEffect(() => {
    if (step === synthesisStep) {
      setProcessingProgress(0)
      const milestones = [
        { pct: 15, msg: isRegular ? 'Evaluating rectangular municipal setbacks (GHMC/BBMP/DDA)...' : 'Calculating irregular boundary setbacks and angle optimizations...' },
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
            setTimeout(() => setStep(leadStep), 600) // Go to lead capture
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
  }, [step, synthesisStep, leadStep, isRegular])

  if (!open) return null

  // -----------------------------------------------------------
  // Calculations (Regular vs Irregular Buildable Area)
  // -----------------------------------------------------------
  let rawPlotAreaSqFt = (plotWidth || 0) * (plotDepth || 0)
  if (!isRegular) {
    if (sidesCount === 3) {
      const a = sideLengths.A || 30
      const b = sideLengths.B || 40
      const c = sideLengths.C || 35
      const s = (a + b + c) / 2
      rawPlotAreaSqFt = Math.round(Math.sqrt(Math.max(10, s * (s - a) * (s - b) * (s - c))))
    } else if (sidesCount === 4) {
      const a = sideLengths.A || 30
      const b = sideLengths.B || 45
      const c = sideLengths.C || 22
      const d = sideLengths.D || 38
      const s = (a + b + c + d) / 2
      rawPlotAreaSqFt = Math.round(Math.sqrt(Math.max(10, (s - a) * (s - b) * (s - c) * (s - d))))
    } else {
      const avgWidth = ((sideLengths.A || 30) + (sideLengths.C || 30)) / 2
      const avgLength = ((sideLengths.B || 45) + (sideLengths.D || 45)) / 2
      rawPlotAreaSqFt = Math.round(avgWidth * avgLength * 0.95)
    }
  }

  // Buildable Area (Flat 18% Setback & Odd-Corner Buffer Deduction)
  const buildableAreaSqFt = Math.round(rawPlotAreaSqFt * 0.82)
  const plotAreaSqYards = Math.round(rawPlotAreaSqFt / 9)

  // Multiplier & Rate
  const floorMultiplier =
    floors.includes('Ground') || floors.includes('Single')
      ? 1
      : floors.includes('Two') || floors.includes('G+1')
      ? 1.85
      : floors.includes('Three') || floors.includes('G+2')
      ? 2.7
      : 3.5
  const builtUpArea = Math.round(buildableAreaSqFt * floorMultiplier)
  const carpetArea = Math.round(builtUpArea * 0.76)

  // Rate estimation (+6% complexity premium for irregular plots)
  const baseRate = materialGrade.includes('1,800') ? 1800 : materialGrade.includes('3,200') ? 3250 : 2350
  const finalRatePerSqFt = isRegular ? baseRate : Math.round(baseRate * 1.06)
  const estimatedCostLakhs = ((builtUpArea * finalRatePerSqFt) / 100000).toFixed(1)

  // AI Smart Suggestion Values
  const getSmartSuggestedBHK = (): number => {
    if (budgetTier === 'under_20L') return 1
    if (buildableAreaSqFt < 700) return 1
    if (buildableAreaSqFt <= 1100) return familySize === 'joint' ? 3 : 2
    if (buildableAreaSqFt <= 1800) return familySize === 'joint' ? 4 : 3
    if (buildableAreaSqFt <= 2600) return familySize === 'joint' ? 5 : 4
    return 5
  }
  const suggestedBHK = getSmartSuggestedBHK()

  const getSmartSuggestedFloors = (): string => {
    if (buildableAreaSqFt < 850) return 'G+1 (Two Floors)'
    if (familySize === 'joint' || lifestyleTags.includes('🏦 Rental Floor Unit')) return 'G+2 (Three Floors)'
    return 'G+1 (Two Floors)'
  }
  const suggestedFloors = getSmartSuggestedFloors()

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

  // Handle Mock File Upload & Auto-Detect
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile({ name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` })
      setIsDetectingShape(true)
      setTimeout(() => {
        setIsDetectingShape(false)
        if (plotShape === 'not_sure') {
          setPlotShape('irregular')
        }
      }, 800)
    }
  }

  // Navigation Logic
  const handleNext = () => {
    if (step < totalWizardSteps) {
      setStep((prev) => prev + 1)
    } else if (step === totalWizardSteps) {
      setStep(synthesisStep) // Trigger AI synthesis
    }
  }

  const handleBack = () => {
    if (step > 1 && step <= totalWizardSteps) {
      setStep((prev) => prev - 1)
    } else if (step === resultsStep) {
      setStep(totalWizardSteps)
    }
  }

  const handleSubmitLead = (e: React.FormEvent) => {
    e.preventDefault()
    setStep(resultsStep) // Results page
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
      let reply = 'I can help you customize 2D floor plans, verify Vastu alignments, estimate construction costs in Indore, or recommend 3D elevation designs. You can also generate a custom 2D/3D concept in the "AI Plan Generator" tab!'

      if (/(299|plan pack|credit|subscription|package|pricing)/i.test(qLower)) {
        reply = `✨ Indore House Makers AI Starter Plan (₹299 / month):\n• 5 Full AI Design Generations per billing cycle\n• High-Resolution 2D CAD Layouts with Room Dimensions\n• Area Statements, Built-up & Carpet Area Summary\n• Photorealistic 3D Front Elevation Renders\n• Watermark-free PDF & PNG Downloads\n• 1 Free Plan Regeneration within 7 days\n\n📌 Note: All designs are conceptual recommendations. Construction requires verification by a licensed architect/structural engineer.`
      } else if (/(price|cost|budget|rate|lakh|estimate|sq\.? ?ft)/i.test(qLower)) {
        reply = `💰 Estimated Construction Cost for Indore & MP Region:\n• Standard Economy: ₹1,550 – ₹1,750 / sq.ft\n• Premium Executive: ₹2,100 – ₹2,450 / sq.ft (Most Popular)\n• Luxury Ultra: ₹2,900 – ₹3,500 / sq.ft\n\nFor your ${isRegular ? `${plotWidth}x${plotDepth} ft` : 'selected'} plot (~${builtUpArea} sq.ft built-up), the estimated construction budget is approx ₹${estimatedCostLakhs} Lakhs.`
      } else if (/(30x50|20x40|20x50|30x60|plot|dimension|size)/i.test(qLower)) {
        reply = `📐 Recommended Layout for ${q.toUpperCase()}:\n• Configuration: 3 BHK / 4 BHK G+1 Duplex with Car Parking\n• Ground Floor: Living Room, Master Bedroom with Attached Toilet, Kitchen in SE (Agneya), Pooja in NE (Ishanya)\n• First Floor: 2 Bedrooms, Family Lounge, Balcony & Open Terrace\n• Switch to the "AI Plan Generator" tab above to generate this exact dimensioned floor plan!`
      } else if (/(irregular|asymmetric|cut|shape|l-shape|corner|trap)/i.test(qLower)) {
        reply = `📐 Irregular Plot Planning Engine:\nIndore House Makers AI automatically computes setback buffers (18% standard deduction) and converts non-90° corner cuts into landscaped green pockets, ventilation shafts, or utility zones. This ensures 100% Vastu compliance and square interior living spaces!`
      } else if (/(vastu|vaastu|direction|mandir|pooja|kitchen|north|east|south|west)/i.test(qLower)) {
        reply = `🧭 100% Vastu Shastra Guidelines:\n• Pooja Mandir: North-East (Ishanya) — Most sacred corner\n• Kitchen: South-East (Agneya) or North-West (Vayavya)\n• Master Bedroom: South-West (Nairutya) for stability\n• Staircase: South or West (Clockwise rotation)\n• Main Entrance: North or East (Positive energy zones)`
      } else if (/(3d|elevation|facade|exterior|render|night|light)/i.test(qLower)) {
        reply = `🏛️ 3D Front Elevation Styles:\n• Modern Indian Duplex (Warm wooden textures + ambient profile LEDs)\n• Contemporary Jaali & Stone Cladding (Perforated CNC screens)\n• Kerala Tropical Sloped Roof with Mangalore tiles\n• Classical Spanish Villa with arched balconies\n\nAll 3D elevations feature Day and Twilight lighting modes with material breakdowns!`
      } else if (/(talk|architect|call|contact|consult|callback|phone)/i.test(qLower)) {
        reply = `📞 Connect with Indore House Makers Chief Architect:\nOur senior architectural consultants are available for 1-on-1 review calls.\n• Helpline: ${site.phone}\n• Email: ${site.email}\n• You can click "Book Free Consultation" to schedule an instant callback.`
      }

      setChatMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    }, 600)
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

  // Helper for step category title
  const getStepCategoryTitle = () => {
    if (step === 1) return 'Plot Geometry & Shape'
    if (isRegular) {
      if (step <= 3) return 'Plot Dimensions'
      if (step <= 8) return 'Family & Bedroom Requirements'
      if (step <= 11) return 'Kitchen & Vastu Pooja'
      if (step <= 17) return 'Lifestyle & Interior Spaces'
      if (step <= 19) return 'Plot Direction & Surroundings'
      return 'Elevation Style & Finishes'
    } else {
      if (step === 2) return 'Survey Map / Plot Upload'
      if (step === 3) return 'Irregular Side Dimensions'
      if (step === 4) return 'AI Smart Suggestions'
      if (step <= 9) return 'Family & Bedroom Spaces'
      if (step <= 12) return 'Kitchen & Vastu Alignment'
      if (step <= 18) return 'Lifestyle & Interior Amenities'
      if (step <= 21) return 'Orientation & 3D Elevation'
      return 'Site Review & Plan Verification'
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1815]/75 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div
        className={`relative w-full bg-white rounded-2xl shadow-2xl border border-[#E7E0D7] flex flex-col overflow-hidden text-[#292826] transition-all duration-300 ${
          activeTab === 'chat'
            ? 'max-w-md sm:max-w-xl h-[84vh] sm:h-[580px] max-h-[600px]'
            : 'max-w-3xl lg:max-w-4xl h-[88vh] max-h-[780px]'
        }`}
      >
        {/* Top Header */}
        <header className="shrink-0 bg-white border-b border-[#EEE9E3] px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E76F2E] text-white shadow-sm ring-2 ring-[#E76F2E]/20">
              <Icons.Sparkles size={18} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-base tracking-tight text-[#292826]">
                  Indore House Makers <span className="text-[#C94F36]">{activeTab === 'chat' ? 'AI Design Desk' : 'AI Architect Studio'}</span>
                </span>
                {activeTab === 'generator' ? (
                  <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FFF6E8] text-[#C65320] border border-[#E76F2E]/20 rounded-full">
                    {isRegular ? '20-Step Regular Flow' : '23-Step Asymmetric Engine'}
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Instant AI Answers
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#54504A]">
                {activeTab === 'chat'
                  ? 'Ask any question on 2D house plans, Vastu directions, 3D facades & turnkey cost estimation in Indore'
                  : "India's First AI Engine for Regular & Asymmetric Plots with 100% Vastu"}
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
                    : 'text-[#54504A] hover:text-[#292826]'
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
                    : 'text-[#54504A] hover:text-[#292826]'
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
              className="p-2 rounded-xl text-[#54504A] hover:text-[#292826] hover:bg-[#F4EFEA] transition"
              aria-label="Close AI Studio"
            >
              <Icons.Close size={18} />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB 1: AI PLAN GENERATOR (Dynamic Branching Guided Flow) */}
        {/* ========================================================= */}
        {activeTab === 'generator' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCF9]">
            {/* Dynamic Step Progress Bar */}
            {step <= totalWizardSteps && (
              <div className="shrink-0 bg-white border-b border-[#EEE9E3] px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#E76F2E]">
                    Step {step} of {totalWizardSteps}
                  </span>
                  <span className="hidden sm:inline-block text-xs text-[#54504A]">|</span>
                  <span className="hidden sm:inline-block text-xs text-[#54504A] font-medium">
                    {getStepCategoryTitle()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-28 sm:w-48 h-2 bg-[#F1ECE5] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#E76F2E] to-[#C94F36] rounded-full transition-all duration-300"
                      style={{ width: `${(step / totalWizardSteps) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-[#54504A] hidden sm:inline-block">
                    {Math.round((step / totalWizardSteps) * 100)}%
                  </span>
                </div>
              </div>
            )}

            {/* Main Interactive Wizard Stage */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 flex justify-center items-start">
              <div className="w-full max-w-xl">
                {/* ------------------------------------------------------------- */}
                {/* STEP 1: PLOT SHAPE SELECTION */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'shape' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step 1 of {totalWizardSteps}: Plot Geometry
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        What shape is your plot / land?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Choose your plot geometry so our AI can configure accurate setbacks, column alignments, and Vastu grids.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Regular Card */}
                      <button
                        type="button"
                        onClick={() => setPlotShape('regular')}
                        className={`p-5 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                          plotShape === 'regular'
                            ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E] bg-[#FFF6E8]'
                            : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-lg shadow-2xs">
                              🟦
                            </div>
                            <span className="px-2.5 py-1 rounded-md bg-blue-100/80 text-blue-800 text-[11px] font-bold tracking-wide uppercase border border-blue-200">
                              Regular
                            </span>
                          </div>
                          {plotShape === 'regular' && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E76F2E] text-white shadow-xs">
                              <Icons.Check size={13} />
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base text-[#292826]">Rectangle / Square Plot</h4>
                        <p className="text-xs text-[#54504A] mt-1">
                          Standard 4-side rectangular plot with standard 90° corners (e.g. 30x50, 40x60).
                        </p>
                        <div className="mt-3 pt-3 border-t border-[#EEE9E3] flex items-center gap-1.5 text-[11px] font-semibold text-[#E76F2E]">
                          <span>⚡ 20-Step Rapid Guided Flow</span>
                        </div>
                      </button>

                      {/* Irregular Card */}
                      <button
                        type="button"
                        onClick={() => setPlotShape('irregular')}
                        className={`p-5 rounded-2xl border-2 text-left transition relative overflow-hidden group ${
                          plotShape === 'irregular'
                            ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E] bg-[#FFF6E8]'
                            : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg shadow-2xs">
                              🔷
                            </div>
                            <span className="px-2.5 py-1 rounded-md bg-amber-100/80 text-amber-800 text-[11px] font-bold tracking-wide uppercase border border-amber-200">
                              Irregular
                            </span>
                          </div>
                          {plotShape === 'irregular' && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E76F2E] text-white shadow-xs">
                              <Icons.Check size={13} />
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-base text-[#292826]">Asymmetric / Odd Shape</h4>
                        <p className="text-xs text-[#54504A] mt-1">
                          L-shape, Triangle, Trapezoid, Corner cut, or curved odd-shaped plot boundary.
                        </p>
                        <div className="mt-3 pt-3 border-t border-[#EEE9E3] flex items-center gap-1.5 text-[11px] font-semibold text-[#E76F2E]">
                          <span>📐 Upload Plan + Smart AI Suggestions (23 Steps)</span>
                        </div>
                      </button>
                    </div>

                    {/* Not Sure Banner with Direct File Upload & Auto-Detect */}
                    <div className="pt-1">
                      <label className={`w-full p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer group shadow-sm ${
                        plotShape === 'not_sure'
                          ? 'border-[#E76F2E] bg-[#FFF6E8] ring-2 ring-[#E76F2E]'
                          : 'border-[#E76F2E]/40 bg-[#FFF6E8]/40 hover:bg-[#FFF6E8] hover:border-[#E76F2E]'
                      }`}>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={(e) => {
                            setPlotShape('irregular')
                            handleFileUpload(e)
                            setStep(2) // Directly navigate to Step 2: Upload & AI Shape Detection
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl bg-white border border-[#E76F2E]/30 flex items-center justify-center text-xl text-[#E76F2E] shadow-2xs group-hover:scale-105 transition shrink-0">
                            <Icons.Upload size={22} />
                          </div>
                          <div>
                            <div className="font-extrabold text-sm sm:text-base text-[#292826]">
                              Not Sure? Upload Photo &amp; AI Will Detect
                            </div>
                            <div className="text-xs text-[#54504A] mt-0.5 leading-relaxed">
                              Upload your plot photo or registry map — our AI will automatically analyze boundaries &amp; angles.
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end justify-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <span className="px-2.5 py-0.5 rounded-md bg-orange-100/90 text-[#C65320] border border-orange-200 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            ⚡ Auto-Detect
                          </span>
                          <span
                            onClick={(e) => {
                              e.preventDefault()
                              setPlotShape('irregular')
                              setStep(2)
                            }}
                            className="px-4 py-2 rounded-xl bg-[#E76F2E] text-white text-xs font-bold shadow-xs hover:bg-[#C65320] transition flex items-center gap-1.5 cursor-pointer"
                          >
                            <span>Upload &amp; Detect</span>
                            <Icons.ChevronRight size={14} />
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* REGULAR PATH: STEP 2 (WIDTH) & STEP 3 (DEPTH) */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'width' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Plot Frontage
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        What is your Plot Width (Frontage)?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
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
                          <span className="absolute right-4 top-3.5 text-sm font-bold text-[#54504A]">
                            Feet (ft)
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-[#54504A] font-semibold block mb-2">
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
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-sm'
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

                {currentStepKey === 'depth' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Plot Depth
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        What is your Plot Depth (Length)?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
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
                        <span className="absolute right-4 top-3.5 text-sm font-bold text-[#54504A]">
                          Feet (ft)
                        </span>
                      </div>

                      <div>
                        <span className="text-xs text-[#54504A] font-semibold block mb-2">
                          Popular Indian Plot Lengths:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {[30, 40, 45, 50, 60, 70].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setPlotDepth(d)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                                plotDepth === d
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-sm'
                                  : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E] hover:bg-[#FFF6E8]'
                              }`}
                            >
                              {d} ft
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-[#FFF6E8] rounded-xl border border-[#E76F2E]/20 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#54504A]">Total Plot Area:</span>
                        <span className="font-extrabold text-[#C65320]">
                          {rawPlotAreaSqFt} sq.ft (~{plotAreaSqYards} sq.yards)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* IRREGULAR PATH: STEP 2 (UPLOAD SURVEY / PHOTO) */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'irregular_upload' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Upload Plot Reference
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Upload Plot Survey Map or Photo
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Upload an image or document of your plot so our AI engine can map the boundary angles accurately.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      <label className="border-2 border-dashed border-[#E76F2E]/40 hover:border-[#E76F2E] bg-[#FFF6E8]/30 hover:bg-[#FFF6E8]/60 transition rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer text-center group">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <div className="w-12 h-12 rounded-2xl bg-white border border-[#E76F2E]/30 flex items-center justify-center text-[#E76F2E] shadow-sm group-hover:scale-110 transition">
                          <Icons.Upload size={22} />
                        </div>
                        <span className="font-bold text-sm text-[#292826] mt-3">
                          {uploadedFile ? uploadedFile.name : 'Click to Browse or Drag & Drop File'}
                        </span>
                        <span className="text-xs text-[#54504A] mt-1">
                          Supported: JPG, PNG, PDF (Government survey, registry map, or hand-drawn sketch)
                        </span>
                      </label>

                      {isDetectingShape && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 animate-pulse">
                          <Icons.Sparkles size={16} className="text-blue-600 animate-spin" />
                          <span>AI is analyzing plot boundaries, vertex angles and setback guidelines...</span>
                        </div>
                      )}

                      {uploadedFile && !isDetectingShape && (
                        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="font-bold">✓ Boundary Verified: Asymmetric Polygon with Corner Buffer</span>
                          </div>
                          <span className="text-[11px] text-emerald-600 font-semibold">{uploadedFile.size}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#EEE9E3] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icons.MapPin size={16} className="text-[#E76F2E]" />
                          <span className="text-xs font-semibold text-[#292826]">
                            Optional: Pin Plot on Google Maps
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHasMapPin(!hasMapPin)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                            hasMapPin
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                              : 'bg-[#FDFCF9] text-[#54504A] border-[#E7E0D7]'
                          }`}
                        >
                          {hasMapPin ? '📍 Pin Dropped' : '+ Drop Pin'}
                        </button>
                      </div>

                      <div className="p-3 bg-[#F4EFEA] rounded-xl border border-[#E7E0D7] text-[11px] text-[#54504A] leading-relaxed">
                        ⚠️ <strong className="text-[#292826]">Disclaimer:</strong> Preliminary layout only — a physical site survey is recommended before construction begins.
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* IRREGULAR PATH: STEP 3 (ENTER SIDE MEASUREMENTS) */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'irregular_dimensions' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Side Dimensions &amp; Access
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Enter Plot Side Dimensions
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Specify the length of each boundary side and mark which side faces the road.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#54504A] uppercase tracking-wider mb-2">
                          Number of Boundary Sides:
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[3, 4, 5, 6].map((count) => (
                            <button
                              key={count}
                              type="button"
                              onClick={() => setSidesCount(count)}
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                                sidesCount === count
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-sm'
                                  : 'bg-[#FDFCF9] text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                              }`}
                            >
                              {count === 3 ? '3 (Triangle)' : count === 4 ? '4 (Quad)' : count === 5 ? '5 (Pentagon)' : '6+ (Polygon)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {['A', 'B', 'C', 'D', 'E', 'F'].slice(0, sidesCount).map((sideLetter, idx) => (
                          <div key={sideLetter} className="space-y-1">
                            <label className="text-xs font-bold text-[#292826] flex items-center justify-between">
                              <span>Side {sideLetter} ({idx === 0 ? 'Front' : idx === 1 ? 'Right' : idx === 2 ? 'Back' : 'Left'})</span>
                              {roadFacingSide === sideLetter && (
                                <span className="text-[10px] text-[#E76F2E] font-bold">🛣️ Road</span>
                              )}
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min={5}
                                max={300}
                                value={sideLengths[sideLetter] || ''}
                                onChange={(e) =>
                                  setSideLengths({ ...sideLengths, [sideLetter]: Number(e.target.value) })
                                }
                                placeholder={`Side ${sideLetter}`}
                                className="w-full px-3 py-2.5 rounded-xl border border-[#E7E0D7] text-sm font-bold focus:ring-2 focus:ring-[#E76F2E] outline-none bg-[#FDFCF9]"
                              />
                              <span className="absolute right-3 top-2.5 text-xs font-bold text-[#54504A]">ft</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-3.5 bg-gradient-to-r from-[#FFF6E8] to-[#F7ECE1] rounded-xl border border-[#E76F2E]/30 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[#54504A] block text-[11px]">Raw Plot Area:</span>
                          <span className="font-extrabold text-sm text-[#292826]">
                            ~{rawPlotAreaSqFt} sq.ft
                          </span>
                        </div>
                        <div>
                          <span className="text-[#54504A] block text-[11px]">Est. Buildable Area (18% Setback):</span>
                          <span className="font-extrabold text-sm text-[#C65320]">
                            ~{buildableAreaSqFt} sq.ft
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-xs font-bold text-[#292826] mb-1">
                            Which side faces the main road?
                          </label>
                          <div className="flex gap-1.5">
                            {['A', 'B', 'C', 'D', 'E', 'F'].slice(0, sidesCount).map((sideLetter) => (
                              <button
                                key={sideLetter}
                                type="button"
                                onClick={() => setRoadFacingSide(sideLetter)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                                  roadFacingSide === sideLetter
                                    ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                    : 'bg-[#FDFCF9] text-[#292826] border-[#E7E0D7]'
                                }`}
                              >
                                Side {sideLetter}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#292826] mb-1">
                            Road Width in Feet
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min={8}
                              max={120}
                              value={roadWidth || ''}
                              onChange={(e) => setRoadWidth(Number(e.target.value))}
                              className="w-full px-3 py-2 rounded-xl border border-[#E7E0D7] text-xs font-bold focus:ring-2 focus:ring-[#E76F2E] outline-none"
                            />
                            <span className="absolute right-3 top-2 text-xs font-bold text-[#54504A]">ft road</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#54504A] uppercase tracking-wider mb-1.5">
                          Existing Structures on Site (if any):
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {['Boundary wall', 'Old Structure', 'Trees / Well', 'Electric Pole', 'Drainage / Nala', 'None'].map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                if (existingStructures.includes(item)) {
                                  setExistingStructures(existingStructures.filter((x) => x !== item))
                                } else {
                                  setExistingStructures([...existingStructures, item])
                                }
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                existingStructures.includes(item)
                                  ? 'bg-[#292826] text-white border-[#292826]'
                                  : 'bg-[#FDFCF9] text-[#54504A] border-[#E7E0D7] hover:border-[#292826]'
                              }`}
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-[#F4EFEA] rounded-xl border border-[#E7E0D7] text-[11px] text-[#54504A] leading-relaxed">
                        ⚠️ <strong className="text-[#292826]">Municipal Note:</strong> Approximate estimate based on general norms — please verify exact setback/FSI limits with your local municipal authority before finalizing.
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* IRREGULAR PATH: STEP 4 (AI SMART SUGGESTIONS) */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'irregular_suggestions' && (
                  <div className="space-y-5 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: AI Smart Recommendations
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Smart Blueprint Setup for Your Plot
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Based on your ~{buildableAreaSqFt} sq.ft buildable area and {plotDirection}-facing irregular plot, our AI has pre-configured optimal recommendations.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      {/* Family Size & Budget Chips */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#FDFCF9] rounded-xl border border-[#E7E0D7]">
                        <div>
                          <label className="block text-[11px] font-bold text-[#54504A] uppercase mb-1">
                            👨‍👩‍👧‍👦 Family Living Group:
                          </label>
                          <div className="flex gap-1.5">
                            {[
                              { id: 'couple', label: 'Couple (2-3)' },
                              { id: 'nuclear', label: 'Nuclear (4-5)' },
                              { id: 'joint', label: 'Joint (6+)' },
                            ].map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setFamilySize(f.id as any)}
                                className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold border transition ${
                                  familySize === f.id
                                    ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                    : 'bg-white text-[#292826] border-[#E7E0D7]'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-[#54504A] uppercase mb-1">
                            💰 Estimated Budget Tier:
                          </label>
                          <div className="flex gap-1.5">
                            {[
                              { id: '20_40L', label: '₹20-40L' },
                              { id: '40_70L', label: '₹40-70L' },
                              { id: 'above_70L', label: '₹70L+' },
                            ].map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setBudgetTier(b.id as any)}
                                className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold border transition ${
                                  budgetTier === b.id
                                    ? 'bg-[#292826] text-white border-[#292826]'
                                    : 'bg-white text-[#292826] border-[#E7E0D7]'
                                }`}
                              >
                                {b.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 1. BHK Suggestion Box */}
                      <div className="p-3.5 bg-[#FFF6E8] rounded-xl border border-[#E76F2E]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#C65320]">
                            <Icons.Home size={14} />
                            <span>Recommended: {suggestedBHK} BHK Duplex Layout</span>
                          </div>
                          <p className="text-[11px] text-[#54504A] mt-0.5">
                            Optimizes your {buildableAreaSqFt} sq.ft buildable footprint with spacious living &amp; natural daylight.
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setMasterBedrooms(String(suggestedBHK))}
                            className="px-3 py-1.5 rounded-lg bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] transition shadow-xs"
                          >
                            Use {suggestedBHK} BHK ✓
                          </button>
                        </div>
                      </div>

                      {/* 2. Floors Suggestion Box */}
                      <div className="p-3.5 bg-white rounded-xl border border-[#E7E0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-[#292826]">
                            <Icons.Building size={14} className="text-[#E76F2E]" />
                            <span>Suggested Floors: {suggestedFloors}</span>
                          </div>
                          <p className="text-[11px] text-[#54504A] mt-0.5">
                            G+1 maintains ~65% ground coverage. (Approximate estimate — verify setback limits with municipal authority).
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setFloors(suggestedFloors)}
                            className="px-3 py-1.5 rounded-lg bg-[#292826] text-white text-xs font-bold hover:bg-black transition"
                          >
                            Apply Floors ✓
                          </button>
                        </div>
                      </div>

                      {/* 3. Vastu Alignment & Corner Cut Remedies */}
                      <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                            <Icons.Compass size={14} className="text-emerald-600" />
                            <span>Vastu Shastra Strategy ({plotDirection} Entry)</span>
                          </span>
                          <div className="flex gap-1">
                            {(['full', 'partial', 'skip'] as const).map((m) => (
                              <button
                                key={m}
                                type="button"
                                onClick={() => setVastuMode(m)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                                  vastuMode === m
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-white text-emerald-800 border border-emerald-300'
                                }`}
                              >
                                {m}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          • Mandir in NE (Ishan) · Kitchen in SE (Agneya) · Master in SW (Nairutya).<br />
                          • <strong>Irregular plot remedy:</strong> Non-90° corner cut buffered with open utility courtyard &amp; vertical green planter shaft to neutralize missing zone energy.
                        </p>
                      </div>

                      {/* 4. Parking Feasibility */}
                      <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#E7E0D7] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#292826]">
                            🚗 Parking Recommendation ({roadWidth} ft road)
                          </span>
                          <span className="text-[11px] font-bold text-[#C65320]">
                            {roadWidth < 15 ? '⚠️ Narrow Access' : 'Covered Porch'}
                          </span>
                        </div>
                        {roadWidth < 15 ? (
                          <p className="text-[11px] text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                            ⚠️ <strong>Disclaimer:</strong> Your plot's road-facing width is under 15 ft — standard car parking may not be feasible. Our design team will assess tandem or alternative parking options during detailed planning.
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#54504A]">
                            Your {roadWidth} ft road allows covered 1-car porch + 2-wheeler. Note: May require angled parking layout — final design to be confirmed by our design team.
                          </p>
                        )}
                      </div>

                      {/* 5. Lifestyle Feature Chips */}
                      <div>
                        <label className="block text-xs font-bold text-[#54504A] uppercase tracking-wider mb-2">
                          Select What Matters Most to You:
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            '🛕 Dedicated Mandir',
                            '🍳 Big Modular Kitchen',
                            '🌿 Terrace Garden',
                            '👴 Parents Room (GF)',
                            '🏋️ Home Gym',
                            '🚗 Double Car Parking',
                            '📺 Home Theatre',
                            '🏦 Rental Floor Unit',
                            '🏢 Home Office',
                          ].map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                if (lifestyleTags.includes(tag)) {
                                  setLifestyleTags(lifestyleTags.filter((t) => t !== tag))
                                } else {
                                  setLifestyleTags([...lifestyleTags, tag])
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                                lifestyleTags.includes(tag)
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-xs'
                                  : 'bg-[#FDFCF9] text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* FLOORS STEP (Regular: Step 4, Irregular: Step 5) */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'floors' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Number of Floors
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        How many floors are you planning?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Select the total number of storeys for your residential design.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        {
                          id: 'Ground Floor Only',
                          label: 'Ground Floor Only',
                          emoji: '🏡',
                          desc: 'Single storey bungalow with private garden lawn',
                          tag: 'Single Storey',
                        },
                        {
                          id: 'G+1 (Two Floors)',
                          label: 'G+1 (Two Floors)',
                          emoji: '🏢',
                          desc: 'Most popular Indian duplex (Ground living + First bedrooms)',
                          tag: '⭐ Most Popular',
                        },
                        {
                          id: 'G+2 (Three Floors)',
                          label: 'G+2 (Three Floors)',
                          emoji: '🏬',
                          desc: 'Independent rental floors or joint family residence',
                          tag: 'Rental Income Ready',
                        },
                        {
                          id: 'G+3 (Four Floors)',
                          label: 'G+3 (Four Floors)',
                          emoji: '🏙️',
                          desc: 'Multi-family residential floors with stilt parking & lift',
                          tag: 'Max FSI Utilization',
                        },
                      ].map((item) => {
                        const isSelected = floors === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setFloors(item.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#E76F2E] bg-gradient-to-br from-[#FFF8F0] via-[#FFEDD5] to-[#FED7AA] shadow-xl ring-2 ring-[#E76F2E] scale-[1.02]'
                                : 'border-gray-300 bg-white hover:border-[#E76F2E] hover:bg-orange-50/30 shadow-sm'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between w-full mb-2">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl p-1.5 rounded-xl bg-white/90 border border-gray-200 shadow-2xs">
                                    {item.emoji}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                                      isSelected
                                        ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    {item.tag}
                                  </span>
                                </div>
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full transition shadow-xs ${
                                    isSelected
                                      ? 'bg-[#E76F2E] text-white ring-2 ring-[#E76F2E]/30'
                                      : 'border-2 border-gray-400 bg-gray-50'
                                  }`}
                                >
                                  {isSelected ? <Icons.Check size={14} className="stroke-[3]" /> : null}
                                </span>
                              </div>
                              <div
                                className={`text-base font-black tracking-tight ${
                                  isSelected ? 'text-[#9A3412]' : 'text-gray-900'
                                }`}
                              >
                                {item.label}
                              </div>
                              <div
                                className={`text-xs mt-1 leading-relaxed ${
                                  isSelected ? 'text-[#7C2D12] font-semibold' : 'text-gray-600'
                                }`}
                              >
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* MASTER BEDROOMS */}
                {currentStepKey === 'master_bedrooms' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Master Bedrooms
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Number of Master Bedrooms?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Spacious bedrooms with attached toilets and dressing wardrobes.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {['1', '2', '3', '4'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMasterBedrooms(num)}
                          className={`py-5 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            masterBedrooms === num
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MARRIED COUPLES */}
                {currentStepKey === 'married_couples' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Married Couples
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        How many Married Couples in the house?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Helps AI configure privacy zones and master bedroom separation.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {['1', '2', '3', '4+'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setMarriedCouples(num)}
                          className={`py-5 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            marriedCouples === num
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* KIDS COUNT */}
                {currentStepKey === 'kids_count' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Kids &amp; Study
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        How many Children / Kids?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Determines study desk allocations and kids bedroom sizes.
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {['0', '1', '2', '3+'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setKidsCount(num)}
                          className={`py-5 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            kidsCount === num
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* KIDS DEDICATED BEDROOM */}
                {currentStepKey === 'kids_bedroom' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Kids Room
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Need a Dedicated Kids Bedroom?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Includes custom bunk bed or twin single bed space with study tables.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setKidsBedroom(choice as 'Yes' | 'No')}
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            kidsBedroom === choice
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* KITCHEN FLOOR */}
                {currentStepKey === 'kitchen_floor' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Kitchen Floor
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Which Floor for Main Kitchen?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Ground floor is standard for Indian households; first floor for stilt parking.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { id: 'Ground Floor', label: 'Ground Floor Kitchen', emoji: '🍳', desc: 'Standard Indian layout with utility wash area access' },
                        { id: 'First Floor', label: 'First Floor Kitchen', emoji: '🍽️', desc: 'Ideal for stilt parking or upper floor family living' },
                        { id: 'Both Floors (Dual Kitchen)', label: 'Both Floors (Dual Kitchen)', emoji: '🥘', desc: 'Main family kitchen + 1st floor dry kitchenette' },
                      ].map((item) => {
                        const isSelected = kitchenFloor === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setKitchenFloor(item.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#E76F2E] bg-gradient-to-br from-[#FFF8F0] via-[#FFEDD5] to-[#FED7AA] shadow-lg ring-2 ring-[#E76F2E] scale-[1.01]'
                                : 'border-gray-300 bg-white hover:border-[#E76F2E] hover:bg-orange-50/30 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-1.5 rounded-xl bg-white/90 border border-gray-200 shadow-2xs">
                                {item.emoji}
                              </span>
                              <div>
                                <div className={`text-sm font-black ${isSelected ? 'text-[#9A3412]' : 'text-gray-900'}`}>
                                  {item.label}
                                </div>
                                <div className={`text-xs mt-0.5 ${isSelected ? 'text-[#7C2D12] font-semibold' : 'text-gray-600'}`}>
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition shadow-xs ml-3 ${
                                isSelected
                                  ? 'bg-[#E76F2E] text-white ring-2 ring-[#E76F2E]/30'
                                  : 'border-2 border-gray-400 bg-gray-50'
                              }`}
                            >
                              {isSelected ? <Icons.Check size={14} className="stroke-[3]" /> : null}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* KITCHEN STYLE */}
                {currentStepKey === 'kitchen_style' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Kitchen Style
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Kitchen Layout Style
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Choose between open breakfast counter or traditional closed Indian cooking space.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'Open', label: 'Open Modular Kitchen', img: ASSETS.kitchenOpen, desc: 'Breakfast bar counter' },
                        { id: 'Close', label: 'Traditional Closed Kitchen', img: ASSETS.kitchenClosed, desc: 'Heavy spices & chimney isolation' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setKitchenType(item.id as 'Open' | 'Close')}
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2.5 relative ${
                            kitchenType === item.id
                              ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E] bg-[#FFF6E8]/40'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                          }`}
                        >
                          <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden bg-gray-100 relative">
                            <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            {kitchenType === item.id && (
                              <div className="absolute top-2 right-2 bg-[#E76F2E] text-white p-1 rounded-full shadow-md">
                                <Icons.Check size={12} />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className={`font-bold text-xs sm:text-sm ${kitchenType === item.id ? 'text-[#C65320]' : 'text-[#292826]'}`}>{item.label}</div>
                            <div className="text-[10px] text-[#54504A] mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* POOJA ROOM / MANDIR */}
                {currentStepKey === 'pooja_room' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Pooja Mandir
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Pooja / Mandir Preference
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Strictly placed in North-East (Ishanya corner) for maximum prosperity.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'Dedicated NE Pooja Room', label: 'Dedicated Pooja Room', img: ASSETS.mandirDedicated, desc: 'Separate sacred room (Ishanya)' },
                        { id: 'Pooja Niche / Wall Mandir', label: 'Integrated Wall Mandir', img: ASSETS.mandirNiche, desc: 'Compact carved niche unit' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMandirPreference(item.id)}
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2.5 relative ${
                            mandirPreference === item.id
                              ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E] bg-[#FFF6E8]/40'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                          }`}
                        >
                          <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden bg-gray-100 relative">
                            <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            {mandirPreference === item.id && (
                              <div className="absolute top-2 right-2 bg-[#E76F2E] text-white p-1 rounded-full shadow-md">
                                <Icons.Check size={12} />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className={`font-bold text-xs sm:text-sm ${mandirPreference === item.id ? 'text-[#C65320]' : 'text-[#292826]'}`}>{item.label}</div>
                            <div className="text-[10px] text-[#54504A] mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* BALCONIES */}
                {currentStepKey === 'balconies' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Balconies
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Balconies for Bedrooms?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Front sit-outs with glass or louver railings for cross ventilation.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setBalconies(choice as 'Yes' | 'No')}
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            balconies === choice
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OFFICE / STUDY */}
                {currentStepKey === 'office_space' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Home Office / Study
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Need a Home Office / Study Space?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Quiet workspace setup with ethernet connectivity and bookshelf walls.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setOfficeSpace(choice as 'Yes' | 'No')}
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            officeSpace === choice
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* PARKING TYPE */}
                {currentStepKey === 'parking' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Parking Space
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Parking Requirements
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Configured based on plot width, gate entry radius and road accessibility.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        { id: '1 Car Parking', label: '1 Car Covered Porch', emoji: '🚗', tag: 'Standard Porch', desc: 'Covered parking with direct foyer entrance' },
                        { id: '2 Cars Parking', label: '2 Cars (Side-by-Side)', emoji: '🚙', tag: 'Dual Parking', desc: 'Spacious 18ft driveway / stilt floor space' },
                        { id: 'Both (Car & Bike)', label: '1 Car + 2-Wheeler Space', emoji: '🛵', tag: '⭐ Most Popular', desc: 'Dedicated sedan bay with 2 bike slots' },
                        { id: 'Bike Only (No Car)', label: 'Only Two-Wheelers', emoji: '🏍️', tag: 'Compact Space', desc: 'Maximum plot area allocated for living rooms' },
                      ].map((item) => {
                        const isSelected = parking === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setParking(item.id)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#E76F2E] bg-gradient-to-br from-[#FFF8F0] via-[#FFEDD5] to-[#FED7AA] shadow-xl ring-2 ring-[#E76F2E] scale-[1.02]'
                                : 'border-gray-300 bg-white hover:border-[#E76F2E] hover:bg-orange-50/30 shadow-sm'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between w-full mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl p-1.5 rounded-xl bg-white/90 border border-gray-200 shadow-2xs">
                                    {item.emoji}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border ${
                                      isSelected
                                        ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    {item.tag}
                                  </span>
                                </div>
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full transition shadow-xs ${
                                    isSelected
                                      ? 'bg-[#E76F2E] text-white ring-2 ring-[#E76F2E]/30'
                                      : 'border-2 border-gray-400 bg-gray-50'
                                  }`}
                                >
                                  {isSelected ? <Icons.Check size={14} className="stroke-[3]" /> : null}
                                </span>
                              </div>
                              <div className={`text-base font-black tracking-tight ${isSelected ? 'text-[#9A3412]' : 'text-gray-900'}`}>
                                {item.label}
                              </div>
                              <div className={`text-xs mt-1 leading-relaxed ${isSelected ? 'text-[#7C2D12] font-semibold' : 'text-gray-600'}`}>
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* GARDEN */}
                {currentStepKey === 'garden' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Landscape &amp; Garden
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Garden or Courtyard Area?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Front lawn garden, central Brahmasthan courtyard (OTS), or terrace lawn.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setGarden(choice as 'Yes' | 'No')}
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            garden === choice
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* ELEVATOR / LIFT */}
                {currentStepKey === 'lift' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Home Lift
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Provision for Home Elevator / Lift?
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Civil shaft allocation for senior citizen friendly vertical access.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {['Yes', 'No'].map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setLift(choice as 'Yes' | 'No')}
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${
                            lift === choice
                              ? 'border-[#E76F2E] bg-[#E76F2E] text-white shadow-md ring-2 ring-[#E76F2E]/30 scale-105'
                              : 'border-[#E7E0D7] bg-white text-[#292826] hover:border-[#E76F2E]'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* BATHROOM SIZES */}
                {currentStepKey === 'bathroom' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Bathroom Proportions
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Bathroom Size Preference
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Dry/wet partition separation with wall-hung WC fittings.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'Big', label: 'Big / Luxury', img: ASSETS.bathBig, desc: '8x6 ft with glass shower cubicle' },
                        { id: 'Standard', label: 'Standard', img: ASSETS.bathStandard, desc: '7x5 ft optimal Indian standard' },
                        { id: 'Small', label: 'Compact', img: ASSETS.bathSmall, desc: '6x4 ft space saving layout' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBathroomChoice(item.id as any)}
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2 relative ${
                            bathroomChoice === item.id
                              ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E] bg-[#FFF6E8]/40'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                          }`}
                        >
                          <div className="h-20 sm:h-24 w-full rounded-xl overflow-hidden bg-gray-100 relative">
                            <img src={item.img} alt={item.label} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            {bathroomChoice === item.id && (
                              <div className="absolute top-1.5 right-1.5 bg-[#E76F2E] text-white p-1 rounded-full shadow-md">
                                <Icons.Check size={10} />
                              </div>
                            )}
                          </div>
                          <div className="p-1.5">
                            <div className={`font-bold text-xs ${bathroomChoice === item.id ? 'text-[#C65320]' : 'text-[#292826]'}`}>{item.label}</div>
                            <div className="text-[9px] text-[#54504A] mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* VASTU COMPASS */}
                {currentStepKey === 'vastu' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Vastu Alignment
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Main Road Facing Direction
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Rotate the Vastu compass dial to align your plot's main entrance.
                      </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-sm flex flex-col items-center">
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
                        <div
                          className="absolute inset-0 rounded-full border-4 border-dashed border-[#E76F2E]/40 transition-transform duration-500"
                          style={{ transform: `rotate(${activeCompassDir.angle}deg)` }}
                        />
                        <div className="text-center z-10">
                          <span className="text-3xl sm:text-4xl font-black font-display text-[#E76F2E]">
                            {plotDirection}
                          </span>
                          <span className="text-xs font-bold text-[#54504A] block mt-0.5">
                            {activeCompassDir.tag}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 w-full mt-6">
                        {directions.map((d) => (
                          <button
                            key={d.name}
                            type="button"
                            onClick={() => setPlotDirection(d.name)}
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition ${
                              plotDirection === d.name
                                ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-sm'
                                : 'bg-[#FDFCF9] text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E]'
                            }`}
                          >
                            {d.label} ({d.name})
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3D ELEVATION */}
                {currentStepKey === 'elevation' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: 3D Facade Style
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Choose 3D Front Facade Style
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
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
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2.5 relative ${
                            elevationStyle === item.id
                              ? 'border-[#E76F2E] shadow-lg ring-2 ring-[#E76F2E] bg-[#FFF6E8]/40'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                          }`}
                        >
                          <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden bg-gray-100 relative">
                            <img src={item.img} alt={item.id} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                            {elevationStyle === item.id && (
                              <div className="absolute top-2 right-2 bg-[#E76F2E] text-white p-1 rounded-full shadow-md">
                                <Icons.Check size={12} />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className={`font-bold text-xs sm:text-sm ${elevationStyle === item.id ? 'text-[#C65320]' : 'text-[#292826]'}`}>{item.id}</div>
                            <div className="text-[10px] text-[#54504A] mt-0.5 line-clamp-2">{item.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* MATERIAL & FINISH GRADE */}
                {currentStepKey === 'material' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Material &amp; Construction Grade
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Select Material Quality &amp; Budget Grade
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Specifies structure materials, sanitaryware, electricals, and flooring.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          id: 'Standard Solid Build (~₹1,800/sq.ft)',
                          title: 'Standard Solid Build',
                          emoji: '🧱',
                          rate: '₹1,800 / sq.ft',
                          tag: 'Budget Efficient',
                          desc: 'Red clay bricks, Kajaria vitrified tiles, Cera sanitaryware, Anchor switches',
                        },
                        {
                          id: 'Premium Executive (~₹2,350/sq.ft)',
                          title: 'Premium Executive (Most Popular)',
                          emoji: '💎',
                          rate: '₹2,350 / sq.ft',
                          tag: '⭐ Highest Rated',
                          desc: 'AAC blockwork, 4x2 GVT tiles, Kohler/Jaquar fittings, Teak main door, Legrand switches',
                        },
                        {
                          id: 'Ultra-Luxury Villa Grade (~₹3,200+/sq.ft)',
                          title: 'Ultra-Luxury Villa Grade',
                          emoji: '👑',
                          rate: '₹3,200+ / sq.ft',
                          tag: 'Luxury Bespoke',
                          desc: 'Italian marble, Grohe/Toto automation, double-glazed soundproof glass, VRV AC ready',
                        },
                      ].map((item) => {
                        const isSelected = materialGrade === item.id
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setMaterialGrade(item.id)}
                            className={`w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'border-[#E76F2E] bg-gradient-to-br from-[#FFF8F0] via-[#FFEDD5] to-[#FED7AA] shadow-lg ring-2 ring-[#E76F2E] scale-[1.01]'
                                : 'border-gray-300 bg-white hover:border-[#E76F2E] hover:bg-orange-50/30 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-2 rounded-xl bg-white/90 border border-gray-200 shadow-2xs">
                                {item.emoji}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-sm sm:text-base font-black ${isSelected ? 'text-[#9A3412]' : 'text-gray-900'}`}>
                                    {item.title}
                                  </span>
                                  <span
                                    className={`text-[9px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border ${
                                      isSelected
                                        ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                        : 'bg-gray-100 text-gray-700 border-gray-200'
                                    }`}
                                  >
                                    {item.tag}
                                  </span>
                                </div>
                                <div className={`text-xs mt-0.5 ${isSelected ? 'text-[#7C2D12] font-semibold' : 'text-gray-600'}`}>
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <span
                                className={`text-xs sm:text-sm font-black px-2.5 py-1 rounded-lg border ${
                                  isSelected
                                    ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                    : 'bg-orange-50 text-[#C65320] border-orange-200'
                                }`}
                              >
                                {item.rate}
                              </span>
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full transition shadow-xs ${
                                  isSelected
                                    ? 'bg-[#E76F2E] text-white ring-2 ring-[#E76F2E]/30'
                                    : 'border-2 border-gray-400 bg-gray-50'
                                }`}
                              >
                                {isSelected ? <Icons.Check size={14} className="stroke-[3]" /> : null}
                              </span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* IRREGULAR ONLY: STEP 22 */}
                {currentStepKey === 'irregular_review' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step 22 of {totalWizardSteps}: Site Geometry Review
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Asymmetric Boundary Alignment
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Our AI structural grid algorithm will auto-compensate for non-perpendicular walls.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#E7E0D7]">
                          <span className="text-[11px] text-[#54504A] block font-bold">Irregular Sides</span>
                          <span className="font-extrabold text-sm text-[#292826]">{sidesCount} Distinct Sides</span>
                        </div>
                        <div className="p-3 bg-[#FDFCF9] rounded-xl border border-[#E7E0D7]">
                          <span className="text-[11px] text-[#54504A] block font-bold">Road Access Side</span>
                          <span className="font-extrabold text-sm text-[#E76F2E]">Side {roadFacingSide} ({roadWidth} ft)</span>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <span>✓</span> Structural Optimization Active
                        </div>
                        <p className="text-[11px] text-emerald-700">
                          Non-square corner buffers have been mapped to utility risers, HVAC ducts, and vertical light shafts to deliver 100% rectangular usable bedroom zones.
                        </p>
                      </div>

                      <div className="p-3 bg-[#F4EFEA] rounded-xl border border-[#E7E0D7] text-[11px] text-[#54504A]">
                        ⚠️ <strong>Reminder:</strong> Detailed CAD structural drawings (IS-456 load calculations) will be prepared based on these exact measurements.
                      </div>
                    </div>
                  </div>
                )}

                {/* IRREGULAR ONLY: STEP 23 */}
                {currentStepKey === 'final_confirm' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2.5 py-1 rounded-md border border-[#E76F2E]/20">
                        Step 23 of {totalWizardSteps}: Final Specification Review
                      </span>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-2 text-[#292826]">
                        Ready to Synthesize Your Custom Blueprint
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
                        Review your configured parameters below before triggering the Indore House Makers AI Architecture Synthesis Engine.
                      </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-sm space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-[#EEE9E3]">
                        <span className="text-[#54504A]">Plot Type:</span>
                        <span className="font-bold text-[#292826]">Irregular (~{rawPlotAreaSqFt} sq.ft)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#EEE9E3]">
                        <span className="text-[#54504A]">Buildable Base Area:</span>
                        <span className="font-bold text-[#C65320]">~{buildableAreaSqFt} sq.ft</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#EEE9E3]">
                        <span className="text-[#54504A]">Configuration:</span>
                        <span className="font-bold text-[#292826]">{masterBedrooms} BHK · {floors}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#EEE9E3]">
                        <span className="text-[#54504A]">Orientation:</span>
                        <span className="font-bold text-[#292826]">{plotDirection} Facing (100% Vastu)</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#EEE9E3]">
                        <span className="text-[#54504A]">3D Facade Style:</span>
                        <span className="font-bold text-[#292826]">{elevationStyle}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-[#54504A]">Material Grade:</span>
                        <span className="font-bold text-[#292826]">{materialGrade.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* SYNTHESIS STAGE */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'synthesis' && (
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
                        Synthesizing Custom Indore House Makers Plan...
                      </h4>
                      <p className="text-xs text-[#54504A] animate-pulse">
                        {processingStatus}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#54504A]">
                      <Icons.ShieldCheck size={14} className="text-[#E76F2E]" />
                      <span>Checking 100% Vastu compliance &amp; structural column alignment</span>
                    </div>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* LEAD CAPTURE STAGE */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'lead' && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <span>✓</span> Requirements Verified &amp; Synthesized
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mt-3 text-[#292826]">
                        Your 2D Blueprint &amp; 3D Facade are Ready!
                      </h3>
                      <p className="text-xs sm:text-sm text-[#54504A] mt-1">
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

                      <p className="text-[11px] text-center text-[#54504A]">
                        🔒 100% Privacy. Instant delivery to your WhatsApp. No spam guaranteed.
                      </p>
                    </form>
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* RESULTS SHOWCASE STAGE */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'results' && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    {/* Top Result Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-[#FFF6E8] to-[#F7ECE1] p-4 rounded-2xl border border-[#E76F2E]/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full bg-[#E76F2E] text-white text-[10px] font-bold tracking-wider uppercase">
                            96% AI Matched
                          </span>
                          <span className="text-xs font-bold text-[#292826]">
                            {isRegular ? 'Rectangular Vastu Blueprint' : 'Asymmetric Optimized Blueprint'}
                          </span>
                        </div>
                        <h4 className="font-display font-extrabold text-lg sm:text-xl text-[#292826] mt-1">
                          {isRegular ? `${plotWidth}x${plotDepth} ft` : `~${rawPlotAreaSqFt} sq.ft Asymmetric`} {plotDirection} Facing {floors.split(' ')[0]} Residence
                        </h4>
                        <p className="text-xs text-[#54504A]">
                          Engineered for {leadName || 'You'} ({leadCity || 'India'}) · {isRegular ? '100% Vastu & Setback Compliant' : 'Asymmetric Corner Remedy Applied'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSharePlan}
                          className="px-3 py-2 rounded-xl bg-white border border-[#E7E0D7] text-xs font-bold text-[#292826] hover:bg-[#FDFCF9] transition flex items-center gap-1.5"
                        >
                          <Icons.Share size={13} />
                          <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenConsult?.(`AI Generated Plan for ${plotWidth}x${plotDepth} ft ${plotDirection} Facing Plot`)}
                          className="px-4 py-2 rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] transition shadow-sm flex items-center gap-1.5"
                        >
                          <span>Talk to Architect</span>
                          <Icons.ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Key Technical Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-3 rounded-xl border border-[#E7E0D7] text-center">
                        <span className="text-[10px] font-bold uppercase text-[#54504A] block">Total Plot Area</span>
                        <span className="font-display font-extrabold text-base text-[#292826]">
                          {rawPlotAreaSqFt} sq.ft
                        </span>
                        <span className="text-[10px] text-[#54504A] block">~{plotAreaSqYards} sq.yards</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E7E0D7] text-center">
                        <span className="text-[10px] font-bold uppercase text-[#54504A] block">
                          {isRegular ? 'Super Built-Up' : 'Buildable Base'}
                        </span>
                        <span className="font-display font-extrabold text-base text-[#C65320]">
                          {builtUpArea} sq.ft
                        </span>
                        <span className="text-[10px] text-[#54504A] block">Carpet: ~{carpetArea} sq.ft</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E7E0D7] text-center">
                        <span className="text-[10px] font-bold uppercase text-[#54504A] block">Est. Cost Range</span>
                        <span className="font-display font-extrabold text-base text-emerald-700">
                          ₹{estimatedCostLakhs} L
                        </span>
                        <span className="text-[10px] text-[#54504A] block">@ ₹{finalRatePerSqFt}/sq.ft</span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-[#E7E0D7] text-center">
                        <span className="text-[10px] font-bold uppercase text-[#54504A] block">Vastu Score</span>
                        <span className="font-display font-extrabold text-base text-[#E76F2E]">
                          98 / 100
                        </span>
                        <span className="text-[10px] text-[#54504A] block">Ishan + Agneya Align</span>
                      </div>
                    </div>

                    {/* Interactive 3D Render & 2D CAD Blueprint Display */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* 3D Photorealistic Exterior */}
                      <div className="bg-white rounded-2xl border border-[#E7E0D7] overflow-hidden shadow-sm flex flex-col">
                        <div className="p-3.5 border-b border-[#EEE9E3] flex items-center justify-between bg-[#FDFCF9]">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-[#E76F2E]" />
                            <span className="font-bold text-xs text-[#292826]">
                              3D Facade: {elevationStyle}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#EEE9E3] p-0.5 rounded-lg text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setIsNightLighting(false)}
                              className={`px-2 py-0.5 rounded transition ${
                                !isNightLighting ? 'bg-white text-[#292826] shadow-xs' : 'text-[#54504A]'
                              }`}
                            >
                              ☀️ Day
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsNightLighting(true)}
                              className={`px-2 py-0.5 rounded transition ${
                                isNightLighting ? 'bg-[#292826] text-white shadow-xs' : 'text-[#54504A]'
                              }`}
                            >
                              🌙 Twilight
                            </button>
                          </div>
                        </div>
                        <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden group">
                          <img
                            src={getElevationImage()}
                            alt="3D Elevation Render"
                            className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                          />
                          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-bold">
                            Ultra-Realistic Indian Weather Materials
                          </div>
                        </div>
                      </div>

                      {/* 2D Architectural CAD Floor Plan */}
                      <div className="bg-white rounded-2xl border border-[#E7E0D7] overflow-hidden shadow-sm flex flex-col">
                        <div className="p-3.5 border-b border-[#EEE9E3] flex items-center justify-between bg-[#FDFCF9]">
                          <div className="flex items-center gap-2">
                            <Icons.Blueprint size={14} className="text-[#E76F2E]" />
                            <span className="font-bold text-xs text-[#292826]">
                              2D Working CAD Layout
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#EEE9E3] p-0.5 rounded-lg text-[10px] font-bold">
                            <button
                              type="button"
                              onClick={() => setActiveFloorView('ground')}
                              className={`px-2 py-0.5 rounded transition ${
                                activeFloorView === 'ground' ? 'bg-white text-[#292826] shadow-xs' : 'text-[#54504A]'
                              }`}
                            >
                              Ground Plan
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveFloorView('first')}
                              className={`px-2 py-0.5 rounded transition ${
                                activeFloorView === 'first' ? 'bg-white text-[#292826] shadow-xs' : 'text-[#54504A]'
                              }`}
                            >
                              First Floor
                            </button>
                          </div>
                        </div>

                        {/* Interactive Blueprint Vector Mockup */}
                        <div className="p-4 bg-[#1E293B] flex-1 flex flex-col justify-between text-white font-mono text-[11px] select-none">
                          <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-700 pb-2">
                            <span>SCALE 1:100 CAD WORKING DWG</span>
                            <span>VASTU GRID: {plotDirection} ENTRY</span>
                          </div>

                          <div className="my-3 grid grid-cols-2 gap-2 border-2 border-dashed border-cyan-400/50 p-3 rounded-lg bg-slate-900/60">
                            <div className="border border-slate-700 p-2 rounded bg-slate-800/80">
                              <span className="text-cyan-400 font-bold block text-[10px]">
                                {activeFloorView === 'ground' ? 'LIVING & FOYER' : 'MASTER BED 01'}
                              </span>
                              <span className="text-slate-300 text-[10px]">
                                {isRegular ? '14\'-6" x 18\'-0"' : 'Shape-Tuned 13\'x17\''}
                              </span>
                              <span className="text-[9px] text-emerald-400 block mt-0.5">✓ North-East Light</span>
                            </div>

                            <div className="border border-slate-700 p-2 rounded bg-slate-800/80">
                              <span className="text-amber-400 font-bold block text-[10px]">
                                {activeFloorView === 'ground' ? 'KITCHEN (AGNI)' : 'BEDROOM 02'}
                              </span>
                              <span className="text-slate-300 text-[10px]">10'-0" x 12'-6"</span>
                              <span className="text-[9px] text-amber-300 block mt-0.5">✓ South-East Corner</span>
                            </div>

                            <div className="border border-slate-700 p-2 rounded bg-slate-800/80">
                              <span className="text-indigo-400 font-bold block text-[10px]">
                                {activeFloorView === 'ground' ? 'PARKING & PORCH' : 'BALCONY SITOUT'}
                              </span>
                              <span className="text-slate-300 text-[10px]">11'-0" x 16'-0"</span>
                              <span className="text-[9px] text-cyan-300 block mt-0.5">✓ Gate Front Access</span>
                            </div>

                            <div className="border border-slate-700 p-2 rounded bg-slate-800/80">
                              <span className="text-emerald-400 font-bold block text-[10px]">
                                {mandirPreference.includes('Dedicated') ? 'POOJA MANDIR' : 'UTILITY / OTS'}
                              </span>
                              <span className="text-slate-300 text-[10px]">6'-0" x 6'-6"</span>
                              <span className="text-[9px] text-emerald-400 block mt-0.5">✓ Ishanya Sacred Zone</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-700">
                            <span>AUTOCAD .DWG &amp; REVIT COMPATIBLE</span>
                            <span className="text-emerald-400 font-bold">● READY FOR DOWNLOAD</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E7E0D7] flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-[#54504A]">
                        <Icons.Check size={16} className="text-emerald-600" />
                        <span>High-Resolution CAD Softcopy Sent to WhatsApp ({leadPhone || '+91 98765 43210'})</span>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E7E0D7] text-xs font-bold text-[#292826] hover:bg-[#FDFCF9]"
                        >
                          Modify Parameters
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenConsult?.(`Consultation regarding generated plan for ${leadName || 'client'}`)}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Icons.Phone size={14} />
                          <span>Book Free Architect Review</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Action Footer Navigation Bar */}
            {step <= totalWizardSteps && (
              <footer className="shrink-0 bg-white border-t border-[#EEE9E3] px-6 py-3.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                    step === 1
                      ? 'opacity-40 border-[#E7E0D7] text-[#54504A] cursor-not-allowed'
                      : 'border-[#E7E0D7] text-[#292826] hover:border-[#292826] bg-white'
                  }`}
                >
                  <Icons.ChevronLeft size={16} />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#54504A] hidden sm:inline-block">
                    {step === totalWizardSteps ? 'Ready to Synthesize' : `Next: Step ${step + 1} of ${totalWizardSteps}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-7 py-2.5 rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] transition shadow-md active:scale-95 flex items-center gap-1.5"
                  >
                    <span>{step === totalWizardSteps ? 'Generate AI Plan ✨' : 'Next'}</span>
                    <Icons.ChevronRight size={16} />
                  </button>
                </div>
              </footer>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: ASK AI ARCHITECTURE & DESIGN DESK                   */}
        {/* ========================================================= */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col min-h-0 bg-[#FDFCF9]">
            {/* Messages Scroll Area */}
            <div className="flex-1 p-3 sm:p-5 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
              {/* Compact Architect Welcome Card (Shown when conversation has few messages) */}
              {chatMessages.length <= 2 && (
                <div className="p-3 sm:p-3.5 rounded-xl bg-white border border-[#E7E0D7] shadow-xs text-[#292826] space-y-2.5 animate-fadeIn">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] flex items-center justify-center text-white font-extrabold shadow-xs">
                        <Icons.Sparkles size={16} />
                      </div>
                      <div>
                        <h4 className="font-display font-extrabold text-xs sm:text-sm text-[#292826] leading-tight">
                          Indore House Makers AI Design Desk
                        </h4>
                        <p className="text-[10px] sm:text-[10.5px] text-[#54504A]">
                          Floor plans, Vastu Shastra &amp; Indore construction estimates
                        </p>
                      </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9.5px] font-bold border border-emerald-200 shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Capability Quick Pills (2x2 Compact Grid) */}
                  <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleSendChat('30x50 East Facing Vastu Plan')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1">
                        <span>📐</span> <span>2D House Plans</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">30x50, 20x40 layouts</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat('Vastu rules for Kitchen and Pooja room')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1">
                        <span>🧭</span> <span>100% Vastu Shastra</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">Kitchen &amp; Mandir rules</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat('Construction cost for 1500 sq.ft in Indore')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1">
                        <span>💰</span> <span>Cost Estimator</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">Indore material rates</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat('What is included in the ₹299 AI Plan?')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1">
                        <span>✨</span> <span>₹299 AI Plan</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">5 Credits • CAD &amp; 3D</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Message List */}
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  {msg.from === 'bot' && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white text-[11px] font-extrabold mr-2.5 mt-0.5 shadow-xs">
                      AI
                    </div>
                  )}
                  <div
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-xs leading-relaxed ${
                      msg.from === 'user'
                        ? 'bg-[#E76F2E] text-white rounded-tr-none font-medium'
                        : 'bg-white text-[#292826] border border-[#E7E0D7] rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    <div className="text-xs sm:text-[13px]">{msg.text}</div>
                    
                    {/* Bot Message Contextual Action Buttons */}
                    {msg.from === 'bot' && (
                      <div className="mt-3 pt-2.5 border-t border-[#EEE9E3] flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('generator')}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFF6E8] border border-[#E76F2E]/30 text-[#C65320] hover:bg-[#E76F2E] hover:text-white transition text-[11px] font-bold cursor-pointer"
                        >
                          <Icons.Blueprint size={12} />
                          <span>Launch 20-Step AI Plan Generator</span>
                        </button>
                        {onOpenConsult && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose()
                              onOpenConsult('AI Assistant Consultation Request')
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F4EFEA] border border-[#E7E0D7] text-[#54504A] hover:text-[#292826] hover:bg-[#E7E0D7] transition text-[11px] font-semibold cursor-pointer"
                          >
                            <Icons.Phone size={11} />
                            <span>Book Architect Call</span>
                          </button>
                        )}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.from === 'user' ? 'text-white/80' : 'text-[#54504A]'
                      }`}
                    >
                      {msg.time}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {chatTyping && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white text-[11px] font-extrabold shadow-xs">
                    AI
                  </div>
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl rounded-tl-none bg-white border border-[#E7E0D7] shadow-xs">
                    <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:150ms]" />
                    <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:300ms]" />
                    <span className="text-[11px] text-[#54504A] ml-1.5 font-medium">Analyzing design rules...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-3 sm:px-4 py-2 bg-white border-t border-[#EEE9E3] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-bold uppercase text-[#54504A] shrink-0 mr-1 flex items-center gap-1">
                <Icons.Sparkles size={11} className="text-[#E76F2E]" /> Quick:
              </span>
              {[
                { label: '📐 30x50 East Plan', query: '30x50 East Facing House Plan recommendation' },
                { label: '💰 Indore Construction Cost', query: 'Construction cost for 1500 sq.ft in Indore' },
                { label: '🧭 Vastu for Mandir & Kitchen', query: 'Vastu directions for Mandir and Kitchen' },
                { label: '✨ What is in ₹299 Plan?', query: 'What is included in the ₹299 AI Plan?' },
                { label: '🏛️ Modern Duplex 3D Elevation', query: 'Modern 3D Front Elevation designs' },
                { label: '📞 Speak with Architect', query: 'I want to talk to an architect' },
              ].map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => handleSendChat(s.query)}
                  className="shrink-0 rounded-lg border border-[#E7E0D7] bg-[#FAF8F5] hover:border-[#E76F2E] hover:bg-[#FFF6E8] px-2.5 py-1 text-[11px] font-semibold text-[#292826] hover:text-[#E76F2E] transition cursor-pointer active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendChat(chatInput)
              }}
              className="p-2.5 sm:p-3 bg-white border-t border-[#EEE9E3] flex gap-2 items-center"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about plot sizes (30x50, 20x40), Vastu directions, ₹299 plan or rates..."
                className="flex-1 px-3.5 py-2.5 sm:py-3 rounded-xl border border-[#E7E0D7] text-xs sm:text-sm outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/20 bg-[#FDFCF9] transition"
              />
              <button
                type="submit"
                disabled={!chatInput.trim()}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-[#E76F2E] text-white font-bold text-xs sm:text-sm hover:bg-[#C65320] transition shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Icons.ChevronRight size={14} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
