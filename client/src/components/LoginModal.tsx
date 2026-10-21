import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Icons } from './Icons'
import CustomSelect from './CustomSelect'
import { useAuth } from '../lib/authContext'
import LogoutConfirmModal from './LogoutConfirmModal'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

const CITIES = [
  'Indore',
  'Bhopal',
  'Ujjain',
  'Dewas',
  'Pithampur',
  'Jabalpur',
  'Gwalior',
  'Other City',
]

const REQUIREMENTS = [
  'New House 2D/3D Floor Plan',
  '3D Elevation & Front Facade Design',
  'Turnkey House Construction & Supervision',
  'Vastu Planning & Municipal CAD Approval',
  'Interior Architecture & Renovation',
]

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login, loginWithOtp, sendOtp, forgotPassword, resetPassword, logout, isAuthenticated, isAdmin } = useAuth()

  const isAdminRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/setup-admin') ||
    location.pathname.startsWith('/setup/admin')

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'>('LOGIN')
  const [loginMethod, setLoginMethod] = useState<'OTP' | 'PASSWORD'>('OTP')

  // Common Fields
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Registration Extra Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('Indore')
  const [customCity, setCustomCity] = useState('')
  const [requirement, setRequirement] = useState('New House 2D/3D Floor Plan')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpDestination, setOtpDestination] = useState('')
  const [signupTargetPhone, setSignupTargetPhone] = useState('')
  const [cooldown, setCooldown] = useState(0)

  // Password Reset States
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [resetIdentifier, setResetIdentifier] = useState('')
  const [resetDestination, setResetDestination] = useState('')

  // Feedback & Loading
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [logoutModalOpen, setLogoutModalOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  // Resend cooldown timer
  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      setLogoutModalOpen(false)
      onClose()
      navigate('/', { replace: true })
      await logout()
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!isOpen) return null

  // 1. Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    const activePortal = isAdminRoute ? 'admin' : 'client'

    try {
      const loggedUser = await login(identifier.trim(), password, activePortal)

      if (isAdminRoute) {
        if (loggedUser.role !== 'ADMIN') {
          await logout()
          setError('Access Denied: Only authorized administrators can sign in here.')
          return
        }
        onClose()
        navigate('/admin')
      } else {
        if (loggedUser.role === 'ADMIN') {
          await logout()
          setError('Access restricted: This account cannot sign in from here.')
          return
        }
        onClose()
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // 2. Send OTP (for OTP Login)
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const target = mode === 'SIGNUP' ? (signupTargetPhone || phone.trim()) : identifier.trim()
    if (!target) {
      setError('Please enter your mobile number or email address.')
      return
    }

    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const res = await sendOtp(target, mode === 'SIGNUP' ? 'SIGNUP' : 'LOGIN')
      setOtpSent(true)
      setOtpDestination(res.destination)
      setCooldown(res.cooldownSeconds || 60)
      setSuccessMsg(res.message || `Verification code sent to ${res.destination}`)
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 3. Verify OTP (for both OTP Login & Registration)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = otpCode.trim().replace(/\D/g, '')
    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }

    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const target = mode === 'SIGNUP' ? signupTargetPhone : identifier.trim()
      const userName = mode === 'SIGNUP' ? name.trim() : undefined
      const userEmail = mode === 'SIGNUP' ? email.trim() : undefined
      const userPassword = mode === 'SIGNUP' ? password : undefined

      const loggedUser = await loginWithOtp(target, cleanCode, {
        name: userName,
        email: userEmail,
        password: userPassword,
      })

      if (isAdminRoute) {
        if (loggedUser.role !== 'ADMIN') {
          await logout()
          setError('Access Denied: Only authorized administrators can sign in here.')
          return
        }
        onClose()
        navigate('/admin')
      } else {
        if (loggedUser.role === 'ADMIN') {
          await logout()
          setError('Access restricted: This account cannot sign in from here.')
          return
        }
        onClose()
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP.')
    } finally {
      setLoading(false)
    }
  }

  // 4. Registration Submit -> Validates all fields & Dispatches OTP
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)

    if (isAdminRoute) {
      setError('Registration is not permitted here.')
      return
    }

    const trimmedName = name.trim()
    if (trimmedName.length < 2) {
      setError('Please enter your full name (minimum 2 characters).')
      return
    }

    const trimmedEmail = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    const trimmedPhone = phone.trim()
    if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both passwords are identical.')
      return
    }

    setLoading(true)
    try {
      const res = await sendOtp(trimmedPhone, 'SIGNUP')
      setSignupTargetPhone(trimmedPhone)
      setOtpSent(true)
      setOtpDestination(res.destination)
      setCooldown(res.cooldownSeconds || 60)
      setSuccessMsg(res.message || `Verification code sent to ${res.destination}. Enter the code below to complete your registration.`)
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch verification OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetOtp = () => {
    setOtpSent(false)
    setOtpCode('')
    setError(null)
    setSuccessMsg(null)
  }

  // 5. Request Password Reset Code
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const target = identifier.trim()
    if (!target) {
      setError('Please enter your registered email address or mobile number.')
      return
    }

    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const res = await forgotPassword(target)
      setResetIdentifier(target)
      setResetDestination(res.destination || target)
      setCooldown(60)
      setMode('RESET_PASSWORD')
      setSuccessMsg(res.message || `Password reset code sent to ${res.destination || target}`)
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch password reset code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 6. Reset Password Confirmation
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const cleanCode = resetCode.trim().replace(/\D/g, '')
    if (cleanCode.length !== 6) {
      setError('Please enter the complete 6-digit reset code.')
      return
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.')
      return
    }

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match. Please ensure both passwords are identical.')
      return
    }

    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const res = await resetPassword(resetIdentifier || identifier.trim(), cleanCode, newPassword)
      setSuccessMsg(res.message || 'Password reset successfully! Please sign in with your new password.')
      setMode('LOGIN')
      setLoginMethod('PASSWORD')
      setPassword('')
      setResetCode('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check your code and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSuccessMsg(null)
    setOtpSent(false)
    setOtpCode('')
    setResetCode('')
    setNewPassword('')
    setConfirmNewPassword('')
    setMode('LOGIN')
    onClose()
    if (!isAuthenticated && (isAdminRoute || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin'))) {
      navigate('/', { replace: true })
    }
  }

  return (
    <div className="fixed inset-0 z-[120000] flex items-center justify-center bg-black/65 p-2 sm:p-4 backdrop-blur-sm animate-fadeIn">
      <div
        className={`relative w-full ${
          mode === 'SIGNUP' && !otpSent ? 'max-w-xl sm:max-w-2xl' : 'max-w-md sm:max-w-lg'
        } max-h-[92dvh] sm:max-h-[88vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white shadow-2xl border border-[#E7E0D7] text-[#292826] overflow-hidden my-auto transition-all`}
      >
        {/* Header - Always pinned at top, never cuts off */}
        <div className="flex items-start justify-between px-4 py-3.5 sm:px-6 sm:py-4 border-b border-[#EEE9E3] shrink-0 bg-white">
          <div className="min-w-0 pr-2">
            <h3 className="text-lg sm:text-2xl font-black tracking-tight text-[#111827] truncate">
              {isAuthenticated
                ? isAdmin
                  ? 'Admin Command Center'
                  : 'My Account'
                : isAdminRoute
                ? 'Admin Sign In'
                : mode === 'LOGIN'
                ? 'Sign In to Your Account'
                : mode === 'SIGNUP'
                ? 'Create Your Account'
                : mode === 'FORGOT_PASSWORD'
                ? 'Reset Password'
                : 'Set New Password'}
            </h3>
            <p className="text-xs sm:text-[13px] text-[#6B7280] mt-0.5 line-clamp-1 sm:line-clamp-none">
              {isAuthenticated
                ? user?.email
                : isAdminRoute
                ? 'Authorized administrators only'
                : mode === 'LOGIN'
                ? 'Access your house designs, CAD drawings, and 3D elevations'
                : mode === 'SIGNUP'
                ? 'Register to access municipal-approved CAD sets, Vastu layouts & 3D elevations'
                : mode === 'FORGOT_PASSWORD'
                ? 'Enter your registered email or phone to receive a 6-digit code'
                : 'Enter the 6-digit code and choose a new password'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <Icons.Close size={18} />
          </button>
        </div>

        {/* Scrollable Content Body - Smooth scrolling on any screen height */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 pb-6 overscroll-contain min-w-0">
          {successMsg && mode !== 'RESET_PASSWORD' && !otpSent && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-medium text-emerald-800 leading-relaxed">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs sm:text-sm font-medium text-red-700 leading-relaxed">
              {error}
            </div>
          )}

          {isAuthenticated && user && !successMsg ? (
            /* Logged In View */
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#E7E0D7] bg-[#FAFAFA] p-5 text-sm text-[#374151] space-y-2.5">
                <div className="flex items-center justify-between font-bold text-base text-[#111827]">
                  <span>{user.name && user.name !== 'Client User' ? user.name : user.phone || 'My Account'}</span>
                  <span className="text-[11px] uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {user.role}
                  </span>
                </div>
                {user.email && !user.email.endsWith('@phone.indorehousemakers.com') ? (
                  <div><span className="font-semibold text-[#6B7280]">Email:</span> {user.email}</div>
                ) : (
                  <div><span className="font-semibold text-[#6B7280]">Email:</span> <span className="text-[#9CA3AF] italic">Not added yet</span></div>
                )}
                {user.phone && <div><span className="font-semibold text-[#6B7280]">Mobile:</span> {user.phone}</div>}
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  onClick={handleClose}
                  className="w-full text-center rounded-xl bg-[#B84718] py-3 text-sm font-bold text-white hover:bg-[#9E3A10] shadow-sm transition cursor-pointer"
                >
                  {isAdmin ? 'Go to Admin Command Center →' : 'Go to My Dashboard →'}
                </Link>
                <button
                  type="button"
                  onClick={() => setLogoutModalOpen(true)}
                  className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                >
                  Logout / Sign Out
                </button>
              </div>

              <LogoutConfirmModal
                isOpen={logoutModalOpen}
                onClose={() => setLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                isLoggingOut={isLoggingOut}
              />
            </div>
          ) : otpSent ? (
            /* OTP Verification Screen */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="flex items-center justify-between text-xs sm:text-sm text-[#4B5563] bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#111827]">Verification Code Dispatched</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ⏱️ Code valid for 5 min
                    </span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">
                    Sent to <strong>{otpDestination || identifier || signupTargetPhone}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetOtp}
                  className="text-[#B84718] text-xs font-bold hover:underline cursor-pointer ml-3 px-2 py-1 rounded hover:bg-[#FFF6E8] shrink-0"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-2 text-center">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setOtpCode(val)
                    if (error) setError(null)
                  }}
                  placeholder="· · · · · ·"
                  className="w-full text-center text-3xl font-black tracking-[0.3em] rounded-2xl border-2 border-[#D1D5DB] py-3.5 text-[#111827] outline-none focus:border-[#E76F2E] bg-[#FAFAFA] focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm px-1 text-[#6B7280]">
                  <span>
                    {cooldown > 0 ? (
                      <span className="text-amber-800 font-medium">⏳ Request new code in {cooldown}s</span>
                    ) : (
                      'Didn’t receive code?'
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={() => handleSendOtp()}
                    className="font-bold text-[#B84718] hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Resend OTP
                  </button>
                </div>
                <p className="text-[11px] text-[#9CA3AF] px-1">
                  Your OTP remains valid for 5 minutes. You can request a fresh code once the cooldown ends.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full rounded-xl bg-[#B84718] hover:bg-[#9E3A10] py-3.5 text-sm font-bold text-white transition shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Verifying...' : mode === 'SIGNUP' ? 'Verify & Complete Registration' : 'Verify & Sign In'}
              </button>
            </form>
          ) : mode === 'LOGIN' ? (
            /* Login View */
            <div>
              {/* Method Switcher Tabs */}
              {!isAdminRoute && (
                <div className="flex rounded-xl bg-[#F3F4F6] p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('OTP')
                      setError(null)
                      setSuccessMsg(null)
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer text-center ${
                      loginMethod === 'OTP'
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Login with OTP
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('PASSWORD')
                      setError(null)
                      setSuccessMsg(null)
                    }}
                    className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition cursor-pointer text-center ${
                      loginMethod === 'PASSWORD'
                        ? 'bg-white text-[#111827] shadow-sm'
                        : 'text-[#6B7280] hover:text-[#111827]'
                    }`}
                  >
                    Login with Password
                  </button>
                </div>
              )}

              {/* OTP Login Form */}
              {!isAdminRoute && loginMethod === 'OTP' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1.5">
                      Mobile Number or Email Address
                    </label>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="e.g. 7898561191 or your@email.com"
                      className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !identifier.trim()}
                    className="w-full rounded-xl bg-[#B84718] hover:bg-[#9E3A10] py-3.5 text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {loading ? 'Sending Code...' : 'Send Verification OTP'}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null)
                        setSuccessMsg(null)
                        setMode('SIGNUP')
                      }}
                      className="text-xs sm:text-sm text-[#6B7280] hover:text-[#E76F2E] cursor-pointer"
                    >
                      New to Indore House Makers? <span className="font-bold text-[#B84718]">Create an Account</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* Password Login Form */
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1.5">
                      Email or Mobile Number
                    </label>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder={isAdminRoute ? 'admin@ihm.com' : 'e.g. name@example.com or 7898561191'}
                      className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs sm:text-sm font-bold text-[#374151]">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null)
                          setSuccessMsg(null)
                          setMode('FORGOT_PASSWORD')
                        }}
                        className="text-xs font-semibold text-[#E76F2E] hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (error) setError(null)
                        }}
                        placeholder="Enter password"
                        className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 pr-11 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                      >
                        {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-[#B84718] hover:bg-[#9E3A10] py-3.5 text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    {loading ? 'Signing In...' : isAdminRoute ? 'Sign In as Administrator' : 'Sign In'}
                  </button>

                  {!isAdminRoute && (
                    <div className="pt-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setError(null)
                          setSuccessMsg(null)
                          setMode('SIGNUP')
                        }}
                        className="text-xs sm:text-sm text-[#6B7280] hover:text-[#E76F2E] cursor-pointer"
                      >
                        New to Indore House Makers? <span className="font-bold text-[#B84718]">Create an Account</span>
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          ) : mode === 'FORGOT_PASSWORD' ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 leading-relaxed">
                Enter your registered email address or mobile number. We’ll send you a 6-digit verification code to securely reset your password.
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1.5">
                  Email or Mobile Number
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="e.g. name@example.com or 7898561191"
                  className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !identifier.trim()}
                className="w-full rounded-xl bg-[#B84718] hover:bg-[#9E3A10] py-3.5 text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Sending Code...' : 'Send Password Reset Code'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMsg(null)
                    setMode('LOGIN')
                  }}
                  className="text-xs sm:text-sm text-[#6B7280] hover:text-[#E76F2E] cursor-pointer font-medium"
                >
                  ← Back to Sign In
                </button>
              </div>
            </form>
          ) : mode === 'RESET_PASSWORD' ? (
            /* Reset Password Form */
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="flex items-center justify-between text-xs sm:text-sm text-[#4B5563] bg-[#F9FAFB] rounded-2xl p-4 border border-[#E5E7EB]">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#111827]">Reset Code Sent</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      ⏱️ Code valid for 10 min
                    </span>
                  </div>
                  <div className="text-xs text-[#6B7280] mt-1">
                    Sent to <strong>{resetDestination || identifier}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('FORGOT_PASSWORD')
                    setError(null)
                    setSuccessMsg(null)
                  }}
                  className="text-[#B84718] text-xs font-bold hover:underline cursor-pointer ml-3 px-2 py-1 rounded hover:bg-[#FFF6E8] shrink-0"
                >
                  Change
                </button>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-2 text-center">
                  Enter 6-Digit Reset Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoFocus
                  required
                  value={resetCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setResetCode(val)
                    if (error) setError(null)
                  }}
                  placeholder="· · · · · ·"
                  className="w-full text-center text-3xl font-black tracking-[0.3em] rounded-2xl border-2 border-[#D1D5DB] py-3.5 text-[#111827] outline-none focus:border-[#E76F2E] bg-[#FAFAFA] focus:bg-white transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs sm:text-sm px-1 text-[#6B7280]">
                  <span>
                    {cooldown > 0 ? (
                      <span className="text-amber-800 font-medium">⏳ Request new code in {cooldown}s</span>
                    ) : (
                      'Didn’t receive the code?'
                    )}
                  </span>
                  <button
                    type="button"
                    disabled={cooldown > 0 || loading}
                    onClick={async () => {
                      setError(null)
                      setSuccessMsg(null)
                      setLoading(true)
                      try {
                        const res = await forgotPassword(resetIdentifier || identifier.trim())
                        setCooldown(60)
                        setSuccessMsg(res.message || 'A fresh reset code has been sent.')
                      } catch (err: any) {
                        setError(err.message || 'Failed to resend code.')
                      } finally {
                        setLoading(false)
                      }
                    }}
                    className="font-bold text-[#B84718] hover:underline disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                  >
                    Resend Code
                  </button>
                </div>
                <p className="text-[11px] text-[#9CA3AF] px-1">
                  Your reset code remains valid for 10 minutes.
                </p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1.5">
                  New Password (minimum 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Min 8 characters (letters, numbers)"
                    className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 pr-11 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                  >
                    {showNewPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    value={confirmNewPassword}
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Re-enter new password"
                    className="w-full rounded-xl border border-[#D1D5DB] px-4 py-3 pr-11 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                  >
                    {showConfirmNewPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </button>
                </div>
                {confirmNewPassword && (
                  <p
                    className={`text-[10px] font-bold mt-1.5 ${
                      newPassword === confirmNewPassword ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {newPassword === confirmNewPassword ? '✓ Passwords match' : 'Passwords do not match'}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  resetCode.length !== 6 ||
                  newPassword.length < 8 ||
                  newPassword !== confirmNewPassword
                }
                className="w-full rounded-xl bg-[#B84718] hover:bg-[#9E3A10] py-3.5 text-sm font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {loading ? 'Updating Password...' : 'Reset Password & Sign In'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMsg(null)
                    setMode('LOGIN')
                  }}
                  className="text-xs sm:text-sm text-[#6B7280] hover:text-[#E76F2E] cursor-pointer font-medium"
                >
                  ← Cancel & Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            /* Registration View (Spacious 2-Column Responsive Layout) */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 sm:space-y-4 w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full">
                {/* 1. Full Name */}
                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="e.g. Dilshad Khan"
                    className="w-full min-w-0 max-w-full box-border rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                  />
                </div>

                {/* 2. Email Address */}
                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="dilshad@example.com"
                    className="w-full min-w-0 max-w-full box-border rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                  />
                </div>

                {/* 3. Mobile Number */}
                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    Mobile Number (10 Digits) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex w-full min-w-0 max-w-full">
                    <span className="inline-flex shrink-0 items-center px-3 rounded-l-xl border border-r-0 border-[#D1D5DB] bg-[#F9FAFB] text-xs font-bold text-[#4B5563]">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 10)
                        setPhone(val)
                        if (error) setError(null)
                      }}
                      placeholder="7898561191"
                      className="flex-1 min-w-0 w-full max-w-full box-border rounded-r-xl border border-[#D1D5DB] px-3 py-2.5 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                    />
                  </div>
                </div>

                {/* 4. City / Location */}
                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    City / Region <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={city}
                    options={CITIES}
                    onChange={setCity}
                    placeholder="Select City / Region"
                  />
                </div>
              </div>

              {/* Custom City if Other */}
              {city === 'Other City' && (
                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    Enter Your City Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter city or district"
                    className="w-full min-w-0 max-w-full box-border rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] transition"
                  />
                </div>
              )}

              {/* 5. Requirement Selection */}
              <div className="min-w-0 w-full">
                <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                  Primary Project Requirement
                </label>
                <CustomSelect
                  value={requirement}
                  options={REQUIREMENTS}
                  onChange={setRequirement}
                  placeholder="Select Project Requirement"
                />
              </div>

              {/* 6. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full">
                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    Create Password (min 8 chars) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full min-w-0 max-w-full">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="Min 8 characters"
                      className="w-full min-w-0 max-w-full box-border rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                    >
                      {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="min-w-0 w-full">
                  <label className="block text-xs sm:text-sm font-bold text-[#374151] mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative w-full min-w-0 max-w-full">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="Re-enter password"
                      className="w-full min-w-0 max-w-full box-border rounded-xl border border-[#D1D5DB] px-3.5 py-2.5 pr-10 text-xs sm:text-sm text-[#111827] outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#4B5563] cursor-pointer"
                    >
                      {showConfirmPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p
                      className={`text-[10px] font-bold mt-1 ${
                        password === confirmPassword ? 'text-emerald-600' : 'text-red-500'
                      }`}
                    >
                      {password === confirmPassword ? '✓ Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full min-w-0 max-w-full box-border rounded-xl bg-[#B84718] py-3.5 text-sm font-bold text-white transition hover:bg-[#9E3A10] shadow-sm disabled:opacity-50 cursor-pointer mt-2"
              >
                {loading ? 'Sending OTP to Verify...' : 'Send OTP & Create Account'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setError(null)
                    setSuccessMsg(null)
                    setMode('LOGIN')
                  }}
                  className="text-xs sm:text-sm text-[#6B7280] hover:text-[#E76F2E] cursor-pointer"
                >
                  Already have an account? <span className="font-bold text-[#B84718]">Sign In</span>
                </button>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 border-t border-[#EEE9E3] text-center text-[11px] text-[#9CA3AF]">
                🔒 100% Confidential · DLT Approved SMS Delivery · Vastu Compliant CAD Sets
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
