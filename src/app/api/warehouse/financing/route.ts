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

  const insertData = {
    receipt_id: body.receipt_id,
    borrower_id: auth.memberId,
    requested_amount: body.requested_amount,
    market_value: body.market_value,
    status: 'pending',
    application_date: new Date().toISOString(),
  };

  const { data, error } = await adminClient
    .from('receipt_financing')
    .insert(insertData)
    .select('*, receipt:warehouse_receipts(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ financing: data }, { status: 201 });
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
