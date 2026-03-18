import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/members
 * List members. Admin only for full list. Members see own profile.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const isAdmin = (profile?.role as string) === 'admin' || (profile?.role as string) === 'super_admin';

  if (!isAdmin) {
    // Non-admin: return own member record only
    const { data, error } = await supabase
      .from('members')
      .select('*, profiles!inner(email, full_name, phone, avatar_url, country, region)')
      .eq('profile_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }
    return NextResponse.json({ member: data });
  }

  // Admin: full list with filters
  const adminClient = await createAdminClient();
  let query = adminClient
    .from('members')
    .select('*, profiles!inner(email, full_name, phone, avatar_url, country, region)', { count: 'exact' });

  const status = searchParams.get('status');
  const tier = searchParams.get('tier');
  const search = searchParams.get('search');

  if (status && status !== 'all') query = query.eq('status', status);
  if (tier && tier !== 'all') query = query.eq('tier', tier);
  if (search) {
    query = query.or(
      `member_id.ilike.%${search}%,farm_name.ilike.%${search}%,profiles.full_name.ilike.%${search}%`
    );
  }

  const sortBy = searchParams.get('sort') || 'created_at';
  const sortDir = searchParams.get('dir') === 'asc';
  query = query.order(sortBy, { ascending: sortDir });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    members: data,
    pagination: { page, limit, total: count },
  });
}

/**
 * POST /api/members
 * Create a member record (after application approval or admin action).
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();

  if (!body.profile_id) {
    return NextResponse.json({ error: 'profile_id is required' }, { status: 400 });
  }

  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from('members')
    .insert({
      profile_id: body.profile_id,
      tier: body.tier || 'new_enterprise',
      status: body.status || 'active',
      farm_name: body.farm_name || null,
      farm_size_ha: body.farm_size_ha || null,
      primary_crops: body.primary_crops || [],
      livestock_types: body.livestock_types || [],
      bio: body.bio || null,
      certifications: body.certifications || [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Audit log
  await adminClient.from('audit_log').insert({
    user_id: user.id,
    action: 'create',
    entity_type: 'member',
    entity_id: data.id,
    details: { member_id: data.member_id, tier: data.tier },
  });

  return NextResponse.json({ member: data }, { status: 201 });
}
