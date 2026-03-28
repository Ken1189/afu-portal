import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id, full_name').eq('profile_id', user.id).single();
  const { data: profile } = await adminClient.from('profiles').select('role, country').eq('id', user.id).single();
  return member
    ? {
        userId: user.id,
        memberId: member.id,
        fullName: member.full_name,
        country: profile?.country,
        isAdmin: ['admin', 'super_admin'].includes(profile?.role || ''),
      }
    : null;
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const warehouseId = searchParams.get('warehouse_id');
  const commodity = searchParams.get('commodity');

  let query = adminClient
    .from('warehouse_receipts')
    .select('*, warehouse:warehouses(*), quality_inspection:quality_inspections(*), financing:receipt_financing(*)')
    .order('created_at', { ascending: false });

  if (!auth.isAdmin) {
    query = query.eq('farmer_id', auth.memberId);
  }
  if (status) query = query.eq('status', status);
  if (warehouseId) query = query.eq('warehouse_id', warehouseId);
  if (commodity) query = query.eq('commodity_type', commodity);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ receipts: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  // Generate receipt number: WR-YYYYMMDD-XXXX
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  const receiptNumber = `WR-${dateStr}-${rand}`;

  const insertData = {
    receipt_number: receiptNumber,
    farmer_id: auth.memberId,
    farmer_name: auth.fullName || 'Unknown',
    warehouse_id: body.warehouse_id,
    commodity_type: body.commodity_type,
    quantity: body.quantity,
    quantity_unit: body.quantity_unit || 'kg',
    grade_estimate: body.grade_estimate || 'ungraded',
    delivery_date: body.delivery_date || now.toISOString().slice(0, 10),
    status: 'pending',
    deposit_date: now.toISOString(),
  };

  const { data, error } = await adminClient
    .from('warehouse_receipts')
    .insert(insertData)
    .select('*, warehouse:warehouses(*)')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ receipt: data, receiptNumber }, { status: 201 });
}
