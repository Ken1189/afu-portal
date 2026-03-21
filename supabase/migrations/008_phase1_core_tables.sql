-- ============================================================================
-- AFU PORTAL — MIGRATION 008: PHASE 1 CORE TABLES
-- Drops and recreates core tables from 002 with updated schemas, richer
-- columns, proper RLS, indexes, triggers, and production seed data.
-- Tables: farm_plots, farm_activities, farm_transactions, courses,
--         course_modules, course_enrollments, equipment, equipment_bookings,
--         livestock, livestock_health_records, market_prices, cooperatives,
--         cooperative_members
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP EXISTING TABLES (reverse dependency order)
-- ============================================================================

DROP TABLE IF EXISTS cooperative_members CASCADE;
DROP TABLE IF EXISTS cooperatives CASCADE;
DROP TABLE IF EXISTS market_prices CASCADE;
DROP TABLE IF EXISTS livestock_health_records CASCADE;
DROP TABLE IF EXISTS livestock CASCADE;
DROP TABLE IF EXISTS equipment_bookings CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS farm_transactions CASCADE;
DROP TABLE IF EXISTS farm_activities CASCADE;
DROP TABLE IF EXISTS farm_plots CASCADE;

-- ============================================================================
-- STEP 2: CREATE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. FARM PLOTS — Individual farm plots/fields
-- ----------------------------------------------------------------------------

CREATE TABLE farm_plots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  size_ha         DECIMAL(10,2),
  crop            TEXT,
  variety         TEXT,
  stage           TEXT DEFAULT 'planning',  -- planning, planted, growing, flowering, harvesting, fallow
  planting_date   DATE,
  expected_harvest DATE,
  health_score    INTEGER CHECK (health_score BETWEEN 0 AND 100),
  soil_ph         DECIMAL(3,1),
  location        TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farm_plots_member ON farm_plots(member_id);
CREATE INDEX idx_farm_plots_stage ON farm_plots(stage);
CREATE INDEX idx_farm_plots_crop ON farm_plots(crop);

-- ----------------------------------------------------------------------------
-- 2. FARM ACTIVITIES — Activity/journal log for farms
-- ----------------------------------------------------------------------------

CREATE TABLE farm_activities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id         UUID REFERENCES farm_plots(id) ON DELETE SET NULL,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,  -- planting, watering, fertilizing, spraying, harvesting, scouting, maintenance
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  notes           TEXT,
  photo_url       TEXT,
  cost            DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farm_activities_member ON farm_activities(member_id);
CREATE INDEX idx_farm_activities_plot ON farm_activities(plot_id);
CREATE INDEX idx_farm_activities_date ON farm_activities(date DESC);

-- ----------------------------------------------------------------------------
-- 3. FARM TRANSACTIONS — Financial records per farm
-- ----------------------------------------------------------------------------

CREATE TABLE farm_transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,      -- income, expense
  category        TEXT NOT NULL,      -- seeds, fertilizer, labor, equipment, sales, subsidy, loan_disbursement
  amount          DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farm_transactions_member ON farm_transactions(member_id);
CREATE INDEX idx_farm_transactions_date ON farm_transactions(date DESC);
CREATE INDEX idx_farm_transactions_type ON farm_transactions(type);

-- ----------------------------------------------------------------------------
-- 4. COURSES — Training/education courses
-- ----------------------------------------------------------------------------

CREATE TABLE courses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  category        TEXT,               -- agronomy, finance, technology, livestock, marketing, compliance
  difficulty      TEXT DEFAULT 'beginner',  -- beginner, intermediate, advanced
  duration_minutes INTEGER,
  modules_count   INTEGER DEFAULT 0,
  instructor      TEXT,
  instructor_avatar TEXT,
  thumbnail_url   TEXT,
  rating          DECIMAL(3,2) DEFAULT 0,
  enrollment_count INTEGER DEFAULT 0,
  is_published    BOOLEAN DEFAULT true,
  country_scope   TEXT[] DEFAULT '{}',  -- empty = all countries
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_published ON courses(is_published) WHERE is_published = true;

