-- Migration 051: Member referral tracking + commission back-links
-- Sprint 2B: Ambassador commission auto-trigger on payment success

BEGIN;

-- Add referral tracking to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS referred_by UUID;
ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_code_used TEXT;
CREATE INDEX IF NOT EXISTS idx_members_referred_by ON members(referred_by);

-- Add reference_id to commission_entries for linking back to the source record
-- (the canonical commissions ledger in this codebase is commission_entries)
ALTER TABLE commission_entries ADD COLUMN IF NOT EXISTS reference_id UUID;
ALTER TABLE commission_entries ADD COLUMN IF NOT EXISTS reference_type TEXT;
CREATE INDEX IF NOT EXISTS idx_commission_entries_reference
  ON commission_entries(reference_id, reference_type);

COMMIT;

NOTIFY pgrst, 'reload schema';
