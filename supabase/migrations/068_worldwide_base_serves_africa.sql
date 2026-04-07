-- 068_worldwide_base_serves_africa.sql
-- Worldwide-based + Serves African Countries pattern.
-- Ambassadors, suppliers, investors, partners can be based ANYWHERE in the world
-- but they explicitly target/serve specific African countries.
--
-- - ambassadors: already have a `regions` text[] from migration 036 (repurposed as "countries served")
-- - suppliers: add serves_countries
-- - investor_interest: add target_countries (African countries they want to fund) — only if table exists
-- - managed_partners: add serves_countries — only if table exists

ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS serves_countries TEXT[];

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'investor_interest') THEN
    EXECUTE 'ALTER TABLE investor_interest ADD COLUMN IF NOT EXISTS target_countries TEXT[]';
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'managed_partners') THEN
    EXECUTE 'ALTER TABLE managed_partners ADD COLUMN IF NOT EXISTS serves_countries TEXT[]';
  END IF;
END$$;

NOTIFY pgrst, 'reload schema';
