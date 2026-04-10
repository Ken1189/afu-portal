-- Fix payouts table: add missing columns needed by admin payouts page
-- The page expects supplier_id FK, payout_method, payout_reference, notes, requested_at, processed_at
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id);
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payout_method TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS payout_reference TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS processed_by UUID;

CREATE INDEX IF NOT EXISTS idx_payouts_supplier ON payouts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
