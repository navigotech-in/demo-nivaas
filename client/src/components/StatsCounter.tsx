import { platformStats } from '../lib/data'

export default function StatsCounter() {
  return (
    <section className="py-14 bg-[#292826] border-t border-[#292826]">
      <div className="container-content">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          {platformStats.map((stat) => (
            <div key={stat.label} className="relative">
              <div className="w-px h-full hidden lg:block absolute left-0 top-0 bg-[#292826] last:hidden" />
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {stat.value}
              </div>
              <div className="mt-1.5 h-1 w-10 mx-auto rounded-full bg-[#E76F2E]" />
              <div className="mt-2 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-[#A39E96]">
                {stat.label}
              </div>
              <div className="mt-0.5 text-[10px] sm:text-[11px] text-[#A6A098]">{stat.suffix}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}