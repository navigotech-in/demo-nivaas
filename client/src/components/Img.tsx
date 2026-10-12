import { useState } from 'react'

interface ImgProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  sizes?: string
  width?: number | string
  height?: number | string
  fetchPriority?: 'high' | 'low' | 'auto'
}

// Automatically optimize remote CDN images (Unsplash/Pexels) to prevent massive payloads
function optimizeImageUrl(url: string, targetWidth?: number | string): string {
  if (!url) return url
  const numW = targetWidth && !isNaN(Number(targetWidth)) ? Number(targetWidth) : 550
  const w = Math.max(300, Math.min(numW, 800))
  if (url.includes('images.unsplash.com')) {
    if (!url.includes('w=')) {
      return url.includes('?') ? `${url}&w=${w}&auto=format&fit=crop&q=70` : `${url}?w=${w}&auto=format&fit=crop&q=70`
    }
  }
  if (url.includes('images.pexels.com')) {
    if (!url.includes('w=')) {
      return url.includes('?') ? `${url}&w=${w}&auto=compress&cs=tinysrgb` : `${url}?w=${w}&auto=compress&cs=tinysrgb`
    }
  }
  return url
}

export default function Img({
  src,
  alt,
  className,
  loading = 'lazy',
  sizes,
  width,
  height,
  fetchPriority,
}: ImgProps) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)

  if (failed) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          background: 'linear-gradient(135deg, #F0EBE6 0%, #E7E0D7 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 6.5 6.5 14h2.3v10h5v-6h4.4v6h5V14h2.3L16 6.5Z" fill="#B9B2AB" />
        </svg>
      </div>
    )
  }

  const optimizedSrc = optimizeImageUrl(src, width)

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      sizes={sizes}
      width={width}
      height={height}
      onLoad={() => setLoaded(true)}
      className={`${className || ''} ${!loaded && loading === 'lazy' ? 'opacity-90' : 'opacity-100'} transition-opacity duration-300`}
      onError={() => setFailed(true)}
    />
  )
}