-- AFU MIGRATIONS 036-039 — PASTE INTO SUPABASE SQL EDITOR

-- 036: Ambassador regions
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS regions TEXT[];
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS promotion_plan TEXT;

-- 037: Trading enhancements
ALTER TABLE commodity_prices ADD COLUMN IF NOT EXISTS buy_price DECIMAL(10,2);
ALTER TABLE commodity_prices ADD COLUMN IF NOT EXISTS sell_price DECIMAL(10,2);
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS commission_amount DECIMAL(10,2);
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS settlement_status TEXT DEFAULT 'pending';
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS settlement_date TIMESTAMPTZ;
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS counterparty_name TEXT;
ALTER TABLE trade_orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'buy';

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

-- 038: Unified Inbox + Automations
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_type TEXT DEFAULT 'lead',
  profile_id UUID,
  subject TEXT,
  status TEXT DEFAULT 'open',
  assigned_to UUID,
  priority TEXT DEFAULT 'normal',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  unread_count INTEGER DEFAULT 1,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL DEFAULT 'inbound',
  channel TEXT DEFAULT 'email',
  sender_name TEXT,
  sender_email TEXT,
  sender_phone TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  html_body TEXT,
  attachments JSONB,
  status TEXT DEFAULT 'sent',
  message_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  trigger_type TEXT NOT NULL,
  trigger_config JSONB DEFAULT '{}',
  action_type TEXT NOT NULL,
  action_config JSONB DEFAULT '{}',
  delay_minutes INTEGER DEFAULT 0,
  created_by UUID,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_contact_email ON conversations(contact_email);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conv_messages_conv_id ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_messages_created ON conversation_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active);

ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
GRANT ALL ON conversations TO anon;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON conversation_messages TO anon;
GRANT ALL ON conversation_messages TO authenticated;
GRANT ALL ON automation_rules TO anon;
GRANT ALL ON automation_rules TO authenticated;

-- 039: Contracts + Estimates + Supplier Inventory
CREATE TABLE IF NOT EXISTS contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id UUID,
  party_type TEXT NOT NULL,
  party_name TEXT NOT NULL,
  party_email TEXT,
  contract_type TEXT DEFAULT 'supplier',
  title TEXT NOT NULL,
  description TEXT,
  commission_rate DECIMAL(5,2),
  payment_terms TEXT,
  territory TEXT[],
  exclusivity BOOLEAN DEFAULT false,
  minimum_order_value DECIMAL(12,2),
  discount_rate DECIMAL(5,2),
  terms_json JSONB DEFAULT '{}',
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  signed_at TIMESTAMPTZ,
  signed_by TEXT,
  created_by UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS estimates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  estimate_number TEXT NOT NULL,
  from_id UUID,
  from_type TEXT NOT NULL DEFAULT 'supplier',
  from_name TEXT NOT NULL,
  to_id UUID,
  to_type TEXT NOT NULL DEFAULT 'farmer',
  to_name TEXT NOT NULL,
  to_email TEXT,
  to_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal DECIMAL(12,2) DEFAULT 0,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  tax_amount DECIMAL(12,2) DEFAULT 0,
  discount_rate DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  valid_until DATE,
  notes TEXT,
  terms TEXT,
  converted_order_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

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
  status TEXT DEFAULT 'in_stock',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contracts_party ON contracts(party_id, party_type);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_estimates_from ON estimates(from_id);
CREATE INDEX IF NOT EXISTS idx_estimates_to ON estimates(to_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_supplier_inventory_supplier ON supplier_inventory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_inventory_product ON supplier_inventory(product_id);

ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE estimates DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_inventory DISABLE ROW LEVEL SECURITY;
GRANT ALL ON contracts TO anon;
GRANT ALL ON contracts TO authenticated;
GRANT ALL ON estimates TO anon;
GRANT ALL ON estimates TO authenticated;
GRANT ALL ON supplier_inventory TO anon;
GRANT ALL ON supplier_inventory TO authenticated;
