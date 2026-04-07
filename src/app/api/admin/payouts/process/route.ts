import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

const schema = z.object({
  payoutId: z.string().min(1),
  action: z.enum(['process', 'complete', 'fail']).default('complete'),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/admin/payouts/process
 * Admin-only. Marks a payout as processing/completed/failed.
 * On 'complete', flips related supplier commissions to 'paid'.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify admin role from profiles
    const admin = await createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }
    const { payoutId, action, reference, notes } = parsed.data;

    // Look up the payout
    const { data: payout, error: payoutErr } = await admin
      .from('payouts')
      .select('id, supplier_id, status, amount')
      .eq('id', payoutId)
      .maybeSingle();

    if (payoutErr || !payout) {
      return NextResponse.json({ error: 'Payout not found' }, { status: 404 });
    }

    const nextStatus =
      action === 'process' ? 'processing' : action === 'fail' ? 'failed' : 'completed';

    const { error: updErr } = await admin
      .from('payouts')
      .update({
        status: nextStatus,
        processed_at: new Date().toISOString(),
        processed_by: user.id,
        ...(reference ? { payout_reference: reference } : {}),
        ...(notes ? { notes } : {}),
      })
      .eq('id', payoutId);

    if (updErr) {
      console.error('[payouts/process] update failed:', updErr);
      return NextResponse.json({ error: 'Failed to update payout' }, { status: 500 });
    }

    // If completing, flip the supplier's pending+approved commissions to paid
    if (nextStatus === 'completed' && payout.supplier_id) {
      await admin
        .from('commissions')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('supplier_id', payout.supplier_id)
        .in('status', ['pending', 'approved']);
    }

    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (err) {
    console.error('POST /api/admin/payouts/process error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
