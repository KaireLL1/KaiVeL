'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  userId: string
  initialUsername: string
  initialBio: string
  email: string
  avatarColor: string
  stats: { label: string; value: number }[]
}

export default function ProfileHeader({
  userId, initialUsername, initialBio, email, avatarColor, stats
}: Props) {
  const [username, setUsername] = useState(initialUsername)
  const [bio, setBio] = useState(initialBio)
  const [editingUsername, setEditingUsername] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [usernameInput, setUsernameInput] = useState(initialUsername)
  const [bioInput, setBioInput] = useState(initialBio)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()
  const avatarLetter = (username || email)?.[0]?.toUpperCase() || 'U'

  async function saveUsername() {
    const val = usernameInput.trim()
    if (!val) { setError('Username tidak boleh kosong'); return }
    if (val.length < 3) { setError('Username minimal 3 karakter'); return }
    if (val.length > 20) { setError('Username maksimal 20 karakter'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) { setError('Hanya huruf, angka, dan underscore'); return }

    setSaving(true); setError('')
    const { error: err } = await supabase.from('profiles').upsert({
      user_id: userId, username: val, bio, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    setSaving(false)

    if (err) { setError('Gagal menyimpan: ' + err.message); return }
    setUsername(val)
    setEditingUsername(false)
  }

  async function saveBio() {
    const val = bioInput.trim()
    setSaving(true); setError('')
    const { error: err } = await supabase.from('profiles').upsert({
      user_id: userId, username, bio: val, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    setSaving(false)

    if (err) { setError('Gagal menyimpan: ' + err.message); return }
    setBio(val)
    setEditingBio(false)
  }

  function handleLogout() {
    supabase.auth.signOut().then(() => { window.location.href = '/' })
  }

  return (
    <div className="profile-new-header">
      {/* Avatar */}
      <div className="profile-new-avatar" style={{ background: avatarColor }}>
        {avatarLetter}
      </div>

      {/* Username + edit */}
      <div className="profile-new-name-row">
        {editingUsername ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: '100%' }}>
            <input
              className="profile-username-input"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveUsername(); if (e.key === 'Escape') setEditingUsername(false) }}
              maxLength={20}
              autoFocus
              placeholder="Username kamu"
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ padding: '5px 16px', fontSize: 12 }} onClick={saveUsername} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { setEditingUsername(false); setError('') }}>
                Batal
              </button>
            </div>
            {error && <div style={{ fontSize: 11, color: 'var(--red)' }}>{error}</div>}
          </div>
        ) : (
          <>
            <span className="profile-new-name">{username}</span>
            <button
              className="profile-edit-btn"
              onClick={() => { setUsernameInput(username); setEditingUsername(true) }}
              aria-label="Edit username"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Email */}
      <div className="profile-new-email">{email}</div>

      {/* Bio */}
      {editingBio ? (
        <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
          <textarea
            className="profile-bio-input"
            value={bioInput}
            onChange={e => setBioInput(e.target.value)}
            maxLength={120}
            rows={2}
            autoFocus
            placeholder="Tulis bio singkat..."
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-primary" style={{ padding: '5px 16px', fontSize: 12 }} onClick={saveBio} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => setEditingBio(false)}>
              Batal
            </button>
          </div>
          {error && <div style={{ fontSize: 11, color: 'var(--red)', textAlign: 'center' }}>{error}</div>}
        </div>
      ) : (
        <button
          className="profile-bio-btn"
          onClick={() => { setBioInput(bio); setEditingBio(true) }}
        >
          {bio ? (
            <span style={{ color: 'var(--gray-1)' }}>{bio}</span>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Tambah bio
            </>
          )}
        </button>
      )}

      {/* Stats */}
      <div className="profile-new-stats">
        {stats.map(s => (
          <div key={s.label} className="profile-new-stat">
            <div className="profile-new-stat-val">{s.value}</div>
            <div className="profile-new-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sign out */}
      <button className="profile-signout-btn" onClick={handleLogout}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </div>
  )
}
