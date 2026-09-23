import { site, paymentPartners } from '../lib/data'
import { Icons } from './Icons'

export default function Footer() {
  return (
    <footer className="bg-[#292826] text-white border-t border-[#E7E0D7]">
      {/* Top Banner / Newsletter */}
      <div className="border-b border-white/10 py-12">
        <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E76F2E] flex items-center gap-1.5">
              <Icons.Sparkles size={14} /> Stay Inspired & Informed
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Join 50,000+ Indian Home Builders
            </h3>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-lg">
              Get weekly curated house plans, Vastu layout tips, and material cost updates delivered straight to your inbox.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              alert('Thank you for subscribing to NIVAAS updates!')
            }}
            className="flex w-full lg:w-auto gap-2"
          >
            <div className="relative w-full sm:w-80">
              <input
                type="email"
                required
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-white/15 bg-white/10 pl-10 pr-4 py-3 text-xs text-white placeholder:text-white/50 outline-none focus:border-[#E76F2E] transition"
              />
              <div className="absolute left-3.5 top-3.5 text-[#E76F2E]">
                <Icons.Mail size={15} />
              </div>
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-[#E76F2E] px-6 py-3 text-xs font-bold text-white hover:bg-[#C65320] transition active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="container-content py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-xs text-white/80">
        {/* Col 1: Popular Sizes */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Ruler size={13} className="text-[#E76F2E]" />
            <span>Plans by Size</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">30 x 50 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">30 x 40 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">25 x 40 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">20 x 50 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">40 x 60 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">50 x 80 Luxury Plans</a></li>
          </ul>
        </div>

        {/* Col 2: By Area */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Grid size={13} className="text-[#E76F2E]" />
            <span>Plans by Area</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">500 - 700 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">900 - 1,100 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">1,150 - 1,300 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">1,350 - 1,500 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">1,700 - 2,000 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">3,000 sq.ft & above</a></li>
          </ul>
        </div>

        {/* Col 3: Services */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.HardHat size={13} className="text-[#E76F2E]" />
            <span>Services</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#services" className="hover:text-[#E76F2E] transition">2D Layout Design</a></li>
            <li><a href="#elevations" className="hover:text-[#E76F2E] transition">3D Front Elevation</a></li>
            <li><a href="#services" className="hover:text-[#E76F2E] transition">Structural CAD Sets</a></li>
            <li><a href="#interiors" className="hover:text-[#E76F2E] transition">Interior 3D Renders</a></li>
            <li><a href="#services" className="hover:text-[#E76F2E] transition">Vastu Consultation</a></li>
            <li><a href="#services" className="hover:text-[#E76F2E] transition">PMC & Site Supervision</a></li>
          </ul>
        </div>

        {/* Col 4: Top Cities */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.MapPin size={13} className="text-[#E76F2E]" />
            <span>Cities Covered</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Hyderabad (GHMC)</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Bengaluru (BBMP)</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Delhi NCR (DDA)</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Mumbai & Pune</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Indore & Bhopal</a></li>
            <li><a href="#plans" className="hover:text-[#E76F2E] transition">Chennai & Jaipur</a></li>
          </ul>
        </div>

        {/* Col 5: Tools & Resources */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Layers size={13} className="text-[#E76F2E]" />
            <span>Tools & Links</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#calculator" className="hover:text-[#E76F2E] transition">Cost Estimator 2026</a></li>
            <li><a href="#reviews" className="hover:text-[#E76F2E] transition">Client Video Stories</a></li>
            <li><a href="#blog" className="hover:text-[#E76F2E] transition">Vastu Guide & Blogs</a></li>
            <li><a href="#faq" className="hover:text-[#E76F2E] transition">Help & FAQs</a></li>
            <li><a href="#contact" className="hover:text-[#E76F2E] transition">Partner With Us</a></li>
            <li><a href="#contact" className="hover:text-[#E76F2E] transition">Contractor Network</a></li>
          </ul>
        </div>

        {/* Col 6: Helpline */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-white mb-3 text-[11px] border-b border-white/10 pb-2 flex items-center gap-1.5">
            <Icons.Phone size={13} className="text-[#E76F2E]" />
            <span>Design Helpline</span>
          </h4>
          <div className="space-y-2 text-white/80">
            <p className="font-bold text-sm text-white">{site.phone}</p>
            <p className="text-[11px] text-white/60">{site.operatingHours}</p>
            <p className="pt-2 text-white/60 flex items-center gap-1.5">
              <Icons.Mail size={13} className="text-[#E76F2E]" />
              <span>{site.email}</span>
            </p>
            <p className="text-white/60 flex items-center gap-1.5">
              <Icons.MapPin size={13} className="text-[#E76F2E]" />
              <span>{site.city}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Payment Partners */}
      <div className="border-t border-white/10 py-5">
        <div className="container-content flex flex-col md:flex-row items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-white flex items-center gap-1.5">
            <Icons.ShieldCheck size={13} className="text-[#E76F2E]" /> Secure Payments via
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {paymentPartners.map((p) => (
              <span
                key={p}
                className="rounded-lg border border-white/15 bg-white/5 px-3.5 py-1.5 text-[11px] font-bold text-white/70"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10 py-6 text-xs text-white/60">
        <div className="container-content flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {site.name} — Residential Architecture & Home Design Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-[#E76F2E] transition">Privacy Policy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-[#E76F2E] transition">Terms & Conditions</a>
            <span>·</span>
            <a href="#sitemap" className="hover:text-[#E76F2E] transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}