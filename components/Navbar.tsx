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
  const [menuOpen, setMenuOpen] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
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
  ]

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link href="/" className="navbar-logo">
          Kai<span>Vel</span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`navbar-link ${pathname === l.href ? 'active' : ''}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari manga..."
            aria-label="Cari manga"
          />
        </form>

        {/* Auth Actions */}
        <div className="navbar-actions">
          {user ? (
            <div style={{ position: 'relative' }} ref={dropRef}>
              <div
                className="user-avatar"
                onClick={() => setMenuOpen(!menuOpen)}
                title={user.email}
                role="button"
                aria-label="User menu"
              >
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              {menuOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)', minWidth: '180px',
                  boxShadow: 'var(--shadow-card)', overflow: 'hidden', zIndex: 200
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Login sebagai</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </div>
                  </div>
                  <Link href="/profile" style={{ display: 'block', padding: '10px 16px', fontSize: '14px', transition: 'var(--transition)' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    onClick={() => setMenuOpen(false)}
                  >👤 Profil & Bookmark</Link>
                  <button onClick={handleLogout} style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: '14px', color: 'var(--accent)',
                    transition: 'var(--transition)'
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-ghost" style={{ padding: '7px 16px', fontSize: '13px' }}>Masuk</Link>
              <Link href="/auth/register" className="btn btn-primary" style={{ padding: '7px 16px', fontSize: '13px' }}>Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
