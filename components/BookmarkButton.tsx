'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface BookmarkButtonProps {
  mangaId: string
  title: string
  cover: string
}

export default function BookmarkButton({ mangaId, title, cover }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('manga_id', mangaId)
        .single()

      setBookmarked(!!data)
      setLoading(false)
    }
    init()
  }, [mangaId])

  async function toggle() {
    if (!user) {
      window.location.href = '/auth/login'
      return
    }

    setLoading(true)
    if (bookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('manga_id', mangaId)
      setBookmarked(false)
    } else {
      await supabase
        .from('bookmarks')
        .insert({ user_id: user.id, manga_id: mangaId, title, cover })
      setBookmarked(true)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`btn ${bookmarked ? 'btn-primary' : 'btn-outline'}`}
      aria-label={bookmarked ? 'Hapus bookmark' : 'Tambah bookmark'}
      title={!user ? 'Login untuk bookmark' : ''}
    >
      {loading ? (
        <span style={{ width: 16, height: 16, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
      )}
      {bookmarked ? 'Tersimpan' : 'Bookmark'}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </button>
  )
}
