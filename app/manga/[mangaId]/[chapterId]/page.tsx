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
  // Bars (topbar + bottombar) visibility — hidden by default, toggle on tap
  const [barsVisible, setBarsVisible] = useState(false)
  const lastScrollY = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chapterListRef = useRef<HTMLDivElement>(null)

  // Hide global Navbar on reader page
  useEffect(() => {
    document.body.classList.add('reader-mode')
    return () => document.body.classList.remove('reader-mode')
  }, [])

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

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          let manga_title = '', manga_cover = ''
          try {
            const mangaRes = await fetch(`/api/manga/${mangaId}`)
            if (mangaRes.ok) {
              const mangaJson = await mangaRes.json()
              manga_title = mangaJson.title || mangaJson.data?.title || ''
              manga_cover = mangaJson.cover || mangaJson.data?.cover_portrait_url || mangaJson.data?.cover_image_url || ''
            }
          } catch {}
          await supabase.from('reading_history').upsert({
            user_id: user.id, manga_id: mangaId, chapter_id: chapterId,
            chapter_name: chs[idx]?.name || '', manga_title, manga_cover,
            read_at: new Date().toISOString(),
          }, { onConflict: 'user_id,manga_id,chapter_id' })
        }
      } catch {
        setError('Gagal memuat chapter. Coba lagi.')
      }
      setLoading(false)
    }
    load()
  }, [mangaId, chapterId])

  // Scroll progress + auto-hide bars on scroll down
  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setReadProgress(docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0)

      // Auto-hide bars when scrolling down
      if (scrollTop > lastScrollY.current + 8) {
        setBarsVisible(false)
        if (hideTimer.current) clearTimeout(hideTimer.current)
      } else if (scrollTop < lastScrollY.current - 5) {
        // Show bars when scrolling up
        setBarsVisible(true)
        scheduleHide()
      }
      lastScrollY.current = scrollTop
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (hideTimer.current) clearTimeout(hideTimer.current)
    }
  }, [])

  function scheduleHide() {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setBarsVisible(false), 3500)
  }

  // Tap on panel → toggle bars
  function handlePanelTap(e: React.MouseEvent) {
    // Don't toggle if clicking a link/button inside bars
    const target = e.target as HTMLElement
    if (target.closest('.reader-bottom-bar') || target.closest('.reader-topbar-float')) return
    setBarsVisible(v => {
      if (!v) scheduleHide()
      else if (hideTimer.current) clearTimeout(hideTimer.current)
      return !v
    })
  }

  // Close chapter list on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (chapterListRef.current && !chapterListRef.current.contains(e.target as Node)) {
        setShowChapterList(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const prevChapter = curIdx >= 0 && curIdx < chapters.length - 1 ? chapters[curIdx + 1] : null
  const nextChapter = curIdx > 0 ? chapters[curIdx - 1] : null

  const goToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const goToBottom = () => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })

  const mangaTitle = chapters[curIdx]?.manga_title || ''
  const currentChapterName = chapters[curIdx]?.name || chapterName || 'Memuat...'

  return (
    <div className="reader-page" onClick={handlePanelTap}>

      {/* ── Floating Top Bar (Shinigami-style) ── */}
      <div className={`reader-topbar-float${barsVisible ? ' visible' : ''}`}>
        {/* Back to manga detail */}
        <Link
          href={`/manga/${mangaId}`}
          className="reader-topbar-btn"
          onClick={e => e.stopPropagation()}
          title="Kembali"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </Link>

        {/* Chapter breadcrumb */}
        <div className="reader-topbar-title" onClick={e => e.stopPropagation()}>
          <span className="reader-topbar-manga">{mangaTitle || 'Detail'}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.4 }}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
          <span className="reader-topbar-ch">{currentChapterName}</span>
        </div>

        {/* Home */}
        <Link
          href="/"
          className="reader-topbar-btn"
          onClick={e => e.stopPropagation()}
          title="Beranda"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--gray-2)' }}>
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
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Coba Lagi</button>
        </div>
      ) : (
        <div className="reader-images" style={{ paddingBottom: 120 }}>
          {pages.map((p) => (
            <div key={p.page} className="reader-image">
              <img
                src={p.url}
                alt={`Halaman ${p.page}`}
                loading={p.page <= 3 ? 'eager' : 'lazy'}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Floating Bottom Bar ── */}
      {!loading && !error && (
        <div ref={chapterListRef} className={`reader-bottom-bar${barsVisible ? ' visible' : ''}`}>
          {/* Progress Bar */}
          <div className="reader-progress-track">
            <div className="reader-progress-fill" style={{ width: `${readProgress}%` }} />
          </div>

          <div className="reader-bar-inner" onClick={e => e.stopPropagation()}>
            {/* Prev Chapter */}
            {prevChapter ? (
              <Link href={`/manga/${mangaId}/${prevChapter.chapter_id}`} className="reader-bar-btn" title="Chapter Sebelumnya">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </Link>
            ) : (
              <button className="reader-bar-btn" disabled>
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

            {/* Chapter list */}
            <button
              className={`reader-bar-btn reader-bar-btn--chapter${showChapterList ? ' active' : ''}`}
              onClick={() => setShowChapterList(p => !p)}
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
            <div className="reader-bar-progress-label">{Math.round(readProgress)}%</div>

            {/* Scroll to bottom */}
            <button className="reader-bar-btn" onClick={goToBottom} title="Ke bawah">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {/* Next Chapter */}
            {nextChapter ? (
              <Link href={`/manga/${mangaId}/${nextChapter.chapter_id}`} className="reader-bar-btn reader-bar-btn--next" title="Chapter Berikutnya">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </Link>
            ) : (
              <button className="reader-bar-btn" disabled>
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