-- ----------------------------------------------------------------------------
-- 5. COURSE MODULES — Individual modules within a course
-- ----------------------------------------------------------------------------

CREATE TABLE course_modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT,
  order_index     INTEGER NOT NULL DEFAULT 0,
  video_url       TEXT,
  duration_minutes INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_modules_course ON course_modules(course_id);

-- ----------------------------------------------------------------------------
-- 6. COURSE ENROLLMENTS — Member enrollment + progress
-- ----------------------------------------------------------------------------

CREATE TABLE course_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  completed_at    TIMESTAMPTZ,
  certificate_url TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, member_id)
);

CREATE INDEX idx_course_enrollments_member ON course_enrollments(member_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);

-- ----------------------------------------------------------------------------
-- 7. EQUIPMENT — Available farm equipment for rental
-- ----------------------------------------------------------------------------

CREATE TABLE equipment (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT,               -- tractor, plough, harvester, sprayer, irrigator, drone, processor
  description     TEXT,
  daily_rate      DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  owner_id        UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  location        TEXT,
  country         TEXT,
  status          TEXT DEFAULT 'available',  -- available, rented, maintenance, retired
  photo_url       TEXT,
  specifications  JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_country ON equipment(country);
CREATE INDEX idx_equipment_owner ON equipment(owner_id);

-- ----------------------------------------------------------------------------
-- 8. EQUIPMENT BOOKINGS — Equipment rental bookings
-- ----------------------------------------------------------------------------

CREATE TABLE equipment_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id    UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  total_cost      DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'pending',  -- pending, confirmed, active, completed, cancelled
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_equipment_bookings_member ON equipment_bookings(member_id);
CREATE INDEX idx_equipment_bookings_equipment ON equipment_bookings(equipment_id);
CREATE INDEX idx_equipment_bookings_status ON equipment_bookings(status);

-- ----------------------------------------------------------------------------
-- 9. LIVESTOCK — Livestock records
-- ----------------------------------------------------------------------------

CREATE TABLE livestock (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,       -- cattle, goats, sheep, poultry, pigs, fish, bees
  breed           TEXT,
  count           INTEGER NOT NULL DEFAULT 1,
  health_status   TEXT DEFAULT 'healthy',  -- healthy, sick, recovering, quarantine
  location        TEXT,
  value_estimate  DECIMAL(12,2),
  currency        TEXT DEFAULT 'USD',
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_livestock_member ON livestock(member_id);
CREATE INDEX idx_livestock_type ON livestock(type);

-- ----------------------------------------------------------------------------
-- 10. LIVESTOCK HEALTH RECORDS — Vet visits, vaccinations, etc.
-- ----------------------------------------------------------------------------

CREATE TABLE livestock_health_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  livestock_id    UUID NOT NULL REFERENCES livestock(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,       -- vaccination, treatment, checkup, birth, death, sale
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  description     TEXT,
  vet_name        TEXT,
  cost            DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_livestock_health_livestock ON livestock_health_records(livestock_id);
CREATE INDEX idx_livestock_health_date ON livestock_health_records(date DESC);

-- ----------------------------------------------------------------------------
-- 11. MARKET PRICES — Commodity price tracking
-- ----------------------------------------------------------------------------

CREATE TABLE market_prices (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commodity       TEXT NOT NULL,       -- maize, wheat, rice, sorghum, groundnuts, soybeans, coffee, tea, tobacco, cotton
  market_location TEXT,
  country         TEXT,
  price           DECIMAL(12,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  unit            TEXT DEFAULT 'tonne',  -- kg, tonne, bag, litre
  date            DATE NOT NULL DEFAULT CURRENT_DATE,
  source          TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_market_prices_commodity ON market_prices(commodity);
CREATE INDEX idx_market_prices_country ON market_prices(country);
CREATE INDEX idx_market_prices_date ON market_prices(date DESC);

-- ----------------------------------------------------------------------------
-- 12. COOPERATIVES — Farmer cooperatives
-- ----------------------------------------------------------------------------

CREATE TABLE cooperatives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  country         TEXT,
  region          TEXT,
  description     TEXT,
  member_count    INTEGER DEFAULT 0,
  contact_email   TEXT,
  contact_phone   TEXT,
  established_year INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cooperatives_country ON cooperatives(country);

-- ----------------------------------------------------------------------------
-- 13. COOPERATIVE MEMBERS — Join table
-- ----------------------------------------------------------------------------

CREATE TABLE cooperative_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id  UUID NOT NULL REFERENCES cooperatives(id) ON DELETE CASCADE,
  member_id       UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  role            TEXT DEFAULT 'member',  -- member, secretary, treasurer, chairperson
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cooperative_id, member_id)
);

CREATE INDEX idx_cooperative_members_coop ON cooperative_members(cooperative_id);
CREATE INDEX idx_cooperative_members_member ON cooperative_members(member_id);

-- ============================================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock ENABLE ROW LEVEL SECURITY;
ALTER TABLE livestock_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE cooperative_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: RLS POLICIES — Members see own data, admins see all
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
CREATE POLICY "Members view own farm transactions" ON farm_transactions FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_transactions.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members manage own farm transactions" ON farm_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = farm_transactions.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all farm transactions" ON farm_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Courses (public read for published courses)
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT
  USING (is_published = true);
CREATE POLICY "Admins manage courses" ON courses FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Course modules (public read)
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

-- Equipment (public read for available items)
CREATE POLICY "Anyone can view available equipment" ON equipment FOR SELECT
  USING (status IN ('available', 'rented'));
CREATE POLICY "Admins manage equipment" ON equipment FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));
CREATE POLICY "Supplier owners manage own equipment" ON equipment FOR ALL
  USING (EXISTS (SELECT 1 FROM suppliers WHERE id = equipment.owner_id AND profile_id = auth.uid()));

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

-- Livestock health records (via livestock ownership)
CREATE POLICY "Members view own health records" ON livestock_health_records FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM livestock l JOIN members m ON m.id = l.member_id
    WHERE l.id = livestock_health_records.livestock_id AND m.profile_id = auth.uid()
  ));
