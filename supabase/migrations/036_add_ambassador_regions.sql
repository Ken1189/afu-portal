-- Add regions column to ambassadors table
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS regions TEXT[];
-- Also add promotion_plan if missing
ALTER TABLE ambassadors ADD COLUMN IF NOT EXISTS promotion_plan TEXT;
