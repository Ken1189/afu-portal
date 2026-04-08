-- Seed initial investor updates so the /investor/updates page isn't empty.
-- Idempotent: only inserts if no published updates exist yet.
--
-- Migration 048 (master_complete) recreated investor_updates with a stripped
-- schema. Re-add the columns from migration 017 before seeding.

ALTER TABLE investor_updates
  ADD COLUMN IF NOT EXISTS update_type TEXT DEFAULT 'quarterly',
  ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES profiles(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'investor_updates' AND constraint_name = 'investor_updates_update_type_check'
  ) THEN
    ALTER TABLE investor_updates
      ADD CONSTRAINT investor_updates_update_type_check
      CHECK (update_type IN ('quarterly', 'milestone', 'alert', 'report', 'announcement'));
  END IF;
END $$;

INSERT INTO investor_updates (title, body, update_type, metrics, is_published, published_at)
SELECT * FROM (VALUES
  (
    'Q1 2026 Portfolio Update',
    'AFU closed Q1 2026 with strong growth across all key metrics. The Agricultural Debt Fund II reached 68% subscription, deploying capital across 14 cooperatives in 7 countries. Repayment rates remain above 96% across the active portfolio. We onboarded 1,240 new farmers this quarter, exceeding our target by 18%. The blueberry expansion in Zimbabwe delivered its first commercial EU shipment in January, validating the offtake model.',
    'quarterly',
    '{"farmers_onboarded": 1240, "loans_active": 312, "repayment_rate": 0.961, "revenue_ytd_usd": 2840000}'::jsonb,
    true,
    now() - interval '14 days'
  ),
  (
    'Milestone: $5M Deployed Through Cooperative Network',
    'A landmark moment for AFU — we have now deployed over $5M in working capital through our cooperative network since inception. This capital has financed seed, fertilizer, equipment, and warehouse storage for over 4,000 smallholder farmers. Average loan size: $1,250. Average tenor: 8 months. Default rate: under 4%.',
    'milestone',
    '{"total_deployed_usd": 5000000, "farmers_served": 4127, "default_rate": 0.039}'::jsonb,
    true,
    now() - interval '32 days'
  ),
  (
    'New Insurance Pool Live in 5 Countries',
    'Our parametric crop insurance pool is now live in Kenya, Tanzania, Uganda, Zambia, and Zimbabwe. Coverage triggers on satellite-verified rainfall and NDVI thresholds, allowing payouts within 7 days of trigger events versus 60+ days for traditional indemnity insurance. Premium pool at $900K of $2M target.',
    'announcement',
    '{"countries": 5, "premium_pool_usd": 900000, "target_usd": 2000000}'::jsonb,
    true,
    now() - interval '60 days'
  )
) AS new_updates(title, body, update_type, metrics, is_published, published_at)
WHERE NOT EXISTS (SELECT 1 FROM investor_updates WHERE is_published = true);

NOTIFY pgrst, 'reload schema';