CREATE POLICY "Members manage own health records" ON livestock_health_records FOR ALL
  USING (EXISTS (
    SELECT 1 FROM livestock l JOIN members m ON m.id = l.member_id
    WHERE l.id = livestock_health_records.livestock_id AND m.profile_id = auth.uid()
  ));
CREATE POLICY "Admins manage all health records" ON livestock_health_records FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Market prices (public read)
CREATE POLICY "Anyone can view market prices" ON market_prices FOR SELECT USING (true);
CREATE POLICY "Admins manage market prices" ON market_prices FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Cooperatives (public read)
CREATE POLICY "Anyone can view cooperatives" ON cooperatives FOR SELECT USING (true);
CREATE POLICY "Admins manage cooperatives" ON cooperatives FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Cooperative members
CREATE POLICY "Members view own coop memberships" ON cooperative_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = cooperative_members.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members join cooperatives" ON cooperative_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = cooperative_members.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage cooperative members" ON cooperative_members FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- ============================================================================
-- STEP 5: UPDATED_AT TRIGGERS (uses existing update_updated_at() function)
-- ============================================================================

CREATE TRIGGER update_farm_plots_updated_at BEFORE UPDATE ON farm_plots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_course_enrollments_updated_at BEFORE UPDATE ON course_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_equipment_bookings_updated_at BEFORE UPDATE ON equipment_bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_livestock_updated_at BEFORE UPDATE ON livestock
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cooperatives_updated_at BEFORE UPDATE ON cooperatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- STEP 6: SEED DATA
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 6a. COURSES — 8 courses across categories
-- ----------------------------------------------------------------------------

