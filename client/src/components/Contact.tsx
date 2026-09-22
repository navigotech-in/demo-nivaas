import { useState } from 'react'
import { submitLead } from '../lib/api'
import { site } from '../lib/data'
import { Icons } from './Icons'

const requirements = [
  '2D House Plan & Layout',
  'Customize an Existing Plan',
  '3D Front Elevation',
  'Structural CAD Drawings',
  'Complete Interior Design',
  'Turnkey Construction & PMC',
  'Vastu Consultation',
  'Home Loan Support',
]

type Status = 'idle' | 'sending' | 'done' | 'error'

export default function Contact() {
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({
    name: '',
    phone: '',
    city: '',
    requirement: requirements[0],
    message: '',
  })

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      await submitLead(form)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-700 focus:bg-white focus:ring-1 focus:ring-slate-700 placeholder:text-slate-400'

  return (
    <section id="contact" className="border-t border-slate-300 bg-[#F8FAFC] py-20 sm:py-24">
      <div className="container-content grid gap-12 lg:grid-cols-2 items-center">
        <div>
          <span className="eyebrow flex items-center gap-1.5">
            <Icons.Phone size={14} /> Talk to us
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            Tell us about your home, and we'll take it from there
          </h2>
          <p className="mt-3 max-w-lg leading-relaxed text-sm text-slate-600">
            Share your plot size and the kind of home you have in mind. A NIVAAS chief architect gets back to you within two hours with layout concepts and estimates.
          </p>

          <dl className="mt-8 space-y-5 text-sm">
            <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-300/80 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-900">
                <Icons.Phone size={20} />
              </span>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Call or WhatsApp</dt>
                <dd className="font-bold text-slate-900 text-base">{site.phone}</dd>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-300/80 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-900">
                <Icons.Mail size={20} />
              </span>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Email Design Desk</dt>
                <dd className="font-bold text-slate-900">{site.email}</dd>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-3.5 rounded-2xl border border-slate-300/80 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200 text-slate-900">
                <Icons.MapPin size={20} />
              </span>
              <div>
                <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Studio Locations</dt>
                <dd className="font-bold text-slate-900">{site.city} (Serving 60+ Cities)</dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Contact Form Card */}
        <div className="rounded-3xl border border-slate-300 bg-white p-6 sm:p-10 shadow-xl">
          {status === 'done' ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-900 text-2xl font-bold shadow-sm">
                <Icons.Check size={32} />
              </div>
              <h3 className="mt-5 font-display text-2xl font-bold text-slate-900">Thank you — we're on it.</h3>
              <p className="mt-2 max-w-sm text-xs text-slate-600">
                Your requirement has reached our design desk. Expect a call or WhatsApp message within 2 hours.
              </p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-slate-700 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-[#0EA5E9]"
                onClick={() => setStatus('idle')}
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <h3 className="font-display text-lg font-bold text-slate-900 mb-2">
                Book Architect Consultation
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-name" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Your Name *
                  </label>
                  <input
                    id="c-name"
                    required
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. Ramesh Kumar"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="c-phone" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Phone Number *
                  </label>
                  <input
                    id="c-phone"
                    required
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit mobile"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="c-city" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    City / Location
                  </label>
                  <input
                    id="c-city"
                    value={form.city}
                    onChange={set('city')}
                    placeholder="e.g. Hyderabad"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="c-req" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Service Needed
                  </label>
                  <select id="c-req" value={form.requirement} onChange={set('requirement')} className={inputClass}>
                    {requirements.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="c-msg" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                  Plot dimensions & specific needs
                </label>
                <textarea
                  id="c-msg"
                  rows={3}
                  value={form.message}
                  onChange={set('message')}
                  placeholder="e.g. 30x50 plot, East facing, need 3 BHK duplex with car parking"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full rounded-xl bg-slate-700 py-3.5 text-center text-sm font-bold text-white shadow-md hover:bg-[#0EA5E9] transition active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'sending' ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Icons.FileText size={16} />
                    <span>Submit Free Requirement →</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-slate-500">
                🔒 Your contact details are secure. Zero spam guarantee.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}