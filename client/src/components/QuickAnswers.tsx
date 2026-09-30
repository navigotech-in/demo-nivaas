import { Link } from 'react-router-dom'
import { quickAnswers } from '../lib/data'
import { Icons } from './Icons'

interface QuickAnswersProps {
  onOpenConsult: (serviceTitle?: string) => void
}

export default function QuickAnswers({ onOpenConsult }: QuickAnswersProps) {
  return (
    <section className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.HelpCircle size={14} /> Quick Answers
          </span>
          <h2 className="section-title mt-2">
            Questions homeowners ask us first
          </h2>
          <p className="mt-2 text-sm text-[#54504A]">
            Short, practical answers to the things that decide most buying decisions.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAnswers.map((qa) => (
            <div key={qa.q} className="flex flex-col justify-between rounded-lg border border-[#E7E0D7] bg-white p-5 shadow-sm transition-all hover:shadow-card-hover hover:border-[#E7E0D7]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C94F36] bg-[#FFF6E8] px-2.5 py-0.5 rounded-lg inline-block border border-[#E7E0D7]">
                  {qa.tag}
                </span>
                <h3 className="mt-3 font-display text-sm font-bold text-[#292826] leading-snug">{qa.q}</h3>
                <p className="mt-2 text-xs text-[#54504A] leading-relaxed">{qa.a}</p>
              </div>
              <Link
                to="/faq"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C94F36] hover:text-[#292826] transition"
              >
                <span>Read in FAQ</span>
                <Icons.ChevronRight size={12} />
              </Link>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onOpenConsult('Quick Answer Enquiry')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E76F2E] px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#C65320] transition"
          >
            <Icons.Sparkles size={14} />
            <span>Ask us anything</span>
          </button>
        </div>
      </div>
    </section>
  )
}