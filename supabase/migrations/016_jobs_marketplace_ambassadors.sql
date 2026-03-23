-- ============================================================================
-- AFU PORTAL — MIGRATION 016: JOBS MARKETPLACE + AMBASSADORS + FARM SHOWCASE
-- Agricultural talent marketplace, ambassador profiles, and showcase farms
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- 1. TALENT PROFILES (Workers / Job Seekers)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS talent_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Personal info
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  country TEXT NOT NULL,
  region TEXT,
  bio TEXT,
  date_of_birth DATE,
  gender TEXT,

  -- Professional info
  skills TEXT[] DEFAULT '{}',
  sectors TEXT[] DEFAULT '{}', -- livestock, horticulture, poultry, grains, machinery, irrigation, processing, management
  experience_years INTEGER DEFAULT 0,
  education TEXT, -- none, primary, secondary, diploma, degree
  certifications TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  cv_url TEXT,

  -- Availability
  availability_type TEXT DEFAULT 'any' CHECK (availability_type IN ('seasonal', 'permanent', 'specialist', 'equipment_operator', 'any')),
  available_from DATE,
  available_to DATE,
  daily_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',

  -- Grading
  reliability_score DECIMAL(3,2) DEFAULT 0.00, -- 0-5.00
  skill_rating DECIMAL(3,2) DEFAULT 0.00,
  total_engagements INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,

  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'hired')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_talent_profiles_country ON talent_profiles(country);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_status ON talent_profiles(status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_sectors ON talent_profiles USING GIN(sectors);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_skills ON talent_profiles USING GIN(skills);

ALTER TABLE talent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active talent" ON talent_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Users can manage own talent profile" ON talent_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins full access talent" ON talent_profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. JOB LISTINGS (Employer Posts)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  posted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Job info
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sector TEXT NOT NULL, -- livestock, horticulture, poultry, grains, machinery, irrigation, processing, management, general
  job_type TEXT NOT NULL CHECK (job_type IN ('seasonal', 'permanent', 'specialist', 'equipment_operator', 'processing')),
  country TEXT NOT NULL,
  region TEXT,
  location_detail TEXT,

  -- Requirements
  required_skills TEXT[] DEFAULT '{}',
  min_experience_years INTEGER DEFAULT 0,
  education_required TEXT, -- none, primary, secondary, diploma, degree
  certifications_required TEXT[] DEFAULT '{}',

  -- Compensation
  pay_type TEXT DEFAULT 'daily' CHECK (pay_type IN ('daily', 'weekly', 'monthly', 'per_engagement', 'negotiable')),
  pay_rate DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  includes_housing BOOLEAN DEFAULT false,
  includes_meals BOOLEAN DEFAULT false,
  includes_transport BOOLEAN DEFAULT false,

  -- Duration
  start_date DATE,
  end_date DATE,
  duration_description TEXT, -- "3 months", "Harvest season", "Ongoing"
  workers_needed INTEGER DEFAULT 1,

  -- Farm/employer info
  farm_name TEXT,
  farm_size_ha DECIMAL(10,2),
  employer_name TEXT,
  employer_phone TEXT,

  -- Status
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'filled', 'expired')),
  applications_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false, -- admin must approve before visible

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_listings_status ON job_listings(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_country ON job_listings(country);
CREATE INDEX IF NOT EXISTS idx_job_listings_sector ON job_listings(sector);
CREATE INDEX IF NOT EXISTS idx_job_listings_type ON job_listings(job_type);

ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view approved open jobs" ON job_listings FOR SELECT USING (status = 'open' AND is_approved = true);
CREATE POLICY "Owners can manage own listings" ON job_listings FOR ALL USING (auth.uid() = posted_by);
CREATE POLICY "Admins full access listings" ON job_listings FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. JOB APPLICATIONS
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES job_listings(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,

  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn')),
  cover_message TEXT,
  notes TEXT, -- admin/employer notes
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(job_id, talent_id) -- one application per job per talent
);

CREATE INDEX IF NOT EXISTS idx_job_applications_job ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_talent ON job_applications(talent_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);

ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Talent can view own applications" ON job_applications FOR SELECT USING (
  talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Talent can apply" ON job_applications FOR INSERT WITH CHECK (
  talent_id IN (SELECT id FROM talent_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins full access applications" ON job_applications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ENGAGEMENT REVIEWS (Post-job ratings)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS engagement_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_id UUID NOT NULL REFERENCES talent_profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job_listings(id) ON DELETE SET NULL,
  reviewer_id UUID NOT NULL REFERENCES profiles(id),

  overall_rating INTEGER NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
  skill_level INTEGER CHECK (skill_level BETWEEN 1 AND 5),
  reliability INTEGER CHECK (reliability BETWEEN 1 AND 5),
  communication INTEGER CHECK (communication BETWEEN 1 AND 5),
  comment TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_engagement_reviews_talent ON engagement_reviews(talent_id);

ALTER TABLE engagement_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view reviews" ON engagement_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated can create reviews" ON engagement_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Admins full access reviews" ON engagement_reviews FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 5. AMBASSADORS (Featured farmer profiles by sector)
-- ────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS ambassadors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  full_name TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT NOT NULL,
  quote TEXT, -- pull quote for display
  sector TEXT NOT NULL, -- livestock, poultry, horticulture, grains, cash_crops, dairy, aquaculture, mixed
  country TEXT NOT NULL,
  region TEXT,
  farm_name TEXT,
  farm_size_ha DECIMAL(10,2),
  years_experience INTEGER,
  achievements TEXT[] DEFAULT '{}',
  crops_or_products TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ambassadors_sector ON ambassadors(sector);
CREATE INDEX IF NOT EXISTS idx_ambassadors_country ON ambassadors(country);
CREATE INDEX IF NOT EXISTS idx_ambassadors_status ON ambassadors(status);

ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active ambassadors" ON ambassadors FOR SELECT USING (status = 'active');
CREATE POLICY "Admins full access ambassadors" ON ambassadors FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. ADD SHOWCASE FLAG TO FARMER PUBLIC PROFILES
-- ────────────────────────────────────────────────────────────────────────────

ALTER TABLE farmer_public_profiles ADD COLUMN IF NOT EXISTS is_showcase BOOLEAN DEFAULT false;
ALTER TABLE farmer_public_profiles ADD COLUMN IF NOT EXISTS showcase_order INTEGER DEFAULT 0;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. SEED: ZIMBABWE AMBASSADORS
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO ambassadors (full_name, photo_url, bio, quote, sector, country, region, farm_name, farm_size_ha, years_experience, achievements, crops_or_products, is_featured, sort_order) VALUES
(
  'Grace Moyo',
  'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=400&h=400&fit=crop',
  'Grace is a leading maize and groundnut farmer in Mashonaland East who doubled her yields using AFU''s training programme. She now mentors 15 women farmers in her community and serves as the district seed multiplier.',
  'AFU showed me that farming is not just survival — it is a business. Now I teach other women the same.',
  'grains',
  'Zimbabwe', 'Mashonaland East',
  'Moyo Family Farm', 3.5, 14,
  ARRAY['District seed multiplier', 'Mentors 15 women farmers', 'Doubled maize yield'],
  ARRAY['Maize', 'Groundnuts'],
  true, 1
),
(
  'Simba Chikwanha',
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=400&h=400&fit=crop',
  'Simba is a commercial cotton and sunflower farmer who pioneered mechanical planting in the Midlands. He leads a 45-member cooperative that shares equipment and negotiates collective offtake contracts.',
  'When farmers work together, we can negotiate like a business — not beg like individuals.',
  'cash_crops',
  'Zimbabwe', 'Midlands',
  'Chikwanha Commercial Farm', 8.0, 22,
  ARRAY['Pioneer of mechanical planting', 'Leads 45-member cooperative', 'Contract farming with processors'],
  ARRAY['Cotton', 'Sunflower'],
  true, 2
),
(
  'Tatenda Moyo',
  'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=400&h=400&fit=crop',
  'Tatenda runs a mixed cattle-and-crop operation in Matabeleland South. His Brahman-cross herd has become a benchmark in the region, and he is preparing Zimbabwe''s first live-cattle export to Mozambique through AFU.',
  'Livestock is Zimbabwe''s untapped gold. With the right genetics and market access, our cattle can compete globally.',
  'livestock',
  'Zimbabwe', 'Matabeleland South',
  'Moyo Livestock & Grain', 6.0, 25,
  ARRAY['40-head Brahman-cross herd', 'First live-cattle export prep', 'Regional genetics benchmark'],
  ARRAY['Cattle', 'Maize'],
  true, 3
),
(
  'Nyasha Mutasa',
  'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=400&h=400&fit=crop',
  'Nyasha left teaching to take over her family farm and introduced year-round irrigation farming. Her wheat-soybean rotation generates income 12 months a year, and AFU''s advisors helped her cut fertiliser costs by 25%.',
  'I left a classroom to build a business in the soil. Best decision I ever made.',
  'horticulture',
  'Zimbabwe', 'Mashonaland West',
  'Mutasa Irrigated Farm', 4.5, 7,
  ARRAY['Year-round production', '25% input cost reduction', 'Wheat-soybean rotation pioneer'],
  ARRAY['Wheat', 'Soybeans'],
  true, 4
),
(
  'Emmanuel Okafor',
  'https://images.unsplash.com/photo-1589923188651-268a9765e432?w=400&h=400&fit=crop',
  'Emmanuel runs a 5,000-bird layer operation in Mashonaland Central, producing eggs for the Harare market. He started with 200 birds and scaled using AFU''s equipment financing for automated feeding systems.',
  'Poultry is Africa''s fastest protein opportunity. Scale it right and the market will never let you down.',
  'poultry',
  'Zimbabwe', 'Mashonaland Central',
  'Okafor Poultry Farm', 2.0, 11,
  ARRAY['5,000-bird layer operation', 'Scaled from 200 to 5,000', 'Automated feeding systems'],
  ARRAY['Eggs', 'Broilers'],
  true, 5
),
(
  'Farai Ncube',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=400&fit=crop',
  'Farai is Zimbabwe''s emerging blueberry pioneer, managing a 3-hectare trial plot in the Eastern Highlands. His counter-seasonal production targets the EU fresh market at premium prices, supported by AFU''s export hub.',
  'Blueberries are the future of Zimbabwean agriculture. The world wants what we can grow.',
  'horticulture',
  'Zimbabwe', 'Manicaland',
  'Ncube Highland Berries', 3.0, 5,
  ARRAY['Blueberry pioneer', 'EU export market', 'Counter-seasonal production'],
  ARRAY['Blueberries', 'Raspberries'],
  true, 6
);

-- ────────────────────────────────────────────────────────────────────────────
-- 8. SEED: SAMPLE JOB LISTINGS
-- ────────────────────────────────────────────────────────────────────────────

INSERT INTO job_listings (title, description, sector, job_type, country, region, required_skills, min_experience_years, pay_type, pay_rate, currency, start_date, duration_description, workers_needed, farm_name, employer_name, status, is_approved) VALUES
(
  'Blueberry Harvest Workers (20 positions)',
  'Seasonal harvest workers needed for the 2026 blueberry season in the Eastern Highlands. Workers will pick, sort, and pack blueberries for EU export. Training provided. Must be physically fit and reliable.',
  'horticulture', 'seasonal',
  'Zimbabwe', 'Manicaland',
  ARRAY['Fruit picking', 'Physical fitness', 'Reliability'],
  0, 'daily', 15.00, 'USD',
  '2026-09-01', '3 months (Sep-Nov 2026)', 20,
  'AFU Blueberry Project', 'AFU Zimbabwe', 'open', true
),
(
  'Farm Manager — Commercial Cotton Operation',
  'Experienced farm manager to oversee 50ha cotton and sunflower operation in the Midlands. Responsible for planting schedules, labour management, input procurement, and harvest coordination. Must have 5+ years farm management experience.',
  'cash_crops', 'permanent',
  'Zimbabwe', 'Midlands',
  ARRAY['Farm management', 'Cotton production', 'Labour management', 'Budgeting'],
  5, 'monthly', 800.00, 'USD',
  '2026-05-01', 'Permanent', 1,
  'Midlands Cotton Cooperative', 'Simba Chikwanha', 'open', true
),
(
  'Irrigation Technician — Solar Pump Systems',
  'Specialist needed to install and maintain solar-powered irrigation systems across 10 farms in Masvingo province. Must understand drip irrigation, pump sizing, and solar panel maintenance.',
  'machinery', 'specialist',
  'Zimbabwe', 'Masvingo',
  ARRAY['Solar systems', 'Drip irrigation', 'Pump maintenance', 'Electrical'],
  3, 'per_engagement', 50.00, 'USD',
  '2026-04-15', 'Per installation (est. 2-3 days each)', 2,
  'Various AFU member farms', 'AFU Zimbabwe', 'open', true
),
(
  'Livestock Veterinary Assistant',
  'Part-time vet assistant to support cattle health management across Matabeleland South. Vaccinations, deworming, calving assistance, and basic diagnostics. Vet diploma or animal science background preferred.',
  'livestock', 'specialist',
  'Zimbabwe', 'Matabeleland South',
  ARRAY['Animal health', 'Vaccination', 'Cattle handling', 'Basic diagnostics'],
  2, 'weekly', 120.00, 'USD',
  '2026-04-01', 'Ongoing (2-3 days/week)', 1,
  'Moyo Livestock & Grain', 'Tatenda Moyo', 'open', true
),
(
  'Pack-house Quality Inspectors (5 positions)',
  'Quality control inspectors for the AFU Export Hub. Inspect, grade, and certify produce for EU export standards. Knowledge of phytosanitary requirements preferred. Training provided for suitable candidates.',
  'processing', 'seasonal',
  'Zimbabwe', 'Harare',
  ARRAY['Quality control', 'Attention to detail', 'Food safety'],
  1, 'daily', 18.00, 'USD',
  '2026-08-01', '4 months (Aug-Nov 2026)', 5,
  'AFU Export Hub', 'AFU Zimbabwe', 'open', true
);

-- Mark existing Zimbabwe farmers as showcase
UPDATE farmer_public_profiles SET is_showcase = true, showcase_order = 1 WHERE country = 'Zimbabwe' AND is_active = true;
