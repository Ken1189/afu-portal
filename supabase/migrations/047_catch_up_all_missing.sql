-- ============================================================
-- 047: CATCH-UP MIGRATION — Every missing table/column
-- Run this in Supabase SQL Editor to fix all "failed to load" errors
-- ============================================================

-- ───────────────────────────────────────────────────────────
-- Migration 044: Payments → member link
-- ───────────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_members_profile_id ON members(profile_id);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS tier TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID;
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);

-- ───────────────────────────────────────────────────────────
-- Migration 045: Supplier columns + application_type
-- ───────────────────────────────────────────────────────────
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS partner_type TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS application_type TEXT;

-- ───────────────────────────────────────────────────────────
-- Migration 046: Payouts table
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  payout_method TEXT,
  payout_reference TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Farm tables
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS farm_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  member_id UUID,
  name TEXT,
  size_ha DECIMAL(10,2),
  crop_type TEXT,
  variety TEXT,
  status TEXT DEFAULT 'active',
  planting_date DATE,
  expected_harvest DATE,
  soil_ph DECIMAL(4,2),
  location TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  member_id UUID,
  animal_type TEXT,
  breed TEXT,
  count INTEGER DEFAULT 0,
  age_months INTEGER,
  health_status TEXT DEFAULT 'healthy',
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plot_id UUID,
  type TEXT,
  category TEXT,
  description TEXT,
  date DATE,
  cost DECIMAL(12,2),
  photo_url TEXT,
  notes TEXT,
  mood TEXT,
  weather TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  type TEXT,
  category TEXT,
  description TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'completed',
  reference TEXT,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Insurance tables
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  user_id UUID,
  policy_type TEXT,
  policy_number TEXT,
  status TEXT DEFAULT 'active',
  premium_amount DECIMAL(12,2),
  coverage_amount DECIMAL(12,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID,
  member_id UUID,
  user_id UUID,
  claim_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  description TEXT,
  filed_date DATE,
  resolved_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  country TEXT,
  trigger_conditions JSONB DEFAULT '{}'::jsonb,
  payout_structure JSONB DEFAULT '{}'::jsonb,
  premium_rate DECIMAL(8,4) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Wallet tables
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  balance DECIMAL(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID,
  user_id UUID,
  amount DECIMAL(14,2) NOT NULL,
  type TEXT,
  status TEXT DEFAULT 'completed',
  description TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  flag_type TEXT,
  reason TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Vet appointments
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vet_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  member_id UUID,
  animal_type TEXT,
  service_type TEXT,
  scheduled_date TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  vet_id UUID,
  vet_name TEXT,
  diagnosis TEXT,
  notes TEXT,
  cost DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add scheduled_date if vet_appointments already exists without it
ALTER TABLE vet_appointments ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMPTZ;
ALTER TABLE vet_appointments ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE vet_appointments ADD COLUMN IF NOT EXISTS vet_name TEXT;
ALTER TABLE vet_appointments ADD COLUMN IF NOT EXISTS diagnosis TEXT;

-- ───────────────────────────────────────────────────────────
-- Other commonly-queried tables
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  member_id UUID,
  amount DECIMAL(14,2) NOT NULL,
  interest_rate DECIMAL(5,2),
  term_months INTEGER,
  status TEXT DEFAULT 'draft',
  purpose TEXT,
  applied_date TIMESTAMPTZ DEFAULT now(),
  approved_date TIMESTAMPTZ,
  disbursed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  ambassador_id UUID,
  order_id UUID,
  order_item_id UUID,
  commission_type TEXT DEFAULT 'marketplace',
  sale_amount DECIMAL(12,2),
  commission_rate DECIMAL(5,2),
  commission_amount DECIMAL(12,2),
  rate_percent DECIMAL(5,2),
  status TEXT DEFAULT 'pending',
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID,
  status TEXT DEFAULT 'enrolled',
  progress INTEGER DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- ───────────────────────────────────────────────────────────
-- Warehouse extra columns (for warehouse portal long-load fix)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  country TEXT,
  capacity_mt DECIMAL(12,2) DEFAULT 0,
  current_stock_mt DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouse_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID,
  receipt_number TEXT,
  farmer_id UUID,
  farmer_name TEXT,
  farmer_phone TEXT,
  commodity TEXT,
  bags INTEGER DEFAULT 0,
  gross_weight_kg DECIMAL(12,2) DEFAULT 0,
  tare_weight_kg DECIMAL(12,2) DEFAULT 0,
  net_weight_kg DECIMAL(12,2) DEFAULT 0,
  unit_price DECIMAL(12,4) DEFAULT 0,
  total_value DECIMAL(14,2) DEFAULT 0,
  grade TEXT,
  status TEXT DEFAULT 'pending',
  received_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID,
  receipt_number TEXT,
  farmer_name TEXT,
  commodity TEXT,
  moisture_percent DECIMAL(5,2),
  foreign_matter_percent DECIMAL(5,2),
  damage_percent DECIMAL(5,2),
  aflatoxin_level TEXT DEFAULT 'safe',
  color_assessment TEXT DEFAULT 'good',
  odor TEXT DEFAULT 'normal',
  inspector_notes TEXT,
  inspector_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_number TEXT,
  destination TEXT,
  transporter TEXT,
  vehicle_number TEXT,
  receipts JSONB DEFAULT '[]'::jsonb,
  total_weight_kg DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'loading',
  notes TEXT,
  dispatched_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Cooperatives
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cooperatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  country TEXT,
  region TEXT,
  member_count INTEGER DEFAULT 0,
  primary_crops TEXT[],
  status TEXT DEFAULT 'active',
  contact_email TEXT,
  contact_phone TEXT,
  founded_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cooperative_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID,
  user_id UUID,
  member_id UUID,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS cooperative_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID,
  type TEXT,
  description TEXT,
  amount DECIMAL(12,2),
  participants INTEGER,
  date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Equipment
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT,
  description TEXT,
  owner_id UUID,
  owner_name TEXT,
  farm_name TEXT,
  daily_rate DECIMAL(12,2),
  monthly_rate DECIMAL(12,2),
  status TEXT DEFAULT 'available',
  country TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID,
  user_id UUID,
  start_date DATE,
  end_date DATE,
  total_cost DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Carbon credits
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS carbon_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT,
  country TEXT,
  hectares DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  certification TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  user_id UUID,
  member_id UUID,
  credits_earned DECIMAL(14,4) DEFAULT 0,
  credits_sold DECIMAL(14,4) DEFAULT 0,
  credits_balance DECIMAL(14,4) DEFAULT 0,
  price_per_credit DECIMAL(12,2),
  total_value DECIMAL(14,2),
  vintage_year INTEGER,
  status TEXT DEFAULT 'active',
  certification TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS credits_earned DECIMAL(14,4) DEFAULT 0;
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS credits_sold DECIMAL(14,4) DEFAULT 0;
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS credits_balance DECIMAL(14,4) DEFAULT 0;
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS vintage_year INTEGER;

CREATE TABLE IF NOT EXISTS carbon_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  verifier TEXT,
  verification_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  user_id UUID,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active'
);

-- ───────────────────────────────────────────────────────────
-- Site content (for /admin/content page)
-- ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  value_type TEXT DEFAULT 'text',
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(page, section, key)
);

