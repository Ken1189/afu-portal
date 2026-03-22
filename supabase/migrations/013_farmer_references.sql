-- Migration 013: Farmer References for KYC
-- Character references from community leaders, cooperative heads, or established farmers

CREATE TABLE IF NOT EXISTS farmer_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reference person details
  reference_name TEXT NOT NULL,
  relationship TEXT NOT NULL, -- e.g., 'cooperative_chairman', 'village_headman', 'fellow_farmer', 'church_leader', 'employer', 'family_elder'
  relationship_other TEXT, -- free text if relationship = 'other'
  phone_number TEXT NOT NULL,
  location TEXT, -- village/district
  years_known INTEGER, -- how long they've known the farmer

  -- Reference statement
  statement TEXT, -- optional written reference

  -- Admin verification
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'contacted', 'verified', 'failed', 'unreachable')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT, -- admin notes from phone call

  -- Whether this is primary or secondary reference
  is_primary BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS idx_farmer_references_farmer ON farmer_references(farmer_id);
CREATE INDEX IF NOT EXISTS idx_farmer_references_status ON farmer_references(verification_status);

-- RLS
ALTER TABLE farmer_references ENABLE ROW LEVEL SECURITY;

-- Farmers can see and manage their own references
CREATE POLICY "Farmers can view own references" ON farmer_references
  FOR SELECT USING (auth.uid() = farmer_id);

CREATE POLICY "Farmers can insert own references" ON farmer_references
  FOR INSERT WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Farmers can update own references" ON farmer_references
  FOR UPDATE USING (auth.uid() = farmer_id);

-- Admins can see and verify all references
CREATE POLICY "Admins can view all references" ON farmer_references
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

CREATE POLICY "Admins can update all references" ON farmer_references
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- Service role bypass
CREATE POLICY "Service role full access" ON farmer_references
  FOR ALL USING (auth.role() = 'service_role');
