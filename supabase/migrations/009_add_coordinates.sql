-- ============================================================
-- 009: Add geographic coordinates for map feature
-- ============================================================

-- Add lat/lng to farm_plots
ALTER TABLE farm_plots ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE farm_plots ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Add lat/lng to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE members ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Add lat/lng to equipment
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Add lat/lng to cooperatives
ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE cooperatives ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- Add lat/lng to farmer_public_profiles
ALTER TABLE farmer_public_profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,7);
ALTER TABLE farmer_public_profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(10,7);

-- ── Seed coordinates for existing equipment ──────────────────
UPDATE equipment SET latitude = -17.8292, longitude = 31.0522 WHERE location = 'Harare';
UPDATE equipment SET latitude = -1.2921, longitude = 36.8219 WHERE location = 'Nairobi';
UPDATE equipment SET latitude = -6.7924, longitude = 39.2083 WHERE location = 'Dar es Salaam';
UPDATE equipment SET latitude = -13.9626, longitude = 33.7741 WHERE location = 'Lilongwe';
UPDATE equipment SET latitude = -15.3875, longitude = 28.3228 WHERE location = 'Lusaka';
UPDATE equipment SET latitude = 0.3476, longitude = 32.5825 WHERE location = 'Kampala';  -- Uganda
UPDATE equipment SET latitude = -19.8436, longitude = 34.8389 WHERE location = 'Beira';
UPDATE equipment SET latitude = 12.0022, longitude = 8.5920 WHERE location = 'Kano';
UPDATE equipment SET latitude = -6.8235, longitude = 37.6617 WHERE location = 'Morogoro';

-- Fix Addis Ababa coordinates (use correct values for Ethiopia)
UPDATE equipment SET latitude = 9.0192, longitude = 38.7525 WHERE country = 'Ethiopia';

-- ── Seed coordinates for cooperatives ────────────────────────
UPDATE cooperatives SET latitude = -21.0, longitude = 29.0 WHERE country = 'Zimbabwe';
UPDATE cooperatives SET latitude = -0.09, longitude = 34.77 WHERE country = 'Kenya';
UPDATE cooperatives SET latitude = -6.82, longitude = 37.66 WHERE country = 'Tanzania';
UPDATE cooperatives SET latitude = 6.15, longitude = 38.40 WHERE country = 'Ethiopia';
UPDATE cooperatives SET latitude = -13.65, longitude = 32.65 WHERE country = 'Zambia';
UPDATE cooperatives SET latitude = 1.05, longitude = 34.23 WHERE country = 'Uganda';

-- ── Seed coordinates for demo farmer profiles ────────────────
UPDATE farmer_public_profiles SET latitude = -21.0, longitude = 29.0 WHERE slug = 'grace-moyo';
UPDATE farmer_public_profiles SET latitude = -0.09, longitude = 34.77 WHERE slug = 'joseph-odhiambo';
UPDATE farmer_public_profiles SET latitude = -8.35, longitude = 36.40 WHERE slug = 'amina-hussein';
UPDATE farmer_public_profiles SET latitude = -24.65, longitude = 25.91 WHERE slug = 'sipho-dlamini';
UPDATE farmer_public_profiles SET latitude = -12.80, longitude = 28.21 WHERE slug = 'fatima-banda';
UPDATE farmer_public_profiles SET latitude = 6.21, longitude = 6.96 WHERE slug = 'emeka-nwosu';
