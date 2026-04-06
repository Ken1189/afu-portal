-- ============================================================================
-- 048_master_complete.sql
-- Master migration: creates all tables referenced by the AFU codebase.
-- Safe to re-run (IF NOT EXISTS). RLS disabled at the end.
-- ============================================================================

-- ============================================================================
-- SECTION 1: MEMBERS, AUTH, PROFILES, KYC
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  permission TEXT,
  granted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  document_type TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  status TEXT DEFAULT 'pending',
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farmer_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  monthly_price DECIMAL(12,2),
  annual_price DECIMAL(12,2),
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farmer_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  badge_type TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farmer_public_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farmer_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  reference_name TEXT,
  reference_contact TEXT,
  relationship TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farmer_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  file_url TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  headline TEXT,
  skills JSONB DEFAULT '[]'::jsonb,
  experience_years INTEGER,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 2: COUNTRIES, GEOGRAPHY, SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE,
  name TEXT,
  currency TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS country_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT,
  key TEXT,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  body TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key TEXT UNIQUE,
  enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investor_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  key TEXT,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 3: SUPPLIERS, PARTNERS, MARKETPLACE
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_directory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  category TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS supplier_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  product_id UUID,
  quantity INTEGER DEFAULT 0,
  location TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS managed_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  manager_id UUID,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  name TEXT,
  description TEXT,
  price DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  category TEXT,
  stock INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  supplier_id UUID,
  total_amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID,
  product_id UUID,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(12,2),
  total_price DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID,
  target_id UUID,
  target_type TEXT,
  rating INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID,
  supplier_id UUID,
  description TEXT,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  status TEXT DEFAULT 'pending',
  dispatched_at TIMESTAMPTZ,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID,
  carrier TEXT,
  tracking_number TEXT,
  status TEXT DEFAULT 'pending',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  inspector_id UUID,
  result TEXT,
  notes TEXT,
  inspected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  daily_rate DECIMAL(12,2),
  location TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID,
  renter_id UUID,
  start_date DATE,
  end_date DATE,
  total_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS equipment_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  equipment_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 4: COOPERATIVES, FARMS, LIVESTOCK
-- ============================================================================

CREATE TABLE IF NOT EXISTS cooperatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  country_code TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cooperative_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id UUID,
  member_id UUID,
  role TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  name TEXT,
  size_hectares DECIMAL(12,2),
  crop TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID,
  member_id UUID,
  activity_type TEXT,
  description TEXT,
  activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  type TEXT,
  amount DECIMAL(12,2),
  description TEXT,
  transaction_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS livestock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  species TEXT,
  breed TEXT,
  count INTEGER DEFAULT 0,
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS livestock_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  livestock_id UUID,
  status TEXT,
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vet_clinics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  location TEXT,
  contact TEXT,
  country_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vet_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  member_id UUID,
  scheduled_date TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 5: FINANCE, LOANS, PAYMENTS, WALLETS
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  balance DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID,
  account_type TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID,
  amount DECIMAL(12,2),
  type TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT,
  account_name TEXT,
  account_type TEXT,
  balance DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID,
  debit DECIMAL(12,2) DEFAULT 0,
  credit DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  borrower_id UUID,
  amount DECIMAL(12,2),
  currency TEXT DEFAULT 'USD',
  interest_rate DECIMAL(5,2),
  term_months INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loan_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID,
  amount DECIMAL(12,2),
  disbursed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID,
  due_date DATE,
  amount_due DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  score INTEGER,
  rating TEXT,
  calculated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS credit_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  score INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  config JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  amount DECIMAL(12,2),
  currency TEXT,
  status TEXT,
  gateway TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  amount DECIMAL(12,2),
  currency TEXT,
  status TEXT DEFAULT 'pending',
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  amount DECIMAL(12,2),
  source TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_id UUID,
  amount DECIMAL(12,2),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS commission_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT,
  rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE,
  status TEXT DEFAULT 'pending',
  summary JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reconciliation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID,
  reference TEXT,
  amount DECIMAL(12,2),
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transaction_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID,
  flag_type TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS velocity_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  rule JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 6: INSURANCE & PARAMETRIC
-- ============================================================================

