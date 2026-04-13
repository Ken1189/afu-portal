-- 089: Add email verification columns to membership_applications
-- Supports the free tier email verification flow before auto-approval.

ALTER TABLE membership_applications
  ADD COLUMN IF NOT EXISTS verification_token TEXT,
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_applications_verification_token
  ON membership_applications(verification_token) WHERE verification_token IS NOT NULL;