INSERT INTO courses (title, description, category, difficulty, duration_minutes, modules_count, instructor, instructor_avatar, thumbnail_url, rating, enrollment_count, is_published, country_scope) VALUES
(
  'Soil Health Fundamentals',
  'Learn to assess and improve your soil health using simple, low-cost techniques. Covers soil testing, composting, cover cropping, and integrated nutrient management for smallholder farms.',
  'agronomy', 'beginner', 90, 6,
  'Dr. Amara Osei', NULL, NULL,
  4.70, 342, true, '{}'
),
(
  'Drip Irrigation Setup & Maintenance',
  'Step-by-step guide to installing gravity-fed and pump-driven drip irrigation systems. Includes water budgeting, filter maintenance, and troubleshooting common issues.',
  'agronomy', 'intermediate', 120, 8,
  'Eng. Samuel Nyota', NULL, NULL,
  4.50, 189, true, '{}'
),
(
  'Farm Financial Record Keeping',
  'Master the basics of tracking income, expenses, and profit on your farm. Learn to use simple ledgers, mobile apps, and prepare financial statements for loan applications.',
  'finance', 'beginner', 60, 4,
  'Jane Muthoni, CPA', NULL, NULL,
  4.80, 521, true, '{}'
),
(
  'Mobile Money for Agribusiness',
  'Leverage mobile money platforms to receive payments, pay suppliers, save, and access micro-loans. Covers M-Pesa, EcoCash, MTN MoMo, and Airtel Money across AFU countries.',
  'finance', 'beginner', 45, 3,
  'Peter Kamau', NULL, NULL,
  4.60, 278, true, '{}'
),
(
  'Drone Scouting for Crop Health',
  'Introduction to using agricultural drones for field mapping, pest detection, and yield estimation. Includes hands-on flight planning and image analysis.',
  'technology', 'advanced', 150, 10,
  'Dr. Farai Chikwanha', NULL, NULL,
  4.40, 87, true, '{}'
),
(
  'Poultry Management for Profit',
  'Comprehensive course on broiler and layer management covering housing, feeding schedules, disease prevention, vaccination protocols, and marketing your eggs and meat.',
  'livestock', 'beginner', 75, 5,
  'Dr. Beatrice Akinyi', NULL, NULL,
  4.90, 456, true, '{}'
),
(
  'Selling at the Market: Price Negotiation',
  'Learn practical negotiation tactics, market timing, grading standards, and cooperative selling strategies to get the best price for your produce.',
  'marketing', 'intermediate', 60, 4,
  'Thomas Banda', NULL, NULL,
  4.30, 198, true, '{}'
),
(
  'GAP Compliance & Certification',
  'Understand Good Agricultural Practices (GAP) standards required for export markets. Covers record-keeping, pesticide management, worker safety, and the certification process.',
  'compliance', 'advanced', 180, 12,
  'Dr. Lindiwe Dube', NULL, NULL,
  4.50, 134, true, '{}'
);

-- ----------------------------------------------------------------------------
-- 6b. MARKET PRICES — market prices across all 10 AFU countries
-- ----------------------------------------------------------------------------

