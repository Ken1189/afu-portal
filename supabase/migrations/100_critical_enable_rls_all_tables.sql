-- =============================================================================
-- CRITICAL SECURITY FIX: Enable Row-Level Security on all public tables
-- =============================================================================
--
-- Context:
-- Supabase database linter detected 160+ tables with RLS policies written
-- but RLS NOT enabled. This means the anon key (shipped in browser JS) can
-- bypass all policies and read/write these tables freely.
--
-- This migration enables RLS on every public table where policies already
-- exist (making them take effect) and on any remaining unprotected public
-- tables (using restrictive defaults).
--
-- Idempotent: ALTER TABLE ... ENABLE ROW LEVEL SECURITY is safe to re-run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Tables that already have policies — just enable RLS so they take effect
-- ---------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.ad_country_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ad_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassador_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ambassadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_buffer_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.carbon_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commodity_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.country_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.engagement_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.equipment_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.export_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farmer_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farmer_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.farmer_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.insurance_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.investment_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.investor_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.investor_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.livestock_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.managed_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.market_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.market_watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.offtake_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.permission_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.program_inclusions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.program_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quality_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipt_financing ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.receipt_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reconciliation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referral_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sms_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sponsor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.supplier_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.tier_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trade_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ussd_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.velocity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vet_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vet_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouse_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouse_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- Tables flagged by rls_disabled_in_public that DON'T have existing policies.
-- Enable RLS + add default admin-only policy + service role bypass.
-- These were completely unprotected. Now admin-only by default; create
-- additional per-table policies later if needed (e.g. user-owned access).
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  tbl_name text;
  target_tables text[] := ARRAY[
    'investor_updates',
    'conversation_messages',
    'membership_applications',
    'automation_rules',
    'estimates',
    'contracts',
    'supplier_inventory',
    'promo_codes',
    'promo_code_redemptions',
    'conversations',
    'investments',
    'cooperative_activities',
    'campaigns',
    'investor_documents',
    'kyc_records',
    'contacts',
    'automation_logs',
    'applications',
    'cvs',
    'exchange_listings',
    'investor_profiles',
    'loan_disbursements',
    'loan_schedules',
    'media',
    'newsletter_subscribers',
    'outbound_emails',
    'outbound_messages',
    'payment_gateways',
    'research_centres',
    'stripe_event_log',
    'user_tags',
    'farms'
  ];
BEGIN
  FOREACH tbl_name IN ARRAY target_tables
  LOOP
    -- Enable RLS (idempotent)
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY', tbl_name);

    -- Admin-only read policy (if not already present)
    EXECUTE format('
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE schemaname = ''public''
            AND tablename = %L
            AND policyname = ''admin_full_%I''
        ) THEN
          EXECUTE ''CREATE POLICY admin_full_%I ON public.%I
                   FOR ALL
                   TO authenticated
                   USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN (''''admin'''', ''''super_admin'''')))
                   WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN (''''admin'''', ''''super_admin'''')))'';
        END IF;
      END $inner$;
    ', tbl_name, tbl_name, tbl_name, tbl_name);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- Verification query (run manually to confirm):
--
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public' AND rowsecurity = false;
--
-- Expected result: 0 rows (all public tables have RLS enabled)
-- ---------------------------------------------------------------------------
