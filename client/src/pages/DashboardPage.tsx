import React, { useState, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'
import {
  DashboardLayout,
  PageHeader,
  MetricCard,
  DataTable,
  StatusText,
  EmptyState,
} from '../components/dashboard'
import {
  fetchUserProjects,
  fetchUserCredits,
  fetchUserEntitlements,
  fetchUserConsultations,
  fetchUserSessions,
  revokeUserSession,
  revokeAllOtherSessions,
  updateUserProfile,
  changeUserPassword,
  createUserProject,
  type UserProject,
  type CreditTransactionItem,
  type UserSessionItem,
  type UserConsultationItem,
} from '../lib/api'
import { subscribeDataChanged } from '../lib/syncEvents'

type DashboardTab = 'overview' | 'projects' | 'credits' | 'consultations' | 'security'

interface DashboardPageProps {
  onOpenConsult?: (details?: string) => void
  onOpenAiStudio?: () => void
  onOpenLogin?: () => void
}

export default function DashboardPage({
  onOpenConsult,
  onOpenAiStudio,
  onOpenLogin,
}: DashboardPageProps) {
  useSeoMeta({
    title: 'User Workspace | Indore House Makers',
    description:
      'Manage your architectural blueprints, active passes, credits ledger, and account security.',
  })

  const { user, isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAuth()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  // Data states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<UserProject[]>([])
  const [creditsData, setCreditsData] = useState<{
    availableBalance: number
    transactions: CreditTransactionItem[]
  } | null>(null)
  const [creditsTotal, setCreditsTotal] = useState<number>(5)
  const [passData, setPassData] = useState<{
    hasActivePass: boolean
    pass: any
    daysRemaining?: number
  } | null>(null)
  const [consultations, setConsultations] = useState<UserConsultationItem[]>([])
  const [sessions, setSessions] = useState<UserSessionItem[]>([])

  // Profile & Password form states
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profilePhone, setProfilePhone] = useState(user?.phone || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      if (user.name) setProfileName(user.name)
      if (user.phone) setProfilePhone(user.phone)
    }
  }, [user])

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Quick project generation state
  const [creatingProject, setCreatingProject] = useState(false)
  const [newPlotWidth, setNewPlotWidth] = useState('30')
  const [newPlotDepth, setNewPlotDepth] = useState('50')
  const [newBhk, setNewBhk] = useState('3 BHK')
  const [newFacing, setNewFacing] = useState('East Facing')

  // Critical Path Loader: Only fetch what is needed for initial dashboard paint
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated || user?.role === 'ADMIN') {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const headers = getAuthHeaders()

    try {
      const [proj, ent] = await Promise.all([
        fetchUserProjects(headers).catch(() => []),
        fetchUserEntitlements(headers).catch(() => null),
      ])

      setProjects(Array.isArray(proj) ? proj : [])

      // Single Source of Truth: Entitlements
      const isPassActive = Boolean(ent?.designPass && ent.designPass.active)
      const passObject = ent?.designPass?.active ? ent.designPass : null
      const daysRemaining = ent?.designPass?.daysRemaining ?? 0
      const liveCredits = (ent?.designPass && ent.designPass.active)
        ? ent.designPass.creditsRemaining
        : (user?.totalCredits ?? 0)

      setPassData({
        hasActivePass: isPassActive,
        pass: passObject,
        daysRemaining,
      })

      setCreditsTotal(Math.max(ent?.designPass?.creditsTotal ?? 5, liveCredits))

      setCreditsData((prev) => ({
        availableBalance: liveCredits,
        transactions: prev?.transactions || [],
      }))
    } catch (err: any) {
      setError(err?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.role, user?.totalCredits, getAuthHeaders])

  // Secondary data loaders with automatic fresh fetch on tab switch
  const loadConsultations = useCallback(async () => {
    try {
      const cons = await fetchUserConsultations(getAuthHeaders())
      setConsultations(Array.isArray(cons) ? cons : [])
    } catch {}
  }, [getAuthHeaders])

  const loadSessions = useCallback(async () => {
    try {
      const sess = await fetchUserSessions(getAuthHeaders())
      setSessions(Array.isArray(sess) ? sess : [])
    } catch {}
  }, [getAuthHeaders])

  const loadLedger = useCallback(async () => {
    try {
      const cred = await fetchUserCredits(getAuthHeaders())
      if (cred) {
        setCreditsData((prev) => ({
          availableBalance: cred.availableBalance ?? prev?.availableBalance ?? 0,
          transactions: Array.isArray(cred.transactions) ? cred.transactions : [],
        }))
      }
    } catch {}
  }, [getAuthHeaders])

  // Automatically fetch fresh data whenever user switches tabs
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'USER') return
    if (activeTab === 'overview' || activeTab === 'projects') {
      loadDashboardData()
    } else if (activeTab === 'consultations') {
      loadConsultations()
    } else if (activeTab === 'credits') {
      loadLedger()
    } else if (activeTab === 'security') {
      loadSessions()
    }
  }, [activeTab, isAuthenticated, user?.role, loadDashboardData, loadConsultations, loadLedger, loadSessions])

  // Real-time synchronization & focus revalidation: Keeps dashboard data up to date without page reload
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'USER') return

    const handleFocus = () => {
      loadDashboardData()
      if (activeTab === 'credits') loadLedger()
      if (activeTab === 'consultations') loadConsultations()
      if (activeTab === 'security') loadSessions()
    }
    window.addEventListener('focus', handleFocus)

    const unsubscribe = subscribeDataChanged((type) => {
      loadDashboardData()
      if (type === 'credits' || type === 'all') loadLedger()
      if (type === 'leads' || type === 'all') loadConsultations()
      if (type === 'all') loadSessions()
    })

    return () => {
      window.removeEventListener('focus', handleFocus)
      unsubscribe()
    }
  }, [isAuthenticated, user?.role, activeTab, loadDashboardData, loadLedger, loadConsultations, loadSessions])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileFeedback(null)
    try {
      await updateUserProfile(
        { name: profileName.trim(), phone: profilePhone.trim() },
        getAuthHeaders()
      )
      setProfileFeedback({ type: 'success', text: 'Profile updated successfully.' })
    } catch (err: any) {
      setProfileFeedback({ type: 'error', text: err?.message || 'Failed to update profile.' })
    } finally {
      setProfileSaving(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'Password must be at least 8 characters long.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setPasswordSaving(true)
    try {
      await changeUserPassword({ currentPassword, newPassword }, getAuthHeaders())
      setPasswordFeedback({ type: 'success', text: 'Password changed successfully.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      setPasswordFeedback({ type: 'error', text: err?.message || 'Failed to change password.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  const [sessionConfirmModal, setSessionConfirmModal] = useState<{
    open: boolean
    title: string
    message: string
    confirmText: string
    isDestructive?: boolean
    onConfirm: () => Promise<void>
  } | null>(null)
  const [sessionToast, setSessionToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [revokingLoading, setRevokingLoading] = useState(false)

  const handleRevokeSession = (sessionId: string) => {
    setSessionConfirmModal({
      open: true,
      title: 'Sign Out Device Session?',
      message: 'Are you sure you want to sign out this active device session? It will require logging in again on that device.',
      confirmText: 'Sign Out Device',
      isDestructive: true,
      onConfirm: async () => {
        setRevokingLoading(true)
        try {
          await revokeUserSession(sessionId, getAuthHeaders())
          setSessions((prev) => prev.filter((s) => s.id !== sessionId))
          setSessionToast({ type: 'success', text: 'Device session signed out successfully.' })
          setTimeout(() => setSessionToast(null), 3500)
        } catch (err: any) {
          setSessionToast({ type: 'error', text: err?.message || 'Failed to revoke session.' })
          setTimeout(() => setSessionToast(null), 4000)
        } finally {
          setRevokingLoading(false)
          setSessionConfirmModal(null)
        }
      },
    })
  }

  const handleRevokeAllOther = () => {
    setSessionConfirmModal({
      open: true,
      title: 'Sign Out All Other Devices?',
      message: 'This will instantly terminate all active logins on your other phones, tablets, and computers. Your current browser session will stay active.',
      confirmText: 'Sign Out All Other Devices',
      isDestructive: true,
      onConfirm: async () => {
        setRevokingLoading(true)
        try {
          await revokeAllOtherSessions(getAuthHeaders())
          setSessions((prev) => prev.filter((s) => s.isCurrent))
          setSessionToast({ type: 'success', text: 'Successfully signed out from all other devices.' })
          setTimeout(() => setSessionToast(null), 3500)
        } catch (err: any) {
          setSessionToast({ type: 'error', text: err?.message || 'Failed to revoke other sessions.' })
          setTimeout(() => setSessionToast(null), 4000)
        } finally {
          setRevokingLoading(false)
          setSessionConfirmModal(null)
        }
      },
    })
  }

  const handleCreateDraftProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreatingProject(true)
    try {
      const newProj = await createUserProject(
        {
          jobType: '2D_FLOOR_PLAN',
          inputPayload: {
            title: `${newPlotWidth}x${newPlotDepth} ft ${newBhk} Layout`,
            plotSize: `${newPlotWidth}x${newPlotDepth} ft`,
            facing: newFacing,
            bhk: newBhk,
          },
        },
        getAuthHeaders()
      )
      setProjects((prev) => [newProj, ...prev])
      setActiveTab('projects')
    } catch (err: any) {
      alert(err?.message || 'Failed to create layout project.')
    } finally {
      setCreatingProject(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#C94F36] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#74706A]">Loading workspace...</span>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-[#E7E0D7] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-md bg-[#FFF6E8] text-[#C94F36] flex items-center justify-center mx-auto border border-[#E7E0D7]">
            <Icons.User size={24} />
          </div>
          <h2 className="text-lg font-bold text-[#292826]">Sign In Required</h2>
          <p className="text-xs text-[#74706A] leading-relaxed">
            Please sign in to access your architectural projects, credits ledger, and account settings.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={onOpenLogin}
              className="w-full py-2.5 px-4 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold transition"
            >
              Sign In to Account
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-md border border-[#E7E0D7] text-[#74706A] hover:text-[#292826] text-xs font-medium transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Icons.LayoutGrid size={16} />,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview',
    },
    {
      id: 'projects',
      label: 'My Projects',
      icon: <Icons.Layers size={16} />,
      badge: projects.length,
      onClick: () => setActiveTab('projects'),
      active: activeTab === 'projects',
    },
    {
      id: 'credits',
      label: 'Credits Ledger',
      icon: <Icons.CreditCard size={16} />,
      badge: `${creditsData?.availableBalance ?? user?.totalCredits ?? 0}`,
      onClick: () => setActiveTab('credits'),
      active: activeTab === 'credits',
    },
    {
      id: 'consultations',
      label: 'Consultations',
      icon: <Icons.Phone size={16} />,
      badge: consultations.length > 0 ? consultations.length : undefined,
      onClick: () => setActiveTab('consultations'),
      active: activeTab === 'consultations',
    },
    {
      id: 'security',
      label: 'Security & Devices',
      icon: <Icons.Shield size={16} />,
      onClick: () => setActiveTab('security'),
      active: activeTab === 'security',
    },
  ]

  const sidebarFooter = (
    <div className="space-y-2 text-xs">
      <div className="text-[11px] font-semibold text-[#74706A] uppercase tracking-wider">Quick Actions</div>
      <button
        onClick={onOpenAiStudio}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-[#FFF6E8] text-[#C94F36] hover:bg-[#ffeecf] font-semibold transition text-left border border-[#E7E0D7]"
      >
        <Icons.Sparkles size={14} />
        <span>Create New Plan</span>
      </button>
      <button
        onClick={() => onOpenConsult?.()}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-white text-[#292826] hover:bg-[#FAF8F5] font-medium transition text-left border border-[#E7E0D7]"
      >
        <Icons.Phone size={14} />
        <span>Book Architect Call</span>
      </button>
    </div>
  )

  return (
    <DashboardLayout
      title="Indore House Makers"
      badgeText={user?.role === 'ADMIN' ? 'ADMIN' : 'CLIENT'}
      sidebarItems={sidebarItems}
      sidebarFooter={sidebarFooter}
    >
      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-800 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadDashboardData()} className="underline font-semibold ml-2">
            Retry
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <PageHeader
            title="Overview"
            subtitle={`Welcome back, ${user?.name || 'Client'}. Here is your architectural workspace summary.`}
            actions={
              <div className="flex items-center gap-2">
                {loading && (
                  <span className="text-[11px] text-[#74706A] flex items-center gap-1 font-medium bg-[#FAF8F5] px-2.5 py-1 rounded border border-[#E7E0D7]">
                    <Icons.RefreshCw size={11} className="animate-spin text-[#C94F36]" />
                    <span>Syncing...</span>
                  </span>
                )}
                <button
                  onClick={() => loadDashboardData()}
                  title="Refresh Data"
                  className="px-2.5 py-2 rounded-md border border-[#E7E0D7] bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#292826] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Icons.RefreshCw size={13} className={loading ? 'animate-spin text-[#C94F36]' : ''} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={onOpenAiStudio}
                  className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Icons.Plus size={14} />
                  <span>Create New Design</span>
                </button>
              </div>
            }
          />

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="3D Generation Credits"
              value={
                passData?.hasActivePass
                  ? `${creditsData?.availableBalance ?? user?.totalCredits ?? 0} Remaining`
                  : creditsData?.availableBalance ?? user?.totalCredits ?? 0
              }
              subtext={
                passData?.hasActivePass
                  ? `${Math.max(0, creditsTotal - (creditsData?.availableBalance ?? 0))} Used of ${creditsTotal} Total Credits`
                  : 'Used for 3D model concepts & photorealistic renders'
              }
              icon={<Icons.CreditCard size={18} />}
              action={
                <button
                  onClick={onOpenAiStudio}
                  className="text-xs font-semibold text-[#C94F36] hover:underline"
                >
                  Create New Design →
                </button>
              }
            />

            <MetricCard
              label="Access Pass"
              value={
                passData?.hasActivePass
                  ? '30-Day Design Pass'
                  : 'No Active Design Pass'
              }
              subtext={
                passData?.pass?.expiresAt
                  ? `Valid until ${new Date(passData.pass.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : passData?.hasActivePass
                  ? `${passData.daysRemaining ?? 30} days remaining`
                  : 'Buy ₹299 Pass for 5 3D generations'
              }
              icon={<Icons.Award size={18} />}
              action={
                passData?.hasActivePass ? (
                  <StatusText status="Active" variant="success" />
                ) : (
                  <button
                    onClick={onOpenAiStudio}
                    className="text-xs font-bold text-[#E76F2E] hover:underline"
                  >
                    Buy ₹299 Pass →
                  </button>
                )
              }
            />

            <MetricCard
              label="Projects Created"
              value={projects.length}
              subtext="Saved architectural concepts"
              icon={<Icons.Layers size={18} />}
              action={
                <button
                  onClick={() => setActiveTab('projects')}
                  className="text-xs font-semibold text-[#292826] hover:underline"
                >
                  View All ({projects.length}) →
                </button>
              }
            />

            <MetricCard
              label="Consultations"
              value={consultations.length}
              subtext="Architect advisory calls"
              icon={<Icons.Phone size={18} />}
              action={
                <button
                  onClick={() => onOpenConsult?.()}
                  className="text-xs font-semibold text-[#C94F36] hover:underline"
                >
                  Book Session →
                </button>
              }
            />
          </div>

          {/* Dedicated Design Pass & Entitlements Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FFF6E8] via-[#FAF7F2] to-[#FFF0E2] border border-[#E7E0D7] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E76F2E]/10 border border-[#E76F2E]/30 text-[#C65320] text-[10.5px] font-extrabold uppercase tracking-wider">
                    <Icons.Sparkles size={12} />
                    <span>Nivaas 30-Day Design Pass</span>
                  </span>
                  {passData?.hasActivePass ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-bold border border-emerald-300">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10.5px] font-bold border border-gray-300">
                      Standard Tier
                    </span>
                  )}
                </div>
                <h3 className="font-display font-black text-lg text-[#292826]">
                  {passData?.hasActivePass
                    ? 'Full 3D Elevation & Layout Studio Unlocked'
                    : 'Upgrade to 30-Day Design Pass for Full 3D Elevations'}
                </h3>
                <p className="text-xs text-[#74706A] max-w-2xl leading-relaxed">
                  {passData?.hasActivePass ? (
                    <>
                      You have <strong>{creditsData?.availableBalance ?? user?.totalCredits ?? 0} 3D generation credits</strong> remaining.
                      {passData.pass?.expiresAt && (
                        <> Pass is active until <strong>{new Date(passData.pass.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> ({passData.daysRemaining ?? 30} days left).</>
                      )}
                      {' '}All conceptual 2D floor plans are complimentary (5/day).
                    </>
                  ) : (
                    <>
                      Unlock 5 photorealistic 3D elevations, dollhouse renders, and floor-wise models for ₹299. No recurring fees or auto-renewal.
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {passData?.hasActivePass ? (
                  <>
                    <button
                      onClick={onOpenAiStudio}
                      className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Icons.Sparkles size={14} />
                      <span>Launch 3D Studio</span>
                    </button>
                    <button
                      onClick={onOpenAiStudio}
                      className="py-2.5 px-3.5 rounded-xl bg-white border border-[#D1C9BE] text-[#292826] hover:bg-gray-50 text-xs font-bold transition cursor-pointer"
                    >
                      Add Credits (₹299)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onOpenAiStudio}
                    className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#E76F2E] to-[#C94F36] hover:from-[#C65320] hover:to-[#B53E26] text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Icons.Sparkles size={14} />
                    <span>Get ₹299 Design Pass</span>
                  </button>
                )}
              </div>
            </div>

            {/* Credit progress meter if active pass */}
            {passData?.hasActivePass && (
              <div className="mt-4 pt-3.5 border-t border-[#E7E0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[#74706A] font-semibold text-[11px] uppercase tracking-wider">3D Credit Usage:</span>
                  <div className="w-36 h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, ((creditsData?.availableBalance ?? user?.totalCredits ?? 0) / (creditsTotal || 5)) * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="font-extrabold text-[#292826] text-xs">
                    {creditsData?.availableBalance ?? user?.totalCredits ?? 0} of {creditsTotal} Available
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11.5px] text-[#74706A]">
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <Icons.Check size={13} className="text-emerald-600 font-bold" />
                    <span>3D Elevations Unlocked</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                    <Icons.Check size={13} className="text-emerald-600 font-bold" />
                    <span>5 2D Plans / Day</span>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Projects Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#292826]">Recent Architectural Projects</h2>
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs text-[#74706A] hover:text-[#292826] font-medium"
              >
                View all
              </button>
            </div>

            <DataTable<UserProject>
              data={projects.slice(0, 5)}
              keyExtractor={(p) => p.id}
              columns={[
                {
                  header: 'Project Title',
                  accessor: (p) => {
                    const dims =
                      p.inputPayload?.plotSize && p.inputPayload.plotSize !== 'N/A'
                        ? p.inputPayload.plotSize
                        : p.inputPayload?.dimensions && p.inputPayload.dimensions !== 'N/A'
                        ? p.inputPayload.dimensions
                        : p.inputPayload?.plotWidth && p.inputPayload?.plotDepth
                        ? `${p.inputPayload.plotWidth}×${p.inputPayload.plotDepth} ft`
                        : p.inputPayload?.builtUpSqft
                        ? `${p.inputPayload.builtUpSqft} sq.ft`
                        : 'Custom Plot'
                    const facing =
                      p.inputPayload?.facing && p.inputPayload.facing !== 'N/A'
                        ? `${p.inputPayload.facing} Facing`
                        : 'Vastu Verified'
                    return (
                      <div>
                        <div className="font-semibold text-[#292826]">{p.inputPayload?.title || 'Custom Layout'}</div>
                        <div className="text-[11px] text-[#74706A]">
                          {dims} • {facing}
                        </div>
                      </div>
                    )
                  },
                },
                {
                  header: 'Type',
                  accessor: (p) => {
                    const isFull =
                      p.jobType === 'FULL_2D_3D_PLAN' ||
                      p.inputPayload?.has3D ||
                      p.inputPayload?.is3DUnlocked ||
                      p.outputPayload?.render3DUrl ||
                      p.outputPayload?.dollhouseViewUrl ||
                      p.outputPayload?.facades?.day
                    if (isFull) {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200">
                          <span>2D Plan + 3D Elevation</span>
                        </span>
                      )
                    }
                    if (p.jobType === 'THREE_D_GENERATION') {
                      return (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10.5px] font-bold border border-orange-200">
                          <span>3D Elevation Concept</span>
                        </span>
                      )
                    }
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10.5px] font-bold border border-sky-200">
                        <span>Conceptual 2D Floor Plan</span>
                      </span>
                    )
                  },
                },
                {
                  header: 'Status',
                  accessor: (p) => (
                    <StatusText
                      status={p.status}
                      variant={p.status === 'COMPLETED' ? 'success' : 'neutral'}
                    />
                  ),
                },
                {
                  header: 'Created',
                  accessor: (p) => new Date(p.createdAt).toLocaleDateString(),
                },
              ]}
              emptyState={
                <EmptyState
                  title="No projects generated yet"
                  description="Generate conceptual 2D floor-plan previews and 3D elevation concepts customized for your plot."
                  icon={<Icons.Layers size={24} />}
                  action={
                    <button
                      onClick={onOpenAiStudio}
                      className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold transition"
                    >
                      Create New Design
                    </button>
                  }
                />
              }
            />
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: PROJECTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <PageHeader
            title="Architectural Projects"
            subtitle="All saved conceptual floor layouts, Vastu drafts, and elevation files."
            actions={
              <button
                onClick={onOpenAiStudio}
                className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Icons.Plus size={14} />
                <span>Create New Design</span>
              </button>
            }
          />

          {/* Quick Draft Form */}
          <div className="bg-white rounded-lg border border-[#E7E0D7] p-5">
            <h3 className="text-xs font-bold text-[#292826] uppercase tracking-wider mb-3">
              Quick Concept Layout Generator
            </h3>
            <form onSubmit={handleCreateDraftProject} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#74706A] mb-1">Plot Width (ft)</label>
                <input
                  type="number"
                  value={newPlotWidth}
                  onChange={(e) => setNewPlotWidth(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  placeholder="30"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#74706A] mb-1">Plot Depth (ft)</label>
                <input
                  type="number"
                  value={newPlotDepth}
                  onChange={(e) => setNewPlotDepth(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  placeholder="50"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#74706A] mb-1">Configuration</label>
                <select
                  value={newBhk}
                  onChange={(e) => setNewBhk(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36] bg-white"
                >
                  <option>1 BHK</option>
                  <option>2 BHK</option>
                  <option>3 BHK</option>
                  <option>4 BHK</option>
                  <option>5 BHK</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#74706A] mb-1">Orientation</label>
                <select
                  value={newFacing}
                  onChange={(e) => setNewFacing(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36] bg-white"
                >
                  <option>East Facing</option>
                  <option>North Facing</option>
                  <option>West Facing</option>
                  <option>South Facing</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={creatingProject}
                  className="w-full py-1.5 px-3 rounded-md bg-[#292826] hover:bg-black text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {creatingProject ? 'Creating...' : '+ Add Project'}
                </button>
              </div>
            </form>
          </div>

          <DataTable<UserProject>
            data={projects}
            keyExtractor={(p) => p.id}
            columns={[
              {
                header: 'Title & Dimensions',
                accessor: (p) => {
                  const dims =
                    p.inputPayload?.plotSize && p.inputPayload.plotSize !== 'N/A'
                      ? p.inputPayload.plotSize
                      : p.inputPayload?.dimensions && p.inputPayload.dimensions !== 'N/A'
                      ? p.inputPayload.dimensions
                      : p.inputPayload?.plotWidth && p.inputPayload?.plotDepth
                      ? `${p.inputPayload.plotWidth}×${p.inputPayload.plotDepth} ft`
                      : p.inputPayload?.builtUpSqft
                      ? `${p.inputPayload.builtUpSqft} sq.ft`
                      : 'Custom Plot'
                  const facing =
                    p.inputPayload?.facing && p.inputPayload.facing !== 'N/A'
                      ? `${p.inputPayload.facing} Facing`
                      : 'Vastu Verified'
                  return (
                    <div>
                      <div className="font-semibold text-[#292826]">{p.inputPayload?.title || 'Custom Layout'}</div>
                      <div className="text-[11px] text-[#74706A]">
                        {dims} • {facing}
                      </div>
                    </div>
                  )
                },
              },
              {
                header: 'Type',
                accessor: (p) => {
                  const isFull =
                    p.jobType === 'FULL_2D_3D_PLAN' ||
                    p.inputPayload?.has3D ||
                    p.inputPayload?.is3DUnlocked ||
                    p.outputPayload?.render3DUrl ||
                    p.outputPayload?.dollhouseViewUrl ||
                    p.outputPayload?.facades?.day
                  if (isFull) {
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold border border-emerald-200">
                        <span>2D Plan + 3D Elevation</span>
                      </span>
                    )
                  }
                  if (p.jobType === 'THREE_D_GENERATION') {
                    return (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10.5px] font-bold border border-orange-200">
                        <span>3D Elevation Concept</span>
                      </span>
                    )
                  }
                  return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[10.5px] font-bold border border-sky-200">
                      <span>Conceptual 2D Floor Plan</span>
                    </span>
                  )
                },
              },
              {
                header: 'Status',
                accessor: (p) => (
                  <StatusText
                    status={p.status}
                    variant={p.status === 'COMPLETED' ? 'success' : 'neutral'}
                  />
                ),
              },
              {
                header: 'Created On',
                accessor: (p) => new Date(p.createdAt).toLocaleDateString(),
              },
            ]}
            emptyState={
              <EmptyState
                title="No saved projects found"
                description="Use the generator above or launch the design studio to create floor plans."
                icon={<Icons.Layers size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CREDITS LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <PageHeader
            title="Credits & Ledger"
            subtitle="Authoritative transaction history of 3D design credits and pass entitlements."
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAiStudio}
                  className="px-3.5 py-2 rounded-md bg-[#FFF6E8] text-[#C94F36] hover:bg-[#ffeecf] text-xs font-semibold border border-[#E7E0D7] transition"
                >
                  {passData?.hasActivePass ? 'Add 3D Credits (₹299)' : 'Unlock ₹299 Pass'}
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Available 3D Balance"
              value={`${creditsData?.availableBalance ?? user?.totalCredits ?? 0} Credits`}
              subtext="1 Credit = 1 Full 3D Elevation & Layout Generation"
            />
            <MetricCard
              label="Pass Status"
              value={passData?.hasActivePass ? 'Active 30-Day Pass' : 'Standard Tier'}
              subtext={passData?.hasActivePass ? `${passData.daysRemaining ?? 30} days remaining (5 credits pack)` : '2D Conceptual layout free (5/day)'}
            />
            <MetricCard
              label="Total Transactions"
              value={creditsData?.transactions?.length ?? 0}
              subtext="Recorded in database ledger"
            />
          </div>

          <DataTable<CreditTransactionItem>
            data={creditsData?.transactions || []}
            keyExtractor={(tx) => tx.id}
            columns={[
              {
                header: 'Date & Time',
                accessor: (tx) => new Date(tx.createdAt).toLocaleString(),
              },
              {
                header: 'Type',
                accessor: (tx) => (
                  <span className="font-medium text-[#292826]">{tx.type}</span>
                ),
              },
              {
                header: 'Amount',
                accessor: (tx) => (
                  <span
                    className={`font-bold ${
                      tx.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </span>
                ),
              },
              {
                header: 'Description',
                accessor: (tx) => tx.description || 'System Transaction',
              },
            ]}
            emptyState={
              <EmptyState
                title="No credit transactions yet"
                description="Credit grants and layout generations will be recorded here automatically."
                icon={<Icons.CreditCard size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: CONSULTATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          <PageHeader
            title="Architectural Consultations"
            subtitle="Scheduled calls and discussions with senior architectural consultants."
            actions={
              <button
                onClick={() => onOpenConsult?.()}
                className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Icons.Phone size={14} />
                <span>Book Free Consultation</span>
              </button>
            }
          />

          <DataTable<UserConsultationItem>
            data={consultations}
            keyExtractor={(c) => c.id}
            columns={[
              {
                header: 'Requirement / Service',
                accessor: (c) => (
                  <div>
                    <div className="font-semibold text-[#292826]">{c.requirement || c.type || 'Architect Consultation'}</div>
                    {c.message && <div className="text-[11px] text-[#74706A] truncate max-w-xs">{c.message}</div>}
                  </div>
                ),
              },
              {
                header: 'Location',
                accessor: (c) => c.city || 'Indore',
              },
              {
                header: 'Status',
                accessor: (c) => (
                  <StatusText
                    status={c.status}
                    variant={
                      c.status === 'CONVERTED' || c.status === 'QUALIFIED'
                        ? 'success'
                        : c.status === 'CONTACTED'
                        ? 'warning'
                        : 'neutral'
                    }
                  />
                ),
              },
              {
                header: 'Booked On',
                accessor: (c) => new Date(c.createdAt).toLocaleDateString(),
              },
            ]}
            emptyState={
              <EmptyState
                title="No consultation calls booked"
                description="Book a 1-on-1 review call with our architectural engineering team for Vastu guidance and cost estimates."
                icon={<Icons.Phone size={24} />}
                action={
                  <button
                    onClick={() => onOpenConsult?.()}
                    className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold transition"
                  >
                    Schedule Consultation
                  </button>
                }
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: SECURITY & DEVICES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <PageHeader
            title="Account & Security"
            subtitle="Manage your profile details, password, and active device sessions."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Card */}
            <div className="bg-white rounded-lg border border-[#E7E0D7] p-5">
              <h3 className="text-xs font-bold text-[#292826] uppercase tracking-wider mb-4">
                Profile Information
              </h3>
              {profileFeedback && (
                <div
                  className={`p-2.5 rounded-md text-xs mb-4 ${
                    profileFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileFeedback.text}
                </div>
              )}
              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#74706A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#74706A] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] bg-[#FAF8F5] text-[#74706A] cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#74706A] mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                    placeholder="10-digit mobile number"
                  />
                </div>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="py-1.5 px-4 rounded-md bg-[#292826] hover:bg-black text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>

            {/* Password Card */}
            <div className="bg-white rounded-lg border border-[#E7E0D7] p-5">
              <h3 className="text-xs font-bold text-[#292826] uppercase tracking-wider mb-4">
                Change Password
              </h3>
              {passwordFeedback && (
                <div
                  className={`p-2.5 rounded-md text-xs mb-4 ${
                    passwordFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {passwordFeedback.text}
                </div>
              )}
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#74706A] mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#74706A] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#74706A] mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="py-1.5 px-4 rounded-md bg-[#292826] hover:bg-black text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>

          {/* Active Device Sessions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#292826]">Active Device Sessions</h3>
                <p className="text-xs text-[#74706A]">Devices and browsers currently logged into this account.</p>
              </div>
              {sessions.length > 1 && (
                <button
                  onClick={handleRevokeAllOther}
                  className="px-3 py-1.5 rounded-md border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-medium transition"
                >
                  Sign Out All Other Devices
                </button>
              )}
            </div>

            <DataTable<UserSessionItem>
              data={sessions}
              keyExtractor={(s) => s.id}
              columns={[
                {
                  header: 'Device / Browser',
                  accessor: (s) => (
                    <div>
                      <div className="font-semibold text-[#292826]">
                        {s.userAgent?.includes('Mobile') ? 'Mobile Device' : 'Desktop / Laptop'}
                        {s.isCurrent && (
                          <span className="ml-2 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            Current Session
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#74706A] truncate max-w-xs">{s.userAgent}</div>
                    </div>
                  ),
                },
                {
                  header: 'IP Address',
                  accessor: (s) => s.ipAddress || '127.0.0.1',
                },
                {
                  header: 'Session Started',
                  accessor: (s) => (s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Active now'),
                },
                {
                  header: 'Action',
                  align: 'right',
                  accessor: (s) =>
                    s.isCurrent ? (
                      <span className="text-[11px] text-[#74706A]">This Device</span>
                    ) : (
                      <button
                        onClick={() => handleRevokeSession(s.id)}
                        className="text-xs text-rose-700 hover:underline font-medium"
                      >
                        Sign Out
                      </button>
                    ),
                },
              ]}
              emptyState={
                <EmptyState
                  title="No other sessions"
                  description="You are currently signed in on this browser."
                  icon={<Icons.Shield size={24} />}
                />
              }
            />
          </div>
        </div>
      )}

      {/* Floating Session Toast */}
      {sessionToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border bg-white text-xs font-bold text-[#1F2937]">
          <span className={`h-2.5 w-2.5 rounded-full ${sessionToast.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          <span>{sessionToast.text}</span>
          <button onClick={() => setSessionToast(null)} className="ml-2 text-gray-400 hover:text-black">✕</button>
        </div>
      )}

      {/* Custom In-App Confirmation Dialog */}
      {sessionConfirmModal?.open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#E7E0D7] shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-[#111827]">
                  {sessionConfirmModal.title}
                </h3>
                <p className="text-xs text-[#54504A]">
                  Active session security verification
                </p>
              </div>
            </div>

            <p className="text-xs text-[#374151] leading-relaxed font-medium">
              {sessionConfirmModal.message}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={revokingLoading}
                onClick={() => setSessionConfirmModal(null)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-[#D1C9BE] text-xs font-bold text-[#4B5563] hover:bg-gray-50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={revokingLoading}
                onClick={() => sessionConfirmModal.onConfirm()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {revokingLoading ? (
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <span>{sessionConfirmModal.confirmText}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

