-- ============================================================================
-- AFU PORTAL — MIGRATION 093: TALENT APPLICATIONS (Public Job Seeker Signup)
-- Public signup form for job seekers to register skills & availability
-- ============================================================================

-- talent_profiles already exists (migration 016). This table is for
-- public, unauthenticated signups that go through admin review.

CREATE TABLE IF NOT EXISTS talent_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Personal
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  region TEXT,
  date_of_birth DATE,
  gender TEXT,

  -- Professional
  job_title TEXT,
  experience_years TEXT,
  education_level TEXT,
  qualifications TEXT,

  -- Skills & preferences
  skills TEXT[] DEFAULT '{}',
  sectors TEXT[] DEFAULT '{}',
  preferred_countries TEXT[] DEFAULT '{}',
  employment_type TEXT,
  availability TEXT,
  salary_expectation TEXT,
  willing_to_relocate BOOLEAN DEFAULT false,

  -- Documents
  cv_url TEXT,
  photo_url TEXT,

  -- Additional
  bio TEXT,
  languages TEXT[] DEFAULT '{}',
  referral_source TEXT,
  agreed_to_terms BOOLEAN DEFAULT false,

  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active')),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_talent_applications_email ON talent_applications(email);
CREATE INDEX IF NOT EXISTS idx_talent_applications_country ON talent_applications(country);
CREATE INDEX IF NOT EXISTS idx_talent_applications_status ON talent_applications(status);
CREATE INDEX IF NOT EXISTS idx_talent_applications_skills ON talent_applications USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_talent_applications_sectors ON talent_applications USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_talent_applications_created ON talent_applications(created_at DESC);

-- RLS
ALTER TABLE talent_applications ENABLE ROW LEVEL SECURITY;

-- Public can insert (signup form)
CREATE POLICY "Public can submit talent applications"
  ON talent_applications FOR INSERT
  WITH CHECK (true);

-- Admins full access
CREATE POLICY "Admins full access talent applications"
  ON talent_applications FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Grant anon insert for public signup
GRANT INSERT ON talent_applications TO anon;
GRANT ALL ON talent_applications TO authenticated;
