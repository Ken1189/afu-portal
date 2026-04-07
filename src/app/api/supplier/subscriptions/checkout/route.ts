import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

/**
 * POST /api/supplier/subscriptions/checkout
 * Body: { planSlug: 'starter' | 'growth' | 'pro' }
 * Creates a Stripe Checkout Session in subscription mode for the supplier.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Auth
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // 2. Parse body
    const body = await request.json().catch(() => ({}));
    const planSlug = String(body.planSlug || '').toLowerCase();
    if (!['starter', 'growth', 'pro'].includes(planSlug)) {
      return NextResponse.json({ error: 'Invalid plan slug' }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    // 3. Find supplier for this user
    const { data: supplier, error: supErr } = await adminClient
      .from('suppliers')
      .select('id, email, company_name, stripe_customer_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (supErr || !supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    // 4. Look up the plan
    const { data: plan, error: planErr } = await adminClient
      .from('supplier_subscription_plans')
      .select('id, slug, name, price_monthly, stripe_price_id')
      .eq('slug', planSlug)
      .maybeSingle();

    if (planErr || !plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // 5. Resolve Stripe price ID (DB value or env fallback)
    const envKey = `STRIPE_PRICE_${planSlug.toUpperCase()}`;
    const stripePriceId =
      plan.stripe_price_id || (process.env[envKey] as string | undefined);

    const stripe = getStripe();

    // 6. Get or create Stripe customer
    let stripeCustomerId: string | null = supplier.stripe_customer_id || null;
    if (!stripeCustomerId) {
      try {
        const customer = await stripe.customers.create({
          email: supplier.email || user.email || undefined,
          name: supplier.company_name || undefined,
          metadata: { supplier_id: supplier.id, profile_id: user.id },
        });
        stripeCustomerId = customer.id;
        await adminClient
          .from('suppliers')
          .update({ stripe_customer_id: stripeCustomerId })
          .eq('id', supplier.id);
      } catch (e) {
        console.error('[supplier checkout] customer create failed:', e);
      }
    }

    // 7. Build line items — prefer price ID, else inline price_data
    const lineItems: Array<Record<string, unknown>> = stripePriceId
      ? [{ price: stripePriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(Number(plan.price_monthly) * 100),
              product_data: {
                name: `AFU Supplier — ${plan.name}`,
                description: `African Farming Union ${plan.name} subscription`,
              },
              recurring: { interval: 'month' },
            },
            quantity: 1,
          },
        ];

    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      'https://africanfarmingunion.org';

    const metadata = {
      supplier_id: supplier.id,
      plan_slug: planSlug,
      type: 'supplier_subscription',
    };

    // 8. Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      ...(stripeCustomerId
        ? { customer: stripeCustomerId }
        : supplier.email
          ? { customer_email: supplier.email }
          : {}),
      line_items: lineItems as never,
      success_url: `${SITE_URL}/supplier/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
      cancel_url: `${SITE_URL}/supplier/billing?canceled=1`,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[supplier checkout] error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
