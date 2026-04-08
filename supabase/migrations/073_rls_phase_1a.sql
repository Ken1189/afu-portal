-- ============================================================================
-- RLS RE-ENABLE — PHASE 1A: financial / audit / wallet / KYC tables
-- ============================================================================
-- These tables are accessed almost exclusively through service-role API routes.
-- Re-enabling RLS here is the lowest-risk first step because:
--   1. Service role bypasses RLS entirely → server-side code is unaffected
--   2. No client-side SSR reads of these tables exist in current codebase
--   3. Closes the gaping hole left by migration 048 disabling RLS globally
--
-- Policy pattern (cached auth.uid()):
--   - Owner can SELECT/INSERT/UPDATE/DELETE own rows
--   - Admin / super_admin can do everything
--   - Wrap auth.uid() in (SELECT auth.uid()) so Postgres caches per-statement
--     instead of re-evaluating per row (Supabase performance best practice)
--
-- If anything breaks, roll back with:
--   ALTER TABLE <name> DISABLE ROW LEVEL SECURITY;
-- ============================================================================

-- Helper: is_admin() check used by every policy. Created idempotently.
CREATE OR REPLACE FUNCTION public.is_admin_or_super()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = (SELECT auth.uid())
      AND role IN ('admin', 'super_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_or_super() TO authenticated, anon;

-- ============================================================================
-- KYC tables — only owner + admin can access
-- ============================================================================

ALTER TABLE IF EXISTS kyc_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kyc_documents_owner_select ON kyc_documents;
DROP POLICY IF EXISTS kyc_documents_owner_modify ON kyc_documents;
DROP POLICY IF EXISTS kyc_documents_admin_all ON kyc_documents;

CREATE POLICY kyc_documents_owner_select ON kyc_documents
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY kyc_documents_owner_modify ON kyc_documents
  FOR ALL
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY kyc_documents_admin_all ON kyc_documents
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

ALTER TABLE IF EXISTS kyc_verifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kyc_verifications_owner_select ON kyc_verifications;
DROP POLICY IF EXISTS kyc_verifications_admin_all ON kyc_verifications;

CREATE POLICY kyc_verifications_owner_select ON kyc_verifications
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY kyc_verifications_admin_all ON kyc_verifications
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- ============================================================================
-- Payments / payouts — owner reads own, admin reads all
-- ============================================================================

ALTER TABLE IF EXISTS payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payments_owner_select ON payments;
DROP POLICY IF EXISTS payments_admin_all ON payments;

CREATE POLICY payments_owner_select ON payments
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY payments_admin_all ON payments
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

ALTER TABLE IF EXISTS payment_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payment_attempts_admin_all ON payment_attempts;

CREATE POLICY payment_attempts_admin_all ON payment_attempts
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

ALTER TABLE IF EXISTS payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payouts_owner_select ON payouts;
DROP POLICY IF EXISTS payouts_admin_all ON payouts;

CREATE POLICY payouts_owner_select ON payouts
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY payouts_admin_all ON payouts
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- ============================================================================
-- Wallets — owner reads own balance/transactions, admin sees all
-- ============================================================================

ALTER TABLE IF EXISTS wallets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wallets_owner_select ON wallets;
DROP POLICY IF EXISTS wallets_admin_all ON wallets;

CREATE POLICY wallets_owner_select ON wallets
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY wallets_admin_all ON wallets
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

ALTER TABLE IF EXISTS wallet_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wallet_accounts_owner_select ON wallet_accounts;
DROP POLICY IF EXISTS wallet_accounts_admin_all ON wallet_accounts;

CREATE POLICY wallet_accounts_owner_select ON wallet_accounts
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY wallet_accounts_admin_all ON wallet_accounts
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

ALTER TABLE IF EXISTS wallet_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS wallet_transactions_owner_select ON wallet_transactions;
DROP POLICY IF EXISTS wallet_transactions_admin_all ON wallet_transactions;

CREATE POLICY wallet_transactions_owner_select ON wallet_transactions
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY wallet_transactions_admin_all ON wallet_transactions
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- ============================================================================
-- Credit scores — sensitive PII, owner read + admin all
-- ============================================================================

ALTER TABLE IF EXISTS credit_scores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS credit_scores_owner_select ON credit_scores;
DROP POLICY IF EXISTS credit_scores_admin_all ON credit_scores;

CREATE POLICY credit_scores_owner_select ON credit_scores
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY credit_scores_admin_all ON credit_scores
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

ALTER TABLE IF EXISTS credit_score_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS credit_score_history_owner_select ON credit_score_history;
DROP POLICY IF EXISTS credit_score_history_admin_all ON credit_score_history;

CREATE POLICY credit_score_history_owner_select ON credit_score_history
  FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY credit_score_history_admin_all ON credit_score_history
  FOR ALL
  USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- ============================================================================
-- Audit logs — admin read only, system writes via service role
-- ============================================================================

ALTER TABLE IF EXISTS audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_log_admin_select ON audit_log;

CREATE POLICY audit_log_admin_select ON audit_log
  FOR SELECT
  USING (public.is_admin_or_super());

ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_admin_select ON audit_logs;

CREATE POLICY audit_logs_admin_select ON audit_logs
  FOR SELECT
  USING (public.is_admin_or_super());

-- ============================================================================
-- Admin permissions — admin read only, never client-writable
-- ============================================================================

ALTER TABLE IF EXISTS admin_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS admin_permissions_super_admin_only ON admin_permissions;

CREATE POLICY admin_permissions_super_admin_only ON admin_permissions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = (SELECT auth.uid())
        AND role = 'super_admin'
    )
  );

-- ============================================================================
-- Schema reload
-- ============================================================================

NOTIFY pgrst, 'reload schema';
