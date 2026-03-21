-- ============================================================================
-- 012: Farmer Progression Tiers
-- Progressive feature unlocking for small-scale farmers
-- ============================================================================

-- Farmer progression tiers
CREATE TABLE IF NOT EXISTS farmer_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_tier TEXT NOT NULL DEFAULT 'seedling' CHECK (current_tier IN ('seedling', 'sprout', 'growth', 'harvest', 'pioneer')),
  tier_unlocked_at TIMESTAMPTZ DEFAULT now(),
  total_courses_completed INT DEFAULT 0,
  total_xp INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Course completion tracking
CREATE TABLE IF NOT EXISTS course_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  tier_course TEXT NOT NULL, -- which tier this course belongs to
  completed_at TIMESTAMPTZ DEFAULT now(),
  score INT DEFAULT 0,
  UNIQUE(user_id, course_id)
);

-- Tier requirements definition
CREATE TABLE IF NOT EXISTS tier_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier TEXT NOT NULL CHECK (tier IN ('sprout', 'growth', 'harvest', 'pioneer')),
  required_course_category TEXT NOT NULL,
  required_completions INT DEFAULT 1,
  description TEXT
);

-- Seed tier requirements
INSERT INTO tier_requirements (tier, required_course_category, required_completions, description) VALUES
  ('sprout', 'farm-basics', 1, 'Complete the Farm Basics course to unlock farm journaling and crop calendar'),
  ('growth', 'financial-literacy', 1, 'Complete Financial Literacy to unlock financing, insurance, and payments'),
  ('harvest', 'digital-agriculture', 1, 'Complete Digital Agriculture to unlock AI tools and sustainability'),
  ('pioneer', 'advanced-trading', 1, 'Complete Advanced Trading to unlock marketplace and tokenization');

-- Row Level Security
ALTER TABLE farmer_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tier" ON farmer_tiers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tier" ON farmer_tiers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tier" ON farmer_tiers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own completions" ON course_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON course_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can read all tiers" ON farmer_tiers FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can read all completions" ON course_completions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Anyone can read tier requirements" ON tier_requirements FOR SELECT TO authenticated USING (true);
