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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1A1815]/70 p-4 ">
      <div className="relative w-full max-w-md overflow-hidden rounded-lg bg-white p-6 sm:p-7 shadow-sm border border-[#E7E0D7] text-[#292826]">
        <div className="flex items-center justify-between border-b border-[#EEE9E3] pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#E76F2E] text-white font-bold text-xs shadow">
              <Icons.User size={16} />
            </span>
            <h3 className="font-display text-lg font-bold text-[#292826]">
              {loggedIn ? 'Welcome to Indore House Maker\'s' : otpSent ? 'Enter OTP Verification' : 'Sign In / Register'}
            </h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#54504A] hover:bg-[#FFF6E8] hover:text-[#54504A] transition"
          >
            <Icons.Close size={16} />
          </button>
        </div>

        <div className="py-4">
          {loggedIn ? (
            <div className="py-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1ECE5] text-[#E76F2E] text-2xl font-bold shadow-sm">
                <Icons.Check size={28} />
              </div>
              <h4 className="mt-3 font-display text-xl font-bold text-[#292826]">Logged In Successfully</h4>
              <p className="mt-1 text-xs text-[#54504A] max-w-xs mx-auto">
                Welcome back! You can now track your enquiries, save favorite plans and download CAD samples.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-5 w-full rounded-lg bg-[#E76F2E] py-3 text-sm font-bold text-white shadow-sm hover:bg-[#C65320]"
              >
                Continue Browsing Plans
              </button>
            </div>
          ) : !otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-xs text-[#54504A]">
                Enter your mobile number to access saved designs, project drawings and consultations.
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Mobile Number
                </label>
                <div className="flex rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] focus-within:border-[#292826] focus-within:bg-white">
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-[#54504A] border-r border-[#E7E0D7] bg-[#FFF6E8] rounded-l-xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit number"
                    className="w-full rounded-r-xl px-3.5 py-2.5 text-sm font-semibold text-[#292826] outline-none bg-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={mobile.length < 10 || loading}
                className="w-full rounded-lg bg-[#E76F2E] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#C65320] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.Phone size={15} />
                <span>{loading ? 'Sending OTP...' : 'Get OTP on WhatsApp / SMS →'}</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-xs text-[#54504A]">
                We sent a 4-digit OTP to <span className="font-bold text-[#292826]">+91 {mobile}</span>
              </p>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  4-Digit OTP
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter OTP"
                  className="w-full text-center tracking-[0.4em] font-mono text-xl font-bold rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] py-3 text-[#292826] outline-none focus:border-[#292826] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={otp.length < 4 || loading}
                className="w-full rounded-lg bg-[#E76F2E] py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#C65320] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Icons.Check size={16} />
                <span>{loading ? 'Verifying...' : 'Verify & Continue →'}</span>
              </button>

              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-center text-xs font-semibold text-[#54504A] hover:text-[#292826] underline"
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
