-- ============================================
-- Jalankan HANYA ini di Supabase SQL Editor
-- (untuk yang sudah punya tabel bookmarks & reading_history)
-- ============================================

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
