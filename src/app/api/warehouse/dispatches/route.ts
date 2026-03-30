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

/**
 * GET /api/warehouse/dispatches
 * Fetch pending and completed dispatches.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const auth = await getAuthMember(supabase);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await createAdminClient();

    // Query warehouse_receipts that have a dispatch_status set (pending or dispatched)
    let query = adminClient
      .from('warehouse_receipts')
      .select('*, warehouse:warehouses(name)')
      .in('dispatch_status', ['pending', 'dispatched'])
      .order('created_at', { ascending: false });

    if (!auth.isAdmin) {
      query = query.eq('farmer_id', auth.memberId);
    }

    const { data, error } = await query;

    if (error) {
      // If dispatch_status column doesn't exist, return empty array gracefully
      if (error.message?.includes('column') || error.code === '42703') {
        return NextResponse.json({ dispatches: [] });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map warehouse_receipts rows to the dispatch shape the frontend expects
    const dispatches = (data ?? []).map((r) => ({
      id: r.id,
      receipt_id: r.id,
      receipt_number: r.receipt_number || '',
      farmer_name: r.farmer_name || '',
      commodity_type: r.commodity_type || '',
      quantity: Number(r.quantity) || 0,
      quantity_unit: r.quantity_unit || 'kg',
      destination: r.dispatch_destination || '',
      requested_date: r.dispatch_requested_date || r.created_at?.slice(0, 10) || '',
      dispatch_date: r.dispatch_date || '',
      status: r.dispatch_status || 'pending',
      assigned_grader: r.assigned_grader || '',
      warehouse_name: (r.warehouse as { name?: string } | null)?.name || '',
      notes: r.dispatch_notes || '',
    }));

    return NextResponse.json({ dispatches });
  } catch (err) {
    console.error('Dispatches GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/warehouse/dispatches
 * Update a dispatch status (approve / mark as dispatched).
 * Body: { id, status, dispatch_date?, assigned_grader? }
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const auth = await getAuthMember(supabase);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!auth.isAdmin) {
      return NextResponse.json({ error: 'Only admins can approve dispatches' }, { status: 403 });
    }

    const body = await request.json();
    const { id, status, dispatch_date, assigned_grader } = body as {
      id: string;
      status: string;
      dispatch_date?: string;
      assigned_grader?: string;
    };

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    const updateData: Record<string, unknown> = {
      dispatch_status: status,
    };
    if (dispatch_date) updateData.dispatch_date = dispatch_date;
    if (assigned_grader !== undefined) updateData.assigned_grader = assigned_grader;

    const { data, error } = await adminClient
      .from('warehouse_receipts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, dispatch: data });
  } catch (err) {
    console.error('Dispatches PATCH error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
