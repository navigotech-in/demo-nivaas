import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Icons } from '../components/Icons'
import { useAuth } from '../lib/authContext'

export default function AdminSetupPage() {
  const navigate = useNavigate()
  const { refreshAuth } = useAuth()
  const [checking, setChecking] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [setupSecret, setSetupSecret] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkSetupStatus() {
      try {
        const res = await fetch('/api/v1/auth/setup-status')
        const json = await res.json()
        setIsAllowed(json.data?.isSetupAllowed ?? false)
      } catch {
        setIsAllowed(false)
      } finally {
        setChecking(false)
      }
    }
    checkSetupStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/v1/auth/setup-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          password,
          setupSecret,
        }),
      })

      const json = await res.json()
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Admin initialization failed.')
      }

      await refreshAuth()
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Initialization failed.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-[#FDFCF9] px-4">
        <div className="text-center text-xs font-semibold text-[#54504A]">
          Checking system initialization status...
        </div>
      </div>
    )
  }

  if (!isAllowed) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-[#FDFCF9] px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-[#E7E0D7] bg-white p-7 shadow-sm text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <Icons.ShieldCheck size={24} />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-[#292826]">
            Admin Setup Closed
          </h2>
          <p className="mt-2 text-xs text-[#54504A] leading-relaxed">
            The primary Administrator account for Indore House Makers has already been configured and locked. Further administrator accounts can only be authorized from within the Admin Panel.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-lg bg-[#E76F2E] px-4 py-2 text-xs font-bold text-white hover:bg-[#C65320] transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#FDFCF9] px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-[#E7E0D7] bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#EEE9E3] pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E76F2E] text-white shadow-xs">
            <Icons.ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-[#292826]">
              One-Time Administrator Setup
            </h1>
            <p className="text-xs text-[#54504A]">
              Indore House Makers Architecture &amp; Engineering Platform
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
              Administrator Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Lead Architect Admin"
              className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                Official Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@indorehousemakers.in"
                className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                Mobile Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                Master Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
              Deployment Setup Secret Key
            </label>
            <input
              type="password"
              required
              value={setupSecret}
              onChange={(e) => setSetupSecret(e.target.value)}
              placeholder="Enter SETUP_SECRET from environment"
              className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-xs font-semibold text-[#292826] outline-none focus:border-[#E76F2E] focus:bg-white"
            />
            <p className="mt-1 text-[11px] text-[#54504A]">
              Verified on the server to prevent unauthorized first-user takeovers.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#E76F2E] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#C65320] transition disabled:opacity-50"
          >
            {loading ? 'Initializing Administrator...' : 'Bootstrap Primary Administrator →'}
          </button>
        </form>
      </div>
    </div>
  )
}
