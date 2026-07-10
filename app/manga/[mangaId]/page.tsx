import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getMangaDetail, getChapterList } from '@/lib/api'
import ChapterList from '@/components/ChapterList'
import BookmarkButton from '@/components/BookmarkButton'
import { createClient } from '@/lib/supabase/server'

function toStatus(code: number) {
  if (code === 1) return 'Ongoing'
  if (code === 2) return 'Completed'
  if (code === 3) return 'Hiatus'
  return 'Unknown'
}

export async function generateMetadata({ params }: { params: Promise<{ mangaId: string }> }) {
  try {
    const { mangaId } = await params
    const res = await getMangaDetail(mangaId)
    const d = res?.data
    return {
      title: d?.title || 'Detail Manga',
      description: d?.description?.slice(0, 150),
    }
  } catch {
    return { title: 'Detail Manga' }
  }
}

export default async function MangaDetailPage({ params }: { params: Promise<{ mangaId: string }> }) {
  const { mangaId } = await params

  let detail: any, chapterData: any
  try {
    ;[detail, chapterData] = await Promise.all([
      getMangaDetail(mangaId),
      getChapterList(mangaId),
    ])
  } catch {
    notFound()
  }

  const d = detail?.data
  if (!d) notFound()

  // Get user's read history
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let readHistory: string[] = []
  if (user) {
    const { data } = await supabase
      .from('reading_history')
      .select('chapter_id')
      .eq('user_id', user.id)
      .eq('manga_id', mangaId)
    readHistory = (data || []).map((h: any) => h.chapter_id)
  }

  // Parse chapters
  let chapters: any[] = []
  if (Array.isArray(chapterData)) {
    chapters = chapterData
  } else if (chapterData?.data) {
    chapters = chapterData.data
  } else if (chapterData?.chapter_list) {
    chapters = chapterData.chapter_list
  }

  const chaptersMapped = chapters.map((item: any) => {
    const num = String(item.chapter_number || item.number || '').replace('.0', '')
    const titlePart = item.chapter_title || item.title || ''
    return {
      chapter_id: item.chapter_id || item.id || '',
      name: titlePart ? `Chapter ${num} - ${titlePart}` : `Chapter ${num}`,
      date: item.release_date || item.date || null,
    }
  })

  const taxonomy = d.taxonomy || {}
  const getNames = (items: any[]) => items?.map((i: any) => i.name) || []
  const genres = getNames(taxonomy.Genre)
  const authors = getNames(taxonomy.Author).join(', ')
  const artists = getNames(taxonomy.Artist).join(', ')
  const formats = getNames(taxonomy.Format)
  const status = toStatus(d.status)
  const cover = d.cover_portrait_url || d.cover_image_url || ''
  const firstChapter = chaptersMapped[chaptersMapped.length - 1]
  const latestChapter = chaptersMapped[0]

  return (
    <div className="fade-in">
      <div className="container">
        {/* Breadcrumb */}
        <nav style={{ padding: '16px 0', fontSize: 13, color: 'var(--gray-2)' }}>
          <Link href="/" style={{ color: 'var(--red)' }}>Home</Link>
          {' / '}
          <Link href="/explore" style={{ color: 'var(--red)' }}>Explore</Link>
          {' / '}
          <span>{d.title}</span>
        </nav>

        {/* Detail Hero */}
        <div className="detail-hero">
          {/* Cover */}
          <div className="detail-cover">
            {cover && (
              <img src={cover} alt={d.title} />
            )}
          </div>

          {/* Info */}
          <div>
            <div className="detail-meta">
              {d.country_id === 'KR' && <span className="badge badge-red">Manhwa</span>}
              {d.country_id === 'CN' && <span className="badge badge-yellow">Manhua</span>}
              {d.country_id === 'JP' && <span className="badge badge-gray">Manga</span>}
              <span className={`badge ${status === 'Ongoing' ? 'badge-green' : 'badge-gray'}`}>{status}</span>
              {formats.map((f: string) => <span key={f} className="badge badge-gray">{f}</span>)}
            </div>

            <h1 className="detail-title">{d.title}</h1>
            {d.alternative_title && <div className="detail-alt">{d.alternative_title}</div>}

            {/* Score */}
            {d.score && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24' }}>★ {Number(d.score).toFixed(1)}</span>
                <span style={{ fontSize: 13, color: 'var(--gray-2)' }}>/ 10</span>
              </div>
            )}

            {/* Description */}
            {d.description && (
              <p className="detail-desc">{d.description}</p>
            )}

            {/* Genres */}
            {genres.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {genres.map((g: string) => (
                  <Link key={g} href={`/explore?genre=${encodeURIComponent(g)}`} className="badge badge-gray">
                    {g}
                  </Link>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="detail-actions" style={{ marginBottom: 24 }}>
              {firstChapter && (
                <Link href={`/manga/${mangaId}/${firstChapter.chapter_id}`} className="btn btn-primary">
                  Baca Chapter 1
                </Link>
              )}
              {latestChapter && latestChapter.chapter_id !== firstChapter?.chapter_id && (
                <Link href={`/manga/${mangaId}/${latestChapter.chapter_id}`} className="btn btn-ghost">
                  Chapter Terbaru
                </Link>
              )}
              <BookmarkButton mangaId={mangaId} title={d.title} cover={cover} />
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="detail-info-grid" style={{ marginBottom: 32 }}>
          {authors && (
            <div className="detail-info-item">
              <div className="detail-info-label">Author</div>
              <div className="detail-info-value">{authors}</div>
            </div>
          )}
          {artists && artists !== authors && (
            <div className="detail-info-item">
              <div className="detail-info-label">Artist</div>
              <div className="detail-info-value">{artists}</div>
            </div>
          )}
          <div className="detail-info-item">
            <div className="detail-info-label">Status</div>
            <div className="detail-info-value">{status}</div>
          </div>
          {d.country_id && (
            <div className="detail-info-item">
              <div className="detail-info-label">Asal</div>
              <div className="detail-info-value">
                {d.country_id === 'KR' ? '🇰🇷 Korea' : d.country_id === 'CN' ? '🇨🇳 China' : d.country_id === 'JP' ? '🇯🇵 Jepang' : d.country_id}
              </div>
            </div>
          )}
          <div className="detail-info-item">
            <div className="detail-info-label">Total Chapter</div>
            <div className="detail-info-value">{chaptersMapped.length}</div>
          </div>
        </div>

        {/* Chapter List */}
        <div style={{ marginBottom: 60 }}>
          <div className="section-header">
            <h2 className="section-title">Daftar Chapter</h2>
            <span style={{ fontSize: 13, color: 'var(--gray-2)' }}>{chaptersMapped.length} chapter</span>
          </div>

          {/* Login hint for non-authenticated users */}
          {!user && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(230,57,70,0.06)', border: '1px solid var(--border-red)',
              borderRadius: 'var(--r-sm)', padding: '10px 14px',
              fontSize: 12, color: 'var(--gray-1)', marginBottom: 12
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--red)', flexShrink: 0 }}>
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 6v4m0 4h.01"/>
              </svg>
              <span>
                <Link href="/auth/login" style={{ color: 'var(--red)', fontWeight: 600 }}>Login</Link>
                {' '}untuk melacak progress bacaan kamu
              </span>
            </div>
          )}

          <ChapterList chapters={chaptersMapped} mangaId={mangaId} readChapters={readHistory} />
        </div>
      </div>
    </div>
  )
}
