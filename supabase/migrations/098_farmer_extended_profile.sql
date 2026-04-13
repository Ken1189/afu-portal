-- ============================================================================
-- 098: Extended Farmer Profile — comprehensive farmer details
-- Fields flow: CSV upload → DB → farmer profile page → farmer portal
-- ============================================================================

-- Add demographic fields to profiles (shared across all roles)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education_level TEXT;

-- Add farming-specific fields to members (farmer-specific)
ALTER TABLE members ADD COLUMN IF NOT EXISTS years_farming INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS number_of_staff INTEGER DEFAULT 0;
ALTER TABLE members ADD COLUMN IF NOT EXISTS household_size INTEGER;
ALTER TABLE members ADD COLUMN IF NOT EXISTS land_ownership TEXT DEFAULT 'owned'; -- owned, leased, communal, family, rented
ALTER TABLE members ADD COLUMN IF NOT EXISTS primary_income_source TEXT DEFAULT 'farming'; -- farming, mixed, off-farm
ALTER TABLE members ADD COLUMN IF NOT EXISTS irrigation_type TEXT; -- rainfed, drip, sprinkler, flood, pivot, none
ALTER TABLE members ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS farming_method TEXT DEFAULT 'conventional'; -- conventional, organic, mixed, conservation
ALTER TABLE members ADD COLUMN IF NOT EXISTS annual_revenue_usd DECIMAL(12,2);
ALTER TABLE members ADD COLUMN IF NOT EXISTS cooperative_name TEXT; -- for CSV tracking, separate from cooperative_members join
ALTER TABLE members ADD COLUMN IF NOT EXISTS nearest_town TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS gps_coordinates TEXT; -- "lat,lng" format for CSV simplicity
ALTER TABLE members ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS mobile_money_number TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS mobile_money_provider TEXT; -- EcoCash, M-Pesa, MTN MoMo, Orange Money, etc.
ALTER TABLE members ADD COLUMN IF NOT EXISTS training_completed TEXT[]; -- e.g. {'crop management', 'financial literacy'}
ALTER TABLE members ADD COLUMN IF NOT EXISTS challenges TEXT[]; -- e.g. {'drought', 'market access', 'financing'}
ALTER TABLE members ADD COLUMN IF NOT EXISTS notes TEXT;
