'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Chapter {
  chapter_id: string
  name: string
  date?: string
}

interface Props {
  mangaId: string
  chapters: Chapter[]
  readChapters?: string[]
}

function fmt(d: string) {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return d }
}

export default function ChapterList({ mangaId, chapters, readChapters = [] }: Props) {
  const [showAll, setShowAll] = useState(false)
  const LIMIT = 30
  const visible = showAll ? chapters : chapters.slice(0, LIMIT)

  if (!chapters.length) {
    return (
      <div className="empty" style={{ padding: '32px 0' }}>
        <div className="empty-icon">📭</div>
        <div className="empty-text">Belum ada chapter</div>
      </div>
    )
  }

  return (
    <div>
      <div className="chapter-list">
        {visible.map((ch, i) => {
          const isRead = readChapters.includes(ch.chapter_id)
          const isNew = i < 3
          return (
            <Link key={ch.chapter_id} href={`/manga/${mangaId}/${ch.chapter_id}`} className={`chapter-item${isRead ? ' read' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isNew && !isRead && <span className="chapter-new" />}
                <div>
                  <div className="chapter-name">{ch.name}</div>
                  {ch.date && <div className="chapter-date">{fmt(ch.date)}</div>}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--gray-3)', flexShrink: 0 }}>
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </Link>
          )
        })}
      </div>

      {chapters.length > LIMIT && (
        <button onClick={() => setShowAll(!showAll)} className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
          {showAll ? '↑ Tampilkan lebih sedikit' : `↓ Tampilkan semua ${chapters.length} chapter`}
        </button>
      )}
    </div>
  )
}
