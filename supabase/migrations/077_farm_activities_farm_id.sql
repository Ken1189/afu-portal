-- Add farm_id to farm_activities so journal entries can be filtered per-farm
ALTER TABLE farm_activities ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES farms(id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_farm_id ON farm_activities(farm_id);
