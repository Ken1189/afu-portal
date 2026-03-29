-- S1.17: Create a SECURITY DEFINER function for admin role checks
-- This avoids the fragile subquery pattern and is more performant
-- (Postgres can cache the function result per-transaction).

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- NOTE: Existing policies can be gradually migrated to use is_admin()
-- instead of the inline EXISTS subquery. Example:
--
-- DROP POLICY "Admins can view all profiles" ON profiles;
-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT USING (is_admin());
--
-- This migration creates the function only. Policy migration should be
-- done incrementally to avoid downtime.
