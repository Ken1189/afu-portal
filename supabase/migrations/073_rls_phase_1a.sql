-- ============================================================================
-- RLS RE-ENABLE — PHASE 1A: financial / audit / wallet / KYC tables
-- ============================================================================
-- Schema-defensive: this migration uses information_schema lookups so it works
-- regardless of whether a given table was created by migration 003 (member_id),
-- 020 (user_id), 046 (supplier_id), or the 048 squash. Some columns may exist,
-- some may not — we add the policy only if the owner column actually exists.
--
-- Service role bypasses RLS entirely, so server-side API routes are unaffected.
-- ============================================================================

-- Helper: cached admin check used by every policy.
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
-- Generic helper: enable RLS, add admin-all + owner policies for a table,
-- choosing the owner column based on what actually exists.
-- ============================================================================
DO $outer$
DECLARE
  rec RECORD;
  owner_col TEXT;
  has_member_id BOOLEAN;
  has_user_id BOOLEAN;
  has_supplier_id BOOLEAN;
  policy_sql TEXT;
  -- (table_name, owner_join_kind)
  -- owner_join_kind: 'direct_user'  → owner_col = auth.uid()
  --                  'member'        → member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
  --                  'supplier'      → supplier_id IN (SELECT id FROM suppliers WHERE profile_id = auth.uid())
  --                  'admin_only'    → admins only, no owner read
  tables TEXT[][] := ARRAY[
    ['kyc_documents',       'auto'],
    ['kyc_verifications',   'auto'],
    ['payments',            'auto'],
    ['payment_attempts',    'admin_only'],
    ['payouts',             'auto'],
    ['wallets',             'auto'],
    ['wallet_accounts',     'auto'],
    ['wallet_transactions', 'admin_only'],
    ['credit_scores',       'auto'],
    ['credit_score_history','auto'],
    ['audit_log',           'admin_only'],
    ['audit_logs',           'admin_only'],
    ['admin_permissions',   'admin_only']
  ];
  i INT;
  t_name TEXT;
  t_kind TEXT;
BEGIN
  FOR i IN 1..array_length(tables, 1) LOOP
    t_name := tables[i][1];
    t_kind := tables[i][2];

    -- Skip if table doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t_name
    ) THEN
      RAISE NOTICE 'Skipping %: table does not exist', t_name;
      CONTINUE;
    END IF;

    -- Enable RLS
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t_name);

    -- Always drop existing policies with our naming convention to allow reruns
    EXECUTE format('DROP POLICY IF EXISTS %I_admin_all ON public.%I', t_name, t_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_owner_select ON public.%I', t_name, t_name);
    EXECUTE format('DROP POLICY IF EXISTS %I_owner_modify ON public.%I', t_name, t_name);

    -- Admin-all policy is added to every table
    EXECUTE format(
      'CREATE POLICY %I_admin_all ON public.%I FOR ALL USING (public.is_admin_or_super()) WITH CHECK (public.is_admin_or_super())',
      t_name, t_name
    );

    IF t_kind = 'admin_only' THEN
      RAISE NOTICE 'RLS enabled on % (admin-only)', t_name;
      CONTINUE;
    END IF;

    -- Auto-detect owner column
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t_name AND column_name='user_id') INTO has_user_id;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t_name AND column_name='member_id') INTO has_member_id;
    SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name=t_name AND column_name='supplier_id') INTO has_supplier_id;

    IF has_user_id THEN
      -- Direct user_id check
      EXECUTE format(
        'CREATE POLICY %I_owner_select ON public.%I FOR SELECT USING (user_id = (SELECT auth.uid()))',
        t_name, t_name
      );
      RAISE NOTICE 'RLS enabled on % (owner via user_id)', t_name;

    ELSIF has_member_id THEN
      -- Join through members.profile_id
      EXECUTE format(
        'CREATE POLICY %I_owner_select ON public.%I FOR SELECT USING (member_id IN (SELECT id FROM members WHERE profile_id = (SELECT auth.uid())))',
        t_name, t_name
      );
      RAISE NOTICE 'RLS enabled on % (owner via member_id)', t_name;

    ELSIF has_supplier_id THEN
      -- Join through suppliers.profile_id
      EXECUTE format(
        'CREATE POLICY %I_owner_select ON public.%I FOR SELECT USING (supplier_id IN (SELECT id FROM suppliers WHERE profile_id = (SELECT auth.uid())))',
        t_name, t_name
      );
      RAISE NOTICE 'RLS enabled on % (owner via supplier_id)', t_name;

    ELSE
      RAISE NOTICE 'RLS enabled on % (admin-only fallback — no owner column found)', t_name;
    END IF;
  END LOOP;
END
$outer$;

NOTIFY pgrst, 'reload schema';
