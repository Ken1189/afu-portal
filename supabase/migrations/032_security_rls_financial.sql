-- ============================================================
-- 032: Security — Add RLS policies to ALL financial tables
-- Critical: These tables were RLS-enabled but had NO policies
-- ============================================================

-- ── payments ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='users_read_own_payments') THEN
    EXECUTE 'CREATE POLICY users_read_own_payments ON payments FOR SELECT USING (
      member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
      OR is_admin()
    )';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname='users_create_payments') THEN
    EXECUTE 'CREATE POLICY users_create_payments ON payments FOR INSERT WITH CHECK (
      member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
    )';
  END IF;
END $$;

-- ── commissions ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='commissions' AND policyname='users_read_own_commissions') THEN
    EXECUTE 'CREATE POLICY users_read_own_commissions ON commissions FOR SELECT USING (
      member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
      OR is_admin()
    )';
  END IF;
END $$;

-- ── order_items ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='users_read_own_order_items') THEN
    EXECUTE 'CREATE POLICY users_read_own_order_items ON order_items FOR SELECT USING (
      order_id IN (
        SELECT id FROM orders WHERE member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
        OR supplier_id IN (SELECT id FROM suppliers WHERE profile_id = auth.uid())
      )
      OR is_admin()
    )';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='order_items' AND policyname='users_create_order_items') THEN
    EXECUTE 'CREATE POLICY users_create_order_items ON order_items FOR INSERT WITH CHECK (
      order_id IN (SELECT id FROM orders WHERE member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()))
    )';
  END IF;
END $$;

-- ── Enable RLS on tables missing it ──

-- sponsorships
ALTER TABLE IF EXISTS sponsorships ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sponsorships' AND policyname='users_read_own_sponsorships') THEN
    EXECUTE 'CREATE POLICY users_read_own_sponsorships ON sponsorships FOR SELECT USING (
      sponsor_id = auth.uid() OR farmer_id IN (SELECT id FROM profiles WHERE id = auth.uid()) OR is_admin()
    )';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='sponsorships' AND policyname='users_create_sponsorships') THEN
    EXECUTE 'CREATE POLICY users_create_sponsorships ON sponsorships FOR INSERT WITH CHECK (auth.role() = ''authenticated'')';
  END IF;
END $$;

-- farmer_updates
ALTER TABLE IF EXISTS farmer_updates ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='farmer_updates' AND policyname='public_read_farmer_updates') THEN
    EXECUTE 'CREATE POLICY public_read_farmer_updates ON farmer_updates FOR SELECT USING (true)';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='farmer_updates' AND policyname='admins_manage_farmer_updates') THEN
    EXECUTE 'CREATE POLICY admins_manage_farmer_updates ON farmer_updates FOR ALL USING (is_admin())';
  END IF;
END $$;

-- programs
ALTER TABLE IF EXISTS programs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='programs' AND policyname='public_read_programs') THEN
    EXECUTE 'CREATE POLICY public_read_programs ON programs FOR SELECT USING (true)';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='programs' AND policyname='admins_manage_programs') THEN
    EXECUTE 'CREATE POLICY admins_manage_programs ON programs FOR ALL USING (is_admin())';
  END IF;
END $$;

-- program_inclusions
ALTER TABLE IF EXISTS program_inclusions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='program_inclusions' AND policyname='public_read_program_inclusions') THEN
    EXECUTE 'CREATE POLICY public_read_program_inclusions ON program_inclusions FOR SELECT USING (true)';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='program_inclusions' AND policyname='admins_manage_program_inclusions') THEN
    EXECUTE 'CREATE POLICY admins_manage_program_inclusions ON program_inclusions FOR ALL USING (is_admin())';
  END IF;
END $$;

-- program_enrollments
ALTER TABLE IF EXISTS program_enrollments ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='program_enrollments' AND policyname='users_read_own_enrollments') THEN
    EXECUTE 'CREATE POLICY users_read_own_enrollments ON program_enrollments FOR SELECT USING (
      member_id IN (SELECT id FROM members WHERE profile_id = auth.uid()) OR is_admin()
    )';
  END IF;
END $$;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='program_enrollments' AND policyname='users_create_enrollments') THEN
    EXECUTE 'CREATE POLICY users_create_enrollments ON program_enrollments FOR INSERT WITH CHECK (
      member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
    )';
  END IF;
END $$;
