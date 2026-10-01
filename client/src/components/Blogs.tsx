import { blogPosts } from '../lib/data'
import Img from './Img'
import { Icons } from './Icons'

interface BlogsProps {
  onOpenConsult: (topic?: string) => void
}

export default function Blogs({ onOpenConsult }: BlogsProps) {
  return (
    <section id="blog" className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.FileText size={14} /> Architectural Insights
            </span>
            <h2 className="section-title mt-2">
              Design Stories, Vastu & Construction Guides
            </h2>
            <p className="mt-2 text-sm text-[#54504A] max-w-2xl">
              Practical guides written by our chief architects on plot zoning, local municipal bylaws, Vastu compliance, and material budgeting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult('Subscribe to Indore House Makers Journal')}
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-white border border-[#E76F2E] text-[#E76F2E] hover:bg-[#F1ECE5] hover:border-[#C65320] transition shadow-sm"
          >
            <Icons.FileText size={15} />
            <span>Read All Articles →</span>
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#E7E0D7] bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-[#F1ECE5]">
                <Img
                  src={post.image}
                  alt={post.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="p-5 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#54504A] mb-2 font-medium">
                    <span className="text-[#54504A]">{post.time}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-[#292826] leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#54504A] leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#EEE9E3]">
                  <button
                    type="button"
                    onClick={() => onOpenConsult(`Read Guide: ${post.title}`)}
                    className="text-xs font-bold text-[#E76F2E] hover:text-[#C65320] flex items-center gap-1 cursor-pointer"
                  >
                    <span>Read Full Guide</span>
                    <Icons.ChevronRight size={14} className="transform group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}