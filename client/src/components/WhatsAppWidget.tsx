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
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Chat Popover Window */}
        {openChat && (
          <div className="w-[320px] sm:w-[380px] rounded-3xl bg-white shadow-2xl border border-slate-300 overflow-hidden animate-fadeIn text-slate-800">
            {/* Header */}
            <div className="bg-[#0369A1] p-4 text-white flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-white shadow">
                  <Icons.WhatsApp size={22} />
                </div>
                <div>
                  <div className="font-bold text-sm">NIVAAS Design Desk</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                    <span className="h-2 w-2 rounded-full bg-slate-400 animate-pulse" />
                    Architects Online Now
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpenChat(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                <Icons.Close size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3 bg-slate-100 max-h-[320px] overflow-y-auto text-xs">
              <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-200 text-slate-800 leading-relaxed font-medium">
                Namaste! 🙏 Welcome to NIVAAS. Share your plot dimensions or ask any question regarding house plans, Vastu or 3D elevation.
              </div>

              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider pt-1 flex items-center gap-1">
                <Icons.Sparkles size={11} className="text-amber-500" />
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
                    className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-slate-500 hover:bg-slate-100 transition text-slate-800 font-semibold shadow-sm flex items-center justify-between"
                  >
                    <span>{q}</span>
                    <Icons.ChevronRight size={13} className="text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Input */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your plot size / query..."
                className="w-full text-xs rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 outline-none focus:border-slate-700 focus:bg-white"
              />
              <button
                type="submit"
                className="shrink-0 px-4 py-2.5 bg-slate-700 hover:bg-[#0EA5E9] text-white rounded-xl text-xs font-bold transition shadow"
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
            className="hidden sm:inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-300 px-4 py-2.5 rounded-full shadow-lg text-xs font-bold hover:bg-slate-50 transition"
          >
            <Icons.Sparkles size={14} className="text-amber-500" />
            <span>Get Instant Callback</span>
          </button>

          {/* WhatsApp toggle button */}
          <button
            type="button"
            onClick={() => setOpenChat(!openChat)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition hover:brightness-105"
            aria-label="Open WhatsApp Chat Support"
          >
            <Icons.WhatsApp size={28} />
          </button>
        </div>
      </div>
    </>
  )
}
