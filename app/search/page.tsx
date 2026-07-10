'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const router = useRouter()
  const q = params.get('q') || ''

  const [inputVal, setInputVal] = useState(q)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount (mobile UX)
  useEffect(() => {
    if (!q) inputRef.current?.focus()
  }, [])

  // Sync inputVal when URL param changes
  useEffect(() => { setInputVal(q) }, [q])

  useEffect(() => {
    if (!q) { setResults([]); setTotal(0); return }
    setLoading(true)
    fetch(`/api/manga/search?q=${encodeURIComponent(q)}&limit=30`)
      .then(r => r.json())
      .then(json => {
        setResults((json.data || []).map(mapManga))
        setTotal(json.total_record || 0)
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false))
  }, [q])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (inputVal.trim()) router.push(`/search?q=${encodeURIComponent(inputVal.trim())}`)
  }

  return (
    <div className="fade-in">
      <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>

        {/* Search input — prominent for mobile */}
        <form onSubmit={handleSubmit} className="search-page-form">
          <div className="search-page-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--gray-2)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Cari judul manga, manhwa, manhua..."
              className="search-page-input"
              autoComplete="off"
              autoFocus
            />
            {inputVal && (
              <button type="button" onClick={() => { setInputVal(''); router.push('/search'); inputRef.current?.focus() }}
                style={{ background: 'none', border: 'none', color: 'var(--gray-2)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 20px', fontSize: 14, flexShrink: 0 }}>
            Cari
          </button>
        </form>

        {/* Status */}
        {q && (
          <p style={{ fontSize: 13, color: 'var(--gray-2)', marginBottom: 24, marginTop: 8 }}>
            {loading ? 'Mencari...' : `${total.toLocaleString()} hasil untuk `}
            {!loading && <strong style={{ color: 'var(--white)' }}>&quot;{q}&quot;</strong>}
          </p>
        )}

        {/* Empty state */}
        {!q && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-2)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-1)', marginBottom: 6 }}>Cari Manga Favoritmu</div>
            <div style={{ fontSize: 13 }}>Ketik minimal 3 karakter untuk mulai pencarian</div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="manga-grid">
            {Array(12).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--r-md)', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && q && results.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-2)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-1)', marginBottom: 6 }}>Tidak ditemukan</div>
            <div style={{ fontSize: 13 }}>Coba kata kunci lain</div>
          </div>
        )}

        {!loading && q && results.length > 0 && <MangaGrid items={results} />}
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
