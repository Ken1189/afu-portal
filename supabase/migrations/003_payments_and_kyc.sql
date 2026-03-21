-- Migration 003: Payment System, KYC/AML Compliance, Credit Scoring, Loan Enhancements
-- Depends on: 001_initial_schema.sql, 002_platform_tables.sql

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE payment_provider AS ENUM (
    'stripe', 'mpesa', 'ecocash', 'orange_money', 'mtn_momo', 'airtel_money', 'bank_transfer'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'processing', 'completed', 'failed', 'reversed', 'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_method_type AS ENUM (
    'card', 'mobile_money', 'bank_transfer', 'ussd'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_purpose AS ENUM (
    'loan_repayment', 'membership_fee', 'input_purchase', 'insurance_premium',
    'equipment_rental', 'transport', 'commission_payout', 'subscription',
    'marketplace_purchase', 'staking_deposit', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_tier AS ENUM ('tier_1', 'tier_2', 'tier_3');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE document_type AS ENUM (
    'national_id', 'passport', 'drivers_license', 'proof_of_address',
    'bank_statement', 'farm_registration', 'selfie', 'source_of_funds'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PAYMENT TABLES
-- ============================================================================

-- Payment gateways (admin-managed, which providers are active per country)
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider payment_provider NOT NULL,
  country TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments (the main payment record)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  gateway_id UUID REFERENCES payment_gateways(id),
  purpose payment_purpose NOT NULL,
  method payment_method_type NOT NULL,
  provider payment_provider NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status payment_status DEFAULT 'pending',
  provider_reference TEXT,
  phone_number TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  related_entity_type TEXT,
  related_entity_id UUID,
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payment attempts (track each attempt; a payment may have multiple)
CREATE TABLE IF NOT EXISTS payment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  gateway_id UUID REFERENCES payment_gateways(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL,
  status payment_status DEFAULT 'pending',
  provider_reference TEXT,
  provider_response JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reconciliation records
CREATE TABLE IF NOT EXISTS payment_reconciliation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id),
  provider_reference TEXT,
  expected_amount NUMERIC(12,2),
  actual_amount NUMERIC(12,2),
  matched BOOLEAN DEFAULT false,
  discrepancy_amount NUMERIC(12,2) DEFAULT 0,
  reconciled_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- KYC / AML TABLES
-- ============================================================================

-- KYC documents uploaded by members
CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  document_number TEXT,
  file_url TEXT NOT NULL,
  verification_status kyc_status DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KYC verification results (from providers like Smile Identity, Onfido)
CREATE TABLE IF NOT EXISTS kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  tier kyc_tier NOT NULL,
  provider TEXT NOT NULL,
  provider_reference TEXT,
  status kyc_status DEFAULT 'pending',
  risk_score NUMERIC(5,2),
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AML screening records
CREATE TABLE IF NOT EXISTS aml_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  check_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'clear',
  risk_level TEXT DEFAULT 'low',
  flags JSONB DEFAULT '[]',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- CREDIT SCORE TABLES
-- ============================================================================

-- Credit scores (one active score per member)
CREATE TABLE IF NOT EXISTS credit_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE UNIQUE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  tier TEXT NOT NULL,
  payment_history_score NUMERIC(5,2),
  loan_repayment_score NUMERIC(5,2),
  farm_productivity_score NUMERIC(5,2),
  membership_tenure_score NUMERIC(5,2),
  training_completion_score NUMERIC(5,2),
  cooperative_membership_score NUMERIC(5,2),
  collateral_score NUMERIC(5,2),
  max_loan_amount NUMERIC(12,2),
  calculated_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Credit score history
CREATE TABLE IF NOT EXISTS credit_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  tier TEXT NOT NULL,
  change_reason TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- LOAN ENHANCEMENT TABLES
-- ============================================================================

-- Loan schedules (amortization)
CREATE TABLE IF NOT EXISTS loan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_amount NUMERIC(12,2) NOT NULL,
  interest_amount NUMERIC(12,2) NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  paid_amount NUMERIC(12,2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Loan disbursements
CREATE TABLE IF NOT EXISTS loan_disbursements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL,
  member_id UUID REFERENCES members(id),
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  disbursement_method payment_method_type NOT NULL,
  provider payment_provider,
  phone_number TEXT,
  bank_account TEXT,
  status payment_status DEFAULT 'pending',
  provider_reference TEXT,
  disbursed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_payments_member_id ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_attempts_payment_id ON payment_attempts(payment_id);
CREATE INDEX IF NOT EXISTS idx_kyc_documents_member_id ON kyc_documents(member_id);
CREATE INDEX IF NOT EXISTS idx_credit_scores_member_id ON credit_scores(member_id);
CREATE INDEX IF NOT EXISTS idx_loan_schedules_loan_id ON loan_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_loan_disbursements_loan_id ON loan_disbursements(loan_id);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reconciliation ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE aml_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_disbursements ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- payment_gateways: read-only for all authenticated users
CREATE POLICY "Authenticated users can read active gateways"
  ON payment_gateways FOR SELECT
  TO authenticated
  USING (is_active = true);

-- payments: members read/insert their own
CREATE POLICY "Members can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Members can initiate payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

-- payment_attempts: members read their own (via payment)
CREATE POLICY "Members can view own payment attempts"
  ON payment_attempts FOR SELECT
  TO authenticated
  USING (payment_id IN (
    SELECT p.id FROM payments p
    JOIN members m ON m.id = p.member_id
    WHERE m.profile_id = auth.uid()
  ));

-- payment_reconciliation: admin only (service role bypasses RLS)
-- No authenticated user policies; only accessible via service role.

-- kyc_documents: members read/insert their own
CREATE POLICY "Members can view own KYC documents"
  ON kyc_documents FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

CREATE POLICY "Members can upload KYC documents"
  ON kyc_documents FOR INSERT
  TO authenticated
  WITH CHECK (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

-- kyc_verifications: members read their own
CREATE POLICY "Members can view own KYC verifications"
  ON kyc_verifications FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

-- aml_checks: admin only (service role bypasses RLS)
-- No authenticated user policies; only accessible via service role.

-- credit_scores: members read their own
CREATE POLICY "Members can view own credit score"
  ON credit_scores FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

-- credit_score_history: members read their own
CREATE POLICY "Members can view own credit score history"
  ON credit_score_history FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

-- loan_schedules: members read their own (via loan -> member)
CREATE POLICY "Members can view own loan schedules"
  ON loan_schedules FOR SELECT
  TO authenticated
  USING (loan_id IN (
    SELECT l.id FROM loans l
    JOIN members m ON m.id = l.member_id
    WHERE m.profile_id = auth.uid()
  ));

-- loan_disbursements: members read their own
CREATE POLICY "Members can view own loan disbursements"
  ON loan_disbursements FOR SELECT
  TO authenticated
  USING (member_id IN (
    SELECT id FROM members WHERE profile_id = auth.uid()
  ));

-- ============================================================================
-- SEED: PAYMENT GATEWAYS PER COUNTRY
-- ============================================================================

INSERT INTO payment_gateways (name, provider, country, config, is_active) VALUES
  -- Botswana (BW)
  ('BW Orange Money',   'orange_money',   'BW', '{"channel": "mobile_money"}', true),
  ('BW Bank Transfer',  'bank_transfer',  'BW', '{"channel": "bank_transfer"}', true),
  ('BW Stripe',         'stripe',         'BW', '{"channel": "card"}', true),

  -- Zimbabwe (ZW)
  ('ZW EcoCash',        'ecocash',        'ZW', '{"channel": "mobile_money"}', true),
  ('ZW Bank Transfer',  'bank_transfer',  'ZW', '{"channel": "bank_transfer"}', true),
  ('ZW Stripe',         'stripe',         'ZW', '{"channel": "card"}', true),

  -- Tanzania (TZ)
  ('TZ M-Pesa',         'mpesa',          'TZ', '{"channel": "mobile_money"}', true),
  ('TZ Airtel Money',   'airtel_money',   'TZ', '{"channel": "mobile_money"}', true),
  ('TZ Bank Transfer',  'bank_transfer',  'TZ', '{"channel": "bank_transfer"}', true),
  ('TZ Stripe',         'stripe',         'TZ', '{"channel": "card"}', true),

  -- Kenya (KE)
  ('KE M-Pesa',         'mpesa',          'KE', '{"channel": "mobile_money"}', true),
  ('KE Airtel Money',   'airtel_money',   'KE', '{"channel": "mobile_money"}', true),
  ('KE Bank Transfer',  'bank_transfer',  'KE', '{"channel": "bank_transfer"}', true),
  ('KE Stripe',         'stripe',         'KE', '{"channel": "card"}', true),

  -- South Africa (ZA)
  ('ZA Bank Transfer',  'bank_transfer',  'ZA', '{"channel": "bank_transfer"}', true),
  ('ZA Stripe',         'stripe',         'ZA', '{"channel": "card"}', true),

  -- Nigeria (NG)
  ('NG MTN MoMo',       'mtn_momo',       'NG', '{"channel": "mobile_money"}', true),
  ('NG Bank Transfer',  'bank_transfer',  'NG', '{"channel": "bank_transfer"}', true),
  ('NG Stripe',         'stripe',         'NG', '{"channel": "card"}', true),

  -- Zambia (ZM)
  ('ZM MTN MoMo',       'mtn_momo',       'ZM', '{"channel": "mobile_money"}', true),
  ('ZM Airtel Money',   'airtel_money',   'ZM', '{"channel": "mobile_money"}', true),
  ('ZM Bank Transfer',  'bank_transfer',  'ZM', '{"channel": "bank_transfer"}', true),
  ('ZM Stripe',         'stripe',         'ZM', '{"channel": "card"}', true),

  -- Mozambique (MZ)
  ('MZ M-Pesa',         'mpesa',          'MZ', '{"channel": "mobile_money"}', true),
  ('MZ Bank Transfer',  'bank_transfer',  'MZ', '{"channel": "bank_transfer"}', true),
  ('MZ Stripe',         'stripe',         'MZ', '{"channel": "card"}', true),

  -- Sierra Leone (SL)
  ('SL Orange Money',   'orange_money',   'SL', '{"channel": "mobile_money"}', true),
  ('SL Bank Transfer',  'bank_transfer',  'SL', '{"channel": "bank_transfer"}', true),
  ('SL Stripe',         'stripe',         'SL', '{"channel": "card"}', true),

  -- Uganda (UG)
  ('UG MTN MoMo',       'mtn_momo',       'UG', '{"channel": "mobile_money"}', true),
  ('UG Airtel Money',   'airtel_money',   'UG', '{"channel": "mobile_money"}', true),
  ('UG Bank Transfer',  'bank_transfer',  'UG', '{"channel": "bank_transfer"}', true),
  ('UG Stripe',         'stripe',         'UG', '{"channel": "card"}', true)
ON CONFLICT DO NOTHING;

COMMIT;
