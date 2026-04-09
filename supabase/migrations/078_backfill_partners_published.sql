-- Backfill: ensure all managed_partners have is_published = true
-- (Partners created via admin were missing this column)
UPDATE managed_partners SET is_published = true WHERE is_published IS NULL OR is_published = false;
