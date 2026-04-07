-- Supplier subscription billing
-- Creates tables, indexes, and RPCs for monthly supplier subscriptions via Stripe

-- ============================================================================
-- supplier_subscription_plans (admin configurable)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_subscription_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,                  -- 'starter','growth','pro'
  name            TEXT NOT NULL,
  description     TEXT,
  price_monthly   NUMERIC(10,2) NOT NULL,                 -- USD
  stripe_price_id TEXT,                                   -- set by admin / env
  product_limit   INTEGER NOT NULL DEFAULT 10,            -- max products
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 15.00,    -- platform commission %
  features        JSONB DEFAULT '[]'::jsonb,              -- bullet list
  is_active       BOOLEAN NOT NULL DEFAULT true,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_plans_active ON supplier_subscription_plans(is_active, display_order);

-- Seed default plans (admin can edit prices/limits via UI)
INSERT INTO supplier_subscription_plans (slug, name, description, price_monthly, product_limit, commission_rate, features, display_order)
VALUES
  ('starter', 'Starter', 'For new suppliers getting started', 29.00, 10, 15.00,
   '["Up to 10 products","Marketplace listing","Basic analytics","Email support"]'::jsonb, 1),
  ('growth', 'Growth', 'For established suppliers scaling up', 99.00, 100, 10.00,
   '["Up to 100 products","Featured listings","Lower commission","Advanced analytics","Priority email support"]'::jsonb, 2),
  ('pro', 'Pro', 'For high-volume suppliers and exporters', 299.00, 9999, 7.00,
   '["Unlimited products","Priority placement","Lowest commission","Dedicated account manager","API access","Phone support"]'::jsonb, 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- supplier_subscriptions (one row per supplier-stripe-subscription)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_subscriptions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id              UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  plan_id                  UUID REFERENCES supplier_subscription_plans(id),
  plan_slug                TEXT NOT NULL,
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT UNIQUE,
  status                   TEXT NOT NULL DEFAULT 'incomplete',
    -- 'incomplete','active','past_due','canceled','unpaid','trialing'
  current_period_start     TIMESTAMPTZ,
  current_period_end       TIMESTAMPTZ,
  cancel_at_period_end     BOOLEAN NOT NULL DEFAULT false,
  canceled_at              TIMESTAMPTZ,
  trial_end                TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_subs_supplier ON supplier_subscriptions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_subs_status ON supplier_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_supplier_subs_stripe ON supplier_subscriptions(stripe_subscription_id);

-- ============================================================================
-- supplier_invoices (history of charges)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplier_invoices (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id           UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  subscription_id       UUID REFERENCES supplier_subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id     TEXT UNIQUE,
  amount                NUMERIC(10,2) NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'usd',
  status                TEXT NOT NULL DEFAULT 'open',
    -- 'open','paid','uncollectible','void'
  invoice_pdf           TEXT,
  hosted_invoice_url    TEXT,
  period_start          TIMESTAMPTZ,
  period_end            TIMESTAMPTZ,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_supplier_invoices_supplier ON supplier_invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_invoices_status ON supplier_invoices(status);

-- ============================================================================
-- Add subscription columns to suppliers table for fast lookups
-- ============================================================================
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS subscription_plan_slug TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS subscription_status TEXT;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMPTZ;

-- ============================================================================
-- RPC: get_supplier_active_plan (returns the active plan for product gating)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_supplier_active_plan(p_supplier_id UUID)
RETURNS TABLE (
  plan_slug TEXT,
  product_limit INTEGER,
  commission_rate NUMERIC,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(p.slug, 'starter') as plan_slug,
    COALESCE(p.product_limit, 10) as product_limit,
    COALESCE(p.commission_rate, 15.00) as commission_rate,
    COALESCE(s.status, 'inactive') as status
  FROM suppliers sup
  LEFT JOIN supplier_subscriptions s
    ON s.supplier_id = sup.id
    AND s.status IN ('active','trialing','past_due')
  LEFT JOIN supplier_subscription_plans p
    ON p.slug = s.plan_slug
  WHERE sup.id = p_supplier_id
  LIMIT 1;
END;
$$;

-- ============================================================================
-- RPC: count_supplier_products (for product limit enforcement)
-- ============================================================================
CREATE OR REPLACE FUNCTION count_supplier_products(p_supplier_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count FROM products WHERE supplier_id = p_supplier_id;
  RETURN v_count;
END;
$$;

-- ============================================================================
-- RLS
-- ============================================================================
ALTER TABLE supplier_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplier_invoices ENABLE ROW LEVEL SECURITY;

-- Plans: anyone authenticated can read active plans
DROP POLICY IF EXISTS plans_select ON supplier_subscription_plans;
CREATE POLICY plans_select ON supplier_subscription_plans
  FOR SELECT USING (is_active = true);

-- Subscriptions: supplier can read their own
DROP POLICY IF EXISTS subs_select_own ON supplier_subscriptions;
CREATE POLICY subs_select_own ON supplier_subscriptions
  FOR SELECT USING (
    supplier_id IN (SELECT id FROM suppliers WHERE profile_id = auth.uid())
  );

-- Invoices: supplier can read their own
DROP POLICY IF EXISTS invoices_select_own ON supplier_invoices;
CREATE POLICY invoices_select_own ON supplier_invoices
  FOR SELECT USING (
    supplier_id IN (SELECT id FROM suppliers WHERE profile_id = auth.uid())
  );

NOTIFY pgrst, 'reload schema';
