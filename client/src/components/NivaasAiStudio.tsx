import React, { useState, useEffect, useRef, useCallback } from 'react'
import { site } from '../lib/data'
import { Icons } from './Icons'
import { usePublicAuth } from '../lib/publicAuth'
import {
  generateFree2DPreview,
  fetchUserEntitlements,
  type UserEntitlements,
  startPaid3DGeneration,
  saveWizardDraft,
} from '../lib/api'
import DesignPassModal from './DesignPassModal'
import { notifyDataChanged, subscribeDataChanged } from '../lib/syncEvents'

export interface NivaasAiStudioProps {
  open: boolean
  onClose: () => void
  onOpenConsult?: (details?: string) => void
  onOpenLogin?: () => void
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
  onOpenLogin,
  initialMode = 'generator',
  initialWidth = 30,
  initialDepth = 50,
}: NivaasAiStudioProps) {
  const { user, accessToken, refreshAuth, isAuthenticated } = usePublicAuth()
  const [activeTab, setActiveTab] = useState<'generator' | 'chat'>(initialMode)

  // -----------------------------------------------------------
  // Wizard State
  // -----------------------------------------------------------
  const [step, setStep] = useState(1)
  const [showPassModal, setShowPassModal] = useState(false)
  const [is3DUnlocked, setIs3DUnlocked] = useState(false)
  const [is3DGenerated, setIs3DGenerated] = useState(false)
  const [creditsRemaining, setCreditsRemaining] = useState(0)
  const [generating3D, setGenerating3D] = useState(false)

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
  const [activeFloorView, setActiveFloorView] = useState<'ground' | 'first'>('ground')
  const [isNightLighting, setIsNightLighting] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Entitlement & Free 2D Generation State
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null)
  const [generatingFree2D, setGeneratingFree2D] = useState(false)
  const [generatingPaid3D, setGeneratingPaid3D] = useState(false)
  const [freeGenError, setFreeGenError] = useState('')

  // -----------------------------------------------------------
  // Dynamic Total Steps & Explicit Step Naming
  // -----------------------------------------------------------
  const isRegular = plotShape === 'regular'
  const totalWizardSteps = isRegular ? 20 : 23
  const synthesisStep = totalWizardSteps + 1 // 21 for regular, 24 for irregular
  const leadStep = totalWizardSteps + 2      // 22 for regular, 25 for irregular
  const resultsStep = totalWizardSteps + 3   // 23 for regular, 26 for irregular

  // Restore draft on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const rawDraft = localStorage.getItem('ihm_wizard_draft')
      if (rawDraft) {
        const draft = JSON.parse(rawDraft)
        if (draft.plotWidth) setPlotWidth(draft.plotWidth)
        if (draft.plotDepth) setPlotDepth(draft.plotDepth)
        if (draft.floors) setFloors(draft.floors)
        if (draft.parking) setParking(draft.parking)
        if (draft.plotDirection) setPlotDirection(draft.plotDirection)
        if (draft.materialGrade) setMaterialGrade(draft.materialGrade)
        if (draft.elevationStyle) setElevationStyle(draft.elevationStyle)
      }
    } catch {}
  }, [])

  // Auto-save draft on change
  useEffect(() => {
    if (typeof window === 'undefined') return
    const draft = {
      plotShape,
      plotWidth,
      plotDepth,
      floors,
      parking,
      plotDirection,
      materialGrade,
      elevationStyle,
      masterBedrooms,
      kitchenFloor,
      mandirPreference,
      balconies,
      officeSpace,
      garden,
      lift,
      bathroomChoice,
    }
    localStorage.setItem('ihm_wizard_draft', JSON.stringify(draft))
  }, [
    plotShape,
    plotWidth,
    plotDepth,
    floors,
    parking,
    plotDirection,
    materialGrade,
    elevationStyle,
    masterBedrooms,
    kitchenFloor,
    mandirPreference,
    balconies,
    officeSpace,
    garden,
    lift,
    bathroomChoice,
  ])

  // Single Source of Truth: Refresh live entitlements from backend
  const refreshEntitlements = useCallback(async () => {
    if (!accessToken || !isAuthenticated) {
      setEntitlements(null)
      return
    }
    try {
      const data = await fetchUserEntitlements({ Authorization: `Bearer ${accessToken}` })
      setEntitlements(data)
    } catch {
      setEntitlements(null)
    }
  }, [accessToken, isAuthenticated])

  // Check entitlements when user changes
  useEffect(() => {
    refreshEntitlements()
  }, [accessToken, isAuthenticated])

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
      text: 'Namaste! I am your Indore House Makers AI Architecture Assistant. Ask me anything about floor plans, irregular plot layouts, municipal bylaws, Vastu directions, 3D elevation styles, or construction estimates.',
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
      refreshEntitlements().catch(() => null)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Real-time synchronization: Re-fetches entitlements if passes/credits update in background or other tabs
  useEffect(() => {
    if (!open) return
    const unsubscribe = subscribeDataChanged((type) => {
      if (type === 'all' || type === 'passes' || type === 'credits') {
        refreshEntitlements().catch(() => null)
      }
    })
    return unsubscribe
  }, [open, refreshEntitlements])

  // Synchronize 3D unlocked state & credits with authoritative entitlements
  useEffect(() => {
    if (entitlements?.designPass?.active && (entitlements.designPass.creditsRemaining ?? 0) > 0) {
      setIs3DUnlocked(true)
      setCreditsRemaining(entitlements.designPass.creditsRemaining)
    } else if (entitlements?.designPass?.creditsRemaining !== undefined) {
      setCreditsRemaining(entitlements.designPass.creditsRemaining)
      if (entitlements.designPass.creditsRemaining <= 0) {
        setIs3DUnlocked(false)
      }
    }
  }, [entitlements])

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
            setTimeout(() => {
              setStep(leadStep)
            }, 600)
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

  const handleGenerateFree2DPlan = async () => {
    if (!accessToken) {
      onOpenLogin?.()
      return
    }

    setGeneratingFree2D(true)
    setFreeGenError('')
    try {
      const wizardPayload = {
        plotWidth: isRegular ? plotWidth : Math.round(Math.sqrt(rawPlotAreaSqFt)),
        plotLength: isRegular ? plotDepth : Math.round(Math.sqrt(rawPlotAreaSqFt)),
        plotAreaSqFt: rawPlotAreaSqFt,
        plotAreaSqYards,
        facing: plotDirection,
        bhk: `${suggestedBHK} BHK`,
        floors,
        elevationStyle,
        materialGrade,
        builtUpArea,
        carpetArea,
        estimatedCostLakhs,
        vastuScore: 98,
        leadName: user?.name || 'Indore Client',
        leadCity: (user as any)?.city || 'Indore, MP',
        title: `${isRegular ? `${plotWidth}x${plotDepth} ft` : `${rawPlotAreaSqFt} sq.ft`} ${plotDirection} Facing ${floors.split(' ')[0]} Residence`,
      }

      await generateFree2DPreview(
        { wizardData: wizardPayload },
        { Authorization: `Bearer ${accessToken}` }
      )

      await refreshEntitlements().catch(() => null)
      await refreshAuth().catch(() => null)
      notifyDataChanged('generations')
      setStep(resultsStep)
    } catch (err: any) {
      if (err.message?.includes('FREE_PREVIEW_ALREADY_CONSUMED')) {
        await refreshEntitlements().catch(() => null)
        setFreeGenError('All 5 free 2D previews have been used on your account. Upgrade to the ₹299 Design Pass for unlimited new 3D & 2D generations.')
      } else {
        setFreeGenError(err.message || 'Failed to generate free 2D plan.')
      }
    } finally {
      setGeneratingFree2D(false)
    }
  }

  const handleGeneratePaid3DPlan = async () => {
    if (!accessToken) {
      onOpenLogin?.()
      return
    }

    setGeneratingPaid3D(true)
    setFreeGenError('')
    try {
      const wizardPayload = {
        plotWidth: isRegular ? plotWidth : Math.round(Math.sqrt(rawPlotAreaSqFt)),
        plotLength: isRegular ? plotDepth : Math.round(Math.sqrt(rawPlotAreaSqFt)),
        plotAreaSqFt: rawPlotAreaSqFt,
        plotAreaSqYards,
        facing: plotDirection,
        bhk: `${suggestedBHK} BHK`,
        floors,
        elevationStyle,
        materialGrade,
        builtUpArea,
        carpetArea,
        estimatedCostLakhs,
        vastuScore: 98,
        leadName: user?.name || 'Indore Client',
        leadCity: (user as any)?.city || 'Indore, MP',
        title: `${isRegular ? `${plotWidth}x${plotDepth} ft` : `${rawPlotAreaSqFt} sq.ft`} ${plotDirection} Facing ${floors.split(' ')[0]} Luxury 3D Design`,
        image: getElevationImage(),
        has3D: true,
        is3DUnlocked: true,
      }

      const session = await saveWizardDraft(
        { stage: 20, wizardData: wizardPayload },
        { Authorization: `Bearer ${accessToken}` }
      ).catch(() => null)

      const sessionId = session?.id || 'session_' + Date.now()

      const genRes = await startPaid3DGeneration(sessionId, { Authorization: `Bearer ${accessToken}` }, {
        idempotencyKey: `gen3d_${sessionId}`,
        wizardData: wizardPayload,
      })
      if (genRes?.creditsRemaining !== undefined) {
        setCreditsRemaining(genRes.creditsRemaining)
      }

      // The generation job itself now persists the project (single source of truth),
      // so no separate createUserProject call is needed here.

      // The design package is already generated (1 credit reserved). Mark it generated
      // so the results screen shows the completed 3D render instead of prompting for a
      // second, duplicate 1-credit generation.
      setIs3DGenerated(true)
      notifyDataChanged('generations')
      notifyDataChanged('credits')

      await refreshEntitlements().catch(() => null)
      await refreshAuth().catch(() => null)
      setStep(resultsStep)
    } catch (err: any) {
      if (err.message?.includes('DESIGN_PASS_REQUIRED') || err.message?.includes('INSUFFICIENT_CREDITS')) {
        await refreshEntitlements().catch(() => null)
        setShowPassModal(true)
      } else {
        setFreeGenError(err.message || 'Failed to generate 3D plan.')
      }
    } finally {
      setGeneratingPaid3D(false)
    }
  }

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

  // Rate estimation from selected package (Standard: 1450, Premium: 1750, Luxury: 2200)
  const getMaterialNumericRate = (grade: string): number => {
    if (grade.toLowerCase().includes('standard')) return 1450
    if (grade.toLowerCase().includes('luxury')) return 2200
    return 1750 // Premium default
  }
  const finalRatePerSqFt = getMaterialNumericRate(materialGrade)
  const estimatedCostLakhs = ((builtUpArea * finalRatePerSqFt) / 100000).toFixed(2)

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
        reply = `Indore House Makers AI Starter Plan (₹299 / month):\n• 5 Full AI Design Generations per billing cycle\n• High-Resolution 2D CAD Layouts with Room Dimensions\n• Area Statements, Built-up & Carpet Area Summary\n• Photorealistic 3D Front Elevation Renders\n• Watermark-free PDF & PNG Downloads\n• 1 Free Plan Regeneration within 7 days\n\nNote: All designs are conceptual recommendations. Construction requires verification by a licensed architect/structural engineer.`
      } else if (/(price|cost|budget|rate|lakh|estimate|sq\.? ?ft)/i.test(qLower)) {
        reply = `Estimated Construction Cost for Indore & MP Region:\n• Standard Economy: ₹1,550 – ₹1,750 / sq.ft\n• Premium Executive: ₹2,100 – ₹2,450 / sq.ft (Most Popular)\n• Luxury Ultra: ₹2,900 – ₹3,500 / sq.ft\n\nFor your ${isRegular ? `${plotWidth}x${plotDepth} ft` : 'selected'} plot (~${builtUpArea} sq.ft built-up), the estimated construction budget is approx ₹${estimatedCostLakhs} Lakhs.`
      } else if (/(30x50|20x40|20x50|30x60|plot|dimension|size)/i.test(qLower)) {
        reply = `Recommended Layout for ${q.toUpperCase()}:\n• Configuration: 3 BHK / 4 BHK G+1 Duplex with Car Parking\n• Ground Floor: Living Room, Master Bedroom with Attached Toilet, Kitchen in SE (Agneya), Pooja in NE (Ishanya)\n• First Floor: 2 Bedrooms, Family Lounge, Balcony & Open Terrace\n• Switch to the "AI Plan Generator" tab above to generate this exact dimensioned floor plan!`
      } else if (/(irregular|asymmetric|cut|shape|l-shape|corner|trap)/i.test(qLower)) {
        reply = `Irregular Plot Planning Engine:\nIndore House Makers AI automatically computes setback buffers (18% standard deduction) and converts non-90° corner cuts into landscaped green pockets, ventilation shafts, or utility zones. This ensures 100% Vastu compliance and square interior living spaces!`
      } else if (/(vastu|vaastu|direction|mandir|pooja|kitchen|north|east|south|west)/i.test(qLower)) {
        reply = `100% Vastu Shastra Guidelines:\n• Pooja Mandir: North-East (Ishanya) — Most sacred corner\n• Kitchen: South-East (Agneya) or North-West (Vayavya)\n• Master Bedroom: South-West (Nairutya) for stability\n• Staircase: South or West (Clockwise rotation)\n• Main Entrance: North or East (Positive energy zones)`
      } else if (/(3d|elevation|facade|exterior|render|night|light)/i.test(qLower)) {
        reply = `3D Front Elevation Styles:\n• Modern Indian Duplex (Warm wooden textures + ambient profile LEDs)\n• Contemporary Jaali & Stone Cladding (Perforated CNC screens)\n• Kerala Tropical Sloped Roof with Mangalore tiles\n• Classical Spanish Villa with arched balconies\n\nAll 3D elevations feature Day and Twilight lighting modes with material breakdowns!`
      } else if (/(talk|architect|call|contact|consult|callback|phone)/i.test(qLower)) {
        reply = `Connect with Indore House Makers Chief Architect:\nOur senior architectural consultants are available for 1-on-1 review calls.\n• Helpline: ${site.phone}\n• Email: ${site.email}\n• You can click "Book Free Consultation" to schedule an instant callback.`
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
    <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-[#1A1815]/75 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div
        className="relative w-[88vw] sm:w-full max-w-3xl lg:max-w-4xl h-[75vh] sm:h-[88vh] max-h-[560px] sm:max-h-[780px] min-h-0 sm:min-h-[520px] bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-[#E7E0D7] flex flex-col overflow-hidden text-[#292826]"
      >
        {/* Admin Test Simulation Mode Banner */}
        {user?.role === 'ADMIN' && (
          <div className="bg-[#292826] text-white px-3 sm:px-4 py-1 sm:py-1.5 text-xs flex items-center justify-between border-b border-black/20 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-amber-400 text-[10px] sm:text-[11px] uppercase tracking-wider">
                Admin Live Test Mode
              </span>
              <span className="hidden sm:inline text-[11px] text-[#C5BFB8]">
                · Unlimited simulation preview (Zero customer credits consumed)
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded bg-[#C94F36] text-white uppercase tracking-wider">
              Admin Privilege
            </span>
          </div>
        )}

        {/* Top Header */}
        <header className="shrink-0 bg-white border-b border-[#EEE9E3] px-2.5 sm:px-6 py-1.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
            <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-[#E76F2E] text-white shadow-sm ring-2 ring-[#E76F2E]/20 shrink-0">
              <Icons.Sparkles size={14} className="text-white animate-pulse sm:hidden" />
              <Icons.Sparkles size={16} className="text-white animate-pulse hidden sm:block" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <span className="font-display font-black text-xs sm:text-base tracking-tight text-[#111827] flex items-center gap-1 truncate">
                  <span className="hidden md:inline text-[#111827]">Indore House Makers</span>
                  <span className="text-[#C94F36] truncate">{activeTab === 'chat' ? 'AI Design Desk' : 'AI Architect Studio'}</span>
                </span>
                {activeTab === 'generator' ? (
                  <span className="hidden lg:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#FFF6E8] text-[#C65320] border border-[#E76F2E]/20 rounded-full shrink-0">
                    {isRegular ? '20-Step Regular Flow' : '23-Step Asymmetric Engine'}
                  </span>
                ) : (
                  <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online • Instant AI Answers
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#54504A] hidden sm:block truncate max-w-[240px] md:max-w-md">
                {activeTab === 'chat'
                  ? 'Ask any question on 2D house plans, Vastu directions, 3D facades & turnkey cost estimation in Indore'
                  : "India's First AI Engine for Regular & Asymmetric Plots with 100% Vastu"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3 shrink-0">
            {/* Live User Credit / Entitlement Indicator */}
            {entitlements?.designPass.active ? (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs">
                  <Icons.Sparkles size={13} className="text-amber-600" />
                  <span>3D Pass: {entitlements.designPass.creditsRemaining} Credits</span>
                  <span className="text-[10px] text-amber-700 font-semibold">({entitlements.designPass.daysRemaining}d left)</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-sky-50 border border-sky-300 text-sky-900 text-xs font-bold shadow-2xs">
                  <Icons.Blueprint size={13} className="text-sky-600" />
                  <span>2D: {entitlements.daily2D ? `${entitlements.daily2D.remaining}/5 Today` : '5/day'}</span>
                </div>
              </div>
            ) : entitlements?.daily2D && entitlements.daily2D.remaining > 0 ? (
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs">
                <Icons.Check size={13} className="text-emerald-600" />
                <span>Free 2D: {entitlements.daily2D.remaining}/5 Today</span>
              </div>
            ) : isAuthenticated && !entitlements?.designPass?.active ? (
              <button
                type="button"
                onClick={() => setShowPassModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] text-white text-xs font-bold shadow-2xs hover:opacity-95 transition cursor-pointer"
              >
                <Icons.Sparkles size={13} />
                <span>Upgrade (₹299 Pass)</span>
              </button>
            ) : null}

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-[#F4EFEA] p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-[#E7E0D7] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'generator'
                  ? 'bg-white text-[#E76F2E] shadow-xs'
                  : 'text-[#54504A] hover:text-[#292826]'
                  }`}
              >
                <Icons.Blueprint size={12} className="shrink-0 sm:hidden" />
                <Icons.Blueprint size={13} className="shrink-0 hidden sm:block" />
                <span>AI Plan Generator</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[10.5px] sm:text-xs font-bold transition whitespace-nowrap cursor-pointer ${activeTab === 'chat'
                  ? 'bg-white text-[#E76F2E] shadow-xs'
                  : 'text-[#54504A] hover:text-[#292826]'
                  }`}
              >
                <Icons.MessageSquare size={13} className="shrink-0" />
                <span>Ask AI</span>
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1 sm:p-2 rounded-lg sm:rounded-xl text-[#54504A] hover:text-[#292826] hover:bg-[#F4EFEA] transition shrink-0 cursor-pointer"
              aria-label="Close AI Studio"
            >
              <Icons.Close size={16} className="sm:hidden" />
              <Icons.Close size={18} className="hidden sm:block" />
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
              <div className="shrink-0 bg-white border-b border-[#EEE9E3] px-3 sm:px-6 py-1.5 sm:py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[11px] sm:text-xs font-bold text-[#E76F2E]">
                    Step {step} of {totalWizardSteps}
                  </span>
                  <span className="hidden sm:inline-block text-xs text-[#54504A]">|</span>
                  <span className="hidden sm:inline-block text-xs text-[#54504A] font-medium">
                    {getStepCategoryTitle()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 sm:w-48 h-1.5 sm:h-2 bg-[#F1ECE5] rounded-full overflow-hidden">
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
            <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-8 sm:py-8 flex justify-center items-start">
              <div className="w-full max-w-xl">
                {/* ------------------------------------------------------------- */}
                {/* STEP 1: PLOT SHAPE SELECTION */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'shape' && (
                  <div className="space-y-3.5 sm:space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#E76F2E]/20">
                        Step 1 of {totalWizardSteps}: Plot Geometry
                      </span>
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        What shape is your plot / land?
                      </h3>
                      <p className="text-[11px] sm:text-sm text-[#54504A] mt-0.5 sm:mt-1">
                        Choose your plot geometry so our AI can configure accurate setbacks, column alignments, and Vastu grids.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4">
                      {/* Regular Card */}
                      <button
                        type="button"
                        onClick={() => setPlotShape('regular')}
                        className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-left transition relative overflow-hidden group ${plotShape === 'regular'
                          ? 'border-[#E76F2E] shadow-sm ring-1 sm:ring-2 ring-[#E76F2E] bg-[#FFF6E8]'
                          : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF8F5] border border-[#E7E0D7] flex items-center justify-center text-[#292826] shadow-2xs">
                              <Icons.Grid size={15} className="text-[#292826] sm:hidden" />
                              <Icons.Grid size={18} className="text-[#292826] hidden sm:block" />
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#292826] text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border border-[#E7E0D7]">
                              Regular
                            </span>
                          </div>
                          {plotShape === 'regular' && (
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#E76F2E] text-white shadow-xs">
                              <Icons.Check size={11} className="sm:hidden" />
                              <Icons.Check size={13} className="hidden sm:block" />
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-black tracking-tight">Rectangle / Square Plot</h4>
                        <p className="text-[11px] sm:text-xs text-stone-700 mt-1 leading-snug font-medium">
                          Standard 4-side rectangular plot with standard 90° corners (e.g. 30x50, 40x60, 20x40).
                        </p>
                        <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-[#EEE9E3] flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#E76F2E]">
                          <Icons.Grid size={12} className="text-[#E76F2E]" />
                          <span>23 questions grouped into 6 stages</span>
                        </div>
                      </button>

                      {/* Irregular Card */}
                      <button
                        type="button"
                        onClick={() => setPlotShape('irregular')}
                        className={`p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border-2 text-left transition relative overflow-hidden group ${plotShape === 'irregular'
                          ? 'border-[#E76F2E] shadow-sm ring-1 sm:ring-2 ring-[#E76F2E] bg-[#FFF6E8]'
                          : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E]'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-[#FAF8F5] border border-[#E7E0D7] flex items-center justify-center text-[#292826] shadow-2xs">
                              <Icons.Layers size={15} className="text-[#292826] sm:hidden" />
                              <Icons.Layers size={18} className="text-[#292826] hidden sm:block" />
                            </div>
                            <span className="px-2 py-0.5 rounded-md bg-[#FAF8F5] text-[#292826] text-[10px] sm:text-[11px] font-bold tracking-wide uppercase border border-[#E7E0D7]">
                              Irregular
                            </span>
                          </div>
                          {plotShape === 'irregular' && (
                            <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#E76F2E] text-white shadow-xs">
                              <Icons.Check size={11} className="sm:hidden" />
                              <Icons.Check size={13} className="hidden sm:block" />
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-sm sm:text-base text-black tracking-tight">Asymmetric / Odd Shape</h4>
                        <p className="text-[11px] sm:text-xs text-stone-700 mt-1 leading-snug font-medium">
                          L-shape, Triangle, Trapezoid, Corner cut, or curved odd-shaped plot boundary.
                        </p>
                        <div className="mt-2 pt-2 sm:mt-3 sm:pt-3 border-t border-[#EEE9E3] flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#E76F2E]">
                          <Icons.Layers size={12} className="text-[#E76F2E]" />
                          <span>23 questions grouped into 6 stages</span>
                        </div>
                      </button>
                    </div>

                    {/* Not Sure Banner with Direct File Upload & Auto-Detect */}
                    <div className="pt-0.5">
                      <label className={`w-full p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group shadow-xs ${plotShape === 'not_sure'
                        ? 'border-[#E76F2E] bg-[#FFF6E8] ring-1 sm:ring-2 ring-[#E76F2E]'
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
                        <div className="flex items-center gap-2.5 sm:gap-3.5">
                          <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white border border-[#E76F2E]/30 flex items-center justify-center text-lg sm:text-xl text-[#E76F2E] shadow-2xs group-hover:scale-105 transition shrink-0">
                            <Icons.Upload size={18} className="sm:hidden" />
                            <Icons.Upload size={22} className="hidden sm:block" />
                          </div>
                          <div>
                            <div className="font-extrabold text-xs sm:text-base text-[#292826]">
                              Not Sure? Upload Photo &amp; AI Will Detect
                            </div>
                            <div className="text-[10.5px] sm:text-xs text-[#54504A] mt-0.5 leading-snug">
                              Upload your plot photo or registry map — our AI will automatically analyze boundaries &amp; angles.
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0 w-full sm:w-auto">
                          <span className="px-2 py-0.5 rounded-md bg-orange-100/90 text-[#C65320] border border-orange-200 text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-2xs">
                            ⚡ Auto-Detect
                          </span>
                          <span
                            onClick={(e) => {
                              e.preventDefault()
                              setPlotShape('irregular')
                              setStep(2)
                            }}
                            className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl bg-[#E76F2E] text-white text-[11px] sm:text-xs font-bold shadow-xs hover:bg-[#C65320] transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Upload &amp; Detect</span>
                            <Icons.ChevronRight size={13} />
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
                  <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Plot Frontage
                      </span>
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        What is your Plot Width (Frontage)?
                      </h3>
                      <p className="text-[11px] sm:text-sm text-[#54504A] mt-0.5 sm:mt-1">
                        Enter the front width facing the road in feet.
                      </p>
                    </div>

                    <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-[#E7E0D7] shadow-xs space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min={10}
                            max={200}
                            value={plotWidth || ''}
                            onChange={(e) => setPlotWidth(Number(e.target.value))}
                            placeholder="Enter width (e.g. 30)"
                            className="w-full px-3 py-2 sm:px-4 sm:py-3.5 text-base sm:text-lg font-bold rounded-lg sm:rounded-xl border border-[#E7E0D7] focus:ring-2 focus:ring-[#E76F2E] outline-none bg-[#FDFCF9]"
                          />
                          <span className="absolute right-3 sm:right-4 top-2 sm:top-3.5 text-xs sm:text-sm font-bold text-[#54504A]">
                            Feet (ft)
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] sm:text-xs text-[#54504A] font-semibold block mb-1.5 sm:mb-2">
                          Popular Indian Plot Widths:
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {[20, 25, 30, 35, 40, 50].map((w) => (
                            <button
                              key={w}
                              type="button"
                              onClick={() => setPlotWidth(w)}
                              className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold border transition ${plotWidth === w
                                ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-xs'
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
                  <div className="space-y-4 sm:space-y-6 animate-fadeIn">
                    <div className="text-center sm:text-left">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#FFF6E8] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md border border-[#E76F2E]/20">
                        Step {step} of {totalWizardSteps}: Plot Depth
                      </span>
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        What is your Plot Depth (Length)?
                      </h3>
                      <p className="text-[11px] sm:text-sm text-[#54504A] mt-0.5 sm:mt-1">
                        Enter the plot length from front to back in feet.
                      </p>
                    </div>

                    <div className="bg-white p-3.5 sm:p-6 rounded-xl sm:rounded-2xl border border-[#E7E0D7] shadow-xs space-y-3 sm:space-y-4">
                      <div className="relative">
                        <input
                          type="number"
                          min={15}
                          max={300}
                          value={plotDepth || ''}
                          onChange={(e) => setPlotDepth(Number(e.target.value))}
                          placeholder="Enter depth (e.g. 50)"
                          className="w-full px-3 py-2 sm:px-4 sm:py-3.5 text-base sm:text-lg font-bold rounded-lg sm:rounded-xl border border-[#E7E0D7] focus:ring-2 focus:ring-[#E76F2E] outline-none bg-[#FDFCF9]"
                        />
                        <span className="absolute right-3 sm:right-4 top-2 sm:top-3.5 text-xs sm:text-sm font-bold text-[#54504A]">
                          Feet (ft)
                        </span>
                      </div>

                      <div>
                        <span className="text-[11px] sm:text-xs text-[#54504A] font-semibold block mb-1.5 sm:mb-2">
                          Popular Indian Plot Lengths:
                        </span>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {[30, 40, 45, 50, 60, 70].map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setPlotDepth(d)}
                              className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold border transition ${plotDepth === d
                                ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-xs'
                                : 'bg-white text-[#292826] border-[#E7E0D7] hover:border-[#E76F2E] hover:bg-[#FFF6E8]'
                                }`}
                            >
                              {d} ft
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 bg-[#FFF6E8] rounded-lg sm:rounded-xl border border-[#E76F2E]/20 flex items-center justify-between text-xs">
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${hasMapPin
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                              className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${sidesCount === count
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
                                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${roadFacingSide === sideLetter
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
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${existingStructures.includes(item)
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                                className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold border transition ${familySize === f.id
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
                                className={`flex-1 py-1 px-1.5 rounded-lg text-[11px] font-bold border transition ${budgetTier === b.id
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
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${vastuMode === m
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
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${lifestyleTags.includes(tag)
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${isSelected
                              ? 'border-[#E76F2E] bg-[#FFF8F0] shadow-md ring-2 ring-[#E76F2E]/30 scale-[1.01]'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E] hover:bg-orange-50/20 shadow-xs'
                              }`}
                          >
                            <div>
                              <div className="flex items-center justify-between w-full mb-2.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl p-1.5 rounded-xl bg-white border border-[#E7E0D7] shadow-2xs">
                                    {item.emoji}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border ${isSelected
                                      ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                      : 'bg-gray-100 text-[#374151] border-gray-200'
                                      }`}
                                  >
                                    {item.tag}
                                  </span>
                                </div>
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full transition shadow-xs ${isSelected
                                    ? 'bg-[#E76F2E] text-white ring-2 ring-[#E76F2E]/30'
                                    : 'border-2 border-gray-400 bg-gray-50'
                                    }`}
                                >
                                  {isSelected ? <Icons.Check size={14} className="stroke-[3]" /> : null}
                                </span>
                              </div>
                              <div className="text-base font-black tracking-tight !text-[#111827] text-gray-950" style={{ color: '#111827' }}>
                                {item.label}
                              </div>
                              <div className="text-xs mt-1 leading-relaxed !text-[#374151] font-semibold" style={{ color: '#374151' }}>
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-5 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${masterBedrooms === num
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-5 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${marriedCouples === num
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-5 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${kidsCount === num
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${kidsBedroom === choice
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex items-center justify-between cursor-pointer ${isSelected
                              ? 'border-[#E76F2E] bg-gradient-to-br from-[#FFF8F0] via-[#FFEDD5] to-[#FED7AA] shadow-lg ring-2 ring-[#E76F2E] scale-[1.01]'
                              : 'border-gray-300 bg-white hover:border-[#E76F2E] hover:bg-orange-50/30 shadow-sm'
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl p-1.5 rounded-xl bg-white/90 border border-gray-200 shadow-2xs">
                                {item.emoji}
                              </span>
                              <div>
                                <div className="text-sm font-black text-[#111827]">
                                  {item.label}
                                </div>
                                <div className="text-xs mt-0.5 text-[#374151] font-medium">
                                  {item.desc}
                                </div>
                              </div>
                            </div>
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition shadow-xs ml-3 ${isSelected
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2.5 relative ${kitchenType === item.id
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2.5 relative ${mandirPreference === item.id
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${balconies === choice
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${officeSpace === choice
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                            className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 relative flex flex-col justify-between cursor-pointer ${isSelected
                              ? 'border-[#E76F2E] bg-[#FFF8F0] shadow-md ring-2 ring-[#E76F2E]/30 scale-[1.01]'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E] hover:bg-orange-50/20 shadow-xs'
                              }`}
                          >
                            <div>
                              <div className="flex items-center justify-between w-full mb-2.5">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-2xl p-1.5 rounded-xl bg-white border border-[#E7E0D7] shadow-2xs">
                                    {item.emoji}
                                  </span>
                                  <span
                                    className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md border ${isSelected
                                      ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                      : 'bg-gray-100 text-[#374151] border-gray-200'
                                      }`}
                                  >
                                    {item.tag}
                                  </span>
                                </div>
                                <span
                                  className={`flex h-6 w-6 items-center justify-center rounded-full transition shadow-xs ${isSelected
                                    ? 'bg-[#E76F2E] text-white ring-2 ring-[#E76F2E]/30'
                                    : 'border-2 border-gray-400 bg-gray-50'
                                    }`}
                                >
                                  {isSelected ? <Icons.Check size={14} className="stroke-[3]" /> : null}
                                </span>
                              </div>
                              <div className="text-base font-black tracking-tight !text-[#111827] text-gray-950" style={{ color: '#111827' }}>
                                {item.label}
                              </div>
                              <div className="text-xs mt-1 leading-relaxed !text-[#374151] font-semibold" style={{ color: '#374151' }}>
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${garden === choice
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                          className={`py-6 rounded-2xl border-2 text-center transition font-display font-extrabold text-2xl relative ${lift === choice
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        Bathroom Size Preference
                      </h3>
                      <p className="text-xs sm:text-sm text-[#1F2937] font-medium mt-1">
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
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2 relative cursor-pointer ${bathroomChoice === item.id
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
                          <div className="p-2">
                            <div className={`font-black text-xs sm:text-sm ${bathroomChoice === item.id ? 'text-[#C65320]' : 'text-black'}`}>{item.label}</div>
                            <div className="text-[11px] text-[#1F2937] font-semibold mt-1 leading-snug">{item.desc}</div>
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        Main Road Facing Direction
                      </h3>
                      <p className="text-xs sm:text-sm text-[#1F2937] font-medium mt-1">
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
                          <span className="text-xs font-extrabold text-[#1F2937] block mt-1">
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
                            className={`py-2 px-1 rounded-xl text-xs font-bold border transition cursor-pointer ${plotDirection === d.name
                              ? 'bg-[#E76F2E] text-white border-[#E76F2E] shadow-sm'
                              : 'bg-[#FDFCF9] text-black border-[#E7E0D7] hover:border-[#E76F2E]'
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        Choose 3D Front Facade Style
                      </h3>
                      <p className="text-xs sm:text-sm text-[#1F2937] font-medium mt-1">
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
                          className={`group overflow-hidden rounded-2xl border-2 text-left transition p-2.5 relative cursor-pointer ${elevationStyle === item.id
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
                            <div className={`font-black text-xs sm:text-sm ${elevationStyle === item.id ? 'text-[#C65320]' : 'text-black'}`}>{item.id}</div>
                            <div className="text-xs text-[#1F2937] font-medium mt-1 line-clamp-2 leading-snug">{item.desc}</div>
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
                        Select Material Quality &amp; Budget Grade
                      </h3>
                      <p className="text-xs sm:text-sm text-[#1F2937] font-medium mt-1">
                        Specifies structure materials, sanitaryware, electricals, and flooring.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        {
                          id: 'Standard Solid Build (~₹1,450-₹1,800/sq.ft)',
                          name: 'Standard',
                          subTitle: 'Solid Budget Build',
                          emoji: '🧱',
                          rate: '₹1,450 / sq.ft',
                          tag: 'Budget Efficient',
                          tagColor: 'bg-stone-100 text-stone-800 border-stone-300',
                          desc: 'Red clay bricks, Kajaria vitrified tiles (2x2), Cera sanitaryware, Anchor Roma switches & ISI copper wiring.',
                        },
                        {
                          id: 'Premium Executive (~₹1,750-₹2,350/sq.ft)',
                          name: 'Premium',
                          subTitle: 'Executive Living',
                          emoji: '💎',
                          rate: '₹1,750 / sq.ft',
                          tag: '⭐ Most Popular',
                          tagColor: 'bg-amber-100 text-amber-900 border-amber-300',
                          desc: 'AAC blockwork, 4x2 GVT glazed tiles, Kohler/Jaquar bath fittings, Teak main door, Legrand modular switches.',
                        },
                        {
                          id: 'Ultra-Luxury Villa Grade (~₹2,200-₹3,200+/sq.ft)',
                          name: 'Luxury',
                          subTitle: 'Ultra Villa Grade',
                          emoji: '🏛️',
                          rate: '₹2,200+ / sq.ft',
                          tag: 'Luxury Bespoke',
                          tagColor: 'bg-purple-100 text-purple-900 border-purple-300',
                          desc: 'Italian marble flooring, Grohe/Toto smart automation, double-glazed soundproof UPVC, VRV AC ducting ready.',
                        },
                      ].map((item) => {
                        const isSelected = materialGrade.startsWith(item.name) || materialGrade === item.id
                        return (
                          <button
                            key={item.name}
                            type="button"
                            onClick={() => setMaterialGrade(item.id)}
                            className={`w-full p-4.5 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${isSelected
                              ? 'border-[#E76F2E] bg-[#FFF8F0] shadow-md ring-2 ring-[#E76F2E]/30 scale-[1.01]'
                              : 'border-[#E7E0D7] bg-white hover:border-[#E76F2E] hover:bg-orange-50/20 shadow-xs'
                              }`}
                          >
                            <div className="flex items-start gap-3.5">
                              <span className="text-2xl sm:text-3xl p-2.5 rounded-xl bg-white border border-[#E7E0D7] shadow-2xs shrink-0">
                                {item.emoji}
                              </span>
                              <div>
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <span className="text-lg font-black text-[#111827] tracking-tight">
                                    {item.name}
                                  </span>
                                  <span className="text-xs font-semibold text-[#4B5563]">
                                    ({item.subTitle})
                                  </span>
                                  <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded border ${item.tagColor}`}>
                                    {item.tag}
                                  </span>
                                </div>
                                <p className="text-xs mt-1.5 font-medium text-[#374151] leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                              <span
                                className={`text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl border ${isSelected
                                  ? 'bg-[#E76F2E] text-white border-[#E76F2E]'
                                  : 'bg-orange-50 text-[#C65320] border-orange-200'
                                  }`}
                              >
                                {item.rate}
                              </span>
                              <span
                                className={`flex h-6 w-6 items-center justify-center rounded-full transition shadow-xs ${isSelected
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                      <h3 className="font-display text-lg sm:text-2xl lg:text-3xl font-bold mt-1 text-[#292826]">
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
                {/* FREE PREVIEW & LEAD / AUTHENTICATION GATE */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'lead' && (
                  <div className="space-y-6 animate-fadeIn">
                    {user?.role === 'ADMIN' ? (
                      /* STATE 0: ADMIN LIVE TEST MODE */
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-emerald-500/40 shadow-sm text-center space-y-5">
                        <div className="h-12 w-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-200 shadow-xs">
                          🧪
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                            <span>🛡️ Admin Test Simulation Active</span> · Zero Customer Credits Deducted
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                            Render Plan in Admin Test Mode
                          </h3>
                          <p className="text-xs sm:text-sm text-[#54504A] mt-2 font-medium max-w-md mx-auto leading-relaxed">
                            You are previewing as Platform Administrator ({user?.name || user?.email}). You can test full 2D and 3D floorplan rendering without consuming user free limits or pass credits.
                          </p>
                        </div>

                        {/* Summary of Configuration */}
                        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E7E0D7] text-left grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#8C827A] block font-medium">Plot Area:</span>
                            <span className="font-bold text-[#292826]">{isRegular ? `${plotWidth}×${plotDepth} ft (${rawPlotAreaSqFt} sq.ft)` : `${rawPlotAreaSqFt} sq.ft`}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Configuration:</span>
                            <span className="font-bold text-[#292826]">{masterBedrooms} BHK · {floors.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Vastu &amp; Facing:</span>
                            <span className="font-bold text-[#E76F2E]">{plotDirection} Facing (100% Vastu)</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Built-up Area:</span>
                            <span className="font-bold text-[#292826]">~{builtUpArea} sq.ft</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Elevation Style:</span>
                            <span className="font-bold text-[#292826]">{elevationStyle}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Test Mode:</span>
                            <span className="font-bold text-emerald-700">Preview Bypass Active</span>
                          </div>
                        </div>

                        <div className="pt-2 max-w-md mx-auto space-y-3">
                          <button
                            type="button"
                            onClick={() => setStep(resultsStep)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#292826] to-[#454340] hover:bg-black text-white font-display text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                          >
                            <Icons.Sparkles size={16} />
                            <span>Simulate &amp; View 2D / 3D Layout (Admin Preview)</span>
                          </button>
                        </div>
                      </div>
                    ) : !isAuthenticated || !user ? (
                      /* STATE 1: GUEST / UNAUTHENTICATED USER */
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E0D7] shadow-sm text-center space-y-5">
                        <div className="h-12 w-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-200 shadow-xs">
                          <Icons.ShieldCheck size={22} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
                            <span>Step Complete</span> · Login / Signup Required for Free Plan
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                            Sign In to Generate Free 2D Conceptual Blueprint
                          </h3>
                          <p className="text-xs sm:text-sm text-[#54504A] mt-2 font-medium max-w-lg mx-auto leading-relaxed">
                            Every verified account receives 5 free conceptual 2D floor plans daily. Sign in or create an account to instantly generate and save your plan to your dashboard.
                          </p>
                        </div>

                        {/* Summary of Configuration */}
                        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E7E0D7] text-left grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#8C827A] block font-medium">Plot Area:</span>
                            <span className="font-bold text-[#292826]">{isRegular ? `${plotWidth}×${plotDepth} ft (${rawPlotAreaSqFt} sq.ft)` : `${rawPlotAreaSqFt} sq.ft`}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Configuration:</span>
                            <span className="font-bold text-[#292826]">{masterBedrooms} BHK · {floors.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Vastu &amp; Facing:</span>
                            <span className="font-bold text-[#E76F2E]">{plotDirection} Facing (100% Vastu)</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Built-up Area:</span>
                            <span className="font-bold text-[#292826]">~{builtUpArea} sq.ft</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Elevation Style:</span>
                            <span className="font-bold text-[#292826]">{elevationStyle}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Material Quality:</span>
                            <span className="font-bold text-[#292826]">{materialGrade.split(' ')[0]}</span>
                          </div>
                        </div>

                        <div className="pt-2 max-w-md mx-auto space-y-3">
                          <button
                            type="button"
                            onClick={() => onOpenLogin?.()}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-display text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                          >
                            <Icons.Sparkles size={16} />
                            <span>Sign In / Create Account to Generate (Free)</span>
                          </button>
                          <p className="text-[11px] text-[#8C827A] font-medium flex items-center justify-center gap-1.5">
                            <Icons.ShieldCheck size={13} className="text-amber-600 shrink-0" /> Your draft state is automatically preserved &amp; restored after login.
                          </p>
                        </div>
                      </div>
                    ) : entitlements?.designPass.active && entitlements.designPass.creditsRemaining > 0 ? (
                      /* STATE 1: ACTIVE DESIGN PASS HOLDER (PAID GENERATION UNLOCKED) */
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-amber-400/60 shadow-sm text-center space-y-5 animate-fadeIn">
                        <div className="h-12 w-12 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xl border border-amber-300 shadow-xs">
                          <Icons.Sparkles size={22} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs font-bold border border-amber-300 mb-2">
                            <Icons.Sparkles size={13} className="text-amber-600" />
                            <span>Design Pass Active</span> · {entitlements.designPass.creditsRemaining}/5 3D Credits · 2D: {entitlements.daily2D ? `${entitlements.daily2D.remaining}/5 Today` : '5/day'}
                            {entitlements.designPass.daysRemaining > 0 && (
                              <span> · Valid for {entitlements.designPass.daysRemaining} days</span>
                            )}
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                            Your Architecture Studio is Unlocked
                          </h3>
                          <p className="text-xs sm:text-sm text-[#54504A] mt-2 font-medium max-w-md mx-auto leading-relaxed">
                            Generate full photorealistic 3D front elevations, day/twilight lighting facades, and 2D CAD floor plans for your plot.
                          </p>
                        </div>

                        {/* Summary of Configuration */}
                        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E7E0D7] text-left grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#8C827A] block font-medium">Plot Area:</span>
                            <span className="font-bold text-[#292826]">{isRegular ? `${plotWidth}×${plotDepth} ft (${rawPlotAreaSqFt} sq.ft)` : `${rawPlotAreaSqFt} sq.ft`}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Configuration:</span>
                            <span className="font-bold text-[#292826]">{masterBedrooms} BHK · {floors.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Vastu &amp; Facing:</span>
                            <span className="font-bold text-[#E76F2E]">{plotDirection} Facing (100% Vastu)</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Built-up Area:</span>
                            <span className="font-bold text-[#292826]">~{builtUpArea} sq.ft</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Elevation Style:</span>
                            <span className="font-bold text-[#292826]">{elevationStyle}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Material Quality:</span>
                            <span className="font-bold text-[#292826]">{materialGrade.split(' ')[0]}</span>
                          </div>
                        </div>

                        {freeGenError && (
                          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 text-left">
                            {freeGenError}
                          </div>
                        )}

                        <div className="pt-2 max-w-md mx-auto space-y-2.5">
                          <button
                            type="button"
                            disabled={generatingPaid3D}
                            onClick={handleGeneratePaid3DPlan}
                            className={`w-full py-4 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-display text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                              generatingPaid3D ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {generatingPaid3D ? (
                              <>
                                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>Generating 3D Package &amp; Blueprints...</span>
                              </>
                            ) : (
                              <>
                                <Icons.Sparkles size={16} />
                                <span>Generate 3D Architectural Package (1 Credit)</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={generatingFree2D}
                            onClick={handleGenerateFree2DPlan}
                            className={`w-full py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#292826] font-display text-xs font-bold border border-[#E7E0D7] transition flex items-center justify-center gap-2 cursor-pointer ${
                              generatingFree2D ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {generatingFree2D ? (
                              <>
                                <span className="h-3.5 w-3.5 rounded-full border-2 border-[#E76F2E] border-t-transparent animate-spin" />
                                <span>Generating 2D Floor Plan...</span>
                              </>
                            ) : (
                              <>
                                <Icons.Blueprint size={14} className="text-[#E76F2E]" />
                                <span>Generate 2D Floor Plan ({entitlements.daily2D ? `${entitlements.daily2D.remaining}/5 Today` : '5/day'})</span>
                              </>
                            )}
                          </button>

                          <p className="text-[11px] text-[#8C827A] font-medium flex items-center justify-center gap-1.5">
                            <Icons.Sparkles size={12} className="text-amber-600 inline shrink-0" />
                            <span>3D models use 1 of your {entitlements.designPass.creditsRemaining} remaining 3D Pass credits. 2D plans use your 5 daily quota without consuming 3D credits.</span>
                          </p>
                        </div>
                      </div>
                    ) : (entitlements?.free2D ? entitlements.free2D.remaining > 0 : entitlements?.freeEntitlement && !entitlements.freeEntitlement.claimed && entitlements.freeEntitlement.creditsRemaining > 0) ? (
                      /* STATE 2: AUTHENTICATED USER — FREE 2D PREVIEWS AVAILABLE (5 LIFETIME QUOTA) */
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E0D7] shadow-sm text-center space-y-5 animate-fadeIn">
                        <div className="h-12 w-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl border border-emerald-200 shadow-xs">
                          <Icons.Check size={22} className="text-emerald-600" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-2">
                            <Icons.Sparkles size={12} className="text-emerald-600" />
                            <span>Free 2D Quota · {entitlements?.free2D?.remaining ?? entitlements?.freeEntitlement?.creditsRemaining ?? 5}/5 Remaining · {user?.name || user?.email || 'Verified Account'}</span>
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                            Your 2D Blueprint is Ready to Generate
                          </h3>
                          <p className="text-xs sm:text-sm text-[#54504A] mt-2 font-medium max-w-md mx-auto leading-relaxed">
                            Click below to generate your conceptual 2D floor plan blueprint. It will be permanently saved under your projects dashboard.
                          </p>
                        </div>

                        {/* Summary of Configuration */}
                        <div className="bg-[#FAF7F2] p-4 sm:p-5 rounded-xl border border-[#E7E0D7] text-left grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#8C827A] block font-medium">Plot Area:</span>
                            <span className="font-bold text-[#292826]">{isRegular ? `${plotWidth}×${plotDepth} ft (${rawPlotAreaSqFt} sq.ft)` : `${rawPlotAreaSqFt} sq.ft`}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Configuration:</span>
                            <span className="font-bold text-[#292826]">{masterBedrooms} BHK · {floors.split(' ')[0]}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Vastu &amp; Facing:</span>
                            <span className="font-bold text-[#E76F2E]">{plotDirection} Facing</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Built-up Area:</span>
                            <span className="font-bold text-[#292826]">~{builtUpArea} sq.ft</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Elevation Style:</span>
                            <span className="font-bold text-[#292826]">{elevationStyle}</span>
                          </div>
                          <div>
                            <span className="text-[#8C827A] block font-medium">Material Quality:</span>
                            <span className="font-bold text-[#292826]">{materialGrade.split(' ')[0]}</span>
                          </div>
                        </div>

                        {freeGenError && (
                          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 text-left">
                            {freeGenError}
                          </div>
                        )}

                        <div className="pt-2 max-w-md mx-auto space-y-3">
                          <button
                            type="button"
                            disabled={generatingFree2D}
                            onClick={handleGenerateFree2DPlan}
                            className={`w-full py-4 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-display text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                              generatingFree2D ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {generatingFree2D ? (
                              <>
                                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                <span>Generating &amp; Saving Free Plan...</span>
                              </>
                            ) : (
                              <>
                                <Icons.Sparkles size={16} />
                                <span>Generate Free 2D Plan ({entitlements?.free2D?.remaining ?? entitlements?.freeEntitlement?.creditsRemaining ?? 5}/5 Left)</span>
                              </>
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setShowPassModal(true)}
                            className="w-full py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Icons.Sparkles size={13} className="text-amber-700" />
                            <span>Want 3D Facades &amp; Renders? Upgrade to ₹299 Pass</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* STATE 3: FREE PREVIEW CONSUMED & NO ACTIVE PASS */
                      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#E7E0D7] shadow-sm text-center space-y-5 animate-fadeIn">
                        <div className="h-12 w-12 mx-auto rounded-full bg-orange-50 text-[#E76F2E] flex items-center justify-center font-bold text-xl border border-orange-200 shadow-xs">
                          <Icons.Sparkles size={22} className="text-[#E76F2E]" />
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-[#C65320] text-xs font-bold border border-orange-200 mb-2">
                            <Icons.Sparkles size={12} className="text-[#C65320]" />
                            <span>Today's Free 2D Quota Completed (5/5 Used)</span>
                          </div>
                          <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#111827]">
                            Unlock 3D Designs &amp; Instant Quota (₹299 Pass)
                          </h3>
                          <p className="text-xs sm:text-sm text-[#54504A] mt-2 font-medium max-w-md mx-auto leading-relaxed">
                            You have used your 5 free 2D floor plan generations for today. Daily quota resets at midnight, or upgrade to the 30-Day Design Pass (₹299) to unlock 5 photorealistic 3D architectural packages right now.
                          </p>
                        </div>

                        {freeGenError && (
                          <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 text-left">
                            {freeGenError}
                          </div>
                        )}

                        <div className="pt-2 max-w-md mx-auto space-y-3">
                          <button
                            type="button"
                            onClick={() => setShowPassModal(true)}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-display text-sm font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                          >
                            <Icons.Sparkles size={16} />
                            <span>Unlock 5 3D Generations &amp; 5 2D/Day (₹299 Pass)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setStep(resultsStep)}
                            className="w-full py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#F2ECE4] text-[#292826] font-display text-xs font-bold border border-[#E7E0D7] transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>View Synthesized 2D Floor Plan Preview</span>
                            <Icons.ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ------------------------------------------------------------- */}
                {/* RESULTS SHOWCASE STAGE */}
                {/* ------------------------------------------------------------- */}
                {currentStepKey === 'results' && (
                  <div className="space-y-6 animate-fadeIn pb-6">
                    {/* Top Result Banner (Restructured without overflow) */}
                    <div className="w-full bg-gradient-to-r from-[#FFF6E8] via-[#FFF3E3] to-[#F7ECE1] p-5 rounded-2xl border border-[#E76F2E]/40 shadow-sm space-y-4">
                      {/* Row 1: Badges & Headings */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#E76F2E] text-white text-[11px] font-extrabold tracking-wider uppercase shadow-xs">
                            96% AI Matched
                          </span>
                          <span className="text-xs font-extrabold text-[#1F2937]">
                            {isRegular ? 'Conceptual 2D Floor-Plan Preview' : 'Asymmetric Optimized Layout'}
                          </span>
                          <span className="text-[11px] font-semibold text-[#6B7280]">
                            · Conceptual Planning Reference
                          </span>
                        </div>
                        <h4 className="font-display font-black text-xl sm:text-2xl text-[#111827] mt-1.5">
                          {isRegular ? `${plotWidth}x${plotDepth} ft` : `${rawPlotAreaSqFt} sq.ft Asymmetric`} {plotDirection} Facing {floors.split(' ')[0]} Residence
                        </h4>
                        <p className="text-xs text-[#374151] font-medium mt-1">
                          Designed for your Indore plot requirements · Vastu &amp; Setback Planning Reference
                        </p>
                      </div>

                      {/* Row 2: Action Buttons */}
                      <div className="flex items-center gap-2.5 flex-wrap pt-1 border-t border-[#E7E0D7]/60">
                        {!is3DUnlocked && (
                          <button
                            type="button"
                            onClick={() => setShowPassModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white text-xs font-black shadow-md transition flex items-center gap-1.5 active:scale-[0.98] cursor-pointer"
                          >
                            <span>Unlock 3D Designs (₹299)</span>
                            <Icons.Sparkles size={14} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={handleSharePlan}
                          className="px-4 py-2.5 rounded-xl bg-white border border-[#E7E0D7] text-xs font-bold text-[#1F2937] hover:border-[#E76F2E] hover:bg-[#FFF6E8] transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                          <Icons.Share size={13} className="text-[#E76F2E]" />
                          <span>{copiedLink ? '✓ Link Copied!' : 'Share Plan'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenConsult?.(`AI Generated Plan for ${plotWidth}x${plotDepth} ft ${plotDirection} Facing Plot`)}
                          className="px-4 py-2.5 rounded-xl bg-[#292826] text-white text-xs font-bold hover:bg-[#1F1E1D] transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Talk to Architect</span>
                          <Icons.ChevronRight size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Key Technical Specs Grid (High Contrast) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="bg-white p-3.5 rounded-xl border border-[#E7E0D7] text-center shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">Total Plot Area</span>
                        <span className="font-display font-black text-lg text-[#111827] mt-0.5 block">
                          {rawPlotAreaSqFt} sq.ft
                        </span>
                        <span className="text-[11px] text-[#4B5563] font-semibold block">{plotAreaSqYards} sq.yards</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#E7E0D7] text-center shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">
                          {isRegular ? 'Super Built-Up Area' : 'Buildable Base'}
                        </span>
                        <span className="font-display font-black text-lg text-[#9A3412] mt-0.5 block">
                          {builtUpArea} sq.ft
                        </span>
                        <span className="text-[11px] text-[#4B5563] font-semibold block">Carpet: {carpetArea} sq.ft</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#E7E0D7] text-center shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">Est. Cost Range</span>
                        <span className="font-display font-black text-lg text-[#047857] mt-0.5 block">
                          ₹{estimatedCostLakhs} L
                        </span>
                        <span className="text-[11px] text-[#4B5563] font-semibold block">@ ₹{finalRatePerSqFt}/sq.ft</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#E7E0D7] text-center shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] block">Vastu Score</span>
                        <span className="font-display font-black text-lg text-[#1E40AF] mt-0.5 block">
                          98 / 100
                        </span>
                        <span className="text-[11px] text-[#4B5563] font-semibold block">Ishan + Agneya Aligned</span>
                      </div>
                    </div>

                    {/* Interactive 3D Render (Top) & 2D CAD Blueprint Display (Horizontally Below) */}
                    <div className="flex flex-col gap-6">
                      {/* 1. 3D Photorealistic Exterior / Paywalled Teaser (Shown on Top) */}
                      <div className="bg-white rounded-2xl border border-[#E7E0D7] overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-[#EEE9E3] flex items-center justify-between bg-[#FDFCF9]">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full ${is3DUnlocked ? 'bg-emerald-500' : 'bg-[#E76F2E]'}`} />
                            <span className="font-black text-xs sm:text-sm text-[#111827]">
                              {is3DUnlocked ? `3D Elevation & Walkthrough (${elevationStyle})` : '3D Elevation (Locked Preview)'}
                            </span>
                          </div>
                          {is3DUnlocked ? (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                                ✓ Pass Active · {creditsRemaining ?? 0} Credits
                              </span>
                              {is3DGenerated && (
                                <div className="flex items-center gap-1 bg-[#EEE9E3] p-0.5 rounded-lg text-[10px] sm:text-xs font-bold">
                                  <button
                                    type="button"
                                    onClick={() => setIsNightLighting(false)}
                                    className={`px-2.5 py-0.5 rounded transition cursor-pointer ${!isNightLighting ? 'bg-white text-black shadow-xs' : 'text-[#1F2937]'
                                      }`}
                                  >
                                    Daylight
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setIsNightLighting(true)}
                                    className={`px-2.5 py-0.5 rounded transition cursor-pointer ${isNightLighting ? 'bg-[#292826] text-white shadow-xs' : 'text-[#1F2937]'
                                      }`}
                                  >
                                    Twilight
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              🔒 ₹299 Design Pass
                            </span>
                          )}
                        </div>

                        {/* If 3D is NOT unlocked: Show Watermarked Teaser Card with ₹299 Paywall */}
                        {!is3DUnlocked && (
                          <div className="relative min-h-[340px] sm:min-h-[380px] bg-slate-900 overflow-hidden group flex items-center justify-center p-4 sm:p-8">
                            {/* Blurred Teaser Image Background */}
                            <img
                              src={getElevationImage()}
                              alt="3D Teaser Preview"
                              className="absolute inset-0 w-full h-full object-cover blur-[6px] opacity-30 scale-105"
                            />

                            {/* Watermark Diagonal Banner */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none rotate-[-12deg] opacity-20">
                              <span className="text-white font-black text-2xl sm:text-3xl tracking-[0.25em] whitespace-nowrap uppercase border-y-2 border-white/40 py-2.5">
                                INDORE HOUSE MAKERS PREVIEW
                              </span>
                            </div>

                            {/* Paywall Overlay Card */}
                            <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md p-6 sm:p-7 rounded-2xl border border-[#E7E0D7] shadow-2xl text-center space-y-3.5">
                              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white shadow-md font-bold text-xl mx-auto">
                                🔒
                              </div>
                              <div>
                                <h5 className="font-display font-black text-lg sm:text-xl text-[#111827]">
                                  Premium 3D Concept Model
                                </h5>
                                <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-medium leading-relaxed">
                                  Unlock 5 complete 3D design packages · Day &amp; Twilight renders · Floor-by-floor dollhouse views · Interactive walkthrough
                                </p>
                              </div>

                              <div className="pt-1">
                                <div className="inline-block px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 mb-3">
                                  ₹299 one-time · 30 Days Validity · 5 Credits
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowPassModal(true)}
                                  className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                                >
                                  <span>Unlock 3D Designs (₹299)</span>
                                  <Icons.ChevronRight size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* If 3D IS unlocked but not yet generated: Show 1-Credit Confirmation */}
                        {is3DUnlocked && !is3DGenerated && (
                          <div className="min-h-[200px] bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                            <div className="flex items-center gap-4">
                              <div className="h-14 w-14 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                                ✨
                              </div>
                              <div>
                                <h5 className="font-display font-extrabold text-lg sm:text-xl text-black">
                                  3D Access Unlocked!
                                </h5>
                                <p className="text-xs sm:text-sm text-[#4B5563] mt-1 font-medium max-w-md">
                                  Credits available: <strong className="text-emerald-700">{creditsRemaining ?? 0}</strong> · This generation will consume <strong className="text-black">1 credit</strong>.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={generating3D}
                              onClick={async () => {
                                setGenerating3D(true)
                                try {
                                  const authHeader: Record<string, string> = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
                                  
                                  // 1. Build the single project payload (persisted with the generation job)
                                  const plotDimensionStr = isRegular ? `${plotWidth}×${plotDepth} ft` : `${rawPlotAreaSqFt} sq.ft`
                                  const projectPayload = {
                                    title: `${plotDimensionStr} ${plotDirection} Facing ${floors.split(' ')[0]} Residence`,
                                    plotSize: plotDimensionStr,
                                    dimensions: plotDimensionStr,
                                    plotWidth: isRegular ? plotWidth : Math.round(Math.sqrt(rawPlotAreaSqFt)),
                                    plotDepth: isRegular ? plotDepth : Math.round(Math.sqrt(rawPlotAreaSqFt)),
                                    rawPlotAreaSqFt,
                                    plotAreaSqFt: rawPlotAreaSqFt,
                                    plotAreaSqYards,
                                    facing: `${plotDirection} Facing`,
                                    bhk: `${suggestedBHK} BHK`,
                                    floors,
                                    elevationStyle,
                                    materialGrade,
                                    builtUpArea,
                                    carpetArea,
                                    estimatedCostLakhs,
                                    vastuScore: 98,
                                    leadName: user?.name || 'Indore Client',
                                    leadCity: (user as any)?.city || 'Indore, MP',
                                    image: getElevationImage(),
                                    has3D: true,
                                    is3DUnlocked: true,
                                    status: 'COMPLETED',
                                  }

                                  // 2. Authoritative Backend 3D Generation & Ledger Deduction
                                  if (accessToken) {
                                    try {
                                      const genRes = await startPaid3DGeneration(`wiz_studio_${Date.now()}`, authHeader, { wizardData: projectPayload })
                                      if (genRes?.creditsRemaining !== undefined) {
                                        setCreditsRemaining(genRes.creditsRemaining)
                                        notifyDataChanged('generations')
                                        notifyDataChanged('credits')
                                      }
                                    } catch (err: any) {
                                      console.warn('Backend 3D generation notice:', err?.message)
                                    }
                                  }

                                  // 3. Refresh user balances across the app
                                  await refreshEntitlements().catch(() => null)
                                  await refreshAuth().catch(() => null)

                                  setIs3DGenerated(true)
                                } catch {
                                  setIs3DGenerated(true)
                                } finally {
                                  setGenerating3D(false)
                                }
                              }}
                              className="py-3.5 px-6 rounded-xl bg-[#E76F2E] hover:bg-[#C65320] text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
                            >
                              {generating3D ? (
                                <>
                                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                  <span>Synthesizing 3D Walkthrough &amp; Saving...</span>
                                </>
                              ) : (
                                <>
                                  <span>Use 1 Credit &amp; Generate 3D Design</span>
                                  <Icons.Sparkles size={15} />
                                </>
                              )}
                            </button>
                          </div>
                        )}

                        {/* If 3D IS unlocked & generated: Show full photorealistic render with CTAs */}
                        {is3DUnlocked && is3DGenerated && (
                          <div className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] bg-gray-100 overflow-hidden group">
                            <img
                              src={getElevationImage()}
                              alt="3D Elevation Render"
                              className="w-full h-full object-cover object-center transition duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl text-white text-xs font-bold border border-white/20 shadow-md flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>Full 3D Elevation &amp; Walkthrough Unlocked</span>
                            </div>
                            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => window.open(getElevationImage(), '_blank')}
                                className="px-3.5 py-2 rounded-xl bg-black/80 hover:bg-black text-white text-xs font-bold backdrop-blur-md border border-white/20 shadow-md transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Icons.Eye size={13} />
                                <span>View Full HD</span>
                              </button>
                              <button
                                type="button"
                                onClick={handleSharePlan}
                                className="px-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-black text-xs font-bold backdrop-blur-md shadow-md transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <Icons.Share size={13} />
                                <span>{copiedLink ? 'Copied' : 'Share'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 2. Conceptual 2D Floor Plan Preview (High-Contrast Blueprint - Placed Underneath Horizontally) */}
                      <div className="bg-white rounded-2xl border border-[#E7E0D7] overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-[#EEE9E3] flex items-center justify-between bg-[#FDFCF9]">
                          <div className="flex items-center gap-2.5">
                            <Icons.Blueprint size={16} className="text-[#E76F2E]" />
                            <span className="font-bold text-xs sm:text-sm text-black">
                              Conceptual 2D Floor Plan Blueprint (Ground &amp; First Floor Layout)
                            </span>
                          </div>
                          <div className="flex items-center gap-1 bg-[#EEE9E3] p-1 rounded-xl text-xs font-bold">
                            <button
                              type="button"
                              onClick={() => setActiveFloorView('ground')}
                              className={`px-3 py-1 rounded-lg transition cursor-pointer ${activeFloorView === 'ground' ? 'bg-white text-black shadow-xs' : 'text-[#1F2937]'
                                }`}
                            >
                              Ground Plan
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveFloorView('first')}
                              className={`px-3 py-1 rounded-lg transition cursor-pointer ${activeFloorView === 'first' ? 'bg-white text-black shadow-xs' : 'text-[#1F2937]'
                                }`}
                            >
                              First Floor
                            </button>
                          </div>
                        </div>

                        {/* Architectural Vector Blueprint Canvas */}
                        <div className="p-4 sm:p-6 bg-[#0A1628] flex-1 flex flex-col justify-between text-white font-mono text-xs select-none relative overflow-hidden min-h-[420px]">
                          {/* Top Header */}
                          <div className="flex justify-between items-center text-[11px] font-bold border-b border-sky-500/30 pb-2">
                            <span className="text-sky-300">
                              {activeFloorView === 'ground' ? 'GROUND FLOOR LAYOUT (SCALE 1:100)' : 'FIRST FLOOR LAYOUT (SCALE 1:100)'}
                            </span>
                            <span className="text-amber-300">VASTU ORIENTATION: {plotDirection.toUpperCase()} ENTRY</span>
                          </div>

                          {/* Architectural SVG Floor Plan Drawing */}
                          <div className="my-4 flex-1 flex items-center justify-center">
                            <svg viewBox="0 0 400 280" className="w-full h-full max-w-3xl max-h-[360px] sm:max-h-[420px] drop-shadow-md">
                              {/* Background Blueprint Grid */}
                              <defs>
                                <pattern id="blueprintGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1E293B" strokeWidth="0.75" />
                                </pattern>
                              </defs>
                              <rect width="400" height="280" fill="url(#blueprintGrid)" />

                              {/* Outer Boundary Wall (Heavy Double Line) */}
                              <rect x="20" y="20" width="360" height="240" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" rx="2" />
                              <rect x="25" y="25" width="350" height="230" fill="none" stroke="#0284C7" strokeWidth="1" strokeDasharray="4 2" />

                              {activeFloorView === 'ground' ? (
                                /* GROUND FLOOR ROOMS */
                                <g>
                                  {/* Living Room & Foyer (Top-Left / North-East) */}
                                  <rect x="25" y="25" width="200" height="135" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="125" y="75" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    LIVING &amp; FOYER
                                  </text>
                                  <text x="125" y="93" fill="#94A3B8" fontSize="9.5" textAnchor="middle" fontFamily="monospace">
                                    {isRegular ? '14\'-6" x 18\'-0"' : '13\'-0" x 17\'-0"'}
                                  </text>
                                  <text x="125" y="110" fill="#34D399" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    ✓ North-East Light
                                  </text>

                                  {/* Pooja Mandir (Top-Right / Ishan Corner) */}
                                  <rect x="225" y="25" width="75" height="70" fill="#1A2E35" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="262" y="55" fill="#FBBF24" fontSize="9.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    POOJA
                                  </text>
                                  <text x="262" y="70" fill="#CBD5E1" fontSize="8" textAnchor="middle" fontFamily="monospace">
                                    6'x6'
                                  </text>

                                  {/* Kitchen (Agni / South-East Corner) */}
                                  <rect x="300" y="25" width="75" height="135" fill="#2E201B" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="337" y="80" fill="#FB923C" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    KITCHEN
                                  </text>
                                  <text x="337" y="98" fill="#CBD5E1" fontSize="8.5" textAnchor="middle" fontFamily="monospace">
                                    10'x12'
                                  </text>
                                  <text x="337" y="115" fill="#FBBF24" fontSize="7.5" textAnchor="middle" fontFamily="sans-serif">
                                    (Agni SE)
                                  </text>

                                  {/* Master Bedroom (Bottom-Right / South-West) */}
                                  <rect x="200" y="160" width="175" height="95" fill="#1E2235" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="287" y="200" fill="#A78BFA" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    MASTER BEDROOM
                                  </text>
                                  <text x="287" y="218" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                    14'-0" x 13'-6"
                                  </text>
                                  <text x="287" y="235" fill="#818CF8" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
                                    ✓ Nairutya Zone
                                  </text>

                                  {/* Car Porch / Parking & Stairs (Bottom-Left) */}
                                  <rect x="25" y="160" width="175" height="95" fill="#16232E" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="112" y="200" fill="#67E8F9" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    PARKING &amp; PORCH
                                  </text>
                                  <text x="112" y="218" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                    11'-0" x 16'-0"
                                  </text>
                                  <text x="112" y="235" fill="#38BDF8" fontSize="8" textAnchor="middle" fontFamily="sans-serif">
                                    🚗 Gate Access · Stairs UP ⬆
                                  </text>

                                  {/* Main Door Swing Arc */}
                                  <path d="M 25 90 A 25 25 0 0 1 50 115" fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="2 2" />
                                  <line x1="25" y1="90" x2="25" y2="115" stroke="#34D399" strokeWidth="2" />
                                </g>
                              ) : (
                                /* FIRST FLOOR ROOMS */
                                <g>
                                  {/* Master Bedroom 01 (Top-Left) */}
                                  <rect x="25" y="25" width="180" height="120" fill="#1E2235" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="115" y="75" fill="#A78BFA" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    MASTER BED 01
                                  </text>
                                  <text x="115" y="93" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                    14'-0" x 16'-0"
                                  </text>

                                  {/* Bedroom 02 (Top-Right) */}
                                  <rect x="205" y="25" width="170" height="120" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="290" y="75" fill="#38BDF8" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    BEDROOM 02
                                  </text>
                                  <text x="290" y="93" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                    12'-0" x 14'-0"
                                  </text>

                                  {/* Family Lounge (Bottom-Left) */}
                                  <rect x="25" y="145" width="200" height="110" fill="#1B2838" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="125" y="195" fill="#67E8F9" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    FAMILY LOUNGE
                                  </text>
                                  <text x="125" y="213" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                    14'-6" x 12'-0"
                                  </text>

                                  {/* Balcony Sitout (Bottom-Right) */}
                                  <rect x="225" y="145" width="150" height="110" fill="#132F2B" stroke="#38BDF8" strokeWidth="2" />
                                  <text x="300" y="195" fill="#34D399" fontSize="10.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
                                    BALCONY SITOUT
                                  </text>
                                  <text x="300" y="213" fill="#94A3B8" fontSize="9" textAnchor="middle" fontFamily="monospace">
                                    11'-0" x 8'-6"
                                  </text>
                                </g>
                              )}

                              {/* Dimension Lines (Outer Reference) */}
                              <line x1="20" y1="12" x2="380" y2="12" stroke="#38BDF8" strokeWidth="1" />
                              <text x="200" y="9" fill="#38BDF8" fontSize="8" textAnchor="middle" fontFamily="monospace">
                                {isRegular ? `${plotWidth}'-0"` : '30\'-0"'} WIDTH
                              </text>

                              {/* Compass Rose (Top-Right Corner) */}
                              <g transform="translate(355, 45)">
                                <circle cx="0" cy="0" r="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" />
                                <polygon points="0,-12 3,0 0,2 -3,0" fill="#EF4444" />
                                <polygon points="0,12 3,0 0,-2 -3,0" fill="#94A3B8" />
                                <text x="0" y="-14" fill="#EF4444" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">N</text>
                              </g>
                            </svg>
                          </div>

                          {/* Blueprint Footer Bar */}
                          <div className="flex justify-between items-center text-[10px] font-bold pt-1.5 border-t border-sky-500/30">
                            <span className="text-sky-300 font-sans">INDORE HOUSE MAKERS · CONCEPTUAL REFERENCE</span>
                            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              2D PREVIEW READY
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-4 bg-white rounded-2xl border border-[#E7E0D7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#1F2937]">
                        <Icons.Check size={16} className="text-emerald-600 shrink-0 font-bold" />
                        <span>Conceptual Floor Plan Preview Generated for Verified Account (<strong className="text-black">{user?.phone || user?.email || '+91 Verified Mobile'}</strong>)</span>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#E7E0D7] text-xs font-bold text-[#1F2937] hover:border-[#E76F2E] hover:bg-[#FFF6E8] transition cursor-pointer"
                        >
                          Modify Parameters
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenConsult?.(`Consultation regarding generated plan for ${user?.name || 'client'}`)}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
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
              <footer className="shrink-0 bg-white border-t border-[#EEE9E3] px-3 sm:px-6 py-2 sm:py-3.5 flex items-center justify-between gap-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 1}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs font-bold border transition flex items-center gap-1 sm:gap-1.5 cursor-pointer ${step === 1
                    ? 'opacity-40 border-[#E7E0D7] text-[#54504A] cursor-not-allowed'
                    : 'border-[#E7E0D7] text-[#292826] hover:border-[#292826] bg-white'
                    }`}
                >
                  <Icons.ChevronLeft size={15} />
                  <span>Back</span>
                </button>

                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[11px] font-bold text-[#54504A] hidden sm:inline-block">
                    {step === totalWizardSteps ? 'Ready to Synthesize' : `Next: Step ${step + 1} of ${totalWizardSteps}`}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4.5 sm:px-7 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-[#E76F2E] text-white text-xs font-bold hover:bg-[#C65320] transition shadow-xs active:scale-95 flex items-center gap-1 sm:gap-1.5 cursor-pointer"
                  >
                    <span>{step === totalWizardSteps ? 'Generate AI Plan ✨' : 'Next'}</span>
                    <Icons.ChevronRight size={15} />
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
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1.5">
                        <Icons.Blueprint size={13} className="text-[#E76F2E] shrink-0" /> <span>2D House Plans</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">30x50, 20x40 layouts</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat('Vastu rules for Kitchen and Pooja room')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1.5">
                        <Icons.Compass size={13} className="text-[#E76F2E] shrink-0" /> <span>100% Vastu Shastra</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">Kitchen &amp; Mandir rules</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat('Construction cost for 1500 sq.ft in Indore')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1.5">
                        <Icons.Calculator size={13} className="text-[#E76F2E] shrink-0" /> <span>Cost Estimator</span>
                      </div>
                      <div className="text-[9.5px] text-[#54504A] mt-0.5">Indore material rates</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSendChat('What is included in the ₹299 AI Plan?')}
                      className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3] hover:border-[#E76F2E] hover:bg-[#FFF6E8] text-left transition group cursor-pointer"
                    >
                      <div className="font-bold text-[10.5px] text-[#292826] group-hover:text-[#E76F2E] flex items-center gap-1.5">
                        <Icons.Sparkles size={13} className="text-[#E76F2E] shrink-0" /> <span>₹299 AI Plan</span>
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
                    className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-xs leading-relaxed ${msg.from === 'user'
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
                      className={`text-[9px] mt-1.5 text-right ${msg.from === 'user' ? 'text-white/80' : 'text-[#54504A]'
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
                { label: '30x50 East Plan', query: '30x50 East Facing House Plan recommendation' },
                { label: 'Indore Construction Cost', query: 'Construction cost for 1500 sq.ft in Indore' },
                { label: 'Vastu for Mandir & Kitchen', query: 'Vastu directions for Mandir and Kitchen' },
                { label: 'What is in ₹299 Plan?', query: 'What is included in the ₹299 AI Plan?' },
                { label: 'Modern Duplex 3D Elevation', query: 'Modern 3D Front Elevation designs' },
                { label: 'Speak with Architect', query: 'I want to talk to an architect' },
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

      {/* 30-Day Design Pass Upgrade Modal */}
      <DesignPassModal
        open={showPassModal}
        onClose={() => setShowPassModal(false)}
        token={accessToken || (typeof window !== 'undefined' ? localStorage.getItem('ihm_access_token') : null)}
        user={user}
        activePassInfo={
          entitlements?.designPass
            ? {
                active: !!entitlements.designPass.active,
                remainingCredits: entitlements.designPass.creditsRemaining || 0,
                expiresAt: entitlements.designPass.expiresAt,
              }
            : null
        }
        onSuccess={async () => {
          setIs3DUnlocked(true)
          await refreshEntitlements().catch(() => null)
          await refreshAuth().catch(() => null)
        }}
        onRequireAuth={() => {
          if (onOpenLogin) {
            onOpenLogin()
          } else {
            onOpenConsult?.('Authenticate for Design Pass')
          }
        }}
      />
    </div>
  )
}