INSERT INTO market_prices (commodity, market_location, country, price, currency, unit, date, source) VALUES
('maize',       'Mbare Musika',       'Zimbabwe',       320.00, 'USD', 'tonne', '2026-03-18', 'Zimbabwe Grain Marketing Board'),
('tobacco',     'Tobacco Sales Floor', 'Zimbabwe',      3200.00, 'USD', 'tonne', '2026-03-18', 'TIMB Auction'),
('coffee',      'Nairobi Exchange',    'Kenya',         4850.00, 'USD', 'tonne', '2026-03-17', 'Nairobi Coffee Exchange'),
('tea',         'Mombasa Auction',     'Kenya',         2100.00, 'USD', 'tonne', '2026-03-17', 'East Africa Tea Trade Association'),
('rice',        'Dar es Salaam',       'Tanzania',       680.00, 'USD', 'tonne', '2026-03-18', 'Tanzania Agricultural Market Info'),
('wheat',       'Addis Ababa',         'Ethiopia',       450.00, 'USD', 'tonne', '2026-03-16', 'Ethiopian Commodity Exchange'),
('sorghum',     'Kano Market',         'Nigeria',        290.00, 'USD', 'tonne', '2026-03-18', 'Nigerian Commodity Exchange'),
('groundnuts',  'Lilongwe ADMARC',     'Malawi',         820.00, 'USD', 'tonne', '2026-03-17', 'ADMARC Price Bulletin'),
('soybeans',    'Lusaka Market',       'Zambia',         580.00, 'USD', 'tonne', '2026-03-18', 'Zambia Agricultural Commodities'),
('cotton',      'Kampala Exchange',    'Uganda',         1650.00, 'USD', 'tonne', '2026-03-16', 'Uganda Commodity Exchange'),
('maize',       'Beira Corridor',      'Mozambique',     275.00, 'USD', 'tonne', '2026-03-18', 'Mozambique Grain Board'),
('coffee',      'Addis Ababa',         'Ethiopia',      5200.00, 'USD', 'tonne', '2026-03-16', 'Ethiopian Commodity Exchange'),
('groundnuts',  'Dar es Salaam',       'Tanzania',       790.00, 'USD', 'tonne', '2026-03-18', 'Tanzania Agricultural Market Info'),
('maize',       'Lilongwe ADMARC',     'Malawi',         310.00, 'USD', 'tonne', '2026-03-17', 'ADMARC Price Bulletin'),
('soybeans',    'Harare',              'Zimbabwe',       560.00, 'USD', 'tonne', '2026-03-18', 'Zimbabwe Grain Marketing Board');

-- ----------------------------------------------------------------------------
-- 6c. COOPERATIVES — 5 cooperatives across AFU countries
-- ----------------------------------------------------------------------------

INSERT INTO cooperatives (name, country, region, description, member_count, contact_email, contact_phone, established_year) VALUES
(
  'Matabeleland Grain Growers Cooperative',
  'Zimbabwe', 'Matabeleland South',
  'A cooperative of 120 smallholder grain farmers pooling resources for bulk input purchasing, shared storage, and collective bargaining with buyers.',
  120, 'info@matgrain.co.zw', '+263771234567', 2018
),
(
  'Kisumu Horticulture Alliance',
  'Kenya', 'Kisumu County',
  'Fresh vegetable growers cooperative supplying supermarkets and export packers. Members share cold-chain logistics and quality certification costs.',
  85, 'contact@kisumuhort.co.ke', '+254722345678', 2020
),
(
  'Kilombero Rice Farmers Association',
  'Tanzania', 'Morogoro',
  'Irrigated rice farmers cooperative managing shared water infrastructure and operating a community rice mill for value-added processing.',
  200, 'info@kilomberorice.co.tz', '+255754567890', 2015
),
(
  'Sidama Coffee Producers Union',
  'Ethiopia', 'Sidama Zone',
  'Specialty coffee cooperative focused on quality processing, direct-trade relationships, and organic certification for premium market access.',
  350, 'admin@sidamacoffee.et', '+251911678901', 2012
),
(
  'Chipata Groundnut Cooperative',
  'Zambia', 'Eastern Province',
  'Groundnut and soybean growers cooperative providing seed multiplication, aflatoxin testing, and contract farming linkages with oil processors.',
  95, 'chipatacooperative@gmail.com', '+260977890123', 2021
);

-- ----------------------------------------------------------------------------
-- 6d. EQUIPMENT — 10 pieces across different suppliers
-- NOTE: owner_id references suppliers table. We use a subquery to pick
-- existing supplier IDs. If no suppliers exist, owner_id will be NULL.
-- ----------------------------------------------------------------------------

