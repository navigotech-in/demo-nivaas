import { useState } from 'react'
import { Icons } from './Icons'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [mobile, setMobile] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (mobile.length < 10) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setOtpSent(true)
    }, 600)
  }

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setLoggedIn(true)
    }, 600)
  }

  const handleClose = () => {
    setOtpSent(false)
    setLoggedIn(false)
    setMobile('')
    setOtp('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0EA5E9]/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-300 text-slate-800">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-700 text-white font-bold text-xs shadow">
              <Icons.User size={16} />
            </span>
            <h3 className="font-display text-lg font-bold text-slate-900">
              {loggedIn ? 'Welcome to NIVAAS' : otpSent ? 'Enter OTP Verification' : 'Sign In / Register'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        <div className="py-4">
          {loggedIn ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-2xl font-bold shadow-sm">
                <Icons.Check size={28} />
              </div>
              <h4 className="mt-3 font-display text-xl font-bold text-slate-900">Logged In Successfully</h4>
              <p className="mt-1 text-xs text-slate-600 max-w-xs mx-auto">
                Welcome back! You can now track your enquiries, save favorite plans and download CAD samples.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-5 w-full rounded-xl bg-slate-700 py-3 text-sm font-bold text-white shadow-md hover:bg-[#0EA5E9]"
              >
                Continue Browsing Plans
              </button>
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-xs text-slate-600">
                Enter your mobile number to access saved designs, project drawings and consultations.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mobile Number
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-slate-50 focus-within:border-slate-700 focus-within:bg-white">
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-slate-500 border-r border-slate-300 bg-slate-100 rounded-l-xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full rounded-r-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={mobile.length < 10 || loading}
                className="w-full rounded-xl bg-slate-700 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0EA5E9] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.Phone size={15} />
                <span>{loading ? 'Sending OTP...' : 'Get OTP on WhatsApp / SMS →'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-xs text-slate-600">
                We sent a 4-digit OTP to <span className="font-bold text-slate-900">+91 {mobile}</span>
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  4-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-xl border border-slate-300 bg-slate-50 py-3 text-slate-900 outline-none focus:border-slate-700 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={otp.length < 4 || loading}
                className="w-full rounded-xl bg-slate-700 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0EA5E9] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.Check size={16} />
                <span>{loading ? 'Verifying...' : 'Verify & Continue →'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
              >
                Change mobile number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
