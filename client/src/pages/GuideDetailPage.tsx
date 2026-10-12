import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAllBlogArticles, getBlogArticleBySlug, saveCustomBlog, type BlogArticle } from '../lib/blogsData'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'
import Img from '../components/Img'

interface GuideDetailPageProps {
  onOpenConsult: (query?: string) => void
}

export default function GuideDetailPage({ onOpenConsult }: GuideDetailPageProps) {
  const { slug } = useParams<{ slug: string }>()
  const [fetchedArticle, setFetchedArticle] = useState<BlogArticle | null>(null)

  const article = useMemo(() => {
    if (fetchedArticle) return fetchedArticle
    return getBlogArticleBySlug(slug || '')
  }, [slug, fetchedArticle])

  // Scroll to top on slug change & fetch from API if not local
  useEffect(() => {
    window.scrollTo(0, 0)
    if (slug && !getBlogArticleBySlug(slug)) {
      fetch(`/api/v1/blogs/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.data) {
            saveCustomBlog(json.data)
            setFetchedArticle(json.data)
          }
        })
        .catch(() => {})
    }
  }, [slug])

  // Find related articles in the same or complementary category
  const relatedArticles = useMemo(() => {
    if (!article) return []
    const all = getAllBlogArticles()
    return all
      .filter((a) => a.slug !== article.slug)
      .slice(0, 3)
  }, [article])

  // SEO metadata injection
  useSeoMeta({
    title: article ? article.metaTitle : 'Architectural & Construction Guide | Indore House Makers',
    description: article ? article.metaDescription : 'Expert residential architecture and construction guides.',
    keywords: article ? article.metaKeywords : 'house plans, construction cost, vastu shastra',
    canonicalUrl: article ? article.canonicalUrl : 'https://indorehousemakers.in/guides',
  })

  // Schema.org Article JSON-LD
  useEffect(() => {
    if (!article) return
    const schemaScript = document.createElement('script')
    schemaScript.type = 'application/ld+json'
    schemaScript.id = 'article-schema-jsonld'
    schemaScript.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.metaDescription,
      image: [article.featuredImage],
      datePublished: '2026-09-01T08:00:00+05:30',
      dateModified: '2026-10-01T10:00:00+05:30',
      author: [
        {
          '@type': 'Person',
          name: article.author.name,
          jobTitle: article.author.role,
        },
      ],
      publisher: {
        '@type': 'Organization',
        name: 'Indore House Makers',
        url: 'https://indorehousemakers.in',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': article.canonicalUrl,
      },
    })

    const existing = document.getElementById('article-schema-jsonld')
    if (existing) existing.remove()
    document.head.appendChild(schemaScript)

    return () => {
      const el = document.getElementById('article-schema-jsonld')
      if (el) el.remove()
    }
  }, [article])

  if (!article) {
    return (
      <div className="min-h-[60vh] bg-[#FDFCF9] py-16">
        <div className="container-content text-center max-w-md">
          <span className="inline-flex p-3 rounded-lg bg-[#FFF6E8] text-[#C94F36] mb-3">
            <Icons.FileText size={24} />
          </span>
          <h1 className="text-xl font-bold font-display text-[#292826]">Guide Not Found</h1>
          <p className="mt-1.5 text-xs text-[#74706A]">
            The guide you are looking for may have been updated. Explore our architectural library.
          </p>
          <div className="mt-5 flex justify-center gap-2.5">
            <Link
              to="/guides"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-[#292826] text-white hover:bg-[#3D3A37] transition"
            >
              ← Back to Guides
            </Link>
            <Link
              to="/house-plans"
              className="px-4 py-2 rounded-lg text-xs font-bold bg-white border border-[#E7E0D7] text-[#292826] hover:bg-[#F1ECE5] transition"
            >
              Explore Related Plans
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Check out this architectural guide: "${article.title}"\n\nhttps://indorehousemakers.in/guides/${article.slug}`
    )
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  return (
    <article className="min-h-screen bg-[#FDFCF9] py-8 lg:py-12 border-t border-[#E7E0D7]">
      <div className="container-content max-w-6xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[11px] text-[#74706A] flex-wrap">
          <Link to="/" className="hover:text-[#292826] transition">
            Home
          </Link>
          <span>/</span>
          <Link to="/guides" className="hover:text-[#292826] transition">
            Guides &amp; Articles
          </Link>
          <span>/</span>
          <span className="text-[#C94F36] font-medium">{article.category}</span>
        </nav>

        {/* Article Header (Clean Title, Subtitle, Single H1) */}
        <header className="mb-6">
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#FFF6E8] text-[#C94F36] border border-[#FCD9BD]">
              {article.category}
            </span>
            <span className="text-[11px] text-[#74706A]">
              Last Updated: <strong className="text-[#292826] font-semibold">{article.updatedAt}</strong>
            </span>
            <span className="text-[11px] text-[#74706A] ml-auto flex items-center gap-1">
              <Icons.Clock size={11} /> {article.readTime}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-[#E76F2E] leading-tight tracking-tight">
            {article.title}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#54504A] leading-relaxed">
            {article.subtitle}
          </p>

          <div className="mt-4 pt-3 border-t border-[#EEE9E3] flex flex-wrap items-center justify-between gap-3 text-xs text-[#74706A]">
            <div className="flex items-center gap-2.5">
              <img
                src={article.author.avatar}
                alt={article.author.name}
                className="w-8 h-8 rounded-full object-cover border border-[#D9D1C7]"
                loading="lazy"
              />
              <div>
                <p className="text-xs font-bold text-[#292826] leading-none">{article.author.name}</p>
                <p className="text-[10px] text-[#74706A] mt-0.5">{article.author.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#25D366]/10 text-[#128C7E] font-medium hover:bg-[#25D366]/20 transition text-[11px] cursor-pointer"
              title="Share on WhatsApp"
            >
              <Icons.Share2 size={12} />
              <span>Share</span>
            </button>
          </div>
        </header>

        {/* Cover Image with Required Blueprint Safety Disclaimer */}
        <figure className="mb-8 rounded-lg overflow-hidden border border-[#E7E0D7] bg-[#F1ECE5]">
          <div className="aspect-[16/9] w-full max-h-[440px]">
            <Img
              src={article.featuredImage}
              alt={article.featuredImageAlt}
              className="w-full h-full object-cover"
            />
          </div>
          <figcaption className="p-2.5 text-[11px] text-[#74706A] bg-[#FDFCF9] border-t border-[#EEE9E3] flex items-center justify-between flex-wrap gap-2">
            <span>{article.featuredImageAlt}</span>
            <span className="font-semibold text-[#8C827A] text-[10px]">
              * Conceptual planning reference — not a construction or structural drawing.
            </span>
          </figcaption>
        </figure>

        {/* 2-Column Layout: 74% Article / 26% Sticky Sidebar on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Article Content (74% -> 9 of 12 cols) */}
          <main className="lg:col-span-8 space-y-6 text-[#1F2937] text-sm sm:text-base leading-relaxed">
            {/* Intro Lead Paragraph */}
            <p className="text-base sm:text-lg font-medium text-black leading-relaxed bg-[#FAF8F5] p-5 rounded-lg border border-[#E7E0D7] shadow-xs">
              {article.content.intro}
            </p>

            {/* Article Sections */}
            {article.content.sections.map((section, idx) => (
              <section key={idx} className="space-y-3 pt-6 border-t border-[#E7E0D7]">
                <h2 className="text-lg sm:text-xl font-bold font-display text-[#E76F2E] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E76F2E] shrink-0" />
                  {section.heading}
                </h2>

                <p className="text-[#1F2937] text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                  {section.body}
                </p>

                {/* Structured Data Table */}
                {section.table && (
                  <div className="overflow-x-auto rounded-lg border border-[#E7E0D7] my-4 bg-white shadow-xs">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="bg-[#1F2937] text-white">
                          {section.table.headers.map((h, i) => (
                            <th key={i} className="p-3 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EEE9E3]">
                        {section.table.rows.map((row, rIdx) => (
                          <tr
                            key={rIdx}
                            className={rIdx % 2 === 0 ? 'bg-[#FDFCF9]' : 'bg-white'}
                          >
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 text-black font-medium">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Clean Callout Box */}
                {section.callout && (
                  <div className="p-4 rounded-lg bg-[#FFF6E8] border border-[#FCD9BD] my-4 shadow-xs">
                    <h3 className="text-xs sm:text-sm font-bold text-[#E76F2E] flex items-center gap-1.5 uppercase tracking-wide">
                      <Icons.CheckCircle size={15} />
                      {section.callout.title}
                    </h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-[#1F2937] leading-relaxed font-medium">
                      {section.callout.text}
                    </p>
                  </div>
                )}
              </section>
            ))}

            {/* Contextual Teaser (Based on Category) */}
            {article.category === 'Cost Estimation' && (
              <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-black">Want an estimated budget for your plot?</h3>
                  <p className="text-xs text-[#1F2937] mt-0.5">Calculate stage-wise civil and turnkey cost ranges instantly.</p>
                </div>
                <Link
                  to="/cost-estimator"
                  className="shrink-0 px-4 py-2 rounded-md text-xs font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-xs"
                >
                  Calculate Construction Cost →
                </Link>
              </div>
            )}

            {article.category === 'House Plans' && (
              <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-black">Looking for ready 2D layouts for this plot size?</h3>
                  <p className="text-xs text-[#1F2937] mt-0.5">Explore Vastu-aligned residential blueprints and working drawings.</p>
                </div>
                <Link
                  to="/house-plans"
                  className="shrink-0 px-4 py-2 rounded-md text-xs font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-xs"
                >
                  Explore Related Plans →
                </Link>
              </div>
            )}

            {/* Architectural Summary */}
            {article.content.summary && (
              <div className="p-5 rounded-lg bg-[#FAF8F5] border border-[#E7E0D7] my-6 shadow-xs">
                <h3 className="text-xs font-bold text-[#E76F2E] uppercase tracking-wider mb-1.5">
                  Architectural Summary
                </h3>
                <p className="text-xs sm:text-sm text-[#1F2937] leading-relaxed font-normal">
                  {article.content.summary}
                </p>
              </div>
            )}

            {/* FAQs Section */}
            {article.content.faqs && article.content.faqs.length > 0 && (
              <section className="pt-6 border-t border-[#E7E0D7]">
                <h2 className="text-lg font-bold font-display text-black mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#E76F2E] shrink-0" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {article.content.faqs.map((faq, fIdx) => (
                    <div key={fIdx} className="p-4 rounded-lg bg-white border border-[#E7E0D7] shadow-xs">
                      <h3 className="text-sm font-bold text-[#E76F2E]">
                        Q: {faq.q}
                      </h3>
                      <p className="mt-1.5 text-xs sm:text-sm text-[#1F2937] leading-relaxed font-normal">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Bottom Mobile Consultation Card */}
            <div className="lg:hidden mt-8 p-5 rounded-lg bg-white border border-[#E7E0D7] shadow-sm">
              <h3 className="text-base font-bold text-black">
                Need help with your plot?
              </h3>
              <p className="text-xs sm:text-sm text-[#1F2937] mt-1">
                Discuss setbacks, Vastu alignment, and turnkey options directly with our architects.
              </p>
              <button
                type="button"
                onClick={() => onOpenConsult(`Regarding Guide: ${article.title}`)}
                className="mt-3.5 w-full py-2.5 rounded-md text-xs sm:text-sm font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition cursor-pointer shadow-xs"
              >
                Request Design Consultation →
              </button>
            </div>
          </main>

          {/* Desktop Sticky Sidebar (26% -> 4 of 12 cols) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-20 space-y-5">
              {/* 1. Table of Contents */}
              {article.tableOfContents && article.tableOfContents.length > 0 && (
                <div className="p-4 rounded-lg bg-white border border-[#E7E0D7] shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5 flex items-center gap-1.5">
                    <Icons.List size={14} className="text-[#E76F2E]" />
                    <span>In This Guide</span>
                  </h3>
                  <ol className="space-y-2 text-xs font-medium text-[#1F2937]">
                    {article.tableOfContents.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="font-mono text-[#E76F2E] text-xs font-bold shrink-0">{idx + 1}.</span>
                        <span className="line-clamp-2">{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* 2. Compact Consultation CTA Card */}
              <div className="p-4 rounded-lg bg-white border border-[#E7E0D7] shadow-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E76F2E] block mb-1">
                  Architectural Assistance
                </span>
                <h3 className="text-sm font-bold text-black">
                  Need help with your plot?
                </h3>
                <p className="text-xs text-[#1F2937] mt-1 leading-relaxed">
                  Discuss your plot dimensions and floor layout requirements directly with our team.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenConsult(`Regarding Guide: ${article.title}`)}
                  className="mt-3.5 w-full py-2.5 rounded-md text-xs font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition cursor-pointer text-center shadow-xs"
                >
                  Request Design Consultation →
                </button>
              </div>

              {/* 3. Related Services */}
              <div className="p-4 rounded-lg bg-white border border-[#E7E0D7] shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">
                  Architectural Services
                </h3>
                <ul className="space-y-2 text-xs font-medium">
                  <li>
                    <Link to="/house-plans" className="text-[#1F2937] hover:text-[#E76F2E] transition flex items-center justify-between">
                      <span>2D Floor Plans &amp; Working Drawings</span>
                      <Icons.ChevronRight size={13} className="text-[#E76F2E]" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/designs" className="text-[#1F2937] hover:text-[#E76F2E] transition flex items-center justify-between">
                      <span>3D Front Elevations &amp; Facades</span>
                      <Icons.ChevronRight size={13} className="text-[#E76F2E]" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/services" className="text-[#1F2937] hover:text-[#E76F2E] transition flex items-center justify-between">
                      <span>Turnkey Construction Supervision</span>
                      <Icons.ChevronRight size={13} className="text-[#E76F2E]" />
                    </Link>
                  </li>
                  <li>
                    <Link to="/cost-estimator" className="text-[#1F2937] hover:text-[#E76F2E] transition flex items-center justify-between">
                      <span>Interactive Cost Estimator</span>
                      <Icons.ChevronRight size={13} className="text-[#E76F2E]" />
                    </Link>
                  </li>
                </ul>
              </div>

              {/* 4. Related Guides */}
              {relatedArticles.length > 0 && (
                <div className="p-4 rounded-lg bg-white border border-[#E7E0D7] shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black mb-2.5">
                    Related Guides
                  </h3>
                  <div className="space-y-3">
                    {relatedArticles.map((rel) => (
                      <Link
                        key={rel.id}
                        to={`/guides/${rel.slug}`}
                        className="block group"
                      >
                        <p className="text-[10px] text-[#E76F2E] font-bold uppercase">{rel.category}</p>
                        <h4 className="text-xs font-bold text-black group-hover:text-[#E76F2E] transition line-clamp-2 leading-snug mt-0.5">
                          {rel.title}
                        </h4>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Next / Previous Article Footer */}
        <footer className="mt-12 pt-6 border-t border-[#E7E0D7] flex items-center justify-between gap-4">
          <Link
            to="/guides"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white border border-[#E7E0D7] text-[#292826] hover:bg-[#F1ECE5] transition"
          >
            ← Back to All Guides
          </Link>
          <button
            type="button"
            onClick={() => onOpenConsult(`Regarding Guide: ${article.title}`)}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#292826] text-white hover:bg-[#3D3A37] transition cursor-pointer"
          >
            Request Consultation
          </button>
        </footer>
      </div>
    </article>
  )
}
