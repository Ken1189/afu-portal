-- 071_profile_onboarded_at.sql
-- Tracks when a farmer completed the onboarding wizard so the layout
-- can gate the dashboard until setup is done.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

NOTIFY pgrst, 'reload schema';
