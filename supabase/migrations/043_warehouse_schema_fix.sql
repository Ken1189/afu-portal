-- ============================================================
-- 043: Fix warehouse schema to match frontend column names
-- The original 034 migration created tables with different
-- column names than what the frontend and API routes expect.
-- ============================================================

-- ========================
-- warehouses: add capacity_mt and current_stock_mt
-- ========================
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS capacity_mt DECIMAL(12,2) DEFAULT 0;
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS current_stock_mt DECIMAL(12,2) DEFAULT 0;

-- Backfill from old columns if they have data
UPDATE warehouses
  SET capacity_mt = COALESCE(capacity_tons, 0),
      current_stock_mt = COALESCE(used_tons, 0)
  WHERE capacity_mt = 0 AND (capacity_tons IS NOT NULL OR used_tons IS NOT NULL);

-- ========================
-- warehouse_receipts: add all columns the frontend/API uses
-- ========================
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS farmer_name TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS farmer_phone TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS bags INTEGER DEFAULT 0;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS gross_weight_kg DECIMAL(12,2) DEFAULT 0;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS tare_weight_kg DECIMAL(12,2) DEFAULT 0;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS net_weight_kg DECIMAL(12,2) DEFAULT 0;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS unit_price DECIMAL(12,4) DEFAULT 0;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS total_value DECIMAL(14,2) DEFAULT 0;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS received_by UUID;

-- Ensure receipt_number, grade, status exist (may already from 035)
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS grade TEXT;

-- Update status default for receipt workflow
-- (034 had default 'stored'; frontend expects 'pending' / 'received' / 'released' / 'rejected')
-- Don't change existing rows, just ensure column exists

-- ========================
-- quality_inspections: add all columns the frontend/API uses
-- ========================
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS receipt_number TEXT;
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS farmer_name TEXT;
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS commodity TEXT;
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS moisture_percent DECIMAL(5,2);
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS foreign_matter_percent DECIMAL(5,2);
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS damage_percent DECIMAL(5,2);
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS aflatoxin_level TEXT DEFAULT 'safe';
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS color_assessment TEXT DEFAULT 'good';
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS odor TEXT DEFAULT 'normal';
ALTER TABLE quality_inspections ADD COLUMN IF NOT EXISTS inspector_notes TEXT;

-- ========================
-- dispatches: create standalone table (frontend queries this directly)
-- ========================
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
ALTER TABLE dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "dispatches_read" ON dispatches FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "dispatches_insert" ON dispatches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "dispatches_update" ON dispatches FOR UPDATE USING (true);
CREATE POLICY IF NOT EXISTS "dispatches_admin" ON dispatches FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin', 'warehouse_operator'))
);

-- ========================
-- commodity_prices: add price_per_kg column (frontend uses this)
-- ========================
ALTER TABLE commodity_prices ADD COLUMN IF NOT EXISTS price_per_kg DECIMAL(12,4);

-- Backfill price_per_kg from existing price column (which is per ton)
UPDATE commodity_prices
  SET price_per_kg = price / 1000
  WHERE price_per_kg IS NULL AND price IS NOT NULL;

-- ========================
-- RPC for incrementing warehouse stock (used by receive API)
-- ========================
CREATE OR REPLACE FUNCTION increment_warehouse_stock(weight_mt DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE warehouses
    SET current_stock_mt = COALESCE(current_stock_mt, 0) + weight_mt
    WHERE id = (SELECT id FROM warehouses LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
