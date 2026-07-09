import Link from 'next/link'
import { getPopular, getLatest } from '@/lib/api'
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

export default async function HomePage() {
  const [popularRes, latestRes] = await Promise.all([
    getPopular(1, 12),
    getLatest(1, 12),
  ])

  const popular = (popularRes.data || []).map(mapManga)
  const latest  = (latestRes.data  || []).map(mapManga)

  return (
    <div className="fade-in">
      {/* ── Hero ─────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-label">🗡️ Platform Baca Manga Indonesia</div>
            <h1 className="hero-title">Baca Manga<br />Tanpa Batas</h1>
            <p className="hero-desc">
              Nikmati ribuan judul manga, manhwa, dan manhua secara gratis.
              Update cepat, kualitas terbaik.
            </p>
            <div className="hero-actions">
              <Link href="/explore" className="btn btn-primary">
                🔥 Mulai Baca
              </Link>
              <Link href="/auth/register" className="btn btn-ghost">
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────── */}
      <section style={{ borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)', padding: '20px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', textAlign: 'center', gap: 20 }}>
            {[
              { num: '10,000+', label: 'Judul Manga' },
              { num: '100K+', label: 'Pembaca Aktif' },
              { num: 'Gratis', label: 'Selamanya' },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 800, color: 'var(--accent)' }}>{s.num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular ──────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 Populer</h2>
            <Link href="/explore?sort=popular" className="section-link">Lihat semua →</Link>
          </div>
          <MangaGrid items={popular} />
        </div>
      </section>

      {/* ── Latest ───────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🆕 Update Terbaru</h2>
            <Link href="/explore?sort=latest" className="section-link">Lihat semua →</Link>
          </div>
          <MangaGrid items={latest} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, rgba(230,57,70,0.08), rgba(100,50,200,0.06))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '60px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, marginBottom: 12 }}>
            Simpan Favoritmu
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto 24px', fontSize: 15 }}>
            Daftar gratis dan bookmark manga favoritmu agar tidak ketinggalan update terbaru.
          </p>
          <Link href="/auth/register" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>
            Daftar Sekarang — Gratis 🚀
          </Link>
        </div>
      </section>
    </div>
  )
}
