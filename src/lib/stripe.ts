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
export const MEMBERSHIP_PRICES: Record<string, { amount: number; currency: string; name: string; interval: 'month' }> = {
  smallholder: { amount: 499, currency: 'usd', name: 'Smallholder Membership', interval: 'month' },
  bronze: { amount: 4900, currency: 'usd', name: 'Commercial Bronze Membership', interval: 'month' },
  gold: { amount: 49900, currency: 'usd', name: 'Commercial Gold Membership', interval: 'month' },
  platinum: { amount: 99900, currency: 'usd', name: 'Commercial Platinum Membership', interval: 'month' },
};

// Sponsor tier pricing (amounts in cents)
export const SPONSOR_PRICES: Record<string, { amount: number; currency: string; name: string; interval: 'month' }> = {
  bronze: { amount: 500, currency: 'usd', name: 'Bronze Sponsorship', interval: 'month' },
  silver: { amount: 10000, currency: 'usd', name: 'Silver Sponsorship', interval: 'month' },
  gold: { amount: 50000, currency: 'usd', name: 'Gold Sponsorship', interval: 'month' },
};

// Donation amounts (one-time, amounts in cents)
export const DONATION_AMOUNTS = [1000, 2500, 5000, 10000, 25000, 50000];
