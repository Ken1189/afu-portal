import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id').eq('profile_id', user.id).single();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  return member
    ? { userId: user.id, memberId: member.id, isAdmin: ['admin', 'super_admin'].includes(profile?.role || '') }
    : null;
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  let query = adminClient
    .from('receipt_financing')
    .select('*, receipt:warehouse_receipts(*, warehouse:warehouses(*))')
    .order('created_at', { ascending: false });

  if (!auth.isAdmin) {
    query = query.eq('borrower_id', auth.memberId);
  }
  if (status) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ financing: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  // 1. Verify the receipt exists, belongs to the user, and is not already pledged
  const { data: receipt, error: receiptErr } = await adminClient
    .from('warehouse_receipts')
    .select('*')
    .eq('id', body.receipt_id)
    .single();

  if (receiptErr || !receipt) {
    return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
  }
  if (receipt.member_id && receipt.member_id !== auth.memberId && !auth.isAdmin) {
    return NextResponse.json({ error: 'Receipt does not belong to you' }, { status: 403 });
  }
  if (receipt.pledged) {
    return NextResponse.json({ error: 'Receipt is already pledged to a loan' }, { status: 400 });
  }

  const requestedAmount = Number(body.requested_amount ?? body.amount ?? 0);
  const termMonths = Number(body.term_months ?? body.duration_months ?? 6);
  const marketValue = Number(body.market_value ?? receipt.estimated_value ?? receipt.value ?? 0);

  // 2. Insert into loans with collateral linkage
  const { data: loan, error: loanErr } = await adminClient
    .from('loans')
    .insert({
      user_id: auth.userId,
      member_id: auth.memberId,
      loan_type: 'warehouseReceipt',
      amount: requestedAmount,
      interest_rate: 9.5,
      term_months: termMonths,
      status: 'pending',
      purpose: `Receipt-backed loan against warehouse receipt ${receipt.receipt_number || receipt.id}`,
      collateral_type: 'warehouse_receipt',
      collateral_id: body.receipt_id,
      amount_repaid: 0,
    })
    .select('*')
    .single();

  if (loanErr) {
    return NextResponse.json({ error: loanErr.message }, { status: 500 });
  }

  // 3. Insert receipt_financing linking receipt to loan
  const { data: financing, error: finErr } = await adminClient
    .from('receipt_financing')
    .insert({
      receipt_id: body.receipt_id,
      borrower_id: auth.memberId,
      requested_amount: requestedAmount,
      market_value: marketValue,
      duration_months: termMonths,
      status: 'pending',
      loan_id: loan.id,
      application_date: new Date().toISOString(),
    })
    .select('*, receipt:warehouse_receipts(*)')
    .single();

  if (finErr) {
    // Best-effort rollback of loan
    await adminClient.from('loans').delete().eq('id', loan.id);
    return NextResponse.json({ error: finErr.message }, { status: 500 });
  }

  // 4. Lock the receipt (status = pledged)
  await adminClient
    .from('warehouse_receipts')
    .update({
      status: 'pledged',
      pledged: true,
      pledged_to_loan_id: loan.id,
    })
    .eq('id', body.receipt_id);

  return NextResponse.json({ financing, loan }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.approved_amount) updateData.approved_amount = body.approved_amount;
  if (body.interest_rate) updateData.interest_rate = body.interest_rate;
  if (body.duration_months) updateData.duration_months = body.duration_months;
  if (body.disbursement_date) updateData.disbursement_date = body.disbursement_date;
  if (body.due_date) updateData.due_date = body.due_date;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from('receipt_financing')
    .update(updateData)
    .eq('id', body.id)
    .select('*, receipt:warehouse_receipts(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ financing: data });
}
