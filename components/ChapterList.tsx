'use client'

import Link from 'next/link'
import { useState } from 'react'

interface Chapter {
  chapter_id: string
  name: string
  date?: string | null
}

interface ChapterListProps {
  chapters: Chapter[]
  mangaId: string
  readHistory?: string[]
}

export default function ChapterList({ chapters, mangaId, readHistory = [] }: ChapterListProps) {
  const [showAll, setShowAll] = useState(false)
  const LIMIT = 50

  const displayed = showAll ? chapters : chapters.slice(0, LIMIT)

  function formatDate(d?: string | null) {
    if (!d) return ''
    try {
      return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return '' }
  }

  if (!chapters.length) {
    return (
      <div className="empty" style={{ padding: '40px 0' }}>
        <div className="empty-icon">📭</div>
        <div className="empty-text">Belum ada chapter tersedia</div>
      </div>
    )
  }

  return (
    <div>
      <div className="chapter-list">
        {displayed.map((ch) => {
          const isRead = readHistory.includes(ch.chapter_id)
          return (
            <Link
              key={ch.chapter_id}
              href={`/manga/${mangaId}/${ch.chapter_id}`}
              className={`chapter-item ${isRead ? 'read' : ''}`}
              aria-label={`Baca ${ch.name}`}
            >
              <div>
                <div className="chapter-name">{ch.name}</div>
                {ch.date && <div className="chapter-date">{formatDate(ch.date)}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {!isRead && <div className="chapter-new" title="Belum dibaca" />}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </Link>
          )
        })}
      </div>

      {chapters.length > LIMIT && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button
            className="btn btn-ghost"
            onClick={() => setShowAll(!showAll)}
            style={{ fontSize: 13 }}
          >
            {showAll ? '▲ Tampilkan lebih sedikit' : `▼ Tampilkan semua ${chapters.length} chapter`}
          </button>
        </div>
      )}
    </div>
  )
}
