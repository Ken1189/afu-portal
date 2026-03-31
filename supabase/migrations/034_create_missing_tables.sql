-- ============================================================
-- 034: Create ALL missing tables referenced in the codebase
-- 43 tables that code queries but don't exist in the DB
-- ============================================================

-- Warehouse
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  location TEXT,
  country TEXT,
  capacity_tons DECIMAL(10,2) DEFAULT 0,
  used_tons DECIMAL(10,2) DEFAULT 0,
  manager_id UUID,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warehouse_read" ON warehouses FOR SELECT USING (true);
CREATE POLICY "warehouse_admin" ON warehouses FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS warehouse_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES warehouses(id),
  farmer_id UUID,
  commodity TEXT NOT NULL,
  quantity_tons DECIMAL(10,2) NOT NULL,
  grade TEXT DEFAULT 'A',
  receipt_number TEXT,
  status TEXT DEFAULT 'stored',
  dispatch_status TEXT DEFAULT 'stored',
  dispatch_destination TEXT,
  dispatch_requested_date DATE,
  dispatch_date DATE,
  assigned_grader TEXT,
  dispatch_notes TEXT,
  financing_status TEXT DEFAULT 'none',
  financing_amount DECIMAL(12,2),
  value_usd DECIMAL(12,2),
  stored_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE warehouse_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receipt_read" ON warehouse_receipts FOR SELECT USING (true);
CREATE POLICY "receipt_insert" ON warehouse_receipts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "receipt_admin" ON warehouse_receipts FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS quality_inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID REFERENCES warehouse_receipts(id),
  inspector_id UUID,
  grade TEXT,
  moisture_pct DECIMAL(5,2),
  foreign_matter_pct DECIMAL(5,2),
  notes TEXT,
  status TEXT DEFAULT 'pending',
  inspected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE quality_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "inspection_read" ON quality_inspections FOR SELECT USING (true);
CREATE POLICY "inspection_admin" ON quality_inspections FOR ALL USING (is_admin());

-- Messaging
CREATE TABLE IF NOT EXISTS message_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT DEFAULT 'sms',
  status TEXT DEFAULT 'draft',
  target_audience TEXT,
  target_countries TEXT[],
  message_body TEXT,
  template_id UUID,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipient_count INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE message_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaign_admin" ON message_campaigns FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  channel TEXT DEFAULT 'sms',
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "template_read" ON message_templates FOR SELECT USING (true);
CREATE POLICY "template_admin" ON message_templates FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  campaign_id UUID,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sms_admin" ON sms_messages FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  template_name TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "whatsapp_admin" ON whatsapp_messages FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS ussd_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  session_id TEXT,
  menu_path TEXT,
  input TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE ussd_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ussd_admin" ON ussd_sessions FOR ALL USING (is_admin());

-- Trading
CREATE TABLE IF NOT EXISTS trade_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  commodity TEXT NOT NULL,
  type TEXT DEFAULT 'sell',
  quantity DECIMAL(10,2),
  unit TEXT DEFAULT 'tons',
  price_per_unit DECIMAL(12,2),
  total_value DECIMAL(12,2),
  status TEXT DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE trade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "trade_read" ON trade_orders FOR SELECT USING (true);
CREATE POLICY "trade_insert" ON trade_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "trade_admin" ON trade_orders FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS trade_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES trade_orders(id),
  buyer_id UUID,
  offered_price DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE trade_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quotes_read" ON trade_quotes FOR SELECT USING (true);
CREATE POLICY "quotes_admin" ON trade_quotes FOR ALL USING (is_admin());

-- Carbon
CREATE TABLE IF NOT EXISTS carbon_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  country TEXT,
  status TEXT DEFAULT 'active',
  total_credits DECIMAL(12,2) DEFAULT 0,
  verified_credits DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE carbon_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carbon_proj_read" ON carbon_projects FOR SELECT USING (true);
CREATE POLICY "carbon_proj_admin" ON carbon_projects FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS carbon_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES carbon_projects(id),
  verifier TEXT,
  status TEXT DEFAULT 'pending',
  credits_verified DECIMAL(12,2),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE carbon_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carbon_ver_read" ON carbon_verifications FOR SELECT USING (true);
