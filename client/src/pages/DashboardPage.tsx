import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'
import {
  fetchUserDashboard,
  fetchUserProjects,
  fetchUserCredits,
  fetchUserPass,
  fetchUserConsultations,
  fetchUserSessions,
  revokeUserSession,
  revokeAllOtherSessions,
  updateUserProfile,
  changeUserPassword,
  createUserProject,
  type UserDashboardMetrics,
  type UserProject,
  type CreditTransactionItem,
  type UserSessionItem,
  type UserConsultationItem,
} from '../lib/api'

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
    title: 'User Panel & AI Studio Dashboard | Indore House Makers',
    description:
      'Manage your architectural projects, ₹299 Design Pass, AI credits ledger, active device sessions, and consultation bookings on Indore House Makers.',
  })

  const { user, isAuthenticated, isLoading: authLoading, getAuthHeaders, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  // Data states
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<UserDashboardMetrics | null>(null)
  const [projects, setProjects] = useState<UserProject[]>([])
  const [creditsData, setCreditsData] = useState<{
    availableBalance: number
    transactions: CreditTransactionItem[]
  } | null>(null)
  const [passData, setPassData] = useState<{
    hasActivePass: boolean
    pass: any
    daysRemaining?: number
  } | null>(null)
  const [consultations, setConsultations] = useState<UserConsultationItem[]>([])
  const [sessions, setSessions] = useState<UserSessionItem[]>([])

  // Form states for profile & password
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Quick project generation modal / state
  const [creatingProject, setCreatingProject] = useState(false)
  const [newPlotWidth, setNewPlotWidth] = useState('30')
  const [newPlotDepth, setNewPlotDepth] = useState('50')
  const [newBhk, setNewBhk] = useState('3 BHK')
  const [newFacing, setNewFacing] = useState('East Facing')

  // Load all dashboard data from real database
  const loadDashboardData = useCallback(async () => {
    if (!isAuthenticated) return
    setLoading(true)
    setError(null)
    const headers = getAuthHeaders()

    try {
      const [dash, proj, cred, pass, cons, sess] = await Promise.all([
        fetchUserDashboard(headers).catch(() => null),
        fetchUserProjects(headers).catch(() => []),
        fetchUserCredits(headers).catch(() => ({ availableBalance: 0, transactions: [] })),
        fetchUserPass(headers).catch(() => ({ hasActivePass: false, pass: null })),
        fetchUserConsultations(headers).catch(() => []),
        fetchUserSessions(headers).catch(() => []),
      ])

      if (dash) {
        setMetrics(dash.metrics || null)
        if (dash.user) {
          setProfileName(dash.user.name || '')
          setProfilePhone(dash.user.phone || '')
        }
      }
      setProjects(Array.isArray(proj) ? proj : [])
      setCreditsData(
        cred && Array.isArray(cred.transactions)
          ? cred
          : { availableBalance: cred?.availableBalance ?? 0, transactions: [] }
      )
      setPassData(pass || { hasActivePass: false, pass: null })
      setConsultations(Array.isArray(cons) ? cons : [])
      setSessions(Array.isArray(sess) ? sess : [])
    } catch (err: any) {
      setError(err?.message || 'Failed to load your dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, loadDashboardData])

  // Profile update handler
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

  // Password change handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordFeedback(null)

    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', text: 'New password must be at least 8 characters long.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', text: 'New passwords do not match.' })
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
      setPasswordFeedback({ type: 'error', text: err?.message || 'Failed to change password. Please check your current password.' })
    } finally {
      setPasswordSaving(false)
    }
  }

  // Session revoke handlers
  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to sign out this device?')) return
    try {
      await revokeUserSession(sessionId, getAuthHeaders())
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke session.')
    }
  }

  const handleRevokeAllOther = async () => {
    if (!confirm('This will log you out of all other phones, tablets, and computers. Proceed?')) return
    try {
      await revokeAllOtherSessions(getAuthHeaders())
      setSessions((prev) => prev.filter((s) => s.isCurrent))
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke other sessions.')
    }
  }

  // Create quick sample project
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
      if (metrics) {
        setMetrics({ ...metrics, totalProjects: metrics.totalProjects + 1 })
      }
      setActiveTab('projects')
    } catch (err: any) {
      alert(err?.message || 'Failed to create layout project.')
    } finally {
      setCreatingProject(false)
    }
  }

  // Render Unauthenticated Gate
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-[75vh] bg-[#FAF8F5] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#E7E0D7] shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF6E8] border border-[#E76F2E]/20 text-[#E76F2E] flex items-center justify-center mx-auto shadow-xs">
            <Icons.User size={32} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#292826] tracking-tight">
              User Dashboard Access
            </h1>
            <p className="text-sm text-[#74706A] leading-relaxed">
              Please sign in to access your generated architectural blueprints, ₹299 Design Pass status, credits ledger, and booked consultations.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={onOpenLogin}
              className="w-full py-3.5 px-4 rounded-xl bg-[#E76F2E] hover:bg-[#C65320] text-white font-bold text-sm shadow-md transition transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Icons.Lock size={16} />
              <span>Sign In / Create Account</span>
            </button>
            <Link
              to="/"
              className="w-full py-3 px-4 rounded-xl border border-[#E7E0D7] hover:bg-[#FAF8F5] text-[#292826] font-semibold text-xs transition text-center"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-24 pt-6 md:pt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#E76F2E]/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#292826] to-[#45423E] text-white flex items-center justify-center text-2xl font-black shadow-md shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#292826] tracking-tight">
                    {user?.name || 'My Dashboard'}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-[#FFF6E8] text-[#E76F2E] border border-[#E76F2E]/30 uppercase tracking-wider">
                    {user?.role || 'USER'}
                  </span>
                  {passData?.hasActivePass && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Icons.CheckCircle size={12} />
                      ₹299 Pass Active
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#74706A] mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Icons.Mail size={13} className="text-[#A29D96]" />
                    {user?.email}
                  </span>
                  {user?.phone && (
                    <span className="flex items-center gap-1">
                      <Icons.Phone size={13} className="text-[#A29D96]" />
                      {user.phone}
                    </span>
                  )}
                  <span className="text-[#B9B4AC]">|</span>
                  <span className="text-[#74706A]">
                    Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2026'}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={() => onOpenAiStudio?.()}
                className="px-4 py-2.5 rounded-xl bg-[#E76F2E] hover:bg-[#C65320] text-white text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <Icons.Sparkles size={14} />
                <span>Launch AI Studio</span>
              </button>
              <button
                onClick={() => onOpenConsult?.('Floor plan design inquiry from User Panel')}
                className="px-4 py-2.5 rounded-xl bg-[#292826] hover:bg-[#1E1D1B] text-white text-xs font-bold shadow-md transition flex items-center gap-2 active:scale-95"
              >
                <Icons.Phone size={14} />
                <span>Book Architect Call</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Mobile Pills + Desktop Sidebar/Bar) */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs for Desktop, Horizontal Scroll for Mobile */}
          <div className="lg:w-64 shrink-0">
            <div className="bg-white rounded-2xl p-2 border border-[#E7E0D7] shadow-sm flex lg:flex-col overflow-x-auto scrollbar-none gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap w-full text-left ${
                  activeTab === 'overview'
                    ? 'bg-[#292826] text-white shadow-sm'
                    : 'text-[#74706A] hover:bg-[#FAF8F5] hover:text-[#292826]'
                }`}
              >
                <Icons.LayoutGrid size={18} className={activeTab === 'overview' ? 'text-[#E76F2E]' : ''} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('projects')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap w-full text-left ${
                  activeTab === 'projects'
                    ? 'bg-[#292826] text-white shadow-sm'
                    : 'text-[#74706A] hover:bg-[#FAF8F5] hover:text-[#292826]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icons.Blueprint size={18} className={activeTab === 'projects' ? 'text-[#E76F2E]' : ''} />
                  <span>My Projects</span>
                </div>
                {((projects?.length || 0) > 0) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-current font-black">
                    {projects.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('credits')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap w-full text-left ${
                  activeTab === 'credits'
                    ? 'bg-[#292826] text-white shadow-sm'
                    : 'text-[#74706A] hover:bg-[#FAF8F5] hover:text-[#292826]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icons.Coins size={18} className={activeTab === 'credits' ? 'text-[#E76F2E]' : ''} />
                  <span>Pass & Credits</span>
                </div>
                {metrics && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E76F2E] text-white font-black">
                    {metrics.availableCredits}★
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('consultations')}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap w-full text-left ${
                  activeTab === 'consultations'
                    ? 'bg-[#292826] text-white shadow-sm'
                    : 'text-[#74706A] hover:bg-[#FAF8F5] hover:text-[#292826]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icons.Phone size={18} className={activeTab === 'consultations' ? 'text-[#E76F2E]' : ''} />
                  <span>Consultations</span>
                </div>
                {((consultations?.length || 0) > 0) && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-current font-black">
                    {consultations.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap w-full text-left ${
                  activeTab === 'security'
                    ? 'bg-[#292826] text-white shadow-sm'
                    : 'text-[#74706A] hover:bg-[#FAF8F5] hover:text-[#292826]'
                }`}
              >
                <Icons.Shield size={18} className={activeTab === 'security' ? 'text-[#E76F2E]' : ''} />
                <span>Profile & Security</span>
              </button>

              <div className="pt-2 mt-2 border-t border-[#E7E0D7] hidden lg:block">
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition w-full text-left"
                >
                  <Icons.LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Tab Content */}
          <div className="flex-1 min-w-0">
            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-6 animate-pulse">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-28 bg-white rounded-2xl border border-[#E7E0D7] p-5 space-y-3" />
                  ))}
                </div>
                <div className="h-64 bg-white rounded-2xl border border-[#E7E0D7]" />
              </div>
            )}

            {/* Error Message */}
            {!loading && error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl p-6 mb-6 flex items-start gap-4">
                <Icons.AlertTriangle className="text-rose-500 shrink-0 mt-1" size={24} />
                <div className="space-y-2">
                  <h3 className="font-bold text-sm">Unable to Load Dashboard Data</h3>
                  <p className="text-xs leading-relaxed">{error}</p>
                  <button
                    onClick={loadDashboardData}
                    className="mt-2 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            )}

            {/* === TAB 1: OVERVIEW === */}
            {!loading && activeTab === 'overview' && (
              <div className="space-y-8">
                {/* 4 Real Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Total Projects */}
                  <div className="bg-white rounded-2xl p-5 border border-[#E7E0D7] shadow-xs hover:border-[#292826] transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#74706A] uppercase tracking-wider">
                        My Projects
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#FAF8F5] text-[#292826] flex items-center justify-center">
                        <Icons.Blueprint size={16} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#292826]">
                        {metrics?.totalProjects ?? 0}
                      </span>
                      <span className="text-xs text-[#74706A]">Floor Plans</span>
                    </div>
                  </div>

                  {/* Card 2: Available Credits */}
                  <div className="bg-white rounded-2xl p-5 border border-[#E7E0D7] shadow-xs hover:border-[#E76F2E] transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#74706A] uppercase tracking-wider">
                        Available Credits
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center">
                        <Icons.Coins size={16} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#E76F2E]">
                        {metrics?.availableCredits ?? 0}
                      </span>
                      <span className="text-xs text-[#74706A]">Live Ledger Balance</span>
                    </div>
                  </div>

                  {/* Card 3: ₹299 Pass Status */}
                  <div className="bg-white rounded-2xl p-5 border border-[#E7E0D7] shadow-xs hover:border-[#292826] transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#74706A] uppercase tracking-wider">
                        ₹299 Design Pass
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Icons.Sparkles size={16} />
                      </div>
                    </div>
                    <div className="mt-4">
                      {passData?.hasActivePass ? (
                        <div className="space-y-1">
                          <span className="text-lg font-black text-emerald-700 block">
                            ACTIVE
                          </span>
                          <span className="text-[11px] text-[#74706A]">
                            {passData.daysRemaining} days remaining
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-lg font-black text-[#74706A] block">
                            INACTIVE
                          </span>
                          <span className="text-[11px] text-[#A29D96]">
                            Zero active pass
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 4: Consultations */}
                  <div className="bg-white rounded-2xl p-5 border border-[#E7E0D7] shadow-xs hover:border-[#292826] transition">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#74706A] uppercase tracking-wider">
                        Consultations
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icons.Phone size={16} />
                      </div>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-black text-[#292826]">
                        {metrics?.totalConsultations ?? 0}
                      </span>
                      <span className="text-xs text-[#74706A]">Booked</span>
                    </div>
                  </div>
                </div>

                {/* Quick Generator Studio Widget */}
                <div className="bg-gradient-to-br from-[#292826] to-[#1E1D1B] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
                  <div className="max-w-xl space-y-4">
                    <span className="px-3 py-1 rounded-full bg-[#E76F2E] text-white text-[10px] font-black uppercase tracking-wider">
                      Instant 2D/3D Architecture
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                      Generate Architectural Floor Plans with Vastu AI
                    </h2>
                    <p className="text-xs sm:text-sm text-[#D5D0C7] leading-relaxed">
                      Customized room layouts, dimensions, setback calculations, and Vastu orientation generated in seconds for Indore and MP plots.
                    </p>
                    <div className="pt-2 flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => onOpenAiStudio?.()}
                        className="px-5 py-3 rounded-xl bg-[#E76F2E] hover:bg-[#C65320] text-white font-bold text-xs shadow-md transition flex items-center gap-2"
                      >
                        <Icons.Sparkles size={16} />
                        <span>Open AI Studio</span>
                      </button>
                      <button
                        onClick={() => setActiveTab('projects')}
                        className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
                      >
                        View All My Projects ({(projects?.length || 0)})
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent Projects Preview */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-black text-[#292826]">Recent Projects</h3>
                      <p className="text-xs text-[#74706A]">Your recently generated blueprints and floor plans</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('projects')}
                      className="text-xs font-bold text-[#E76F2E] hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  {!projects || projects.length === 0 ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] text-[#A29D96] flex items-center justify-center mx-auto border border-[#E7E0D7]">
                        <Icons.Blueprint size={28} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-[#292826]">No Projects Generated Yet</p>
                        <p className="text-xs text-[#74706A] max-w-sm mx-auto">
                          You haven't generated any AI floor plans yet. Start creating your dream home plan with our AI designer.
                        </p>
                      </div>
                      <button
                        onClick={() => onOpenAiStudio?.()}
                        className="px-4 py-2 rounded-xl bg-[#E76F2E] text-white font-bold text-xs hover:bg-[#C65320] transition"
                      >
                        Create First Layout
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(projects || []).slice(0, 4).map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-2xl border border-[#E7E0D7] bg-[#FAF8F5] hover:border-[#292826] transition flex flex-col justify-between space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-black uppercase text-[#E76F2E] tracking-wider block">
                                {proj.jobType.replace('_', ' ')}
                              </span>
                              <h4 className="text-sm font-bold text-[#292826] mt-0.5">
                                {proj.resultPayload?.title || `${proj.inputPayload?.plotSize || 'Custom'} Plan`}
                              </h4>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {proj.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-[#74706A]">
                            <span>Plot: <strong>{proj.resultPayload?.plotSize || proj.inputPayload?.plotSize || '30x50 ft'}</strong></span>
                            <span>•</span>
                            <span>Facing: <strong>{proj.resultPayload?.facing || proj.inputPayload?.facing || 'East'}</strong></span>
                            <span>•</span>
                            <span><strong>{proj.resultPayload?.bhk || proj.inputPayload?.bhk || '3 BHK'}</strong></span>
                          </div>

                          <div className="pt-2 border-t border-[#E7E0D7] flex items-center justify-between text-[11px] text-[#A29D96]">
                            <span>{new Date(proj.createdAt).toLocaleDateString('en-IN')}</span>
                            <button
                              onClick={() => onOpenConsult?.(`Consultation on Project: ${proj.id}`)}
                              className="text-xs font-bold text-[#292826] hover:text-[#E76F2E]"
                            >
                              Consult Architect →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Ledger Transactions */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-black text-[#292826]">Recent Ledger Activity</h3>
                      <p className="text-xs text-[#74706A]">Real-time immutable credit transaction entries</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('credits')}
                      className="text-xs font-bold text-[#E76F2E] hover:underline"
                    >
                      View Full History →
                    </button>
                  </div>

                  {!creditsData?.transactions || creditsData.transactions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#74706A]">
                      No transactions recorded on your credit ledger yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E7E0D7]">
                      {(creditsData?.transactions || []).slice(0, 5).map((tx) => (
                        <div key={tx.id} className="py-3 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                                tx.type === 'GRANT'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : tx.type === 'RESERVE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : tx.type === 'RELEASE'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {tx.type === 'GRANT' ? '+' : tx.type === 'RESERVE' ? '-' : '•'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-[#292826] truncate">{tx.description}</p>
                              <span className="text-[10px] text-[#A29D96]">
                                {new Date(tx.createdAt).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`text-xs font-black whitespace-nowrap ${
                              tx.amount > 0
                                ? 'text-emerald-700'
                                : tx.amount < 0
                                ? 'text-amber-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === TAB 2: MY PROJECTS === */}
            {!loading && activeTab === 'projects' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-[#E7E0D7] shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-[#292826]">My Architectural Projects</h2>
                    <p className="text-xs text-[#74706A]">
                      View and manage all your generated 2D blueprints, 3D elevations, and Vastu floor plans.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenAiStudio?.()}
                    className="px-4 py-2.5 rounded-xl bg-[#E76F2E] hover:bg-[#C65320] text-white text-xs font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Icons.Sparkles size={14} />
                    <span>Generate New Plan</span>
                  </button>
                </div>

                {/* Projects Grid */}
                {!projects || projects.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-[#E7E0D7] text-center space-y-5">
                    <div className="w-16 h-16 rounded-2xl bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center mx-auto border border-[#E76F2E]/20">
                      <Icons.Blueprint size={32} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-[#292826]">No Projects Generated Yet</h3>
                      <p className="text-xs text-[#74706A] max-w-md mx-auto leading-relaxed">
                        Your customized 2D/3D floor plans and architectural layouts will appear here. No fake demo data is generated in production.
                      </p>
                    </div>

                    {/* Quick Draft Generator Form */}
                    <form
                      onSubmit={handleCreateDraftProject}
                      className="max-w-md mx-auto p-4 rounded-2xl bg-[#FAF8F5] border border-[#E7E0D7] text-left space-y-3 mt-4"
                    >
                      <h4 className="text-xs font-bold text-[#292826]">Create Draft Project:</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#74706A]">Width (ft)</label>
                          <input
                            type="text"
                            value={newPlotWidth}
                            onChange={(e) => setNewPlotWidth(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#E7E0D7] bg-white"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#74706A]">Depth (ft)</label>
                          <input
                            type="text"
                            value={newPlotDepth}
                            onChange={(e) => setNewPlotDepth(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#E7E0D7] bg-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-[#74706A]">BHK</label>
                          <select
                            value={newBhk}
                            onChange={(e) => setNewBhk(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#E7E0D7] bg-white"
                          >
                            <option value="1 BHK">1 BHK</option>
                            <option value="2 BHK">2 BHK</option>
                            <option value="3 BHK">3 BHK</option>
                            <option value="4 BHK">4 BHK</option>
                            <option value="5 BHK">5 BHK</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-[#74706A]">Facing</label>
                          <select
                            value={newFacing}
                            onChange={(e) => setNewFacing(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-[#E7E0D7] bg-white"
                          >
                            <option value="East Facing">East Facing</option>
                            <option value="North Facing">North Facing</option>
                            <option value="West Facing">West Facing</option>
                            <option value="South Facing">South Facing</option>
                          </select>
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={creatingProject}
                        className="w-full py-2.5 rounded-xl bg-[#292826] hover:bg-black text-white text-xs font-bold transition disabled:opacity-50"
                      >
                        {creatingProject ? 'Creating...' : '+ Save Draft Blueprint'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(projects || []).map((project) => (
                      <div
                        key={project.id}
                        className="bg-white rounded-3xl p-6 border border-[#E7E0D7] shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-black uppercase text-[#E76F2E] tracking-wider">
                                {project.jobType}
                              </span>
                              <h3 className="text-base font-bold text-[#292826] mt-0.5">
                                {project.resultPayload?.title || 'Custom Architectural Plan'}
                              </h3>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              {project.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-3 border-y border-[#E7E0D7] text-center">
                            <div className="bg-[#FAF8F5] p-2 rounded-xl">
                              <span className="text-[10px] text-[#74706A] block">Plot Size</span>
                              <span className="text-xs font-bold text-[#292826]">
                                {project.resultPayload?.plotSize || project.inputPayload?.plotSize || '30x50 ft'}
                              </span>
                            </div>
                            <div className="bg-[#FAF8F5] p-2 rounded-xl">
                              <span className="text-[10px] text-[#74706A] block">Facing</span>
                              <span className="text-xs font-bold text-[#292826]">
                                {project.resultPayload?.facing || project.inputPayload?.facing || 'East'}
                              </span>
                            </div>
                            <div className="bg-[#FAF8F5] p-2 rounded-xl">
                              <span className="text-[10px] text-[#74706A] block">Type</span>
                              <span className="text-xs font-bold text-[#292826]">
                                {project.resultPayload?.bhk || project.inputPayload?.bhk || '3 BHK'}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-[#74706A]">
                            Created on {new Date(project.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => onOpenConsult?.(`Architect review for plan ID: ${project.id}`)}
                            className="flex-1 py-2.5 rounded-xl bg-[#292826] hover:bg-black text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
                          >
                            <Icons.Phone size={13} />
                            <span>Book Consultation</span>
                          </button>
                          <button
                            onClick={() => alert(`Project Specs:\nJob ID: ${project.id}\nCreated: ${project.createdAt}\nDetails: ${JSON.stringify(project.resultPayload || project.inputPayload, null, 2)}`)}
                            className="px-3.5 py-2.5 rounded-xl border border-[#E7E0D7] hover:bg-[#FAF8F5] text-[#292826] text-xs font-bold transition"
                            title="View Raw Specs"
                          >
                            <Icons.FileText size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === TAB 3: ₹299 PASS & CREDITS === */}
            {!loading && activeTab === 'credits' && (
              <div className="space-y-8">
                {/* ₹299 Pass Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-[#FFF6E8] text-[#E76F2E] border border-[#E76F2E]/30 text-xs font-black uppercase tracking-wider">
                          ₹299 Design Pass
                        </span>
                        {passData?.hasActivePass ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold border border-slate-200">
                            No Active Pass
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-[#292826]">
                        Unlimited Architectural AI Generation
                      </h2>
                      <p className="text-xs sm:text-sm text-[#74706A] leading-relaxed">
                        The ₹299 Design Pass provides 5 AI generation credits for detailed 2D/3D blueprints, 30 days validity, and priority consultation booking with certified Indore architects.
                      </p>

                      {passData?.hasActivePass && (
                        <div className="pt-2 flex items-center gap-4 text-xs text-[#292826] font-semibold">
                          <div>
                            <span className="text-[#74706A] block text-[10px]">Valid Until</span>
                            <span>{new Date(passData.pass.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <div className="h-6 w-px bg-[#E7E0D7]" />
                          <div>
                            <span className="text-[#74706A] block text-[10px]">Days Left</span>
                            <span className="text-emerald-700 font-bold">{passData.daysRemaining} days</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#FAF8F5] rounded-2xl p-5 border border-[#E7E0D7] text-center shrink-0 min-w-[200px]">
                      <span className="text-[10px] uppercase font-bold text-[#74706A] block">
                        Live Credit Balance
                      </span>
                      <span className="text-4xl font-black text-[#E76F2E] block my-1">
                        {creditsData?.availableBalance ?? 0}
                      </span>
                      <span className="text-xs text-[#74706A] block">
                        Calculated from Ledger
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ledger Transactions Table */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-black text-[#292826]">Immutable Credit Ledger</h3>
                    <p className="text-xs text-[#74706A]">
                      Full audit trail of all credit grants, reservations, releases, and generation consumptions.
                    </p>
                  </div>

                  {!creditsData?.transactions || creditsData.transactions.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#74706A]">
                      No transaction history found on your account.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[#E7E0D7] text-[#74706A]">
                            <th className="py-3 px-3 font-bold">Type</th>
                            <th className="py-3 px-3 font-bold">Delta</th>
                            <th className="py-3 px-3 font-bold">Description</th>
                            <th className="py-3 px-3 font-bold">Reference</th>
                            <th className="py-3 px-3 font-bold">Date & Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7E0D7]">
                          {(creditsData?.transactions || []).map((tx) => (
                            <tr key={tx.id} className="hover:bg-[#FAF8F5] transition">
                              <td className="py-3.5 px-3">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                    tx.type === 'GRANT'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : tx.type === 'RESERVE'
                                      ? 'bg-amber-100 text-amber-800'
                                      : tx.type === 'RELEASE'
                                      ? 'bg-sky-100 text-sky-800'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {tx.type}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 font-black">
                                <span
                                  className={
                                    tx.amount > 0
                                      ? 'text-emerald-700'
                                      : tx.amount < 0
                                      ? 'text-amber-700'
                                      : 'text-slate-500'
                                  }
                                >
                                  {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                                </span>
                              </td>
                              <td className="py-3.5 px-3 text-[#292826] font-medium max-w-xs">
                                {tx.description}
                              </td>
                              <td className="py-3.5 px-3 font-mono text-[11px] text-[#74706A]">
                                {tx.referenceId || tx.id.slice(0, 10)}
                              </td>
                              <td className="py-3.5 px-3 text-[#74706A] whitespace-nowrap">
                                {new Date(tx.createdAt).toLocaleString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* === TAB 4: CONSULTATIONS === */}
            {!loading && activeTab === 'consultations' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-[#E7E0D7] shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-[#292826]">Booked Consultations</h2>
                    <p className="text-xs text-[#74706A]">
                      Track your requested architect meetings, site visits, and contractor inquiries.
                    </p>
                  </div>
                  <button
                    onClick={() => onOpenConsult?.('New Consultation Request')}
                    className="px-4 py-2.5 rounded-xl bg-[#292826] hover:bg-black text-white text-xs font-bold shadow-md transition flex items-center gap-2 self-start sm:self-auto"
                  >
                    <Icons.Phone size={14} />
                    <span>Book New Call</span>
                  </button>
                </div>

                {!consultations || consultations.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-[#E7E0D7] text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] text-[#A29D96] flex items-center justify-center mx-auto border border-[#E7E0D7]">
                      <Icons.Phone size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-[#292826]">No Consultations Booked Yet</h3>
                      <p className="text-xs text-[#74706A] max-w-md mx-auto">
                        Need advice from a verified architect or structural engineer? Book a direct online consultation or site visit.
                      </p>
                    </div>
                    <button
                      onClick={() => onOpenConsult?.()}
                      className="px-5 py-2.5 rounded-xl bg-[#E76F2E] text-white font-bold text-xs hover:bg-[#C65320] transition"
                    >
                      Book Free Architect Call
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(consultations || []).map((c) => (
                      <div
                        key={c.id}
                        className="bg-white rounded-2xl p-5 border border-[#E7E0D7] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-[#E76F2E] tracking-wider">
                              {c.type}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              {c.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-[#292826]">{c.requirement}</h4>
                          <p className="text-xs text-[#74706A]">
                            City: <strong>{c.city}</strong> • Submitted: {new Date(c.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href="https://wa.me/919999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition flex items-center gap-1.5"
                          >
                            <Icons.MessageSquare size={14} />
                            <span>WhatsApp Support</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* === TAB 5: PROFILE & SECURITY === */}
            {!loading && activeTab === 'security' && (
              <div className="space-y-8">
                {/* Section 1: Profile Information */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm">
                  <h3 className="text-lg font-black text-[#292826] mb-1">Personal Details</h3>
                  <p className="text-xs text-[#74706A] mb-6">
                    Update your display name and mobile phone number.
                  </p>

                  {profileFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-semibold mb-4 ${
                        profileFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {profileFeedback.text}
                    </div>
                  )}

                  <form onSubmit={handleProfileSubmit} className="max-w-md space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#292826] block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        required
                        className="w-full text-xs p-3 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#E76F2E]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#292826] block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full text-xs p-3 rounded-xl border border-[#E7E0D7] bg-slate-100 text-[#74706A] cursor-not-allowed"
                      />
                      <span className="text-[10px] text-[#A29D96] mt-0.5 block">Email address cannot be modified.</span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#292826] block mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={profilePhone}
                        onChange={(e) => setProfilePhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs p-3 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#E76F2E]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="px-5 py-2.5 rounded-xl bg-[#292826] hover:bg-black text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </form>
                </div>

                {/* Section 2: Change Password */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm">
                  <h3 className="text-lg font-black text-[#292826] mb-1">Security & Password</h3>
                  <p className="text-xs text-[#74706A] mb-6">
                    Change your account password. Must be at least 8 characters long.
                  </p>

                  {passwordFeedback && (
                    <div
                      className={`p-3.5 rounded-xl text-xs font-semibold mb-4 ${
                        passwordFeedback.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {passwordFeedback.text}
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
                    <div>
                      <label className="text-xs font-bold text-[#292826] block mb-1">Current Password</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full text-xs p-3 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#E76F2E]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#292826] block mb-1">New Password</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full text-xs p-3 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#E76F2E]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#292826] block mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full text-xs p-3 rounded-xl border border-[#E7E0D7] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#E76F2E]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="px-5 py-2.5 rounded-xl bg-[#E76F2E] hover:bg-[#C65320] text-white text-xs font-bold transition disabled:opacity-50"
                    >
                      {passwordSaving ? 'Updating Password...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Section 3: Active Device Sessions */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7E0D7] shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-[#292826]">Active Device Sessions</h3>
                      <p className="text-xs text-[#74706A]">
                        Devices currently signed into your Indore House Makers account with refresh tokens.
                      </p>
                    </div>
                    {(sessions || []).filter((s) => !s.isCurrent).length > 0 && (
                      <button
                        onClick={handleRevokeAllOther}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition self-start sm:self-auto"
                      >
                        Revoke All Other Devices
                      </button>
                    )}
                  </div>

                  <div className="divide-y divide-[#E7E0D7]">
                    {(sessions || []).map((sess) => (
                      <div key={sess.id} className="py-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E7E0D7] flex items-center justify-center text-[#292826] shrink-0">
                            {sess.userAgent.toLowerCase().includes('mobile') ? (
                              <Icons.Phone size={18} />
                            ) : (
                              <Icons.Shield size={18} />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold text-[#292826] truncate max-w-xs">
                                {sess.userAgent.slice(0, 50)}...
                              </span>
                              {sess.isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#74706A]">
                              IP: {sess.ipAddress} • Signed in: {new Date(sess.createdAt).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>

                        {!sess.isCurrent && (
                          <button
                            onClick={() => handleRevokeSession(sess.id)}
                            className="px-3 py-1.5 rounded-lg border border-[#E7E0D7] hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700 text-xs font-bold text-[#74706A] transition whitespace-nowrap"
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
