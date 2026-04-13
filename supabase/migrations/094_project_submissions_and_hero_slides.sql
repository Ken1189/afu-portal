-- ============================================================================
-- 094 — Project Submissions & Hero Slides
-- ============================================================================

-- ─── Project Submissions ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Submitter
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  organisation TEXT,
  role_in_project TEXT,  -- founder, researcher, manager, partner, farmer, NGO

  -- Project details
  project_name TEXT NOT NULL,
  project_category TEXT,  -- agronomy, livestock, technology, climate, processing, trade, forestry, aquaculture
  project_stage TEXT,  -- concept, pilot, operational, scaling
  project_description TEXT NOT NULL,
  target_beneficiaries TEXT,  -- smallholders, women farmers, youth, cooperatives, community
  beneficiary_count INTEGER,

  -- Location & scope
  project_country TEXT NOT NULL,
  project_region TEXT,
  project_countries TEXT[] DEFAULT '{}',  -- if multi-country

  -- Funding
  funding_required BOOLEAN DEFAULT false,
  funding_amount TEXT,  -- range
  funding_purpose TEXT,
  existing_funding TEXT,  -- self-funded, grant, donor, government, none

  -- Support needed from AFU
  support_needed TEXT[] DEFAULT '{}',  -- funding, inputs, market_access, training, insurance, processing, logistics, technology

  -- Documents
  proposal_url TEXT,

  -- Additional
  timeline TEXT,
  impact_description TEXT,
  referral_source TEXT,
  agreed_to_terms BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_project_submissions_status ON project_submissions(status);
CREATE INDEX IF NOT EXISTS idx_project_submissions_country ON project_submissions(project_country);
CREATE INDEX IF NOT EXISTS idx_project_submissions_category ON project_submissions(project_category);
CREATE INDEX IF NOT EXISTS idx_project_submissions_email ON project_submissions(email);
CREATE INDEX IF NOT EXISTS idx_project_submissions_created ON project_submissions(created_at DESC);

-- RLS
ALTER TABLE project_submissions ENABLE ROW LEVEL SECURITY;

-- Public INSERT (anyone can submit a project)
DROP POLICY IF EXISTS "Anyone can submit a project" ON project_submissions;
CREATE POLICY "Anyone can submit a project"
  ON project_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Admin can do everything
DROP POLICY IF EXISTS "Admins full access on project_submissions" ON project_submissions;
CREATE POLICY "Admins full access on project_submissions"
  ON project_submissions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Grants
GRANT SELECT, INSERT ON project_submissions TO anon;
GRANT ALL ON project_submissions TO authenticated;


-- ─── Hero Slides ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  cta_text TEXT DEFAULT 'Learn More',
  cta_link TEXT DEFAULT '/about',
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  slide_duration INTEGER DEFAULT 5000,  -- milliseconds per slide
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_slides_visible ON hero_slides(visible);

-- RLS
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Public SELECT where visible
DROP POLICY IF EXISTS "Anyone can view visible hero slides" ON hero_slides;
CREATE POLICY "Anyone can view visible hero slides"
  ON hero_slides FOR SELECT
  TO anon, authenticated
  USING (visible = true);

-- Admin full access
DROP POLICY IF EXISTS "Admins full access on hero_slides" ON hero_slides;
CREATE POLICY "Admins full access on hero_slides"
  ON hero_slides FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Grants
GRANT SELECT ON hero_slides TO anon;
GRANT ALL ON hero_slides TO authenticated;
