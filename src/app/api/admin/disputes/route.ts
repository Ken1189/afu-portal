import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated', status: 401 as const };
  const admin = await createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).maybeSingle();
  if (!['admin', 'super_admin'].includes(profile?.role)) {
    return { error: 'Forbidden', status: 403 as const };
  }
  return { admin, user };
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { data, error } = await auth.admin
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ disputes: data ?? [] });
  } catch (err) {
    console.error('[admin disputes GET] Error:', err);
    return NextResponse.json({ error: 'Failed to load disputes' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireAdmin();
    if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

    const { id, status, resolution } = await req.json();
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (status) update.status = status;
    if (resolution !== undefined) update.resolution = resolution;
    if (status === 'resolved' || status === 'closed') {
      update.resolved_by = auth.user.id;
      update.resolved_at = new Date().toISOString();
    }

    const { data, error } = await auth.admin
      .from('disputes')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ dispute: data });
  } catch (err) {
    console.error('[admin disputes PATCH] Error:', err);
    return NextResponse.json({ error: 'Failed to update dispute' }, { status: 500 });
  }
}
