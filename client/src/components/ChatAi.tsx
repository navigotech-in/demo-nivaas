import { useEffect, useRef, useState } from 'react'
import { Icons } from './Icons'
import { fetchChatQuota } from '../lib/api'

interface Message {
  id?: string
  from: 'bot' | 'user'
  text: string
  time?: string
  toolResult?: any
  actionCard?: any
}

interface ChatAiProps {
  open: boolean
  onClose: () => void
  onOpenConsult?: (query?: string) => void
  onOpenGenerator?: () => void
  token?: string | null
  onOpenPassModal?: () => void
}

const suggestionChips = [
  { label: '💰 30x50 Indore Construction Cost', query: '30x50 East Facing house construction cost in Indore' },
  { label: '📐 3 BHK Duplex House Plans', query: 'Show me 3 BHK East facing duplex plans' },
  { label: '✨ What is in ₹299 Design Pass?', query: 'What is included in the ₹299 30-Day Design Pass?' },
  { label: '🧭 Vastu for Mandir & Kitchen', query: 'Vastu rules for Kitchen in Agneya and Mandir in Ishanya' },
  { label: '🏛️ Modern 3D Front Elevations', query: 'Tell me about 3D front elevations and lighting' },
  { label: '📞 Talk to Senior Architect', query: 'I want to schedule an architect consultation' },
]

