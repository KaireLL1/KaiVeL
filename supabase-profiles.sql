-- ============================================
-- Jalankan di Supabase > SQL Editor
-- Tabel profiles untuk custom username & bio
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username  TEXT,
  bio       TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Siapa saja bisa lihat profil
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

-- User hanya bisa insert profil sendiri
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User hanya bisa update profil sendiri
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = user_id);
