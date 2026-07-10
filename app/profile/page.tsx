import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getMangaDetail } from '@/lib/api'
import ProfileHeader from '@/components/ProfileHeader'

const AVATAR_COLORS = ['#e63946', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
function avatarColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Fetch semua data paralel
  const [bookmarksRes, historyRes, profileRes] = await Promise.all([
    supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('reading_history').select('*').eq('user_id', user.id).order('read_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
  ])

  const bookmarks = bookmarksRes.data || []
  const historyRaw = historyRes.data || []
  const profile = profileRes.data

  // Username: dari tabel profiles, fallback ke email prefix
  const savedUsername = profile?.username || user.email?.split('@')[0] || 'User'
  const savedBio = profile?.bio || ''

  // Group history by manga (latest per manga)
  const mangaMap = new Map<string, any>()
  for (const h of historyRaw) {
    if (!mangaMap.has(h.manga_id)) mangaMap.set(h.manga_id, h)
  }
  const historyGrouped = Array.from(mangaMap.values())

  // Fetch cover untuk item tanpa cover (paralel, max 5 sekaligus)
  const historyByManga = await Promise.all(
    historyGrouped.map(async (h) => {
      if (h.manga_cover && h.manga_title) return h
      try {
        const detail = await getMangaDetail(h.manga_id)
        const d = detail?.data
        return { ...h, manga_title: h.manga_title || d?.title || '', manga_cover: h.manga_cover || d?.cover_portrait_url || d?.cover_image_url || '' }
      } catch { return h }
    })
  )

  const stats = [
    { label: 'Dibaca', value: historyByManga.length },
    { label: 'Bookmark', value: bookmarks.length },
    { label: 'Chapter', value: historyRaw.length },
  ]

  return (
    <div className="fade-in" style={{ paddingBottom: 48 }}>
      <div className="container" style={{ maxWidth: 680 }}>

        {/* Profile Header — Client Component */}
        <ProfileHeader
          userId={user.id}
          initialUsername={savedUsername}
          initialBio={savedBio}
          email={user.email || ''}
          avatarColor={avatarColor(user.id)}
          stats={stats}
          onLogout={() => {}}
        />

        {/* Reading History */}
        <div id="history" style={{ scrollMarginTop: 80, marginTop: 40 }}>
          <div className="section-header">
            <h2 className="section-title">Riwayat Baca</h2>
            {historyByManga.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--gray-2)' }}>{historyByManga.length} manga</span>
            )}
          </div>

          {historyByManga.length === 0 ? (
            <div className="empty">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <div className="empty-text">Belum ada riwayat baca</div>
              <div className="empty-sub">Mulai baca manga sekarang!</div>
              <Link href="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Manga</Link>
            </div>
          ) : (
            <div className="manga-grid">
              {historyByManga.map((h: any) => (
                <Link key={h.manga_id} href={`/manga/${h.manga_id}`} className="manga-card">
                  <div className="manga-card-cover">
                    {h.manga_cover ? (
                      <img src={h.manga_cover} alt={h.manga_title || h.manga_id} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-3)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-3)" strokeWidth="1.5">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                      </div>
                    )}
                    <div className="manga-card-overlay" />
                    <div style={{ position: 'absolute', bottom: 8, left: 8, right: 8, fontSize: 10, fontWeight: 600, color: 'var(--white)', background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '2px 6px', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {h.chapter_name || 'Chapter ?'}
                    </div>
                  </div>
                  <div className="manga-card-info">
                    <div className="manga-card-title">{h.manga_title || `Manga ${h.manga_id.slice(0, 8)}...`}</div>
                    <div className="manga-card-meta" style={{ fontSize: 10, color: 'var(--gray-2)' }}>
                      {new Date(h.read_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div style={{ marginTop: 40 }}>
          <div className="section-header">
            <h2 className="section-title">Bookmark</h2>
            {bookmarks.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--gray-2)' }}>{bookmarks.length} manga</span>
            )}
          </div>

          {bookmarks.length === 0 ? (
            <div className="empty">
              <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
              <div className="empty-text">Belum ada bookmark</div>
              <div className="empty-sub">Mulai bookmark manga favoritmu!</div>
              <Link href="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Manga</Link>
            </div>
          ) : (
            <div className="manga-grid">
              {bookmarks.map((b: any) => (
                <Link key={b.id} href={`/manga/${b.manga_id}`} className="manga-card">
                  <div className="manga-card-cover">
                    {b.cover ? (
                      <img src={b.cover} alt={b.title} loading="lazy" />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-3)' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gray-3)" strokeWidth="1.5">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                      </div>
                    )}
                    <div className="manga-card-overlay" />
                  </div>
                  <div className="manga-card-info">
                    <div className="manga-card-title">{b.title}</div>
                    <div className="manga-card-meta" style={{ fontSize: 10, color: 'var(--gray-2)' }}>
                      {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
