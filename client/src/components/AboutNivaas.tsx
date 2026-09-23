import approachImage from '../assets/approach-home.jpg'

export default function AboutNivaas() {
  return (
    <section id="about" className="bg-[#FAF9F6] py-16 md:py-20 lg:py-24">
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 items-center gap-10 px-5 sm:px-6 md:grid-cols-[48%_52%] md:gap-12 lg:gap-16 lg:px-8">

        <div className="order-1 max-w-[560px]">
          <div className="mb-5 flex items-center gap-3">
            <span className="h-px w-10 bg-[#C94F36]" />
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#C94F36]">
              Our Approach
            </span>
          </div>

          <h2 className="max-w-[520px] text-4xl font-semibold leading-[1.08] tracking-[-0.025em] text-[#292725] md:text-5xl lg:text-[56px]">
            Thoughtful Homes for Modern India
          </h2>

          <p className="mt-6 max-w-[520px] text-base leading-7 text-[#706C67] md:text-lg md:leading-8">
            We create practical house plans, refined interiors and
            construction-ready drawings shaped around your plot, lifestyle
            and budget.
          </p>

          <a
            href="#plans"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#C94F36] transition-colors hover:text-[#A93D29]"
          >
            Explore Our Work
            <span aria-hidden="true">→</span>
          </a>
        </div>

        <div className="order-2 w-full overflow-hidden rounded-lg">
          <img
            src={approachImage}
            alt="Modern Indian home designed by NIVAAS"
            className="h-[320px] w-full object-cover sm:h-[400px] md:h-[500px] lg:h-[560px]"
            loading="lazy"
          />
        </div>

      </div>
    </section>
  )
}