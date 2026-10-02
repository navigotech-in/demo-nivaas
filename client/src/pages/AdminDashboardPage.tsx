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

export default function AdminDashboardPage() {
  const { user, getAuthHeaders, isAuthenticated, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'users' | 'leads' | 'audit'>('overview')

  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [users, setUsers] = useState<AdminUserItem[]>([])
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [leads, setLeads] = useState<AdminLeadItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Credit Grant Modal State
  const [selectedUserForCredits, setSelectedUserForCredits] = useState<AdminUserItem | null>(null)
  const [creditAmount, setCreditAmount] = useState('100')
  const [creditReason, setCreditReason] = useState('Promotional Grant')
  const [isGranting, setIsGranting] = useState(false)

  const fetchOverviewAndLeads = async () => {
    try {
      const [overviewRes, leadsRes, auditRes] = await Promise.all([
        fetch('/api/v1/admin/overview', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/v1/admin/leads', { headers: getAuthHeaders(), credentials: 'include' }),
        fetch('/api/v1/admin/audit-logs', { headers: getAuthHeaders(), credentials: 'include' }),
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

  const subscribedUsers = users.filter((u) => u.activePass !== null)
  const activeSubscribedCount = users.filter((u) => u.activePass?.status === 'ACTIVE').length

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Icons.LayoutGrid size={16} />,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions / Passes',
      icon: <Icons.Award size={16} />,
      badge: metrics?.activePasses ?? activeSubscribedCount,
      onClick: () => setActiveTab('subscriptions'),
      active: activeTab === 'subscriptions',
    },
    {
      id: 'users',
      label: 'Users Directory',
      icon: <Icons.Users size={16} />,
      badge: userTotal || metrics?.totalUsers || 0,
      onClick: () => setActiveTab('users'),
      active: activeTab === 'users',
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
      id: 'audit',
      label: 'Audit & Ledger',
      icon: <Icons.FileText size={16} />,
      onClick: () => setActiveTab('audit'),
      active: activeTab === 'audit',
    },
  ]

  return (
    <DashboardLayout
      title="Admin Command Center"
      badgeText="ADMIN"
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
          <button onClick={() => setActionMessage(null)} className="ml-2 font-bold">
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
                className="px-3 py-1.5 rounded-md border border-[#E7E0D7] hover:bg-[#FAF8F5] text-xs font-medium text-[#292826] flex items-center gap-1.5 transition"
              >
                <Icons.RefreshCw size={13} />
                <span>Refresh Data</span>
              </button>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Total Registered Users"
              value={metrics?.totalUsers ?? users.length}
              subtext="Platform accounts"
              icon={<Icons.Users size={18} />}
            />
            <MetricCard
              label="Active Passes"
              value={metrics?.activePasses ?? 0}
              subtext="₹299 Design Passes"
              icon={<Icons.Award size={18} />}
            />
            <MetricCard
              label="Active Sessions"
              value={metrics?.activeSessions ?? 0}
              subtext="Logged-in devices"
              icon={<Icons.Shield size={18} />}
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: SUBSCRIPTIONS & PASSES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-6">
          <PageHeader
            title="Subscriptions & Access Passes"
            subtitle="Overview of all active ₹299 Design Passes, subscribed users, and credit allocations."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active Subscriptions"
              value={metrics?.activePasses ?? activeSubscribedCount}
              subtext="Current active design passes"
              icon={<Icons.Award size={18} />}
            />
            <MetricCard
              label="Total Subscribed Members"
              value={subscribedUsers.length}
              subtext="Users with active or previous passes"
              icon={<Icons.Users size={18} />}
            />
            <MetricCard
              label="Primary Plan"
              value="₹299 / Month"
              subtext="5 High-Res AI Generations / Pass"
              icon={<Icons.Coins size={18} />}
            />
            <MetricCard
              label="Credits Issued"
              value={`${metrics?.totalCreditsIssued ?? 0} Credits`}
              subtext="Granted across all passes"
              icon={<Icons.CreditCard size={18} />}
            />
          </div>

          <DataTable<AdminUserItem>
            data={subscribedUsers}
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
                    {u.activePass?.type === 'DESIGN_PASS_299' ? '₹299 Design Pass' : u.activePass?.type || 'Standard Pass'}
                  </span>
                ),
              },
              {
                header: 'Status',
                accessor: (u) => (
                  <StatusText
                    status={u.activePass?.status === 'ACTIVE' ? 'Active' : 'Expired'}
                    variant={u.activePass?.status === 'ACTIVE' ? 'success' : 'neutral'}
                  />
                ),
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
                  <button
                    onClick={() => setSelectedUserForCredits(u)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#C94F36] bg-[#FFF6E8] hover:bg-[#ffeecf] border border-[#E7E0D7] transition"
                  >
                    Grant Credits
                  </button>
                ),
              },
            ]}
            emptyState={
              <EmptyState
                title="No active subscriptions yet"
                description="When clients purchase the ₹299 Design Pass or receive promotional access, they will be listed here."
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
                header: 'Name & Email',
                accessor: (u) => (
                  <div>
                    <div className="font-semibold text-[#292826]">{u.name}</div>
                    <div className="text-[11px] text-[#74706A]">{u.email}</div>
                  </div>
                ),
              },
              {
                header: 'Phone',
                accessor: (u) => u.phone || '—',
              },
              {
                header: 'Role',
                accessor: (u) => (
                  <span
                    className={`text-[11px] font-semibold ${
                      u.role === 'ADMIN' ? 'text-[#C94F36]' : 'text-[#74706A]'
                    }`}
                  >
                    {u.role}
                  </span>
                ),
              },
              {
                header: 'Pass Status',
                accessor: (u) => (
                  <StatusText
                    status={u.activePass?.status === 'ACTIVE' ? 'Pass Active' : 'No Pass'}
                    variant={u.activePass?.status === 'ACTIVE' ? 'success' : 'neutral'}
                  />
                ),
              },
              {
                header: 'Credits',
                accessor: (u) => (
                  <span className="font-semibold text-[#292826]">{u.creditBalance ?? 0}</span>
                ),
              },
              {
                header: 'Actions',
                align: 'right',
                accessor: (u) => (
                  <button
                    onClick={() => setSelectedUserForCredits(u)}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold text-[#C94F36] bg-[#FFF6E8] hover:bg-[#ffeecf] border border-[#E7E0D7] transition"
                  >
                    Grant Credits
                  </button>
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
                  className="px-3 py-1 rounded-md border border-[#E7E0D7] disabled:opacity-40 hover:bg-[#FAF8F5]"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(userPage + 1)}
                  disabled={userPage >= userTotalPages}
                  className="px-3 py-1 rounded-md border border-[#E7E0D7] disabled:opacity-40 hover:bg-[#FAF8F5]"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: LEADS & INQUIRIES */}
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
      {/* TAB 4: AUDIT LOGS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <PageHeader
            title="Audit & Transaction Ledger"
            subtitle="Immutable system transaction logs and credit events."
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
                header: 'User',
                accessor: (log) => log.user?.name || log.userId || 'System',
              },
              {
                header: 'Event Type',
                accessor: (log) => <span className="font-medium text-[#292826]">{log.type}</span>,
              },
              {
                header: 'Amount / Value',
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
                icon={<Icons.FileText size={24} />}
              />
            }
          />
        </div>
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
    </DashboardLayout>
  )
}
