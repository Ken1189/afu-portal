-- ============================================================================
-- AFU PORTAL — MIGRATION 002: PLATFORM EXPANSION TABLES
-- Phase 1: Farm data, education, insurance, equipment, livestock,
--          logistics, market, cooperatives, contracts, sustainability,
--          advertisements, exports
-- ============================================================================

-- ============================================================================
-- ADDITIONAL ENUMS
-- ============================================================================

CREATE TYPE crop_stage AS ENUM (
  'planning', 'planted', 'germinating', 'growing', 'flowering',
  'fruiting', 'harvesting', 'post_harvest', 'fallow'
);

CREATE TYPE booking_status AS ENUM (
  'pending', 'confirmed', 'in_use', 'returned', 'cancelled'
);

CREATE TYPE claim_status AS ENUM (
  'submitted', 'under_review', 'approved', 'rejected', 'paid'
);

CREATE TYPE shipment_status AS ENUM (
  'booked', 'picked_up', 'in_transit', 'customs', 'delivered', 'cancelled'
);

CREATE TYPE contract_status AS ENUM (
  'draft', 'active', 'fulfilled', 'expired', 'cancelled'
);

CREATE TYPE ad_status AS ENUM (
  'draft', 'active', 'paused', 'completed', 'cancelled'
);

CREATE TYPE verification_status AS ENUM (
  'pending', 'verified', 'rejected'
);

-- ============================================================================
-- FARM PLOTS
-- ============================================================================

CREATE TABLE farm_plots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  size_ha         DECIMAL(10,2),
  crop            TEXT,
  variety         TEXT,
  stage           crop_stage DEFAULT 'planning',
  planting_date   DATE,
  expected_harvest DATE,
  health_score    INTEGER DEFAULT 0 CHECK (health_score >= 0 AND health_score <= 100),
  soil_ph         DECIMAL(3,1),
  location        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farm_plots_member ON farm_plots(member_id);

-- ============================================================================
-- FARM ACTIVITIES
-- ============================================================================

CREATE TABLE farm_activities (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plot_id         UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL, -- planting, watering, fertilizing, spraying, harvest, etc.
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  notes           TEXT,
  photo_url       TEXT,
  cost            DECIMAL(10,2) DEFAULT 0,
  currency        TEXT DEFAULT 'USD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farm_activities_member ON farm_activities(member_id);
CREATE INDEX idx_farm_activities_plot ON farm_activities(plot_id);

-- ============================================================================
-- FARM TRANSACTIONS (income/expense tracking)
-- ============================================================================

CREATE TABLE farm_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL, -- income, expense
  category        TEXT NOT NULL, -- seeds, fertilizer, labor, fuel, sales, subsidy, etc.
  amount          DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  plot_id         UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farm_transactions_member ON farm_transactions(member_id);

-- ============================================================================
-- COURSES (education/training)
-- ============================================================================

CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL, -- agronomy, finance, technology, business, compliance
  difficulty      TEXT DEFAULT 'beginner', -- beginner, intermediate, advanced
  duration_minutes INTEGER DEFAULT 60,
  modules_count   INTEGER DEFAULT 1,
  instructor      TEXT,
  rating          DECIMAL(3,2) DEFAULT 0,
  image_url       TEXT,
  topics          TEXT[],
  published       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COURSE MODULES
-- ============================================================================

CREATE TABLE course_modules (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  video_url       TEXT,
  duration_minutes INTEGER DEFAULT 10,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_modules_course ON course_modules(course_id);

-- ============================================================================
-- COURSE ENROLLMENTS
-- ============================================================================

CREATE TABLE course_enrollments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at    TIMESTAMPTZ,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, member_id)
);

CREATE INDEX idx_enrollments_member ON course_enrollments(member_id);

-- ============================================================================
-- INSURANCE PRODUCTS
-- ============================================================================

CREATE TABLE insurance_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL, -- crop, livestock, asset, medical, trade
  description     TEXT,
  coverage_details JSONB,
  premium_range   JSONB, -- { min: number, max: number, currency: string }
  deductible_percent DECIMAL(5,2) DEFAULT 5,
  waiting_period_days INTEGER DEFAULT 30,
  eligibility     TEXT[],
  active          BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INSURANCE POLICIES
-- ============================================================================

