import { useState } from 'react'
import { submitLead } from '../lib/api'
import { usePublicAuth } from '../lib/publicAuth'
import { Icons } from './Icons'
import CustomSelect from './CustomSelect'

interface ConsultModalProps {
  isOpen: boolean
  onClose: () => void
  initialRequirement?: string
  initialPlanDetails?: string
}

const statesList = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi NCR', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu & Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
]

const defaultRequirements = [
  '2D House Plan & Layout',
  '3D Front Elevation Design',
  'Complete Architectural Package',
  'Structural CAD Drawings',
  'Interior Design & 3D Renders',
  'Vastu Consultation',
  'Project Management & Site Supervision',
  'Cost Estimation & Construction',
]

export default function ConsultModal({
  isOpen,
  onClose,
  initialRequirement,
  initialPlanDetails,
}: ConsultModalProps) {
  const { user } = usePublicAuth()
  const isAdmin = user?.role === 'ADMIN'

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone?.replace(/\D/g, '').slice(-10) || '',
    email: user?.email || '',
    city: '',
    state: 'Madhya Pradesh',
    requirement: initialRequirement || defaultRequirements[0],
    message: initialPlanDetails || '',
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const finalName = isAdmin ? `[ADMIN TEST] ${form.name || user?.name || 'Admin'}` : form.name
      const finalMessage = isAdmin
        ? `[TEST PREVIEW LEAD - NOT REAL CUSTOMER] ${form.message}`
        : form.message

      await submitLead({
        name: finalName,
        phone: form.phone || (isAdmin ? '9999999999' : ''),
        email: form.email.trim() || user?.email,
        city: `${form.city || 'Indore'}, ${form.state}`,
        requirement: form.requirement,
        message: finalMessage,
      })
      setSuccess(true)
    } catch {
      setError('Something went wrong submitting your request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSuccess(false)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-2.5 sm:p-4 animate-fadeIn">
      <div
        className="relative max-h-[92dvh] sm:max-h-[90vh] w-full max-w-xl mx-auto flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.9),0_0_0_1px_rgba(255,255,255,0.4)] border border-white/60 animate-scaleUp my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Admin Preview Mode Notice */}
        {isAdmin && (
          <div className="bg-[#292826] text-white px-3 sm:px-5 py-2 text-xs flex items-center justify-between border-b border-black/20 min-w-0 gap-2 shrink-0">
            <span className="flex items-center gap-1.5 font-bold text-amber-400 truncate">
              <Icons.Shield size={13} className="shrink-0" />
              Admin Test Preview Mode
            </span>
            <span className="text-[11px] text-[#C5BFB8] truncate shrink-0">
              [TEST LEAD]
            </span>
          </div>
        )}

        {/* Modal Header */}
          <div className="flex items-center justify-between gap-2.5 border-b border-[#E7E0D7]/60 bg-gradient-to-r from-[#FFF6E8]/90 via-white/80 to-[#FFF6E8]/90 backdrop-blur-xl px-3.5 sm:px-6 py-3 sm:py-4 shrink-0 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
              <span className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C65320] text-white font-bold text-sm shadow-[0_4px_12px_rgba(231,111,46,0.4)] border border-white/40 shrink-0">
                <Icons.Blueprint size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xs sm:text-base md:text-lg font-bold text-[#292826] leading-tight truncate">
                  Consult With Home Design Experts
                </h3>
                <p className="text-[9px] sm:text-xs text-[#54504A] font-medium leading-tight truncate">Free consultation · 1-on-1 architect guidance</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[#54504A] hover:bg-white hover:text-[#292826] transition shadow-xs border border-[#E7E0D7] sm:border-transparent hover:border-[#E7E0D7] cursor-pointer shrink-0 bg-white/70 sm:bg-transparent"
              aria-label="Close modal"
            >
              <Icons.Close size={16} />
            </button>
          </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-6 pb-6 bg-white/40 backdrop-blur-md overflow-y-auto overscroll-contain min-w-0 flex-1">
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1ECE5] text-[#B84718] text-2xl font-bold shadow-sm">
                <Icons.Check size={28} />
              </div>
              <h4 className="mt-4 font-display text-2xl font-bold text-[#292826]">
                Consultation Booked!
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-sm mx-auto">
                Thank you, <span className="font-bold text-[#292826]">{form.name}</span>. A senior Indore House Makers architect will contact you on <span className="font-bold text-[#292826]">{form.phone}</span> within 2 hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex rounded-lg bg-[#B84718] px-7 py-2.5 text-xs font-bold text-white shadow hover:bg-[#9E3A10] cursor-pointer"
              >
                Close &amp; Browse Plans
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4 text-[#292826] min-w-0 w-full">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {initialPlanDetails && (
                <div className="rounded-xl bg-[#FFF6E8] p-3 text-xs text-[#1F2937] border border-[#E76F2E]/40 font-medium shadow-2xs break-words">
                  <span className="font-extrabold text-[#B84718]">Selected Specs:</span> {initialPlanDetails}
                </div>
              )}

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full box-border rounded-lg border border-[#D1C9BE] bg-white pl-10 pr-3 py-2.5 text-xs sm:text-sm text-black font-medium outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/20"
                  />
                  <div className="absolute left-3.5 top-3 text-[#1F2937] pointer-events-none">
                    <Icons.User size={15} />
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                  Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <div className="flex w-full min-w-0 rounded-lg border border-[#D1C9BE] bg-white focus-within:border-[#E76F2E] focus-within:ring-2 focus-within:ring-[#E76F2E]/20 box-border overflow-hidden">
                  <span className="inline-flex items-center px-3 text-xs font-bold text-[#1F2937] border-r border-[#D1C9BE] bg-[#FFF6E8] shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    className="w-full min-w-0 flex-1 px-3 py-2.5 text-xs sm:text-sm text-black font-medium outline-none bg-transparent box-border"
                  />
                </div>
              </div>

              <div className="min-w-0">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                  Email Address <span className="text-gray-400 font-normal lowercase">(for estimate & blueprint copies)</span>
                </label>
                <div className="relative w-full">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. yourname@gmail.com"
                    className="w-full box-border rounded-lg border border-[#D1C9BE] bg-white pl-10 pr-3 py-2.5 text-xs sm:text-sm text-black font-medium outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/20"
                  />
                  <div className="absolute left-3.5 top-3 text-[#1F2937] pointer-events-none">
                    <Icons.Mail size={15} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="min-w-0 w-full">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Indore"
                    className="w-full max-w-full box-border rounded-lg border border-[#D1C9BE] bg-white px-3 py-2.5 text-xs sm:text-sm text-black font-medium outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/20"
                  />
                </div>
                <div className="min-w-0 w-full">
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                    State <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    value={form.state}
                    options={statesList}
                    onChange={(st) => setForm({ ...form, state: st })}
                    placeholder="Select State"
                    className="border-[#D1C9BE] text-black font-medium"
                  />
                </div>
              </div>

              <div className="min-w-0 w-full">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                  Service Requirement
                </label>
                <CustomSelect
                  value={form.requirement}
                  options={defaultRequirements}
                  onChange={(req) => setForm({ ...form, requirement: req })}
                  placeholder="Select Service Requirement"
                  className="border-[#D1C9BE] text-black font-medium"
                />
              </div>

              <div className="min-w-0 w-full">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#1F2937]">
                  Plot Dimensions / Specific Notes
                </label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="e.g. 30x50 plot, East facing, need 3 BHK duplex with car parking"
                  className="w-full max-w-full box-border rounded-lg border border-[#D1C9BE] bg-white px-3 py-2 text-xs sm:text-sm text-black font-medium outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/20 resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#B84718] via-[#C94F36] to-[#B84718] py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? 'Submitting...' : 'Book Free Online Consultation →'}
              </button>

              <p className="text-center text-xs text-[#1F2937] font-semibold">
                🔒 Protected by 256-bit SSL encryption. Zero spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
