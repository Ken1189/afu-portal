-- ============================================================================
-- 096: Foober Driver Documents — license, roadworthiness, insurance uploads
-- ============================================================================

-- Add document columns to foober_drivers
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS license_photo_url TEXT;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS roadworthiness_photo_url TEXT;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS insurance_photo_url TEXT;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS registration_photo_url TEXT;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS license_expiry DATE;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS roadworthiness_expiry DATE;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS insurance_expiry DATE;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS documents_verified BOOLEAN DEFAULT false;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS vehicle_year INTEGER;
ALTER TABLE foober_drivers ADD COLUMN IF NOT EXISTS vehicle_color TEXT;

-- Add document columns to applications too
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS license_photo_url TEXT;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS roadworthiness_photo_url TEXT;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS insurance_photo_url TEXT;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS registration_photo_url TEXT;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS vehicle_make TEXT;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS vehicle_model TEXT;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS vehicle_year INTEGER;
ALTER TABLE foober_driver_applications ADD COLUMN IF NOT EXISTS vehicle_color TEXT;
