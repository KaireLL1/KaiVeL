'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Page { page: number; url: string }

export default function ReaderPage({ params }: { params: Promise<{ mangaId: string; chapterId: string }> }) {
  const { mangaId, chapterId } = use(params)
  const router = useRouter()

  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chapters, setChapters] = useState<any[]>([])
  const [curIdx, setCurIdx] = useState(-1)
  const [chapterName, setChapterName] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [pagesRes, chaptersRes] = await Promise.all([
          fetch(`/api/manga/chapter/${chapterId}`),
          fetch(`/api/manga/${mangaId}/chapters`),
        ])

        const pagesJson = await pagesRes.json()
        const chapJson = await chaptersRes.json()

        setPages(pagesJson.pages || [])
        setChapterName(pagesJson.chapter_name || '')

        const chs = chapJson.chapters || []
        setChapters(chs)
        const idx = chs.findIndex((c: any) => c.chapter_id === chapterId)
        setCurIdx(idx)

        // Track reading history (only if logged in)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Ambil info manga (title & cover) untuk disimpan ke history
          let manga_title = ''
          let manga_cover = ''
          try {
            const mangaRes = await fetch(`/api/manga/${mangaId}`)
            if (mangaRes.ok) {
              const mangaJson = await mangaRes.json()
              manga_title = mangaJson.title || mangaJson.data?.title || ''
              manga_cover = mangaJson.cover || mangaJson.data?.cover_portrait_url || mangaJson.data?.cover_image_url || ''
            }
          } catch {}

          await supabase.from('reading_history').upsert({
            user_id: user.id,
            manga_id: mangaId,
            chapter_id: chapterId,
            chapter_name: chs[idx]?.name || '',
            manga_title,
            manga_cover,
            read_at: new Date().toISOString(),
          }, { onConflict: 'user_id,manga_id,chapter_id' })
        }
      } catch (e: any) {
        setError('Gagal memuat chapter. Coba lagi.')
      }
      setLoading(false)
    }
    load()
  }, [mangaId, chapterId])

  const prevChapter = curIdx >= 0 && curIdx < chapters.length - 1 ? chapters[curIdx + 1] : null
  const nextChapter = curIdx > 0 ? chapters[curIdx - 1] : null

  return (
    <div className="reader-page">
      {/* Top Bar */}
      <div className="reader-topbar">
        <Link href={`/manga/${mangaId}`} style={{ color: 'var(--gray-1)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Kembali
        </Link>

        <div style={{ flex: 1, textAlign: 'center' }}>
          <div className="reader-chapter">{chapters[curIdx]?.name || 'Memuat...'}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {prevChapter && (
            <Link href={`/manga/${mangaId}/${prevChapter.chapter_id}`} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }}>
              ← Prev
            </Link>
          )}
          {nextChapter && (
            <Link href={`/manga/${mangaId}/${nextChapter.chapter_id}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }}>
              Next →
            </Link>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--gray-2)' }}>
          <div style={{
            width: 36, height: 36, border: '3px solid var(--border)', borderTopColor: 'var(--red)',
            borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px'
          }} />
          <div style={{ fontSize: 14 }}>Memuat halaman...</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ color: 'var(--red)', marginBottom: 16, fontSize: 14 }}>{error}</div>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Coba Lagi
          </button>
        </div>
      ) : (
        <div className="reader-images">
          {pages.map((p) => (
            <div key={p.page} className="reader-image">
              <img
                src={p.url}
                alt={`Halaman ${p.page}`}
                loading={p.page <= 3 ? 'eager' : 'lazy'}
                onError={(e) => {
                  const t = e.target as HTMLImageElement
                  t.style.display = 'none'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Bottom Nav */}
      {!loading && !error && (
        <div className="reader-nav">
          {prevChapter ? (
            <Link href={`/manga/${mangaId}/${prevChapter.chapter_id}`} className="btn btn-ghost">
              ← Chapter Sebelumnya
            </Link>
          ) : <div />}
          <Link href={`/manga/${mangaId}`} className="btn btn-ghost">
            Daftar Chapter
          </Link>
          {nextChapter ? (
            <Link href={`/manga/${mangaId}/${nextChapter.chapter_id}`} className="btn btn-primary">
              Chapter Berikutnya →
            </Link>
          ) : (
            <div style={{ padding: '10px 16px', fontSize: 13, color: 'var(--gray-2)' }}>
              Ini chapter terbaru!
            </div>
          )}
        </div>
      )}
    </div>
  )
}
