-- Capabilities — additive flags any user can stack
-- A user has ONE primary role + MANY capabilities (ambassador, supplier, investor, sponsor, advisor, etc)
-- This unblocks: farmer-who-is-also-ambassador, supplier-who-is-also-sponsor, etc.

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS capabilities text[] DEFAULT '{}'::text[];

-- ============================================================================
-- Backfill from existing role tables
-- (using the actual column names: ambassadors.user_id, suppliers.profile_id)
-- ============================================================================

-- Ambassadors: column is user_id (auth.users.id), profiles.id is the same uuid
UPDATE profiles p
SET capabilities = array_append(COALESCE(capabilities, '{}'::text[]), 'ambassador')
WHERE EXISTS (SELECT 1 FROM ambassadors a WHERE a.user_id = p.id)
  AND NOT ('ambassador' = ANY(COALESCE(capabilities, '{}'::text[])));

-- Suppliers: column is profile_id
UPDATE profiles p
SET capabilities = array_append(COALESCE(capabilities, '{}'::text[]), 'supplier')
WHERE EXISTS (SELECT 1 FROM suppliers s WHERE s.profile_id = p.id)
  AND NOT ('supplier' = ANY(COALESCE(capabilities, '{}'::text[])));

-- Investors: check both possible column names (table may not exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investor_interest') THEN
    -- check column
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investor_interest' AND column_name = 'user_id') THEN
      EXECUTE $sql$
        UPDATE profiles p
        SET capabilities = array_append(COALESCE(capabilities, '{}'::text[]), 'investor')
        WHERE EXISTS (SELECT 1 FROM investor_interest i WHERE i.user_id = p.id)
          AND NOT ('investor' = ANY(COALESCE(capabilities, '{}'::text[])));
      $sql$;
    END IF;
  END IF;
END$$;

-- ============================================================================
-- Index for fast capability lookups
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_capabilities ON profiles USING GIN (capabilities);

-- ============================================================================
-- Helper RPC: check if user has capability
-- ============================================================================
CREATE OR REPLACE FUNCTION user_has_capability(p_user_id UUID, p_capability TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT p_capability = ANY(COALESCE(capabilities, '{}'::text[]))
  FROM profiles WHERE id = p_user_id;
$$;

-- ============================================================================
-- Helper RPC: add capability (idempotent)
-- ============================================================================
CREATE OR REPLACE FUNCTION add_user_capability(p_user_id UUID, p_capability TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET capabilities = array_append(COALESCE(capabilities, '{}'::text[]), p_capability)
  WHERE id = p_user_id
    AND NOT (p_capability = ANY(COALESCE(capabilities, '{}'::text[])));
END;
$$;

-- ============================================================================
-- Helper RPC: remove capability
-- ============================================================================
CREATE OR REPLACE FUNCTION remove_user_capability(p_user_id UUID, p_capability TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET capabilities = array_remove(COALESCE(capabilities, '{}'::text[]), p_capability)
  WHERE id = p_user_id;
END;
$$;

NOTIFY pgrst, 'reload schema';
