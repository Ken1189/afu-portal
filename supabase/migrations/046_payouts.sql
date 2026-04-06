-- ============================================================================
-- 046_payouts.sql — Supplier payouts table
-- ============================================================================
-- Tracks payout requests from suppliers (settlements of accumulated commissions)
-- Status flow: pending → processing → completed (or failed)
-- When marked completed, related commissions are flipped to 'paid'.
-- ============================================================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  payout_method TEXT, -- mobile_money, bank_transfer
  payout_reference TEXT,
  notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID
);

CREATE INDEX IF NOT EXISTS idx_payouts_supplier ON payouts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);

ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Suppliers can read their own payouts
DROP POLICY IF EXISTS "payouts_supplier_read" ON payouts;
CREATE POLICY "payouts_supplier_read" ON payouts
  FOR SELECT USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE profile_id = auth.uid()
    )
  );

-- Suppliers can request a payout (insert pending)
DROP POLICY IF EXISTS "payouts_supplier_insert" ON payouts;
CREATE POLICY "payouts_supplier_insert" ON payouts
  FOR INSERT WITH CHECK (
    supplier_id IN (
      SELECT id FROM suppliers WHERE profile_id = auth.uid()
    )
  );

-- Admin full access (relies on existing is_admin() helper used in earlier migrations)
DROP POLICY IF EXISTS "payouts_admin_all" ON payouts;
CREATE POLICY "payouts_admin_all" ON payouts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

NOTIFY pgrst, 'reload schema';
