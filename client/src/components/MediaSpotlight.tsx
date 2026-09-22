import { mediaLogos } from '../lib/data'
import { Icons } from './Icons'

export default function MediaSpotlight() {
  return (
    <section className="py-16 bg-[#F8FAFC] border-t border-slate-300">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.FileText size={14} /> Press & Recognition
          </span>
          <h2 className="section-title mt-2 text-slate-900">
            In the Spotlight: Media Coverage & Updates
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Recognized by India's top business and architectural publications for democratizing house designs and structural engineering.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mediaLogos.map((media) => (
            <div
              key={media.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-300 bg-white p-4 text-center transition hover:border-slate-500 hover:shadow-md group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-950 bg-slate-200 px-2 py-0.5 rounded-full inline-block mb-2">
                  {media.tag}
                </span>
                <h4 className="font-display text-base font-bold text-slate-900 group-hover:text-slate-950 transition">
                  {media.name}
                </h4>
              </div>
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed font-medium">
                "{media.desc}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
