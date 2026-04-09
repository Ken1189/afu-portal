-- Add Stripe Payment Link column to supplier subscription plans
ALTER TABLE supplier_subscription_plans
  ADD COLUMN IF NOT EXISTS stripe_payment_link TEXT;

-- Store Peter's 3 Stripe Payment Links (starter, growth, pro)
UPDATE supplier_subscription_plans
  SET stripe_payment_link = 'https://buy.stripe.com/3cI7sM9Y36Wn8B8d8cgw001'
  WHERE slug = 'starter';

UPDATE supplier_subscription_plans
  SET stripe_payment_link = 'https://buy.stripe.com/3cI28s1rx5Sj9Fcfgkgw002'
  WHERE slug = 'growth';

UPDATE supplier_subscription_plans
  SET stripe_payment_link = 'https://buy.stripe.com/4gMfZi0nt5Sj3gOecggw003'
  WHERE slug = 'pro';
