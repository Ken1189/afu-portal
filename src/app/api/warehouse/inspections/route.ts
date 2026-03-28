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
  const receiptId = searchParams.get('receipt_id');

  let query = adminClient
    .from('quality_inspections')
    .select('*, receipt:warehouse_receipts(*, warehouse:warehouses(*))')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (receiptId) query = query.eq('receipt_id', receiptId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ inspections: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  const insertData = {
    receipt_id: body.receipt_id,
    inspector_id: auth.memberId,
    moisture_content: body.moisture_content,
    foreign_matter: body.foreign_matter,
    damage_percentage: body.damage_percentage,
    aflatoxin_level: body.aflatoxin_level,
    grade_assigned: body.grade_assigned,
    notes: body.notes,
    status: 'completed',
    inspection_date: new Date().toISOString(),
  };

  const { data, error } = await adminClient
    .from('quality_inspections')
    .insert(insertData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-update the receipt grade
  if (body.grade_assigned) {
    await adminClient
      .from('warehouse_receipts')
      .update({ grade: body.grade_assigned, status: 'active', updated_at: new Date().toISOString() })
      .eq('id', body.receipt_id);
  }

  return NextResponse.json({ inspection: data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  const { data, error } = await adminClient
    .from('quality_inspections')
    .update({
      status: body.status,
      grade_assigned: body.grade_assigned,
      notes: body.notes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update receipt grade if approved
  if (body.status === 'approved' && body.grade_assigned && body.receipt_id) {
    await adminClient
      .from('warehouse_receipts')
      .update({ grade: body.grade_assigned, updated_at: new Date().toISOString() })
      .eq('id', body.receipt_id);
  }

  return NextResponse.json({ inspection: data });
}
