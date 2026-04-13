-- ============================================================================
-- 088: RLS Phase 2 — Comprehensive gap-fill
-- ============================================================================
-- Fills RLS policy gaps on tables that have RLS enabled but insufficient
-- policies. Uses the is_admin_or_super() function from migration 073.
--
-- Tables covered:
--   1.  education_projects        (already has policies from 087 — upgrade admin to is_admin_or_super)
--   2.  supplier_subscriptions    (owner SELECT via supplier_id, admin ALL)
--   3.  supplier_subscription_plans (public SELECT for active, admin ALL)
--   4.  supplier_invoices         (owner SELECT via supplier_id, admin ALL)
--   5.  advertisements            (already has policies from 002 — upgrade admin to is_admin_or_super)
--   6.  ad_impressions            (replace fragile auth.users meta check with is_admin_or_super)
--   7.  ad_payments               (owner via supplier_id, admin ALL — replace fragile check)
--   8.  reviews                   (public SELECT, authenticated INSERT, admin ALL — already from 034)
--   9.  trade_orders              (owner via member_id, admin ALL)
--  10.  trade_quotes              (owner via buyer_id, admin ALL)
--  11.  parametric_products       (public SELECT, admin ALL — already from 034)
--  12.  parametric_policies       (owner via member_id, admin ALL)
--  13.  parametric_triggers       (owner via policy_id→member_id, admin ALL)
--  14.  contact_submissions       (anon INSERT, admin SELECT — upgrade admin check)
--  15.  newsletter_sponsorships   (admin ALL — replace fragile check)
--  16.  farmer_public_profiles    (public SELECT where is_active, admin ALL)
--  17.  farmer_updates            (public SELECT, admin ALL — already from 032)
-- ============================================================================

-- ============================================================================
-- 1. education_projects
--    Migration 087 created policies with inline EXISTS. Replace admin policy
--    with is_admin_or_super() for consistency.
-- ============================================================================
DROP POLICY IF EXISTS "Admins can manage education projects" ON public.education_projects;
DROP POLICY IF EXISTS "education_projects_admin_all" ON public.education_projects;
DROP POLICY IF EXISTS "Anyone can read visible education projects" ON public.education_projects;
DROP POLICY IF EXISTS "education_projects_public_select" ON public.education_projects;

ALTER TABLE public.education_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "education_projects_admin_all" ON public.education_projects
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "education_projects_public_select" ON public.education_projects
  FOR SELECT USING (visible = true);


-- ============================================================================
-- 2. supplier_subscription_plans
--    Migration 060 created plans_select for is_active only. Add admin ALL.
-- ============================================================================
DROP POLICY IF EXISTS "plans_select" ON public.supplier_subscription_plans;
DROP POLICY IF EXISTS "supplier_subscription_plans_admin_all" ON public.supplier_subscription_plans;
DROP POLICY IF EXISTS "supplier_subscription_plans_public_select" ON public.supplier_subscription_plans;

ALTER TABLE public.supplier_subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supplier_subscription_plans_admin_all" ON public.supplier_subscription_plans
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "supplier_subscription_plans_public_select" ON public.supplier_subscription_plans
  FOR SELECT USING (is_active = true);


-- ============================================================================
-- 3. supplier_subscriptions
--    Migration 060 created subs_select_own. Add admin ALL.
-- ============================================================================
DROP POLICY IF EXISTS "subs_select_own" ON public.supplier_subscriptions;
DROP POLICY IF EXISTS "supplier_subscriptions_admin_all" ON public.supplier_subscriptions;
DROP POLICY IF EXISTS "supplier_subscriptions_owner_select" ON public.supplier_subscriptions;

