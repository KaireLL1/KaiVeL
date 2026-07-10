'use client'

import { useState, useEffect, use, useRef, useCallback } from 'react'
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
  const [readProgress, setReadProgress] = useState(0)
  const [showChapterList, setShowChapterList] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [barVisible, setBarVisible] = useState(true)
  const lastScrollY = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chapterListRef = useRef<HTMLDivElement>(null)

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

        // Track reading history
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
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

  // Scroll progress & bar hide/show
  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0
      setReadProgress(progress)

      // Auto-hide bar on scroll down, show on scroll up
      if (scrollTop > lastScrollY.current + 10) {
        setBarVisible(false)
      } else if (scrollTop < lastScrollY.current - 5) {
        setBarVisible(true)
      }
      lastScrollY.current = scrollTop

      // Auto show after idle
      if (hideTimer.current) clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(() => setBarVisible(true), 2000)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  // Close popups on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (chapterListRef.current && !chapterListRef.current.contains(e.target as Node)) {
        setShowChapterList(false)
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const prevChapter = curIdx >= 0 && curIdx < chapters.length - 1 ? chapters[curIdx + 1] : null
  const nextChapter = curIdx > 0 ? chapters[curIdx - 1] : null

  const goToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const goToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

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
        <div className="reader-images" style={{ paddingBottom: 120 }}>
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

      {/* ── Floating Reader Bottom Bar (Shinigami-style) ── */}
      {!loading && !error && (
        <div ref={chapterListRef} className={`reader-bottom-bar${barVisible ? ' visible' : ''}`}>
          {/* Progress Bar */}
          <div className="reader-progress-track">
            <div className="reader-progress-fill" style={{ width: `${readProgress}%` }} />
          </div>

          <div className="reader-bar-inner">
            {/* Prev Chapter */}
            {prevChapter ? (
              <Link
                href={`/manga/${mangaId}/${prevChapter.chapter_id}`}
                className="reader-bar-btn"
                title="Chapter Sebelumnya"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </Link>
            ) : (
              <button className="reader-bar-btn" disabled title="Sudah chapter pertama">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.3">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
            )}

            {/* Scroll to top */}
            <button className="reader-bar-btn" onClick={goToTop} title="Ke atas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 15l-6-6-6 6"/>
              </svg>
            </button>

            {/* Chapter list toggle */}
            <button
              className={`reader-bar-btn reader-bar-btn--chapter${showChapterList ? ' active' : ''}`}
              onClick={() => { setShowChapterList(p => !p); setShowSettings(false) }}
              title="Daftar Chapter"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </button>

            {/* Progress label */}
            <div className="reader-bar-progress-label">
              {Math.round(readProgress)}%
            </div>

            {/* Scroll to bottom */}
            <button className="reader-bar-btn" onClick={goToBottom} title="Ke bawah">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Next Chapter */}
            {nextChapter ? (
              <Link
                href={`/manga/${mangaId}/${nextChapter.chapter_id}`}
                className="reader-bar-btn reader-bar-btn--next"
                title="Chapter Berikutnya"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ) : (
              <button className="reader-bar-btn" disabled title="Chapter terbaru">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" opacity="0.3">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
          </div>

          {/* Chapter List Popup */}
          {showChapterList && (
            <div className="reader-chapter-popup">
              <div className="reader-chapter-popup-header">
                <span>Daftar Chapter</span>
                <button onClick={() => setShowChapterList(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div className="reader-chapter-popup-list">
                {chapters.map((ch, i) => (
                  <Link
                    key={ch.chapter_id}
                    href={`/manga/${mangaId}/${ch.chapter_id}`}
                    className={`reader-chapter-popup-item${i === curIdx ? ' active' : ''}`}
                    onClick={() => setShowChapterList(false)}
                  >
                    <span>{ch.name}</span>
                    {i === curIdx && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