INSERT INTO equipment (name, type, description, daily_rate, currency, owner_id, location, country, status, specifications) VALUES
(
  'John Deere 5075E Tractor',
  'tractor',
  '75HP utility tractor suitable for ploughing, harrowing, and transport. Includes front loader attachment.',
  85.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at LIMIT 1),
  'Harare', 'Zimbabwe', 'available',
  '{"horsepower": 75, "fuel_type": "diesel", "year": 2022, "attachments": ["front_loader", "plough"]}'::jsonb
),
(
  'Massey Ferguson 240 Tractor',
  'tractor',
  '50HP tractor ideal for smallholder operations. Low fuel consumption and easy maintenance.',
  60.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at LIMIT 1),
  'Nairobi', 'Kenya', 'available',
  '{"horsepower": 50, "fuel_type": "diesel", "year": 2021}'::jsonb
),
(
  'DJI Agras T30 Sprayer Drone',
  'drone',
  'Agricultural sprayer drone covering 16ha/hour. Precision spraying reduces chemical usage by up to 30%.',
  120.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 1 LIMIT 1),
  'Dar es Salaam', 'Tanzania', 'available',
  '{"tank_capacity_l": 30, "spray_width_m": 9, "flight_time_min": 15, "coverage_ha_per_hour": 16}'::jsonb
),
(
  'Portable Maize Sheller',
  'processor',
  'Engine-driven maize sheller processing up to 2 tonnes per hour. Compact and trailer-mountable.',
  35.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 2 LIMIT 1),
  'Lilongwe', 'Malawi', 'available',
  '{"capacity_tonnes_per_hour": 2, "power": "petrol_engine", "weight_kg": 180}'::jsonb
),
(
  'Boom Sprayer 600L',
  'sprayer',
  'Tractor-mounted 600L boom sprayer with 12m spray width. Adjustable nozzles for varying crop heights.',
  40.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 1 LIMIT 1),
  'Lusaka', 'Zambia', 'available',
  '{"tank_capacity_l": 600, "boom_width_m": 12, "nozzle_count": 24}'::jsonb
),
(
  'Solar Drip Irrigation Kit (1ha)',
  'irrigator',
  'Complete solar-powered drip irrigation system for 1 hectare. Includes solar panel, pump, filters, and drip lines.',
  25.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 2 LIMIT 1),
  'Kampala', 'Uganda', 'available',
  '{"coverage_ha": 1, "solar_panel_w": 300, "pump_flow_l_per_hour": 3000}'::jsonb
),
(
  'Combine Harvester (Mini)',
  'harvester',
  'Compact combine harvester for wheat and rice. Self-propelled with 2m cutting width, suitable for small to medium plots.',
  150.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at LIMIT 1),
  'Addis Ababa', 'Ethiopia', 'available',
  '{"cutting_width_m": 2, "grain_tank_l": 800, "fuel_type": "diesel"}'::jsonb
),
(
  '3-Disc Plough',
  'plough',
  'Heavy-duty 3-disc plough for primary tillage. Suitable for tractors 50HP and above.',
  30.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 2 LIMIT 1),
  'Beira', 'Mozambique', 'available',
  '{"disc_count": 3, "working_depth_cm": 25, "working_width_cm": 90, "min_tractor_hp": 50}'::jsonb
),
(
  'Knapsack Sprayer 20L',
  'sprayer',
  'Manual knapsack sprayer for smallholder pest and disease management. Lightweight and durable.',
  5.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 1 LIMIT 1),
  'Kano', 'Nigeria', 'available',
  '{"capacity_l": 20, "type": "manual_pump", "weight_empty_kg": 3.5}'::jsonb
),
(
  'Rice Milling Machine',
  'processor',
  'Compact rice milling machine processing 1 tonne per hour. Produces polished white rice with minimal breakage.',
  45.00, 'USD',
  (SELECT id FROM suppliers WHERE status = 'active' ORDER BY created_at OFFSET 2 LIMIT 1),
  'Morogoro', 'Tanzania', 'available',
  '{"capacity_tonnes_per_hour": 1, "power_kw": 7.5, "milling_stages": ["husking", "whitening", "polishing"]}'::jsonb
);

-- ============================================================================
-- DONE — 13 tables created with indexes, RLS, triggers, and seed data
-- ============================================================================
