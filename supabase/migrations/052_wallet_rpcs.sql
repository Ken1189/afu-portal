-- Sprint 2C: Wallet RPCs + loan disbursement columns

-- Atomic wallet credit (race-safe)
CREATE OR REPLACE FUNCTION credit_wallet(p_wallet_id UUID, p_amount DECIMAL, p_description TEXT)
RETURNS DECIMAL AS $$
DECLARE
  new_balance DECIMAL;
BEGIN
  UPDATE wallet_accounts
  SET balance = COALESCE(balance, 0) + p_amount
  WHERE id = p_wallet_id
  RETURNING balance INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Atomic wallet debit with insufficient funds check
CREATE OR REPLACE FUNCTION debit_wallet(p_wallet_id UUID, p_amount DECIMAL, p_description TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  SELECT balance INTO current_balance FROM wallet_accounts WHERE id = p_wallet_id FOR UPDATE;
  IF current_balance IS NULL OR current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  UPDATE wallet_accounts SET balance = balance - p_amount WHERE id = p_wallet_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Add columns referenced by disburse route
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursed_at TIMESTAMPTZ;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursed_amount DECIMAL(14,2);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS next_payment_date DATE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS next_payment_amount DECIMAL(14,2);

-- Ensure wallet_accounts has the columns we reference
ALTER TABLE wallet_accounts ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE wallet_accounts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE wallet_accounts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Ensure wallet_transactions has the columns we reference
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS reference TEXT;

NOTIFY pgrst, 'reload schema';
