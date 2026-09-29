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
    <section id="faq" className="py-[68px] bg-white border-t border-[#E7E0D7]">
      <div className="container-content max-w-5xl">
        <div className="text-center">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.HelpCircle size={15} /> Clear Answers
          </span>
          <h2 className="section-title mt-2">
            Frequently Asked Questions
          </h2>
          <p className="mt-2 text-sm text-[#54504A] max-w-xl mx-auto">
            Everything you need to know about purchasing house plans, custom drawings, Vastu compliance and turnkey support.
          </p>
        </div>

        {/* FAQ Accordion with Preview Line */}
        <div className="mt-[41px] space-y-3">
          {faqList.map((item, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className={`overflow-hidden rounded-xl border transition-all ${
                  isOpen
                    ? 'border-[#292826] bg-[#FFF6E8]/40 shadow-sm ring-1 ring-[#54504A]/20'
                    : 'border-[#E7E0D7] bg-[#FDFCF9] hover:border-[#E76F2E]/60'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="flex w-full items-center justify-between text-left transition cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pr-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] bg-[#F1ECE5] px-2.5 py-0.5 rounded-md shrink-0">
                        {item.tag}
                      </span>
                      <span className="font-display text-base sm:text-lg font-bold text-[#292826]">
                        {item.q}
                      </span>
                    </div>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-base font-bold transition-transform bg-[#E76F2E] text-white shadow-sm border border-[#E76F2E] ${
                        isOpen ? 'rotate-45' : ''
                      }`}
                    >
                      +
                    </div>
                  </button>

                  {/* Teaser line when closed vs Full Answer when open */}
                  {!isOpen ? (
                    <p
                      onClick={() => toggle(idx)}
                      className="mt-2 text-xs text-[#54504A]/90 line-clamp-1 cursor-pointer hover:text-[#292826] transition font-medium"
                    >
                      {item.a}
                    </p>
                  ) : (
                    <div className="border-t border-[#E7E0D7]/60 mt-3.5 pt-3.5 animate-fadeIn">
                      <p className="text-xs sm:text-sm text-[#54504A] leading-relaxed pl-3.5 border-l-2 border-[#E76F2E]">
                        {item.a}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-[41px] text-center rounded-lg bg-[#FFF6E8] p-[27px] border border-[#E7E0D7] shadow-sm">
          <div className="flex justify-center mb-2 text-[#E76F2E]">
            <Icons.Compass size={27} />
          </div>
          <h3 className="font-display text-xl font-bold text-[#292826]">
            Have a specific plot dimension or custom requirement?
          </h3>
          <p className="text-xs sm:text-sm text-[#54504A] mt-1 max-w-lg mx-auto">
            Our architectural consultants are available 6 days a week to review your plot layout and municipality bylaws.
          </p>
          <button
            type="button"
            onClick={onOpenConsult}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#E76F2E] px-7 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#C65320] transition active:scale-[0.98] cursor-pointer"
          >
            <Icons.Phone size={15} />
            <span>Talk to an Architect Now</span>
          </button>
        </div>
      </div>
    </section>
  )
}
