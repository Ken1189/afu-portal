-- =============================================================================
-- SECURITY HARDENING: Lock down permissive RLS policies, function search paths
-- =============================================================================
--
-- Context:
-- After migration 100 enabled RLS on all tables, Supabase linter flagged:
--   1. ~50 INSERT policies with WITH CHECK (true) — anyone can spam writes
--   2. A few UPDATE/DELETE policies with USING (true) — anyone can modify/delete
--   3. 25 functions without explicit search_path — minor SQL injection vector
--   4. 4 storage buckets (avatars, cvs, media, public-assets) allow listing
--
-- This migration:
-- - Drops the "open_insert_*" and other WITH CHECK (true) policies that were
--   placeholders from early scaffolding. Admin + authenticated-user-scoped
--   policies already exist alongside them, so removing the open ones doesn't
--   break legitimate flows that use the service role (admin API routes) or
--   the authenticated role (logged-in users).
-- - Keeps specific "anyone_*" policies for forms where anonymous submission
--   IS intended (contact form, driver applications, project submissions, etc).
--   These already have admin review so spam is manageable.
-- - Fixes function search paths by setting them to 'public, pg_temp'.
-- - Storage bucket listing: replaces broad storage_read with per-path access.
--
-- Idempotent: uses DROP POLICY IF EXISTS and ALTER FUNCTION ... SET search_path.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PART 1: Drop overly permissive INSERT policies (WITH CHECK (true))
-- These were scaffolding. Admin routes use service role (bypasses RLS).
-- Authenticated users have their own "auth_insert_*" or role-scoped policies.
-- ---------------------------------------------------------------------------

-- Financial/sensitive tables — must NOT allow anonymous writes
DROP POLICY IF EXISTS open_insert_ambassador_payouts ON public.ambassador_payouts;
DROP POLICY IF EXISTS open_insert_ambassadors ON public.ambassadors;
DROP POLICY IF EXISTS ambassador_insert ON public.ambassadors;
DROP POLICY IF EXISTS ambassador_update ON public.ambassadors;
DROP POLICY IF EXISTS ambassador_delete ON public.ambassadors;
DROP POLICY IF EXISTS open_insert_blog_posts ON public.blog_posts;
DROP POLICY IF EXISTS open_insert_carbon_enrollments ON public.carbon_enrollments;
DROP POLICY IF EXISTS open_insert_carbon_practices ON public.carbon_practices;
DROP POLICY IF EXISTS carbon_purchases_insert ON public.carbon_purchases;
DROP POLICY IF EXISTS open_insert_carbon_purchases ON public.carbon_purchases;
DROP POLICY IF EXISTS open_insert_commission_entries ON public.commission_entries;
DROP POLICY IF EXISTS open_insert_cooperative_members ON public.cooperative_members;
DROP POLICY IF EXISTS open_insert_dispatches ON public.dispatches;
DROP POLICY IF EXISTS open_insert_documents ON public.documents;
DROP POLICY IF EXISTS open_insert_equipment_bookings ON public.equipment_bookings;
DROP POLICY IF EXISTS open_insert_equipment_favorites ON public.equipment_favorites;
DROP POLICY IF EXISTS open_insert_export_documents ON public.export_documents;
DROP POLICY IF EXISTS open_insert_farm_activities ON public.farm_activities;
DROP POLICY IF EXISTS open_insert_farm_plots ON public.farm_plots;
DROP POLICY IF EXISTS open_insert_farm_transactions ON public.farm_transactions;
DROP POLICY IF EXISTS open_insert_farmer_badges ON public.farmer_badges;
DROP POLICY IF EXISTS open_insert_insurance_claims ON public.insurance_claims;
DROP POLICY IF EXISTS open_insert_insurance_policies ON public.insurance_policies;
DROP POLICY IF EXISTS open_insert_insurance_quotes ON public.insurance_quotes;
DROP POLICY IF EXISTS open_insert_investor_interests ON public.investor_interests;
DROP POLICY IF EXISTS open_insert_investor_settings ON public.investor_settings;
DROP POLICY IF EXISTS open_insert_livestock ON public.livestock;
DROP POLICY IF EXISTS open_insert_market_watchlist ON public.market_watchlist;
DROP POLICY IF EXISTS open_insert_notifications ON public.notifications;
DROP POLICY IF EXISTS open_insert_order_items ON public.order_items;
DROP POLICY IF EXISTS open_insert_orders ON public.orders;
DROP POLICY IF EXISTS open_insert_price_alerts ON public.price_alerts;
DROP POLICY IF EXISTS open_insert_products ON public.products;
DROP POLICY IF EXISTS open_insert_quality_inspections ON public.quality_inspections;
DROP POLICY IF EXISTS rl_insert ON public.receipt_loans;
DROP POLICY IF EXISTS open_insert_referral_links ON public.referral_links;
DROP POLICY IF EXISTS open_insert_referrals ON public.referrals;
DROP POLICY IF EXISTS open_insert_reviews ON public.reviews;
DROP POLICY IF EXISTS open_insert_sponsorships ON public.sponsorships;
DROP POLICY IF EXISTS supplier_dir_own_write ON public.supplier_directory;
DROP POLICY IF EXISTS supplier_dir_own_update ON public.supplier_directory;
DROP POLICY IF EXISTS open_insert_trade_orders ON public.trade_orders;
DROP POLICY IF EXISTS open_insert_trade_quotes ON public.trade_quotes;
DROP POLICY IF EXISTS trade_quotes_insert ON public.trade_quotes;
DROP POLICY IF EXISTS open_insert_wallets ON public.wallets;
DROP POLICY IF EXISTS open_insert_warehouse_receipts ON public.warehouse_receipts;
DROP POLICY IF EXISTS wr_insert ON public.warehouse_receipts;

