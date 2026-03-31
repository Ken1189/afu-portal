-- ============================================================
-- 033: Fix ambassador table for applications
-- The table was designed for display profiles only, not applications.
-- Adding missing columns and relaxing constraints so ambassadors
-- can apply without being farmers.
-- ============================================================

-- Add user_id column (links to auth user, separate from farmer_id)
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add application fields
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS motivation TEXT;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS promotion_plan TEXT;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'bronze';
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS total_earned DECIMAL(12,2) DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

-- Make bio optional (was NOT NULL — breaks applications)
ALTER TABLE ambassadors ALTER COLUMN bio DROP NOT NULL;

-- Make sector optional (was NOT NULL — breaks applications)
ALTER TABLE ambassadors ALTER COLUMN sector DROP NOT NULL;

-- Make full_name have a default so it's not required at insert
ALTER TABLE ambassadors ALTER COLUMN full_name DROP NOT NULL;

-- Relax status constraint — allow 'pending', 'approved', 'rejected' in addition to active/inactive
ALTER TABLE ambassadors DROP CONSTRAINT IF EXISTS ambassadors_status_check;
ALTER TABLE ambassadors ADD CONSTRAINT ambassadors_status_check
  CHECK (status IN ('active', 'inactive', 'pending', 'approved', 'rejected'));

-- Allow authenticated users to insert ambassador applications
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ambassadors' AND policyname='users_apply_ambassador') THEN
    EXECUTE 'CREATE POLICY users_apply_ambassador ON ambassadors FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- Allow users to read their own ambassador record
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ambassadors' AND policyname='users_read_own_ambassador') THEN
    EXECUTE 'CREATE POLICY users_read_own_ambassador ON ambassadors FOR SELECT USING (
      user_id = auth.uid() OR farmer_id = auth.uid() OR status = ''active'' OR is_admin()
    )';
  END IF;
END $$;

-- Allow users to update their own ambassador record
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ambassadors' AND policyname='users_update_own_ambassador') THEN
    EXECUTE 'CREATE POLICY users_update_own_ambassador ON ambassadors FOR UPDATE USING (
      user_id = auth.uid() OR farmer_id = auth.uid() OR is_admin()
    )';
  END IF;
END $$;

-- Admin can manage all ambassadors
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ambassadors' AND policyname='admin_manage_ambassadors') THEN
    EXECUTE 'CREATE POLICY admin_manage_ambassadors ON ambassadors FOR ALL USING (is_admin())';
  END IF;
END $$;

-- Also allow anonymous inserts for the public apply form (not logged in)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ambassadors' AND policyname='anon_apply_ambassador') THEN
    EXECUTE 'CREATE POLICY anon_apply_ambassador ON ambassadors FOR INSERT WITH CHECK (true)';
  END IF;
END $$;
