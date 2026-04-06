-- 045_supplier_columns.sql
-- Add columns required for the supplier approval flow

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS partner_type TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;

ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS application_type TEXT;

NOTIFY pgrst, 'reload schema';
