-- ============================================================================
-- 095: Foober Logistics — Uber-style delivery platform
-- ============================================================================

-- ── Enums ──────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE foober_vehicle_type AS ENUM ('bicycle', 'motorcycle', 'car', 'van', 'truck');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE foober_driver_status AS ENUM ('pending', 'approved', 'active', 'suspended', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE foober_delivery_status AS ENUM ('requested', 'accepted', 'picking_up', 'in_transit', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE foober_package_size AS ENUM ('small', 'medium', 'large', 'extra_large');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE foober_application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ── Add 'driver' to user_role enum if not present ──────────────────────────

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'driver';
EXCEPTION WHEN others THEN NULL;
END $$;

-- ── Foober Drivers ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS foober_drivers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  phone           TEXT,
  email           TEXT,
  vehicle_type    foober_vehicle_type NOT NULL DEFAULT 'motorcycle',
  vehicle_registration TEXT,
  license_number  TEXT,
  status          foober_driver_status NOT NULL DEFAULT 'pending',
  rating          DECIMAL(3,2) DEFAULT 5.00,
  total_deliveries INTEGER DEFAULT 0,
  total_earned    DECIMAL(12,2) DEFAULT 0,
  current_latitude  DECIMAL(10,7),
  current_longitude DECIMAL(10,7),
  is_available    BOOLEAN DEFAULT false,
  country         TEXT,
  region          TEXT,
  city            TEXT,
  avatar_url      TEXT,
  vehicle_photo_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Foober Deliveries ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS foober_deliveries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_number TEXT UNIQUE NOT NULL,
  requester_id    UUID NOT NULL REFERENCES profiles(id),
  driver_id       UUID REFERENCES foober_drivers(id),
  status          foober_delivery_status NOT NULL DEFAULT 'requested',
  pickup_address  TEXT NOT NULL,
  pickup_lat      DECIMAL(10,7),
  pickup_lng      DECIMAL(10,7),
  dropoff_address TEXT NOT NULL,
  dropoff_lat     DECIMAL(10,7),
  dropoff_lng     DECIMAL(10,7),
  distance_km     DECIMAL(10,2),
  description     TEXT,
  package_size    foober_package_size NOT NULL DEFAULT 'medium',
  weight_kg       DECIMAL(10,2),
  fee             DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency        TEXT DEFAULT 'USD',
  platform_commission DECIMAL(12,2) DEFAULT 0,
  driver_payout   DECIMAL(12,2) DEFAULT 0,
  order_id        UUID REFERENCES orders(id),
  pickup_time     TIMESTAMPTZ,
  dropoff_time    TIMESTAMPTZ,
  notes           TEXT,
  photo_proof_url TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Foober Driver Applications ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS foober_driver_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  country         TEXT,
  region          TEXT,
  city            TEXT,
  vehicle_type    foober_vehicle_type NOT NULL DEFAULT 'motorcycle',
  vehicle_registration TEXT,
  license_number  TEXT,
  experience_description TEXT,
  promo_code      TEXT,
  status          foober_application_status NOT NULL DEFAULT 'pending',
  reviewed_by     UUID REFERENCES profiles(id),
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── Foober Pricing Config (admin-manageable) ───────────────────────────────

CREATE TABLE IF NOT EXISTS foober_pricing (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country         TEXT NOT NULL DEFAULT 'default',
  vehicle_type    foober_vehicle_type NOT NULL,
  base_rate       DECIMAL(10,2) NOT NULL DEFAULT 2.00,
  per_km_rate     DECIMAL(10,4) NOT NULL DEFAULT 0.20,
  min_fee         DECIMAL(10,2) NOT NULL DEFAULT 3.00,
  platform_commission_pct DECIMAL(5,4) NOT NULL DEFAULT 0.15,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(country, vehicle_type)
);

-- ── Seed default pricing ───────────────────────────────────────────────────

INSERT INTO foober_pricing (country, vehicle_type, base_rate, per_km_rate, min_fee, platform_commission_pct)
VALUES
  ('default', 'bicycle',    1.00, 0.10, 2.00, 0.15),
  ('default', 'motorcycle', 2.00, 0.15, 3.00, 0.15),
  ('default', 'car',        3.00, 0.20, 5.00, 0.15),
  ('default', 'van',        4.00, 0.30, 8.00, 0.15),
  ('default', 'truck',      5.00, 0.50, 12.00, 0.15)
ON CONFLICT (country, vehicle_type) DO NOTHING;

-- ── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_foober_drivers_profile ON foober_drivers(profile_id);
CREATE INDEX IF NOT EXISTS idx_foober_drivers_status ON foober_drivers(status);
CREATE INDEX IF NOT EXISTS idx_foober_drivers_available ON foober_drivers(is_available) WHERE is_available = true;
CREATE INDEX IF NOT EXISTS idx_foober_deliveries_requester ON foober_deliveries(requester_id);
CREATE INDEX IF NOT EXISTS idx_foober_deliveries_driver ON foober_deliveries(driver_id);
CREATE INDEX IF NOT EXISTS idx_foober_deliveries_status ON foober_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_foober_deliveries_order ON foober_deliveries(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foober_applications_status ON foober_driver_applications(status);

-- ── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE foober_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE foober_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE foober_driver_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE foober_pricing ENABLE ROW LEVEL SECURITY;

-- Drivers: own record + admin
CREATE POLICY "Drivers can view own record" ON foober_drivers
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Drivers can update own record" ON foober_drivers
  FOR UPDATE USING (profile_id = auth.uid());
CREATE POLICY "Admins manage drivers" ON foober_drivers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );
-- Public can view available drivers (for matching)
CREATE POLICY "Anyone can view available drivers" ON foober_drivers
  FOR SELECT USING (status = 'active' AND is_available = true);

-- Deliveries: requester sees own, driver sees assigned, admin sees all
CREATE POLICY "Requesters can view own deliveries" ON foober_deliveries
  FOR SELECT USING (requester_id = auth.uid());
CREATE POLICY "Requesters can create deliveries" ON foober_deliveries
  FOR INSERT WITH CHECK (requester_id = auth.uid());
CREATE POLICY "Drivers can view assigned deliveries" ON foober_deliveries
  FOR SELECT USING (
    driver_id IN (SELECT id FROM foober_drivers WHERE profile_id = auth.uid())
  );
CREATE POLICY "Drivers can update assigned deliveries" ON foober_deliveries
  FOR UPDATE USING (
    driver_id IN (SELECT id FROM foober_drivers WHERE profile_id = auth.uid())
  );
CREATE POLICY "Admins manage deliveries" ON foober_deliveries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Applications: public insert, admin manage
CREATE POLICY "Anyone can submit driver application" ON foober_driver_applications
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Applicants can view own" ON foober_driver_applications
  FOR SELECT USING (email = (SELECT email FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Admins manage applications" ON foober_driver_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Pricing: public read, admin write
CREATE POLICY "Anyone can read pricing" ON foober_pricing
  FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing" ON foober_pricing
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ── Delivery number sequence helper ────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_foober_delivery_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'FOO-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(
    (SELECT COALESCE(MAX(CAST(SUBSTRING(delivery_number FROM 14) AS INTEGER)), 0) + 1
     FROM foober_deliveries
     WHERE delivery_number LIKE 'FOO-' || to_char(now(), 'YYYYMMDD') || '-%')::TEXT,
    3, '0'
  );
END;
$$ LANGUAGE plpgsql;
