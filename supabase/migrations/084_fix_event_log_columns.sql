-- Fix event_log: add missing columns expected by admin events page
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS actor_id TEXT;
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS target_id TEXT;
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}';
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS handlers_run TEXT[] DEFAULT '{}';
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'processed';
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS error TEXT;
ALTER TABLE event_log ADD COLUMN IF NOT EXISTS processing_time_ms INTEGER;

-- Backfill: copy details → payload for existing rows (only if details column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'event_log' AND column_name = 'details'
  ) THEN
    EXECUTE 'UPDATE event_log SET payload = details WHERE payload IS NULL AND details IS NOT NULL';
  END IF;
END $$;
