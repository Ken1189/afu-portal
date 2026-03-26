-- Migration 022: Full Advertising Platform
-- Ad packages, directory listings, impression tracking, payments, country targeting

BEGIN;

-- ============================================================================
-- AD PACKAGES (Pricing tiers)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  price_cents     INTEGER NOT NULL,  -- in USD cents
  currency        TEXT NOT NULL DEFAULT 'USD',
  max_impressions INTEGER NOT NULL DEFAULT 5000,
  allowed_types   TEXT[] NOT NULL DEFAULT '{}',  -- banner, featured-product, sponsored-content, sidebar
  max_placements  INTEGER NOT NULL DEFAULT 1,
  duration_days   INTEGER NOT NULL DEFAULT 30,
  country_tier    TEXT,  -- 'tier_1', 'tier_2', 'tier_3', 'all', NULL=any
  includes_newsletter BOOLEAN DEFAULT FALSE,
  includes_push_notification BOOLEAN DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ALTER EXISTING ADVERTISEMENTS TABLE
-- ============================================================================

ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS package_id UUID REFERENCES ad_packages(id);
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS placement_type TEXT DEFAULT 'banner';
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS placement_pages TEXT[] DEFAULT '{}';
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS target_url TEXT;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS target_crops TEXT[] DEFAULT '{}';
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS target_seasons TEXT[] DEFAULT '{}';  -- planting, growing, harvest
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS country_tier TEXT;
ALTER TABLE advertisements ADD COLUMN IF NOT EXISTS creative_type TEXT DEFAULT 'image';  -- image, text, product, content

