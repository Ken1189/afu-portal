-- Migration 023: Ambassador Commission & Referral System
-- Full affiliate program with tiered commissions, referral tracking, payouts

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE ambassador_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum', 'diamond');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE commission_type AS ENUM (
    'membership', 'fundraising', 'advertising', 'loan_origination',
    'insurance', 'marketplace', 'sponsorship', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE payout_status AS ENUM ('pending', 'approved', 'processing', 'paid', 'failed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- ALTER AMBASSADORS TABLE (add commission fields)
-- ============================================================================

ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS tier ambassador_tier DEFAULT 'bronze';
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS active_referrals INTEGER DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS total_earnings NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS pending_earnings NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS paid_earnings NUMERIC(14, 2) DEFAULT 0;
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS payout_method TEXT;  -- mobile_money, bank_transfer
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS payout_details JSONB DEFAULT '{}';  -- phone, bank account, etc.
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS wallet_account_id UUID REFERENCES wallet_accounts(id);
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS commission_rate_override JSONB;  -- custom rates per ambassador if needed

-- ============================================================================
-- COMMISSION RATES (Configurable)
-- ============================================================================

CREATE TABLE IF NOT EXISTS commission_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_type commission_type NOT NULL,
  tier            ambassador_tier,  -- NULL = applies to all tiers
  description     TEXT NOT NULL,
  rate_percent    NUMERIC(6, 3) NOT NULL,  -- e.g., 10.000 = 10%
  min_amount      NUMERIC(14, 2),  -- for tiered fundraising rates
  max_amount      NUMERIC(14, 2),
  is_recurring    BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- REFERRAL TRACKING
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_links (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id   UUID NOT NULL REFERENCES ambassadors(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id),
  referral_code   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active',  -- active, churned, expired
  signed_up_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_payment_at TIMESTAMPTZ,
  lifetime_value  NUMERIC(14, 2) DEFAULT 0,
  total_commission_earned NUMERIC(14, 2) DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_links_ambassador ON referral_links(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_user ON referral_links(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_links_code ON referral_links(referral_code);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referral_links_unique ON referral_links(referred_user_id);

-- ============================================================================
-- COMMISSION LEDGER (Every commission earned)
-- ============================================================================

CREATE TABLE IF NOT EXISTS commission_entries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id   UUID NOT NULL REFERENCES ambassadors(id),
  referral_link_id UUID REFERENCES referral_links(id),
  commission_type commission_type NOT NULL,
  description     TEXT,
  source_amount   NUMERIC(14, 2) NOT NULL,  -- the original transaction amount
  rate_percent    NUMERIC(6, 3) NOT NULL,
  commission_amount NUMERIC(14, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  source_reference TEXT,  -- payment ID, loan ID, etc.
  source_type     TEXT,  -- 'payment', 'loan', 'insurance', 'ad_payment', etc.
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending, confirmed, paid, reversed
  confirmed_at    TIMESTAMPTZ,
  paid_in_payout_id UUID,
  ledger_transaction_id UUID,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commission_entries_ambassador ON commission_entries(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_commission_entries_type ON commission_entries(commission_type);
CREATE INDEX IF NOT EXISTS idx_commission_entries_status ON commission_entries(status);
CREATE INDEX IF NOT EXISTS idx_commission_entries_created ON commission_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_commission_entries_referral ON commission_entries(referral_link_id);

-- ============================================================================
-- PAYOUTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ambassador_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ambassador_id   UUID NOT NULL REFERENCES ambassadors(id),
  amount          NUMERIC(14, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  payout_method   TEXT NOT NULL,  -- mobile_money, bank_transfer, wallet
  payout_details  JSONB DEFAULT '{}',
  payout_reference TEXT,  -- mobile money transaction ID, bank ref
  commission_count INTEGER NOT NULL DEFAULT 0,  -- how many commission entries included
  status          payout_status NOT NULL DEFAULT 'pending',
  approved_by     UUID REFERENCES auth.users(id),
  approved_at     TIMESTAMPTZ,
  paid_at         TIMESTAMPTZ,
  failure_reason  TEXT,
  ledger_transaction_id UUID,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payouts_ambassador ON ambassador_payouts(ambassador_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON ambassador_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_created ON ambassador_payouts(created_at);

-- ============================================================================
-- SEED: Commission Rates (Peter's structure)
-- ============================================================================

INSERT INTO commission_rates (commission_type, description, rate_percent, is_recurring, is_active) VALUES
  -- Membership: 10% recurring
  ('membership', 'Membership fees - 10% recurring commission', 10.000, TRUE, TRUE),

  -- Advertising: 10%
  ('advertising', 'Advertising revenue - 10% of ad spend from referred suppliers', 10.000, FALSE, TRUE),

  -- Loan origination: 1%
  ('loan_origination', 'Loan origination - 1% of loan amount', 1.000, FALSE, TRUE),

  -- Insurance: 5%
  ('insurance', 'Insurance premiums - 5% of premium', 5.000, FALSE, TRUE),

  -- Marketplace: 3%
  ('marketplace', 'Marketplace purchases - 3% of transaction value', 3.000, FALSE, TRUE),

  -- Sponsorship: 5%
  ('sponsorship', 'Sponsor a Farmer - 5% of sponsorship amount', 5.000, FALSE, TRUE)
ON CONFLICT DO NOTHING;

-- Fundraising: Tiered rates
INSERT INTO commission_rates (commission_type, description, rate_percent, min_amount, max_amount, is_active) VALUES
  ('fundraising', 'Fundraising $100K - $500K: 2%', 2.000, 100000, 500000, TRUE),
  ('fundraising', 'Fundraising $500K - $1M: 2.5%', 2.500, 500000, 1000000, TRUE),
  ('fundraising', 'Fundraising $1M - $5M: 5%', 5.000, 1000000, 5000000, TRUE),
  ('fundraising', 'Fundraising $5M - $10M: 7.5%', 7.500, 5000000, 10000000, TRUE),
  ('fundraising', 'Fundraising $10M+: 10%', 10.000, 10000000, NULL, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- AMBASSADOR TIER THRESHOLDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ambassador_tiers (
  tier            ambassador_tier PRIMARY KEY,
  min_referrals   INTEGER NOT NULL,
  display_name    TEXT NOT NULL,
  description     TEXT,
  commission_bonus_percent NUMERIC(4, 2) DEFAULT 0,  -- extra % on top of base rate
  perks           TEXT[]
);

INSERT INTO ambassador_tiers (tier, min_referrals, display_name, description, commission_bonus_percent, perks) VALUES
  ('bronze', 0, 'Bronze Ambassador', 'Getting started - build your network', 0, ARRAY['Basic referral dashboard', 'Referral link', 'Monthly newsletter']),
  ('silver', 11, 'Silver Ambassador', 'Growing influence - 11+ referrals', 0.5, ARRAY['All Bronze perks', '+0.5% commission bonus', 'Priority support', 'Ambassador badge']),
  ('gold', 51, 'Gold Ambassador', 'Established leader - 51+ referrals', 1.0, ARRAY['All Silver perks', '+1% commission bonus', 'Quarterly bonus', 'Training access', 'Invite to AFU events']),
  ('platinum', 201, 'Platinum Ambassador', 'Top performer - 201+ referrals', 2.0, ARRAY['All Gold perks', '+2% commission bonus', 'Annual retreat', 'Dedicated account manager', 'Custom marketing materials']),
  ('diamond', 501, 'Diamond Ambassador', 'Elite partner - 501+ referrals', 3.0, ARRAY['All Platinum perks', '+3% commission bonus', 'Revenue share on territory', 'Board advisory seat', 'Equity consideration'])
ON CONFLICT (tier) DO NOTHING;

-- ============================================================================
-- SYSTEM LEDGER ACCOUNT FOR COMMISSIONS
-- ============================================================================

INSERT INTO ledger_accounts (id, account_type, name, currency, is_system, balance) VALUES
  ('00000000-0000-0000-0000-00000000000b', 'fees', 'AFU Commission Payouts - USD', 'USD', TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE commission_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassador_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can read commission rates and tiers
CREATE POLICY commission_rates_read ON commission_rates FOR SELECT USING (TRUE);
CREATE POLICY ambassador_tiers_read ON ambassador_tiers FOR SELECT USING (TRUE);

-- Ambassadors see their own referral links
CREATE POLICY referral_links_own ON referral_links FOR SELECT
  USING (
    ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
  );

-- Ambassadors see their own commissions
CREATE POLICY commission_entries_own ON commission_entries FOR SELECT
  USING (
    ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
  );

-- Ambassadors see their own payouts
CREATE POLICY payouts_own ON ambassador_payouts FOR SELECT
  USING (
    ambassador_id IN (SELECT id FROM ambassadors WHERE user_id = auth.uid())
    OR auth.uid() IN (SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin'))
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DO $$ BEGIN
  CREATE TRIGGER ambassador_payouts_updated_at BEFORE UPDATE ON ambassador_payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER commission_rates_updated_at BEFORE UPDATE ON commission_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
