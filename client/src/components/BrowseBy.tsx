import { browseBy } from '../lib/data'

export default function BrowseBy() {
  return (
    <section id="browse" className="border-y border-line bg-accent-tint/60 py-20 sm:py-24">
      <div className="container-content">
        <div className="max-w-3xl">
          <p className="eyebrow">Start browsing</p>
          <h2 className="section-title mt-3">Find your plan your way</h2>
          <p className="mt-4 text-muted">
            Start with whatever you know about your plot — its size, the
            bedrooms you need, the direction it faces, or the city you're
            building in.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {browseBy.map((group) => (
            <div
              key={group.heading}
              className="rounded-[12px] border border-line bg-surface p-6 shadow-card"
            >
              <h3 className="font-display text-lg text-ink">{group.heading}</h3>
              <p className="mt-1 text-xs uppercase tracking-wide text-muted">{group.hint}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.chips.map((chip) => (
                  <a key={chip} href="#plans" className="chip">
                    {chip}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}