import MangaCard from './MangaCard'

interface MangaItem {
  manga_id: string
  title: string
  cover: string
  cover_portrait?: string
  status?: string
  score?: number | null
  country?: string | null
}

interface MangaGridProps {
  items: MangaItem[]
  emptyText?: string
}

export default function MangaGrid({ items, emptyText = 'Tidak ada manga ditemukan.' }: MangaGridProps) {
  if (!items || items.length === 0) {
    return (
      <div className="empty">
        <div className="empty-icon">📭</div>
        <div className="empty-text">{emptyText}</div>
        <div className="empty-sub">Coba kata kunci lain atau filter berbeda.</div>
      </div>
    )
  }

  return (
    <div className="manga-grid">
      {items.map((m) => (
        <MangaCard
          key={m.manga_id}
          manga_id={m.manga_id}
          title={m.title}
          cover={m.cover_portrait || m.cover}
          status={m.status}
          score={m.score}
          country={m.country}
        />
      ))}
    </div>
  )
}
