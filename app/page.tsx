import Link from 'next/link'
import { getPopular, getLatest } from '@/lib/api'
import MangaGrid from '@/components/MangaGrid'
import RecommendationSection from '@/components/RecommendationSection'

function toStatus(code: number) {
  if (code === 1) return 'Ongoing'
  if (code === 2) return 'Completed'
  return 'Unknown'
}

function mapManga(item: any) {
  return {
    manga_id: item.manga_id,
    title: item.title,
    cover: item.cover_portrait_url || item.cover_image_url || '',
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
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div style={{ maxWidth: 540 }}>
            <div className="hero-label">Platform Baca Manga</div>
            <h1 className="hero-title">Baca Manga<br />Tanpa Batas</h1>
            <p className="hero-desc">
              Nikmati ribuan judul manga, manhwa, dan manhua secara gratis.
              Update cepat, kualitas terbaik, tanpa iklan mengganggu.
            </p>
            <div className="hero-actions">
              <Link href="/explore" className="btn btn-primary" style={{ padding: '11px 22px', fontSize: 14 }}>
                Mulai Baca
              </Link>
              <Link href="/auth/register" className="btn btn-ghost" style={{ padding: '11px 22px', fontSize: 14 }}>
                Daftar Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Rekomendasi — horizontal scroll dengan tab filter */}
      <RecommendationSection />

      {/* Popular */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Populer</h2>
            <Link href="/explore?sort=popular" className="section-link">Lihat semua →</Link>
          </div>
          <MangaGrid items={popular} />
        </div>
      </section>

      {/* Latest */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Update Terbaru</h2>
            <Link href="/explore?sort=latest" className="section-link">Lihat semua →</Link>
          </div>
          <MangaGrid items={latest} />
        </div>
      </section>

      {/* CTA */}
      <div className="cta-section">
        <div className="container">
          <h2 className="cta-title">Simpan Manga Favoritmu</h2>
          <p className="cta-desc">
            Daftar gratis dan bookmark manga favoritmu agar tidak ketinggalan update terbaru.
          </p>
          <Link href="/auth/register" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: 14 }}>
            Daftar Sekarang — Gratis
          </Link>
        </div>
      </div>
    </div>
  )
}
