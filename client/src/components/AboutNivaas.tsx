import Img from './Img'
import { Icons } from './Icons'
import { site } from '../lib/data'

export default function AboutNivaas() {
  return (
    <section id="about" className="py-20 bg-[#F8FAFC] border-t border-slate-300">
      <div className="container-content grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="relative">
          <div className="overflow-hidden rounded-3xl border border-slate-300 shadow-card">
            <Img
              src="https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=1200&h=900&fit=crop"
              alt="NIVAAS designed modern Indian duplex"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-5 -right-3 sm:right-4 rounded-2xl bg-[#E76F2E] px-5 py-4 text-white shadow-lg border border-[#C65320]">
            <div className="font-display text-2xl font-extrabold text-white">14+</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-white/85">Years of Design</div>
          </div>
        </div>

        <div>
          <span className="eyebrow flex items-center gap-1.5">
            <Icons.Home size={14} /> Our Approach
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            House plans & home designs for every Indian plot & budget
          </h2>
          <p className="mt-3 text-sm text-slate-600 leading-relaxed">
            Our approach starts with your plot, lifestyle and budget. We combine Vastu-guided layouts, licensed structural engineering and modern 3D visuals so every Indian family can design, price and build their dream home without middlemen.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Icons.Blueprint, label: '12,000+ ready house plans', sub: 'Vastu & by-law compliant' },
              { icon: Icons.HardHat, label: 'End-to-end construction', sub: 'PMC, contractors & loans' },
              { icon: Icons.ShieldCheck, label: 'Certified engineers', sub: 'Structural safety guaranteed' },
              { icon: Icons.Sparkles, label: 'AI design assistance', sub: 'Instant plan suggestions' },
            ].map((f) => (
              <div key={f.label} className="flex items-start gap-3 rounded-2xl border border-slate-300 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 border border-slate-300">
                  <f.icon size={19} className="text-slate-900" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900">{f.label}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="#plans"
              className="inline-flex items-center gap-2 rounded-xl bg-[#E76F2E] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#C65320] transition"
            >
              <span>Browse House Plans</span>
              <Icons.ChevronRight size={14} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-900 shadow-sm hover:border-slate-500 transition"
            >
              <Icons.Phone size={14} />
              <span>Talk to a Designer · {site.phone}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}