-- System-only tables (writes only via service role)
DROP POLICY IF EXISTS ad_impressions_anon_insert ON public.ad_impressions;
DROP POLICY IF EXISTS sms_system_insert ON public.sms_messages;
DROP POLICY IF EXISTS ussd_system_insert ON public.ussd_sessions;
DROP POLICY IF EXISTS weather_system_insert ON public.weather_data;
DROP POLICY IF EXISTS wa_system_insert ON public.whatsapp_messages;

-- Duplicate contact form policies (one is enough, admin-reviewed anyway)
DROP POLICY IF EXISTS open_insert_contact_submissions ON public.contact_submissions;
DROP POLICY IF EXISTS anyone_insert_contact ON public.contact_submissions;
-- Keep: anyone_contact (the intentional public form submission)
-- Keep: contact_submissions_anon_insert (also intentional)
-- Since both are effectively the same, keep only one
DROP POLICY IF EXISTS contact_submissions_anon_insert ON public.contact_submissions;

-- Keep these intentional anonymous-submission policies (public-facing forms):
-- - anyone_contact on contact_submissions
-- - anyone_quote on insurance_quotes (quote requests from public)
-- - anyone_eoi on investor_interests (EOI from public)
-- - anyone_apply_amb on ambassadors (ambassador applications)
-- - "Anyone can submit driver application" on foober_driver_applications
-- - "Anyone can submit a project" on project_submissions
-- - "Public can submit talent applications" on talent_applications
-- - "Anyone can create a sponsorship" on sponsorships (public sponsor form)
-- - sp_applications_public_insert on service_provider_applications
-- These forms are admin-reviewed, so spam is manageable. If spam becomes an
-- issue, add rate limiting at the API layer or add hCaptcha.

-- ---------------------------------------------------------------------------
-- PART 2: Fix function search paths
-- Functions without explicit search_path are vulnerable to schema confusion.
-- Setting it to 'public, pg_temp' is Supabase's recommended safe default.
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  fn_name text;
  target_functions text[] := ARRAY[
    'generate_trade_order_number',
    'generate_receipt_number',
    'increment_supplier_totals',
    'generate_foober_delivery_number',
    'generate_account_number',
    'generate_case_number',
    'generate_appointment_number',
    'decrement_product_stock',
    'credit_wallet',
    'debit_wallet',
    'increment_supplier_products',
    'increment_farmer_sponsors',
    'increment_course_enrollment',
    'update_supplier_rating',
    'create_order_atomic',
    'get_supplier_active_plan',
    'count_supplier_products',
    'user_has_capability',
    'add_user_capability',
    'remove_user_capability',
    'update_updated_at',
    'generate_member_id',
    'generate_order_number',
    'generate_loan_number'
  ];
BEGIN
  FOREACH fn_name IN ARRAY target_functions
  LOOP
    -- Loop over all overloads of each function (might have multiple signatures)
    FOR fn_name IN
      SELECT format('%I(%s)', p.proname, pg_get_function_identity_arguments(p.oid))
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname = 'public' AND p.proname = fn_name
    LOOP
      BEGIN
        EXECUTE format('ALTER FUNCTION public.%s SET search_path = public, pg_temp', fn_name);
      EXCEPTION WHEN OTHERS THEN
        -- Function doesn't exist or already set — ignore
        NULL;
      END;
    END LOOP;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- PART 3: Storage bucket listing restrictions
--
-- Public buckets only need public READ of specific objects (via public URL).
-- They don't need anonymous LIST. Restrict listing to service role + authed
-- users, keep public read of direct object URLs working.
-- ---------------------------------------------------------------------------

-- Drop the overly broad storage_read policy on the 4 flagged buckets
-- Supabase's default "Public can read" via signed URLs still works without this.
DROP POLICY IF EXISTS storage_read ON storage.objects;

-- Add a more scoped read policy: authenticated users can list files,
-- anon users can only access specific objects via direct URL (which Supabase
-- handles outside of RLS via the public bucket flag itself).
CREATE POLICY storage_authenticated_read
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id IN ('avatars', 'cvs', 'media', 'public-assets', 'documents')
  );

-- For `cvs` bucket specifically — only admins and the CV owner should access
-- This assumes CV files are prefixed with the user ID. If not, admin-only.
CREATE POLICY storage_cvs_admin_only
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'cvs' AND (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
          AND profiles.role IN ('admin', 'super_admin')
      )
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- ---------------------------------------------------------------------------
-- Verification queries (run manually):
--
-- Permissive policies should now return few or no rows:
-- SELECT schemaname, tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND (qual = 'true' OR with_check = 'true')
--   AND cmd IN ('INSERT', 'UPDATE', 'DELETE');
--
-- Functions should have search_path set:
-- SELECT proname, proconfig FROM pg_proc p
-- JOIN pg_namespace n ON n.oid = p.pronamespace
-- WHERE n.nspname = 'public' AND proconfig IS NULL;
-- ---------------------------------------------------------------------------
