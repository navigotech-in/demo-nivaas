import { Icons } from './Icons'

export default function AppCta() {
  return (
    <section className="py-16 bg-white border-t border-[#E7E0D7]">
      <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl text-center lg:text-left">
          <span className="text-xs font-bold uppercase tracking-widest text-[#E76F2E] flex items-center justify-center lg:justify-start gap-1.5">
            <Icons.Sparkles size={14} /> Indore House Maker's App
          </span>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-extrabold text-[#292826]">
            House construction, in one click
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#54504A] max-w-xl">
            Browse 35,000+ ready plans, run instant cost estimates, track your construction milestones and talk to your design supervisor — all from your phone.
          </p>

          {/* Official Standard Black App Store & Google Play Download Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3">
            {/* Google Play Store Official Badge */}
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 h-[44px] px-3.5 rounded-lg bg-black text-white hover:bg-neutral-900 transition-all border border-[#a6a6a6]/40 shadow-sm active:scale-[0.98] select-none"
              title="Get it on Google Play"
            >
              <svg className="h-[22px] w-[20px] shrink-0" viewBox="0 0 512 512">
                <path fill="#4285F4" d="M38.8 6.5C23.6 15 14 30.8 14 49.3v413.4c0 18.5 9.6 34.3 24.8 42.8l232.7-249.5L38.8 6.5z" />
                <path fill="#EA4335" d="M363.3 148.8L271.5 256l91.8 107.2 92.5-52.9c18.5-10.6 29.8-30.2 29.8-54.3s-11.3-43.7-29.8-54.3l-92.5-52.9z" />
                <path fill="#FBBC04" d="M38.8 6.5l232.7 249.5 91.8-107.2L124.6 10.9C97.8-4.4 64-3.5 38.8 6.5z" />
                <path fill="#34A853" d="M38.8 505.5c25.2 10 59 9.1 85.8-6.2l238.7-137.9-91.8-107.2L38.8 505.5z" />
              </svg>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] uppercase tracking-wider text-white/80 font-semibold leading-none">
                  GET IT ON
                </span>
                <span className="text-[13.5px] font-bold text-white tracking-tight leading-tight mt-0.5 font-sans">
                  Google Play
                </span>
              </div>
            </a>

            {/* Apple App Store Official Badge */}
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 h-[44px] px-3.5 rounded-lg bg-black text-white hover:bg-neutral-900 transition-all border border-[#a6a6a6]/40 shadow-sm active:scale-[0.98] select-none"
              title="Download on the App Store"
            >
              <svg className="h-[22px] w-[18px] text-white shrink-0 fill-current" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.41-9.79-11.45-20.94-15.11-33.44-3.67-12.5-5.5-24.16-5.5-34.98 0-14.58 3.73-26.68 11.19-36.31 7.46-9.63 16.71-14.54 27.75-14.74 4.8 0 10.11 1.21 15.93 3.63 5.82 2.42 9.53 3.68 11.13 3.78 1.3.08 5.16-1.25 11.58-3.99 6.42-2.74 12.1-3.97 17.04-3.69 13.06.66 23.36 5.48 30.91 14.47-11.75 7.18-17.51 16.94-17.29 29.28.22 9.68 3.89 17.78 11.01 24.3 7.12 6.52 15.34 10.22 24.66 11.11-2.18 6.53-4.9 13.1-8.17 19.72zM119.22 33.04c0-7.39 2.66-14.3 7.98-20.73 5.32-6.43 11.88-10.43 19.68-12.01.76 7.61-1.63 14.65-7.18 21.12-5.55 6.47-12.39 10.33-20.48 11.62z" />
              </svg>
              <div className="text-left flex flex-col justify-center">
                <span className="text-[8px] uppercase tracking-wider text-white/80 font-semibold leading-none">
                  Download on the
                </span>
                <span className="text-[13.5px] font-bold text-white tracking-tight leading-tight mt-0.5 font-sans">
                  App Store
                </span>
              </div>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: '35K+', label: 'Plans' },
            { value: '5K+', label: '3D Elevations' },
            { value: '60+', label: 'Cities' },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-[#E7E0D7] bg-[#FDFCF9] px-5 py-6">
              <div className="font-display text-2xl sm:text-3xl font-extrabold text-[#E76F2E]">{s.value}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#54504A]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}