import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';

const donateSchema = z.object({
  amount: z.number().min(100, 'Minimum donation is $1.00'),
  program: z.string().optional(),
  isMonthly: z.boolean().optional(),
  donorName: z.string().optional(),
  donorEmail: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

/**
 * POST /api/payments/donate
 * Creates a Stripe Checkout Session for one-time or recurring donations.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = donateSchema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    const { amount, program, isMonthly, donorName, donorEmail, successUrl, cancelUrl } = parsed.data;
    const origin = req.nextUrl.origin;
    const success = successUrl || `${origin}/payments/success`;
    const cancel = cancelUrl || `${origin}/donate`;

    const programLabel = program
      ? program.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'General Fund';

    const sessionParams: Parameters<ReturnType<typeof getStripe>['checkout']['sessions']['create']>[0] = {
      mode: isMonthly ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount,
            product_data: {
              name: `Donation — ${programLabel}`,
              description: `African Farming Union ${isMonthly ? 'Monthly ' : ''}Donation`,
            },
            ...(isMonthly ? { recurring: { interval: 'month' as const } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${success}?session_id={CHECKOUT_SESSION_ID}&type=donation`,
      cancel_url: cancel,
      metadata: {
        type: 'donation',
        program: program || 'general',
        isMonthly: isMonthly ? 'true' : 'false',
        ...(donorName ? { donorName } : {}),
      },
      ...(donorEmail ? { customer_email: donorEmail } : {}),
    };

    const session = await getStripe().checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('POST /api/payments/donate error:', err);
    if (err instanceof Error && err.message) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
