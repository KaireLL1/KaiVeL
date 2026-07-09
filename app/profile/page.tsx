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

  // Fetch reading history (latest unique manga)
  const { data: history } = await supabase
    .from('reading_history')
    .select('*')
    .eq('user_id', user.id)
    .order('read_at', { ascending: false })
    .limit(20)

  const avatar = user.email?.[0]?.toUpperCase() || 'U'
  const joinDate = new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })

  return (
    <div className="fade-in">
      <div className="container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">{avatar}</div>
          <div>
            <div className="profile-name">{user.email?.split('@')[0]}</div>
            <div className="profile-email">{user.email}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Bergabung sejak {joinDate}</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{bookmarks?.length || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bookmark</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{history?.length || 0}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Dibaca</div>
            </div>
          </div>
        </div>

        {/* Bookmarks */}
        <div style={{ marginBottom: 48 }}>
          <div className="section-header">
            <h2 className="section-title">🔖 Bookmark Saya</h2>
          </div>

          {!bookmarks || bookmarks.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔖</div>
              <div className="empty-text">Belum ada bookmark</div>
              <div className="empty-sub">Mulai bookmark manga favoritmu!</div>
              <Link href="/explore" className="btn btn-primary" style={{ marginTop: 16 }}>Explore Manga</Link>
            </div>
          ) : (
            <div className="manga-grid">
              {bookmarks.map((b: any) => (
                <Link key={b.id} href={`/manga/${b.manga_id}`} className="manga-card">
                  <div className="manga-card-cover">
                    <img
                      src={b.cover}
                      alt={b.title}
                      loading="lazy"
                    />
                    <div className="manga-card-overlay" />
                  </div>
                  <div className="manga-card-info">
                    <div className="manga-card-title">{b.title}</div>
                    <div className="manga-card-meta">{new Date(b.created_at).toLocaleDateString('id-ID')}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* History */}
        <div style={{ marginBottom: 60 }}>
          <div className="section-header">
            <h2 className="section-title">📖 Riwayat Baca</h2>
          </div>

          {!history || history.length === 0 ? (
            <div className="empty" style={{ padding: '40px 0' }}>
              <div className="empty-icon">📖</div>
              <div className="empty-text">Belum ada riwayat</div>
              <div className="empty-sub">Mulai baca manga sekarang!</div>
            </div>
          ) : (
            <div className="chapter-list">
              {history.map((h: any) => (
                <Link
                  key={h.id}
                  href={`/manga/${h.manga_id}/${h.chapter_id}`}
                  className="chapter-item"
                >
                  <div>
                    <div className="chapter-name">{h.chapter_name || h.chapter_id}</div>
                    <div className="chapter-date">
                      <Link href={`/manga/${h.manga_id}`} onClick={e => e.stopPropagation()} style={{ color: 'var(--accent)', marginRight: 8 }}>
                        Lihat Manga
                      </Link>
                      {new Date(h.read_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)' }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
