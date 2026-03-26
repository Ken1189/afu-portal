-- Migration 020: Banking Infrastructure
-- Double-entry ledger, wallet accounts, transaction monitoring, reconciliation
-- Depends on: 003_payments_and_kyc.sql

BEGIN;

-- ============================================================================
-- ENUMS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE ledger_account_type AS ENUM (
    'wallet', 'escrow', 'revenue', 'loan_book', 'insurance_pool',
    'trust', 'settlement', 'fees', 'suspense'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ledger_entry_type AS ENUM ('debit', 'credit');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('active', 'frozen', 'closed', 'pending');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE transaction_flag_type AS ENUM (
    'velocity', 'amount_threshold', 'cross_border', 'unusual_pattern',
    'manual_flag', 'sanctions_hit'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE flag_status AS ENUM ('pending', 'investigating', 'cleared', 'escalated', 'reported');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE recon_status AS ENUM ('matched', 'discrepancy', 'pending', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- LEDGER ACCOUNTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ledger_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  account_type    ledger_account_type NOT NULL,
  name            TEXT NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  balance         NUMERIC(18, 4) NOT NULL DEFAULT 0,
  status          account_status NOT NULL DEFAULT 'active',
  is_system       BOOLEAN NOT NULL DEFAULT FALSE,  -- system accounts (revenue, escrow, etc.)
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_accounts_user ON ledger_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_type ON ledger_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_currency ON ledger_accounts(currency);
CREATE INDEX IF NOT EXISTS idx_ledger_accounts_status ON ledger_accounts(status);

-- ============================================================================
-- LEDGER ENTRIES (Double-Entry)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ledger_entries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID NOT NULL,  -- groups debit+credit pair
  account_id        UUID NOT NULL REFERENCES ledger_accounts(id),
  contra_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  entry_type        ledger_entry_type NOT NULL,
  amount            NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
  currency          TEXT NOT NULL DEFAULT 'USD',
  balance_after     NUMERIC(18, 4) NOT NULL,
  description       TEXT,
  reference         TEXT,  -- external ref (payment ID, loan ID, etc.)
  reference_type    TEXT,  -- 'payment', 'loan_disbursement', 'loan_repayment', 'transfer', etc.
  operator_id       UUID REFERENCES auth.users(id),
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ledger_entries_transaction ON ledger_entries(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_account ON ledger_entries(account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_contra ON ledger_entries(contra_account_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_reference ON ledger_entries(reference, reference_type);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_created ON ledger_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_type ON ledger_entries(entry_type);

-- ============================================================================
-- WALLET ACCOUNTS (User-facing accounts)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallet_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ledger_account_id UUID NOT NULL REFERENCES ledger_accounts(id),
  account_number  TEXT UNIQUE NOT NULL,
  account_type    TEXT NOT NULL DEFAULT 'savings',  -- savings, loan, escrow, investment
  currency        TEXT NOT NULL DEFAULT 'USD',
  display_name    TEXT,
  status          account_status NOT NULL DEFAULT 'active',
  frozen_reason   TEXT,
  frozen_by       UUID REFERENCES auth.users(id),
  frozen_at       TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_accounts_user_type ON wallet_accounts(user_id, account_type, currency);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_user ON wallet_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_ledger ON wallet_accounts(ledger_account_id);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_number ON wallet_accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_wallet_accounts_status ON wallet_accounts(status);

-- ============================================================================
-- WALLET TRANSACTIONS (User-facing transaction history)
-- ============================================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id       UUID NOT NULL REFERENCES wallet_accounts(id),
  ledger_entry_id UUID REFERENCES ledger_entries(id),
  type            TEXT NOT NULL,  -- deposit, withdrawal, transfer_in, transfer_out, payment, refund
  amount          NUMERIC(18, 4) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  balance_after   NUMERIC(18, 4) NOT NULL,
  description     TEXT,
  reference       TEXT,
  counterparty    TEXT,  -- name of other party
  status          TEXT NOT NULL DEFAULT 'completed',
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_wallet_txns_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_created ON wallet_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_txns_type ON wallet_transactions(type);

-- ============================================================================
-- TRANSACTION FLAGS (Monitoring & AML)
-- ============================================================================

CREATE TABLE IF NOT EXISTS transaction_flags (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID,  -- ledger transaction_id
  wallet_txn_id   UUID REFERENCES wallet_transactions(id),
  user_id         UUID REFERENCES auth.users(id),
  flag_type       transaction_flag_type NOT NULL,
  severity        TEXT NOT NULL DEFAULT 'medium',  -- low, medium, high, critical
  details         JSONB NOT NULL DEFAULT '{}',
  status          flag_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES auth.users(id),
  reviewed_at     TIMESTAMPTZ,
  review_notes    TEXT,
  escalated_to    TEXT,  -- bank partner AML team reference
  sar_reference   TEXT,  -- SAR report reference if filed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_txn_flags_user ON transaction_flags(user_id);
CREATE INDEX IF NOT EXISTS idx_txn_flags_status ON transaction_flags(status);
CREATE INDEX IF NOT EXISTS idx_txn_flags_type ON transaction_flags(flag_type);
CREATE INDEX IF NOT EXISTS idx_txn_flags_severity ON transaction_flags(severity);
CREATE INDEX IF NOT EXISTS idx_txn_flags_created ON transaction_flags(created_at);

-- ============================================================================
-- VELOCITY RULES (Configurable monitoring thresholds)
-- ============================================================================

CREATE TABLE IF NOT EXISTS velocity_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  country_code    TEXT,  -- NULL = global rule
  currency        TEXT,
  max_count       INTEGER,  -- max transactions in window
  max_amount      NUMERIC(18, 4),  -- max total amount in window
  window_minutes  INTEGER NOT NULL DEFAULT 60,
  flag_type       transaction_flag_type NOT NULL DEFAULT 'velocity',
  severity        TEXT NOT NULL DEFAULT 'medium',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- RECONCILIATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS reconciliation_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date        DATE NOT NULL,
  provider        TEXT NOT NULL,  -- 'stripe', 'mpesa', 'ecocash', etc.
  currency        TEXT NOT NULL DEFAULT 'USD',
  our_balance     NUMERIC(18, 4) NOT NULL,
  provider_balance NUMERIC(18, 4),
  discrepancy     NUMERIC(18, 4),
  total_matched   INTEGER NOT NULL DEFAULT 0,
  total_unmatched INTEGER NOT NULL DEFAULT 0,
  status          recon_status NOT NULL DEFAULT 'pending',
  notes           TEXT,
  run_by          UUID REFERENCES auth.users(id),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recon_runs_date ON reconciliation_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_recon_runs_provider ON reconciliation_runs(provider);
CREATE INDEX IF NOT EXISTS idx_recon_runs_status ON reconciliation_runs(status);

CREATE TABLE IF NOT EXISTS reconciliation_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          UUID NOT NULL REFERENCES reconciliation_runs(id) ON DELETE CASCADE,
  our_reference   TEXT,
  our_amount      NUMERIC(18, 4),
  our_date        TIMESTAMPTZ,
  provider_reference TEXT,
  provider_amount NUMERIC(18, 4),
  provider_date   TIMESTAMPTZ,
  status          recon_status NOT NULL DEFAULT 'pending',
  discrepancy_amount NUMERIC(18, 4),
  discrepancy_reason TEXT,
  resolved_by     UUID REFERENCES auth.users(id),
  resolved_at     TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_recon_items_run ON reconciliation_items(run_id);
CREATE INDEX IF NOT EXISTS idx_recon_items_status ON reconciliation_items(status);

-- ============================================================================
-- SYSTEM LEDGER ACCOUNTS (Seed)
-- ============================================================================

INSERT INTO ledger_accounts (id, account_type, name, currency, is_system, balance) VALUES
  ('00000000-0000-0000-0000-000000000001', 'revenue', 'AFU Revenue - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000002', 'escrow', 'AFU Escrow - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000003', 'loan_book', 'AFU Loan Book - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000004', 'insurance_pool', 'AFU Insurance Pool - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000005', 'trust', 'AFU Trust Account - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000006', 'settlement', 'AFU Settlement - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000007', 'fees', 'AFU Fees - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-000000000008', 'suspense', 'AFU Suspense - USD', 'USD', TRUE, 0),
  -- ZAR system accounts
  ('00000000-0000-0000-0000-000000000011', 'revenue', 'AFU Revenue - ZAR', 'ZAR', TRUE, 0),
  ('00000000-0000-0000-0000-000000000012', 'escrow', 'AFU Escrow - ZAR', 'ZAR', TRUE, 0),
  ('00000000-0000-0000-0000-000000000013', 'loan_book', 'AFU Loan Book - ZAR', 'ZAR', TRUE, 0),
  -- KES system accounts
  ('00000000-0000-0000-0000-000000000021', 'revenue', 'AFU Revenue - KES', 'KES', TRUE, 0),
  ('00000000-0000-0000-0000-000000000022', 'escrow', 'AFU Escrow - KES', 'KES', TRUE, 0),
  ('00000000-0000-0000-0000-000000000023', 'loan_book', 'AFU Loan Book - KES', 'KES', TRUE, 0),
  -- BWP system accounts
  ('00000000-0000-0000-0000-000000000031', 'revenue', 'AFU Revenue - BWP', 'BWP', TRUE, 0),
  ('00000000-0000-0000-0000-000000000032', 'escrow', 'AFU Escrow - BWP', 'BWP', TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- DEFAULT VELOCITY RULES
-- ============================================================================

INSERT INTO velocity_rules (name, description, max_count, window_minutes, severity) VALUES
  ('High frequency', 'More than 10 transactions in 1 hour', 10, 60, 'medium'),
  ('Rapid fire', 'More than 5 transactions in 5 minutes', 5, 5, 'high'),
  ('Daily limit', 'More than 50 transactions in 24 hours', 50, 1440, 'medium')
ON CONFLICT DO NOTHING;

INSERT INTO velocity_rules (name, description, country_code, currency, max_amount, window_minutes, flag_type, severity) VALUES
  ('KES large transaction', 'Single day total > 1M KES', 'KE', 'KES', 1000000, 1440, 'amount_threshold', 'high'),
  ('USD large transaction', 'Single day total > $10,000 USD', NULL, 'USD', 10000, 1440, 'amount_threshold', 'high'),
  ('ZAR large transaction', 'Single day total > 175,000 ZAR', 'ZA', 'ZAR', 175000, 1440, 'amount_threshold', 'high'),
  ('ZWL large transaction', 'Single day total > 5M ZWL', 'ZW', 'ZWL', 5000000, 1440, 'amount_threshold', 'high'),
  ('BWP large transaction', 'Single day total > 100,000 BWP', 'BW', 'BWP', 100000, 1440, 'amount_threshold', 'high'),
  ('UGX large transaction', 'Single day total > 20M UGX', 'UG', 'UGX', 20000000, 1440, 'amount_threshold', 'high')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE velocity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reconciliation_items ENABLE ROW LEVEL SECURITY;

-- Users see their own ledger accounts
CREATE POLICY ledger_accounts_user_read ON ledger_accounts FOR SELECT
  USING (user_id = auth.uid() OR is_system = TRUE);

-- Users see their own ledger entries
CREATE POLICY ledger_entries_user_read ON ledger_entries FOR SELECT
  USING (account_id IN (SELECT id FROM ledger_accounts WHERE user_id = auth.uid()));

-- Users see their own wallets
CREATE POLICY wallet_accounts_user_read ON wallet_accounts FOR SELECT
  USING (user_id = auth.uid());

-- Users see their own wallet transactions
CREATE POLICY wallet_txns_user_read ON wallet_transactions FOR SELECT
  USING (wallet_id IN (SELECT id FROM wallet_accounts WHERE user_id = auth.uid()));

-- Admins see all transaction flags (via service role, but add policy for super_admin)
CREATE POLICY txn_flags_admin_read ON transaction_flags FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
    OR user_id = auth.uid()
  );

-- Admins see velocity rules
CREATE POLICY velocity_rules_read ON velocity_rules FOR SELECT
  USING (TRUE);  -- all authenticated users can read rules

-- Admins see reconciliation
CREATE POLICY recon_runs_admin_read ON reconciliation_runs FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

CREATE POLICY recon_items_admin_read ON reconciliation_items FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- HELPER FUNCTION: Generate account number
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_account_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'AFU';
  num TEXT;
BEGIN
  num := lpad(floor(random() * 10000000000)::TEXT, 10, '0');
  RETURN prefix || num;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER ledger_accounts_updated_at BEFORE UPDATE ON ledger_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER wallet_accounts_updated_at BEFORE UPDATE ON wallet_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER txn_flags_updated_at BEFORE UPDATE ON transaction_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER velocity_rules_updated_at BEFORE UPDATE ON velocity_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
