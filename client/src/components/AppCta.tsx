import { Icons } from './Icons'

export default function AppCta() {
  return (
    <section className="py-16 bg-[#11402C] border-t border-[#1F5037]">
      <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#8BE4BC] flex items-center justify-center lg:justify-start gap-1.5">
            <Icons.Sparkles size={14} /> NIVAAS App
          </span>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#EBF6EE]">
            House construction, in one click
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#9FC8B2] max-w-xl">
            Browse 35,000+ ready plans, run instant cost estimates, track your construction milestones and talk to your design supervisor — all from your phone.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
            >
              <Icons.Building size={16} />
              <span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium">Get it on</span>
                Google Play
              </span>
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-xs font-bold text-white shadow-md hover:opacity-90 transition"
            >
              <Icons.Download size={16} />
              <span>
                <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium">Download on the</span>
                App Store
              </span>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '35K+', label: 'Plans' },
            { value: '5K+', label: '3D Elevations' },
            { value: '60+', label: 'Cities' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-[#2B5940] bg-[#0B2A1F]/70 px-5 py-6 text-[#EBF6EE]">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#8BE4BC]">{s.value}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#9FC8B2]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}