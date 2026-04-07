-- Move costa@truxmax.eu from member/farmer to supplier
-- This creates a suppliers row tied to their existing profile and updates their role.
-- Devon will send the welcome email manually via the admin /admin/messaging or the
-- "Resend welcome" button — OR run the API call documented in the README at the bottom.

-- Step 1: Find their profile
DO $$
DECLARE
  v_profile_id UUID;
  v_full_name TEXT;
  v_email TEXT := 'costa@truxmax.eu';
  v_country TEXT;
BEGIN
  SELECT id, full_name, country INTO v_profile_id, v_full_name, v_country
  FROM profiles WHERE email = v_email;

  IF v_profile_id IS NULL THEN
    RAISE NOTICE 'No profile found for %, aborting', v_email;
    RETURN;
  END IF;

  -- Step 2: Promote role to supplier
  UPDATE profiles SET role = 'supplier' WHERE id = v_profile_id;

  -- Step 3: Add 'supplier' to their capabilities (if 064 has run)
  BEGIN
    UPDATE profiles
    SET capabilities = array_append(COALESCE(capabilities, '{}'::text[]), 'supplier')
    WHERE id = v_profile_id
      AND NOT ('supplier' = ANY(COALESCE(capabilities, '{}'::text[])));
  EXCEPTION WHEN undefined_column THEN
    RAISE NOTICE 'capabilities column not present yet — run migration 064 first';
  END;

  -- Step 4: Create a suppliers row if they don't have one
  IF NOT EXISTS (SELECT 1 FROM suppliers WHERE profile_id = v_profile_id) THEN
    INSERT INTO suppliers (
      profile_id, company_name, contact_name, email, category, country, status, verified
    ) VALUES (
      v_profile_id,
      COALESCE(v_full_name, 'Costa') || ' (TruxMax)',
      COALESCE(v_full_name, 'Costa'),
      v_email,
      'logistics',     -- TruxMax is a logistics company; change if wrong
      COALESCE(v_country, 'Unknown'),
      'active',
      false
    );
    RAISE NOTICE 'Created suppliers row for %', v_email;
  ELSE
    RAISE NOTICE 'suppliers row already exists for %', v_email;
  END IF;

  RAISE NOTICE 'Done. Costa is now a supplier. Send the welcome email via /admin/messaging or the "Resend welcome" admin action.';
END$$;
