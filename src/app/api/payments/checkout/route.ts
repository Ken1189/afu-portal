import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, MEMBERSHIP_PRICES, SPONSOR_PRICES } from '@/lib/stripe';

const checkoutSchema = z.object({
  type: z.enum(['membership', 'sponsorship']),
  tier: z.string().min(1, 'Tier is required'),
  farmerId: z.string().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/payments/checkout
 * Creates a Stripe Checkout Session for membership or sponsorship payments.
 * Public endpoint — no auth required.
 */
export async function POST(req: NextRequest) {
  try {
    // Bail early if Stripe is not configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    const { type, tier, farmerId, successUrl, cancelUrl } = parsed.data;

    // Look up pricing
    type PriceEntry = { amount: number; currency: string; name: string; interval: 'month' };
    const priceMap: Record<string, PriceEntry> =
      type === 'membership' ? MEMBERSHIP_PRICES : SPONSOR_PRICES;
    const price = priceMap[tier];

    if (!price) {
      const validTiers = Object.keys(priceMap).join(', ');
      return NextResponse.json(
        { error: `Invalid tier "${tier}" for ${type}. Valid tiers: ${validTiers}` },
        { status: 400 }
      );
    }

    // Build URLs
    const origin = req.nextUrl.origin;
    const success = successUrl || `${origin}/payments/success`;
    const cancel = cancelUrl || `${origin}/payments/cancel`;

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: price.currency,
            unit_amount: price.amount,
            product_data: {
              name: price.name,
              description: `African Farming Union — ${price.name}`,
            },
            recurring: {
              interval: price.interval,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${success}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel,
      metadata: {
        type,
        tier,
        ...(farmerId ? { farmerId } : {}),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('POST /api/payments/checkout error:', err);

    // Surface Stripe-specific error messages when possible
    if (err instanceof Error && err.message) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
