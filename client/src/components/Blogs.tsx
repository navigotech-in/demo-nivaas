import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllBlogArticles, type BlogArticle } from '../lib/blogsData'
import Img from './Img'
import { Icons } from './Icons'

interface BlogsProps {
  onOpenConsult?: (topic?: string) => void
}

export default function Blogs({ onOpenConsult: _onOpenConsult }: BlogsProps) {
  const [articles, setArticles] = useState<BlogArticle[]>(() => getAllBlogArticles())

  useEffect(() => {
    const handleUpdate = () => {
      setArticles(getAllBlogArticles())
    }
    window.addEventListener('ihm_blogs_updated', handleUpdate)
    return () => window.removeEventListener('ihm_blogs_updated', handleUpdate)
  }, [])

  const featuredPosts = articles.slice(0, 4)

  return (
    <section id="blog" className="py-20 bg-[#FDFCF9] border-t border-[#E7E0D7]">
      <div className="container-content">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="eyebrow flex items-center gap-1.5">
              <Icons.FileText size={14} /> Architectural Insights
            </span>
            <h2 className="section-title mt-2">
              Design Stories, Vastu &amp; Construction Guides
            </h2>
            <p className="mt-2 text-sm text-[#54504A] max-w-2xl">
              Practical guides written by certified architects and civil consultants on plot sizing, material pricing ranges, Vastu orientation, and modern elevations.
            </p>
          </div>
          <Link
            to="/guides"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-white border border-[#C94F36] text-[#C94F36] hover:bg-[#F1ECE5] hover:border-[#B3432D] transition shadow-sm"
          >
            <Icons.FileText size={15} />
            <span>Read All 10 Guides &amp; Articles →</span>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredPosts.map((post) => (
            <article
              key={post.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#E7E0D7] bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <Link
                to={`/guides/${post.slug}`}
                tabIndex={-1}
                aria-hidden="true"
                className="relative aspect-[16/10] overflow-hidden bg-[#F1ECE5] block"
              >
                <Img
                  src={post.featuredImage}
                  alt={post.featuredImageAlt}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#292826]/85 text-white backdrop-blur-xs">
                  {post.category}
                </span>
              </Link>

              <div className="p-5 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#1F2937] mb-2 font-semibold">
                    <span className="text-[#B84718] font-bold">{post.tag}</span>
                    <span className="flex items-center gap-1"><Icons.Clock size={12} className="text-[#B84718]" /> {post.readTime}</span>
                  </div>
                  <Link to={`/guides/${post.slug}`} aria-label={post.title} className="block py-0.5">
                    <h3 className="font-display text-base font-bold leading-snug line-clamp-2 text-[#292826] hover:text-[#B84718] transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mt-2 text-xs sm:text-sm text-[#1F2937] leading-relaxed line-clamp-2 font-normal">
                    {post.excerpt}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#EEE9E3]">
                  <Link
                    to={`/guides/${post.slug}`}
                    aria-label={`Read full guide: ${post.title}`}
                    className="inline-flex items-center gap-1 py-2 text-xs font-bold text-[#B84718] hover:text-[#9E3A10] cursor-pointer transition min-h-[44px]"
                  >
                    <span>Read Full Guide</span>
                    <Icons.ChevronRight
                      size={14}
                      className="transform group-hover:translate-x-0.5 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}