'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface ChatMessage {
  id: string
  user_id: string
  username: string
  message: string
  edited: boolean
  created_at: string
  updated_at: string
}

interface UserProfile {
  avatar_url: string | null
  username: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'baru saja'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m} menit lalu`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} jam lalu`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function dayLabel(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return 'Hari ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function ChatPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [chatUsername, setChatUsername] = useState('')
  const [myAvatarUrl, setMyAvatarUrl] = useState<string | null>(null)
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({})
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [onlineCount, setOnlineCount] = useState(1)
  const bodyRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auth + fetch username & avatar dari profiles
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const u = data.user
      setUser(u)
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', u.id)
          .maybeSingle()
        setChatUsername(profile?.username || u.email?.split('@')[0] || 'User')
        setMyAvatarUrl(profile?.avatar_url || null)
      }
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('user_id', u.id)
          .maybeSingle()
        setChatUsername(profile?.username || u.email?.split('@')[0] || 'User')
        setMyAvatarUrl(profile?.avatar_url || null)
      } else {
        setChatUsername('')
        setMyAvatarUrl(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from('global_chat')
      .select('*')
      .order('created_at', { ascending: true })
      .limit(100)
    if (!error && data) {
      setMessages(data)
      // Fetch avatars for all unique users
      const uniqueIds = [...new Set(data.map((m: ChatMessage) => m.user_id))]
      if (uniqueIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, username, avatar_url')
          .in('user_id', uniqueIds)
        if (profiles) {
          const map: Record<string, UserProfile> = {}
          profiles.forEach((p: any) => { map[p.user_id] = { avatar_url: p.avatar_url || null, username: p.username || '' } })
          setUserProfiles(map)
        }
      }
    }
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('global_chat_realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'global_chat',
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage])
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'global_chat',
      }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? payload.new as ChatMessage : m))
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'global_chat',
      }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  async function sendMessage() {
    if (!input.trim() || !user || sending) return
    const text = input.trim()
    if (text.length > 500) return
    setInput('')
    setSending(true)
    await supabase.from('global_chat').insert({
      user_id: user.id,
      username: chatUsername || user.email?.split('@')[0] || 'User',
      message: text,
    })
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Delete message
  async function deleteMessage(id: string) {
    if (!confirm('Hapus pesan ini?')) return
    await supabase.from('global_chat').delete().eq('id', id)
  }

  // Start editing
  function startEdit(msg: ChatMessage) {
    setEditingId(msg.id)
    setEditText(msg.message)
  }

  // Save edit
  async function saveEdit(id: string) {
    if (!editText.trim()) return
    await supabase.from('global_chat').update({
      message: editText.trim(),
      edited: true,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    setEditingId(null)
    setEditText('')
  }

  // Group messages by day
  const grouped: { day: string; msgs: ChatMessage[] }[] = []
  messages.forEach(msg => {
    const day = new Date(msg.created_at).toDateString()
    const last = grouped[grouped.length - 1]
    if (last && last.day === day) {
      last.msgs.push(msg)
    } else {
      grouped.push({ day, msgs: [msg] })
    }
  })

  const avatarColor = (userId: string) => {
    const colors = ['#e63946', '#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6']
    let hash = 0
    for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="chat-page">
      <div className="container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-inner">
            <div>
              <div className="chat-title">Global Chat</div>
              <div style={{ fontSize: 12, color: 'var(--gray-2)', marginTop: 3 }}>
                Chat publik — siapa saja bisa baca, login untuk ikut chat
              </div>
            </div>
            <div className="chat-online">Live</div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-body" ref={bodyRef}>
          {messages.length === 0 ? (
            <div className="chat-empty">
              <svg className="chat-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-1)', marginBottom: 4 }}>Belum ada pesan</div>
              <div style={{ fontSize: 12 }}>Jadilah yang pertama chat!</div>
            </div>
          ) : (
            <div className="chat-messages">
              {grouped.map(group => (
                <div key={group.day}>
                  <div className="chat-day-divider">{dayLabel(group.msgs[0].created_at)}</div>
                  {group.msgs.map(msg => {
                    const isOwn = user?.id === msg.user_id
                    return (
                      <div key={msg.id} className={`chat-msg${isOwn ? ' chat-msg-own' : ''}`}>
                        {/* Avatar */}
                        <div
                          className="chat-avatar"
                          style={{
                            background: avatarColor(msg.user_id),
                            padding: 0, overflow: 'hidden', flexShrink: 0
                          }}
                        >
                          {userProfiles[msg.user_id]?.avatar_url ? (
                            <img
                              src={userProfiles[msg.user_id].avatar_url!}
                              alt={msg.username}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            msg.username?.[0]?.toUpperCase() || '?'
                          )}
                        </div>

                        {/* Content */}
                        <div className="chat-content">
                          <div className="chat-meta">
                            <span className="chat-username">{msg.username}</span>
                            <span className="chat-time">{timeAgo(msg.created_at)}</span>
                            {msg.edited && <span className="chat-edited">diedit</span>}
                          </div>

                          {editingId === msg.id ? (
                            <div style={{ width: '100%' }}>
                              <input
                                className="chat-edit-input"
                                value={editText}
                                onChange={e => setEditText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveEdit(msg.id)
                                  if (e.key === 'Escape') setEditingId(null)
                                }}
                                autoFocus
                                maxLength={500}
                              />
                              <div className="chat-edit-actions">
                                <button className="btn btn-primary" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => saveEdit(msg.id)}>Simpan</button>
                                <button className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: 11 }} onClick={() => setEditingId(null)}>Batal</button>
                              </div>
                            </div>
                          ) : (
                            <div className="chat-bubble">{msg.message}</div>
                          )}
                        </div>

                        {/* Actions (own messages only) */}
                        {isOwn && editingId !== msg.id && (
                          <div className="chat-msg-actions">
                            <button className="chat-action-btn" onClick={() => startEdit(msg)}>Edit</button>
                            <button className="chat-action-btn del" onClick={() => deleteMessage(msg.id)}>Hapus</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Footer input */}
        <div className="chat-footer">
          {user ? (
            <div className="chat-input-wrap">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Kirim pesan... (Enter untuk kirim, Shift+Enter untuk baris baru)"
                maxLength={500}
                rows={1}
              />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                {input.length > 400 && (
                  <span style={{ fontSize: 10, color: input.length >= 500 ? 'var(--red)' : 'var(--gray-2)' }}>
                    {input.length}/500
                  </span>
                )}
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={!input.trim() || sending || input.length > 500}
                  aria-label="Kirim pesan"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-login-prompt">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--gray-2)', flexShrink: 0 }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>
                <Link href="/auth/login" style={{ color: 'var(--red)', fontWeight: 600 }}>Login</Link>
                {' '}untuk ikut chat
              </span>
              <Link href="/auth/register" className="btn btn-primary" style={{ padding: '6px 14px', fontSize: 12, marginLeft: 'auto' }}>
                Daftar Gratis
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
