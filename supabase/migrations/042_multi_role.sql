-- Multi-role support: users can be farmer + supplier + investor etc
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roles TEXT[] DEFAULT ARRAY['member']::TEXT[];

-- Backfill: copy current role into roles array
UPDATE profiles SET roles = ARRAY[role] WHERE roles IS NULL OR array_length(roles, 1) IS NULL;
