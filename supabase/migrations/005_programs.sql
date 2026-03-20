-- ============================================================================
-- AFU PORTAL — MIGRATION 005: PROGRAMS
-- Crop programs bundling inputs, insurance, and offtake for members
-- ============================================================================

CREATE TYPE program_status AS ENUM ('draft', 'active', 'closed', 'completed');
CREATE TYPE program_stage AS ENUM ('discover', 'approved', 'inputs', 'growing', 'harvest', 'offtake', 'complete');
CREATE TYPE enrollment_status AS ENUM ('applied', 'approved', 'active', 'completed', 'rejected', 'withdrawn');
CREATE TYPE inclusion_type AS ENUM ('inputs', 'insurance', 'offtake', 'financing', 'advisory');

-- ============================================================================
-- PROGRAMS
-- ============================================================================

CREATE TABLE programs (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title                 TEXT NOT NULL,
  slug                  TEXT UNIQUE,
  country               TEXT NOT NULL,
  region                TEXT,
  crop                  TEXT NOT NULL,
  crop_variety          TEXT,
  season_number         INTEGER DEFAULT 1,
  description           TEXT,
  status                program_status NOT NULL DEFAULT 'draft',
  max_participants      INTEGER,
  current_participants  INTEGER DEFAULT 0,
  min_farm_size_ha      DECIMAL(10,2),
  planting_start        DATE,
  planting_end          DATE,
  expected_harvest      DATE,
  financing_available   BOOLEAN DEFAULT false,
  financing_percent     INTEGER DEFAULT 0,
  offtake_buyer         TEXT,
  offtake_price_per_kg  DECIMAL(10,2),
  offtake_currency      TEXT DEFAULT 'USD',
  image_url             TEXT,
  created_by            UUID REFERENCES profiles(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_programs_country ON programs(country);
CREATE INDEX idx_programs_status  ON programs(status);
CREATE INDEX idx_programs_crop    ON programs(crop);

-- ============================================================================
-- PROGRAM INCLUSIONS (what's bundled: inputs, insurance, offtake, etc.)
-- ============================================================================

CREATE TABLE program_inclusions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  type            inclusion_type NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  supplier_id     UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  value_estimate  DECIMAL(10,2),
  currency        TEXT DEFAULT 'USD',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inclusions_program ON program_inclusions(program_id);

-- ============================================================================
-- PROGRAM ENROLLMENTS
-- ============================================================================

CREATE TABLE program_enrollments (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id           UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  member_id            UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  status               enrollment_status NOT NULL DEFAULT 'applied',
  current_stage        program_stage DEFAULT 'discover',
  farm_size_ha         DECIMAL(10,2),
  farm_location        TEXT,
  notes                TEXT,
  financing_requested  BOOLEAN DEFAULT false,
  applied_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_at          TIMESTAMPTZ,
  completed_at         TIMESTAMPTZ,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(program_id, member_id)
);

CREATE INDEX idx_prog_enrollments_program ON program_enrollments(program_id);
CREATE INDEX idx_prog_enrollments_member  ON program_enrollments(member_id);
CREATE INDEX idx_prog_enrollments_status  ON program_enrollments(status);

-- ============================================================================
-- PROGRAM STAGE HISTORY (audit trail of stage changes per enrollment)
-- ============================================================================

CREATE TABLE program_stage_history (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id  UUID NOT NULL REFERENCES program_enrollments(id) ON DELETE CASCADE,
  stage          program_stage NOT NULL,
  notes          TEXT,
  updated_by     UUID REFERENCES profiles(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_stage_history_enrollment ON program_stage_history(enrollment_id);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE programs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_inclusions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_enrollments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_stage_history ENABLE ROW LEVEL SECURITY;

-- Programs: authenticated members can read active/closed/completed
CREATE POLICY "Members view active programs" ON programs FOR SELECT
  USING (status IN ('active', 'closed', 'completed') AND auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage programs" ON programs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Inclusions: readable by authenticated users
CREATE POLICY "Anyone can view inclusions" ON program_inclusions FOR SELECT
  USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins manage inclusions" ON program_inclusions FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Enrollments: member sees own
CREATE POLICY "Members view own program enrollments" ON program_enrollments FOR SELECT
  USING (EXISTS (SELECT 1 FROM members WHERE id = program_enrollments.member_id AND profile_id = auth.uid()));
CREATE POLICY "Members create program enrollments" ON program_enrollments FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM members WHERE id = program_enrollments.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all program enrollments" ON program_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Stage history: member sees own
CREATE POLICY "Members view own stage history" ON program_stage_history FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM program_enrollments pe
    JOIN members m ON m.id = pe.member_id
    WHERE pe.id = program_stage_history.enrollment_id AND m.profile_id = auth.uid()
  ));
CREATE POLICY "Admins manage stage history" ON program_stage_history FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON program_enrollments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED: sample programs so the feature is immediately populated
-- ============================================================================

INSERT INTO programs (title, slug, country, crop, crop_variety, season_number, description, status, max_participants, min_farm_size_ha, planting_start, planting_end, expected_harvest, financing_available, financing_percent, offtake_buyer, offtake_price_per_kg, offtake_currency)
VALUES
  ('Zimbabwe Blueberry Program — Season 1', 'zim-blueberry-s1', 'Zimbabwe', 'Blueberries', 'Draper & Liberty', 1,
   'Premium export-grade blueberries for European markets. Full input package, crop insurance, and locked-in offtake at $4.20/kg. Ideal for small to mid-sized farms in Mashonaland.', 'active', 50, 0.5,
   '2026-04-01', '2026-05-15', '2026-11-01', true, 70, 'FreshMark Exports Ltd', 4.20, 'USD'),

  ('Uganda Coffee Cooperative Program — Season 1', 'uga-coffee-s1', 'Uganda', 'Coffee', 'Arabica SL28', 1,
   'Specialty Arabica coffee targeting specialty roasters in Europe and North America. Organic certification support included. Collective offtake negotiated at a 15% premium over market rate.', 'active', 80, 1.0,
   '2026-03-01', '2026-04-30', '2026-10-15', true, 60, 'Uganda Specialty Coffee Collective', 3.80, 'USD'),

  ('Tanzania Cashew Export Program — Season 1', 'tan-cashew-s1', 'Tanzania', 'Cashews', 'Local Elite', 1,
   'Raw cashew nuts for processing and export to India and Vietnam. Includes soil amendment inputs, pest management, and certified buyer through established trade corridor.', 'active', 60, 1.5,
   '2026-02-01', '2026-03-31', '2026-08-30', true, 50, 'East Africa Nut Traders', 1.45, 'USD'),

  ('Zimbabwe Sugarcane Program — Season 1', 'zim-sugar-s1', 'Zimbabwe', 'Sugarcane', 'N14 & N27', 1,
   'Contract farming arrangement with Triangle Sugar. Full ratoon management support, fertiliser on credit, and guaranteed mill offtake. Lowveld farmers prioritised.', 'draft', 40, 2.0,
   '2026-05-01', '2026-06-30', '2027-03-01', true, 80, 'Triangle Sugar Mill', 0.048, 'USD'),

  ('Uganda Cocoa Program — Season 1', 'uga-cocoa-s1', 'Uganda', 'Cocoa', 'Trinitario', 1,
   'Fine-flavour cocoa for premium chocolate makers. Post-harvest fermentation training and drying equipment included. Offtake price locked 20% above Cocobod reference.', 'active', 45, 1.0,
   '2026-04-15', '2026-06-01', '2026-11-30', false, 0, 'Latitude Trade Co', 2.60, 'USD');
