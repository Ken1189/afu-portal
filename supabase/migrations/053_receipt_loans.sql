-- 053_receipt_loans.sql
-- Sprint 2D: Wire warehouse receipts to loans + course XP / tier upgrade

-- ── Part 1: Receipt-backed loans ─────────────────────────────────────────

-- Add collateral fields to loans
ALTER TABLE loans ADD COLUMN IF NOT EXISTS collateral_type TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS collateral_id UUID;

-- Receipt financing already exists, but add loan link + status if missing
ALTER TABLE receipt_financing ADD COLUMN IF NOT EXISTS loan_id UUID;
ALTER TABLE receipt_financing ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Add status tracking to warehouse_receipts
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS pledged BOOLEAN DEFAULT false;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS pledged_to_loan_id UUID;

CREATE INDEX IF NOT EXISTS idx_loans_collateral ON loans(collateral_type, collateral_id);
CREATE INDEX IF NOT EXISTS idx_receipts_pledged ON warehouse_receipts(pledged);

-- ── Part 2: Course XP / tier upgrade ─────────────────────────────────────

ALTER TABLE courses ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 100;
ALTER TABLE farmer_tiers ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT now();

NOTIFY pgrst, 'reload schema';
