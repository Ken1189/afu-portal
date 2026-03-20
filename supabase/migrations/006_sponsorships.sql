-- ============================================================================
-- AFU PORTAL — MIGRATION 006: SPONSOR A FARMER
-- Public farmer profiles + sponsorship tiers + updates feed
-- ============================================================================

CREATE TYPE sponsorship_tier AS ENUM ('bronze', 'silver', 'gold', 'corporate');
CREATE TYPE sponsorship_status AS ENUM ('active', 'paused', 'cancelled', 'completed');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'annual', 'one_time');

-- ============================================================================
-- FARMER PUBLIC PROFILES (opt-in — members choose to be visible)
-- ============================================================================

CREATE TABLE farmer_public_profiles (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id                UUID NOT NULL UNIQUE REFERENCES members(id) ON DELETE CASCADE,
  slug                     TEXT UNIQUE NOT NULL,
  display_name             TEXT NOT NULL,
  story                    TEXT,
  farm_description         TEXT,
  photo_urls               TEXT[] DEFAULT '{}',
  hero_photo_url           TEXT,
  country                  TEXT,
  region                   TEXT,
  crops                    TEXT[] DEFAULT '{}',
  farm_size_ha             DECIMAL(10,2),
  family_members_supported INTEGER,
  years_farming            INTEGER,
  is_active                BOOLEAN DEFAULT true,
  is_featured              BOOLEAN DEFAULT false,
  monthly_funding_needed   DECIMAL(10,2) DEFAULT 100,
  monthly_funding_received DECIMAL(10,2) DEFAULT 0,
  total_sponsors           INTEGER DEFAULT 0,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farmer_profiles_country  ON farmer_public_profiles(country);
CREATE INDEX idx_farmer_profiles_active   ON farmer_public_profiles(is_active);
CREATE INDEX idx_farmer_profiles_featured ON farmer_public_profiles(is_featured);

-- ============================================================================
-- SPONSORSHIPS
-- ============================================================================

CREATE TABLE sponsorships (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_profile_id      UUID NOT NULL REFERENCES farmer_public_profiles(id) ON DELETE CASCADE,
  program_id             UUID REFERENCES programs(id) ON DELETE SET NULL,
  sponsor_name           TEXT NOT NULL,
  sponsor_email          TEXT NOT NULL,
  sponsor_company        TEXT,
  sponsor_country        TEXT,
  tier                   sponsorship_tier NOT NULL DEFAULT 'bronze',
  billing_cycle          billing_cycle NOT NULL DEFAULT 'monthly',
  amount_usd             DECIMAL(10,2) NOT NULL,
  status                 sponsorship_status NOT NULL DEFAULT 'active',
  stripe_subscription_id TEXT,
  stripe_customer_id     TEXT,
  started_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  next_billing_at        TIMESTAMPTZ,
  cancelled_at           TIMESTAMPTZ,
  notes                  TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sponsorships_farmer  ON sponsorships(farmer_profile_id);
CREATE INDEX idx_sponsorships_status  ON sponsorships(status);
CREATE INDEX idx_sponsorships_email   ON sponsorships(sponsor_email);
CREATE INDEX idx_sponsorships_program ON sponsorships(program_id);

-- ============================================================================
-- FARMER UPDATES (seasonal posts — visible to sponsors + public)
-- ============================================================================

CREATE TABLE farmer_updates (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farmer_profile_id  UUID NOT NULL REFERENCES farmer_public_profiles(id) ON DELETE CASCADE,
  title              TEXT NOT NULL,
  content            TEXT NOT NULL,
  photo_urls         TEXT[] DEFAULT '{}',
  program_stage      TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_farmer_updates_profile ON farmer_updates(farmer_profile_id);
CREATE INDEX idx_farmer_updates_date    ON farmer_updates(created_at DESC);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE farmer_public_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships            ENABLE ROW LEVEL SECURITY;
ALTER TABLE farmer_updates          ENABLE ROW LEVEL SECURITY;

-- Farmer profiles: public read when active
CREATE POLICY "Public can view active farmer profiles" ON farmer_public_profiles
  FOR SELECT USING (is_active = true);
CREATE POLICY "Members manage own farmer profile" ON farmer_public_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM members WHERE id = farmer_public_profiles.member_id AND profile_id = auth.uid()));
CREATE POLICY "Admins manage all farmer profiles" ON farmer_public_profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Sponsorships: public insert (anyone can sponsor), admins see all
CREATE POLICY "Anyone can create a sponsorship" ON sponsorships
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins manage all sponsorships" ON sponsorships FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- Farmer updates: public read
CREATE POLICY "Anyone can view farmer updates" ON farmer_updates FOR SELECT USING (true);
CREATE POLICY "Members manage own updates" ON farmer_updates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM farmer_public_profiles fp
    JOIN members m ON m.id = fp.member_id
    WHERE fp.id = farmer_updates.farmer_profile_id AND m.profile_id = auth.uid()
  ));
CREATE POLICY "Admins manage all updates" ON farmer_updates FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin','super_admin')));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_farmer_profiles_updated_at BEFORE UPDATE ON farmer_public_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_sponsorships_updated_at BEFORE UPDATE ON sponsorships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SEED: demo farmer profiles so Sponsor a Farmer page is populated immediately
-- ============================================================================

-- Note: These are seeded without member_id links (demo data).
-- In production, members opt in via their dashboard settings.
-- We use a temporary approach: insert without member_id constraint by using
-- placeholder UUIDs that admins can later link to real members.

-- Seed is intentionally left for when real members opt in via the dashboard.
-- The frontend falls back gracefully to an empty state with a clear CTA.
