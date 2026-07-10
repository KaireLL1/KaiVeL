'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email.includes('@')) { setError('Format email tidak valid.'); return }
    if (password !== confirm) { setError('Password tidak cocok.'); return }
    if (password.length < 6) { setError('Password minimal 6 karakter.'); return }

    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    setLoading(false)

    if (err) {
      // Map Supabase error messages ke Bahasa Indonesia
      if (err.message.toLowerCase().includes('already registered') ||
          err.message.toLowerCase().includes('already been registered') ||
          err.message.toLowerCase().includes('user already exists')) {
        setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.')
      } else if (err.message.toLowerCase().includes('invalid email')) {
        setError('Format email tidak valid.')
      } else if (err.message.toLowerCase().includes('password')) {
        setError('Password terlalu lemah. Gunakan minimal 6 karakter.')
      } else {
        setError('Pendaftaran gagal: ' + err.message)
      }
      return
    }

    // Supabase kadang tidak return error untuk email yang sudah ada
    // tapi mengembalikan user dengan identities kosong
    if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
      setError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.')
      return
    }

    // Sukses — cek apakah perlu konfirmasi email
    if (data?.user && !data.user.email_confirmed_at) {
      setSuccess(true)
    } else {
      router.push('/')
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card fade-in" style={{ textAlign: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
            Cek Email Kamu!
          </h2>
          <p style={{ fontSize: 13, color: 'var(--gray-1)', lineHeight: 1.6, marginBottom: 24 }}>
            Kami mengirim link konfirmasi ke <strong>{email}</strong>.<br />
            Klik link tersebut untuk aktivasi akun kamu.
          </p>
          <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
            Ke Halaman Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-text">Kai<span>Vel</span></div>
          <div style={{ fontSize: 12, color: 'var(--gray-2)', marginTop: 4 }}>Platform Baca Manga</div>
        </div>

        <h1 className="auth-title">Daftar Gratis</h1>
        <p className="auth-subtitle">Buat akun dan mulai bookmark manga favoritmu.</p>

        {error && (
          <div className="alert alert-error" style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input id="email" type="email" className="form-input" placeholder="kamu@email.com"
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input id="password" type="password" className="form-input" placeholder="Min. 6 karakter"
              value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="confirm">Konfirmasi Password</label>
            <input id="confirm" type="password" className="form-input" placeholder="Ulangi password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required />
            {confirm && password !== confirm && (
              <div className="form-error">Password tidak cocok</div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: 8 }}
            disabled={loading || (confirm.length > 0 && password !== confirm)}
          >
            {loading ? (
              <>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                Memproses...
              </>
            ) : 'Daftar Sekarang'}
          </button>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </form>

        <div className="auth-divider">— atau —</div>
        <p className="auth-link">Sudah punya akun? <Link href="/auth/login">Masuk</Link></p>
      </div>
    </div>
  )
}
