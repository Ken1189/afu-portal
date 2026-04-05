import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/automations — List all automation rules
 */
export async function GET() {
  try {
    const admin = await createAdminClient();
    const { data, error } = await admin.from('automation_rules').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rules: data || [] });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/automations — Create automation rule
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const body = await req.json();

    const { data, error } = await admin.from('automation_rules').insert({
      name: body.name,
      description: body.description || null,
      is_active: body.is_active ?? true,
      trigger_type: body.trigger_type,
      trigger_config: body.trigger_config || {},
      action_type: body.action_type,
      action_config: body.action_config || {},
      delay_minutes: body.delay_minutes || 0,
      created_by: user.id,
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rule: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/automations — Update/toggle rule (pass id in body)
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });

    updates.updated_at = new Date().toISOString();

    const { data, error } = await admin.from('automation_rules').update(updates).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ rule: data });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/automations — Delete rule (pass id in body)
 */
export async function DELETE(req: NextRequest) {
  try {
    const admin = await createAdminClient();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: 'Rule ID required' }, { status: 400 });
    const { error } = await admin.from('automation_rules').delete().eq('id', body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
