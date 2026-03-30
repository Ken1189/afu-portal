-- ============================================================================
-- MIGRATION 030: Add missing onboarding columns to profiles table
-- These columns are required by the POST /api/onboarding/complete endpoint.
-- ============================================================================

-- preferred_language — stores the user's chosen UI language
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT;

-- notification_preferences — JSON object for notification settings
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_preferences JSONB;

-- currency — user's preferred currency
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS currency TEXT;

-- onboarding_completed — flag indicating wizard completion
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- onboarding_completed_at — timestamp of onboarding completion
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- onboarding_metadata — role-specific onboarding data (farm details, supplier info, etc.)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_metadata JSONB;

-- ============================================================================
-- contact_submissions table for the /contact page form
-- ============================================================================

CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT,
  email TEXT NOT NULL,
  organization TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous / unauthenticated users) can submit a contact form
CREATE POLICY "Anyone can submit contact" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "Admins can read contacts" ON contact_submissions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
  );

-- ============================================================================
-- Dispatch columns on warehouse_receipts for the dispatches API
-- ============================================================================

-- These columns extend warehouse_receipts to track dispatch workflow
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS dispatch_status TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS dispatch_destination TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS dispatch_requested_date TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS dispatch_date TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS assigned_grader TEXT;
ALTER TABLE warehouse_receipts ADD COLUMN IF NOT EXISTS dispatch_notes TEXT;