-- ============================================================================
-- AD IMPRESSIONS (Tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_impressions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id           UUID NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id),
  page            TEXT NOT NULL,
  placement_slot  TEXT NOT NULL,
  country_code    TEXT,
  event_type      TEXT NOT NULL DEFAULT 'impression',  -- impression, click, conversion
  device_type     TEXT,  -- mobile, desktop, tablet
  referrer        TEXT,
  ip_hash         TEXT,  -- hashed IP for dedup, not raw IP
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad ON ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created ON ad_impressions(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_event ON ad_impressions(event_type);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_page ON ad_impressions(page);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_country ON ad_impressions(country_code);
-- Dedup index: one impression per user per ad per page per hour
CREATE INDEX IF NOT EXISTS idx_ad_impressions_dedup ON ad_impressions(ad_id, user_id, page, placement_slot);

-- ============================================================================
-- AD PAYMENTS (Revenue tracking, linked to ledger)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id           UUID REFERENCES advertisements(id),
  supplier_id     UUID NOT NULL,
  package_id      UUID REFERENCES ad_packages(id),
  amount          NUMERIC(12, 2) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USD',
  payment_method  TEXT,  -- stripe, mpesa, ecocash, bank_transfer
  payment_reference TEXT,
  stripe_session_id TEXT,
  ledger_transaction_id UUID,  -- links to ledger_entries.transaction_id
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending, completed, failed, refunded
  invoice_number  TEXT,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_payments_supplier ON ad_payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_ad_payments_ad ON ad_payments(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_payments_status ON ad_payments(status);
CREATE INDEX IF NOT EXISTS idx_ad_payments_created ON ad_payments(created_at);

-- ============================================================================
-- SUPPLIER DIRECTORY (Premium listings)
-- ============================================================================

CREATE TABLE IF NOT EXISTS supplier_directory (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     UUID NOT NULL,
  business_name   TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  description     TEXT,
  logo_url        TEXT,
  cover_image_url TEXT,
  website         TEXT,
  email           TEXT,
  phone           TEXT,
  categories      TEXT[] DEFAULT '{}',  -- seeds, fertiliser, equipment, processing, transport, finance, insurance
  countries       TEXT[] DEFAULT '{}',
  crops_served    TEXT[] DEFAULT '{}',
  is_premium      BOOLEAN DEFAULT FALSE,
  is_verified     BOOLEAN DEFAULT FALSE,
  premium_until   TIMESTAMPTZ,
  featured_order  INTEGER DEFAULT 0,  -- higher = shown first in premium listings
  rating          NUMERIC(3, 2) DEFAULT 0,
  total_reviews   INTEGER DEFAULT 0,
  views           INTEGER DEFAULT 0,
  clicks          INTEGER DEFAULT 0,
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_dir_supplier ON supplier_directory(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_dir_premium ON supplier_directory(is_premium);
CREATE INDEX IF NOT EXISTS idx_supplier_dir_categories ON supplier_directory USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_supplier_dir_countries ON supplier_directory USING GIN(countries);
CREATE INDEX IF NOT EXISTS idx_supplier_dir_crops ON supplier_directory USING GIN(crops_served);
CREATE INDEX IF NOT EXISTS idx_supplier_dir_slug ON supplier_directory(slug);

-- ============================================================================
-- NEWSLETTER SPONSORSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS newsletter_sponsorships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id     UUID NOT NULL,
  ad_id           UUID REFERENCES advertisements(id),
  week_date       DATE NOT NULL,  -- which week's newsletter
  slot            TEXT NOT NULL DEFAULT 'primary',  -- primary, secondary
  headline        TEXT NOT NULL,
  body_text       TEXT NOT NULL,
  image_url       TEXT,
  target_url      TEXT NOT NULL,
  target_countries TEXT[] DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, sent, cancelled
  impressions     INTEGER DEFAULT 0,
  clicks          INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_sponsor_week ON newsletter_sponsorships(week_date);
CREATE INDEX IF NOT EXISTS idx_newsletter_sponsor_status ON newsletter_sponsorships(status);

-- ============================================================================
-- COUNTRY PRICING TIERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS ad_country_tiers (
  country_code    TEXT PRIMARY KEY,
  country_name    TEXT NOT NULL,
  tier            TEXT NOT NULL,  -- tier_1, tier_2, tier_3
  banner_price_cents INTEGER NOT NULL,
  featured_price_cents INTEGER NOT NULL,
  directory_price_cents INTEGER NOT NULL,
  newsletter_price_cents INTEGER NOT NULL,
  is_active       BOOLEAN DEFAULT TRUE
);

INSERT INTO ad_country_tiers (country_code, country_name, tier, banner_price_cents, featured_price_cents, directory_price_cents, newsletter_price_cents) VALUES
  -- Tier 1: Large markets
  ('KE', 'Kenya', 'tier_1', 50000, 30000, 10000, 25000),
  ('ZA', 'South Africa', 'tier_1', 50000, 30000, 10000, 25000),
  ('NG', 'Nigeria', 'tier_1', 50000, 30000, 10000, 25000),
  ('GH', 'Ghana', 'tier_1', 50000, 30000, 10000, 25000),
  -- Tier 2: Medium markets
  ('ZW', 'Zimbabwe', 'tier_2', 30000, 20000, 7500, 15000),
  ('UG', 'Uganda', 'tier_2', 30000, 20000, 7500, 15000),
  ('TZ', 'Tanzania', 'tier_2', 30000, 20000, 7500, 15000),
  ('BW', 'Botswana', 'tier_2', 30000, 20000, 7500, 15000),
  ('RW', 'Rwanda', 'tier_2', 30000, 20000, 7500, 15000),
  ('MZ', 'Mozambique', 'tier_2', 30000, 20000, 7500, 15000),
  -- Tier 3: Emerging markets
  ('EG', 'Egypt', 'tier_3', 15000, 10000, 5000, 10000),
  ('ET', 'Ethiopia', 'tier_3', 15000, 10000, 5000, 10000),
  ('MW', 'Malawi', 'tier_3', 15000, 10000, 5000, 10000),
  ('NA', 'Namibia', 'tier_3', 15000, 10000, 5000, 10000),
  ('SL', 'Sierra Leone', 'tier_3', 15000, 10000, 5000, 10000),
  ('GN', 'Guinea', 'tier_3', 15000, 10000, 5000, 10000),
  ('GW', 'Guinea-Bissau', 'tier_3', 15000, 10000, 5000, 10000),
  ('LR', 'Liberia', 'tier_3', 15000, 10000, 5000, 10000),
  ('ML', 'Mali', 'tier_3', 15000, 10000, 5000, 10000),
  ('CI', 'Ivory Coast', 'tier_3', 15000, 10000, 5000, 10000)
ON CONFLICT (country_code) DO NOTHING;

-- ============================================================================
-- SEED: Ad Packages
-- ============================================================================

INSERT INTO ad_packages (name, slug, description, price_cents, max_impressions, allowed_types, max_placements, duration_days, includes_newsletter, sort_order) VALUES
  ('Starter', 'starter', 'Sidebar ad on 1 page section. Perfect for testing the waters.', 10000, 5000, ARRAY['sidebar'], 1, 30, FALSE, 1),
  ('Growth', 'growth', 'Banner or featured product on up to 3 pages. Great for brand awareness.', 50000, 25000, ARRAY['banner', 'featured-product'], 3, 30, FALSE, 2),
  ('Premium', 'premium', 'Banner + featured product across all pages including homepage. Maximum visibility.', 150000, 75000, ARRAY['banner', 'featured-product', 'sidebar'], 10, 30, TRUE, 3),
  ('Enterprise', 'enterprise', 'All ad types across all portals with priority placement. Includes newsletter sponsorship and push notifications.', 300000, 200000, ARRAY['banner', 'featured-product', 'sponsored-content', 'sidebar'], 99, 30, TRUE, 4)
ON CONFLICT (slug) DO NOTHING;

-- Country-specific packages
INSERT INTO ad_packages (name, slug, description, price_cents, max_impressions, allowed_types, max_placements, duration_days, country_tier, sort_order) VALUES
  ('Kenya Focus', 'kenya-focus', 'All placements in Kenya only. Targeted reach to Kenyan farmers.', 60000, 15000, ARRAY['banner', 'featured-product', 'sidebar'], 5, 30, 'tier_1', 10),
  ('Southern Africa', 'southern-africa', 'Target ZA, BW, ZW, MZ, NA. Regional reach.', 80000, 30000, ARRAY['banner', 'featured-product', 'sidebar'], 5, 30, 'tier_2', 11),
  ('East Africa Bundle', 'east-africa', 'Target KE, UG, TZ, RW. East African reach.', 90000, 35000, ARRAY['banner', 'featured-product', 'sidebar'], 5, 30, 'tier_1', 12),
  ('All Africa', 'all-africa', 'Every country, every placement. Maximum pan-African reach.', 250000, 150000, ARRAY['banner', 'featured-product', 'sponsored-content', 'sidebar'], 99, 30, 'all', 13)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SYSTEM LEDGER ACCOUNTS FOR AD REVENUE
-- ============================================================================

INSERT INTO ledger_accounts (id, account_type, name, currency, is_system, balance) VALUES
  ('00000000-0000-0000-0000-000000000009', 'revenue', 'AFU Ad Revenue - USD', 'USD', TRUE, 0),
  ('00000000-0000-0000-0000-00000000000a', 'escrow', 'AFU Ad Escrow - USD', 'USD', TRUE, 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

ALTER TABLE ad_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_country_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can read packages and country tiers
CREATE POLICY ad_packages_read ON ad_packages FOR SELECT USING (TRUE);
CREATE POLICY ad_country_tiers_read ON ad_country_tiers FOR SELECT USING (TRUE);

-- Everyone can read active directory listings
CREATE POLICY supplier_dir_read ON supplier_directory FOR SELECT USING (TRUE);

-- Suppliers can manage their own directory listing
CREATE POLICY supplier_dir_own_write ON supplier_directory FOR INSERT
  WITH CHECK (TRUE);  -- supplier_id check done in API
CREATE POLICY supplier_dir_own_update ON supplier_directory FOR UPDATE
  USING (TRUE);  -- via service role in API

-- Ad impressions: insert only (tracking), admins can read
CREATE POLICY ad_impressions_insert ON ad_impressions FOR INSERT WITH CHECK (TRUE);
CREATE POLICY ad_impressions_admin_read ON ad_impressions FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- Ad payments: suppliers see their own, admins see all
CREATE POLICY ad_payments_own_read ON ad_payments FOR SELECT
  USING (
    supplier_id IN (SELECT id FROM suppliers WHERE user_id = auth.uid())
    OR auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- Newsletter sponsorships: admins only
CREATE POLICY newsletter_sponsor_admin ON newsletter_sponsorships FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' IN ('admin', 'super_admin')
    )
  );

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DO $$ BEGIN
  CREATE TRIGGER ad_packages_updated_at BEFORE UPDATE ON ad_packages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER supplier_directory_updated_at BEFORE UPDATE ON supplier_directory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
