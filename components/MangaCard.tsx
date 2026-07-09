'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Props {
  manga_id: string
  title: string
  cover: string
  cover_portrait?: string
  status?: string
  country?: string
  score?: number
}

function countryBadge(country: string) {
  const m: Record<string, string> = { KR: 'Manhwa', CN: 'Manhua', JP: 'Manga' }
  return m[country?.toUpperCase()] || null
}

export default function MangaCard({ manga_id, title, cover, cover_portrait, status, country, score }: Props) {
  const [imgErr, setImgErr] = useState(false)
  const src = cover_portrait || cover
  const badge = country ? countryBadge(country) : null

  return (
    <Link href={`/manga/${manga_id}`} className="manga-card">
      <div className="manga-card-cover">
        {!imgErr && src ? (
          <img src={src} alt={title} onError={() => setImgErr(true)} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-3)', color: 'var(--gray-2)', fontSize: 28 }}>📖</div>
        )}
        <div className="manga-card-overlay" />
        {badge && <div className="manga-card-badge"><span className="badge badge-red">{badge}</span></div>}
        {score && (
          <div style={{ position: 'absolute', bottom: 8, right: 8, fontSize: 11, fontWeight: 700, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 2 }}>
            ★ {score.toFixed(1)}
          </div>
        )}
      </div>
      <div className="manga-card-info">
        <div className="manga-card-title">{title}</div>
        <div className="manga-card-meta">
          <span style={{
            display: 'inline-flex', alignItems: 'center',
            fontSize: 10, fontWeight: 600, letterSpacing: 0.3,
            color: status === 'Completed' ? 'var(--gray-2)' : '#4ade80',
          }}>
            {status === 'Completed' ? '✓ Tamat' : '● Ongoing'}
          </span>
        </div>
      </div>
    </Link>
  )
}
