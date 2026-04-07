-- ============================================================================
-- AFU PORTAL — MIGRATION 066: ADD ETHIOPIA TO COUNTRY LISTS
-- Ensures Ethiopia appears in any country-related seed data, including
-- site_config.countries_data if it exists.
-- ============================================================================

DO $$
DECLARE
  existing jsonb;
  ethiopia jsonb := jsonb_build_object(
    'flag', '🇪🇹',
    'country', 'Ethiopia',
    'role', 'Strategic East Africa Lane',
    'desc', 'Africa''s coffee origin and second-most populous country, with vast highland farming and major export crops including coffee, teff, and oilseeds.',
    'highlights', jsonb_build_array(
      'Coffee origin (world''s 5th largest producer)',
      'Major teff & cereals exporter',
      'Highland & rift valley agroecology',
      'Growing horticulture sector',
      '60+ million in agriculture'
    ),
    'stat', 'East Africa'
  );
BEGIN
  -- Only run if site_config table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'site_config') THEN
    SELECT value INTO existing
      FROM site_config
      WHERE key = 'countries_data';

    IF existing IS NOT NULL AND jsonb_typeof(existing) = 'array' THEN
      -- Only append if Ethiopia isn't already present
      IF NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(existing) AS item
        WHERE lower(item->>'country') = 'ethiopia'
      ) THEN
        UPDATE site_config
          SET value = existing || jsonb_build_array(ethiopia),
              updated_at = NOW()
          WHERE key = 'countries_data';
      END IF;
    END IF;
  END IF;
END $$;

-- Add Ethiopia to a generic `countries` lookup table if one exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'countries') THEN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'countries' AND column_name = 'iso_code'
    ) THEN
      INSERT INTO countries (iso_code, name)
        VALUES ('ET', 'Ethiopia')
        ON CONFLICT DO NOTHING;
    END IF;
  END IF;
END $$;
