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

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function SearchContent() {
  const params = useSearchParams()
  const router = useRouter()
  const q = params.get('q') || ''

  const [inputVal, setInputVal] = useState(q)
  const [liveResults, setLiveResults] = useState<any[]>([])
  const [fullResults, setFullResults] = useState<any[]>([])
  const [liveLoading, setLiveLoading] = useState(false)
  const [fullLoading, setFullLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [showFull, setShowFull] = useState(!!q)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedInput = useDebounce(inputVal, 300)

  // Focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Sync from URL
  useEffect(() => {
    setInputVal(q)
    setShowFull(!!q)
  }, [q])

  // Live search as-you-type (dropdown style)
  useEffect(() => {
    if (debouncedInput.length < 3) {
      setLiveResults([])
      if (!q) setShowFull(false)
      return
    }
    if (debouncedInput === q) return // already showing full results
    setLiveLoading(true)
    fetch(`/api/manga/search?q=${encodeURIComponent(debouncedInput)}&limit=8`)
      .then(r => r.json())
      .then(json => setLiveResults((json.data || []).slice(0, 8)))
      .catch(() => setLiveResults([]))
      .finally(() => setLiveLoading(false))
  }, [debouncedInput, q])

  // Full search from URL ?q=
  useEffect(() => {
    if (!q) { setFullResults([]); setTotal(0); return }
    setFullLoading(true)
    setShowFull(true)
    fetch(`/api/manga/search?q=${encodeURIComponent(q)}&limit=30`)
      .then(r => r.json())
      .then(json => {
        setFullResults((json.data || []).map(mapManga))
        setTotal(json.total_record || 0)
      })
      .catch(() => setFullResults([]))
      .finally(() => setFullLoading(false))
  }, [q])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = inputVal.trim()
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
      setShowFull(true)
      setLiveResults([])
    }
  }

  function handleClear() {
    setInputVal('')
    setLiveResults([])
    setShowFull(false)
    router.push('/search')
    inputRef.current?.focus()
  }

  const showLive = liveResults.length > 0 && !showFull

  return (
    <div className="fade-in">
      <div className="container" style={{ paddingTop: 20, paddingBottom: 80 }}>

        {/* Search input */}
        <form onSubmit={handleSubmit} className="search-page-form">
          <div className="search-page-input-wrap">
            {liveLoading ? (
              <div style={{ width: 16, height: 16, border: '2px solid var(--gray-3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--gray-2)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            )}
            <input
              ref={inputRef}
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); setShowFull(false) }}
              placeholder="Ketik judul manga..."
              className="search-page-input"
              autoComplete="off"
            />
            {inputVal && (
              <button type="button" onClick={handleClear}
                style={{ background: 'none', border: 'none', color: 'var(--gray-2)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 18px', height: 48, fontSize: 14, flexShrink: 0 }}>
            Cari
          </button>
        </form>

        {/* ── Live thumbnail results (as-you-type) ── */}
        {showLive && (
          <div className="search-live-list">
            {liveResults.map(item => (
              <Link
                key={item.manga_id}
                href={`/manga/${item.manga_id}`}
                className="search-live-item"
              >
                <div className="search-live-cover">
                  {item.cover_portrait_url || item.cover_image_url ? (
                    <img src={item.cover_portrait_url || item.cover_image_url} alt={item.title} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: 'var(--bg-3)' }} />
                  )}
                </div>
                <div className="search-live-info">
                  <div className="search-live-title">{item.title}</div>
                  <div className="search-live-meta">
                    {item.status === 1 ? (
                      <span style={{ color: '#6ee7b7', fontSize: 10, fontWeight: 600 }}>Ongoing</span>
                    ) : item.status === 2 ? (
                      <span style={{ color: '#a5b4fc', fontSize: 10, fontWeight: 600 }}>Completed</span>
                    ) : null}
                    {item.score ? (
                      <span style={{ color: '#facc15', fontSize: 10 }}>★ {Number(item.score).toFixed(1)}</span>
                    ) : null}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--gray-3)', flexShrink: 0 }}>
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </Link>
            ))}
            {/* See all */}
            <button
              className="search-live-viewall"
              onClick={handleSubmit as any}
              type="button"
            >
              Lihat semua hasil untuk &quot;{inputVal}&quot; →
            </button>
          </div>
        )}

        {/* ── Hint when input empty ── */}
        {!inputVal && !showFull && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-2)' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-1)', marginBottom: 6 }}>Cari Manga Favoritmu</div>
            <div style={{ fontSize: 13 }}>Ketik minimal 3 karakter</div>
          </div>
        )}

        {/* ── Full results (after pressing Cari / Enter) ── */}
        {showFull && (
          <>
            {q && (
              <p style={{ fontSize: 13, color: 'var(--gray-2)', marginBottom: 20, marginTop: 6 }}>
                {fullLoading ? 'Mencari...' : `${total.toLocaleString()} hasil untuk `}
                {!fullLoading && <strong style={{ color: 'var(--white)' }}>&quot;{q}&quot;</strong>}
              </p>
            )}

            {fullLoading && (
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

            {!fullLoading && fullResults.length === 0 && q && (
              <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--gray-2)' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>😕</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--gray-1)', marginBottom: 6 }}>Tidak ditemukan</div>
                <div style={{ fontSize: 13 }}>Coba kata kunci lain</div>
              </div>
            )}

            {!fullLoading && fullResults.length > 0 && <MangaGrid items={fullResults} />}
          </>
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
