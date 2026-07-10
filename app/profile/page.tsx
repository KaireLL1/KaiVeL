import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Fetch bookmarks
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch reading history — ambil semua lalu group per manga di sisi client
  const { data: historyRaw } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', user.id)
    .order('read_at', { ascending: false })

  // Group history by manga_id — ambil entry terbaru per manga
  const mangaMap = new Map<string, any>()
  for (const h of historyRaw || []) {
    if (!mangaMap.has(h.manga_id)) {
      mangaMap.set(h.manga_id, h)
    }
  }
  const historyByManga = Array.from(mangaMap.values())

  const avatar = user.email?.[0]?.toUpperCase() || 'U'
  const joinDate = new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })
  const totalChaptersRead = historyRaw?.length || 0

  return (
    <div className="fade-in">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{avatar}</div>
          <div>
            <div className="profile-name">{user.email?.split('@')[0]}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-2)', marginTop: 4 }}>Bergabung sejak {joinDate}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)' }}>{bookmarks?.length || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-2)' }}>Bookmark</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)' }}>{historyByManga.length}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-2)' }}>Manga Dibaca</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-1)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--red)' }}>{totalChaptersRead}</div>
              <div style={{ fontSize: 12, color: 'var(--gray-2)' }}>Chapter Dibaca</div>
            </div>
          </div>
        </div>

        {/* Reading History — Manga Cards */}
        <div style={{ marginBottom: 48 }}>
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
                    {/* Badge chapter terakhir */}
                    <div style={{
                      position: 'absolute', bottom: 8, left: 8, right: 8,
                      fontSize: 10, fontWeight: 600, color: 'var(--white)',
                      background: 'rgba(0,0,0,0.7)', borderRadius: 4,
                      padding: '2px 6px', textAlign: 'center',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {h.chapter_name || 'Chapter ?'}
                    </div>
                  </div>
                  <div className="manga-card-info">
                    <div className="manga-card-title">
                      {h.manga_title || `Manga ${h.manga_id.slice(0, 8)}...`}
                    </div>
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
        <div style={{ marginBottom: 60 }}>
          <div className="section-header">
            <h2 className="section-title">Bookmark Saya</h2>
            {bookmarks && bookmarks.length > 0 && (
              <span style={{ fontSize: 12, color: 'var(--gray-2)' }}>{bookmarks.length} manga</span>
            )}
          </div>

          {!bookmarks || bookmarks.length === 0 ? (
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
