-- Promo / coupon code system
-- Admin can create codes, set discounts, expiry, usage limits.
-- Tracks every redemption.

CREATE TABLE IF NOT EXISTS promo_codes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT,
  discount_type   TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value  DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency        TEXT NOT NULL DEFAULT 'USD',
  applies_to      TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'farmer', 'supplier', 'ambassador', 'investor', 'membership', 'subscription')),
  max_uses        INTEGER,                -- NULL = unlimited
  current_uses    INTEGER NOT NULL DEFAULT 0,
  min_amount      DECIMAL(10,2) DEFAULT 0, -- minimum purchase/subscription amount
  starts_at       TIMESTAMPTZ DEFAULT now(),
  expires_at      TIMESTAMPTZ,            -- NULL = never expires
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active) WHERE is_active = true;

CREATE TABLE IF NOT EXISTS promo_code_redemptions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  promo_code_id   UUID NOT NULL REFERENCES promo_codes(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES profiles(id),
  context         TEXT,   -- 'signup', 'membership', 'subscription', 'marketplace'
  discount_applied DECIMAL(10,2) NOT NULL DEFAULT 0,
  redeemed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_redemptions_code ON promo_code_redemptions(promo_code_id);
CREATE INDEX idx_redemptions_user ON promo_code_redemptions(user_id);
