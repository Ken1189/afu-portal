-- Service Providers Directory + Service Requests
-- Approved providers appear in the public directory and can receive farmer requests

-- =============================================================================
-- service_providers — approved providers listed in the directory
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  application_id UUID REFERENCES service_provider_applications(id),
  provider_type TEXT NOT NULL CHECK (provider_type IN ('trader', 'vet', 'offtaker', 'processing_hub')),

  -- Display info
  display_name TEXT NOT NULL,
  business_name TEXT,
  email TEXT,
  phone TEXT,
  country TEXT NOT NULL,
  region TEXT,
  bio TEXT,
  photo_url TEXT,
  website TEXT,

  -- Provider-specific details (copied from application)
  provider_details JSONB DEFAULT '{}',

  -- Directory
  is_listed BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,

  -- Subscription
  subscription_status TEXT DEFAULT 'free',
  subscription_plan TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_providers_type ON service_providers(provider_type);
CREATE INDEX IF NOT EXISTS idx_service_providers_country ON service_providers(country);
CREATE INDEX IF NOT EXISTS idx_service_providers_listed ON service_providers(is_listed);
CREATE INDEX IF NOT EXISTS idx_service_providers_profile ON service_providers(profile_id);

-- =============================================================================
-- service_requests — farmer bookings / inquiries to providers
-- =============================================================================

CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES service_providers(id),
  farmer_id UUID NOT NULL,  -- profile_id of requesting farmer

  request_type TEXT NOT NULL,  -- consultation, booking, quote, general
  subject TEXT NOT NULL,
  description TEXT,
  preferred_date DATE,
  preferred_time TEXT,

  -- For commodity requests
  commodity TEXT,
  quantity DECIMAL(12,2),
  unit TEXT,

  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
  provider_notes TEXT,
  farmer_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_provider ON service_requests(provider_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_farmer ON service_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- =============================================================================
-- RLS — service_providers
-- =============================================================================

ALTER TABLE service_providers ENABLE ROW LEVEL SECURITY;

-- Public can see listed providers (directory browsing)
CREATE POLICY "service_providers_public_read" ON service_providers
  FOR SELECT USING (is_listed = true);

-- Owner can do everything on their own record
CREATE POLICY "service_providers_owner_all" ON service_providers
  FOR ALL USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Admin full access
CREATE POLICY "service_providers_admin_all" ON service_providers
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- =============================================================================
-- RLS — service_requests
-- =============================================================================

ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

-- Farmer can see their own requests
CREATE POLICY "service_requests_farmer_select" ON service_requests
  FOR SELECT USING (farmer_id = auth.uid());

-- Provider can see requests sent to them
CREATE POLICY "service_requests_provider_select" ON service_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = service_requests.provider_id
        AND sp.profile_id = auth.uid()
    )
  );

-- Farmer can create requests
CREATE POLICY "service_requests_farmer_insert" ON service_requests
  FOR INSERT WITH CHECK (farmer_id = auth.uid());

-- Farmer can update their own requests (cancel, add notes)
CREATE POLICY "service_requests_farmer_update" ON service_requests
  FOR UPDATE USING (farmer_id = auth.uid())
  WITH CHECK (farmer_id = auth.uid());

-- Provider can update requests sent to them (accept, reject, complete)
CREATE POLICY "service_requests_provider_update" ON service_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM service_providers sp
      WHERE sp.id = service_requests.provider_id
        AND sp.profile_id = auth.uid()
    )
  );

-- Admin full access
CREATE POLICY "service_requests_admin_all" ON service_requests
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- =============================================================================
-- Grants
-- =============================================================================

GRANT SELECT ON service_providers TO anon, authenticated;
GRANT ALL ON service_providers TO authenticated;

GRANT SELECT, INSERT, UPDATE ON service_requests TO authenticated;
GRANT ALL ON service_requests TO authenticated;
