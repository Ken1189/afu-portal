import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/cooperatives/[id] — cooperative detail with members, production, orders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    // Fetch cooperative
    const { data: cooperative, error: coopErr } = await supabase
      .from('cooperatives')
      .select('*')
      .eq('id', id)
      .single();

    if (coopErr || !cooperative) {
      return NextResponse.json({ error: 'Cooperative not found' }, { status: 404 });
    }

    // Fetch members
    const { data: members } = await supabase
      .from('cooperative_members')
      .select('*')
      .eq('cooperative_id', id)
      .order('joined_at');

    // Fetch cooperative orders
    const { data: orders } = await supabase
      .from('trade_orders')
      .select('*')
      .eq('cooperative_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      cooperative,
      members: members || [],
      orders: orders || [],
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/cooperatives/[id] — update cooperative (admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const body = await req.json();

    const updates: Record<string, unknown> = {};
    if (body.name) updates.name = body.name;
    if (body.country) updates.country = body.country;
    if (body.region !== undefined) updates.region = body.region;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status) updates.status = body.status;
    if (body.contact_email !== undefined) updates.contact_email = body.contact_email;
    if (body.contact_phone !== undefined) updates.contact_phone = body.contact_phone;

    const { data, error } = await supabase
      .from('cooperatives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cooperative: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cooperatives/[id] — join or invite
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const body = await req.json();

    if (body.action === 'join') {
      const { member_id } = body;
      if (!member_id) {
        return NextResponse.json({ error: 'member_id is required' }, { status: 400 });
      }

      // Check not already a member
      const { data: existing } = await supabase
        .from('cooperative_members')
        .select('id')
        .eq('cooperative_id', id)
        .eq('member_id', member_id)
        .limit(1);

      if (existing && existing.length > 0) {
        return NextResponse.json({ error: 'Already a member' }, { status: 409 });
      }

      const { data, error } = await supabase
        .from('cooperative_members')
        .insert({ cooperative_id: id, member_id, role: 'member' })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update member count (best effort)
      try {
        await supabase.from('cooperatives').update({ member_count: (body.current_count || 0) + 1 }).eq('id', id);
      } catch (_e) { /* ignore */ }

      return NextResponse.json({ membership: data }, { status: 201 });
    }

    if (body.action === 'invite') {
      // Generate invite link
      const inviteCode = `${id}-${Date.now().toString(36)}`;
      return NextResponse.json({
        invite_link: `${process.env.NEXT_PUBLIC_APP_URL || ''}/farm/cooperatives?join=${id}&code=${inviteCode}`,
        invite_code: inviteCode,
      });
    }

    return NextResponse.json({ error: 'Invalid action. Use action=join or action=invite' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
