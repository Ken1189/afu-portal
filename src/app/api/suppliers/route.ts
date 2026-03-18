import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/suppliers
 * List suppliers with optional filters.
 * Public: returns active suppliers only.
 * Admin: returns all suppliers.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  // Check if user is admin for full access
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = (profile?.role as string) === 'admin' || (profile?.role as string) === 'super_admin';
  }

  // Build query
  const adminClient = isAdmin ? await createAdminClient() : null;
  const client = adminClient || supabase;

  let query = client.from('suppliers').select('*');

  // Filters
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const country = searchParams.get('country');
  const tier = searchParams.get('tier');
  const search = searchParams.get('search');

  if (!isAdmin) {
    query = query.eq('status', 'active');
  } else if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  if (country && country !== 'all') {
    query = query.eq('country', country);
  }

  if (tier && tier !== 'all') {
    if (tier === 'none') {
      query = query.is('sponsorship_tier', null);
    } else {
      query = query.eq('sponsorship_tier', tier);
    }
  }

  if (search) {
    query = query.or(
      `company_name.ilike.%${search}%,contact_name.ilike.%${search}%,email.ilike.%${search}%`
    );
  }

  // Sort
  const sortBy = searchParams.get('sort') || 'company_name';
  const sortDir = searchParams.get('dir') === 'desc';
  query = query.order(sortBy, { ascending: !sortDir });

  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');
  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    suppliers: data,
    pagination: {
      page,
      limit,
      total: count,
    },
  });
}

/**
 * POST /api/suppliers
 * Create a new supplier. Admin only.
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Auth check
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

  // Validate required fields
  const required = ['company_name', 'contact_name', 'email', 'category', 'country'];
  for (const field of required) {
    if (!body[field]) {
      return NextResponse.json(
        { error: `Missing required field: ${field}` },
        { status: 400 }
      );
    }
  }

  const adminClient = await createAdminClient();
  const { data, error } = await adminClient
    .from('suppliers')
    .insert({
      company_name: body.company_name,
      contact_name: body.contact_name,
      email: body.email,
      phone: body.phone || null,
      website: body.website || null,
      logo_url: body.logo_url || null,
      category: body.category,
      status: body.status || 'pending',
      country: body.country,
      region: body.region || null,
      description: body.description || null,
      verified: body.verified || false,
      commission_rate: body.commission_rate || 10,
      member_discount_percent: body.member_discount_percent || 10,
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
    entity_type: 'supplier',
    entity_id: data.id,
    details: { company_name: body.company_name },
  });

  return NextResponse.json({ supplier: data }, { status: 201 });
}
