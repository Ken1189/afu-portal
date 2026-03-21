import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY not set — payments will not work');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
  typescript: true,
});

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
