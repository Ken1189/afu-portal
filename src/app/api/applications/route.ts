import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/applications
 * List membership applications. Admin only.
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

  if (!profile || !['admin', 'super_admin'].includes(profile.role as string)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminClient = await createAdminClient();
  let query = adminClient
    .from('membership_applications')
    .select('*', { count: 'exact' });

  const status = searchParams.get('status');
  if (status && status !== 'all') query = query.eq('status', status);

  query = query.order('created_at', { ascending: false });

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    applications: data,
    pagination: { page, limit, total: count },
  });
}

/**
 * POST /api/applications
 * Submit a membership application. Public.
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Validate required fields
  const required = ['full_name', 'email', 'country'];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  // Use admin client to bypass RLS for public submission
  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from('membership_applications')
    .insert({
      full_name: body.full_name,
      email: body.email,
      phone: body.phone || null,
      country: body.country,
      region: body.region || null,
      farm_name: body.farm_name || null,
      farm_size_ha: body.farm_size_ha || null,
      primary_crops: body.primary_crops || [],
      requested_tier: body.requested_tier || 'smallholder',
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ application: data }, { status: 201 });
}
