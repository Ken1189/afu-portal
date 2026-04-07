-- Migration 049: Stripe webhook deduplication + atomic supplier/stock RPCs
-- Part of Sprint 1B critical money flow fixes.

CREATE TABLE IF NOT EXISTS stripe_event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT,
  status TEXT DEFAULT 'processing',
  payload JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE stripe_event_log DISABLE ROW LEVEL SECURITY;

-- Atomic supplier totals increment (fixes read-modify-write race condition)
CREATE OR REPLACE FUNCTION increment_supplier_totals(p_supplier_id UUID, p_sales DECIMAL, p_orders INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE suppliers
  SET total_sales = COALESCE(total_sales, 0) + p_sales,
      total_orders = COALESCE(total_orders, 0) + p_orders
  WHERE id = p_supplier_id;
END;
$$ LANGUAGE plpgsql;

-- Atomic product stock decrement with row-level lock (fixes oversell race)
CREATE OR REPLACE FUNCTION decrement_product_stock(p_product_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_stock INTEGER;
BEGIN
  SELECT stock_quantity INTO current_stock FROM products WHERE id = p_product_id FOR UPDATE;
  IF current_stock IS NULL THEN
    RETURN TRUE; -- no stock tracking
  END IF;
  IF current_stock < p_quantity THEN
    RETURN FALSE;
  END IF;
  UPDATE products SET stock_quantity = stock_quantity - p_quantity WHERE id = p_product_id;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

NOTIFY pgrst, 'reload schema';
