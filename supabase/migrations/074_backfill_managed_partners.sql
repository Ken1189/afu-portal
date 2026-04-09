-- One-time migration: copy already-approved partner applications into managed_partners
-- so they appear in Admin > Partner Management.

INSERT INTO managed_partners (name, category, country, is_featured, is_published, display_order)
SELECT
  COALESCE(ma.farm_name, ma.full_name, 'Unnamed'),
  'NGO',
  ma.country,
  false,
  true,
  0
FROM membership_applications ma
WHERE ma.application_type = 'partner'
  AND ma.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM managed_partners mp
    WHERE mp.name = COALESCE(ma.farm_name, ma.full_name, 'Unnamed')
      AND mp.country IS NOT DISTINCT FROM ma.country
  );