CREATE TABLE insurance_policies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID NOT NULL REFERENCES insurance_products(id),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  policy_number   TEXT NOT NULL UNIQUE,
  status          TEXT NOT NULL DEFAULT 'active', -- active, expired, cancelled, claimed
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  premium         DECIMAL(10,2) NOT NULL,
  coverage_amount DECIMAL(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_insurance_policies_member ON insurance_policies(member_id);

-- ============================================================================
-- INSURANCE CLAIMS
-- ============================================================================

CREATE TABLE insurance_claims (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  policy_id       UUID NOT NULL REFERENCES insurance_policies(id),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status          claim_status NOT NULL DEFAULT 'submitted',
  claim_amount    DECIMAL(12,2) NOT NULL,
  approved_amount DECIMAL(12,2),
  description     TEXT,
  evidence_urls   TEXT[],
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at     TIMESTAMPTZ,
  reviewed_by     UUID REFERENCES profiles(id)
);

CREATE INDEX idx_insurance_claims_member ON insurance_claims(member_id);

-- ============================================================================
-- EQUIPMENT
-- ============================================================================

CREATE TABLE equipment (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL, -- tractor, drone, irrigation, harvester, sprayer, etc.
  description     TEXT,
  daily_rate      DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  owner_id        UUID REFERENCES profiles(id),
  location        TEXT,
  country         TEXT,
  status          TEXT DEFAULT 'available', -- available, booked, maintenance, retired
  image_url       TEXT,
  specifications  JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_status ON equipment(status);

-- ============================================================================
-- EQUIPMENT BOOKINGS
-- ============================================================================

CREATE TABLE equipment_bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id    UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_cost      DECIMAL(10,2) NOT NULL,
  status          booking_status NOT NULL DEFAULT 'pending',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_member ON equipment_bookings(member_id);
CREATE INDEX idx_bookings_equipment ON equipment_bookings(equipment_id);

-- ============================================================================
-- LIVESTOCK
-- ============================================================================

CREATE TABLE livestock (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL, -- cattle, goat, sheep, poultry, pig, etc.
  breed           TEXT,
  count           INTEGER NOT NULL DEFAULT 1,
  tag_id          TEXT,
  health_status   TEXT DEFAULT 'healthy', -- healthy, sick, recovering, quarantined
  location        TEXT,
  value_estimate  DECIMAL(10,2),
  date_acquired   DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_livestock_member ON livestock(member_id);

-- ============================================================================
-- LIVESTOCK HEALTH RECORDS
-- ============================================================================

CREATE TABLE livestock_health_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livestock_id    UUID NOT NULL REFERENCES livestock(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL, -- vaccination, treatment, checkup, birth, death
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  vet_name        TEXT,
  cost            DECIMAL(10,2) DEFAULT 0,
  next_due_date   DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_records_livestock ON livestock_health_records(livestock_id);

-- ============================================================================
-- SHIPMENTS (logistics)
-- ============================================================================

CREATE TABLE shipments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  origin          TEXT NOT NULL,
  destination     TEXT NOT NULL,
  cargo_type      TEXT,
  weight_kg       DECIMAL(10,2),
  status          shipment_status NOT NULL DEFAULT 'booked',
  carrier         TEXT,
  tracking_number TEXT,
  pickup_date     DATE,
  delivery_date   DATE,
  cost            DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shipments_member ON shipments(member_id);
CREATE INDEX idx_shipments_status ON shipments(status);

-- ============================================================================
-- MARKET PRICES
-- ============================================================================

CREATE TABLE market_prices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commodity       TEXT NOT NULL,
  market_location TEXT,
  country         TEXT,
  price           DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  unit            TEXT DEFAULT 'kg',
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  source          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_prices_commodity ON market_prices(commodity);
CREATE INDEX idx_market_prices_date ON market_prices(date DESC);

-- ============================================================================
-- MARKET PRICE ALERTS
-- ============================================================================

CREATE TABLE market_price_alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  commodity       TEXT NOT NULL,
  target_price    DECIMAL(10,2) NOT NULL,
  direction       TEXT NOT NULL DEFAULT 'above', -- above, below
  active          BOOLEAN DEFAULT true,
  triggered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_price_alerts_member ON market_price_alerts(member_id);

-- ============================================================================
-- COOPERATIVES
-- ============================================================================

CREATE TABLE cooperatives (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  country         TEXT NOT NULL,
  region          TEXT,
  member_count    INTEGER DEFAULT 0,
  established_date DATE,
  description     TEXT,
  contact_email   TEXT,
  contact_phone   TEXT,
  status          TEXT DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- COOPERATIVE MEMBERS
-- ============================================================================

CREATE TABLE cooperative_members (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cooperative_id  UUID NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member', -- member, treasurer, secretary, chairperson
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperative_id, member_id)
);

CREATE INDEX idx_coop_members_member ON cooperative_members(member_id);

-- ============================================================================
-- OFFTAKE CONTRACTS
-- ============================================================================

CREATE TABLE offtake_contracts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  buyer_name      TEXT NOT NULL,
  commodity       TEXT NOT NULL,
  quantity        DECIMAL(12,2) NOT NULL,
  unit            TEXT DEFAULT 'kg',
  price_per_unit  DECIMAL(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  delivery_date   DATE,
  status          contract_status NOT NULL DEFAULT 'draft',
  contract_url    TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_contracts_member ON offtake_contracts(member_id);
CREATE INDEX idx_contracts_status ON offtake_contracts(status);

-- ============================================================================
-- CARBON CREDITS (sustainability)
-- ============================================================================

CREATE TABLE carbon_credits (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  project_type    TEXT NOT NULL, -- reforestation, soil_carbon, methane_reduction, etc.
  credits_earned  DECIMAL(10,2) NOT NULL DEFAULT 0,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  vintage_year    INTEGER,
  registry        TEXT,
  value_usd       DECIMAL(10,2),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_carbon_credits_member ON carbon_credits(member_id);

-- ============================================================================
-- ADVERTISEMENTS (supplier)
-- ============================================================================

CREATE TABLE advertisements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id     UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  image_url       TEXT,
  target_countries TEXT[],
  budget          DECIMAL(10,2) DEFAULT 0,
  spent           DECIMAL(10,2) DEFAULT 0,
  impressions     INTEGER DEFAULT 0,
  clicks          INTEGER DEFAULT 0,
  status          ad_status NOT NULL DEFAULT 'draft',
  start_date      DATE,
  end_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ads_supplier ON advertisements(supplier_id);
CREATE INDEX idx_ads_status ON advertisements(status);

-- ============================================================================
-- EXPORT DOCUMENTS
-- ============================================================================

CREATE TABLE export_documents (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id           UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  document_type       TEXT NOT NULL, -- certificate_of_origin, phytosanitary, invoice, bill_of_lading
  file_url            TEXT,
  status              TEXT DEFAULT 'draft', -- draft, submitted, approved, rejected
  country_of_origin   TEXT,
  destination_country TEXT,
  commodity           TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_export_docs_member ON export_documents(member_id);

-- ============================================================================
-- REFERRAL REWARDS (if not already created)
-- ============================================================================

CREATE TABLE IF NOT EXISTS referral_rewards (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id     UUID NOT NULL REFERENCES profiles(id),
  referred_id     UUID NOT NULL REFERENCES profiles(id),
  purchase_amount DECIMAL(12,2),
  reward_amount   DECIMAL(12,2),
  reward_type     TEXT DEFAULT 'edm',
  status          TEXT DEFAULT 'pending', -- pending, paid, cancelled
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_rewards(referrer_id);

-- ============================================================================
-- PLATFORM SETTINGS (if not already created)
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  UUID REFERENCES profiles(id),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- ENABLE RLS ON ALL NEW TABLES
-- ============================================================================

ALTER TABLE farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE offtake_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_documents ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES — Members see own data, admins see all
-- ============================================================================

-- Farm plots
CREATE POLICY "Members view own plots" ON farm_plots FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_plots.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own plots" ON farm_plots FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_plots.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all plots" ON farm_plots FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Farm activities
CREATE POLICY "Members view own activities" ON farm_activities FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_activities.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own activities" ON farm_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_activities.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all activities" ON farm_activities FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Farm transactions
CREATE POLICY "Members view own transactions" ON farm_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_transactions.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own transactions" ON farm_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_transactions.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all transactions" ON farm_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Courses (public read)
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT
  USING (published = true);
CREATE POLICY "Admins manage courses" ON courses FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Course modules (public read via course)
CREATE POLICY "Anyone can view modules" ON course_modules FOR SELECT USING (true);
CREATE POLICY "Admins manage modules" ON course_modules FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Course enrollments
CREATE POLICY "Members view own enrollments" ON course_enrollments FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = course_enrollments.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own enrollments" ON course_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = course_enrollments.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all enrollments" ON course_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Insurance products (public read)
CREATE POLICY "Anyone can view insurance products" ON insurance_products FOR SELECT
  USING (active = true);
CREATE POLICY "Admins manage insurance products" ON insurance_products FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Insurance policies
CREATE POLICY "Members view own policies" ON insurance_policies FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = insurance_policies.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all policies" ON insurance_policies FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Insurance claims
CREATE POLICY "Members view own claims" ON insurance_claims FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = insurance_claims.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members submit claims" ON insurance_claims FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = insurance_claims.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all claims" ON insurance_claims FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Equipment (public read)
CREATE POLICY "Anyone can view available equipment" ON equipment FOR SELECT
  USING (status = 'available');
CREATE POLICY "Admins manage equipment" ON equipment FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Equipment bookings
CREATE POLICY "Members view own bookings" ON equipment_bookings FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = equipment_bookings.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members create bookings" ON equipment_bookings FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = equipment_bookings.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all bookings" ON equipment_bookings FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Livestock
CREATE POLICY "Members view own livestock" ON livestock FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = livestock.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own livestock" ON livestock FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = livestock.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all livestock" ON livestock FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Livestock health records
CREATE POLICY "Members view own health records" ON livestock_health_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM livestock l JOIN members m ON m.id = l.member_id
    WHERE l.id = livestock_health_records.livestock_id AND m.profile_id = auth.uid()
  ));
CREATE POLICY "Admins manage all health records" ON livestock_health_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Shipments
CREATE POLICY "Members view own shipments" ON shipments FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = shipments.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own shipments" ON shipments FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = shipments.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all shipments" ON shipments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Market prices (public read)
CREATE POLICY "Anyone can view market prices" ON market_prices FOR SELECT USING (true);
CREATE POLICY "Admins manage market prices" ON market_prices FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Market price alerts
CREATE POLICY "Members view own alerts" ON market_price_alerts FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = market_price_alerts.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own alerts" ON market_price_alerts FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = market_price_alerts.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all alerts" ON market_price_alerts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Cooperatives (public read)
CREATE POLICY "Anyone can view cooperatives" ON cooperatives FOR SELECT USING (true);
CREATE POLICY "Admins manage cooperatives" ON cooperatives FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Cooperative members
CREATE POLICY "Members view own memberships" ON cooperative_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = cooperative_members.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage cooperative members" ON cooperative_members FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Offtake contracts
CREATE POLICY "Members view own contracts" ON offtake_contracts FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = offtake_contracts.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own contracts" ON offtake_contracts FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = offtake_contracts.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all contracts" ON offtake_contracts FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Carbon credits
CREATE POLICY "Members view own credits" ON carbon_credits FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = carbon_credits.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all credits" ON carbon_credits FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Advertisements
CREATE POLICY "Anyone can view active ads" ON advertisements FOR SELECT
  USING (status = 'active');
CREATE POLICY "Supplier owners manage own ads" ON advertisements FOR ALL
  USING (EXISTS (SELECT 1 FROM suppliers WHERE id = advertisements.supplier_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all ads" ON advertisements FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Export documents
CREATE POLICY "Members view own export docs" ON export_documents FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = export_documents.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own export docs" ON export_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = export_documents.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all export docs" ON export_documents FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- ============================================================================
-- UPDATE TRIGGERS (auto-update updated_at)
-- ============================================================================

CREATE TRIGGER update_farm_plots_updated_at BEFORE UPDATE ON farm_plots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_insurance_products_updated_at BEFORE UPDATE ON insurance_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_insurance_policies_updated_at BEFORE UPDATE ON insurance_policies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_equipment_bookings_updated_at BEFORE UPDATE ON equipment_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON livestock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_cooperatives_updated_at BEFORE UPDATE ON cooperatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON offtake_contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_carbon_credits_updated_at BEFORE UPDATE ON carbon_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON advertisements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_export_docs_updated_at BEFORE UPDATE ON export_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- GENERATE POLICY NUMBER SEQUENCE
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS policy_number_seq START 1000;

CREATE OR REPLACE FUNCTION generate_policy_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.policy_number = 'POL-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || LPAD(nextval('policy_number_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_policy_number BEFORE INSERT ON insurance_policies
  FOR EACH ROW WHEN (NEW.policy_number IS NULL OR NEW.policy_number = '')
  EXECUTE FUNCTION generate_policy_number();

-- ============================================================================
-- DONE — 22 new tables, RLS on all, triggers on all with updated_at
-- ============================================================================