CREATE TABLE IF NOT EXISTS insurance_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  category TEXT,
  premium_base DECIMAL(12,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  member_id UUID,
  premium DECIMAL(12,2),
  coverage_amount DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID,
  member_id UUID,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS insurance_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  member_id UUID,
  quote_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parametric_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  trigger_type TEXT,
  payout_amount DECIMAL(12,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parametric_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID,
  member_id UUID,
  premium DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS parametric_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  data JSONB,
  payout_processed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 7: CARBON CREDITS & SUSTAINABILITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS carbon_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  country_code TEXT,
  status TEXT DEFAULT 'active',
  total_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  serial_number TEXT,
  vintage_year INTEGER,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  member_id UUID,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_practices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID,
  practice_type TEXT,
  description TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID,
  verifier_id UUID,
  status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  project_id UUID,
  credits INTEGER,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS carbon_buffer_pool (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  credits_held INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 8: TRADE, MARKETS, COMMODITIES, WAREHOUSE
-- ============================================================================

CREATE TABLE IF NOT EXISTS commodity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT,
  price DECIMAL(12,2),
  currency TEXT,
  unit TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  market TEXT,
  commodity TEXT,
  price DECIMAL(12,2),
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  commodity TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  commodity TEXT,
  threshold DECIMAL(12,2),
  direction TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exchange_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID,
  commodity TEXT,
  quantity DECIMAL(12,2),
  price DECIMAL(12,2),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  seller_id UUID,
  listing_id UUID,
  quantity DECIMAL(12,2),
  total_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trade_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID,
  commodity TEXT,
  quote_amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS offtake_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  seller_id UUID,
  commodity TEXT,
  quantity DECIMAL(12,2),
  price DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_a UUID,
  party_b UUID,
  contract_type TEXT,
  terms JSONB,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  location TEXT,
  capacity DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS warehouse_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID,
  member_id UUID,
  commodity TEXT,
  quantity DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inventory_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  commodity TEXT,
  quantity DECIMAL(12,2),
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receipt_financing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS export_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID,
  title TEXT,
  file_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 9: INVESTORS
-- ============================================================================

CREATE TABLE IF NOT EXISTS investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  full_name TEXT,
  country_code TEXT,
  accredited BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investment_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  target_amount DECIMAL(12,2),
  raised_amount DECIMAL(12,2) DEFAULT 0,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  opportunity_id UUID,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investor_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  opportunity_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  title TEXT,
  file_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS investor_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID,
  title TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 10: AMBASSADORS, REFERRALS, SPONSORSHIP
-- ============================================================================

CREATE TABLE IF NOT EXISTS ambassador_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  monthly_price DECIMAL(12,2),
  annual_price DECIMAL(12,2),
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassador_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID,
  amount DECIMAL(12,2),
  source TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ambassador_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id UUID,
  amount DECIMAL(12,2),
  currency TEXT,
  status TEXT DEFAULT 'pending',
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  code TEXT UNIQUE,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsor_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  monthly_price DECIMAL(12,2),
  annual_price DECIMAL(12,2),
  benefits JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID,
  member_id UUID,
  tier TEXT,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 11: MESSAGING, NOTIFICATIONS, COMMUNICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a UUID,
  participant_b UUID,
  subject TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID,
  sender UUID,
  body TEXT,
  channel TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT,
  recipient TEXT,
  body TEXT,
  channel TEXT DEFAULT 'sms',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender TEXT,
  recipient TEXT,
  body TEXT,
  channel TEXT DEFAULT 'whatsapp',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outbound_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT,
  subject TEXT,
  body TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT,
  body TEXT,
  channel TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  channel TEXT,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  template_id UUID,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  body TEXT,
  audience TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  title TEXT,
  body TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  payload JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  subject TEXT,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  body TEXT,
  audience TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  status TEXT DEFAULT 'subscribed',
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ussd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  phone_number TEXT,
  state JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 12: CONTENT, BLOG, FAQ, MEDIA, LEGAL
-- ============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  body TEXT,
  author_id UUID,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT,
  answer TEXT,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT,
  body TEXT,
  rating INTEGER,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  file_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  title TEXT,
  file_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  body TEXT,
  locale TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  country_code TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS legal_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID,
  client_id UUID,
  title TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  country_code TEXT,
  focus_area TEXT,
  contact TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 13: COURSES, EDUCATION, PROGRAMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  description TEXT,
  category TEXT,
  price DECIMAL(12,2),
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  title TEXT,
  body TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  user_id UUID,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID,
  user_id UUID,
  completed_at TIMESTAMPTZ DEFAULT now(),
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID,
  user_id UUID,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_inclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID,
  inclusion_type TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID,
  user_id UUID,
  stage TEXT,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  application_type TEXT,
  data JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID,
  title TEXT,
  description TEXT,
  location TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID,
  user_id UUID,
  cv_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 14: ADVERTISING
-- ============================================================================

CREATE TABLE IF NOT EXISTS advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID,
  title TEXT,
  image_url TEXT,
  target_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  description TEXT,
  price DECIMAL(12,2),
  duration_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_country_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT,
  tier TEXT,
  multiplier DECIMAL(5,2) DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID,
  user_id UUID,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ad_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID,
  amount DECIMAL(12,2),
  currency TEXT,
  status TEXT DEFAULT 'pending',
  reference TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 15: AUDIT, AUTOMATION, COMPLIANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT,
  details JSONB,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT,
  details JSONB,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type TEXT,
  details JSONB,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  trigger TEXT,
  action JSONB,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT,
  details JSONB,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID,
  issue_type TEXT,
  severity TEXT,
  status TEXT DEFAULT 'open',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- DISABLE RLS ON ALL TABLES IN THIS MIGRATION
-- ============================================================================

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'ad_country_tiers','ad_impressions','ad_packages','ad_payments',
    'admin_permissions','advertisements','ambassador_commissions','ambassador_payouts',
    'ambassador_tiers','announcements','applications','audit_log','audit_logs',
    'automation_logs','automation_rules','blog_posts','broadcasts',
    'carbon_buffer_pool','carbon_credits','carbon_enrollments','carbon_practices',
    'carbon_projects','carbon_purchases','carbon_verifications','commission_entries',
    'commission_rates','commissions','commodity_prices','compliance_issues',
    'contact_submissions','contracts','conversation_messages','conversations',
    'cooperative_members','cooperatives','countries','country_settings',
    'course_completions','course_enrollments','course_modules','courses',
    'credit_score_history','credit_scores','cvs','dispatches','documents',
    'equipment','equipment_bookings','equipment_favorites','estimates','event_log',
    'exchange_listings','export_documents','faq_items','farm_activities',
    'farm_plots','farm_transactions','farmer_badges','farmer_public_profiles',
    'farmer_references','farmer_tiers','farmer_updates','feature_flags',
    'insurance_claims','insurance_policies','insurance_products','insurance_quotes',
    'inventory_positions','investment_opportunities','investments','investor_documents',
    'investor_interests','investor_profiles','investor_settings','investor_updates',
    'job_applications','job_listings','kyc_documents','kyc_verifications',
    'ledger_accounts','ledger_entries','legal_cases','legal_firms','legal_pages',
    'livestock','livestock_health_records','loan_disbursements','loan_schedules',
    'loans','managed_partners','market_prices','market_watchlist','media',
    'message_campaigns','message_templates','newsletter_subscribers',
    'notification_queue','notification_templates','notifications',
    'offtake_contracts','order_items','orders','outbound_emails','outbound_messages',
    'parametric_policies','parametric_products','parametric_triggers',
    'payment_attempts','payment_gateways','payouts','platform_settings',
    'price_alerts','products','program_enrollments','program_inclusions',
    'program_stage_history','programs','quality_inspections','receipt_financing',
    'reconciliation_items','reconciliation_runs','referral_links','referral_rewards',
    'research_centres','reviews','shipments','site_config','site_content',
    'sms_messages','sponsor_tiers','sponsorships','supplier_directory',
    'supplier_inventory','talent_profiles','testimonials','trade_orders',
    'trade_quotes','transaction_flags','user_tags','ussd_sessions',
    'velocity_rules','vet_appointments','vet_clinics','wallet_accounts',
    'wallet_transactions','wallets','warehouse_receipts','warehouses',
    'weather_data','whatsapp_messages'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE IF EXISTS %I DISABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
