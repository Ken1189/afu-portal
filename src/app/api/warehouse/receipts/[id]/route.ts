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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from('warehouse_receipts')
    .select('*, warehouse:warehouses(*), quality_inspection:quality_inspections(*), financing:receipt_financing(*)')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });

  // Non-admin can only see own receipts
  if (!auth.isAdmin && data.farmer_id !== auth.memberId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ receipt: data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (body.status) updateData.status = body.status;
  if (body.grade) updateData.grade = body.grade;
  if (body.market_value) updateData.market_value = body.market_value;
  if (body.notes) updateData.notes = body.notes;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await adminClient
    .from('warehouse_receipts')
    .update(updateData)
    .eq('id', id)
    .select('*, warehouse:warehouses(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ receipt: data });
}
