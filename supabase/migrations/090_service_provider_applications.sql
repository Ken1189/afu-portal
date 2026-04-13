-- Service Provider Applications — unified table for traders, vets, offtakers, processing hubs
-- Uses JSONB for type-specific details to avoid 50+ nullable columns

CREATE TABLE IF NOT EXISTS service_provider_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Provider type
  provider_type TEXT NOT NULL CHECK (provider_type IN ('trader', 'vet', 'offtaker', 'processing_hub')),

  -- Common fields (all provider types)
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  country TEXT NOT NULL,
  business_name TEXT,
  business_registration TEXT,
  years_experience TEXT,
  website TEXT,
  motivation TEXT,
  referral_source TEXT,   -- referral, social_media, partner, event, web_search, other
  agreed_to_terms BOOLEAN DEFAULT false,

  -- Type-specific details stored as JSONB
  -- Structure varies per provider_type (see documentation)
  provider_details JSONB DEFAULT '{}',

  -- Application status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  admin_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sp_applications_type ON service_provider_applications(provider_type);
CREATE INDEX IF NOT EXISTS idx_sp_applications_status ON service_provider_applications(status);
CREATE INDEX IF NOT EXISTS idx_sp_applications_email ON service_provider_applications(email);
CREATE INDEX IF NOT EXISTS idx_sp_applications_country ON service_provider_applications(country);
CREATE INDEX IF NOT EXISTS idx_sp_applications_created ON service_provider_applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sp_applications_type_status ON service_provider_applications(provider_type, status);

-- RLS
ALTER TABLE service_provider_applications ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "sp_applications_admin_all" ON service_provider_applications
  FOR ALL USING (public.is_admin_or_super())
  WITH CHECK (public.is_admin_or_super());

-- Public insert (signup forms are public)
CREATE POLICY "sp_applications_public_insert" ON service_provider_applications
  FOR INSERT WITH CHECK (true);

-- Grants
GRANT SELECT ON service_provider_applications TO authenticated;
GRANT INSERT ON service_provider_applications TO anon, authenticated;
GRANT ALL ON service_provider_applications TO authenticated;

-- Drop the trader_applications table if it was created by the old migration
DROP TABLE IF EXISTS trader_applications;
