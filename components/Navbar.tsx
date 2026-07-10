'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  manga_id: string
  title: string
  cover: string
  status?: string
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [dropOpen, setDropOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedQuery = useDebounce(query, 320)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setSearchOpen(false); setQuery('') }, [pathname])

  // Live search
  useEffect(() => {
    if (debouncedQuery.length < 3) {
      setSearchResults([])
      setSearchOpen(false)
      return
    }
    setSearchLoading(true)
    fetch(`/api/manga/search?q=${encodeURIComponent(debouncedQuery)}&limit=6`)
      .then(r => r.json())
      .then(json => {
        const items: SearchResult[] = (json.data || []).slice(0, 6).map((d: any) => ({
          manga_id: d.manga_id,
          title: d.title,
          cover: d.cover_portrait_url || d.cover_image_url || '',
          status: d.status === 1 ? 'Ongoing' : d.status === 2 ? 'Completed' : '',
        }))
        setSearchResults(items)
        setSearchOpen(items.length > 0)
      })
      .catch(() => setSearchResults([]))
      .finally(() => setSearchLoading(false))
  }, [debouncedQuery])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setSearchOpen(false)
    }
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const links = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
    { href: '/explore?type=manhwa', label: 'Manhwa' },
    { href: '/explore?type=manhua', label: 'Manhua' },
    { href: '/chat', label: 'Chat' },
  ]

  const dropMenu = (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-md)', minWidth: '190px',
      boxShadow: '0 16px 40px rgba(0,0,0,0.5)', overflow: 'hidden', zIndex: 300
    }}>
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: 11, color: 'var(--gray-2)', marginBottom: 2 }}>Login sebagai</div>
        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{user?.email}</div>
      </div>
      {[
        { href: '/profile', label: 'Profil & Bookmark' },
        { href: '/profile#history', label: 'Riwayat Baca' },
        { href: '/chat', label: 'Global Chat' },
      ].map(item => (
        <Link key={item.href} href={item.href}
          style={{ display: 'block', padding: '10px 14px', fontSize: 13, transition: 'background var(--dur)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          onClick={() => setDropOpen(false)}
        >{item.label}</Link>
      ))}
      <button onClick={handleLogout} style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '10px 14px', fontSize: 13, color: 'var(--red)',
        transition: 'background var(--dur)'
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >Logout</button>
    </div>
  )

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-logo">Kai<span>Vel</span></Link>

          {/* Desktop links */}
          <div className="navbar-links">
            {links.map(l => (
              <Link key={l.href} href={l.href} className={`navbar-link ${pathname === l.href ? 'active' : ''}`}>{l.label}</Link>
            ))}
          </div>

          {/* Desktop search with live dropdown */}
          <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 280 }} className="navbar-search-wrap">
            <form className="navbar-search" onSubmit={handleSearch}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--gray-2)', flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                placeholder="Cari manga..."
                aria-label="Cari manga"
                autoComplete="off"
              />
              {searchLoading && (
                <div style={{ width: 12, height: 12, border: '2px solid var(--gray-3)', borderTopColor: 'var(--red)', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
              )}
            </form>

            {/* Dropdown results */}
            {searchOpen && searchResults.length > 0 && (
              <div className="search-dropdown">
                {searchResults.map(item => (
                  <Link
                    key={item.manga_id}
                    href={`/manga/${item.manga_id}`}
                    className="search-dropdown-item"
                    onClick={() => { setSearchOpen(false); setQuery('') }}
                  >
                    <div className="search-dropdown-cover">
                      {item.cover ? (
                        <img src={item.cover} alt={item.title} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--gray-3)' }}>?</div>
                      )}
                    </div>
                    <div className="search-dropdown-info">
                      <div className="search-dropdown-title">{item.title}</div>
                      {item.status && <div className="search-dropdown-status">{item.status}</div>}
                    </div>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(query)}`}
                  className="search-dropdown-viewall"
                  onClick={() => { setSearchOpen(false) }}
                >
                  Lihat semua hasil untuk &quot;{query}&quot; →
                </Link>
              </div>
            )}
          </div>

          {/* Desktop auth */}
          <div className="navbar-actions">
            {user ? (
              <div style={{ position: 'relative' }} ref={dropRef}>
                <div className="user-avatar" onClick={() => setDropOpen(!dropOpen)} role="button">
                  {user.email?.[0]?.toUpperCase()}
                </div>
                {dropOpen && dropMenu}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: 12 }}>Masuk</Link>
                <Link href="/auth/register" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12 }}>Daftar</Link>
              </>
            )}
          </div>

          {/* Mobile: search icon → /search page */}
          <Link href="/search" className="mobile-search-btn" aria-label="Cari">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </Link>

          {/* Mobile: user avatar */}
          {user && (
            <div className="mobile-avatar-btn" ref={dropRef}>
              <div className="user-avatar" onClick={() => setDropOpen(!dropOpen)} role="button" style={{ width: 28, height: 28, fontSize: 11 }}>
                {user.email?.[0]?.toUpperCase()}
              </div>
              {dropOpen && dropMenu}
            </div>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .mobile-search-btn { display: flex !important; }
          .mobile-avatar-btn { display: flex !important; }
          .navbar-actions { display: none; }
          .navbar-links { display: none; }
          .navbar-search-wrap { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-search-btn { display: none !important; }
          .mobile-avatar-btn { display: none !important; }
        }
      `}</style>
    </>
  )
}
