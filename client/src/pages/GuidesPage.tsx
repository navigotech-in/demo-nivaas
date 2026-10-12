import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getAllBlogArticles, saveCustomBlog, type BlogArticle } from '../lib/blogsData'
import { Icons } from '../components/Icons'
import { useSeoMeta } from '../components/useSeoMeta'
import Img from '../components/Img'

interface GuidesPageProps {
  onOpenConsult: (query?: string) => void
  onOpenAiStudio?: () => void
}

const categories = [
  'All Guides',
  'House Plans',
  'Cost Estimation',
  'Vastu Planning',
  '3D Elevations',
  'Interiors',
  'Construction Advice',
] as const

type CategoryType = (typeof categories)[number]

const categorySlugMap: Record<string, CategoryType> = {
  'all': 'All Guides',
  'house-planning': 'House Plans',
  'house-plans': 'House Plans',
  'cost-estimation': 'Cost Estimation',
  'construction-cost': 'Cost Estimation',
  'vastu-planning': 'Vastu Planning',
  'vastu-and-design': 'Vastu Planning',
  '3d-elevations': '3D Elevations',
  'interiors': 'Interiors',
  'construction-advice': 'Construction Advice',
  'construction-tips': 'Construction Advice',
}

const categoryToSlugMap: Record<CategoryType, string> = {
  'All Guides': '',
  'House Plans': 'house-planning',
  'Cost Estimation': 'construction-cost',
  'Vastu Planning': 'vastu-and-design',
  '3D Elevations': '3d-elevations',
  'Interiors': 'interiors',
  'Construction Advice': 'construction-tips',
}

