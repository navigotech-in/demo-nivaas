import { site } from '../lib/data'
import { Icons } from './Icons'

export default function Footer() {
  return (
    <footer className="bg-[#11402C] text-[#CFE4D6] border-t border-[#1F5037]">
      {/* Top Banner / Newsletter */}
      <div className="border-b border-[#1F5037] py-12">
        <div className="container-content flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#8BE4BC] flex items-center gap-1.5">
              <Icons.Sparkles size={14} /> Stay Inspired & Informed
            </span>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-[#EBF6EE] mt-1">
              Join 50,000+ Indian Home Builders
            </h3>
            <p className="text-xs sm:text-sm text-[#9FC8B2] mt-1 max-w-lg">
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
                className="w-full rounded-xl border border-[#2B5940] bg-[#0B2A1F]/70 pl-10 pr-4 py-3 text-xs text-white placeholder:text-[#6FA98A] outline-none focus:border-[#8BE4BC] transition"
              />
              <div className="absolute left-3.5 top-3.5 text-[#6FA98A]">
                <Icons.Mail size={15} />
              </div>
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-[#1F9D66] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[#2BB578] transition active:scale-[0.98]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links (Header-Green Theme) */}
      <div className="container-content py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-xs">
        {/* Col 1: Popular Sizes */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-[#EBF6EE] mb-3 text-[11px] border-b border-[#2B5940] pb-2 flex items-center gap-1.5">
            <Icons.Ruler size={13} className="text-[#6FC39A]" />
            <span>Plans by Size</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">30 x 50 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">30 x 40 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">25 x 40 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">20 x 50 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">40 x 60 House Plans</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">50 x 80 Luxury Plans</a></li>
          </ul>
        </div>

        {/* Col 2: By Area */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-[#EBF6EE] mb-3 text-[11px] border-b border-[#2B5940] pb-2 flex items-center gap-1.5">
            <Icons.Grid size={13} className="text-[#6FC39A]" />
            <span>Plans by Area</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">500 - 700 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">900 - 1,100 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">1,150 - 1,300 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">1,350 - 1,500 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">1,700 - 2,000 sq.ft</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">3,000 sq.ft & above</a></li>
          </ul>
        </div>

        {/* Col 3: Services */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-[#EBF6EE] mb-3 text-[11px] border-b border-[#2B5940] pb-2 flex items-center gap-1.5">
            <Icons.HardHat size={13} className="text-[#6FC39A]" />
            <span>Services</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#services" className="hover:text-[#8BE4BC] transition">2D Layout Design</a></li>
            <li><a href="#elevations" className="hover:text-[#8BE4BC] transition">3D Front Elevation</a></li>
            <li><a href="#services" className="hover:text-[#8BE4BC] transition">Structural CAD Sets</a></li>
            <li><a href="#interiors" className="hover:text-[#8BE4BC] transition">Interior 3D Renders</a></li>
            <li><a href="#services" className="hover:text-[#8BE4BC] transition">Vastu Consultation</a></li>
            <li><a href="#services" className="hover:text-[#8BE4BC] transition">PMC & Site Supervision</a></li>
          </ul>
        </div>

        {/* Col 4: Top Cities */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-[#EBF6EE] mb-3 text-[11px] border-b border-[#2B5940] pb-2 flex items-center gap-1.5">
            <Icons.MapPin size={13} className="text-[#6FC39A]" />
            <span>Cities Covered</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">Hyderabad (GHMC)</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">Bengaluru (BBMP)</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">Delhi NCR (DDA)</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">Mumbai & Pune</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">Indore & Bhopal</a></li>
            <li><a href="#plans" className="hover:text-[#8BE4BC] transition">Chennai & Jaipur</a></li>
          </ul>
        </div>

        {/* Col 5: Tools & Resources */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-[#EBF6EE] mb-3 text-[11px] border-b border-[#2B5940] pb-2 flex items-center gap-1.5">
            <Icons.Layers size={13} className="text-[#6FC39A]" />
            <span>Tools & Links</span>
          </h4>
          <ul className="space-y-2">
            <li><a href="#calculator" className="hover:text-[#8BE4BC] transition">Cost Estimator 2026</a></li>
            <li><a href="#reviews" className="hover:text-[#8BE4BC] transition">Client Video Stories</a></li>
            <li><a href="#blog" className="hover:text-[#8BE4BC] transition">Vastu Guide & Blogs</a></li>
            <li><a href="#faq" className="hover:text-[#8BE4BC] transition">Help & FAQs</a></li>
            <li><a href="#contact" className="hover:text-[#8BE4BC] transition">Partner With Us</a></li>
            <li><a href="#contact" className="hover:text-[#8BE4BC] transition">Contractor Network</a></li>
          </ul>
        </div>

        {/* Col 6: Helpline */}
        <div>
          <h4 className="font-bold uppercase tracking-wider text-[#EBF6EE] mb-3 text-[11px] border-b border-[#2B5940] pb-2 flex items-center gap-1.5">
            <Icons.Phone size={13} className="text-[#6FC39A]" />
            <span>Design Helpline</span>
          </h4>
          <div className="space-y-2 text-[#CFE4D6]">
            <p className="font-bold text-sm text-[#8BE4BC]">{site.phone}</p>
            <p className="text-[11px] text-[#9FC8B2]">{site.operatingHours}</p>
            <p className="pt-2 text-[#9FC8B2] flex items-center gap-1.5">
              <Icons.Mail size={13} className="text-[#6FC39A]" />
              <span>{site.email}</span>
            </p>
            <p className="text-[#9FC8B2] flex items-center gap-1.5">
              <Icons.MapPin size={13} className="text-[#6FC39A]" />
              <span>{site.city}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-[#1F5037] bg-[#0A2818] py-6 text-xs text-[#7FB29A]">
        <div className="container-content flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} {site.name} — Residential Architecture & Home Design Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-[#8BE4BC] transition">Privacy Policy</a>
            <span>·</span>
            <a href="#terms" className="hover:text-[#8BE4BC] transition">Terms & Conditions</a>
            <span>·</span>
            <a href="#sitemap" className="hover:text-[#8BE4BC] transition">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}