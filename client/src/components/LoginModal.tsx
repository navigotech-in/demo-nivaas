import React, { useState } from 'react'
import { Icons } from './Icons'
import { useAuth } from '../lib/authContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { user, login, signup, logout, isAuthenticated, isAdmin } = useAuth()
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN')
  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(identifier, password)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signup({ name, email, password, phone })
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async (type: 'USER' | 'ADMIN') => {
    setError(null)
    setLoading(true)
    try {
      if (type === 'ADMIN') {
        await login('admin@indorehousemakers.in', 'Admin@IndoreHouse2026!')
      } else {
        await login('user@indorehousemakers.in', 'User@IndoreHouse2026!')
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1815]/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-[#E7E0D7] text-[#292826] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEE9E3] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E76F2E] text-white font-bold text-xs shadow-sm">
              <Icons.User size={16} />
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#292826]">
                {isAuthenticated
                  ? 'Account Overview'
                  : mode === 'LOGIN'
                  ? 'Sign In to Indore House Makers'
                  : 'Create User Account'}
              </h3>
              <p className="text-[11px] text-[#54504A]">
                {isAuthenticated
                  ? `Logged in as ${user?.role}`
                  : 'Vastu Floor Plans, 3D Elevations & AI Studio'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#54504A] hover:bg-[#FFF6E8] hover:text-[#292826] transition"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="py-3">
          {isAuthenticated && user ? (
            /* Logged In State */
            <div className="space-y-4 py-2">
              <div className="rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] p-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#292826] flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {user.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                      isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="mt-2 text-xs text-[#54504A] space-y-1">
                  <div>
                    <span className="font-semibold text-[#292826]">Email:</span> {user.email}
                  </div>
                  {user.phone && (
                    <div>
                      <span className="font-semibold text-[#292826]">Phone:</span> {user.phone}
                    </div>
                  )}
                </div>

                {/* Pass & Credits Badge */}
                <div className="mt-3 rounded-lg border border-[#E76F2E]/30 bg-[#FFF6E8] p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#292826]">
                    <span>₹299 30-Day Design Pass</span>
                    <span className="text-[#E76F2E]">
                      {user.totalCredits} AI Credits Left
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#54504A]">
                    {user.activePass
                      ? `Valid until ${new Date(user.activePass.expiresAt).toLocaleDateString()}`
                      : 'No active pass. Subscribe for 5 AI credits & HD renders.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 rounded-xl bg-[#E76F2E] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#C65320] transition"
                >
                  Continue Browsing
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout()
                  }}
                  className="rounded-xl border border-[#E7E0D7] bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : mode === 'LOGIN' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@email.com or 10-digit mobile"
                  className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#E76F2E] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#C65320] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In →'}
              </button>

              {/* Quick Demo Logins for Pair Programming & Testing */}
              <div className="rounded-xl border border-dashed border-[#E7E0D7] bg-[#FFFBF4] p-2.5 text-center">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-[#54504A] mb-1.5">
                  ⚡ Quick Demo Accounts
                </span>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('USER')}
                    disabled={loading}
                    className="rounded-lg border border-[#E7E0D7] bg-white px-2.5 py-1 text-[11px] font-bold text-[#292826] hover:border-[#E76F2E]"
                  >
                    👤 Demo User (₹299 Pass)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('ADMIN')}
                    disabled={loading}
                    className="rounded-lg border border-[#E7E0D7] bg-white px-2.5 py-1 text-[11px] font-bold text-purple-700 hover:border-purple-600"
                  >
                    🛡️ Admin Panel
                  </button>
                </div>
              </div>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setMode('SIGNUP')
                  }}
                  className="text-xs font-semibold text-[#E76F2E] hover:underline"
                >
                  New here? Create an Account
                </button>
              </div>
            </form>
          ) : (
            /* Signup Form */
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#54504A]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Verma"
                  className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#54504A]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#54504A]">
                    Mobile (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#54504A]">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#E76F2E] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#C65320] disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Register Account →'}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setMode('LOGIN')
                  }}
                  className="text-xs font-semibold text-[#E76F2E] hover:underline"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
