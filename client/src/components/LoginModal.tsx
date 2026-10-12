import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icons } from './Icons'
import { useAuth } from '../lib/authContext'
import LogoutConfirmModal from './LogoutConfirmModal'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const { user, login, signup, logout, isAuthenticated, isAdmin } = useAuth()
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN')
  const [identifier, setIdentifier] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      setLogoutModalOpen(false)
      onClose()
      navigate('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isOpen) return null

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value)
    if (error) setError(null)
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (error) setError(null)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError(null)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
    if (error) setError(null)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    if (error) setError(null)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)
    try {
      const loggedUser = await login(identifier.trim(), password)
      onClose()
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    const trimmedPhone = phone.trim()
    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    try {
      await signup({ name: name.trim(), email: email.trim(), password, phone: trimmedPhone })
      onClose()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccessMsg(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1815]/75 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 sm:p-7 shadow-2xl border border-[#E7E0D7] text-[#292826] transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EEE9E3] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${isAdmin ? 'bg-red-600' : 'bg-[#E76F2E]'} text-white font-bold text-xs shadow-sm`}>
              {isAdmin ? <Icons.Shield size={16} /> : <Icons.User size={16} />}
            </span>
            <div>
              <h3 className="font-display text-base font-bold text-[#292826]">
                {isAuthenticated
                  ? (isAdmin ? 'Admin Console' : 'Account Overview')
                  : mode === 'LOGIN'
                  ? 'Sign In to Indore House Makers'
                  : 'Create User Account'}
              </h3>
              <p className="text-[11px] text-[#54504A]">
                {isAuthenticated
                  ? `Logged in as ${user?.role}`
                  : 'Conceptual 2D Plans, 3D Elevations & AI Studio'}
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
          {successMsg && (
            <div className="mb-3 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5 animate-fadeIn">
              <Icons.Check size={14} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {isAuthenticated && user && !successMsg ? (
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
                      isAdmin ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
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

                {/* Pass & Credits Badge (for regular users) or Admin stats */}
                {!isAdmin && (
                  <div className="mt-3 rounded-lg border border-[#E76F2E]/30 bg-[#FFF6E8] p-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-[#292826]">
                      <span>₹299 30-Day Design Pass</span>
                      <span className="text-[#E76F2E]">
                        {user.totalCredits ?? 0} 3D Generation Credits
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#54504A]">
                      {user.activePass
                        ? `Valid until ${new Date(user.activePass.expiresAt).toLocaleDateString()}`
                        : 'No active pass. Subscribe for 5 3D generation credits.'}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {isAdmin ? (
                  <Link
                    to="/admin"
                    onClick={handleClose}
                    className="w-full text-center rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition flex items-center justify-center gap-1.5"
                  >
                    <Icons.Shield size={14} />
                    <span>Go to Admin Command Center →</span>
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    onClick={handleClose}
                    className="w-full text-center rounded-xl bg-[#292826] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-black transition flex items-center justify-center gap-1.5"
                  >
                    <Icons.LayoutGrid size={14} />
                    <span>Go to My Dashboard →</span>
                  </Link>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl bg-[#E76F2E] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#C65320] transition"
                  >
                    Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogoutModalOpen(true)}
                    className="rounded-xl border border-[#E7E0D7] bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    Logout
                  </button>
                </div>
              </div>

              <LogoutConfirmModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                isLoggingOut={isLoggingOut}
              />
            </div>
          ) : mode === 'LOGIN' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700 animate-fadeIn">
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
                  onChange={handleIdentifierChange}
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
                  onChange={handlePasswordChange}
                  placeholder="Enter password"
                  className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#E76F2E] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#C65320] disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Authenticating...' : 'Sign In →'}
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMsg(null)
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
                <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs font-semibold text-red-700 animate-fadeIn">
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
                  onChange={handleNameChange}
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
                  onChange={handleEmailChange}
                  placeholder="rahul@example.com"
                  className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-[#54504A]">
                    Mobile (10-Digit)
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={handlePhoneChange}
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
                    onChange={handlePasswordChange}
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
