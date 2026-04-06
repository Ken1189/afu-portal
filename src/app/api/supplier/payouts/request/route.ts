import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

const schema = z.object({
  payoutMethod: z.enum(['mobile_money', 'bank_transfer']).default('bank_transfer'),
  notes: z.string().optional(),
});

/**
 * POST /api/supplier/payouts/request
 * Authenticated supplier endpoint. Sums all pending+approved commissions
 * for the requesting supplier and inserts a 'pending' payout row.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map((i) => i.message).join(', ') },
        { status: 400 }
      );
    }
    const { payoutMethod, notes } = parsed.data;

    const admin = await createAdminClient();

    // Find supplier owned by this profile
    const { data: supplier } = await admin
      .from('suppliers')
      .select('id, company_name')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!supplier) {
      return NextResponse.json({ error: 'No supplier profile found' }, { status: 403 });
    }

    // Sum unpaid commissions
    const { data: commissions } = await admin
      .from('commissions')
      .select('commission_amount, status')
      .eq('supplier_id', supplier.id)
      .in('status', ['pending', 'approved']);

    const total = (commissions || []).reduce(
      (sum, c) => sum + Number(c.commission_amount || 0),
      0
    );

    if (total <= 0) {
      return NextResponse.json(
        { error: 'No commissions available for payout' },
        { status: 400 }
      );
    }

    const { data: payout, error: insErr } = await admin
      .from('payouts')
      .insert({
        supplier_id: supplier.id,
        amount: +total.toFixed(2),
        currency: 'USD',
        status: 'pending',
        payout_method: payoutMethod,
        notes: notes || null,
      })
      .select('id, amount, status')
      .single();

    if (insErr || !payout) {
      console.error('[payouts/request] insert failed:', insErr);
      return NextResponse.json({ error: 'Failed to create payout' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, payout });
  } catch (err) {
    console.error('POST /api/supplier/payouts/request error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
