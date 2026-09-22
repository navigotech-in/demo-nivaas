import { achievements, ventures } from '../lib/data'
import { Icons } from './Icons'

export default function Achievements() {
  return (
    <section className="py-20 bg-[#E2E8F0] border-t border-slate-300">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.HardHat size={14} /> Celebrating Achievements
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            Awards, offices & the NIVAAS family
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Recognitions that validate our engineering, and the sibling brands that extend NIVAAS beyond design.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {achievements.map((award) => (
            <div key={award.title} className="flex flex-col items-center rounded-3xl border border-slate-300 bg-white p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-slate-500">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-amber-300">
                <Icons.Star size={24} />
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-slate-900 leading-snug">{award.title}</h3>
              <p className="mt-1 text-[11px] text-slate-500">{award.org}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 bg-slate-300 max-w-24" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">The NIVAAS Family</span>
            <div className="h-px flex-1 bg-slate-300 max-w-24" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ventures.map((v) => (
              <div key={v.name} className="flex flex-col items-center rounded-2xl border border-slate-300 bg-white px-4 py-5 text-center transition hover:border-slate-500 hover:shadow-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 border border-slate-300 text-slate-900">
                  <Icons.Building size={17} />
                </div>
                <div className="mt-2 font-display text-xs font-bold text-slate-900">{v.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{v.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}