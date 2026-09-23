import { interiorCategories } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface InteriorsProps {
  onOpenConsult: (room?: string) => void
}

const INTRO_IMAGE =
  'https://images.pexels.com/photos/31925619/pexels-photo-31925619.jpeg'

export default function Interiors({ onOpenConsult }: InteriorsProps) {
  return (
    <section id="interiors" className="py-20 bg-white border-t border-[#E7E0D7]">
      <div className="container-content">
        {/* Editorial Split Intro — Interior Design (text left, image right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.Sofa size={14} /> Interior Design
            </span>
            <h2 className="section-title mt-2">
              Practical interiors without unnecessary decoration.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-[#74706A] leading-relaxed">
              Complete room-by-room modular kitchen designs, living room TV
              units, tranquil pooja corners, and wardrobe space planning —
              starting at just ₹599 / sq.ft.
            </p>
            <div className="mt-7">
              <button
                type="button"
                onClick={() => onOpenConsult('Complete Interior 3D Design')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#E76F2E] text-white text-sm font-bold transition hover:bg-[#C65320] active:scale-[0.98] group/link"
              >
                <span>Get 3D Interior Quotation</span>
                <Icons.ChevronRight
                  size={16}
                  className="transition-transform group-hover/link:translate-x-0.5"
                />
              </button>
            </div>
          </div>
          <div className="relative overflow-hidden bg-[#FFF6E8]">
            <Img
              src={INTRO_IMAGE}
              alt="Practical Indian interior design"
              className="h-full w-full object-cover aspect-[45/20]"
            />
          </div>
        </div>

        {/* Alternating Editorial Split Sections */}
        <div className="mt-14 space-y-16 lg:space-y-20">
          {interiorCategories.map((item, idx) => {
            const reverse = idx % 2 === 1
            return (
              <div
                key={idx}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center"
              >
                {/* Image */}
                <div
                  className={`relative overflow-hidden bg-[#FFF6E8] group ${
                    reverse ? 'lg:order-2' : ''
                  }`}
                >
                  <Img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover aspect-[45/20] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute top-4 left-4 rounded-lg bg-[#292826] px-3 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1">
                    <Icons.Sparkles size={11} className="text-[#E76F2E]" />
                    <span>{item.items}</span>
                  </span>
                </div>

                {/* Text */}
                <div className={reverse ? 'lg:order-1' : ''}>
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#74706A]">
                    Interior Design
                  </span>
                  <h3 className="font-display text-lg font-semibold tracking-tight text-[#292826] transition leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-[#74706A] leading-relaxed max-w-xl">
                    {item.text}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#E76F2E]">
                    <Icons.Tag size={13} />
                    <span>From ₹599 / sq.ft</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Interior Category: ${item.title}`)}
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#E76F2E] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#C65320] active:scale-[0.98] group/link"
                  >
                    <Icons.Sofa size={14} />
                    <span>Get 3D Interior Quotation</span>
                    <Icons.ChevronRight
                      size={14}
                      className="transition-transform group-hover/link:translate-x-0.5"
                    />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}