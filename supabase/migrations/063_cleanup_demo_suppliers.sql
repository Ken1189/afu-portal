-- ============================================================================
-- 063_cleanup_demo_suppliers.sql
--
-- REVIEW THIS MIGRATION CAREFULLY BEFORE RUNNING.
--
-- Purpose: Remove demo/seed suppliers from the suppliers table while
-- preserving all real signups.
--
-- A "real" supplier is identified by having a profile_id (i.e. they signed
-- up via Supabase Auth and were linked to a profile). Seed suppliers from
-- supabase/seed.sql were inserted WITHOUT a profile_id and use placeholder
-- contact emails on test/demo domains.
--
-- Real suppliers (with profile_id, real email) will NOT be deleted.
--
-- ── Step 1: Preview what WILL be deleted (run this first) ──────────────────
--
--   SELECT id, company_name, email, profile_id, created_at
--   FROM suppliers
--   WHERE profile_id IS NULL
--      OR email ILIKE '%example.com'
--      OR email ILIKE '%test%'
--      OR email ILIKE '%demo%'
--      OR email ILIKE '%fake%'
--      OR company_name ILIKE '%demo%'
--      OR company_name ILIKE '%test%'
--      OR company_name ILIKE '%sample%'
--      OR company_name ILIKE '%acme%'
--      -- Known seed company names from supabase/seed.sql
--      OR company_name IN (
--        'Kalahari Seeds',
--        'ZimEquip Solutions',
--        'TanzaLogistics',
--        'AgroProcess BW',
--        'FarmTech Africa',
--        'Agri Finance Corp',
--        'Green Harvest Seeds',
--        'Safari Transport',
--        'BotswanaGrow Tech',
--        'MaizeKing Processors',
--        'Zambezi Agri-Supplies'
--      );
--
-- ── Step 2: Count how many will be deleted ─────────────────────────────────
--
--   SELECT COUNT(*) AS demo_supplier_count
--   FROM suppliers
--   WHERE profile_id IS NULL
--      OR email ILIKE '%example.com'
--      OR email ILIKE '%test%'
--      OR email ILIKE '%demo%'
--      OR email ILIKE '%fake%'
--      OR company_name ILIKE '%demo%'
--      OR company_name ILIKE '%test%'
--      OR company_name ILIKE '%sample%'
--      OR company_name ILIKE '%acme%'
--      OR company_name IN (
--        'Kalahari Seeds','ZimEquip Solutions','TanzaLogistics','AgroProcess BW',
--        'FarmTech Africa','Agri Finance Corp','Green Harvest Seeds',
--        'Safari Transport','BotswanaGrow Tech','MaizeKing Processors',
--        'Zambezi Agri-Supplies'
--      );
--
-- ── Step 3: Run the actual delete (uncomment below or run directly) ────────

BEGIN;

DELETE FROM suppliers
WHERE profile_id IS NULL
   OR email ILIKE '%example.com'
   OR email ILIKE '%test%'
   OR email ILIKE '%demo%'
   OR email ILIKE '%fake%'
   OR company_name ILIKE '%demo%'
   OR company_name ILIKE '%test%'
   OR company_name ILIKE '%sample%'
   OR company_name ILIKE '%acme%'
   OR company_name IN (
     'Kalahari Seeds',
     'ZimEquip Solutions',
     'TanzaLogistics',
     'AgroProcess BW',
     'FarmTech Africa',
     'Agri Finance Corp',
     'Green Harvest Seeds',
     'Safari Transport',
     'BotswanaGrow Tech',
     'MaizeKing Processors',
     'Zambezi Agri-Supplies'
   );

-- If the count looks right, COMMIT. Otherwise ROLLBACK.
COMMIT;
-- ROLLBACK;
