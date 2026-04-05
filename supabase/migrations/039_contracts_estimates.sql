-- Contracts & Commercial Terms
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID,
  party_type TEXT NOT NULL, -- supplier, partner, ambassador, investor
  party_name TEXT NOT NULL,
  party_email TEXT,
  contract_type TEXT DEFAULT 'supplier', -- supplier, partner, ambassador, trade, service
  title TEXT NOT NULL,
  description TEXT,
  commission_rate DECIMAL(5,2), -- percentage
  payment_terms TEXT, -- net_30, net_60, upfront, on_delivery
  territory TEXT[], -- countries/regions covered
  exclusivity BOOLEAN DEFAULT false,
  minimum_order_value DECIMAL(12,2),
  discount_rate DECIMAL(5,2), -- member discount %
  terms_json JSONB DEFAULT '{}', -- flexible additional terms
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft', -- draft, pending_signature, active, expired, terminated
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Estimates / Quotations
CREATE TABLE IF NOT EXISTS estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_number TEXT NOT NULL,
  from_id UUID,
  from_type TEXT NOT NULL, -- supplier, admin
  from_name TEXT NOT NULL,
  to_id UUID,
  to_type TEXT NOT NULL, -- farmer, member, cooperative
  to_name TEXT NOT NULL,
  to_email TEXT,
  to_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]', -- [{name, description, quantity, unit, unit_price, total}]
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft', -- draft, sent, viewed, accepted, rejected, expired, converted
  valid_until DATE,
  notes TEXT,
  terms TEXT,
  converted_order_id UUID, -- links to order if accepted
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Supplier inventory tracking
CREATE TABLE IF NOT EXISTS supplier_inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID NOT NULL,
  product_id UUID,
  product_name TEXT NOT NULL,
  sku TEXT,
  quantity_on_hand DECIMAL(12,2) DEFAULT 0,
  quantity_reserved DECIMAL(12,2) DEFAULT 0,
  quantity_available DECIMAL(12,2) DEFAULT 0,
  reorder_point DECIMAL(12,2) DEFAULT 10,
  unit TEXT DEFAULT 'units',
  cost_price DECIMAL(12,2),
  warehouse_location TEXT,
  batch_number TEXT,
  expiry_date DATE,
  last_restocked_at TIMESTAMPTZ,
  status TEXT DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock, discontinued
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_contracts_party ON contracts(party_id, party_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_estimates_from ON estimates(from_id);
CREATE INDEX IF NOT EXISTS idx_estimates_to ON estimates(to_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_supplier_inventory_supplier ON supplier_inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_inventory_product ON supplier_inventory(product_id);

-- Disable RLS
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_inventory DISABLE ROW LEVEL SECURITY;
GRANT ALL ON contracts TO anon;
GRANT ALL ON contracts TO authenticated;
GRANT ALL ON estimates TO anon;
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON supplier_inventory TO anon;
GRANT ALL ON supplier_inventory TO authenticated;
