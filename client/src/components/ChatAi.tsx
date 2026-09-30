import { useEffect, useRef, useState } from 'react'
import { site } from '../lib/data'
import { Icons } from './Icons'

interface Message {
  from: 'bot' | 'user'
  text: string
  time?: string
}

interface ChatAiProps {
  open: boolean
  onClose: () => void
  onOpenConsult?: (query?: string) => void
  onOpenGenerator?: () => void
}

const getBotReply = (input: string): string => {
  const q = input.toLowerCase()
  if (/(hi|hello|namaste|hey)\b/.test(q))
    return 'Namaste! 🙏 I am your Indore House Makers AI assistant. Ask me anything about 2D floor plans, ₹299 AI Starter plans, 3D elevations, Vastu directions, or construction costs in Indore.'
  if (/(299|plan pack|credit|subscription|package|pricing)/.test(q))
    return '✨ Indore House Makers AI Starter Plan (₹299/mo):\n• 5 Full AI Design Generations per billing cycle\n• High-Resolution 2D CAD Layouts with Room Dimensions\n• Area Statements, Built-up & Carpet Area Summary\n• Photorealistic 3D Front Elevation Renders\n• Watermark-free PDF & PNG Downloads\n• 1 Free Plan Regeneration within 7 days\n\n📌 Note: All designs are conceptual recommendations. Construction requires verification by a licensed architect/structural engineer.'
  if (/(price|cost|charge|rates?|fee|budget|sq\.? ?ft)/.test(q))
    return '💰 Construction Cost Benchmarks in Indore & MP:\n• Economy: ₹1,550 – ₹1,750 / sq.ft\n• Premium Executive: ₹2,100 – ₹2,450 / sq.ft (Most Popular)\n• Luxury Ultra: ₹2,900 – ₹3,500 / sq.ft\n\nFull custom 2D CAD working drawings start at ₹4,999, and 3D Front Elevations at ₹2,499.'
  if (/(30x50|20x40|20x50|30x60|plot|dimension|siz|sq\.? ?ft)/.test(q))
    return '📐 For standard Indian plots like 30x50 ft (1,500 sq.ft plot / ~2,175 sq.ft built-up), we recommend a G+1 Duplex (3 BHK + Pooja Room + Covered Car Parking). You can explore dimensioned layouts in our House Plans section!'
  if (/(vastu|vaastu|east facing|purva|direction|kitchen|mandir|pooja)/.test(q))
    return '🧭 100% Vastu Shastra Guidelines:\n• Pooja Mandir: North-East (Ishanya) — Most auspicious corner\n• Kitchen: South-East (Agneya) or North-West (Vayavya)\n• Master Bedroom: South-West (Nairutya) for prosperity & stability\n• Staircase: South/West wall in clockwise rotation\n• Main Gate: North/East facing'
  if (/(3d|elevation|exterior|facade|render)/.test(q))
    return '🏛️ Our 3D Front Elevations come in ultra-modern, contemporary jaali, Kerala tropical, and classical villa styles with photorealistic Day and Twilight lighting renders.'
  if (/(interior|kitchen|bedroom|wardrobe|modular)/.test(q))
    return 'We plan complete turnkey modular interiors — modular kitchens, TV media consoles, pooja niches, and false ceiling LED concepts starting at ₹599/sq.ft.'
  if (/(2d|layout|floor plan|house plan|blueprint)/.test(q))
    return 'Every 2D layout includes dimensioned floor plans, door-window schedules, area statements, and structural column grid recommendations.'
  if (/(contact|whatsapp|call|phone|email|talk|architect|consult)/.test(q))
    return `You can reach our Senior Architects directly on ${site.phone} or write to ${site.email}. Click "Book Free Consultation" to schedule an instant callback.`
  return 'I can help with house plans, Vastu, pricing, 3D elevations, and construction cost estimates. Try asking "Price of a 30x50 plan?" or "What is included in ₹299 plan?".'
}

const suggestionChips = [
  { label: '📐 30x50 East Facing Plan', query: '30x50 East Facing House Plan' },
  { label: '💰 Indore Construction Cost', query: 'Construction cost in Indore' },
  { label: '✨ ₹299 AI Plan Package', query: 'What is included in the ₹299 AI Plan?' },
  { label: '🧭 Vastu for Mandir & Kitchen', query: 'Vastu rules for Kitchen and Pooja room' },
  { label: '🏛️ Modern 3D Front Elevation', query: 'Tell me about 3D front elevations' },
  { label: '📞 Talk to Senior Architect', query: 'I want to talk to an architect' },
]

