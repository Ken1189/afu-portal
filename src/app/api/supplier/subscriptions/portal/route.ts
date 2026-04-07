import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

/**
 * POST /api/supplier/subscriptions/portal
 * Returns a Stripe Billing Portal URL for the current supplier.
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    const { data: supplier } = await adminClient
      .from('suppliers')
      .select('id, stripe_customer_id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    let customerId: string | null = supplier.stripe_customer_id || null;

    // Fallback: try to find a customer id from supplier_subscriptions
    if (!customerId) {
      const { data: sub } = await adminClient
        .from('supplier_subscriptions')
        .select('stripe_customer_id')
        .eq('supplier_id', supplier.id)
        .not('stripe_customer_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (sub?.stripe_customer_id) customerId = sub.stripe_customer_id;
    }

    if (!customerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 404 }
      );
    }

    const SITE_URL =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      'https://africanfarmingunion.org';

    try {
      const portalSession = await getStripe().billingPortal.sessions.create({
        customer: customerId,
        return_url: `${SITE_URL}/supplier/billing`,
      });
      return NextResponse.json({ url: portalSession.url });
    } catch (e) {
      console.error('[supplier portal] stripe create failed:', e);
      return NextResponse.json(
        { error: 'Could not open billing portal. Make sure the Stripe portal is configured.' },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error('[supplier portal] error:', err);
    return NextResponse.json({ error: 'Portal failed' }, { status: 500 });
  }
}
