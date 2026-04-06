-- 044_payments_member_link.sql
-- Link payments to users/tiers and ensure members table has the columns the
-- Stripe webhook needs to upgrade members on successful checkout.

-- ── members ─────────────────────────────────────────────────────────────────
-- Backwards-compat email column for the legacy webhook lookup path.
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Speed up lookups by profile_id (the canonical user link).
CREATE INDEX IF NOT EXISTS members_profile_id_idx
  ON public.members (profile_id);

CREATE INDEX IF NOT EXISTS members_email_idx
  ON public.members (email);

-- ── payments ────────────────────────────────────────────────────────────────
-- Tier the payment was for (e.g. 'smallholder', 'commercial', 'enterprise').
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS tier TEXT;

-- Direct user link for paid memberships.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE INDEX IF NOT EXISTS payments_user_id_idx
  ON public.payments (user_id);

CREATE INDEX IF NOT EXISTS payments_tier_idx
  ON public.payments (tier);
