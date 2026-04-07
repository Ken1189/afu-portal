import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

/**
 * POST /api/supplier/subscriptions/cancel
 * Cancels the supplier's active subscription at period end.
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
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier not found' }, { status: 404 });
    }

    const { data: sub } = await adminClient
      .from('supplier_subscriptions')
      .select('id, stripe_subscription_id, status')
      .eq('supplier_id', supplier.id)
      .in('status', ['active', 'trialing', 'past_due'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub || !sub.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription to cancel' }, { status: 404 });
    }

    try {
      await getStripe().subscriptions.update(sub.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
    } catch (e) {
      console.error('[supplier cancel] stripe update failed:', e);
      return NextResponse.json({ error: 'Stripe cancel failed' }, { status: 500 });
    }

    await adminClient
      .from('supplier_subscriptions')
      .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
      .eq('id', sub.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[supplier cancel] error:', err);
    return NextResponse.json({ error: 'Cancel failed' }, { status: 500 });
  }
}
