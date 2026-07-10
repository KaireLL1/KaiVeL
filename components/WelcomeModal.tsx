'use client'

import { useEffect, useState } from 'react'

const STORAGE_KEY = 'kaivel_welcome_seen_v2'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY)
    if (!seen) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes welcome-in {
          from { opacity: 0; transform: scale(0.9) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .wm-backdrop { position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,0.72);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:16px; }
        .wm-card { background:linear-gradient(170deg,#16162a 0%,#1b1b30 100%);border:1px solid rgba(139,92,246,0.25);border-radius:22px;max-width:430px;width:100%;max-height:90vh;overflow-y:auto;box-shadow:0 40px 120px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.04);animation:welcome-in 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .wm-card::-webkit-scrollbar { width:4px; }
        .wm-card::-webkit-scrollbar-track { background:transparent; }
        .wm-card::-webkit-scrollbar-thumb { background:rgba(139,92,246,0.3);border-radius:4px; }
        .wm-info-card { background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px 18px; }
        .wm-info-card:hover { background:rgba(255,255,255,0.05);border-color:rgba(255,255,255,0.12); }
        .wm-tt-link { display:flex;align-items:center;gap:14px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:14px 18px;text-decoration:none;transition:all 0.2s; }
        .wm-tt-link:hover { background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.16); }
        .wm-cta { width:100%;padding:15px;border-radius:14px;border:none;background:linear-gradient(135deg,#8b5cf6 0%,#6366f1 60%,#22d3ee 100%);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 6px 28px rgba(139,92,246,0.45);transition:opacity 0.2s,transform 0.15s;letter-spacing:0.2px; }
        .wm-cta:hover { opacity:0.88;transform:translateY(-2px); }
        .wm-close { position:absolute;top:18px;right:18px;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.07);border:none;color:#aaa;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s; }
        .wm-close:hover { background:rgba(255,255,255,0.14); }
      `}</style>

      <div className="wm-backdrop" onClick={dismiss}>
        <div className="wm-card" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div style={{ padding: '28px 24px 0', position: 'relative', textAlign: 'center' }}>

            {/* Close */}
            <button className="wm-close" onClick={dismiss} aria-label="Tutup">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Badge — pengganti BETA ACCESS */}
            <div style={{ marginBottom: 20 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(34,211,238,0.15))',
                border: '1px solid rgba(139,92,246,0.4)',
                borderRadius: '999px', padding: '5px 16px',
                fontSize: 11, fontWeight: 700, letterSpacing: 1.4,
                color: '#c4b5fd', textTransform: 'uppercase',
              }}>
                ✦ &nbsp;Baca Gratis · Tanpa Batas
              </span>
            </div>

            {/* Icon */}
            <div style={{ marginBottom: 18 }}>
              <div style={{
                width: 68, height: 68, borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(139,92,246,0.18), rgba(34,211,238,0.08))',
                border: '1px solid rgba(139,92,246,0.3)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 30px rgba(139,92,246,0.2)',
              }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <defs>
                    <linearGradient id="wm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6"/>
                      <stop offset="100%" stopColor="#22d3ee"/>
                    </linearGradient>
                  </defs>
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" stroke="url(#wm-grad)"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="url(#wm-grad)"/>
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 10px', lineHeight: 1.3 }}>
              Selamat datang di{' '}
              <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KaiVel
              </span>
            </h2>
            <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.75, margin: '0 0 26px', padding: '0 4px' }}>
              Nikmati ribuan judul manga, manhwa, dan manhua secara gratis. Update rutin, baca kapan saja — tidak perlu daftar untuk mulai.
            </p>
          </div>

          {/* Cards */}
          <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* TikTok card */}
            <div className="wm-info-card">
              <a
                href="https://www.tiktok.com/@ka1rel"
                target="_blank"
                rel="noopener noreferrer"
                className="wm-tt-link"
                style={{ marginBottom: 14 }}
              >
                {/* TikTok icon */}
                <div style={{
                  width: 42, height: 42, borderRadius: '11px',
                  background: '#000', border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.27 8.27 0 0 0 4.83 1.55V6.79a4.85 4.85 0 0 1-1.06-.1z"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>@ka1rel — TikTok</div>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>Update fitur, rekomendasi manga, dan konten seru</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </a>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
                  Mau update tanpa harus cek website tiap hari?
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
                  Ikuti TikTok untuk dapat info chapter terbaru, fitur baru, dan rekomendasi manga pilihan.
                </div>
              </div>
            </div>

            {/* Bug / feedback card */}
            <div className="wm-info-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', marginBottom: 4 }}>
                  Nemu bug atau tampilan aneh?
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.65 }}>
                  Laporkan ke developer supaya bisa langsung diperbaiki.
                </div>
              </div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '999px', padding: '6px 12px',
                fontSize: 12, fontWeight: 600, color: '#c4b5fd', flexShrink: 0,
              }}>
                🐛 Lapor
              </span>
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '16px 20px 26px' }}>
            <button className="wm-cta" onClick={dismiss}>
              Got it, lanjut baca →
            </button>
          </div>

        </div>
      </div>
    </>
  )
}
