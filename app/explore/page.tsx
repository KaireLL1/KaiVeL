'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
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
    cover: item.cover_image_url || item.cover_portrait_url || '',
    cover_portrait: item.cover_portrait_url || item.cover_image_url || '',
    status: toStatus(item.status),
    score: item.score,
    country: item.country_id,
  }
}

const TYPES = [
  { label: 'Semua', value: '' },
  { label: 'Manhwa', value: 'manhwa' },
  { label: 'Manhua', value: 'manhua' },
  { label: 'Manga', value: 'manga' },
]

const SORTS = [
  { label: 'Populer', value: 'popular' },
  { label: 'Terbaru', value: 'latest' },
]

function ExploreContent() {
  const params = useSearchParams()
  const router = useRouter()

  const initType = params.get('type') || ''
  const initSort = params.get('sort') || 'popular'
  const initPage = parseInt(params.get('page') || '1')

  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState(initType)
  const [sort, setSort] = useState(initSort)
  const [page, setPage] = useState(initPage)
  const [hasNext, setHasNext] = useState(false)
  const [totalRecord, setTotalRecord] = useState(0)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const sp = new URLSearchParams()
        sp.set('page', String(page))
        sp.set('sort', sort)
        if (type) sp.set('type', type)

        const res = await fetch(`/api/manga/explore?${sp}`)
        const json = await res.json()
        setItems((json.data || []).map(mapManga))
        setHasNext(json.has_next_page ?? false)
        setTotalRecord(json.total_record ?? 0)
      } catch { setItems([]) }
      setLoading(false)
    }
    load()
  }, [type, sort, page])

  function changeType(v: string) { setType(v); setPage(1) }
  function changeSort(v: string) { setSort(v); setPage(1) }

  return (
    <div className="fade-in">
      <div className="container">
        <div style={{ padding: '32px 0 0' }}>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, marginBottom: 6 }}>🔍 Explore Manga</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
            {totalRecord > 0 ? `${totalRecord.toLocaleString()} judul tersedia` : 'Jelajahi semua judul'}
          </p>

          {/* Sort */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Urutkan</div>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              {SORTS.map((s) => (
                <button key={s.value} className={`filter-chip ${sort === s.value ? 'active' : ''}`} onClick={() => changeSort(s.value)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tipe</div>
            <div className="filter-bar" style={{ marginBottom: 0 }}>
              {TYPES.map((t) => (
                <button key={t.value} className={`filter-chip ${type === t.value ? 'active' : ''}`} onClick={() => changeType(t.value)}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="manga-grid">
            {Array(24).fill(0).map((_, i) => (
              <div key={i}>
                <div className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-md)', marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 6 }} />
                <div className="skeleton" style={{ height: 12, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : (
          <MangaGrid items={items} />
        )}

        {/* Pagination */}
        {!loading && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 10, padding: '40px 0' }}>
            <button
              className="btn btn-ghost"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >← Sebelumnya</button>
            <div style={{ padding: '10px 16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', fontSize: 14, border: '1px solid var(--border)' }}>
              Halaman {page}
            </div>
            <button
              className="btn btn-ghost"
              disabled={!hasNext}
              onClick={() => setPage(p => p + 1)}
            >Berikutnya →</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="container" style={{ paddingTop: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Memuat...</div>}>
      <ExploreContent />
    </Suspense>
  )
}
