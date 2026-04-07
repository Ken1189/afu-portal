-- Update supplier subscription plan prices to higher tier
-- Devon's pricing: $299, $499, $999

UPDATE supplier_subscription_plans SET price_monthly = 299.00 WHERE slug = 'starter';
UPDATE supplier_subscription_plans SET price_monthly = 499.00 WHERE slug = 'growth';
UPDATE supplier_subscription_plans SET price_monthly = 999.00 WHERE slug = 'pro';

NOTIFY pgrst, 'reload schema';
