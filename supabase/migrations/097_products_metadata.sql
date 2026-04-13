-- ============================================================================
-- 097: Add metadata JSONB column to products for category-specific specs
-- e.g. seeds: variety, maturity_days, germination_rate
--      equipment: make, model, year, hours_mileage, condition
--      fertilizer: npk_ratio, application_rate
-- ============================================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Index for querying specific metadata keys
CREATE INDEX IF NOT EXISTS idx_products_metadata ON products USING gin (metadata);
