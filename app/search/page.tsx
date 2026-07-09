'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import MangaGrid from '@/components/MangaGrid'

function toStatus(code: number) {
  if (code === 1) return 'Ongoing'
  if (code === 2) return 'Completed'
  return 'Unknown'
}

function mapManga(item: any) {
  return {
    manga_id: item.manga_id,
    title: item.title,
    cover: item.cover_portrait_url || item.cover_image_url || '',
    status: toStatus(item.status),
    score: item.score,
    country: item.country_id,
  }
}

function SearchContent() {
  const params = useSearchParams()
  const q = params.get('q') || ''

  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!q) return
    setLoading(true)
    fetch(`/api/manga/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(json => {
        setResults((json.data || []).map(mapManga))
        setTotal(json.total_record || 0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  return (
    <div className="fade-in">
      <div className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>
          Hasil Pencarian
        </h1>
        {q && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            {loading ? 'Mencari...' : `${total} hasil untuk "${q}"`}
          </p>
        )}

        {!q && (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <div className="empty-text">Ketik sesuatu untuk mencari</div>
            <div className="empty-sub">Masukkan judul manga di search bar atas</div>
          </div>
        )}

        {loading ? (
          <div className="manga-grid">
            {Array(12).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-md)', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : (
          q && <MangaGrid items={results} />
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  )
}
