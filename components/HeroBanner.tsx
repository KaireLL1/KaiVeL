'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface BannerItem {
  manga_id: string
  title: string
  cover: string
  score?: number
  status?: string
  genres?: string[]
}

const INTERVAL_MS = 5000

export default function HeroBanner() {
  const [items, setItems] = useState<BannerItem[]>([])
  const [active, setActive] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Touch swipe
  const touchStart = useRef(0)

  useEffect(() => {
    fetch('/api/manga/explore?sort=popular&limit=10')
      .then(r => r.json())
      .then(json => {
        const list: BannerItem[] = (json.data || []).slice(0, 8).map((d: any) => ({
          manga_id: d.manga_id,
          title: d.title,
          cover: d.cover_portrait_url || d.cover_image_url || '',
          score: d.score,
          status: d.status === 1 ? 'Ongoing' : d.status === 2 ? 'Completed' : '',
          genres: (d.genres || []).slice(0, 3).map((g: any) => g.name || g),
        }))
        setItems(list)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  const goTo = useCallback((idx: number) => {
    setActive(idx)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const next = useCallback(() => {
    setActive(p => (p + 1) % (items.length || 1))
  }, [items.length])

  // Auto-play
  useEffect(() => {
    if (!items.length) return
    timerRef.current = setTimeout(next, INTERVAL_MS)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, items.length, next])

  // Swipe handlers
  function onTouchStart(e: React.TouchEvent) { touchStart.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const delta = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) {
      if (delta > 0) setActive(p => (p + 1) % items.length)
      else setActive(p => (p - 1 + items.length) % items.length)
    }
  }

  if (!loaded) {
    return (
      <div className="hero-banner hero-banner--skeleton">
        <div className="hero-banner-skeleton-shimmer" />
      </div>
    )
  }

  if (!items.length) return null

  const current = items[active]

  return (
    <div
      className="hero-banner"
      ref={containerRef}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Background slides */}
      {items.map((item, i) => (
        <div
          key={item.manga_id}
          className={`hero-banner-bg ${i === active ? 'active' : ''}`}
          style={{ backgroundImage: `url(${item.cover})` }}
          aria-hidden={i !== active}
        />
      ))}

      {/* Gradient overlay */}
      <div className="hero-banner-overlay" />

      {/* Content */}
      <div className="hero-banner-content container">
        <div className="hero-banner-inner">
          {/* Cover portrait */}
          <div className="hero-banner-cover">
            {items.map((item, i) => (
              <img
                key={item.manga_id}
                src={item.cover}
                alt={item.title}
                className={`hero-banner-cover-img ${i === active ? 'active' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
              />
            ))}
          </div>

          {/* Text info */}
          <div className="hero-banner-info">
            {current.genres?.length ? (
              <div className="hero-banner-genres">
                {current.genres.map(g => (
                  <span key={g} className="hero-banner-genre-badge">{g}</span>
                ))}
              </div>
            ) : null}

            <h1 className="hero-banner-title">{current.title}</h1>

            <div className="hero-banner-meta">
              {current.score ? (
                <span className="hero-banner-score">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="1">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  {Number(current.score).toFixed(1)}
                </span>
              ) : null}
              {current.status ? (
                <span className={`hero-banner-status ${current.status === 'Ongoing' ? 'ongoing' : 'done'}`}>
                  {current.status}
                </span>
              ) : null}
            </div>

            <div className="hero-banner-actions">
              <Link href={`/manga/${current.manga_id}`} className="btn btn-primary" style={{ padding: '11px 24px', fontSize: 14, gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Baca Sekarang
              </Link>
              <Link href="/explore" className="btn btn-ghost" style={{ padding: '11px 20px', fontSize: 14 }}>
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dots navigation */}
      <div className="hero-banner-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`hero-banner-dot ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      <div className="hero-banner-strip">
        {items.map((item, i) => (
          <button
            key={item.manga_id}
            className={`hero-banner-strip-item ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
          >
            <img src={item.cover} alt={item.title} />
            <div className="hero-banner-strip-overlay" />
          </button>
        ))}
      </div>
    </div>
  )
}
