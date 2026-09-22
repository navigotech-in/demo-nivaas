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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0EA5E9]/70 p-4 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-300 animate-fadeIn"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700 text-white font-bold text-sm shadow">
              <Icons.Blueprint size={18} />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold text-slate-900">
                Consult With Home Design Experts
              </h3>
              <p className="text-xs text-slate-500 font-medium">Free consultation · 1-on-1 architect guidance</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
            aria-label="Close modal"
          >
            <Icons.Close size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {success ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-slate-700 text-2xl font-bold shadow-sm">
                <Icons.Check size={28} />
              </div>
              <h4 className="mt-4 font-display text-2xl font-bold text-slate-900">
                Consultation Booked!
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <span className="font-bold text-slate-900">{form.name}</span>. A senior NIVAAS architect will contact you on <span className="font-bold text-slate-900">{form.phone}</span> within 2 hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex rounded-xl bg-slate-700 px-7 py-2.5 text-xs font-bold text-white shadow hover:bg-[#0EA5E9]"
              >
                Close & Browse Plans
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-slate-800">
              {error && (
                <div className="rounded-xl bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                  {error}
                </div>
              )}

              {initialPlanDetails && (
                <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-950 border border-slate-300 font-medium">
                  <span className="font-bold">Selected Specs:</span> {initialPlanDetails}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-700 focus:bg-white"
                  />
                  <div className="absolute left-3.5 top-3 text-slate-400">
                    <Icons.User size={16} />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-slate-50 focus-within:border-slate-700 focus-within:bg-white">
                  <span className="inline-flex items-center px-3.5 text-xs font-bold text-slate-500 border-r border-slate-300 bg-slate-100 rounded-l-xl">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-r-xl px-3.5 py-2.5 text-sm text-slate-900 outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-700 focus:bg-white"
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
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Service Requirement
                </label>
                <select
                  value={form.requirement}
                  onChange={(e) => setForm({ ...form, requirement: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-700 focus:bg-white"
                >
                  {defaultRequirements.map((req) => (
                    <option key={req} value={req}>
                      {req}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Plot Dimensions / Specific Notes
                </label>
                <textarea
                  rows={2}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="e.g. 30x50 plot, East facing, need 3 BHK duplex with car parking"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 outline-none focus:border-slate-700 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-slate-700 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-[#0EA5E9] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? 'Submitting...' : 'Book Free Online Consultation →'}
              </button>

              <p className="text-center text-[11px] text-slate-500">
                🔒 Protected by 256-bit SSL encryption. Zero spam.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
