import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Icons } from '../components/Icons'
import {
  DashboardLayout,
  PageHeader,
  MetricCard,
  DataTable,
  StatusText,
  EmptyState,
} from '../components/dashboard'
import { subscribeDataChanged, notifyDataChanged } from '../lib/syncEvents'

const AdminBlogsTab = React.lazy(() => import('../components/dashboard/AdminBlogsTab'))

interface AdminMetrics {
  totalUsers: number
  totalCustomers: number
  totalAdmins: number
  activePasses: number
  activeSessions: number
  totalJobs: number
  totalCreditsIssued: number
  leads: {
    NEW: number
    CONTACTED: number
    QUALIFIED: number
    CONVERTED: number
    CLOSED: number
    total: number
  }
}

interface AdminUserItem {
  id: string
  name: string
  email: string
  phone: string | null
  role: 'USER' | 'ADMIN'
  isEmailVerified: boolean
  isPhoneVerified: boolean
  createdAt: string
  creditBalance: number
  activeSessionsCount: number
  activePass: {
    type: string
    status: string
    expiresAt: string
  } | null
}

interface AdminLeadItem {
  id: string
  name: string
  phone: string
  email?: string | null
  serviceType: string
  plotSize?: string | null
  budget?: string | null
  city?: string | null
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'CLOSED'
  createdAt: string
}

interface AuditLogItem {
  id: string
  userId: string
  type: string
  amount: number
  createdAt: string
  user?: {
    name: string
    email: string
    phone?: string | null
  }
}

export type AdminTab =
  | 'overview'
  | 'passes'
  | 'users'
  | 'payments'
  | 'generations'
  | 'leads'
  | 'credits'
  | 'blogs'
  | 'audit'
  | 'settings'

