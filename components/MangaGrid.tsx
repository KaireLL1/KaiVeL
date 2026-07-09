import MangaCard from './MangaCard'

interface Manga {
  manga_id: string
  title: string
  cover: string
  cover_portrait?: string
  status?: string
  country?: string
  score?: number
}

export default function MangaGrid({ items }: { items: Manga[] }) {
  if (!items?.length) {
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        <div className="empty-text">Tidak ada manga ditemukan</div>
        <div className="empty-sub">Coba kata kunci lain</div>
      </div>
    )
  }
  return (
    <div className="manga-grid">
      {items.map(m => <MangaCard key={m.manga_id} {...m} />)}
    </div>
  )
}