export default function ChatAi({
  open,
  onClose,
  onOpenConsult,
  onOpenGenerator,
  token,
  onOpenPassModal,
}: ChatAiProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      from: 'bot',
      text: 'Namaste! 🙏 I am your Indore House Makers AI Assistant. Ask me anything about 2D floor plans, ₹299 Design Pass (5 Credits), Vastu compliance, 3D elevations, or verified construction rates in Indore.',
      time: 'Just now',
    },
  ])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [sessionId] = useState(() => 'sess_' + Math.random().toString(36).substring(2, 10))
  const [quota, setQuota] = useState<{ remaining: number; limit: number; isPassHolder: boolean } | null>(null)
  const [consentChecked, setConsentChecked] = useState(false)
  const [consultSubmitted, setConsultSubmitted] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Load quota on open
  useEffect(() => {
    if (open) {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined
      fetchChatQuota(headers)
        .then((data) => setQuota({ remaining: data.remaining, limit: data.limit, isPassHolder: data.isPassHolder }))
        .catch(() => setQuota({ remaining: 5, limit: 5, isPassHolder: false }))
    }
  }, [open, token])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, open])

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || typing) return

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const userMsg: Message = { from: 'user', text, time: now }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setTyping(true)

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`/api/v1/ai/chat/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text }),
      })

      if (!response.ok || !response.body) {
        throw new Error('Chat service temporarily unavailable.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let buffer = ''
      let botResponseText = ''
      let toolData: any = null
      let actionData: any = null

      const botMsgId = 'bot_' + Date.now()
      setMessages((prev) => [
        ...prev,
        { id: botMsgId, from: 'bot', text: '', time: now },
      ])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const block of lines) {
          const eventMatch = block.match(/^event:\s*(.+)$/m)
          const dataMatch = block.match(/^data:\s*(.+)$/m)

          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1].trim()
            try {
              const parsedData = JSON.parse(dataMatch[1].trim())

              if (eventType === 'response.delta' && parsedData.text) {
                botResponseText = parsedData.text
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, text: botResponseText } : m
                  )
                )
              } else if (eventType === 'tool.result') {
                toolData = parsedData
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, toolResult: toolData } : m
                  )
                )
              } else if (eventType === 'action.confirmation_required') {
                actionData = parsedData
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, actionCard: actionData } : m
                  )
                )
              } else if (eventType === 'response.failed') {
                botResponseText = `⚠️ ${parsedData.message}`
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === botMsgId ? { ...m, text: botResponseText } : m
                  )
                )
              }
            } catch {
              // continue
            }
          }
        }
      }

      // Decrement local quota
      setQuota((prev) => prev ? { ...prev, remaining: Math.max(0, prev.remaining - 1) } : null)
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          from: 'bot',
          text: `Indore House Makers AI: Main aapki queries solve karne ke liye ready hoon. Aap 2D plans, ₹299 Design Pass, ya Indore construction costs pooch sakte hain. (${err.message})`,
          time: now,
        },
      ])
    } finally {
      setTyping(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1815]/75 backdrop-blur-sm p-2 sm:p-4 animate-fadeIn">
      <div className="w-full max-w-md sm:max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#E7E0D7] text-[#292826] flex flex-col h-[85vh] sm:h-[620px] max-h-[640px]">
        {/* Header */}
        <header className="bg-white px-4 sm:px-5 py-3 text-[#292826] flex items-center justify-between border-b border-[#EEE9E3] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#E76F2E] to-[#C94F36] text-white shadow-sm ring-2 ring-[#E76F2E]/20 font-black">
              <Icons.Sparkles size={20} />
            </div>
            <div>
              <div className="font-display font-extrabold text-sm sm:text-base text-[#292826] flex items-center gap-1.5">
                Indore House Makers <span className="text-[#C94F36]">AI Architecture Desk</span>
              </div>
              <div className="text-[11px] text-emerald-700 flex items-center gap-1.5 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online • SSE Streaming &amp; Verified Rates
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {quota && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenPassModal?.()
                }}
                className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold border cursor-pointer transition ${
                  quota.remaining > 0 ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                }`}
              >
                {quota.remaining}/{quota.limit} msgs left
              </button>
            )}
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Top Quick Action Bar */}
        <div className="px-4 py-2 bg-[#FFF6E8] border-b border-[#E76F2E]/20 flex items-center justify-between text-xs text-[#1F2937]">
          <span className="font-semibold text-[11px]">Generate custom 2D &amp; 3D designs for your plot</span>
          <button
            type="button"
            onClick={() => {
              onClose()
              onOpenGenerator?.()
            }}
            className="px-2.5 py-1 bg-[#B84718] hover:bg-[#9E3A10] text-white text-[11px] font-bold rounded-lg shadow-xs transition cursor-pointer"
          >
            Launch Studio
          </button>
        </div>

        {/* Chat Messages Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAF8F5]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.from === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.from === 'user'
                    ? 'bg-[#B84718] text-white font-medium rounded-tr-xs'
                    : 'bg-white text-[#1F2937] border border-[#E7E0D7] rounded-tl-xs whitespace-pre-line'
                }`}
              >
                {m.text}

                {/* Tool Result Widget */}
                {m.toolResult && m.toolResult.tool === 'calculate_construction_cost' && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 text-xs text-[#1F2937] space-y-1.5">
                    <div className="flex items-center justify-between font-extrabold text-black">
                      <span>{m.toolResult.package} Package ({m.toolResult.city})</span>
                      <span className="text-[#C65320] text-sm">{m.toolResult.estimatedTotalInLakhs}</span>
                    </div>
                    <div className="text-[11px] text-gray-600 font-semibold">
                      Rate: ₹{m.toolResult.ratePerSqFt}/sq.ft · Built-up: {m.toolResult.builtUpArea} sq.ft
                    </div>
                    <p className="text-[10px] text-gray-500 italic mt-1">{m.toolResult.disclaimer}</p>
                  </div>
                )}

                {/* Action Card Widget with Mandatory Consent */}
                {m.actionCard && (
                  <div className="mt-3 p-3.5 rounded-xl bg-white border border-[#E76F2E]/40 shadow-xs text-xs text-[#1F2937] space-y-2.5">
                    <div className="font-extrabold text-black flex items-center gap-1.5">
                      <Icons.Phone size={14} className="text-[#E76F2E]" />
                      <span>{m.actionCard.title}</span>
                    </div>
                    <div className="text-[11px] text-gray-600 space-y-0.5">
                      <div>City: <strong>{m.actionCard.fields.city}</strong></div>
                      <div>Service: <strong>{m.actionCard.fields.suggestedService}</strong></div>
                    </div>

                    {!consultSubmitted ? (
                      <div className="pt-2 border-t border-gray-100 space-y-2">
                        <label className="flex items-start gap-2 text-[11px] text-[#374151] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => setConsentChecked(e.target.checked)}
                            className="mt-0.5 rounded border-[#D1C9BE] text-[#E76F2E] focus:ring-[#E76F2E]"
                          />
                          <span>{m.actionCard.fields.mandatoryConsent}</span>
                        </label>
                        <button
                          type="button"
                          disabled={!consentChecked}
                          onClick={() => {
                            setConsultSubmitted(true)
                            onOpenConsult?.('AI Chat Consultation Request')
                          }}
                          className="w-full py-2 px-3 rounded-lg bg-[#B84718] text-white text-xs font-bold hover:bg-[#9E3A10] transition disabled:opacity-50 cursor-pointer"
                        >
                          Confirm &amp; Book Architect Call
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-bold text-center">
                        ✓ Consultation request submitted successfully!
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#8C8881] mt-1 px-1">{m.time}</span>
            </div>
          ))}

          {typing && (
            <div className="flex items-center gap-2 p-3 bg-white border border-[#E7E0D7] rounded-2xl rounded-tl-xs max-w-[120px]">
              <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:0.2s]" />
              <span className="h-2 w-2 rounded-full bg-[#E76F2E] animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 border-t border-[#EEE9E3] bg-white overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(chip.query)}
              className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] text-[11px] font-semibold text-[#4B5563] hover:border-[#E76F2E] hover:text-[#C65320] hover:bg-[#FFF6E8] transition whitespace-nowrap cursor-pointer shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#EEE9E3] bg-white flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message (e.g. 30x50 plot cost in Indore)..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-[#D1C9BE] text-black placeholder-gray-400 focus:outline-none focus:border-[#E76F2E] focus:ring-1 focus:ring-[#E76F2E]"
          />
          <button
            type="button"
            disabled={!input.trim() || typing}
            onClick={() => handleSendMessage()}
            className="h-10 px-4 rounded-xl bg-[#B84718] hover:bg-[#9E3A10] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <span>Send</span>
            <Icons.ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}