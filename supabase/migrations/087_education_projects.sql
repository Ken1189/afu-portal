-- Education / Research Projects
-- Replaces hardcoded data in /education/projects with a managed table

CREATE TABLE IF NOT EXISTS education_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Agronomy',        -- Agronomy, Livestock, Technology, Climate
  status TEXT NOT NULL DEFAULT 'Active',             -- Active, Completed, Planning
  duration TEXT,                                      -- e.g. "2024-2026"
  funding TEXT,                                       -- e.g. "$420,000"
  lead TEXT,                                          -- e.g. "Dr. Tendai Moyo"
  partners TEXT[] DEFAULT '{}',                       -- array of partner org names
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  display_order INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE education_projects ENABLE ROW LEVEL SECURITY;

-- Public read for visible projects
CREATE POLICY "Anyone can read visible education projects"
  ON education_projects FOR SELECT
  USING (visible = true);

-- Admin full access
CREATE POLICY "Admins can manage education projects"
  ON education_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Grant access
GRANT SELECT ON education_projects TO anon, authenticated;
GRANT ALL ON education_projects TO authenticated;
