-- Fix 1: legal_cases → profiles relationship
-- The table references auth.users(id) but queries join on profiles.
-- Since profiles.id = auth.users.id, add a FK to profiles for Supabase schema cache.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'legal_cases_user_id_profiles_fk' AND table_name = 'legal_cases'
  ) THEN
    ALTER TABLE legal_cases
      ADD CONSTRAINT legal_cases_user_id_profiles_fk
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix 2: vet_appointments → profiles relationship (same issue)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'vet_appointments_user_id_profiles_fk' AND table_name = 'vet_appointments'
  ) THEN
    ALTER TABLE vet_appointments
      ADD CONSTRAINT vet_appointments_user_id_profiles_fk
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Fix 3: carbon_credits missing columns used by admin carbon page & sustainability pages
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS credits_earned NUMERIC(12,4) DEFAULT 0;
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS value_usd NUMERIC(12,2) DEFAULT 0;
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS project_type TEXT;
ALTER TABLE carbon_credits ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES profiles(id);

CREATE INDEX IF NOT EXISTS idx_carbon_credits_member ON carbon_credits(member_id);
CREATE INDEX IF NOT EXISTS idx_carbon_credits_verification ON carbon_credits(verification_status);
