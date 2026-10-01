import { useState } from 'react'
import { site } from '../lib/data'
import { Icons } from './Icons'

interface WhatsAppWidgetProps {
  onOpenConsult?: (query?: string) => void
  onOpenAiStudio?: () => void
  sheetOpen?: boolean
  modalOpen?: boolean
}

export default function WhatsAppWidget({ onOpenAiStudio, sheetOpen = false, modalOpen = false }: WhatsAppWidgetProps) {
  const [openChat, setOpenChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  if (sheetOpen || modalOpen) {
    return null
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    const text = encodeURIComponent(`Hi Indore House Makers team, ${chatMessage}`)
    const phone = site.whatsapp.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
    setChatMessage('')
    setOpenChat(false)
  }

  const quickPrompts = [
    'I need a 30x50 East Facing House Plan',
    'What is the cost for a 3D Elevation design?',
    'Looking for Vastu consultation for my plot',
    'I want to speak with a senior architect',
  ]

  return (
    <>
      {/* Unified Floating Sticky Actions (AI + WhatsApp) */}
      <div
        id="floating-whatsapp-actions"
        className="fixed bottom-[calc(76px+env(safe-area-inset-bottom))] md:bottom-24 lg:bottom-6 right-3 sm:right-5 z-[99970] flex flex-col items-end gap-2.5 pointer-events-auto select-none transition-all duration-200"
      >
        {/* Chat Popover Window */}
        {openChat && (
          <div className="w-[300px] sm:w-[360px] rounded-2xl bg-white shadow-2xl border border-[#E7E0D7] overflow-hidden animate-fadeIn text-[#292826] mb-1">
            {/* Header */}
            <div className="bg-[#25D366] p-3.5 text-white flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Icons.WhatsApp size={20} />
                </div>
                <div>
                  <div className="font-bold text-sm leading-tight">Indore House Makers Design Desk</div>
                  <div className="text-[10.5px] text-emerald-100 flex items-center gap-1.5 font-medium mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-200" />
                    Architects Online Now
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenChat(false)}
                className="h-7 w-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition font-bold cursor-pointer"
                aria-label="Close WhatsApp chat"
              >
                <Icons.Close size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="p-3.5 space-y-2.5 bg-[#FFF6E8]/60 max-h-[300px] overflow-y-auto text-xs">
              <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-sm border border-[#EEE9E3] text-[#292826] leading-relaxed font-medium">
                Namaste! Welcome to Indore House Makers. Share your plot dimensions or ask any question regarding house plans, Vastu or 3D elevation.
              </div>

              <div className="text-[10px] font-bold uppercase text-[#54504A] tracking-wider pt-0.5 flex items-center gap-1">
                <Icons.Sparkles size={11} className="text-[#25D366]" />
                <span>Quick Questions:</span>
              </div>

              <div className="space-y-1.5">
                {quickPrompts.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const text = encodeURIComponent(q)
                      const phone = site.whatsapp.replace(/\D/g, '')
                      window.open(`https://wa.me/${phone}?text=${text}`, '_blank')
                    }}
                    className="w-full text-left p-2 rounded-lg bg-white border border-[#EEE9E3] hover:border-[#25D366] hover:bg-[#FFF6E8] transition text-[#292826] font-semibold shadow-xs flex items-center justify-between group"
                  >
                    <span>{q}</span>
                    <Icons.ChevronRight size={12} className="text-[#54504A] group-hover:text-[#25D366] transition" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} className="p-2.5 bg-white border-t border-[#EEE9E3] flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your plot size / query..."
                className="w-full text-xs rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3 py-2 outline-none focus:border-[#25D366] focus:bg-white"
              />
              <button
                type="submit"
                className="shrink-0 px-3.5 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* 1. Sticky AI Assistant Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenAiStudio?.()}
            className="hidden sm:inline-flex items-center gap-1.5 bg-white text-[#E76F2E] border border-[#E7E0D7] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#FFF6E8] transition shadow-md"
          >
            <Icons.Sparkles size={13} className="text-[#E76F2E]" />
            <span>Ask AI Studio</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenAiStudio?.()}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA366] via-[#E76F2E] to-[#C65320] text-white shadow-xl hover:scale-105 transition active:scale-95 border-2 border-white ring-1 ring-black/10"
            aria-label="Open AI Assistant"
            title="Ask AI Assistant"
          >
            <Icons.Sparkles size={22} />
          </button>
        </div>

        {/* 2. Sticky WhatsApp Support Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpenChat(!openChat)}
            className="hidden sm:inline-flex items-center gap-1.5 bg-white text-[#292826] border border-[#E7E0D7] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#FFF6E8] hover:text-[#25D366] transition shadow-md"
          >
            <Icons.WhatsApp size={14} className="text-[#25D366]" />
            <span>WhatsApp Support</span>
          </button>
          <button
            type="button"
            onClick={() => setOpenChat(!openChat)}
            className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition hover:bg-[#20ba5a] active:scale-95 border-2 border-white ring-1 ring-black/10"
            aria-label="Open WhatsApp Chat Support"
            title="WhatsApp Support"
          >
            <Icons.WhatsApp size={24} />
          </button>
        </div>
      </div>
    </>
  )
}
