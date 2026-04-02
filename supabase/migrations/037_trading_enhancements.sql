-- Trading system enhancements
-- Add buy/sell spread to commodity prices
ALTER TABLE commodity_prices ADD COLUMN IF NOT EXISTS buy_price DECIMAL(10,2);
ALTER TABLE commodity_prices ADD COLUMN IF NOT EXISTS sell_price DECIMAL(10,2);

-- Add settlement and commission tracking to trade orders
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2);
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS settlement_status TEXT DEFAULT 'pending';
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS settlement_date TIMESTAMPTZ;
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS counterparty_name TEXT;

-- Inventory positions table for AFU's own holdings
CREATE TABLE IF NOT EXISTS inventory_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commodity TEXT NOT NULL,
  country TEXT,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'tonnes',
  avg_cost DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  warehouse_location TEXT,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE inventory_positions DISABLE ROW LEVEL SECURITY;
GRANT ALL ON inventory_positions TO anon;
GRANT ALL ON inventory_positions TO authenticated;
