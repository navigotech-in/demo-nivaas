import { useState } from 'react'

interface ImgProps {
  src: string
  alt: string
  className?: string
  loading?: 'lazy' | 'eager'
  sizes?: string
}

// Gentle fallback if a remote photo cannot load (e.g. no internet during the
// client demo). Keeps the layout intact instead of showing a broken image.
export default function Img({ src, alt, className, loading = 'lazy', sizes }: ImgProps) {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt}
        style={{
          background: 'linear-gradient(135deg, #EDF1EC 0%, #E7E3DC 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="48" height="48" viewBox="0 0 32 32" fill="none" aria-hidden="true">
          <path d="M16 6.5 6.5 14h2.3v10h5v-6h4.4v6h5V14h2.3L16 6.5Z" fill="#A9B3A8" />
        </svg>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  )
}