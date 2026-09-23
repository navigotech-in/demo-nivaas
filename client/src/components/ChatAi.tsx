import { useEffect, useRef, useState } from 'react'
import { site } from '../lib/data'
import { Icons } from './Icons'

interface Message {
  from: 'bot' | 'user'
  text: string
}

interface ChatAiProps {
  open: boolean
  onClose: () => void
}

const getBotReply = (input: string): string => {
  const q = input.toLowerCase()
  if (/(hi|hello|namaste|hey)\b/.test(q))
    return 'Namaste! 🙏 I am your NIVAAS AI assistant. Ask me anything about house plans, pricing, Vastu, 3D elevations or interiors.'
  if (/(price|cost|charge|pricing|rates?|fee|budget)/.test(q))
    return 'Our pricing bundles are:\n• 2D Layout + Working Drawings — ₹4,999\n• 3D Front Elevation — ₹2,499\n• Full Structural CAD Set — ₹6,999\nAll plans include unlimited revisions and municipal file ready drawings.'
  if (/(30x50|30 x 50|plot|dimension|siz|sq\.? ?ft|plot depth|width)/.test(q))
    return 'For a 30x50 ft East Facing plot we recommend our G+1 Duplex (3 BHK + Pooja, ~2,175 sq.ft built-up). You can explore or customize it from the House Plans section below.'
  if (/(vastu|vaastu|east facing|purva|direction)/.test(q))
    return 'Every NIVAAS plan is 100% Vastu compliant — East (Purva) and North (Uttaraya) facing layouts are the most preferred. Our AI engine auto-checks room placements, main door direction and setback compliance.'
  if (/(3d|elevation|exterior|facade)/.test(q))
    return 'Our 3D Front Elevations come in ultra-modern, traditional, and heritage styles with material-wise colour renderings. You get a photorealistic front façade + street view at ₹2,499.'
  if (/(interior|kitchen|pooja|bedroom|wardrobe|modular)/.test(q))
    return 'We plan complete room-by-room interiors — modular kitchens, TV units, pooja corners and wardrobes. Prices start at ₹599/sq.ft for 3D interior renders.'
  if (/(2d|layout|floor plan|house plan|blueprint)/.test(q))
    return 'Every 2D layout includes dimensioned floor plans, section, elevation, foundation detail, roof plan, door-window schedule and material spec sheet. Plans start at ₹4,999.'
  if (/(contact|whatsapp|call|phone|email|talk|architect|consult)/.test(q))
    return `You can reach us on ${site.phone} or write to ${site.email}. Our senior architects are online right now — click "Get Instant Callback" for a quick consultation.`
  return 'I can help with house plans, Vastu, pricing, 3D elevations and interiors. Try asking "Price of a 30x50 plan?" or "Vastu tips for my plot?".'
}

const suggestionChips = [
  'Price of a 30x50 house plan?',
  'How much for a 3D elevation?',
  'Vastu tips for East facing plot',
  'I want to talk to an architect',
]

export default function ChatAi({ open, onClose }: ChatAiProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      text: 'Namaste! 🙏 I am your NIVAAS AI assistant. Ask anything about house plans, Vastu, 3D elevations or pricing.',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const pushMessage = (from: 'bot' | 'user', text: string) => {
    setMessages((prev) => [...prev, { from, text }])
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
    }, 750)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#1A1815]/70 p-4 animate-fadeIn">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-sm border border-[#EEE9E3] text-[#292826] flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-[#292826] p-4 text-white flex items-center justify-between border-b border-[#3A3734]">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#E76F2E] font-display text-base font-extrabold text-white shadow-sm ring-1 ring-white/30">
              AI
            </span>
            <div>
              <div className="font-bold text-sm">NIVAAS AI Assistant</div>
              <div className="text-[11px] text-[#E76F2E] flex items-center gap-1 font-medium">
                <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-pulse" />
                Instant replies · Powered by NIVAAS AI
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#E76F2E] hover:text-white transition"
            aria-label="Close AI assistant"
          >
            <Icons.Close size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto bg-[#FDFCF9] p-4 text-xs">
          {messages.map((m, idx) =>
            m.from === 'bot' ? (
              <div key={idx} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#E76F2E] text-[10px] font-extrabold text-white">
                  AI
                </span>
                <div className="rounded-lg rounded-tl-none border border-[#EEE9E3] bg-white p-3 leading-relaxed text-[#292826] shadow-sm whitespace-pre-line">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={idx} className="flex justify-end">
                <div className="max-w-[80%] rounded-lg rounded-tr-none bg-[#E76F2E] px-3.5 py-2.5 text-white shadow-sm">
                  {m.text}
                </div>
              </div>
            )
          )}
          {typing && (
            <div className="flex items-center gap-1.5 rounded-lg rounded-tl-none border border-[#EEE9E3] bg-white px-3.5 py-2.5 shadow-sm w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8D2CC] animate-bounce" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8D2CC] animate-bounce [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#D8D2CC] animate-bounce [animation-delay:240ms]" />
            </div>
          )}
        </div>

        {/* Suggestion chips */}
        <div className="px-4 pt-3 pb-1 bg-white border-t border-[#EEE9E3] flex flex-wrap gap-1.5">
          {suggestionChips.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleAsk(s)}
              className="rounded-lg border border-[#E76F2E]/40 bg-[#E76F2E]/5 px-2.5 py-1 text-[10px] font-semibold text-[#C65320] hover:bg-[#E76F2E]/10 transition"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk(input)
          }}
          className="flex gap-2 bg-white p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about plans, Vastu, pricing..."
            className="w-full rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2.5 text-xs outline-none focus:border-[#E76F2E] focus:bg-white"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-[#E76F2E] px-4 text-white font-bold transition hover:brightness-105 active:scale-[0.97]"
            aria-label="Send message"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}