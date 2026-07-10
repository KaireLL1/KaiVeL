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
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)
  const mobileDropRef = useRef<HTMLDivElement>(null)
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
      const t = e.target as Node
      if (
        dropRef.current && !dropRef.current.contains(t) &&
        mobileDropRef.current && !mobileDropRef.current.contains(t)
      ) setDropOpen(false)
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false)
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

  function handleLogout() {
    setDropOpen(false)
    setShowLogoutModal(true)
  }

  async function confirmLogout() {
    setShowLogoutModal(false)
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
            <div className="mobile-avatar-btn" ref={mobileDropRef}>
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
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.93) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
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

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--border)',
              borderRadius: '18px',
              padding: '32px 28px 28px',
              maxWidth: 360, width: '100%',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
              animation: 'modal-in 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </div>

            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--white)', marginBottom: 10 }}>
              Yakin ingin logout?
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-2)', lineHeight: 1.7, marginBottom: 26 }}>
              Kamu akan keluar dari akun dan perlu login kembali untuk mengakses fitur member.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowLogoutModal(false)}
                style={{
                  flex: 1, padding: '11px 0',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  color: 'var(--white)', fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Batal
              </button>
              <button
                onClick={confirmLogout}
                style={{
                  flex: 1, padding: '11px 0',
                  borderRadius: 'var(--r-sm)',
                  background: '#ef4444', border: '1px solid #ef4444',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Ya, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
