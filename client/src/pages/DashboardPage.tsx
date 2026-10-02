import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
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
    title: 'User Workspace | Indore House Makers',
    description:
      'Manage your architectural blueprints, active passes, credits ledger, and account security.',
  })

  const { user, isAuthenticated, isLoading: authLoading, getAuthHeaders } = useAuth()
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

  // Profile & Password form states
  const [profileName, setProfileName] = useState('')
  const [profilePhone, setProfilePhone] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      setError(err?.message || 'Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, getAuthHeaders])

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated, loadDashboardData])

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

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Sign out this device session?')) return
    try {
      await revokeUserSession(sessionId, getAuthHeaders())
      setSessions((prev) => prev.filter((s) => s.id !== sessionId))
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke session.')
    }
  }

  const handleRevokeAllOther = async () => {
    if (!confirm('Log out from all other devices?')) return
    try {
      await revokeAllOtherSessions(getAuthHeaders())
      setSessions((prev) => prev.filter((s) => s.isCurrent))
    } catch (err: any) {
      alert(err?.message || 'Failed to revoke other sessions.')
    }
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#C94F36] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#74706A]">Loading workspace...</span>
        </div>
      </div>
    )
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
                <button
                  onClick={onOpenAiStudio}
                  className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Icons.Plus size={14} />
                  <span>New Floor Plan</span>
                </button>
              </div>
            }
          />

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Available Credits"
              value={creditsData?.availableBalance ?? user?.totalCredits ?? 0}
              subtext="Usable across 2D & 3D generations"
              icon={<Icons.CreditCard size={18} />}
              action={
                <button
                  onClick={onOpenAiStudio}
                  className="text-xs font-semibold text-[#C94F36] hover:underline"
                >
                  Generate Plan →
                </button>
              }
            />

            <MetricCard
              label="Access Pass"
              value={passData?.hasActivePass ? '₹299 Design Pass' : 'Standard'}
              subtext={
                passData?.hasActivePass
                  ? `${passData.daysRemaining ?? 30} days remaining`
                  : 'Pay-per-design mode'
              }
              icon={<Icons.Award size={18} />}
              action={
                <StatusText
                  status={passData?.hasActivePass ? 'Active' : 'No Active Pass'}
                  variant={passData?.hasActivePass ? 'success' : 'neutral'}
                />
              }
            />

            <MetricCard
              label="Projects Created"
              value={projects.length}
              subtext="Saved architectural blueprints"
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
                  accessor: (p) => (
                    <div>
                      <div className="font-semibold text-[#292826]">{p.inputPayload?.title || 'Custom Layout'}</div>
                      <div className="text-[11px] text-[#74706A]">
                        {p.inputPayload?.plotSize || 'Plot Area'} • {p.inputPayload?.facing || 'Vastu Verified'}
                      </div>
                    </div>
                  ),
                },
                {
                  header: 'Type',
                  accessor: (p) => (
                    <span className="text-[11px] font-medium text-[#74706A]">
                      {p.jobType === '2D_FLOOR_PLAN' ? '2D CAD Floor Plan' : '3D Elevation'}
                    </span>
                  ),
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
                  description="Generate high-resolution 2D CAD floor plans and 3D elevations customized for your plot."
                  icon={<Icons.Layers size={24} />}
                  action={
                    <button
                      onClick={onOpenAiStudio}
                      className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold transition"
                    >
                      Create First Blueprint
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
            subtitle="All saved floor layouts, structural drafts, and elevation files."
            actions={
              <button
                onClick={onOpenAiStudio}
                className="px-3.5 py-2 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Icons.Plus size={14} />
                <span>New Floor Plan</span>
              </button>
            }
          />

          {/* Quick Draft Form */}
          <div className="bg-white rounded-lg border border-[#E7E0D7] p-5">
            <h3 className="text-xs font-bold text-[#292826] uppercase tracking-wider mb-3">
              Quick Blueprint Generator
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
                accessor: (p) => (
                  <div>
                    <div className="font-semibold text-[#292826]">{p.inputPayload?.title || 'Custom Layout'}</div>
                    <div className="text-[11px] text-[#74706A]">
                      {p.inputPayload?.plotSize || 'N/A'} • {p.inputPayload?.facing || 'N/A'}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Type',
                accessor: (p) => p.jobType === '2D_FLOOR_PLAN' ? '2D Floor Plan' : '3D Elevation',
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
            subtitle="Real-time transaction history of all design credits, grants, and usage."
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAiStudio}
                  className="px-3.5 py-2 rounded-md bg-[#FFF6E8] text-[#C94F36] hover:bg-[#ffeecf] text-xs font-semibold border border-[#E7E0D7] transition"
                >
                  ₹299 Starter Pack
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <MetricCard
              label="Available Balance"
              value={`${creditsData?.availableBalance ?? user?.totalCredits ?? 0} Credits`}
              subtext="1 Credit = 1 Standard Floor Plan Generation"
            />
            <MetricCard
              label="Pass Status"
              value={passData?.hasActivePass ? '₹299 Pass' : 'Pay as you go'}
              subtext={passData?.hasActivePass ? '5 AI Generations Pack' : 'No active subscription'}
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
    </DashboardLayout>
  )
}
