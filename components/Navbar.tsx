'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [query, setQuery] = useState('')
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => setUser(session?.user ?? null))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [pathname])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) { router.push(`/search?q=${encodeURIComponent(query.trim())}`); setMobileOpen(false) }
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

          {/* Desktop search */}
          <form className="navbar-search" onSubmit={handleSearch}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--gray-2)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari manga..." aria-label="Cari manga" />
          </form>

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

          {/* Mobile: search icon only — navigasi ada di bottom nav */}
          <Link
            href="/search"
            className="mobile-search-btn"
            aria-label="Cari"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </Link>
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .mobile-search-btn { display: flex !important; }
          .navbar-actions { display: none; }
          .navbar-links { display: none; }
        }
      `}</style>
    </>
  )
}
