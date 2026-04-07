-- Cleanup demo/seed ambassadors and suppliers showing on homepage
-- These have no real auth user (user_id/profile_id is null) — they're seed data
-- Run the COUNT queries first if you want to preview what will be deleted
--
-- PREVIEW (run first):
--   SELECT COUNT(*) FROM ambassadors WHERE user_id IS NULL;
--   SELECT COUNT(*) FROM suppliers WHERE profile_id IS NULL;
--   SELECT full_name FROM ambassadors WHERE user_id IS NULL;
--   SELECT company_name FROM suppliers WHERE profile_id IS NULL;
--
-- Then run this migration to delete them.

BEGIN;

-- ============================================================================
-- Delete demo ambassadors (no auth user attached)
-- ============================================================================
DELETE FROM ambassadors WHERE user_id IS NULL;

-- Also remove ambassadors with obvious demo names from prior seed
DELETE FROM ambassadors
WHERE full_name IN (
  'Grace Moyo',
  'Joseph Odhiambo',
  'Amina Hussein',
  'Sipho Dlamini',
  'Fatima Diallo',
  'Peter Kamau'
);

-- ============================================================================
-- Delete demo suppliers (no auth user attached)
-- ============================================================================
DELETE FROM suppliers WHERE profile_id IS NULL;

-- Also remove obvious demo suppliers by name
DELETE FROM suppliers
WHERE company_name IN (
  'Kalahari Seeds Co.',
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

-- ============================================================================
-- Cleanup orphan related rows
-- ============================================================================

-- Products tied to deleted suppliers
DELETE FROM products WHERE supplier_id NOT IN (SELECT id FROM suppliers);

-- Ambassador commissions/referrals tied to deleted ambassadors
DO $$
BEGIN
  -- ambassador_referrals cleanup (if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ambassador_referrals') THEN
    EXECUTE 'DELETE FROM ambassador_referrals WHERE ambassador_id NOT IN (SELECT id FROM ambassadors)';
  END IF;

  -- ambassador_commissions cleanup (the dedicated table, not generic commissions)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ambassador_commissions') THEN
    EXECUTE 'DELETE FROM ambassador_commissions WHERE ambassador_id NOT IN (SELECT id FROM ambassadors)';
  END IF;

  -- commissions table uses supplier_id only — clean up orphans from deleted suppliers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'commissions') THEN
    EXECUTE 'DELETE FROM commissions WHERE supplier_id NOT IN (SELECT id FROM suppliers)';
  END IF;
END$$;

COMMIT;

-- Verify after running:
--   SELECT COUNT(*) FROM ambassadors;  -- should now be 0 or only real signups
--   SELECT COUNT(*) FROM suppliers;    -- should now be 0 or only real signups
