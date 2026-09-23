import { trends } from '../lib/data'
import Img from './Img'

export default function Trends() {
  return (
    <section id="trends" className="py-20 sm:py-24">
      <div className="container-content">
        <div className="max-w-3xl">
          <p className="eyebrow">Latest trends</p>
          <h2 className="section-title mt-3">
            Latest trends in house plans and home designs
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            Stay updated with the latest trends in house plans and home
            designs. Our expert insights and straightforward ideas will
            inspire you to create a home that reflects your style and meets
            your family's needs.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {trends.map((t) => (
            <article
              key={t.title}
              className="flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card"
            >
              <div className="aspect-[45/20] overflow-hidden">
                <Img src={t.image} alt={t.title} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg text-[#292826]">{t.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.text}</p>
                <a href="#blog" className="mt-4 text-sm font-medium text-accent hover:underline">
                  Read more
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}