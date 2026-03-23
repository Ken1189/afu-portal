-- ============================================================================
-- AFU PORTAL — MIGRATION 017: INVESTOR PORTAL + LOGO + RESEARCH CENTRES
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. INVESTOR PROFILES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  investor_type TEXT NOT NULL CHECK (investor_type IN ('individual', 'institutional', 'dfi', 'family_office', 'impact_fund', 'corporate', 'government')),
  country TEXT,

  -- Investment details
  committed_amount DECIMAL(14,2) DEFAULT 0,
  deployed_amount DECIMAL(14,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  investment_thesis TEXT,
  sectors_of_interest TEXT[] DEFAULT '{}',
  countries_of_interest TEXT[] DEFAULT '{}',

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('prospect', 'active', 'inactive')),
  onboarded_at TIMESTAMPTZ,
  relationship_manager TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_profiles_user ON investor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_status ON investor_profiles(status);
CREATE INDEX IF NOT EXISTS idx_investor_profiles_type ON investor_profiles(investor_type);

ALTER TABLE investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors view own profile" ON investor_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins full access investor profiles" ON investor_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. INVESTMENTS (Individual investment records)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID NOT NULL REFERENCES investor_profiles(id) ON DELETE CASCADE,

  -- Investment details
  investment_name TEXT NOT NULL,
  investment_type TEXT NOT NULL CHECK (investment_type IN ('equity', 'debt', 'convertible_note', 'grant', 'guarantee', 'revenue_participation')),
  amount DECIMAL(14,2) NOT NULL,
  currency TEXT DEFAULT 'USD',

  -- Terms
  interest_rate DECIMAL(5,2),
  term_months INTEGER,
  maturity_date DATE,
  revenue_share_pct DECIMAL(5,2),

  -- Performance
  returns_to_date DECIMAL(14,2) DEFAULT 0,
  irr DECIMAL(5,2),
  status TEXT DEFAULT 'committed' CHECK (status IN ('committed', 'deployed', 'performing', 'impaired', 'exited', 'written_off')),

  -- Project link
  project_name TEXT,
  project_country TEXT,
  project_description TEXT,

  deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);

ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors view own investments" ON investments FOR SELECT USING (
  investor_id IN (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access investments" ON investments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. INVESTOR DOCUMENTS (Data room)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id UUID REFERENCES investor_profiles(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('term_sheet', 'quarterly_report', 'annual_report', 'financial_statement', 'legal', 'compliance', 'impact_report', 'pitch_deck', 'due_diligence', 'tax', 'other')),
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  file_type TEXT, -- pdf, xlsx, docx

  -- Visibility
  is_public BOOLEAN DEFAULT false, -- visible to all investors or just the linked one
  uploaded_by UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_investor_documents_investor ON investor_documents(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_documents_category ON investor_documents(category);

ALTER TABLE investor_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Investors view own docs" ON investor_documents FOR SELECT USING (
  is_public = true OR investor_id IN (SELECT id FROM investor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access investor docs" ON investor_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. INVESTOR UPDATES (Quarterly updates, milestones)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investor_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title TEXT NOT NULL,
  body TEXT NOT NULL,
  update_type TEXT DEFAULT 'quarterly' CHECK (update_type IN ('quarterly', 'milestone', 'alert', 'report', 'announcement')),

  -- Metrics snapshot
  metrics JSONB DEFAULT '{}', -- { farmers_onboarded, loans_active, repayment_rate, revenue_ytd, etc. }

  -- Visibility
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  author_id UUID REFERENCES profiles(id),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE investor_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published updates visible to investors" ON investor_updates FOR SELECT USING (
  is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins full access updates" ON investor_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. RESEARCH CENTRES
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS research_centres (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name TEXT NOT NULL,
  description TEXT NOT NULL,
  focus_areas TEXT[] DEFAULT '{}',
  country TEXT NOT NULL,
  region TEXT,
  photo_url TEXT,
  website_url TEXT,
  established_year INTEGER,
  team_size INTEGER,
  publications_count INTEGER DEFAULT 0,
  key_projects TEXT[] DEFAULT '{}',
  partner_institutions TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE research_centres ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active centres" ON research_centres FOR SELECT USING (is_active = true);
CREATE POLICY "Admins full access centres" ON research_centres FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. SITE LOGO STORAGE (via site_config)
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO site_config (key, value, description, category)
VALUES ('site_logo_url', '""', 'URL to uploaded logo image (PNG/JPEG). Leave empty for default SVG.', 'branding')
ON CONFLICT (key) DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. ADD investor ROLE TO PROFILES
-- ────────────────────────────────────────────────────────────────────────────

-- The profiles.role column likely uses a check constraint. Update it:
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('member', 'farmer', 'supplier', 'admin', 'super_admin', 'investor'));

-- ────────────────────────────────────────────────────────────────────────────
-- 8. SEED: SAMPLE RESEARCH CENTRES
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO research_centres (name, description, focus_areas, country, region, established_year, team_size, publications_count, key_projects, partner_institutions, is_active, sort_order) VALUES
(
  'AFU Crop Science Centre — Harare',
  'Leading research facility focused on drought-tolerant crop varieties, soil health, and sustainable intensification for Southern African agriculture. Houses seed banks and tissue culture laboratories.',
  ARRAY['Drought tolerance', 'Soil science', 'Seed multiplication', 'Conservation agriculture'],
  'Zimbabwe', 'Harare',
  2024, 12, 8,
  ARRAY['Climate-resilient maize varieties', 'Biofortified groundnut programme', 'Soil carbon sequestration study'],
  ARRAY['University of Zimbabwe', 'CIMMYT', 'ICRISAT'],
  true, 1
),
(
  'AFU Livestock Research Hub — Bulawayo',
  'Specialist facility for cattle genetics improvement, disease surveillance, and rangeland management. Operates a 200-hectare demonstration ranch with Brahman-cross breeding programme.',
  ARRAY['Cattle genetics', 'Disease control', 'Rangeland management', 'Feed nutrition'],
  'Zimbabwe', 'Bulawayo',
  2025, 8, 3,
  ARRAY['Brahman-cross genetics programme', 'Tick-borne disease surveillance', 'Rotational grazing trials'],
  ARRAY['Veterinary Research Laboratory', 'AU-IBAR'],
  true, 2
),
(
  'AFU Digital Agriculture Lab — Kampala',
  'Technology-focused centre developing AI models for crop disease detection, satellite-based yield prediction, and mobile advisory platforms tailored for East African smallholders.',
  ARRAY['AI crop diagnosis', 'Remote sensing', 'Mobile platforms', 'Precision agriculture'],
  'Uganda', 'Kampala',
  2025, 15, 5,
  ARRAY['Gemini AI crop doctor model', 'Sentinel-2 yield prediction', 'USSD advisory for feature phones'],
  ARRAY['Makerere University', 'Google Research Africa', 'CGIAR'],
  true, 3
),
(
  'AFU Horticulture Export Centre — Manicaland',
  'Research and training centre focused on high-value export horticulture, particularly blueberries, avocados, and macadamia. Operates trial plots and a training facility for commercial growers.',
  ARRAY['Blueberry cultivation', 'Export quality standards', 'Post-harvest technology', 'Irrigation efficiency'],
  'Zimbabwe', 'Manicaland',
  2025, 6, 2,
  ARRAY['Counter-seasonal blueberry production', 'EU phytosanitary compliance protocols', 'Solar cold chain pilot'],
  ARRAY['Horticultural Promotion Council', 'COMESA Trade Hub'],
  true, 4
);
