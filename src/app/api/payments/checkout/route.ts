import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe, MEMBERSHIP_PRICES, SPONSOR_PRICES } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

const checkoutSchema = z.object({
  type: z.enum(['membership', 'sponsorship']),
  tier: z.string().min(1, 'Tier is required'),
  farmerId: z.string().optional(),
  userId: z.string().optional(),
  email: z.string().email().optional(),
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

    const { type, tier, farmerId, userId, email, successUrl, cancelUrl } = parsed.data;

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

    // Pre-create a payments row with status='pending' so the webhook has
    // something to update once Stripe confirms the charge.
    let paymentId: string | null = null;
    try {
      const adminClient = await createAdminClient();
      const insertPayload: Record<string, unknown> = {
        amount: price.amount / 100,
        currency: price.currency.toUpperCase(),
        status: 'pending',
        provider: 'stripe',
        payment_type: type,
        tier,
      };
      if (userId) insertPayload.user_id = userId;
      if (email) insertPayload.email = email;
      if (farmerId) insertPayload.farmer_id = farmerId;

      const { data: paymentRow, error: paymentErr } = await adminClient
        .from('payments')
        .insert(insertPayload)
        .select('id')
        .single();

      if (paymentErr) {
        console.error('[checkout] Failed to pre-create payments row:', paymentErr);
      } else if (paymentRow) {
        paymentId = paymentRow.id;
      }
    } catch (e) {
      console.error('[checkout] Exception pre-creating payments row:', e);
    }

    // Create Stripe Checkout Session
    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(email ? { customer_email: email } : {}),
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
        ...(userId ? { user_id: userId } : {}),
        ...(email ? { email } : {}),
        ...(paymentId ? { payment_id: paymentId } : {}),
      },
      ...(userId || email
        ? {
            subscription_data: {
              metadata: {
                type,
                tier,
                ...(userId ? { user_id: userId } : {}),
                ...(email ? { email } : {}),
                ...(paymentId ? { payment_id: paymentId } : {}),
              },
            },
          }
        : {}),
    });

    // S2.1: Removed premature PAYMENT_RECEIVED event.
    // Payment is NOT received yet — this is just a checkout session creation.
    // PAYMENT_RECEIVED should only fire from the Stripe webhook after actual payment.

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
