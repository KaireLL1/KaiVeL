'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }
    if (password !== confirm) {
      setError('Password dan konfirmasi tidak cocok.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message === 'User already registered' ? 'Email sudah terdaftar.' : 'Gagal mendaftar. Coba lagi.')
    } else {
      setSuccess('Akun berhasil dibuat! Cek email kamu untuk verifikasi, lalu login.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="auth-logo">
          <div className="auth-logo-text">Kai<span>Vel</span></div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Platform Baca Manga</div>
        </div>

        <h1 className="auth-title">Daftar Gratis</h1>
        <p className="auth-subtitle">Buat akun dan mulai bookmark manga favoritmu.</p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="contoh@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm" className="form-label">Konfirmasi Password</label>
              <input
                id="confirm"
                type="password"
                className="form-input"
                placeholder="Ulangi password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, marginTop: 8 }}
            >
              {loading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>
        )}

        {success && (
          <Link href="/auth/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, display: 'flex' }}>
            Pergi ke Halaman Login
          </Link>
        )}

        <div className="auth-link" style={{ marginTop: 20 }}>
          Sudah punya akun? <Link href="/auth/login">Masuk</Link>
        </div>
      </div>
    </div>
  )
}
