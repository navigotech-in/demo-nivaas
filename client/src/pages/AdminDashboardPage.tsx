import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../lib/authContext'
import { Icons } from '../components/Icons'

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
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'leads' | 'audit'>('overview')

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
        fetch('/api/v1/admin/overview', { credentials: 'include' }),
        fetch('/api/v1/admin/leads', { credentials: 'include' }),
        fetch('/api/v1/admin/audit-logs', { credentials: 'include' }),
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
        { credentials: 'include' }
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
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchOverviewAndLeads(), fetchUsers(1, '')])
      setLoading(false)
    }
    init()
  }, [])

  // Handle Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setUserPage(1)
      fetchUsers(1, userSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [userSearch])

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
        headers: { 'Content-Type': 'application/json' },
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
          text: `Successfully granted ${creditAmount} credits to ${selectedUserForCredits.name}. New balance: ${json.data?.newBalance} credits.`,
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
        headers: { 'Content-Type': 'application/json' },
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

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl border border-[#E7E0D7] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[#292826] text-white flex items-center justify-center font-black text-xl shadow-md border border-[#292826]/20">
              👑
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-[#292826] tracking-tight">Admin Command Center</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black tracking-wider uppercase border border-amber-300">
                  ADMINISTRATOR
                </span>
              </div>
              <p className="text-xs text-[#74706A] mt-0.5">
                Logged in as <strong>{user?.name}</strong> ({user?.email}) • Phone:{' '}
                <strong>{user?.phone || 'N/A'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/dashboard"
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 h-10 rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] hover:bg-[#FFF6E8] text-xs font-bold text-[#292826] transition shadow-xs"
            >
              <Icons.User size={15} className="text-[#E76F2E]" />
              Switch to Client View
            </Link>
            <button
              onClick={() => logout()}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 h-10 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition border border-red-200"
            >
              <Icons.LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Global Notifications / Alert Banner */}
        {actionMessage && (
          <div
            className={`p-4 rounded-xl border text-xs font-medium flex items-center justify-between transition-all ${
              actionMessage.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span>{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)} className="font-bold underline text-[11px] ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E7E0D7] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'overview'
                ? 'bg-[#292826] text-white shadow-sm'
                : 'bg-white text-[#54504A] hover:bg-[#FFF6E8] border border-[#E7E0D7]'
            }`}
          >
            <Icons.Layers size={15} />
            System Overview
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'users'
                ? 'bg-[#292826] text-white shadow-sm'
                : 'bg-white text-[#54504A] hover:bg-[#FFF6E8] border border-[#E7E0D7]'
            }`}
          >
            <Icons.User size={15} />
            User Management Directory ({userTotal})
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'leads'
                ? 'bg-[#292826] text-white shadow-sm'
                : 'bg-white text-[#54504A] hover:bg-[#FFF6E8] border border-[#E7E0D7]'
            }`}
          >
            <Icons.Phone size={15} />
            Consultations & Leads ({leads.length})
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition shrink-0 ${
              activeTab === 'audit'
                ? 'bg-[#292826] text-white shadow-sm'
                : 'bg-white text-[#54504A] hover:bg-[#FFF6E8] border border-[#E7E0D7]'
            }`}
          >
            <Icons.Shield size={15} />
            Ledger & Security Audit
          </button>
        </div>

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

        {/* Tab 1: System Overview */}
        {!loading && activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#74706A] font-medium mb-2">
                  <span>TOTAL REGISTERED USERS</span>
                  <Icons.User size={16} className="text-[#E76F2E]" />
                </div>
                <div className="text-3xl font-black text-[#292826]">{metrics?.totalUsers ?? 0}</div>
                <div className="text-[11px] text-[#74706A] mt-1.5 flex items-center gap-2">
                  <span className="text-emerald-700 font-bold">{metrics?.totalCustomers ?? 0} Customers</span>
                  <span>•</span>
                  <span className="text-[#E76F2E] font-bold">{metrics?.totalAdmins ?? 0} Admins</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#74706A] font-medium mb-2">
                  <span>AI GENERATION JOBS</span>
                  <Icons.Sparkles size={16} className="text-[#E76F2E]" />
                </div>
                <div className="text-3xl font-black text-[#292826]">{metrics?.totalJobs ?? 0}</div>
                <p className="text-[11px] text-[#74706A] mt-1.5">Conceptual 2D & 3D plans</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#74706A] font-medium mb-2">
                  <span>ACTIVE LEADS & CALLS</span>
                  <Icons.Phone size={16} className="text-[#E76F2E]" />
                </div>
                <div className="text-3xl font-black text-[#292826]">{metrics?.leads.total ?? 0}</div>
                <div className="text-[11px] text-[#74706A] mt-1.5 flex items-center gap-1.5">
                  <span className="text-amber-700 font-bold">{metrics?.leads.NEW ?? 0} New</span>
                  <span>•</span>
                  <span className="text-blue-700 font-bold">{metrics?.leads.CONTACTED ?? 0} Contacted</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E7E0D7] shadow-xs">
                <div className="flex items-center justify-between text-xs text-[#74706A] font-medium mb-2">
                  <span>SYSTEM ROLE PRIVILEGES</span>
                  <Icons.CheckCircle size={16} className="text-emerald-600" />
                </div>
                <div className="text-lg font-black text-[#292826]">ADMINISTRATOR</div>
                <p className="text-[11px] text-[#74706A] mt-1.5">Full governance & oversight access</p>
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-xs">
                <h2 className="text-base font-black text-[#292826] mb-4 flex items-center gap-2">
                  <Icons.Layers size={18} className="text-[#E76F2E]" />
                  Recent User Registrations
                </h2>
                <div className="divide-y divide-[#E7E0D7]/60">
                  {users.slice(0, 5).map((u) => (
                    <div key={u.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-[#FFF6E8] text-[#E76F2E] font-black text-xs flex items-center justify-center border border-[#E76F2E]/20">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-[#292826]">{u.name}</p>
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9px] font-black ${
                                u.role === 'ADMIN' ? 'bg-amber-100 text-amber-900' : 'bg-stone-100 text-stone-700'
                              }`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#74706A]">
                            {u.email} • Phone: <strong>{u.phone || 'N/A'}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-[#E76F2E]">{u.creditBalance} Credits</span>
                        <p className="text-[10px] text-[#74706A]">{new Date(u.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && <p className="text-xs text-[#74706A] py-4">No users registered yet.</p>}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-[#E7E0D7] shadow-xs">
                <h2 className="text-base font-black text-[#292826] mb-4 flex items-center gap-2">
                  <Icons.Shield size={18} className="text-[#E76F2E]" />
                  Architecture & Security
                </h2>
                <div className="space-y-3 text-xs text-[#54504A]">
                  <div className="flex justify-between py-1.5 border-b border-[#E7E0D7]/60">
                    <span className="font-medium text-[#74706A]">PostgreSQL Database:</span>
                    <span className="font-bold text-emerald-700">Connected</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E7E0D7]/60">
                    <span className="font-medium text-[#74706A]">Auth Security:</span>
                    <span className="font-bold text-[#292826]">JWT + HttpOnly Family</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E7E0D7]/60">
                    <span className="font-medium text-[#74706A]">Ledger Consistency:</span>
                    <span className="font-bold text-[#292826]">ACID Transactions Only</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="font-medium text-[#74706A]">Active Sessions:</span>
                    <span className="font-bold text-[#292826]">{metrics?.activeSessions ?? 1} devices</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Directory */}
        {!loading && activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-[#E7E0D7] shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-[#292826] tracking-tight">Registered Users Directory</h2>
                <p className="text-xs text-[#74706A]">
                  Showing page {userPage} of {userTotalPages} ({userTotal} total registered accounts)
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Icons.Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#74706A]" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] text-xs focus:ring-2 focus:ring-[#E76F2E] outline-none"
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto border border-[#E7E0D7] rounded-xl">
              <table className="w-full text-left text-xs text-[#54504A]">
                <thead className="bg-[#FAF8F5] text-[#292826] font-bold border-b border-[#E7E0D7]">
                  <tr>
                    <th className="p-3.5">User Details</th>
                    <th className="p-3.5">Mobile Number</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Credit Balance</th>
                    <th className="p-3.5">Design Pass</th>
                    <th className="p-3.5">Joined On</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D7]">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FFF6E8]/30 transition">
                      <td className="p-3.5 font-bold text-[#292826]">
                        <div>{u.name}</div>
                        <div className="text-[11px] font-normal text-[#74706A]">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-medium text-[#292826]">{u.phone || '—'}</span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-blue-50 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3.5 font-black text-[#E76F2E]">
                        {u.creditBalance} Credits
                      </td>
                      <td className="p-3.5">
                        {u.activePass ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            ₹299 PASS ACTIVE
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#74706A]">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-[#74706A] text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedUserForCredits(u)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#292826] text-white text-[11px] font-bold hover:bg-[#E76F2E] transition shadow-xs"
                        >
                          <Icons.Sparkles size={12} />
                          Grant Credits
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-xs text-[#74706A]">
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Server-side Pagination Bar */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-[#74706A]">
                Page <strong>{userPage}</strong> of <strong>{userTotalPages}</strong>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(userPage - 1)}
                  disabled={userPage <= 1}
                  className="px-3 py-1.5 rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] hover:bg-[#FFF6E8] text-xs font-bold disabled:opacity-40 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(userPage + 1)}
                  disabled={userPage >= userTotalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] hover:bg-[#FFF6E8] text-xs font-bold disabled:opacity-40 transition"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Consultations & Leads */}
        {!loading && activeTab === 'leads' && (
          <div className="bg-white rounded-2xl border border-[#E7E0D7] shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#292826] tracking-tight">Customer Consultations & Leads</h2>
              <p className="text-xs text-[#74706A]">All online consultation and architectural design enquiries</p>
            </div>

            <div className="overflow-x-auto border border-[#E7E0D7] rounded-xl">
              <table className="w-full text-left text-xs text-[#54504A]">
                <thead className="bg-[#FAF8F5] text-[#292826] font-bold border-b border-[#E7E0D7]">
                  <tr>
                    <th className="p-3.5">Client Name</th>
                    <th className="p-3.5">Phone Number</th>
                    <th className="p-3.5">Service Requested</th>
                    <th className="p-3.5">Plot Size & Budget</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Status Pipeline</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D7]">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-[#FFF6E8]/30 transition">
                      <td className="p-3.5 font-bold text-[#292826]">
                        {lead.name}
                        {lead.email && <div className="text-[11px] font-normal text-[#74706A]">{lead.email}</div>}
                      </td>
                      <td className="p-3.5 font-mono font-medium text-[#292826]">{lead.phone}</td>
                      <td className="p-3.5 font-medium text-[#292826]">{lead.serviceType}</td>
                      <td className="p-3.5 text-[11px] text-[#74706A]">
                        {lead.plotSize || '—'} • {lead.budget || '—'}
                      </td>
                      <td className="p-3.5">{lead.city || 'Indore'}</td>
                      <td className="p-3.5 text-[#74706A] text-[11px]">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3.5">
                        <select
                          value={lead.status}
                          onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                          className={`text-[11px] font-bold rounded-lg px-2.5 py-1 border outline-none cursor-pointer ${
                            lead.status === 'NEW'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : lead.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-900 border-blue-300'
                              : lead.status === 'CONVERTED'
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-stone-100 text-stone-800 border-stone-300'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-xs text-[#74706A]">
                        No consultations or customer leads recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Ledger & Audit Logs */}
        {!loading && activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-[#E7E0D7] shadow-xs p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black text-[#292826] tracking-tight">Credit Ledger Audit Log</h2>
              <p className="text-xs text-[#74706A]">Immutable transaction history across all users in PostgreSQL</p>
            </div>

            <div className="overflow-x-auto border border-[#E7E0D7] rounded-xl">
              <table className="w-full text-left text-xs text-[#54504A]">
                <thead className="bg-[#FAF8F5] text-[#292826] font-bold border-b border-[#E7E0D7]">
                  <tr>
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Event Type</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D7]">
                  {auditLogs.map((tx) => (
                    <tr key={tx.id} className="hover:bg-[#FFF6E8]/30 transition">
                      <td className="p-3.5 font-mono text-[11px] text-[#74706A]">{tx.id.slice(0, 12)}...</td>
                      <td className="p-3.5 font-medium text-[#292826]">
                        {tx.user?.name || tx.userId}
                        {tx.user?.email && <div className="text-[10px] text-[#74706A]">{tx.user.email}</div>}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-800">
                          {tx.type}
                        </span>
                      </td>
                      <td
                        className={`p-3.5 font-black ${
                          tx.amount > 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                      </td>
                      <td className="p-3.5 text-[11px] text-[#74706A]">
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-xs text-[#74706A]">
                        No ledger transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Grant Credits Modal */}
      {selectedUserForCredits && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E7E0D7] p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-[#FFF6E8] text-[#E76F2E] flex items-center justify-center font-bold">
                  <Icons.Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#292826]">Grant Free AI Credits</h3>
                  <p className="text-xs text-[#74706A]">To: {selectedUserForCredits.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForCredits(null)}
                className="text-[#74706A] hover:text-[#292826] text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGrantCredits} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[#292826]">Credit Amount</label>
                  <span className="text-[10px] text-[#74706A]">Min 1, Max 1,000</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] text-xs font-bold focus:ring-2 focus:ring-[#E76F2E] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#292826] mb-1">Mandatory Audit Reason</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={255}
                  placeholder="e.g. Approved promotional gift or trial allowance"
                  value={creditReason}
                  onChange={(e) => setCreditReason(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] text-xs focus:ring-2 focus:ring-[#E76F2E] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUserForCredits(null)}
                  className="flex-1 h-11 rounded-xl border border-[#E7E0D7] text-xs font-bold hover:bg-[#FAF8F5] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGranting}
                  className="flex-1 h-11 rounded-xl bg-[#292826] text-white text-xs font-bold hover:bg-[#E76F2E] transition shadow-md disabled:opacity-50"
                >
                  {isGranting ? 'Granting...' : 'Confirm Grant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