export default function ChatAi({ open, onClose, onOpenConsult, onOpenGenerator }: ChatAiProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      text: 'Namaste! 🙏 I am your Indore House Makers AI Assistant. Ask me anything about house plans, ₹299 AI plan starter, Vastu compliance, 3D elevations, or construction rates in Indore.',
      time: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const pushMessage = (from: 'bot' | 'user', text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setMessages((prev) => [...prev, { from, text, time }])
  }

  const handleAsk = (text: string) => {
    const clean = text.trim()
    if (!clean) return
    pushMessage('user', clean)
    setInput('')
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      pushMessage('bot', getBotReply(clean))
    }, 600)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1815]/75 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md sm:max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E7E0D7] text-[#292826] flex flex-col h-[82vh] sm:h-[560px] max-h-[580px]">
        {/* Header */}
        <header className="bg-white px-4 sm:px-5 py-3.5 text-[#292826] flex items-center justify-between border-b border-[#EEE9E3] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white shadow-sm ring-2 ring-[#E76F2E]/20 font-black">
              <Icons.Sparkles size={20} />
            </div>
            <div>
              <div className="font-display font-extrabold text-sm sm:text-base text-[#292826] flex items-center gap-1.5">
                Indore House Makers <span className="text-[#C94F36]">AI Desk</span>
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online • Instant Vastu &amp; Cost Guidance
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[#54504A] hover:text-[#292826] hover:bg-[#F4EFEA] border border-[#E7E0D7] transition cursor-pointer"
            aria-label="Close AI assistant"
          >
            <Icons.Close size={18} />
          </button>
        </header>

        {/* Messages */}
        <div ref={bodyRef} className="flex-1 space-y-3.5 overflow-y-auto bg-[#FDFCF9] p-3 sm:p-4 text-xs">
          {/* Welcome Card if first message */}
          {messages.length <= 1 && (
            <div className="p-3.5 rounded-xl bg-white border border-[#E7E0D7] shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#C94F36] flex items-center gap-1">
                  <Icons.Sparkles size={12} /> Architectural AI Capabilities
                </span>
                <span className="text-[10px] text-[#54504A]">Instant Responses</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3]">
                  <span className="font-bold text-[#292826]">📐 Vastu Floor Plans</span>
                  <p className="text-[10px] text-[#54504A] mt-0.5">30x50, 20x40 &amp; duplex layouts</p>
                </div>
                <div className="p-2 rounded-lg bg-[#FAF8F5] border border-[#EEE9E3]">
                  <span className="font-bold text-[#292826]">💰 Cost Estimator</span>
                  <p className="text-[10px] text-[#54504A] mt-0.5">Indore &amp; MP material benchmarks</p>
                </div>
              </div>
            </div>
          )}

          {messages.map((m, idx) =>
            m.from === 'bot' ? (
              <div key={idx} className="flex items-start gap-2 animate-fadeIn">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-[10px] font-extrabold text-white shadow-xs">
                  AI
                </div>
                <div className="max-w-[85%] rounded-2xl rounded-tl-none border border-[#E7E0D7] bg-white p-3.5 leading-relaxed text-[#292826] shadow-xs whitespace-pre-line text-xs sm:text-[13px]">
                  {m.text}

                  {/* Contextual actions for bot */}
                  <div className="mt-2.5 pt-2 border-t border-[#EEE9E3] flex flex-wrap gap-1.5">
                    {onOpenGenerator && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          onOpenGenerator()
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFF6E8] border border-[#E76F2E]/30 text-[#C65320] text-[10.5px] font-bold hover:bg-[#E76F2E] hover:text-white transition"
                      >
                        <Icons.Blueprint size={11} />
                        <span>Launch 20-Step AI Generator</span>
                      </button>
                    )}
                    {onOpenConsult && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose()
                          onOpenConsult('AI Consultation Enquiry')
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F4EFEA] border border-[#E7E0D7] text-[#54504A] text-[10.5px] font-semibold hover:text-[#292826] hover:bg-[#E7E0D7] transition"
                      >
                        <Icons.Phone size={10} />
                        <span>Book Architect Review</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key={idx} className="flex justify-end animate-fadeIn">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#E76F2E] px-4 py-2.5 text-white shadow-xs text-xs sm:text-[13px] font-medium leading-relaxed">
                  {m.text}
                </div>
              </div>
            )
          )}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-[10px] font-extrabold text-white">
                AI
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none border border-[#E7E0D7] bg-white px-3.5 py-2.5 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:120ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:240ms]" />
              </div>
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="px-3 py-2 bg-white border-t border-[#EEE9E3] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-[10px] font-bold uppercase text-[#54504A] shrink-0 flex items-center gap-1">
            <Icons.Sparkles size={11} className="text-[#E76F2E]" /> Quick:
          </span>
          {suggestionChips.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => handleAsk(s.query)}
              className="shrink-0 rounded-lg border border-[#E7E0D7] bg-[#FAF8F5] hover:border-[#E76F2E] hover:bg-[#FFF6E8] px-2.5 py-1 text-[11px] font-semibold text-[#292826] hover:text-[#E76F2E] transition cursor-pointer active:scale-95"
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(input)
          }}
          className="flex gap-2 bg-white p-2.5 sm:p-3 border-t border-[#EEE9E3] shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about 30x50 plans, ₹299 starter, Vastu, Indore rates..."
            className="w-full rounded-xl border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2.5 text-xs sm:text-sm outline-none focus:border-[#E76F2E] focus:ring-2 focus:ring-[#E76F2E]/20 transition"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="shrink-0 rounded-xl bg-[#E76F2E] px-4 py-2.5 text-white font-bold text-xs sm:text-sm transition hover:bg-[#C65320] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            aria-label="Send message"
          >
            <span>Send</span>
            <Icons.ChevronRight size={14} />
          </button>
        </form>
      </div>
    </div>
  )
}