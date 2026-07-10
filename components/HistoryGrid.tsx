'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface HistoryItem {
  manga_id: string
  manga_title?: string
  manga_cover?: string
  chapter_name?: string
  read_at: string
}

export default function HistoryGrid({ items }: { items: HistoryItem[] }) {
  const [enriched, setEnriched] = useState<HistoryItem[]>(items)

  // Fetch cover & title untuk item yang belum punya — di sisi client, tidak akan timeout di server
  useEffect(() => {
    const needsFetch = items.filter(h => !h.manga_cover || !h.manga_title)
    if (needsFetch.length === 0) return

    Promise.all(
      needsFetch.map(async h => {
        try {
          const res = await fetch(`/api/manga/${h.manga_id}`)
          if (!res.ok) return null
          const json = await res.json()
          const d = json?.data
          return {
            manga_id: h.manga_id,
            manga_title: d?.title || h.manga_title || '',
            manga_cover: d?.cover_portrait_url || d?.cover_image_url || h.manga_cover || '',
          }
        } catch {
          return null
        }
      })
    ).then(results => {
      const map = new Map<string, Partial<HistoryItem>>()
      results.forEach(r => { if (r) map.set(r.manga_id, r) })

      setEnriched(prev =>
        prev.map(h => {
          const patch = map.get(h.manga_id)
          if (!patch) return h
          return {
            ...h,
            manga_title: patch.manga_title || h.manga_title,
            manga_cover: patch.manga_cover || h.manga_cover,
          }
        })
      )
    })
  }, [items])

  if (enriched.length === 0) return null

  return (
    <div className="manga-grid">
      {enriched.map((h) => (
        <Link key={h.manga_id} href={`/manga/${h.manga_id}`} className="manga-card">
          <div className="manga-card-cover">
            {h.manga_cover ? (
              <img src={h.manga_cover} alt={h.manga_title || 'Manga'} loading="lazy" />
            ) : (
              <div className="history-cover-placeholder">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
            )}
            <div className="manga-card-overlay" />
            <div className="history-chapter-badge">
              {h.chapter_name || 'Chapter ?'}
            </div>
          </div>
          <div className="manga-card-info">
            <div className="manga-card-title">
              {h.manga_title || (
                <span className="history-loading-title">Memuat...</span>
              )}
            </div>
            <div style={{ fontSize: 10, color: 'var(--gray-2)', marginTop: 2 }}>
              {new Date(h.read_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