export default function GuidesPage({ onOpenConsult }: GuidesPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')

  const initialCategory: CategoryType = useMemo(() => {
    if (categoryParam && categorySlugMap[categoryParam.toLowerCase()]) {
      return categorySlugMap[categoryParam.toLowerCase()]
    }
    return 'All Guides'
  }, [categoryParam])

  const [articlesList, setArticlesList] = useState<BlogArticle[]>(() => getAllBlogArticles())
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(initialCategory)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Sync blogs from server & listen to localStorage updates
  useEffect(() => {
    const handleUpdate = () => {
      setArticlesList(getAllBlogArticles())
    }
    window.addEventListener('ihm_blogs_updated', handleUpdate)

    // Also fetch from API
    fetch('/api/v1/blogs')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.data && Array.isArray(json.data)) {
          json.data.forEach((b: BlogArticle) => saveCustomBlog(b))
          setArticlesList(getAllBlogArticles())
        }
      })
      .catch(() => {})

    return () => {
      window.removeEventListener('ihm_blogs_updated', handleUpdate)
    }
  }, [])

  // Sync state if query param changes externally
  useEffect(() => {
    if (categoryParam && categorySlugMap[categoryParam.toLowerCase()]) {
      setSelectedCategory(categorySlugMap[categoryParam.toLowerCase()])
      setCurrentPage(1)
    } else if (!categoryParam) {
      setSelectedCategory('All Guides')
    }
  }, [categoryParam])

  useSeoMeta({
    title: 'Architecture, Vastu & House Construction Guides | Indore House Makers',
    description:
      'Practical residential guides on 30x50 & 20x40 floor plans, 2026 construction cost estimates, Vastu rules, modern elevations, and common planning mistakes.',
    keywords:
      'house plans indore, 30x50 house plan, construction cost indore 2026, vastu for house entrance, 3d front elevation designs, house building checklist',
    canonicalUrl: 'https://indorehousemakers.in/guides',
  })

  const filteredArticles = useMemo(() => {
    return articlesList.filter((article) => {
      const matchesCategory =
        selectedCategory === 'All Guides' || article.category === selectedCategory
      const matchesQuery =
        searchQuery.trim() === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tag.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [articlesList, selectedCategory, searchQuery])

  const ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)

  const handleCategorySelect = (cat: CategoryType) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
    const slug = categoryToSlugMap[cat]
    if (slug) {
      setSearchParams({ category: slug })
    } else {
      setSearchParams({})
    }
  }

  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    const element = document.getElementById('guides-feed')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCF9] py-8 lg:py-12 border-t border-[#E7E0D7]">
      <div className="container-content max-w-7xl">
        {/* Page Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] flex items-center gap-1.5 mb-1.5">
                <Icons.FileText size={14} /> Architectural Insights &amp; Knowledge Hub
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-black tracking-tight">
                Residential Architecture &amp; Construction Guides
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-[#1F2937] max-w-2xl font-medium">
                Practical guides written by licensed architects and civil consultants on plot sizing, material pricing ranges, Vastu orientation, and modern elevations.
              </p>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-80 shrink-0">
              <Icons.Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1F2937]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search plot size, cost, vastu..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-xs sm:text-sm bg-white border border-[#E7E0D7] text-black focus:outline-none focus:border-[#E76F2E] transition placeholder-[#74706A] shadow-xs"
              />
            </div>
          </div>
        </header>

        {/* Category Filter Navigation */}
        <div className="mb-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategorySelect(cat)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#E76F2E] text-white shadow-sm'
                  : 'bg-white border border-[#E7E0D7] text-[#1F2937] hover:bg-[#F1ECE5]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Guides Section: 1 Large + 3 Small Horizontal Cards Layout + Pagination */}
        <section id="guides-feed" aria-label="Guides List" className="mb-12 scroll-mt-20">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#E7E0D7]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-black">
              {selectedCategory === 'All Guides'
                ? currentPage === 1
                  ? 'Featured & Architectural Guides'
                  : `Architectural Guides (Page ${currentPage})`
                : `${selectedCategory} Guides (Page ${currentPage})`}
            </h2>
            <span className="text-xs font-semibold text-[#1F2937]">
              Showing {filteredArticles.length} guides • Page {currentPage} of {Math.max(1, totalPages)}
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-[#E7E0D7] shadow-sm">
              <p className="text-base font-bold text-black">No guides found matching your search.</p>
              <p className="text-xs sm:text-sm text-[#1F2937] mt-1">Try searching for &ldquo;30x50&rdquo;, &ldquo;Vastu&rdquo;, or &ldquo;Cost&rdquo;.</p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All Guides')
                  setSearchQuery('')
                  setCurrentPage(1)
                }}
                className="mt-4 px-5 py-2.5 rounded-lg text-xs font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition cursor-pointer shadow-xs"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {currentPage === 1 ? (
                <>
                  {/* Top Split Section (Page 1): 1 Large Card (Left) + 3 Small Horizontal Cards (Right) */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* 1 Large Featured Card */}
                    {filteredArticles[0] && (
                      <article className="lg:col-span-7 flex flex-col bg-white border border-[#E7E0D7] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#E76F2E] hover:shadow-md shadow-sm group">
                        <Link
                          to={`/guides/${filteredArticles[0].slug}`}
                          className="relative w-full aspect-[16/10] overflow-hidden bg-[#F1ECE5] block"
                        >
                          <Img
                            src={filteredArticles[0].featuredImage}
                            alt={filteredArticles[0].featuredImageAlt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E76F2E] text-white shadow-md">
                            {filteredArticles[0].category}
                          </span>
                        </Link>

                        <div className="p-5 sm:p-6 flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#1F2937] mb-2.5 font-semibold flex-wrap">
                              <span className="text-[#E76F2E] font-bold">{filteredArticles[0].tag}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Icons.Clock size={12} className="text-[#E76F2E]" /> {filteredArticles[0].readTime}
                              </span>
                              <span>•</span>
                              <span>{filteredArticles[0].updatedAt}</span>
                            </div>

                            <Link to={`/guides/${filteredArticles[0].slug}`} className="block">
                              <h3
                                style={{ color: '#E76F2E' }}
                                className="text-lg sm:text-2xl font-bold font-display hover:text-[#C65320] leading-snug transition-colors"
                              >
                                {filteredArticles[0].title}
                              </h3>
                            </Link>

                            <p className="mt-3 text-xs sm:text-sm text-[#1F2937] leading-relaxed font-normal">
                              {filteredArticles[0].excerpt}
                            </p>
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#EEE9E3] flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#1F2937] truncate">
                              By <span className="text-black font-bold">{filteredArticles[0].author.name}</span>
                            </span>
                            <Link
                              to={`/guides/${filteredArticles[0].slug}`}
                              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#FFF6E8] text-[#E76F2E] border border-[#FCD9BD] hover:bg-[#E76F2E] hover:text-white transition shadow-xs"
                            >
                              <span>Read Full Guide</span>
                              <Icons.ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    )}

                    {/* 3 Small Horizontal Cards */}
                    <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                      {filteredArticles.slice(1, 4).map((article: BlogArticle) => (
                        <article
                          key={article.id}
                          className="flex flex-row items-center gap-4 p-3.5 sm:p-4 bg-white border border-[#E7E0D7] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#E76F2E] hover:shadow-sm shadow-xs group"
                        >
                          <Link
                            to={`/guides/${article.slug}`}
                            className="relative w-28 sm:w-36 aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-[#F1ECE5] block"
                          >
                            <Img
                              src={article.featuredImage}
                              alt={article.featuredImageAlt}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#E76F2E] text-white shadow-xs">
                              {article.category}
                            </span>
                          </Link>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-[11px] text-[#1F2937] mb-1 font-semibold flex-wrap">
                              <span className="text-[#E76F2E] font-bold">{article.tag}</span>
                              <span>•</span>
                              <span>{article.readTime}</span>
                            </div>

                            <Link to={`/guides/${article.slug}`} className="block">
                              <h3
                                style={{ color: '#E76F2E' }}
                                className="text-xs sm:text-sm font-bold font-display hover:text-[#C65320] leading-snug transition-colors line-clamp-2"
                              >
                                {article.title}
                              </h3>
                            </Link>

                            <p className="mt-1 text-[11px] sm:text-xs text-[#1F2937] line-clamp-1 font-normal">
                              {article.excerpt}
                            </p>

                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-[#54504A]">
                                {article.updatedAt}
                              </span>
                              <Link
                                to={`/guides/${article.slug}`}
                                className="text-xs font-bold text-[#E76F2E] hover:text-[#C65320] flex items-center gap-0.5 transition"
                              >
                                <span>Read</span>
                                <Icons.ChevronRight size={12} />
                              </Link>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  {/* Remaining Articles on Page 1 (Articles 5-6) in Grid */}
                  {filteredArticles.length > 4 && (
                    <div className="mt-8">
                      <div className="mb-4 pb-2 border-b border-[#E7E0D7]">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                          More Recommended Guides &amp; Insights
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.slice(4, 6).map((article: BlogArticle) => (
                          <article
                            key={article.id}
                            className="flex flex-col bg-white border border-[#E7E0D7] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#E76F2E] hover:shadow-md shadow-sm group"
                          >
                            <Link
                              to={`/guides/${article.slug}`}
                              className="relative w-full aspect-[16/10] overflow-hidden bg-[#F1ECE5] block"
                            >
                              <Img
                                src={article.featuredImage}
                                alt={article.featuredImageAlt}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <span className="absolute top-3 left-3 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E76F2E] text-white shadow-md">
                                {article.category}
                              </span>
                            </Link>

                            <div className="p-5 flex flex-1 flex-col justify-between">
                              <div>
                                <div className="flex items-center gap-2 text-xs text-[#1F2937] mb-2 font-semibold flex-wrap">
                                  <span className="text-[#E76F2E] font-bold">{article.tag}</span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <Icons.Clock size={12} className="text-[#E76F2E]" /> {article.readTime}
                                  </span>
                                  <span>•</span>
                                  <span>{article.updatedAt}</span>
                                </div>

                                <Link to={`/guides/${article.slug}`} className="block">
                                  <h3
                                    style={{ color: '#E76F2E' }}
                                    className="text-base font-bold font-display hover:text-[#C65320] leading-snug transition-colors line-clamp-2"
                                  >
                                    {article.title}
                                  </h3>
                                </Link>

                                <p className="mt-2 text-xs sm:text-sm text-[#1F2937] leading-relaxed font-normal line-clamp-2">
                                  {article.excerpt}
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-[#EEE9E3] flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-[#1F2937] truncate">
                                  By <span className="text-black font-bold">{article.author.name}</span>
                                </span>
                                <Link
                                  to={`/guides/${article.slug}`}
                                  className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#FFF6E8] text-[#E76F2E] border border-[#FCD9BD] hover:bg-[#E76F2E] hover:text-white transition"
                                >
                                  <span>Read Guide</span>
                                  <Icons.ChevronRight size={14} />
                                </Link>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Page 2+ Standard 3-Column Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredArticles
                    .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
                    .map((article: BlogArticle) => (
                      <article
                        key={article.id}
                        className="flex flex-col bg-white border border-[#E7E0D7] rounded-xl overflow-hidden transition-all duration-300 hover:border-[#E76F2E] hover:shadow-md shadow-sm group"
                      >
                        <Link
                          to={`/guides/${article.slug}`}
                          className="relative w-full aspect-[16/10] overflow-hidden bg-[#F1ECE5] block"
                        >
                          <Img
                            src={article.featuredImage}
                            alt={article.featuredImageAlt}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#E76F2E] text-white shadow-md">
                            {article.category}
                          </span>
                        </Link>

                        <div className="p-5 flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#1F2937] mb-2 font-semibold flex-wrap">
                              <span className="text-[#E76F2E] font-bold">{article.tag}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Icons.Clock size={12} className="text-[#E76F2E]" /> {article.readTime}
                              </span>
                              <span>•</span>
                              <span>{article.updatedAt}</span>
                            </div>

                            <Link to={`/guides/${article.slug}`} className="block">
                              <h3
                                style={{ color: '#E76F2E' }}
                                className="text-base font-bold font-display hover:text-[#C65320] leading-snug transition-colors line-clamp-2"
                              >
                                {article.title}
                              </h3>
                            </Link>

                            <p className="mt-2 text-xs sm:text-sm text-[#1F2937] leading-relaxed font-normal line-clamp-2">
                              {article.excerpt}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#EEE9E3] flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-[#1F2937] truncate">
                              By <span className="text-black font-bold">{article.author.name}</span>
                            </span>
                            <Link
                              to={`/guides/${article.slug}`}
                              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-[#FFF6E8] text-[#E76F2E] border border-[#FCD9BD] hover:bg-[#E76F2E] hover:text-white transition"
                            >
                              <span>Read Guide</span>
                              <Icons.ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              )}

              {/* Clean Interactive Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2 pt-6 border-t border-[#E7E0D7]">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold border border-[#E7E0D7] bg-white text-black hover:bg-[#F1ECE5] hover:border-[#E76F2E] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <Icons.ChevronLeft size={14} />
                    <span>Previous</span>
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePageChange(idx + 1)}
                      className={`w-10 h-10 rounded-lg text-xs font-bold transition cursor-pointer ${
                        currentPage === idx + 1
                          ? 'bg-[#E76F2E] text-white shadow-sm'
                          : 'border border-[#E7E0D7] bg-white text-black hover:bg-[#F1ECE5] hover:border-[#E76F2E]'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className="px-4 py-2.5 rounded-lg text-xs font-bold border border-[#E7E0D7] bg-white text-black hover:bg-[#F1ECE5] hover:border-[#E76F2E] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    <span>Next</span>
                    <Icons.ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Bottom Contextual Consultation Strip */}
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-[#E7E0D7] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E76F2E] block mb-1">
              Custom Architectural Blueprint Consultation
            </span>
            <h3 className="text-lg sm:text-xl font-display font-bold text-black">
              Planning a house construction project in Central India?
            </h3>
            <p className="text-xs sm:text-sm text-[#1F2937] mt-1 max-w-xl font-normal">
              Book a 1-on-1 consultation with our senior civil engineers and Vastu architects to review your plot layout, setbacks, and budget estimates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenConsult('Consultation from Guides Hub Page')}
            className="shrink-0 px-6 py-3 rounded-lg text-xs sm:text-sm font-bold bg-[#E76F2E] text-white hover:bg-[#C65320] transition shadow-md cursor-pointer"
          >
            Book Architect Consultation →
          </button>
        </div>
      </div>
    </div>
  )
}
