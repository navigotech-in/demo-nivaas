import { useState } from 'react'
import { submitLead } from '../lib/api'
import { Icons } from './Icons'

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
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    state: 'Telangana',
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
      await submitLead({
        name: form.name,
        phone: form.phone,
        city: `${form.city}, ${form.state}`,
        requirement: form.requirement,
        message: form.message,
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 backdrop-blur-md p-4 animate-fadeIn">
      <div
        className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white/90 backdrop-blur-3xl shadow-[0_30px_70px_rgba(0,0,0,0.45),inset_0_1.5px_2px_rgba(255,255,255,0.9),0_0_0_1px_rgba(255,255,255,0.4)] border border-white/60 animate-scaleUp"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/50 bg-gradient-to-r from-[#FFF6E8]/90 via-white/80 to-[#FFF6E8]/90 backdrop-blur-xl px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C65320] text-white font-bold text-sm shadow-[0_4px_12px_rgba(231,111,46,0.4)] border border-white/40">
              <Icons.Blueprint size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-[#292826]">
                Consult With Home Design Experts
              </h3>
              <p className="text-xs text-[#54504A] font-medium">Free consultation · 1-on-1 architect guidance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[#54504A] hover:bg-white/80 hover:text-[#292826] transition shadow-sm border border-transparent hover:border-white/50"
            aria-label="Close modal"
          >
            <Icons.Close size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-white/40 backdrop-blur-md">
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1ECE5] text-[#E76F2E] text-2xl font-bold shadow-sm">
                <Icons.Check size={28} />
              </div>
<h4 className="mt-4 font-display text-2xl font-bold text-[#292826]">
                Consultation Booked!
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-sm mx-auto">
                Thank you, <span className="font-bold text-[#292826]">{form.name}</span>. A senior NIVAAS architect will contact you on <span className="font-bold text-[#292826]">{form.phone}</span> within 2 hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex rounded-lg bg-[#E76F2E] px-7 py-2.5 text-xs font-bold text-white shadow hover:bg-[#C65320]"
              >
                Close & Browse Plans
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-[#292826]">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {initialPlanDetails && (
                <div className="rounded-lg bg-[#FFF6E8] p-3 text-xs text-[#E76F2E] border border-[#E7E0D7] font-medium">
                  <span className="font-bold">Selected Specs:</span> {initialPlanDetails}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] pl-10 pr-4 py-2.5 text-sm text-[#292826] outline-none focus:border-[#292826] focus:bg-white"
                  />
                  <div className="absolute left-3.5 top-3 text-[#54504A]">
                    <Icons.User size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] focus-within:border-[#292826] focus-within:bg-white">
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-[#54504A] border-r border-[#E7E0D7] bg-[#FFF6E8] rounded-l-xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-r-xl px-3.5 py-2.5 text-sm text-[#292826] outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2.5 text-sm text-[#292826] outline-none focus:border-[#292826] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3 py-2.5 text-sm text-[#292826] outline-none focus:border-[#292826] focus:bg-white"
                  >
                    {statesList.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Service Requirement
                </label>
                <select
                  value={form.requirement}
                  onChange={(e) => setForm({ ...form, requirement: e.target.value })}
                  className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3 py-2.5 text-sm text-[#292826] outline-none focus:border-[#292826] focus:bg-white"
                >
                  {defaultRequirements.map((req) => (
                    <option key={req} value={req}>
                      {req}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-[#54504A]">
                  Plot Dimensions / Specific Notes
                </label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="e.g. 30x50 plot, East facing, need 3 BHK duplex with car parking"
                  className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2 text-sm text-[#292826] outline-none focus:border-[#292826] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#E76F2E] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#C65320] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Book Free Online Consultation →'}
              </button>

              <p className="text-center text-[11px] text-[#54504A]">
                🔒 Protected by 256-bit SSL encryption. Zero spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
