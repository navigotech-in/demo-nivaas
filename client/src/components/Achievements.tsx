import { achievements, ventures } from '../lib/data'
import { Icons } from './Icons'

export default function Achievements() {
  return (
    <section className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.HardHat size={14} /> Celebrating Achievements
          </span>
          <h2 className="section-title mt-2">
            Awards, offices &amp; the Indore House Makers family
          </h2>
          <p className="mt-2 text-sm text-[#54504A]">
            Recognitions that validate our engineering, and the initiatives that extend Indore House Makers beyond design.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {achievements.map((award) => (
            <div key={award.title} className="flex flex-col items-center rounded-lg border border-[#E7E0D7] bg-white p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover hover:border-[#E7E0D7]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E76F2E] text-white">
                <Icons.Star size={24} />
              </div>
              <h3 className="mt-4 font-display text-sm font-bold text-[#292826] leading-snug">{award.title}</h3>
              <p className="mt-1 text-[11px] text-[#54504A]">{award.org}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px flex-1 bg-[#E2DCD5] max-w-24" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#54504A]">The Indore House Makers Ecosystem</span>
            <div className="h-px flex-1 bg-[#E2DCD5] max-w-24" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {ventures.map((v) => (
              <div key={v.name} className="flex flex-col items-center rounded-lg border border-[#E7E0D7] bg-white px-4 py-5 text-center transition hover:border-[#E7E0D7] hover:shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F1ECE5] border border-[#E7E0D7] text-[#E76F2E]">
                  <Icons.Building size={17} />
                </div>
                <div className="mt-2 font-display text-xs font-bold text-[#E76F2E]">{v.name}</div>
                <div className="text-[10px] text-[#54504A] mt-0.5">{v.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}