'use client'

import Link from 'next/link'

interface MangaCardProps {
  manga_id: string
  title: string
  cover: string
  status?: string
  score?: number | null
  type?: string | null
  bookmark_count?: number
  country?: string | null
  chapter?: string | null
}

function getTypeBadge(country: string | null | undefined) {
  if (!country) return null
  if (country === 'KR') return { label: 'Manhwa', cls: 'badge-red' }
  if (country === 'CN') return { label: 'Manhua', cls: 'badge-yellow' }
  if (country === 'JP') return { label: 'Manga', cls: 'badge-gray' }
  return null
}

export default function MangaCard({ manga_id, title, cover, status, country, score, chapter }: MangaCardProps) {
  const badge = getTypeBadge(country)

  return (
    <Link href={`/manga/${manga_id}`} className="manga-card" aria-label={`Baca ${title}`}>
      <div className="manga-card-cover">
        {cover ? (
          <img
            src={cover}
            alt={title}
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.png' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '24px' }}>
            📖
          </div>
        )}
        <div className="manga-card-overlay" />

        {badge && (
          <div className="manga-card-badge">
            <span className={`badge ${badge.cls}`}>{badge.label}</span>
          </div>
        )}
      </div>

      <div className="manga-card-info">
        <div className="manga-card-title">{title}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {score != null && (
            <span className="manga-card-meta">⭐ {Number(score).toFixed(1)}</span>
          )}
          {status && (
            <span className={`badge ${status === 'Ongoing' ? 'badge-green' : 'badge-gray'}`} style={{ fontSize: '10px', padding: '2px 7px' }}>
              {status}
            </span>
          )}
        </div>
        {chapter && <div className="manga-card-chapter">{chapter}</div>}
      </div>
    </Link>
  )
}
