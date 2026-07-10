'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

const TABS = [
  { key: 'manhwa', label: 'Manhwa' },
  { key: 'manga', label: 'Manga' },
  { key: 'manhua', label: 'Manhua' },
]

interface RekomItem {
  manga_id: string
  title: string
  cover: string
  status: string
}

export default function RecommendationSection() {
  const [activeTab, setActiveTab] = useState('manhwa')
  const [items, setItems] = useState<RekomItem[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    setItems([])
    fetch(`/api/manga/explore?type=${activeTab}&limit=15`)
      .then(r => r.json())
      .then(d => {
        setItems((d.data || []).map((item: any) => ({
          manga_id: item.manga_id,
          title: item.title,
          cover: item.cover_portrait_url || item.cover_image_url || '',
          status: item.status === 1 ? 'Ongoing' : 'Completed',
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeTab])

  // Reset scroll posisi ke awal saat tab ganti
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }, [activeTab])

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container">

        {/* Header */}
        <div className="section-header" style={{ marginBottom: 14 }}>
          <h2 className="section-title">Rekomendasi</h2>
          <Link href="/explore" className="section-link">Lihat semua →</Link>
        </div>

        {/* Filter Tabs */}
        <div className="rekom-tabs">
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`rekom-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Horizontal Scroll */}
        <div className="rekom-scroll" ref={scrollRef}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rekom-card rekom-skeleton" aria-hidden />
              ))
            : items.map(item => (
                <Link key={item.manga_id} href={`/manga/${item.manga_id}`} className="rekom-card">
                  {item.cover ? (
                    <img src={item.cover} alt={item.title} loading="lazy" />
                  ) : (
                    <div className="rekom-card-placeholder">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                      </svg>
                    </div>
                  )}
                  <div className="rekom-card-overlay" />
                  <div className="rekom-card-info">
                    <div className="rekom-card-title">{item.title}</div>
                    <div className={`rekom-card-badge ${item.status === 'Ongoing' ? 'ongoing' : 'done'}`}>
                      {item.status}
                    </div>
                  </div>
                </Link>
              ))
          }
        </div>

      </div>
    </section>
  )
}
