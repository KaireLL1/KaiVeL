import Link from 'next/link'
import { getPopular, getLatest } from '@/lib/api'
import MangaGrid from '@/components/MangaGrid'
import RecommendationSection from '@/components/RecommendationSection'
import HeroBanner from '@/components/HeroBanner'

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
    <div className="fade-in home-snap-container">
      {/* Hero Banner — auto-sliding */}
      <div className="home-snap-section">
        <HeroBanner />
      </div>

      {/* Rekomendasi */}
      <div className="home-snap-section">
        <RecommendationSection />
      </div>

      {/* Popular */}
      <div className="home-snap-section">
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Populer</h2>
              <Link href="/explore?sort=popular" className="section-link">Lihat semua →</Link>
            </div>
            <MangaGrid items={popular} />
          </div>
        </section>
      </div>

      {/* Latest */}
      <div className="home-snap-section">
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">Update Terbaru</h2>
              <Link href="/explore?sort=latest" className="section-link">Lihat semua →</Link>
            </div>
            <MangaGrid items={latest} />
          </div>
        </section>
      </div>
    </div>
  )
}