ALTER TABLE public.supplier_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supplier_subscriptions_admin_all" ON public.supplier_subscriptions
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "supplier_subscriptions_owner_select" ON public.supplier_subscriptions
  FOR SELECT USING (
    supplier_id IN (SELECT id FROM public.suppliers WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 4. supplier_invoices
--    Migration 060 created invoices_select_own. Add admin ALL.
-- ============================================================================
DROP POLICY IF EXISTS "invoices_select_own" ON public.supplier_invoices;
DROP POLICY IF EXISTS "supplier_invoices_admin_all" ON public.supplier_invoices;
DROP POLICY IF EXISTS "supplier_invoices_owner_select" ON public.supplier_invoices;

ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "supplier_invoices_admin_all" ON public.supplier_invoices
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "supplier_invoices_owner_select" ON public.supplier_invoices
  FOR SELECT USING (
    supplier_id IN (SELECT id FROM public.suppliers WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 5. advertisements
--    Migration 002 created policies with inline EXISTS. Replace admin with
--    is_admin_or_super() and owner with consistent supplier join pattern.
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view active ads" ON public.advertisements;
DROP POLICY IF EXISTS "Supplier owners manage own ads" ON public.advertisements;
DROP POLICY IF EXISTS "Admins manage all ads" ON public.advertisements;
DROP POLICY IF EXISTS "advertisements_admin_all" ON public.advertisements;
DROP POLICY IF EXISTS "advertisements_public_select" ON public.advertisements;
DROP POLICY IF EXISTS "advertisements_owner_all" ON public.advertisements;

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "advertisements_admin_all" ON public.advertisements
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "advertisements_public_select" ON public.advertisements
  FOR SELECT USING (status = 'active');

CREATE POLICY "advertisements_owner_all" ON public.advertisements
  FOR ALL USING (
    supplier_id IN (SELECT id FROM public.suppliers WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    supplier_id IN (SELECT id FROM public.suppliers WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 6. ad_impressions
--    Migration 022 created policies using fragile auth.users meta check.
--    Replace with is_admin_or_super(). Keep anonymous INSERT for tracking.
-- ============================================================================
DROP POLICY IF EXISTS "ad_impressions_insert" ON public.ad_impressions;
DROP POLICY IF EXISTS "ad_impressions_admin_read" ON public.ad_impressions;
DROP POLICY IF EXISTS "ad_impressions_admin_all" ON public.ad_impressions;
DROP POLICY IF EXISTS "ad_impressions_anon_insert" ON public.ad_impressions;

ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_impressions_admin_all" ON public.ad_impressions
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- Anyone can record impressions (tracking pixel / client-side beacon)
CREATE POLICY "ad_impressions_anon_insert" ON public.ad_impressions
  FOR INSERT WITH CHECK (true);


-- ============================================================================
-- 7. ad_payments
--    Migration 022 used fragile auth.users meta check. Replace with
--    is_admin_or_super() and proper supplier join.
-- ============================================================================
DROP POLICY IF EXISTS "ad_payments_own_read" ON public.ad_payments;
DROP POLICY IF EXISTS "ad_payments_admin_all" ON public.ad_payments;
DROP POLICY IF EXISTS "ad_payments_owner_select" ON public.ad_payments;

ALTER TABLE public.ad_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ad_payments_admin_all" ON public.ad_payments
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "ad_payments_owner_select" ON public.ad_payments
  FOR SELECT USING (
    supplier_id IN (SELECT id FROM public.suppliers WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 8. reviews
--    Migration 034 created review_read, review_insert, review_admin using
--    is_admin() (the old function). Replace admin with is_admin_or_super().
-- ============================================================================
DROP POLICY IF EXISTS "review_read" ON public.reviews;
DROP POLICY IF EXISTS "review_insert" ON public.reviews;
DROP POLICY IF EXISTS "review_admin" ON public.reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON public.reviews;
DROP POLICY IF EXISTS "reviews_public_select" ON public.reviews;
DROP POLICY IF EXISTS "reviews_auth_insert" ON public.reviews;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_admin_all" ON public.reviews
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "reviews_public_select" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "reviews_auth_insert" ON public.reviews
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================================================
-- 9. trade_orders
--    Migration 034 created trade_read (public), trade_insert (authenticated),
--    trade_admin (is_admin). Replace with tighter owner-based policies.
-- ============================================================================
DROP POLICY IF EXISTS "trade_read" ON public.trade_orders;
DROP POLICY IF EXISTS "trade_insert" ON public.trade_orders;
DROP POLICY IF EXISTS "trade_admin" ON public.trade_orders;
DROP POLICY IF EXISTS "trade_orders_admin_all" ON public.trade_orders;
DROP POLICY IF EXISTS "trade_orders_owner_select" ON public.trade_orders;
DROP POLICY IF EXISTS "trade_orders_owner_insert" ON public.trade_orders;

ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trade_orders_admin_all" ON public.trade_orders
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "trade_orders_owner_select" ON public.trade_orders
  FOR SELECT USING (
    member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
  );

CREATE POLICY "trade_orders_owner_insert" ON public.trade_orders
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 10. trade_quotes
--     Migration 034 created quotes_read (public), quotes_admin (is_admin).
--     Add owner-based SELECT for buyer and order-owner.
-- ============================================================================
DROP POLICY IF EXISTS "quotes_read" ON public.trade_quotes;
DROP POLICY IF EXISTS "quotes_admin" ON public.trade_quotes;
DROP POLICY IF EXISTS "trade_quotes_admin_all" ON public.trade_quotes;
DROP POLICY IF EXISTS "trade_quotes_owner_select" ON public.trade_quotes;
DROP POLICY IF EXISTS "trade_quotes_auth_insert" ON public.trade_quotes;

ALTER TABLE public.trade_quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trade_quotes_admin_all" ON public.trade_quotes
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- Buyers can see their own quotes; order owners can see quotes on their orders
CREATE POLICY "trade_quotes_owner_select" ON public.trade_quotes
  FOR SELECT USING (
    buyer_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
    OR order_id IN (
      SELECT id FROM public.trade_orders
      WHERE member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
    )
  );

CREATE POLICY "trade_quotes_auth_insert" ON public.trade_quotes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');


-- ============================================================================
-- 11. parametric_products
--     Migration 034 created param_prod_read (public), param_prod_admin
--     (is_admin). Upgrade admin check.
-- ============================================================================
DROP POLICY IF EXISTS "param_prod_read" ON public.parametric_products;
DROP POLICY IF EXISTS "param_prod_admin" ON public.parametric_products;
DROP POLICY IF EXISTS "parametric_products_admin_all" ON public.parametric_products;
DROP POLICY IF EXISTS "parametric_products_public_select" ON public.parametric_products;

ALTER TABLE public.parametric_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parametric_products_admin_all" ON public.parametric_products
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "parametric_products_public_select" ON public.parametric_products
  FOR SELECT USING (true);


-- ============================================================================
-- 12. parametric_policies
--     Migration 034 created param_pol_read (public), param_pol_admin
--     (is_admin). Replace with owner-based SELECT + admin ALL.
-- ============================================================================
DROP POLICY IF EXISTS "param_pol_read" ON public.parametric_policies;
DROP POLICY IF EXISTS "param_pol_admin" ON public.parametric_policies;
DROP POLICY IF EXISTS "parametric_policies_admin_all" ON public.parametric_policies;
DROP POLICY IF EXISTS "parametric_policies_owner_select" ON public.parametric_policies;
DROP POLICY IF EXISTS "parametric_policies_owner_insert" ON public.parametric_policies;

ALTER TABLE public.parametric_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parametric_policies_admin_all" ON public.parametric_policies
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "parametric_policies_owner_select" ON public.parametric_policies
  FOR SELECT USING (
    member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
  );

CREATE POLICY "parametric_policies_owner_insert" ON public.parametric_policies
  FOR INSERT WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 13. parametric_triggers
--     Migration 034 created param_trig_admin (is_admin) only. Add owner
--     SELECT via policy_id join to parametric_policies.member_id.
-- ============================================================================
DROP POLICY IF EXISTS "param_trig_admin" ON public.parametric_triggers;
DROP POLICY IF EXISTS "parametric_triggers_admin_all" ON public.parametric_triggers;
DROP POLICY IF EXISTS "parametric_triggers_owner_select" ON public.parametric_triggers;

ALTER TABLE public.parametric_triggers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "parametric_triggers_admin_all" ON public.parametric_triggers
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "parametric_triggers_owner_select" ON public.parametric_triggers
  FOR SELECT USING (
    policy_id IN (
      SELECT id FROM public.parametric_policies
      WHERE member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
    )
  );


-- ============================================================================
-- 14. contact_submissions
--     Migration 030 created policies with inline EXISTS. Replace admin check
--     with is_admin_or_super(). Keep anon INSERT.
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can read contacts" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_admin_select" ON public.contact_submissions;
DROP POLICY IF EXISTS "contact_submissions_anon_insert" ON public.contact_submissions;

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "contact_submissions_admin_select" ON public.contact_submissions
  FOR SELECT USING (public.is_admin_or_super());

-- Anyone (including anonymous) can submit a contact form
CREATE POLICY "contact_submissions_anon_insert" ON public.contact_submissions
  FOR INSERT WITH CHECK (true);


-- ============================================================================
-- 15. newsletter_sponsorships
--     Migration 022 created newsletter_sponsor_admin with fragile auth.users
--     meta check (SELECT only). Replace with full admin ALL.
-- ============================================================================
DROP POLICY IF EXISTS "newsletter_sponsor_admin" ON public.newsletter_sponsorships;
DROP POLICY IF EXISTS "newsletter_sponsorships_admin_all" ON public.newsletter_sponsorships;

ALTER TABLE public.newsletter_sponsorships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "newsletter_sponsorships_admin_all" ON public.newsletter_sponsorships
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());


-- ============================================================================
-- 16. farmer_public_profiles
--     Migration 006 created "Public can view active farmer profiles" (SELECT
--     where is_active). Add admin ALL + owner management.
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active farmer profiles" ON public.farmer_public_profiles;
DROP POLICY IF EXISTS "farmer_public_profiles_admin_all" ON public.farmer_public_profiles;
DROP POLICY IF EXISTS "farmer_public_profiles_public_select" ON public.farmer_public_profiles;
DROP POLICY IF EXISTS "farmer_public_profiles_owner_all" ON public.farmer_public_profiles;

ALTER TABLE public.farmer_public_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farmer_public_profiles_admin_all" ON public.farmer_public_profiles
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "farmer_public_profiles_public_select" ON public.farmer_public_profiles
  FOR SELECT USING (is_active = true);

-- The farmer (member) who owns the profile can manage it
CREATE POLICY "farmer_public_profiles_owner_all" ON public.farmer_public_profiles
  FOR ALL USING (
    member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    member_id IN (SELECT id FROM public.members WHERE profile_id = auth.uid())
  );


-- ============================================================================
-- 17. farmer_updates
--     Migration 032 created public_read_farmer_updates and
--     admins_manage_farmer_updates (using is_admin). Replace with
--     is_admin_or_super() for consistency.
-- ============================================================================
DROP POLICY IF EXISTS "public_read_farmer_updates" ON public.farmer_updates;
DROP POLICY IF EXISTS "admins_manage_farmer_updates" ON public.farmer_updates;
DROP POLICY IF EXISTS "farmer_updates_admin_all" ON public.farmer_updates;
DROP POLICY IF EXISTS "farmer_updates_public_select" ON public.farmer_updates;

ALTER TABLE public.farmer_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "farmer_updates_admin_all" ON public.farmer_updates
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

CREATE POLICY "farmer_updates_public_select" ON public.farmer_updates
  FOR SELECT USING (true);


-- ============================================================================
-- GRANT STATEMENTS
-- ============================================================================

-- Public-readable tables: anon + authenticated can SELECT
GRANT SELECT ON public.education_projects TO anon, authenticated;
GRANT SELECT ON public.supplier_subscription_plans TO anon, authenticated;
GRANT SELECT ON public.advertisements TO anon, authenticated;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT SELECT ON public.parametric_products TO anon, authenticated;
GRANT SELECT ON public.farmer_public_profiles TO anon, authenticated;
GRANT SELECT ON public.farmer_updates TO anon, authenticated;

-- Authenticated users need broader access on tables they can write to
GRANT ALL ON public.education_projects TO authenticated;
GRANT ALL ON public.supplier_subscription_plans TO authenticated;
GRANT ALL ON public.supplier_subscriptions TO authenticated;
GRANT ALL ON public.supplier_invoices TO authenticated;
GRANT ALL ON public.advertisements TO authenticated;
GRANT ALL ON public.ad_impressions TO anon, authenticated;
GRANT ALL ON public.ad_payments TO authenticated;
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.trade_orders TO authenticated;
GRANT ALL ON public.trade_quotes TO authenticated;
GRANT ALL ON public.parametric_products TO authenticated;
GRANT ALL ON public.parametric_policies TO authenticated;
GRANT ALL ON public.parametric_triggers TO authenticated;
GRANT SELECT ON public.contact_submissions TO authenticated;
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT ALL ON public.newsletter_sponsorships TO authenticated;
GRANT ALL ON public.farmer_public_profiles TO authenticated;
GRANT ALL ON public.farmer_updates TO authenticated;

-- ============================================================================
-- Reload PostgREST schema cache
-- ============================================================================
NOTIFY pgrst, 'reload schema';
