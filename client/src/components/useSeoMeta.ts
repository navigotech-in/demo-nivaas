import { useEffect } from 'react'

export interface SeoMetaProps {
  title?: string
  description?: string
  keywords?: string
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article'
}

const DEFAULT_TITLE = 'Indore House Makers — AI-Powered Architecture, House Plans & 3D Elevations'
const DEFAULT_DESC = 'Discover 480+ 100% Vastu-compliant Indian house plans, photorealistic 3D front elevations, luxury modular interior designs, and construction cost estimates across 60+ Indian cities.'
const DEFAULT_CANONICAL = 'https://indorehousemakers.in/'
const DEFAULT_OG_IMAGE = 'https://images.pexels.com/photos/31737861/pexels-photo-31737861.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop'

export function useSeoMeta({
  title,
  description,
  keywords,
  canonicalUrl,
  ogImage,
  ogType = 'website',
}: SeoMetaProps) {
  useEffect(() => {
    // 1. Title Tag
    const resolvedTitle = title ? (title.includes('Indore House Makers') ? title : `${title} | Indore House Makers`) : DEFAULT_TITLE
    document.title = resolvedTitle

    // 2. Meta Description
    let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = description || DEFAULT_DESC

    // 3. Meta Keywords
    if (keywords) {
      let metaKeywords = document.querySelector<HTMLMetaElement>('meta[name="keywords"]')
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta')
        metaKeywords.name = 'keywords'
        document.head.appendChild(metaKeywords)
      }
      metaKeywords.content = keywords
    }

    // 4. Canonical URL
    let linkCanonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!linkCanonical) {
      linkCanonical = document.createElement('link')
      linkCanonical.rel = 'canonical'
      document.head.appendChild(linkCanonical)
    }
    linkCanonical.href = canonicalUrl || DEFAULT_CANONICAL

    // 5. Open Graph Meta Tags
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = resolvedTitle

    const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]')
    if (ogDesc) ogDesc.content = description || DEFAULT_DESC

    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    if (ogUrl) ogUrl.content = canonicalUrl || DEFAULT_CANONICAL

    const ogImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]')
    if (ogImg) ogImg.content = ogImage || DEFAULT_OG_IMAGE

    const ogTypeMeta = document.querySelector<HTMLMetaElement>('meta[property="og:type"]')
    if (ogTypeMeta) ogTypeMeta.content = ogType

    // 6. Twitter Card Meta Tags
    const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
    if (twitterTitle) twitterTitle.content = resolvedTitle

    const twitterDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]')
    if (twitterDesc) twitterDesc.content = description || DEFAULT_DESC

    const twitterImg = document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]')
    if (twitterImg) twitterImg.content = ogImage || DEFAULT_OG_IMAGE
  }, [title, description, keywords, canonicalUrl, ogImage, ogType])
}
