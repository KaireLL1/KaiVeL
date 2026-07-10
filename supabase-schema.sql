-- ============================================
-- KaiVel Database Schema (Supabase)
-- Jalankan di: Supabase > SQL Editor
-- ============================================

-- Tabel Bookmarks
CREATE TABLE IF NOT EXISTS bookmarks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manga_id    TEXT NOT NULL,
  title       TEXT,
  cover       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index + unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS bookmarks_user_manga ON bookmarks(user_id, manga_id);

-- Row Level Security
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own bookmarks"
  ON bookmarks FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────

-- Tabel Reading History
CREATE TABLE IF NOT EXISTS reading_history (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  manga_id      TEXT NOT NULL,
  chapter_id    TEXT NOT NULL,
  chapter_name  TEXT,
  read_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Index + unique per chapter per user
CREATE UNIQUE INDEX IF NOT EXISTS history_user_chapter ON reading_history(user_id, manga_id, chapter_id);

-- Row Level Security
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own history"
  ON reading_history FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────

-- Tabel Global Chat
CREATE TABLE IF NOT EXISTS global_chat (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username    TEXT NOT NULL,
  message     TEXT NOT NULL CHECK (char_length(message) <= 500),
  edited      BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk ordering
CREATE INDEX IF NOT EXISTS global_chat_created_at ON global_chat(created_at DESC);

-- Row Level Security
ALTER TABLE global_chat ENABLE ROW LEVEL SECURITY;

-- Siapa saja (termasuk yang belum login) bisa BACA chat
CREATE POLICY "Anyone can read global chat"
  ON global_chat FOR SELECT USING (true);

-- Hanya user yang login bisa KIRIM pesan
CREATE POLICY "Authenticated users can insert"
  ON global_chat FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User hanya bisa EDIT pesan miliknya sendiri
CREATE POLICY "Users can update own messages"
  ON global_chat FOR UPDATE USING (auth.uid() = user_id);

-- User hanya bisa HAPUS pesan miliknya sendiri
CREATE POLICY "Users can delete own messages"
  ON global_chat FOR DELETE USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- CATATAN PENTING:
-- Setelah menjalankan SQL ini, aktifkan Realtime untuk tabel global_chat:
-- Supabase Dashboard > Database > Replication > Tambahkan tabel global_chat
-- ─────────────────────────────────────────────
