-- Expand promo_codes applies_to options and add specific_member_id
-- Removes the old CHECK constraint and replaces with an expanded one

ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_applies_to_check;

ALTER TABLE promo_codes ADD CONSTRAINT promo_codes_applies_to_check
  CHECK (applies_to IN (
    'all', 'farmer', 'supplier', 'ambassador', 'investor', 'membership', 'subscription',
    'enterprise', 'cooperative', 'bulk-order',
    'marketing', 'referral', 'launch', 'seasonal', 'loyalty', 'partner',
    'specific-member'
  ));

-- Add specific_member_id column for targeted promos
ALTER TABLE promo_codes ADD COLUMN IF NOT EXISTS specific_member_id UUID REFERENCES auth.users(id);

-- Index for member lookup
CREATE INDEX IF NOT EXISTS idx_promo_codes_specific_member ON promo_codes(specific_member_id) WHERE specific_member_id IS NOT NULL;