CREATE TABLE IF NOT EXISTS site_config (
  key TEXT PRIMARY KEY,
  value JSONB,
  category TEXT DEFAULT 'general',
  label TEXT,
  value_type TEXT DEFAULT 'json',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ───────────────────────────────────────────────────────────
-- Disable RLS on all (you said RLS is off platform-wide)
-- ───────────────────────────────────────────────────────────
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'payouts', 'farm_plots', 'livestock', 'farm_activities', 'farm_transactions',
    'insurance_policies', 'insurance_claims', 'insurance_products',
    'wallet_accounts', 'wallet_transactions', 'transaction_flags',
    'vet_appointments', 'loans', 'commissions', 'course_enrollments',
    'warehouses', 'warehouse_receipts', 'quality_inspections', 'dispatches',
    'cooperatives', 'cooperative_members', 'cooperative_activities',
    'equipment', 'equipment_bookings',
    'carbon_projects', 'carbon_credits', 'carbon_verifications', 'carbon_enrollments',
    'site_content', 'site_config'
  ])
  LOOP
    BEGIN
      EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', t);
    EXCEPTION WHEN OTHERS THEN
      NULL; -- table may not exist or RLS may already be off
    END;
  END LOOP;
END $$;

-- Reload PostgREST schema cache so the new columns are visible immediately
NOTIFY pgrst, 'reload schema';
