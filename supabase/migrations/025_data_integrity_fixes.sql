-- Sprint 2: Data Integrity & Event System Fixes

-- S2.4: ledger_entries table already exists (from 020_banking_infrastructure.sql)
-- with proper schema: account_id (UUID FK), contra_account_id, transaction_id, etc.
-- The createLedgerEntry() handler now looks up accounts by name and inserts with UUIDs.
-- No table changes needed here.

-- S2.11: Create credit_wallet RPC function
-- Credits a user's primary wallet by amount, creating a transaction record.
CREATE OR REPLACE FUNCTION public.credit_wallet(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT 'Credit'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Find user's primary wallet
  SELECT id INTO v_wallet_id
  FROM wallets
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_wallet_id IS NULL THEN
    RAISE EXCEPTION 'No wallet found for user %', p_user_id;
  END IF;

  -- Update balance
  UPDATE wallets
  SET balance = balance + p_amount,
      updated_at = now()
  WHERE id = v_wallet_id;

  -- Record transaction
  INSERT INTO wallet_transactions (wallet_id, type, amount, description, status, created_at)
  VALUES (v_wallet_id, 'credit', p_amount, p_description, 'completed', now());
END;
$$;

GRANT EXECUTE ON FUNCTION public.credit_wallet(UUID, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.credit_wallet(UUID, NUMERIC, TEXT) TO service_role;

-- S2.13: Safely handle enum types that may already exist
-- (No-op if already created; prevents duplication errors on re-run)
DO $$
BEGIN
  -- These are common enums that may have been created in multiple migrations.
  -- Using IF NOT EXISTS prevents errors on re-application.
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'loan_status') THEN
    CREATE TYPE loan_status AS ENUM (
      'draft', 'submitted', 'under_review', 'approved', 'disbursed',
      'repaying', 'completed', 'defaulted', 'rejected', 'cancelled'
    );
  END IF;
END $$;
