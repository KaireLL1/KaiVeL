-- ============================================
-- Update tabel reading_history
-- Tambah kolom manga_title dan manga_cover
-- Jalankan di Supabase > SQL Editor
-- ============================================

ALTER TABLE reading_history
  ADD COLUMN IF NOT EXISTS manga_title TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS manga_cover TEXT DEFAULT '';
