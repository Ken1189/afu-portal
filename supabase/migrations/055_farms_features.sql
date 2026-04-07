-- 055_farms_features.sql
-- Adds the parent `farms` table so farmers can register a farm before
-- adding child crops/livestock. Existing farm_plots and livestock rows
-- get an optional farm_id column to link them to a parent farm.

CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  member_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  country TEXT,
  region TEXT,
  hectares DECIMAL(12,2) DEFAULT 0,
  gps_lat DECIMAL(10,7),
  gps_lng DECIMAL(10,7),
  photo_url TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE farms DISABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_member_id ON farms(member_id);

-- Link existing crops/livestock to farms
ALTER TABLE farm_plots ADD COLUMN IF NOT EXISTS farm_id UUID;
ALTER TABLE livestock ADD COLUMN IF NOT EXISTS farm_id UUID;

CREATE INDEX IF NOT EXISTS idx_farm_plots_farm_id ON farm_plots(farm_id);
CREATE INDEX IF NOT EXISTS idx_livestock_farm_id ON livestock(farm_id);

NOTIFY pgrst, 'reload schema';
