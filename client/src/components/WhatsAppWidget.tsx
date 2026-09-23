import { useState } from 'react'
import { site } from '../lib/data'
import { Icons } from './Icons'

interface WhatsAppWidgetProps {
  onOpenConsult: (query?: string) => void
}

export default function WhatsAppWidget({ onOpenConsult }: WhatsAppWidgetProps) {
  const [openChat, setOpenChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    const text = encodeURIComponent(`Hi NIVAAS team, ${chatMessage}`)
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
      {/* Floating Action Button */}
      <div className="fixed bottom-12 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat Popover Window */}
        {openChat && (
          <div className="w-[320px] sm:w-[380px] rounded-lg bg-white shadow-sm border border-[#E7E0D7] overflow-hidden animate-fadeIn text-[#292826]">
            {/* Header */}
            <div className="bg-[#E76F2E] p-4 text-white flex items-center justify-between border-b border-[#292826]">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-[#E76F2E] flex items-center justify-center text-white shadow">
                  <Icons.WhatsApp size={22} />
                </div>
                <div>
                  <div className="font-bold text-sm">NIVAAS Design Desk</div>
                  <div className="text-[11px] text-[#FFF6E8]/90 flex items-center gap-1 font-medium">
                    <span className="h-2 w-2 rounded-full bg-[#D8D2CC] animate-pulse" />
                    Architects Online Now
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenChat(false)}
                className="text-[#FFF6E8]/90 hover:text-white text-lg font-bold"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 bg-[#FFF6E8] max-h-[320px] overflow-y-auto text-xs">
              <div className="bg-white p-3.5 rounded-lg rounded-tl-none shadow-sm border border-[#EEE9E3] text-[#292826] leading-relaxed font-medium">
                Namaste! 🙏 Welcome to NIVAAS. Share your plot dimensions or ask any question regarding house plans, Vastu or 3D elevation.
              </div>

              <div className="text-[10px] font-bold uppercase text-[#74706A] tracking-wider pt-1 flex items-center gap-1">
                <Icons.Sparkles size={11} className="text-[#E76F2E]" />
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
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-[#EEE9E3] hover:border-[#E7E0D7] hover:bg-[#FFF6E8] transition text-[#292826] font-semibold shadow-sm flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Icons.ChevronRight size={13} className="text-[#74706A]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-[#EEE9E3] flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your plot size / query..."
                className="w-full text-xs rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-3.5 py-2.5 outline-none focus:border-[#292826] focus:bg-white"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2.5 bg-[#E76F2E] hover:bg-[#C65320] text-white rounded-lg text-xs font-bold transition shadow"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* WhatsApp & Call Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Quick Book consultation pill */}
          <button
            type="button"
            onClick={() => onOpenConsult('Direct Help Request')}
            className="hidden sm:inline-flex items-center gap-2 bg-white text-[#E76F2E] border border-[#E7E0D7] px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-[#FFF6E8] transition"
          >
            <Icons.Sparkles size={14} className="text-[#E76F2E]" />
            <span>Get Instant Callback</span>
          </button>

          {/* WhatsApp toggle button */}
          <button
            type="button"
            onClick={() => setOpenChat(!openChat)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm hover:scale-105 transition hover:brightness-105"
            aria-label="Open WhatsApp Chat Support"
          >
            <Icons.WhatsApp size={28} />
          </button>
        </div>
      </div>
    </>
  )
}
