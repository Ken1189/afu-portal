-- ============================================================================
-- 099: Comprehensive farmer fields — farm assets, infrastructure, tech, social, compliance
-- ============================================================================

-- ── Farm Assets ────────────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS tractors_owned INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS vehicles_owned INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS storage_capacity_tons DECIMAL(10,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS water_source TEXT; -- borehole, river, dam, municipal, rainwater
ALTER TABLE members ADD COLUMN IF NOT EXISTS has_greenhouse BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS has_cold_storage BOOLEAN DEFAULT false;

-- ── Crop Detail ────────────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS secondary_crops TEXT[];
ALTER TABLE members ADD COLUMN IF NOT EXISTS crop_rotation_plan TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS harvest_season TEXT; -- e.g. "Mar-May", "Oct-Dec"
ALTER TABLE members ADD COLUMN IF NOT EXISTS avg_yield_per_ha DECIMAL(10,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS total_cultivated_ha DECIMAL(10,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS fallow_land_ha DECIMAL(10,2);

-- ── Livestock Detail ───────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS cattle_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS goats_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS sheep_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS poultry_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS pigs_count INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS other_livestock TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS grazing_area_ha DECIMAL(10,2);

-- ── Infrastructure ─────────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS road_access TEXT; -- tarred, gravel, dirt, none
ALTER TABLE members ADD COLUMN IF NOT EXISTS electricity_source TEXT; -- grid, solar, generator, none
ALTER TABLE members ADD COLUMN IF NOT EXISTS distance_to_market_km DECIMAL(10,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS distance_to_road_km DECIMAL(10,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS has_fencing BOOLEAN DEFAULT false;

-- ── Technology ─────────────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS has_smartphone BOOLEAN DEFAULT true;
ALTER TABLE members ADD COLUMN IF NOT EXISTS internet_access TEXT; -- mobile_data, wifi, none
ALTER TABLE members ADD COLUMN IF NOT EXISTS uses_mobile_banking BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS uses_farm_records BOOLEAN DEFAULT false;
ALTER TABLE members ADD COLUMN IF NOT EXISTS preferred_communication TEXT DEFAULT 'whatsapp'; -- whatsapp, sms, call, email

-- ── Social ─────────────────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS languages_spoken TEXT[]; -- e.g. {'Shona', 'English', 'Ndebele'}
ALTER TABLE members ADD COLUMN IF NOT EXISTS disability_status TEXT; -- none, physical, visual, hearing, other
ALTER TABLE members ADD COLUMN IF NOT EXISTS next_of_kin_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS next_of_kin_phone TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS next_of_kin_relationship TEXT; -- spouse, parent, sibling, child, other

-- ── Compliance / Legal ─────────────────────────────────────────────────────
ALTER TABLE members ADD COLUMN IF NOT EXISTS tax_registration_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS vat_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS farming_license TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS land_deed_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS environmental_compliance TEXT; -- compliant, pending, not_applicable