CREATE POLICY "carbon_ver_admin" ON carbon_verifications FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS carbon_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES carbon_projects(id),
  member_id UUID,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE carbon_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carbon_enr_read" ON carbon_enrollments FOR SELECT USING (true);
CREATE POLICY "carbon_enr_admin" ON carbon_enrollments FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS carbon_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID,
  credits DECIMAL(12,2),
  price_per_credit DECIMAL(8,2),
  total_usd DECIMAL(12,2),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE carbon_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "carbon_pur_read" ON carbon_purchases FOR SELECT USING (true);
CREATE POLICY "carbon_pur_admin" ON carbon_purchases FOR ALL USING (is_admin());

-- Insurance
CREATE TABLE IF NOT EXISTS parametric_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT DEFAULT 'rainfall',
  coverage_amount DECIMAL(12,2),
  premium DECIMAL(12,2),
  threshold_value DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE parametric_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "param_prod_read" ON parametric_products FOR SELECT USING (true);
CREATE POLICY "param_prod_admin" ON parametric_products FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS parametric_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES parametric_products(id),
  member_id UUID,
  status TEXT DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE parametric_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "param_pol_read" ON parametric_policies FOR SELECT USING (true);
CREATE POLICY "param_pol_admin" ON parametric_policies FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS parametric_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES parametric_policies(id),
  trigger_type TEXT,
  measured_value DECIMAL(10,2),
  threshold DECIMAL(10,2),
  triggered BOOLEAN DEFAULT false,
  payout_amount DECIMAL(12,2),
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE parametric_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "param_trig_admin" ON parametric_triggers FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS insurance_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  product_id UUID,
  coverage_amount DECIMAL(12,2),
  premium_estimate DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE insurance_quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quote_read" ON insurance_quotes FOR SELECT USING (true);
CREATE POLICY "quote_insert" ON insurance_quotes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "quote_admin" ON insurance_quotes FOR ALL USING (is_admin());

-- Supplier
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID,
  reviewer_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "review_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "review_insert" ON reviews FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "review_admin" ON reviews FOR ALL USING (is_admin());

-- Country/Location
CREATE TABLE IF NOT EXISTS country_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT UNIQUE NOT NULL,
  country_name TEXT NOT NULL,
  description TEXT,
  key_crops TEXT[],
  highlights TEXT[],
  currency TEXT DEFAULT 'USD',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE country_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "country_read" ON country_settings FOR SELECT USING (true);
CREATE POLICY "country_admin" ON country_settings FOR ALL USING (is_admin());

-- Misc
CREATE TABLE IF NOT EXISTS commodity_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity TEXT NOT NULL,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  unit TEXT DEFAULT 'ton',
  market TEXT,
  country TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE commodity_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_read" ON commodity_prices FOR SELECT USING (true);
CREATE POLICY "price_admin" ON commodity_prices FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS equipment_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  equipment_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, equipment_id)
);
ALTER TABLE equipment_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav_read" ON equipment_favorites FOR SELECT USING (true);
CREATE POLICY "fav_insert" ON equipment_favorites FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "fav_delete" ON equipment_favorites FOR DELETE USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS receipt_financing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID,
  amount DECIMAL(12,2),
  interest_rate DECIMAL(5,2),
  status TEXT DEFAULT 'pending',
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE receipt_financing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "financing_read" ON receipt_financing FOR SELECT USING (true);
CREATE POLICY "financing_admin" ON receipt_financing FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS investor_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID,
  opportunity_id UUID,
  amount DECIMAL(12,2),
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE investor_interests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interest_read" ON investor_interests FOR SELECT USING (true);
CREATE POLICY "interest_insert" ON investor_interests FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "interest_admin" ON investor_interests FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  name TEXT NOT NULL,
  type TEXT,
  file_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doc_read" ON documents FOR SELECT USING (true);
CREATE POLICY "doc_insert" ON documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "doc_admin" ON documents FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS compliance_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID,
  type TEXT,
  description TEXT,
  severity TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "compliance_admin" ON compliance_issues FOR ALL USING (is_admin());

CREATE TABLE IF NOT EXISTS weather_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT,
  country TEXT,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  rainfall_mm DECIMAL(8,2),
  recorded_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE weather_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weather_read" ON weather_data FOR SELECT USING (true);
