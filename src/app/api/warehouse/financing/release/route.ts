import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/warehouse/financing/release
 * Release a warehouse receipt that was pledged as collateral when the
 * backing loan is repaid (status='completed').
 *
 * Body: { loan_id: string }
 *
 * Effects:
 *  - warehouse_receipts.status -> 'active'
 *  - warehouse_receipts.pledged -> false
 *  - warehouse_receipts.pledged_to_loan_id -> null
 *  - receipt_financing.status -> 'released'
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = ['admin', 'super_admin'].includes(profile?.role || '');
  if (!isAdmin) {
    return NextResponse.json({ error: 'Admin only' }, { status: 403 });
  }

  const { loan_id } = await request.json();
  if (!loan_id) {
    return NextResponse.json({ error: 'loan_id is required' }, { status: 400 });
  }

  // Load the loan and verify it's a receipt-backed loan
  const { data: loan, error: loanErr } = await adminClient
    .from('loans')
    .select('*')
    .eq('id', loan_id)
    .single();

  if (loanErr || !loan) {
    return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
  }
  if (loan.collateral_type !== 'warehouse_receipt' || !loan.collateral_id) {
    return NextResponse.json({ error: 'Loan is not backed by a warehouse receipt' }, { status: 400 });
  }

  // Release the receipt
  const { error: receiptErr } = await adminClient
    .from('warehouse_receipts')
    .update({
      status: 'active',
      pledged: false,
      pledged_to_loan_id: null,
    })
    .eq('id', loan.collateral_id);

  if (receiptErr) {
    return NextResponse.json({ error: receiptErr.message }, { status: 500 });
  }

  // Mark receipt_financing as released
  await adminClient
    .from('receipt_financing')
    .update({ status: 'released', updated_at: new Date().toISOString() })
    .eq('loan_id', loan_id);

  // Mark loan as completed if not already
  if (loan.status !== 'completed') {
    await adminClient
      .from('loans')
      .update({ status: 'completed' })
      .eq('id', loan_id);
  }

  return NextResponse.json({ success: true, loan_id, receipt_id: loan.collateral_id });
}