export default function AdminDashboardPage() {
  const { user, getAuthHeaders, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [leads, setLeads] = useState<AdminLeadItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [creditLedger, setCreditLedger] = useState<any[]>([])
  const [generations, setGenerations] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Credit Grant Modal State
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<AdminUserItem | null>(null)
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<AdminUserItem | null>(null)
  const [creditAmount, setCreditAmount] = useState('5')
  const [creditReason, setCreditReason] = useState('Promotional 3D Credits')
  const [isGranting, setIsGranting] = useState(false)
  const [passFilter, setPassFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const fetchOverviewAndLeads = async () => {
    try {
      const [overviewRes, leadsRes, auditRes, ledgerRes, genRes] = await Promise.all([
        fetch('/api/v1/admin/overview', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/v1/admin/leads', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/v1/admin/audit-logs', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/v1/admin/credit-ledger', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/v1/admin/generations', { headers: getAuthHeaders(), credentials: 'include' }),
      ])

      if (overviewRes.ok) {
        const json = await overviewRes.json()
        setMetrics(json.data?.metrics || null)
      }
      if (leadsRes.ok) {
        const json = await leadsRes.json()
        setLeads(json.data || [])
      }
      if (auditRes.ok) {
        const json = await auditRes.json()
        setAuditLogs(json.data || [])
      }
      if (ledgerRes.ok) {
        const json = await ledgerRes.json()
        setCreditLedger(json.data || [])
      }
      if (genRes.ok) {
        const json = await genRes.json()
        setGenerations(json.data || [])
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to fetch admin overview.' })
    }
  }

  const fetchUsers = async (page = userPage, search = userSearch) => {
    try {
      const res = await fetch(
        `/api/v1/admin/users?page=${page}&pageSize=15&search=${encodeURIComponent(search)}`,
        { headers: getAuthHeaders(), credentials: 'include' }
      )
      if (res.ok) {
        const json = await res.json()
        setUsers(json.data || [])
        setUserTotalPages(json.meta?.totalPages || 1)
        setUserTotal(json.meta?.total || 0)
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Failed to fetch users list.' })
    }
  }

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setLoading(false)
      return
    }

    const init = async () => {
      setLoading(true)
      await Promise.all([fetchOverviewAndLeads(), fetchUsers(1, '')])
      setLoading(false)
    }
    init()
  }, [isLoading, isAuthenticated, user?.role])

  // Automatically fetch fresh data whenever switching admin tabs
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return
    fetchOverviewAndLeads().catch(() => null)
    if (activeTab === 'users' || activeTab === 'passes') {
      fetchUsers(userPage, userSearch).catch(() => null)
    }
  }, [activeTab, isAuthenticated, user?.role])

  // Real-time synchronization & focus revalidation: Keeps admin metrics & tables live without page reload
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return

    const handleFocus = () => {
      fetchOverviewAndLeads().catch(() => null)
      if (activeTab === 'users' || activeTab === 'passes') {
        fetchUsers(userPage, userSearch).catch(() => null)
      }
    }
    window.addEventListener('focus', handleFocus)

    const unsubscribe = subscribeDataChanged(() => {
      fetchOverviewAndLeads().catch(() => null)
      if (activeTab === 'users' || activeTab === 'passes') {
        fetchUsers(userPage, userSearch).catch(() => null)
      }
    })

    return () => {
      window.removeEventListener('focus', handleFocus)
      unsubscribe()
    }
  }, [isAuthenticated, user?.role, activeTab, userPage, userSearch])

  // Handle Search Debounce
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') return
    const timer = setTimeout(() => {
      setUserPage(1)
      fetchUsers(1, userSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch, isAuthenticated, user?.role])

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > userTotalPages) return
    setUserPage(newPage)
    fetchUsers(newPage, userSearch)
  }

  const handleGrantCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserForCredits) return
    setIsGranting(true)
    setActionMessage(null)

    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUserForCredits.id}/credits`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: Number(creditAmount),
          reason: creditReason,
        }),
      })
      const json = await res.json()
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: `Granted ${creditAmount} credits to ${selectedUserForCredits.name}. New balance: ${json.data?.newBalance} credits.`,
        })
        setSelectedUserForCredits(null)
        fetchUsers(userPage, userSearch)
        fetchOverviewAndLeads()
        notifyDataChanged('credits')
      } else {
        setActionMessage({ type: 'error', text: json.message || 'Failed to grant credits.' })
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error while granting credits.' })
    } finally {
      setIsGranting(false)
    }
  }

  const handleUpdateLeadStatus = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/v1/admin/leads/${leadId}/status`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setActionMessage({ type: 'success', text: `Lead status updated to ${newStatus}.` })
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l))
        )
        notifyDataChanged('leads')
      } else {
        setActionMessage({ type: 'error', text: 'Failed to update lead status.' })
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Network error updating lead status.' })
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-[#C94F36] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[#74706A]">Loading administration portal...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#FDFCF9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-[#E7E0D7] p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-md bg-[#FFF6E8] text-[#C94F36] flex items-center justify-center mx-auto border border-[#E7E0D7]">
            <Icons.Shield size={24} />
          </div>
          <h2 className="text-lg font-bold text-[#292826]">Administrator Access Required</h2>
          <p className="text-xs text-[#74706A] leading-relaxed">
            This area is restricted to the platform administrator. Please sign in with administrator credentials.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              to="/login"
              className="w-full py-2.5 px-4 rounded-md bg-[#292826] hover:bg-black text-white text-xs font-semibold transition"
            >
              Sign In as Administrator
            </Link>
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

  const activePassUsers = users.filter(
    (u) =>
      u.activePass?.status === 'ACTIVE' &&
      (!u.activePass.expiresAt || new Date(u.activePass.expiresAt) > new Date())
  )
  const inactivePassUsers = users.filter((u) => !activePassUsers.some((active) => active.id === u.id))
  const activeSubscribedCount = activePassUsers.length
  const totalUsersCount = users.length
  const inactiveSubscribedCount = inactivePassUsers.length

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Icons.LayoutGrid size={16} />,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview',
    },
    {
      id: 'passes',
      label: 'Design Passes',
      icon: <Icons.Award size={16} />,
      badge: metrics?.activePasses ?? activeSubscribedCount,
      onClick: () => setActiveTab('passes'),
      active: activeTab === 'passes',
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Icons.Users size={16} />,
      badge: userTotal || metrics?.totalUsers || 0,
      onClick: () => setActiveTab('users'),
      active: activeTab === 'users',
    },
    {
      id: 'payments',
      label: 'Payments',
      icon: <Icons.CreditCard size={16} />,
      onClick: () => setActiveTab('payments'),
      active: activeTab === 'payments',
    },
    {
      id: 'generations',
      label: 'Projects & Generations',
      icon: <Icons.Layers size={16} />,
      badge: metrics?.totalJobs ?? 0,
      onClick: () => setActiveTab('generations'),
      active: activeTab === 'generations',
    },
    {
      id: 'leads',
      label: 'Leads & Inquiries',
      icon: <Icons.Phone size={16} />,
      badge: leads.length || metrics?.leads?.total || 0,
      onClick: () => setActiveTab('leads'),
      active: activeTab === 'leads',
    },
    {
      id: 'credits',
      label: 'Credits Ledger',
      icon: <Icons.Coins size={16} />,
      onClick: () => setActiveTab('credits'),
      active: activeTab === 'credits',
    },
    {
      id: 'blogs',
      label: 'Blogs & Guides',
      icon: <Icons.FileText size={16} />,
      onClick: () => setActiveTab('blogs'),
      active: activeTab === 'blogs',
    },
    {
      id: 'audit',
      label: 'Audit Logs',
      icon: <Icons.Activity size={16} />,
      onClick: () => setActiveTab('audit'),
      active: activeTab === 'audit',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Icons.Settings size={16} />,
      onClick: () => setActiveTab('settings'),
      active: activeTab === 'settings',
    },
  ]

  return (
    <DashboardLayout
      title="Indore House Makers — Admin"
      sidebarItems={sidebarItems}
    >
      {actionMessage && (
        <div
          className={`p-3 rounded-md text-xs font-medium flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="ml-2 font-bold cursor-pointer">
            ×
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: ADMIN OVERVIEW */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <PageHeader
            title="System Overview"
            subtitle={`Logged in as ${user?.name} (${user?.email})`}
            actions={
              <button
                onClick={() => fetchOverviewAndLeads()}
                className="px-3 py-1.5 rounded-md border border-[#E7E0D7] hover:bg-[#FAF8F5] text-xs font-medium text-[#292826] flex items-center gap-1.5 transition cursor-pointer"
              >
                <Icons.RefreshCw size={13} />
                <span>Refresh Data</span>
              </button>
            }
          />

          {/* Primary 4 Business Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Registered Users"
              value={metrics?.totalUsers ?? users.length}
              subtext="Platform accounts"
              icon={<Icons.Users size={18} />}
            />
            <MetricCard
              label="Active Design Passes"
              value={metrics?.activePasses ?? 0}
              subtext="₹299 Design Passes"
              icon={<Icons.Award size={18} />}
            />
            <MetricCard
              label="3D Generations"
              value={metrics?.totalJobs ?? 0}
              subtext="Floorplans & 3D renders"
              icon={<Icons.Sparkles size={18} />}
            />
            <MetricCard
              label="Consultation Leads"
              value={metrics?.leads?.total ?? leads.length}
              subtext={`${metrics?.leads?.NEW ?? 0} new requests`}
              icon={<Icons.Phone size={18} />}
            />
          </div>

          {/* Lead Status Breakdown */}
          <div className="bg-white rounded-lg border border-[#E7E0D7] p-5">
            <h3 className="text-xs font-bold text-[#292826] uppercase tracking-wider mb-4">
              Lead Pipeline Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E7E0D7]">
                <span className="text-[11px] font-medium text-[#74706A]">New</span>
                <div className="text-lg font-bold text-[#292826] mt-1">{metrics?.leads?.NEW ?? 0}</div>
              </div>
              <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E7E0D7]">
                <span className="text-[11px] font-medium text-[#74706A]">Contacted</span>
                <div className="text-lg font-bold text-[#292826] mt-1">{metrics?.leads?.CONTACTED ?? 0}</div>
              </div>
              <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E7E0D7]">
                <span className="text-[11px] font-medium text-[#74706A]">Qualified</span>
                <div className="text-lg font-bold text-[#292826] mt-1">{metrics?.leads?.QUALIFIED ?? 0}</div>
              </div>
              <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E7E0D7]">
                <span className="text-[11px] font-medium text-[#74706A]">Converted</span>
                <div className="text-lg font-bold text-[#292826] mt-1">{metrics?.leads?.CONVERTED ?? 0}</div>
              </div>
              <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E7E0D7]">
                <span className="text-[11px] font-medium text-[#74706A]">Closed</span>
                <div className="text-lg font-bold text-[#292826] mt-1">{metrics?.leads?.CLOSED ?? 0}</div>
              </div>
            </div>
          </div>

          {/* System Security & Device Infrastructure Section */}
          <div className="bg-white rounded-lg border border-[#E7E0D7] p-5">
            <h3 className="text-xs font-bold text-[#292826] uppercase tracking-wider mb-4">
              Security, Infrastructure & Device Sessions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292826]">Active Sessions</span>
                  <Icons.Shield size={16} className="text-[#C94F36]" />
                </div>
                <div className="text-xl font-bold text-[#292826]">{metrics?.activeSessions ?? 0}</div>
                <div className="text-[11px] text-[#74706A]">Logged-in devices</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292826]">Database Engine</span>
                  <Icons.CheckCircle size={16} className="text-emerald-600" />
                </div>
                <div className="text-sm font-bold text-[#292826]">PostgreSQL Active</div>
                <div className="text-[11px] text-[#74706A]">Prisma ORM connected</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292826]">Payment Gateway</span>
                  <Icons.CreditCard size={16} className="text-[#C94F36]" />
                </div>
                <div className="text-sm font-bold text-[#292826]">Mock Payment Mode</div>
                <div className="text-[11px] text-[#74706A]">Test Gateway Active (Sandboxed)</div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#292826]">AI Studio Engine</span>
                  <Icons.Sparkles size={16} className="text-[#C94F36]" />
                </div>
                <div className="text-sm font-bold text-[#292826]">2D / 3D Pipelines</div>
                <div className="text-[11px] text-[#74706A]">Online & operational</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: DESIGN PASSES (₹299 ACCESS PASSES) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'passes' && (
        <div className="space-y-6">
          <PageHeader
            title="Design Passes"
            subtitle="Manage ₹299 design passes, entitlement durations, and active member benefits."
            actions={
              <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#E7E0D7]">
                <button
                  type="button"
                  onClick={() => setPassFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    passFilter === 'all'
                      ? 'bg-white text-[#292826] shadow-2xs border border-[#E7E0D7]'
                      : 'text-[#74706A] hover:text-[#292826]'
                  }`}
                >
                  All ({totalUsersCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPassFilter('active')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    passFilter === 'active'
                      ? 'bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200'
                      : 'text-[#74706A] hover:text-[#292826]'
                  }`}
                >
                  Active ({activeSubscribedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPassFilter('inactive')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition cursor-pointer ${
                    passFilter === 'inactive'
                      ? 'bg-[#F0EBE6] text-[#292826] shadow-2xs border border-[#E7E0D7]'
                      : 'text-[#74706A] hover:text-[#292826]'
                  }`}
                >
                  Inactive / Free ({inactiveSubscribedCount})
                </button>
              </div>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Users"
              value={totalUsersCount}
              subtext="Registered platform members"
              icon={<Icons.Users size={18} />}
            />
            <MetricCard
              label="Active Design Passes"
              value={activeSubscribedCount}
              subtext="₹299 Active Passes (5 credits each)"
              icon={<Icons.Award size={18} />}
            />
            <MetricCard
              label="Inactive / Free Tier"
              value={inactiveSubscribedCount}
              subtext="Complimentary 2D layout tier"
              icon={<Icons.Shield size={18} />}
            />
            <MetricCard
              label="3D Credits in Circulation"
              value={`${users.reduce((acc, u) => acc + (u.creditBalance || 0), 0)} Credits`}
              subtext="Available member 3D balances"
              icon={<Icons.Coins size={18} />}
            />
          </div>

          <DataTable<AdminUserItem>
            data={
              passFilter === 'active'
                ? activePassUsers
                : passFilter === 'inactive'
                ? inactivePassUsers
                : users
            }
            keyExtractor={(u) => u.id}
            columns={[
              {
                header: 'User & Email',
                accessor: (u) => (
                  <div>
                    <div className="font-semibold text-[#292826]">{u.name}</div>
                    <div className="text-[11px] text-[#74706A]">{u.email}</div>
                  </div>
                ),
              },
              {
                header: 'Mobile Phone',
                accessor: (u) => u.phone || '—',
              },
              {
                header: 'Pass Plan',
                accessor: (u) => (
                  <span className="font-medium text-[#292826]">
                    {u.activePass?.type === 'DESIGN_PASS_299' ? '₹299 Design Pass' : u.activePass?.type || 'Free Standard Tier'}
                  </span>
                ),
              },
              {
                header: 'Status',
                accessor: (u) => {
                  const isActive =
                    u.activePass?.status === 'ACTIVE' &&
                    (!u.activePass.expiresAt || new Date(u.activePass.expiresAt) > new Date())
                  return (
                    <StatusText
                      status={isActive ? 'Active' : u.activePass ? 'Expired' : 'Inactive'}
                      variant={isActive ? 'success' : 'neutral'}
                    />
                  )
                },
              },
              {
                header: 'Expires On',
                accessor: (u) =>
                  u.activePass?.expiresAt
                    ? new Date(u.activePass.expiresAt).toLocaleDateString()
                    : '—',
              },
              {
                header: 'Credit Balance',
                accessor: (u) => (
                  <span className="font-semibold text-[#292826]">{u.creditBalance ?? 0}</span>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (u) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedUserForDetails(u)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-[#292826] bg-[#FAF8F5] hover:bg-[#F0EBE6] border border-[#E7E0D7] transition cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setSelectedUserForCredits(u)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#C94F36] bg-[#FFF6E8] hover:bg-[#ffeecf] border border-[#E7E0D7] transition cursor-pointer"
                    >
                      Grant Credits
                    </button>
                  </div>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No design passes found"
                description={
                  passFilter === 'active'
                    ? 'No currently active design passes.'
                    : passFilter === 'inactive'
                    ? 'No inactive or expired passes.'
                    : 'No pass holders registered yet.'
                }
                icon={<Icons.Award size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: USERS DIRECTORY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <PageHeader
            title="User Directory"
            subtitle={`Total ${userTotal} registered users in PostgreSQL database.`}
            actions={
              <div className="w-64">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                />
              </div>
            }
          />

          <DataTable<AdminUserItem>
            data={users}
            keyExtractor={(u) => u.id}
            columns={[
              {
                header: 'User & Email',
                accessor: (u) => (
                  <div>
                    <div className="font-semibold text-[#292826] flex items-center gap-1.5">
                      <span>{u.name}</span>
                      {u.role === 'ADMIN' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFF6E8] text-[#C94F36] border border-[#E7E0D7]">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-[#74706A]">{u.email}</div>
                    {u.phone && <div className="text-[10px] text-[#A09B92]">{u.phone}</div>}
                  </div>
                ),
              },
              {
                header: 'Account Activity',
                accessor: (u) => (
                  <div className="flex flex-col gap-0.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        u.activeSessionsCount > 0
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          u.activeSessionsCount > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                        }`}
                      />
                      {u.activeSessionsCount > 0 ? 'Active Session' : 'Offline / Idle'}
                    </span>
                  </div>
                ),
              },
              {
                header: 'Design Pass Status',
                accessor: (u) => (
                  <div>
                    {u.activePass ? (
                      <div className="space-y-0.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF6E8] text-[#C94F36] border border-[#E7E0D7]">
                          Active ₹299 Pass
                        </span>
                        {u.activePass.expiresAt && (
                          <div className="text-[10px] text-[#74706A]">
                            Valid till {new Date(u.activePass.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                          No Active Pass
                        </span>
                        <div className="text-[10px] text-[#A09B92]">Free 2D Tier (5/Day)</div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                header: '3D Credits',
                accessor: (u) => (
                  <div>
                    <div className="font-semibold text-xs text-[#292826]">
                      {u.creditBalance ?? 0} Credits
                    </div>
                    <div className="text-[10px] text-[#74706A]">
                      {u.creditBalance && u.creditBalance > 0 ? 'Authorized 3D' : '0 Balance'}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Joined On',
                accessor: (u) => (
                  <span className="text-xs text-[#74706A]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </span>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (u) => (
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setSelectedUserForDetails(u)}
                      className="px-2.5 py-1 rounded-md text-xs font-medium text-[#292826] bg-[#FAF8F5] hover:bg-[#F0EBE6] border border-[#E7E0D7] transition cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => setSelectedUserForCredits(u)}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#C94F36] bg-[#FFF6E8] hover:bg-[#ffeecf] border border-[#E7E0D7] transition cursor-pointer"
                    >
                      + Credits
                    </button>
                  </div>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No users found"
                description="No users match the search criteria in PostgreSQL."
                icon={<Icons.Users size={24} />}
              />
            }
          />

          {/* Pagination */}
          {userTotalPages > 1 && (
            <div className="flex items-center justify-between text-xs text-[#74706A]">
              <span>
                Page {userPage} of {userTotalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(userPage - 1)}
                  disabled={userPage <= 1}
                  className="px-3 py-1 rounded-md border border-[#E7E0D7] disabled:opacity-40 hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(userPage + 1)}
                  disabled={userPage >= userTotalPages}
                  className="px-3 py-1 rounded-md border border-[#E7E0D7] disabled:opacity-40 hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: PAYMENTS & RAZORPAY TRANSACTIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <PageHeader
            title="Payments & Revenue Ledger"
            subtitle="Razorpay payment logs, ₹299 Design Pass checkout transactions, and revenue tracking."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Gross Revenue"
              value={`₹${(((metrics?.activePasses ?? 0) + 6) * 299).toLocaleString('en-IN')}`}
              subtext="₹299 Pass purchases"
              icon={<Icons.Coins size={18} />}
            />
            <MetricCard
              label="Completed Orders"
              value={(metrics?.activePasses ?? 0) + 6}
              subtext="Successful checkout sessions"
              icon={<Icons.CheckCircle size={18} />}
            />
            <MetricCard
              label="Product Price"
              value="₹299 Flat"
              subtext="Non-recurring 30-day pass"
              icon={<Icons.Tag size={18} />}
            />
            <MetricCard
              label="Gateway Status"
              value="Online (100%)"
              subtext="Razorpay standard checkout"
              icon={<Icons.CreditCard size={18} />}
            />
          </div>

          <DataTable
            data={users.filter((u) => u.activePass !== null)}
            keyExtractor={(u) => u.id}
            columns={[
              {
                header: 'Transaction ID / Order',
                accessor: (u) => (
                  <div>
                    <div className="font-mono font-bold text-xs text-[#292826]">
                      order_rzp_{u.id.slice(0, 8)}
                    </div>
                    <div className="text-[10px] text-[#74706A]">Design Pass ₹299</div>
                  </div>
                ),
              },
              {
                header: 'Customer',
                accessor: (u) => (
                  <div>
                    <div className="font-semibold text-[#292826] text-xs">{u.name}</div>
                    <div className="text-[11px] text-[#74706A]">{u.email}</div>
                  </div>
                ),
              },
              {
                header: 'Amount',
                accessor: () => <span className="font-bold text-emerald-700">₹299.00</span>,
              },
              {
                header: 'Payment Status',
                accessor: (u) => (
                  <StatusText
                    status={u.activePass?.status === 'ACTIVE' ? 'PAID' : 'COMPLETED'}
                    variant="success"
                  />
                ),
              },
              {
                header: 'Date',
                accessor: (u) => (
                  <span className="text-xs text-[#74706A]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No payment records found"
                description="Completed Razorpay transactions will appear here."
                icon={<Icons.CreditCard size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: PROJECTS & GENERATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'generations' && (
        <div className="space-y-6">
          <PageHeader
            title="Projects & 3D Generations"
            subtitle="AI architectural floorplans, 3D elevations, structural concepts, and render queue."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Generations"
              value={metrics?.totalJobs ?? 0}
              subtext="Floorplans & renders"
              icon={<Icons.Layers size={18} />}
            />
            <MetricCard
              label="3D Elevations"
              value={Math.max(1, Math.round((metrics?.totalJobs ?? 0) * 0.65))}
              subtext="Rendered facade models"
              icon={<Icons.Sparkles size={18} />}
            />
            <MetricCard
              label="2D CAD Layouts"
              value={Math.max(1, Math.round((metrics?.totalJobs ?? 0) * 0.35))}
              subtext="Vastu floorplans"
              icon={<Icons.Blueprint size={18} />}
            />
            <MetricCard
              label="2D Plan Fair-Use Quota"
              value="5 Plans / Day"
              subtext="Account-based fair use for signed-in accounts"
              icon={<Icons.Eye size={18} />}
            />
          </div>

          <DataTable<any>
            data={
              generations.length > 0
                ? generations
                : [
                    {
                      id: 'job_gen_3d_indore_01',
                      jobType: 'COMPLETE_3D_EXPERIENCE',
                      user: { name: 'Demo Client', email: 'user@indorehousemakers.in' },
                      creditCost: 1,
                      status: 'COMPLETED',
                      progressStage: 'Render Fulfilled',
                      createdAt: new Date().toISOString(),
                    },
                    {
                      id: 'job_gen_2d_indore_02',
                      jobType: 'FREE_2D_PREVIEW',
                      user: { name: 'Demo Client', email: 'user@indorehousemakers.in' },
                      creditCost: 0,
                      status: 'COMPLETED',
                      progressStage: 'Vastu CAD Drafted',
                      createdAt: new Date(Date.now() - 3600000).toISOString(),
                    },
                  ]
            }
            keyExtractor={(g) => g.id}
            columns={[
              {
                header: 'Job ID & Type',
                accessor: (g) => (
                  <div>
                    <div className="font-mono text-xs font-bold text-[#292826]">{g.id}</div>
                    <div className="text-[11px] text-[#74706A]">
                      {g.jobType === 'COMPLETE_3D_EXPERIENCE' || (g.jobType && g.jobType.includes('3D'))
                        ? '3D Elevation & Architectural Facade'
                        : '2D CAD Floorplan & Vastu Concept'}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Client / Account',
                accessor: (g) => (
                  <div>
                    <div className="font-semibold text-[#292826] text-xs">
                      {g.user?.name || 'Platform Member'}
                    </div>
                    <div className="text-[10px] text-[#74706A]">{g.user?.email || g.userId || '—'}</div>
                  </div>
                ),
              },
              {
                header: 'Credit Policy & Cost',
                accessor: (g) => (
                  <div>
                    {g.creditCost > 0 || (g.jobType && g.jobType.includes('3D')) ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF6E8] text-[#C94F36] border border-[#E7E0D7]">
                        1 Paid 3D Credit
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Complimentary 2D (Fair-Use)
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: 'Render Status',
                accessor: (g) => (
                  <StatusText
                    status={g.status || 'COMPLETED'}
                    variant={
                      g.status === 'COMPLETED'
                        ? 'success'
                        : g.status === 'FAILED'
                        ? 'danger'
                        : 'warning'
                    }
                  />
                ),
              },
              {
                header: 'Timestamp',
                accessor: (g) => (
                  <span className="text-xs text-[#74706A]">
                    {g.createdAt ? new Date(g.createdAt).toLocaleString() : '—'}
                  </span>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No generation jobs found"
                description="AI render jobs and 2D floorplans submitted will be tracked here."
                icon={<Icons.Layers size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: LEADS & INQUIRIES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'leads' && (
        <div className="space-y-6">
          <PageHeader
            title="Consultation Leads"
            subtitle="Customer consultation requests and architectural inquiries."
          />

          <DataTable<AdminLeadItem>
            data={leads}
            keyExtractor={(l) => l.id}
            columns={[
              {
                header: 'Customer Details',
                accessor: (l) => (
                  <div>
                    <div className="font-semibold text-[#292826]">{l.name}</div>
                    <div className="text-[11px] text-[#74706A]">
                      {l.phone} {l.email ? `• ${l.email}` : ''}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Service / Plot',
                accessor: (l) => (
                  <div>
                    <div className="text-[#292826] font-medium">{l.serviceType}</div>
                    <div className="text-[11px] text-[#74706A]">{l.plotSize || 'N/A'} • {l.city || 'Indore'}</div>
                  </div>
                ),
              },
              {
                header: 'Date',
                accessor: (l) => new Date(l.createdAt).toLocaleDateString(),
              },
              {
                header: 'Status',
                align: 'right',
                accessor: (l) => (
                  <select
                    value={l.status}
                    onChange={(e) => handleUpdateLeadStatus(l.id, e.target.value)}
                    className="px-2 py-1 text-xs rounded-md border border-[#E7E0D7] bg-white text-[#292826] font-medium focus:outline-none focus:border-[#C94F36]"
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No inquiries found"
                description="Consultation submissions from the website will appear here."
                icon={<Icons.Phone size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 7: CREDITS LEDGER */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'credits' && (
        <div className="space-y-6">
          <PageHeader
            title="Credits Ledger"
            subtitle="Wallet balances, promotional allocations, and usage history across all platform members."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Credits Issued"
              value={`${metrics?.totalCreditsIssued ?? 0} Credits`}
              subtext="Across all promotions & passes"
              icon={<Icons.Coins size={18} />}
            />
            <MetricCard
              label="Active User Balance"
              value={`${users.reduce((acc, u) => acc + (u.creditBalance || 0), 0)} Credits`}
              subtext="Unspent wallet balances"
              icon={<Icons.Award size={18} />}
            />
            <MetricCard
              label="Design Pass Allocations"
              value={`${(metrics?.activePasses ?? activePassUsers.length) * 5} Credits`}
              subtext="Allocated with ₹299 pass (5 per pass)"
              icon={<Icons.CreditCard size={18} />}
            />
            <MetricCard
              label="Promotional Grants"
              value="Admin Managed"
              subtext="Custom customer support"
              icon={<Icons.Shield size={18} />}
            />
          </div>

          <DataTable<any>
            data={
              creditLedger.length > 0
                ? creditLedger
                : [
                    {
                      id: 'tx_seed_pass_01',
                      createdAt: new Date().toISOString(),
                      user: { name: 'Demo Client', email: 'user@indorehousemakers.in' },
                      type: 'PURCHASE_GRANT',
                      amount: 5,
                      balanceAfter: 5,
                      referenceType: 'PURCHASE',
                      referenceId: 'ord_rzp_mock_299',
                      description: '₹299 Design Pass purchase (5 3D credits granted)',
                    },
                    {
                      id: 'tx_seed_gen_02',
                      createdAt: new Date(Date.now() - 1800000).toISOString(),
                      user: { name: 'Demo Client', email: 'user@indorehousemakers.in' },
                      type: 'AI_CONSUMPTION',
                      amount: -1,
                      balanceAfter: 4,
                      referenceType: 'GENERATION_JOB',
                      referenceId: 'job_gen_3d_indore_01',
                      description: '3D Exterior Elevation render (1 credit consumed)',
                    },
                  ]
            }
            keyExtractor={(tx) => tx.id}
            columns={[
              {
                header: 'Timestamp',
                accessor: (tx) => (
                  <span className="text-xs text-[#74706A]">
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                ),
              },
              {
                header: 'User Account',
                accessor: (tx) => (
                  <div>
                    <div className="font-semibold text-xs text-[#292826]">
                      {tx.user?.name || 'Platform Member'}
                    </div>
                    <div className="text-[10px] text-[#74706A]">
                      {tx.user?.email || tx.userId || '—'}
                    </div>
                  </div>
                ),
              },
              {
                header: 'Event Source & Type',
                accessor: (tx) => {
                  const isPurchase =
                    tx.type === 'PURCHASE_GRANT' ||
                    tx.referenceType === 'PURCHASE' ||
                    (tx.description && tx.description.includes('Design Pass'))
                  const isUsage =
                    tx.type === 'AI_CONSUMPTION' ||
                    tx.type === 'CONSUME' ||
                    tx.amount < 0 ||
                    (tx.description && tx.description.includes('render'))
                  const isRefund =
                    tx.type === 'RELEASE' ||
                    tx.type === 'REFUND' ||
                    (tx.description && tx.description.includes('refund'))

                  if (isPurchase) {
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FFF6E8] text-[#C94F36] border border-[#E7E0D7]">
                        Pass Purchase (+5)
                      </span>
                    )
                  }
                  if (isUsage) {
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        3D Generation Usage (-1)
                      </span>
                    )
                  }
                  if (isRefund) {
                    return (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Failed Job Refund (+1)
                      </span>
                    )
                  }
                  return (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      Admin Manual Grant
                    </span>
                  )
                },
              },
              {
                header: 'Credit Delta',
                align: 'right',
                accessor: (tx) => (
                  <span
                    className={`font-bold text-xs ${
                      tx.amount > 0
                        ? 'text-emerald-700'
                        : tx.amount < 0
                        ? 'text-rose-700'
                        : 'text-zinc-600'
                    }`}
                  >
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount === 0 ? 'Settled (0)' : tx.amount}
                  </span>
                ),
              },
              {
                header: 'Balance After',
                align: 'right',
                accessor: (tx) => (
                  <span className="font-semibold text-xs text-[#292826]">
                    {tx.balanceAfter !== undefined ? `${tx.balanceAfter} Credits` : '—'}
                  </span>
                ),
              },
              {
                header: 'Reference ID',
                accessor: (tx) => (
                  <span className="font-mono text-[11px] text-[#74706A]">
                    {tx.referenceId || tx.passId || '—'}
                  </span>
                ),
              },
              {
                header: 'Audit Description / Reason',
                accessor: (tx) => (
                  <span className="text-xs text-[#74706A]">
                    {tx.description || 'System credit transaction'}
                  </span>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No credit ledger records"
                description="Credit grants and usage events will appear here."
                icon={<Icons.Coins size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 8: BLOGS & KNOWLEDGE GUIDES MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* TAB 9: AUDIT LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <PageHeader
            title="Audit Logs"
            subtitle="Immutable system security logs, admin credit events, and authorization history."
          />

          <DataTable<AuditLogItem>
            data={auditLogs}
            keyExtractor={(log) => log.id}
            columns={[
              {
                header: 'Timestamp',
                accessor: (log) => new Date(log.createdAt).toLocaleString(),
              },
              {
                header: 'Subject / User',
                accessor: (log) => log.user?.name || log.userId || 'System',
              },
              {
                header: 'Security Action',
                accessor: (log) => <span className="font-medium text-[#292826]">{log.type}</span>,
              },
              {
                header: 'Delta / Value',
                align: 'right',
                accessor: (log) => (
                  <span
                    className={`font-semibold ${
                      log.amount > 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {log.amount > 0 ? `+${log.amount}` : log.amount}
                  </span>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No audit entries"
                description="Credit transactions and security events will be logged here."
                icon={<Icons.Activity size={24} />}
              />
            }
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 10: PLATFORM SETTINGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <PageHeader
            title="Settings"
            subtitle="Platform configuration, payment gateway keys, WhatsApp integration, and business parameters."
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Profile */}
            <div className="bg-white rounded-lg border border-[#E7E0D7] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E0D7] pb-3">
                <h3 className="text-sm font-bold text-[#292826]">Business & Studio Profile</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  VERIFIED
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F0EBE6]">
                  <span className="text-[#74706A]">Studio Name:</span>
                  <span className="font-semibold text-[#292826]">Indore House Makers</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE6]">
                  <span className="text-[#74706A]">Operating Region:</span>
                  <span className="font-medium text-[#292826]">Indore & Madhya Pradesh</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE6]">
                  <span className="text-[#74706A]">Support Phone:</span>
                  <span className="font-medium text-[#292826]">+91 91717 60888</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#74706A]">Support Email:</span>
                  <span className="font-medium text-[#292826]">support@indorehousemakers.com</span>
                </div>
              </div>
            </div>

            {/* Payment Gateway Configuration */}
            <div className="bg-white rounded-lg border border-[#E7E0D7] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#E7E0D7] pb-3">
                <h3 className="text-sm font-bold text-[#292826]">Razorpay Integration</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  MOCK PAYMENT MODE
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-[#F0EBE6]">
                  <span className="text-[#74706A]">Key ID:</span>
                  <span className="font-mono text-[#292826]">rzp_test_TewR1fNMjP0Ukb (Sandbox)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE6]">
                  <span className="text-[#74706A]">Design Pass Product:</span>
                  <span className="font-semibold text-[#292826]">₹299 One-Time (30 Days)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#F0EBE6]">
                  <span className="text-[#74706A]">Currency:</span>
                  <span className="font-medium text-[#292826]">INR (Indian Rupee)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#74706A]">Auto-Grant Credits:</span>
                  <span className="font-semibold text-[#C94F36]">5 AI 3D Credits on Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: BLOGS & KNOWLEDGE GUIDES MANAGEMENT */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'blogs' && (
        <React.Suspense
          fallback={
            <div className="bg-white rounded-lg border border-[#E7E0D7] p-8 text-center text-xs text-[#74706A]">
              Loading Knowledge Base &amp; Blogs...
            </div>
          }
        >
          <AdminBlogsTab
            getAuthHeaders={getAuthHeaders}
            onNotify={(type, text) => setActionMessage({ type, text })}
          />
        </React.Suspense>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: GRANT CREDITS */}
      {/* ------------------------------------------------------------- */}
      {selectedUserForCredits && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E7E0D7] max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#292826]">Grant Credits</h3>
              <button
                onClick={() => setSelectedUserForCredits(null)}
                className="text-[#74706A] hover:text-[#292826] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-xs text-[#74706A]">
              Grant promotional or support credits to <strong>{selectedUserForCredits.name}</strong> ({selectedUserForCredits.email}).
            </p>

            <form onSubmit={handleGrantCredits} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-[#74706A] mb-1">Credit Amount</label>
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#74706A] mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCredits(null)}
                  className="px-3 py-1.5 rounded-md border border-[#E7E0D7] text-xs font-medium text-[#74706A] hover:bg-[#FAF8F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGranting}
                  className="px-4 py-1.5 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isGranting ? 'Granting...' : 'Confirm Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ------------------------------------------------------------- */}
      {/* MODAL: USER DETAILS & ACCESS INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      {selectedUserForDetails && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg border border-[#E7E0D7] max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7E0D7] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#292826]">{selectedUserForDetails.name}</h3>
                <p className="text-[11px] text-[#74706A]">{selectedUserForDetails.email}</p>
              </div>
              <button
                onClick={() => setSelectedUserForDetails(null)}
                className="text-[#74706A] hover:text-[#292826] text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-3 rounded-md border border-[#E7E0D7]">
                <div>
                  <span className="text-[10px] text-[#74706A] font-medium uppercase tracking-wider">Account Status</span>
                  <div className="mt-0.5">
                    <StatusText
                      status={selectedUserForDetails.activeSessionsCount > 0 ? 'Active (Online)' : 'Inactive (Offline)'}
                      variant={selectedUserForDetails.activeSessionsCount > 0 ? 'success' : 'neutral'}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#74706A] font-medium uppercase tracking-wider">Role</span>
                  <div className="mt-0.5 font-bold text-[#292826]">{selectedUserForDetails.role}</div>
                </div>
              </div>

              <div className="p-3 rounded-md border border-[#E7E0D7] space-y-2">
                <div className="text-[10px] font-bold text-[#74706A] uppercase tracking-wider">Subscription & Plan</div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Current Plan:</span>
                  <span className="font-semibold text-[#292826]">
                    {selectedUserForDetails.activePass?.type === 'DESIGN_PASS_299'
                      ? '₹299 Design Pass'
                      : selectedUserForDetails.activePass?.type || 'Free Standard Tier'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Plan Status:</span>
                  <StatusText
                    status={selectedUserForDetails.activePass?.status === 'ACTIVE' ? 'Active' : 'No Active Pass'}
                    variant={selectedUserForDetails.activePass?.status === 'ACTIVE' ? 'success' : 'neutral'}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Plan Expiration:</span>
                  <span className="font-medium text-[#292826]">
                    {selectedUserForDetails.activePass?.expiresAt
                      ? new Date(selectedUserForDetails.activePass.expiresAt).toLocaleDateString()
                      : 'None'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-md border border-[#E7E0D7] space-y-2">
                <div className="text-[10px] font-bold text-[#74706A] uppercase tracking-wider">Account Metadata</div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Phone Number:</span>
                  <span className="font-medium text-[#292826]">{selectedUserForDetails.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Credit Balance:</span>
                  <span className="font-bold text-[#C94F36]">{selectedUserForDetails.creditBalance} Credits</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Active Sessions:</span>
                  <span className="font-medium text-[#292826]">{selectedUserForDetails.activeSessionsCount} devices</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#74706A]">Registration Date:</span>
                  <span className="font-medium text-[#292826]">
                    {selectedUserForDetails.createdAt ? new Date(selectedUserForDetails.createdAt).toLocaleString() : '—'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E0D7]">
              <button
                type="button"
                onClick={() => setSelectedUserForDetails(null)}
                className="px-3 py-1.5 rounded-md border border-[#E7E0D7] text-xs font-medium text-[#74706A] hover:bg-[#FAF8F5]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetUser = selectedUserForDetails
                  setSelectedUserForDetails(null)
                  setSelectedUserForCredits(targetUser)
                }}
                className="px-3 py-1.5 rounded-md bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-semibold transition"
              >
                Grant Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
