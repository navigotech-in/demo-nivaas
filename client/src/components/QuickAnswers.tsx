import { quickAnswers } from '../lib/data'
import { Icons } from './Icons'

interface QuickAnswersProps {
  onOpenConsult: (serviceTitle?: string) => void
}

export default function QuickAnswers({ onOpenConsult }: QuickAnswersProps) {
  return (
    <section className="py-20 bg-[#F1F5F9] border-t border-slate-300">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.HelpCircle size={14} /> Quick Answers
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            Questions homeowners ask us first
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Short, practical answers to the things that decide most buying decisions.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAnswers.map((qa) => (
            <div key={qa.q} className="flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition-all hover:shadow-card-hover hover:border-slate-500">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full inline-block border border-blue-100">
                  {qa.tag}
                </span>
                <h3 className="mt-3 font-display text-sm font-bold text-slate-900 leading-snug">{qa.q}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{qa.a}</p>
              </div>
              <a
                href="#faq"
                className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition"
              >
                <span>See full FAQ</span>
                <Icons.ChevronRight size={12} />
              </a>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => onOpenConsult('Quick Answer Enquiry')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            <Icons.Sparkles size={14} />
            <span>Ask us anything</span>
          </button>
        </div>
      </div>
    </section>
  )
}