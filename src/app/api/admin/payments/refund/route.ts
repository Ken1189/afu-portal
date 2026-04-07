import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Verify admin
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (!['admin', 'super_admin'].includes(profile?.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { paymentId, reason } = await req.json();

    // Get the payment
    const { data: payment } = await admin.from('payments').select('*').eq('id', paymentId).single();
    if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

    // Refund via Stripe if it has a stripe charge id
    if (payment.provider_reference) {
      try {
        await getStripe().refunds.create({
          payment_intent: payment.provider_reference,
          reason: 'requested_by_customer',
        });
      } catch (err) {
        console.error('[refund] Stripe error:', err);
      }
    }

    // Mark payment refunded
    await admin.from('payments').update({
      status: 'refunded',
      refunded_at: new Date().toISOString(),
      refund_reason: reason,
    }).eq('id', paymentId);

    // Audit log
    await admin.from('audit_log').insert({
      user_id: user.id,
      action: 'payment_refunded',
      entity_id: paymentId,
      details: { reason, amount: payment.amount },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[refund] Error:', err);
    return NextResponse.json({ error: 'Refund failed' }, { status: 500 });
  }
}
