import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProfileHeader from '@/components/ProfileHeader'
import HistoryGrid from '@/components/HistoryGrid'

const AVATAR_COLORS = ['#e63946', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
function getAvatarColor(userId: string) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Ambil semua data hanya dari Supabase — tidak ada external API call
  const [bookmarksRes, historyRes, profileRes] = await Promise.all([
    supabase.from('bookmarks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('reading_history').select('*').eq('user_id', user.id).order('read_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
  ])

  const bookmarks = bookmarksRes.data || []
  const historyRaw = historyRes.data || []
  const profile = profileRes.data

  const savedUsername = profile?.username || user.email?.split('@')[0] || 'User'
  const savedBio = profile?.bio || ''

  // Group history by manga_id — ambil entry terbaru per manga
  const mangaMap = new Map<string, any>()
  for (const h of historyRaw) {
    if (!mangaMap.has(h.manga_id)) mangaMap.set(h.manga_id, h)
  }
  const historyByManga = Array.from(mangaMap.values())

  const stats = [
    { label: 'Dibaca', value: historyByManga.length },
    { label: 'Bookmark', value: bookmarks.length },
    { label: 'Chapter', value: historyRaw.length },
  ]

  return (
    <div className="fade-in" style={{ paddingBottom: 48 }}>
      <div className="container" style={{ maxWidth: 680 }}>

        <ProfileHeader
          userId={user.id}
          initialUsername={savedUsername}
          initialBio={savedBio}
          email={user.email || ''}
          avatarColor={getAvatarColor(user.id)}
          stats={stats}
        />

        {/* Riwayat Baca */}
        <div id="history" style={{ scrollMarginTop: 80, marginTop: 40 }}>
          <div className="section-header" style={{ marginBottom: 14 }}>
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
            <HistoryGrid items={historyByManga} />
          )}
        </div>

        {/* Bookmark */}
        <div style={{ marginTop: 40 }}>
          <div className="section-header" style={{ marginBottom: 14 }}>
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
              <div className="empty-sub">Bookmark manga favoritmu!</div>
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
                    <div style={{ fontSize: 10, color: 'var(--gray-2)' }}>
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
