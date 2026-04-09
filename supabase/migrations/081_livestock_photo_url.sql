-- Add missing photo_url column to livestock table (expected by use-livestock hook & livestock pages)
ALTER TABLE livestock ADD COLUMN IF NOT EXISTS photo_url TEXT;
