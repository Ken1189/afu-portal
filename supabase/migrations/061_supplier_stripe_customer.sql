-- Add stripe_customer_id to suppliers table for fast Stripe customer lookups
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
CREATE INDEX IF NOT EXISTS idx_suppliers_stripe_customer ON suppliers(stripe_customer_id);

NOTIFY pgrst, 'reload schema';
