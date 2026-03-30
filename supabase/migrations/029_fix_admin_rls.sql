-- ============================================================
-- 029: Fix ALL admin RLS policies
-- Admin portal was broken — missing policies caused 403 errors
-- ============================================================

-- Helper function for admin checks
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── wallet_accounts ──
CREATE POLICY "admin_all_wallet_accounts" ON wallet_accounts FOR ALL USING (is_admin());

-- ── wallet_transactions ──
CREATE POLICY "admin_all_wallet_transactions" ON wallet_transactions FOR ALL USING (is_admin());

-- ── ledger_accounts ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ledger_accounts' AND policyname='admin_all_ledger_accounts') THEN
    EXECUTE 'CREATE POLICY admin_all_ledger_accounts ON ledger_accounts FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── ledger_entries ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ledger_entries' AND policyname='admin_all_ledger_entries') THEN
    EXECUTE 'CREATE POLICY admin_all_ledger_entries ON ledger_entries FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── payments ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='payments' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_payments ON payments FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── kyc_documents ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='kyc_documents' AND policyname='admin_all_kyc_documents') THEN
    EXECUTE 'CREATE POLICY admin_all_kyc_documents ON kyc_documents FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── membership_applications ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='membership_applications' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_membership_applications ON membership_applications FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── reconciliation_runs (replace unsafe policy) ──
DROP POLICY IF EXISTS recon_runs_admin_read ON reconciliation_runs;
CREATE POLICY "admin_all_reconciliation_runs" ON reconciliation_runs FOR ALL USING (is_admin());

-- ── reconciliation_items ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='reconciliation_items' AND policyname='admin_all_reconciliation_items') THEN
    EXECUTE 'CREATE POLICY admin_all_reconciliation_items ON reconciliation_items FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── transaction_flags (replace unsafe policy) ──
DROP POLICY IF EXISTS txn_flags_admin_read ON transaction_flags;
DROP POLICY IF EXISTS txn_flags_admin_write ON transaction_flags;
CREATE POLICY "admin_all_transaction_flags" ON transaction_flags FOR ALL USING (is_admin());

-- ── velocity_rules ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='velocity_rules' AND policyname='admin_all_velocity_rules') THEN
    EXECUTE 'CREATE POLICY admin_all_velocity_rules ON velocity_rules FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── credit_scores ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='credit_scores' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_credit_scores ON credit_scores FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── credit_score_history ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='credit_score_history' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_credit_score_history ON credit_score_history FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── loan_schedules ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='loan_schedules' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_loan_schedules ON loan_schedules FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── loan_disbursements ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='loan_disbursements' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_loan_disbursements ON loan_disbursements FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── exchange_listings ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exchange_listings' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_exchange_listings ON exchange_listings FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── exchange_transactions ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exchange_transactions' AND policyname LIKE '%admin%') THEN
    EXECUTE 'CREATE POLICY admin_all_exchange_transactions ON exchange_transactions FOR ALL USING (is_admin())';
  END IF;
END $$;

-- ── admin_permissions table ──
CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, permission)
);
ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='admin_permissions' AND policyname='admin_all_admin_permissions') THEN
    EXECUTE 'CREATE POLICY admin_all_admin_permissions ON admin_permissions FOR ALL USING (is_admin())';
  END IF;
END $$;

-- Grant super_admins all permissions
INSERT INTO admin_permissions (user_id, permission)
SELECT p.id, perm.permission
FROM profiles p
CROSS JOIN (VALUES
  ('manage_members'), ('manage_applications'), ('manage_suppliers'),
  ('manage_farmers'), ('manage_ambassadors'), ('manage_investors'),
  ('manage_content'), ('manage_settings'), ('manage_financial'),
  ('manage_loans'), ('manage_insurance'), ('manage_trading'),
  ('manage_carbon'), ('manage_warehouse'), ('manage_messaging'),
  ('view_analytics'), ('view_audit_log'), ('run_migrations')
) AS perm(permission)
WHERE p.role = 'super_admin'
ON CONFLICT (user_id, permission) DO NOTHING;
