import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { faqList } from '../lib/data'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'

interface FaqPageProps {
  onOpenConsult: (query?: string) => void
}

const categories = [
  'All Questions',
  'General',
  'Delivery',
  'Deliverables',
  'Vastu',
  'Customization',
  'Construction',
  'Pricing',
  'Support',
]

export default function FaqPage({ onOpenConsult }: FaqPageProps) {
  useSeoMeta({
    title: 'Help Center & FAQs | NIVAAS',
    description: 'Find clear answers on CAD house blueprints, municipal approvals, Vastu compliance, architecture pricing, and contractor hiring with NIVAAS.',
    canonicalUrl: 'https://nivaas.in/faq',
  })

  const [selectedCategory, setSelectedCategory] = useState('All Questions')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const filteredFaqs = useMemo(() => {
    return faqList.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All Questions' || item.tag.toLowerCase() === selectedCategory.toLowerCase()
      const matchesSearch =
        !searchQuery.trim() ||
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [selectedCategory, searchQuery])

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }

  return (
    <div className="bg-[#FDFCF9] text-[#292826] min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-[#E7E0D7] bg-white">
        <div className="container-content py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#74706A]">
            <Link to="/" className="hover:text-[#C94F36] transition">Home</Link>
            <span>/</span>
            <span className="text-[#292826] font-semibold">Help &amp; FAQs</span>
          </nav>
        </div>
      </div>

      {/* Hero Header */}
      <div className="container-content pt-8 pb-6 sm:pt-12 sm:pb-8 text-center max-w-3xl mx-auto">
        <span className="eyebrow flex items-center justify-center gap-1.5 mx-auto">
          <Icons.HelpCircle size={15} /> Help Center
        </span>
        <h1 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-[#292725] tracking-tight leading-tight mt-2">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#54504A] leading-relaxed">
          Clear, upfront answers on CAD deliverables, revision process, Vastu standards, pricing, and structural approvals.
        </p>

        {/* Live Search Input */}
        <div className="mt-6 relative max-w-xl mx-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. Vastu, delivery timeline, pricing)…"
            className="w-full bg-white border border-[#E7E0D7] rounded-xl px-10 py-3 text-xs sm:text-sm text-[#292826] placeholder:text-[#74706A] outline-none focus:border-[#C94F36] shadow-xs transition"
          />
          <div className="absolute left-3.5 top-3.5 text-[#C94F36]">
            <Icons.Search size={16} />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3.5 text-xs text-[#74706A] hover:text-[#292826]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Toolbar */}
      <div className="container-content pb-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                selectedCategory === cat
                  ? 'bg-[#C94F36] text-white border-[#C94F36] shadow-xs'
                  : 'bg-white text-[#54504A] border-[#E7E0D7] hover:border-[#C94F36] hover:text-[#292826]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Accordion List (Single-Open, Full Answers) */}
      <div className="container-content pb-16 max-w-4xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#E7E0D7] p-8">
            <p className="text-sm font-bold text-[#292826]">No questions match "{searchQuery}"</p>
            <p className="text-xs text-[#74706A] mt-1">Try searching for other terms or contact our architectural desk directly.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedCategory('All Questions')
              }}
              className="mt-4 px-4 py-2 bg-[#C94F36] text-white text-xs font-bold rounded-lg hover:bg-[#B33E26] transition"
            >
              Reset Search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((item, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={item.q}
                  onClick={() => toggleAccordion(idx)}
                  className={`overflow-hidden rounded-xl border transition-all cursor-pointer select-none ${
                    isOpen
                      ? 'border-[#292826] bg-[#FFF6E8]/30 shadow-sm ring-1 ring-[#54504A]/20'
                      : 'border-[#E7E0D7] bg-white hover:border-[#C94F36]/60'
                  }`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      toggleAccordion(idx)
                    }
                  }}
                  aria-expanded={isOpen}
                >
                  <div className={`p-4 sm:p-5 flex flex-col justify-center ${!isOpen ? 'min-h-[84px] sm:min-h-[88px]' : ''}`}>
                    <div className="flex w-full items-center justify-between text-left gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C94F36] bg-[#FFF6E8] border border-[#E7E0D7] px-2 py-0.5 rounded shrink-0">
                          {item.tag}
                        </span>
                        <h2 className={`font-display text-sm sm:text-base font-bold text-[#292826] leading-snug ${!isOpen ? 'truncate' : ''}`}>
                          {item.q}
                        </h2>
                      </div>
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-transform bg-[#C94F36] text-white shadow-xs ${
                          isOpen ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </div>
                    </div>

                    {/* Answer View: 1-line teaser when closed, full rich answer when open */}
                    {!isOpen ? (
                      <p className="mt-1.5 text-xs text-[#74706A] truncate font-normal">
                        {item.a}
                      </p>
                    ) : (
                      <div className="border-t border-[#E7E0D7]/70 mt-3.5 pt-3.5 animate-fadeIn">
                        <p className="text-xs sm:text-sm text-[#54504A] leading-relaxed pl-3.5 border-l-2 border-[#C94F36]">
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Ask an Architect Bottom Banner */}
        <div className="mt-12 rounded-2xl bg-[#FAF8F5] p-6 sm:p-8 border border-[#E7E0D7] shadow-xs text-center">
          <div className="h-10 w-10 rounded-xl bg-[#FFF6E8] border border-[#E7E0D7] text-[#C94F36] flex items-center justify-center mx-auto mb-3">
            <Icons.Sparkles size={20} />
          </div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#292826]">
            Still have a question about your plot or house plan?
          </h3>
          <p className="text-xs sm:text-sm text-[#74706A] mt-1 max-w-lg mx-auto">
            Our architectural engineers and Vastu consultants provide free 1-on-1 guidance on plot setbacks, floor plans and budgeting.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onOpenConsult('FAQ Page Help')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C94F36] px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#B33E26] transition active:scale-[0.98] cursor-pointer"
            >
              <Icons.Phone size={14} />
              <span>Talk to an Architect</span>
            </button>
            <Link
              to="/cost-estimator"
              className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#E7E0D7] px-6 py-2.5 text-xs sm:text-sm font-bold text-[#292826] hover:bg-[#FFF6E8] transition active:scale-[0.98]"
            >
              <Icons.Calculator size={14} className="text-[#C94F36]" />
              <span>Try Cost Estimator</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
