-- Migration 050: Enum reconciliation + missing columns
-- Adds enum values and columns referenced by application code
-- that may not yet exist in the database.

-- Add missing values to user_role enum
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'farmer';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'ambassador';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'investor';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'partner';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'warehouse_operator';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Add missing membership_tier values
DO $$ BEGIN
  ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'free';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'enterprise';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE membership_tier ADD VALUE IF NOT EXISTS 'partner';
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- If the enums don't exist at all (because Supabase started without 001 migration),
-- the ALTER TYPE will fail silently in the EXCEPTION block. In that case,
-- the columns are likely TEXT and don't need enum changes.

-- Add missing columns that code references
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS profile_id UUID;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS order_item_id UUID;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS payout_id UUID;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE loans ADD COLUMN IF NOT EXISTS next_payment_amount DECIMAL(12,2);
ALTER TABLE carbon_purchases ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS application_type TEXT;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE membership_applications ADD COLUMN IF NOT EXISTS notes TEXT;

-- Indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_members_stripe_subscription ON members(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_profile_id ON suppliers(profile_id);
CREATE INDEX IF NOT EXISTS idx_commissions_payout_id ON commissions(payout_id);

-- Reload schema
NOTIFY pgrst, 'reload schema';
