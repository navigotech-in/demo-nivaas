import { mediaLogos } from '../lib/data'
import { Icons } from './Icons'

export default function MediaSpotlight() {
  return (
    <section className="py-16 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="text-center max-w-2xl mx-auto">
          <span className="eyebrow flex items-center justify-center gap-1.5">
            <Icons.FileText size={14} /> Press & Recognition
          </span>
          <h2 className="section-title mt-2">
            In the Spotlight: Media Coverage & Updates
          </h2>
          <p className="mt-2 text-sm text-[#54504A]">
            Recognized by India's top business and architectural publications for democratizing house designs and structural engineering.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mediaLogos.map((media) => (
            <div
              key={media.name}
              className="flex flex-col justify-between rounded-lg border border-[#E7E0D7] bg-white p-4 text-center transition hover:border-[#E7E0D7] hover:shadow-sm group"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E76F2E] bg-[#F1ECE5] px-2 py-0.5 rounded-lg inline-block mb-2">
                  {media.tag}
                </span>
                <h3 className="font-display text-base font-bold text-[#292826] group-hover:text-[#292826] transition">
                  {media.name}
                </h3>
              </div>
              <p className="mt-3 text-[11px] text-[#54504A] leading-relaxed font-medium">
                "{media.desc}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
