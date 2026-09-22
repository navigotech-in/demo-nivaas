import { useState } from 'react'
import { faqList } from '../lib/data'
import { Icons } from './Icons'

interface FAQProps {
  onOpenConsult: () => void
}

export default function FAQ({ onOpenConsult }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <section id="faq" className="py-20 bg-white border-t border-slate-300">
      <div className="container-content max-w-5xl">
        <div className="text-center">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.HelpCircle size={15} /> Clear Answers
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
            Everything you need to know about purchasing house plans, custom drawings, Vastu compliance and turnkey support.
          </p>
        </div>

        {/* FAQ Accordion (Grey-Slate Palette) */}
        <div className="mt-12 space-y-3.5">
          {faqList.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-2xl border transition-all ${
                  isOpen
                    ? 'border-slate-700 bg-slate-100/40 shadow-md ring-1 ring-slate-500/20'
                    : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="flex w-full items-center justify-between p-5 sm:p-6 text-left transition"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-950 bg-slate-200 px-2.5 py-0.5 rounded-md">
                      {item.tag}
                    </span>
                    <span className="font-display text-base sm:text-lg font-bold text-slate-900">
                      {item.q}
                    </span>
                  </div>
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold transition-transform ${
                      isOpen
                        ? 'bg-blue-600 text-white rotate-45'
                        : 'bg-white border border-slate-300 text-slate-600'
                    }`}
                  >
                    +
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-300/60 px-6 pb-6 pt-3.5 animate-fadeIn">
                    <p className="text-sm text-slate-700 leading-relaxed pl-3.5 border-l-2 border-slate-700">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center rounded-3xl bg-slate-100 p-8 border border-slate-300 shadow-sm">
          <div className="flex justify-center mb-2 text-slate-900">
            <Icons.Compass size={32} />
          </div>
          <h3 className="font-display text-xl font-bold text-slate-900">
            Have a specific plot dimension or custom requirement?
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-lg mx-auto">
            Our architectural consultants are available 6 days a week to review your plot layout and municipality bylaws.
          </p>
          <button
            type="button"
            onClick={onOpenConsult}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition active:scale-[0.98]"
          >
            <Icons.Phone size={15} />
            <span>Talk to an Architect Now</span>
          </button>
        </div>
      </div>
    </section>
  )
}
