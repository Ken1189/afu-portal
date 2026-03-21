import Stripe from 'stripe';

let _stripe: Stripe | null = null;

/** Lazily initialise Stripe so the build never crashes when the key is absent. */
export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Add it in Vercel → Settings → Environment Variables.'
    );
  }

  _stripe = new Stripe(key, {
    apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
    typescript: true,
  });

  return _stripe;
}

// Membership tier pricing (amounts in cents)
export const MEMBERSHIP_PRICES = {
  smallholder: { amount: 500, currency: 'usd', name: 'Smallholder Membership', interval: 'month' as const },
  commercial: { amount: 5000, currency: 'usd', name: 'Commercial Membership', interval: 'month' as const },
  enterprise: { amount: 20000, currency: 'usd', name: 'Enterprise Membership', interval: 'month' as const },
};

// Sponsor tier pricing (amounts in cents)
export const SPONSOR_PRICES = {
  bronze: { amount: 500, currency: 'usd', name: 'Bronze Sponsorship', interval: 'month' as const },
  silver: { amount: 10000, currency: 'usd', name: 'Silver Sponsorship', interval: 'month' as const },
  gold: { amount: 50000, currency: 'usd', name: 'Gold Sponsorship', interval: 'month' as const },
};
