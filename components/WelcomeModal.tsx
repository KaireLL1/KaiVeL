'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kaivel_welcome_seen_v1'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Show only if not seen before
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      onClick={dismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #13131a 0%, #1a1a2e 100%)',
          border: '1px solid rgba(139,92,246,0.3)',
          borderRadius: '20px',
          maxWidth: 420, width: '100%',
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.9), 0 0 0 1px rgba(139,92,246,0.1)',
          animation: 'welcome-in 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '28px 24px 0', position: 'relative' }}>
          {/* Close btn */}
          <button
            onClick={dismiss}
            style={{
              position: 'absolute', top: 20, right: 20,
              width: 30, height: 30, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: '#aaa', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Beta badge */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(139,92,246,0.15)',
              border: '1px solid rgba(139,92,246,0.4)',
              borderRadius: '999px', padding: '4px 14px',
              fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
              color: '#c4b5fd', textTransform: 'uppercase',
            }}>
              ✦ BETA ACCESS
            </span>
          </div>

          {/* Warning icon */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(139,92,246,0.12)',
              border: '1px solid rgba(139,92,246,0.25)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: '#fff', lineHeight: 1.3 }}>
              Selamat datang di{' '}
              <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KaiVel
              </span>
            </h2>
          </div>
          <p style={{ textAlign: 'center', fontSize: 13, color: '#94a3b8', lineHeight: 1.7, margin: '0 0 24px' }}>
            Platform ini masih dalam tahap beta. Expect beberapa rough edges, update cepat, dan fitur baru yang terus landing.
          </p>
        </div>

        {/* Cards */}
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* TikTok card */}
          <a
            href="https://www.tiktok.com/@ka1rel"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', padding: '14px 16px',
              textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            {/* TikTok icon */}
            <div style={{
              width: 40, height: 40, borderRadius: '10px',
              background: '#000', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>TikTok Updates</div>
              <div style={{ fontSize: 11, color: '#94a3b8' }}>Update fitur, konten manga, dan info platform</div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </a>

          {/* Bug report card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px', padding: '14px 16px',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              🐛 Ketemu bug atau error?
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              Laporkan langsung supaya bisa diperbaiki lebih cepat.
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ padding: '0 20px 24px' }}>
          <button
            onClick={dismiss}
            style={{
              width: '100%', padding: '14px',
              borderRadius: '12px', border: 'none',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #22d3ee 100%)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 24px rgba(139,92,246,0.4)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            Got it, lanjut baca →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes welcome-in {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  )
}
