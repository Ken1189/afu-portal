/**
 * POST /api/payments/wallet-deposit
 * Creates a Stripe Checkout Session for a one-time wallet deposit.
 * Auth required — amount is credited to the authenticated user's wallet
 * after Stripe confirms payment via the webhook.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';

const schema = z.object({
  amount: z.number().positive('Amount must be positive').max(50000, 'Maximum deposit is $50,000'),
  currency: z.string().length(3).default('usd'),
  wallet_id: z.string().min(1, 'wallet_id is required'),
  returnUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Must be authenticated
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Bail early if Stripe is not configured
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    const { amount, currency, wallet_id, returnUrl } = parsed.data;

    // Verify wallet ownership
    const adminClient = await createAdminClient();
    const { data: wallet, error: walletErr } = await adminClient
      .from('wallet_accounts')
      .select('id, user_id, currency, account_number')
      .eq('id', wallet_id)
      .single();

    if (walletErr || !wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }
    if (wallet.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Amount in cents for Stripe
    const amountCents = Math.round(amount * 100);

    // Build URLs
    const origin = req.nextUrl.origin;
    const successUrl = returnUrl || `${origin}/dashboard/wallet`;
    const cancelUrl = `${origin}/dashboard/wallet`;

    // Create Stripe Checkout Session (one-time payment, not subscription)
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: amountCents,
            product_data: {
              name: 'Wallet Deposit',
              description: `AFU Wallet deposit — ${wallet.account_number || 'Main Wallet'}`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${successUrl}?deposit=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cancelUrl}?deposit=cancelled`,
      metadata: {
        type: 'wallet_deposit',
        wallet_id,
        user_id: user.id,
        amount: amount.toString(),
        currency,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('POST /api/payments/wallet-deposit error:', err);

    if (err instanceof Error && err.message) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
