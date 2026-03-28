import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuth(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = await createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role, country').eq('id', user.id).single();
  return {
    userId: user.id,
    isAdmin: ['admin', 'super_admin'].includes(profile?.role || ''),
    country: profile?.country || null,
  };
}

/**
 * GET /api/insurance/parametric/products
 * List all active parametric products. Optional ?country= filter.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuth(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || auth.country;

  const admin = await createAdminClient();
  let query = admin
    .from('parametric_products')
    .select('*')
    .eq('active', true)
    .order('name');

  if (country) {
    // Show products for the user's country or global (null country)
    query = query.or(`country.eq.${country},country.is.null`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data || [] });
}

/**
 * POST /api/insurance/parametric/products
 * Create a new parametric product (admin only).
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuth(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!auth.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

  const body = await request.json();
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from('parametric_products')
    .insert({
      name: body.name,
      type: body.type,
      description: body.description || null,
      country: body.country || null,
      region: body.region || null,
      trigger_conditions: body.trigger_conditions,
      payout_structure: body.payout_structure,
      premium_rate: body.premium_rate,
      min_coverage: body.min_coverage || 100,
      max_coverage: body.max_coverage || 50000,
      season_start: body.season_start || null,
      season_end: body.season_end || null,
      active: body.active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
