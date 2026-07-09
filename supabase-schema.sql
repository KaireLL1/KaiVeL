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
