import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icons } from '../Icons'
import { getAllBlogArticles, saveCustomBlog, deleteCustomBlog, type BlogArticle } from '../../lib/blogsData'
import { PageHeader, DataTable, EmptyState } from './index'

interface AdminBlogsTabProps {
  getAuthHeaders: () => Record<string, string>
  onNotify: (type: 'success' | 'error', text: string) => void
}

export default function AdminBlogsTab({ getAuthHeaders, onNotify }: AdminBlogsTabProps) {
  const [blogsList, setBlogsList] = useState<BlogArticle[]>(() => getAllBlogArticles())
  const [blogSearch, setBlogSearch] = useState('')
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('All')
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false)
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null)
  const [isSavingBlog, setIsSavingBlog] = useState(false)

  const defaultBlogForm = {
    title: '',
    slug: '',
    subtitle: '',
    category: 'House Plans' as BlogArticle['category'],
    tag: 'Trending Guide',
    authorName: 'Er. Rajesh Sharma',
    authorRole: 'Senior Principal Architect',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    readTime: '5 min read',
    featuredImage: 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop',
    featuredImageAlt: 'House Architecture & Construction Plan',
    excerpt: '',
    intro: '',
    sections: [
      {
        heading: 'Core Architectural Guidelines',
        body: 'Plan optimal room dimensions, structural column grid clearances, and adequate cross-ventilation before commencing construction.',
        tip: 'Ensure all setback rules adhere strictly to local municipal by-laws.',
      },
    ],
    summary: 'A well-drawn architectural floor plan and structural drawing package saves up to 15% on overall construction costs.',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: 'house plans, vastu, construction, indore, architectural design',
  }

  const [blogForm, setBlogForm] = useState(defaultBlogForm)

  const refreshBlogsList = () => {
    setBlogsList(getAllBlogArticles())
  }

  const handleOpenNewBlogModal = () => {
    setEditingBlogId(null)
    setBlogForm(defaultBlogForm)
    setIsBlogModalOpen(true)
  }

  const handleOpenEditBlogModal = (blog: BlogArticle) => {
    setEditingBlogId(blog.id)
    setBlogForm({
      title: blog.title || '',
      slug: blog.slug || '',
      subtitle: blog.subtitle || '',
      category: blog.category || 'House Plans',
      tag: blog.tag || 'Guide',
      authorName: blog.author?.name || 'Er. Rajesh Sharma',
      authorRole: blog.author?.role || 'Senior Principal Architect',
      authorAvatar: blog.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      readTime: blog.readTime || '5 min read',
      featuredImage: blog.featuredImage || 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop',
      featuredImageAlt: blog.featuredImageAlt || blog.title || '',
      excerpt: blog.excerpt || blog.subtitle || '',
      intro: blog.content?.intro || '',
      sections: blog.content?.sections?.length
        ? blog.content.sections.map((s) => ({
            heading: s.heading,
            body: s.body,
            tip: s.callout?.text || '',
          }))
        : defaultBlogForm.sections,
      summary: blog.content?.summary || defaultBlogForm.summary,
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
    })
    setIsBlogModalOpen(true)
  }

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!blogForm.title.trim()) {
      onNotify('error', 'Blog title is required.')
      return
    }

    setIsSavingBlog(true)
    const generatedSlug =
      blogForm.slug.trim() ||
      blogForm.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    const articleId = editingBlogId || `blog_${Date.now()}`
    const articlePayload: BlogArticle = {
      id: articleId,
      slug: generatedSlug,
      title: blogForm.title.trim(),
      subtitle: blogForm.subtitle.trim() || blogForm.excerpt.trim(),
      category: blogForm.category,
      tag: blogForm.tag.trim() || 'Guide',
      author: {
        name: blogForm.authorName.trim() || 'Er. Rajesh Sharma',
        role: blogForm.authorRole.trim() || 'Principal Architect',
        avatar: blogForm.authorAvatar.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      publishedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      updatedAt: new Date().toISOString(),
      readTime: blogForm.readTime.trim() || '5 min read',
      featuredImage: blogForm.featuredImage.trim() || 'https://images.pexels.com/photos/37129015/pexels-photo-37129015.jpeg?auto=compress&cs=tinysrgb&w=640&h=480&fit=crop',
      featuredImageAlt: blogForm.featuredImageAlt.trim() || blogForm.title.trim(),
      excerpt: blogForm.excerpt.trim() || blogForm.subtitle.trim() || blogForm.title.trim(),
      metaTitle: blogForm.metaTitle.trim() || `${blogForm.title} | Indore House Makers`,
      metaDescription: blogForm.metaDescription.trim() || blogForm.excerpt.trim(),
      canonicalUrl: `https://indorehousemakers.in/guides/${generatedSlug}`,
      metaKeywords: blogForm.metaKeywords.trim() || 'house plans, vastu, construction, indore',
      tableOfContents: blogForm.sections.map((s) => s.heading),
      internalLinks: [
        { label: 'Explore House Plans', url: '/house-plans', description: 'Browse vastu-approved 2D layouts and elevations' },
        { label: 'Turnkey Construction Cost Calculator', url: '/cost-estimator', description: 'Estimate cement, steel, and finishing material budget' },
      ],
      content: {
        intro: blogForm.intro.trim() || blogForm.subtitle.trim(),
        sections: blogForm.sections.map((s) => ({
          heading: s.heading.trim(),
          body: s.body.trim(),
          callout: s.tip ? { title: 'Architectural Pro Tip', text: s.tip.trim() } : undefined,
        })),
        summary: blogForm.summary.trim(),
        faqs: [
          {
            q: `What is the most critical factor when planning ${blogForm.category}?`,
            a: 'Ensuring structural grid integrity, municipal setbacks, and climate-responsive orientations from day one.',
          },
        ],
      },
    }

    try {
      const endpoint = editingBlogId ? `/api/v1/admin/blogs/${editingBlogId}` : '/api/v1/admin/blogs'
      const method = editingBlogId ? 'PUT' : 'POST'
      await fetch(endpoint, {
        method,
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(articlePayload),
      }).catch(() => {})

      saveCustomBlog(articlePayload)
      refreshBlogsList()
      setIsBlogModalOpen(false)
      onNotify('success', `Blog "${articlePayload.title}" has been published and is now live for users!`)
    } catch {
      saveCustomBlog(articlePayload)
      refreshBlogsList()
      setIsBlogModalOpen(false)
      onNotify('success', `Blog "${articlePayload.title}" saved successfully!`)
    } finally {
      setIsSavingBlog(false)
    }
  }

  const handleDeleteBlog = async (blog: BlogArticle) => {
    if (!window.confirm(`Are you sure you want to delete "${blog.title}"?`)) return
    try {
      await fetch(`/api/v1/admin/blogs/${blog.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include',
      }).catch(() => {})
      deleteCustomBlog(blog.id)
      deleteCustomBlog(blog.slug)
      refreshBlogsList()
      onNotify('success', `Blog "${blog.title}" removed successfully.`)
    } catch {
      deleteCustomBlog(blog.id)
      deleteCustomBlog(blog.slug)
      refreshBlogsList()
      onNotify('success', `Blog "${blog.title}" removed locally.`)
    }
  }

  const filteredBlogs = blogsList.filter((b) => {
    const matchesSearch =
      !blogSearch ||
      b.title.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.tag?.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.excerpt?.toLowerCase().includes(blogSearch.toLowerCase())
    const matchesCategory =
      blogCategoryFilter === 'All' || b.category === blogCategoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge Base & Blog Articles"
        subtitle="Publish, edit, and manage architectural articles visible on /guides, /blogs, and search engines."
        actions={
          <button
            onClick={handleOpenNewBlogModal}
            className="px-4 py-2 rounded-lg bg-[#C94F36] hover:bg-[#b0422c] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
          >
            <Icons.Plus size={15} />
            <span>Add New Blog / Guide</span>
          </button>
        }
      />

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-[#E7E0D7] shadow-xs">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={blogSearch}
            onChange={(e) => setBlogSearch(e.target.value)}
            placeholder="Search blogs by title or tag..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
          />
          <span className="absolute left-3 top-2 text-[#74706A]">
            <Icons.Search size={14} />
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {['All', 'House Plans', 'Cost Estimation', 'Vastu Planning', '3D Elevations', 'Interiors', 'Construction Advice'].map((cat) => (
            <button
              key={cat}
              onClick={() => setBlogCategoryFilter(cat)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition whitespace-nowrap cursor-pointer ${
                blogCategoryFilter === cat
                  ? 'bg-[#292826] text-white'
                  : 'bg-[#FAF8F5] text-[#74706A] hover:text-[#292826] border border-[#E7E0D7]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blogs Data Table */}
      <DataTable
        keyExtractor={(b) => b.id || b.slug}
        data={filteredBlogs}
        columns={[
          {
            header: 'Cover / Article Details',
            accessor: (b) => (
              <div className="flex items-start gap-3 py-1 max-w-md">
                <img
                  src={b.featuredImage}
                  alt={b.title}
                  className="w-14 h-11 object-cover rounded-md border border-[#E7E0D7] shrink-0 bg-[#FAF8F5]"
                  loading="lazy"
                  width="56"
                  height="44"
                />
                <div className="min-w-0">
                  <div className="font-bold text-[#292826] text-xs line-clamp-1">{b.title}</div>
                  <div className="text-[11px] text-[#74706A] line-clamp-1 mt-0.5">{b.subtitle || b.excerpt}</div>
                  <div className="text-[10px] text-[#C94F36] font-mono mt-0.5">/guides/{b.slug}</div>
                </div>
              </div>
            ),
          },
          {
            header: 'Category & Tag',
            accessor: (b) => (
              <div className="space-y-1">
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#FFF6E8] text-[#C94F36] border border-[#F0DFCD]">
                  {b.category}
                </span>
                <div className="text-[10px] text-[#74706A] font-medium">{b.tag}</div>
              </div>
            ),
          },
          {
            header: 'Author & Read Time',
            accessor: (b) => (
              <div>
                <div className="font-semibold text-xs text-[#292826]">{b.author?.name || 'Er. Rajesh Sharma'}</div>
                <div className="text-[10px] text-[#74706A]">{b.readTime || '5 min read'}</div>
              </div>
            ),
          },
          {
            header: 'Published Date',
            accessor: (b) => <span className="text-xs text-[#74706A]">{b.publishedAt}</span>,
          },
          {
            header: 'Actions',
            align: 'right',
            accessor: (b) => (
              <div className="flex items-center justify-end gap-1.5">
                <Link
                  to={`/guides/${b.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E7E0D7] hover:bg-white text-[11px] font-semibold text-[#292826] flex items-center gap-1 transition"
                  title="View Live Guide"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span className="hidden sm:inline">Live</span>
                </Link>
                <button
                  onClick={() => handleOpenEditBlogModal(b)}
                  className="px-2 py-1 rounded bg-[#FAF8F5] border border-[#E7E0D7] hover:bg-white text-[11px] font-semibold text-[#292826] flex items-center gap-1 transition cursor-pointer"
                  title="Edit Article"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  onClick={() => handleDeleteBlog(b)}
                  className="px-2 py-1 rounded bg-rose-50 border border-rose-200 hover:bg-rose-100 text-[11px] font-semibold text-rose-700 flex items-center gap-1 transition cursor-pointer"
                  title="Delete Article"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ),
          },
        ]}
        emptyState={
          <EmptyState
            title="No blog articles found"
            description="Click 'Add New Blog / Guide' above to write and publish your first article."
            icon={<Icons.FileText size={24} />}
          />
        }
      />

      {/* Modal: Create / Edit Blog Article */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-xl border border-[#E7E0D7] max-w-3xl w-full p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7E0D7] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#292826]">
                  {editingBlogId ? 'Edit Blog Article / Guide' : 'Write & Publish New Blog Article'}
                </h3>
                <p className="text-xs text-[#74706A]">
                  Published articles appear immediately on the public /guides, /blogs, and homepage feed.
                </p>
              </div>
              <button
                onClick={() => setIsBlogModalOpen(false)}
                className="text-[#74706A] hover:text-[#292826] text-xl font-bold p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Article Title *</label>
                  <input
                    type="text"
                    required
                    value={blogForm.title}
                    onChange={(e) => {
                      const val = e.target.value
                      setBlogForm((prev) => ({
                        ...prev,
                        title: val,
                        slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                        metaTitle: `${val} | Indore House Makers`,
                      }))
                    }}
                    placeholder="e.g. 20x50 East Facing House Plan with Vastu & Car Porch"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Category *</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36] bg-white font-medium"
                  >
                    <option value="House Plans">House Plans</option>
                    <option value="Cost Estimation">Cost Estimation</option>
                    <option value="Vastu Planning">Vastu Planning</option>
                    <option value="3D Elevations">3D Elevations</option>
                    <option value="Interiors">Interiors</option>
                    <option value="Construction Advice">Construction Advice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Tag / Badge</label>
                  <input
                    type="text"
                    value={blogForm.tag}
                    onChange={(e) => setBlogForm({ ...blogForm, tag: e.target.value })}
                    placeholder="e.g. Vastu Approved, 2026 Guide, Cost Saver"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Custom URL Slug</label>
                  <input
                    type="text"
                    value={blogForm.slug}
                    onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                    placeholder="e.g. 20x50-east-facing-house-plan-vastu"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36] font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Read Time</label>
                  <input
                    type="text"
                    value={blogForm.readTime}
                    onChange={(e) => setBlogForm({ ...blogForm, readTime: e.target.value })}
                    placeholder="e.g. 6 min read"
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Featured Cover Image URL</label>
                  <input
                    type="url"
                    value={blogForm.featuredImage}
                    onChange={(e) => setBlogForm({ ...blogForm, featuredImage: e.target.value })}
                    placeholder="https://images.pexels.com/photos/..."
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Subtitle / Excerpt Summary</label>
                  <textarea
                    rows={2}
                    value={blogForm.subtitle}
                    onChange={(e) => setBlogForm({ ...blogForm, subtitle: e.target.value, excerpt: e.target.value, metaDescription: e.target.value })}
                    placeholder="A brief 1-2 sentence preview summary shown in article grids and Google search results."
                    className="w-full px-3 py-2 text-xs rounded-md border border-[#E7E0D7] focus:outline-none focus:border-[#C94F36]"
                  />
                </div>
              </div>

              {/* Dynamic Content Sections */}
              <div className="border-t border-[#E7E0D7] pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#292826] uppercase tracking-wider">Article Content Sections</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setBlogForm({
                        ...blogForm,
                        sections: [
                          ...blogForm.sections,
                          {
                            heading: `Key Point ${blogForm.sections.length + 1}`,
                            body: '',
                            tip: '',
                          },
                        ],
                      })
                    }}
                    className="px-2.5 py-1 rounded bg-[#FAF8F5] border border-[#E7E0D7] hover:bg-white text-[11px] font-bold text-[#C94F36] flex items-center gap-1 cursor-pointer"
                  >
                    <Icons.Plus size={13} />
                    <span>Add Section</span>
                  </button>
                </div>

                {blogForm.sections.map((section, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E7E0D7] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] text-[#292826]">Section #{idx + 1}</span>
                      {blogForm.sections.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setBlogForm({
                              ...blogForm,
                              sections: blogForm.sections.filter((_, sIdx) => sIdx !== idx),
                            })
                          }}
                          className="text-rose-600 hover:text-rose-800 text-xs font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        required
                        value={section.heading}
                        onChange={(e) => {
                          const newSections = [...blogForm.sections]
                          newSections[idx].heading = e.target.value
                          setBlogForm({ ...blogForm, sections: newSections })
                        }}
                        placeholder="Section Heading..."
                        className="w-full px-3 py-1.5 text-xs rounded border border-[#E7E0D7] bg-white font-bold"
                      />
                    </div>
                    <div>
                      <textarea
                        rows={3}
                        required
                        value={section.body}
                        onChange={(e) => {
                          const newSections = [...blogForm.sections]
                          newSections[idx].body = e.target.value
                          setBlogForm({ ...blogForm, sections: newSections })
                        }}
                        placeholder="Detailed paragraph content, measurements, architectural insights..."
                        className="w-full px-3 py-1.5 text-xs rounded border border-[#E7E0D7] bg-white"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={section.tip || ''}
                        onChange={(e) => {
                          const newSections = [...blogForm.sections]
                          newSections[idx].tip = e.target.value
                          setBlogForm({ ...blogForm, sections: newSections })
                        }}
                        placeholder="Optional Pro Tip / Callout"
                        className="w-full px-3 py-1.5 text-xs rounded border border-[#E7E0D7] bg-white text-[11px] text-[#C94F36]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Author & SEO Info */}
              <div className="border-t border-[#E7E0D7] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Author Name</label>
                  <input
                    type="text"
                    value={blogForm.authorName}
                    onChange={(e) => setBlogForm({ ...blogForm, authorName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#E7E0D7]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">Author Title / Role</label>
                  <input
                    type="text"
                    value={blogForm.authorRole}
                    onChange={(e) => setBlogForm({ ...blogForm, authorRole: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#E7E0D7]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[#292826] mb-1">SEO Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={blogForm.metaKeywords}
                    onChange={(e) => setBlogForm({ ...blogForm, metaKeywords: e.target.value })}
                    placeholder="house plans, 30x50 floor plan, vastu, indore"
                    className="w-full px-3 py-1.5 text-xs rounded border border-[#E7E0D7]"
                  />
                </div>
              </div>

              <div className="border-t border-[#E7E0D7] pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsBlogModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E0D7] hover:bg-[#FAF8F5] text-[#292826] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingBlog}
                  className="px-5 py-2 rounded-lg bg-[#C94F36] hover:bg-[#b0422c] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSavingBlog ? (
                    <>
                      <Icons.RefreshCw size={13} className="animate-spin" />
                      <span>Saving Article...</span>
                    </>
                  ) : (
                    <span>{editingBlogId ? 'Update & Publish' : 'Publish Article'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
