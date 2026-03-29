import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const project_id = searchParams.get('project_id');

    let query = supabase
      .from('carbon_credits')
      .select('*, carbon_projects(name, registry, country, co_benefits)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (project_id) query = query.eq('project_id', project_id);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credits: data || [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { project_id, vintage_year, quantity, price_per_tonne, enrollment_ids } = await req.json();

    if (!project_id || !vintage_year || !quantity) {
      return NextResponse.json({ error: 'project_id, vintage_year and quantity are required' }, { status: 400 });
    }

    // Generate serial number: ACR-YYYY-XXXX
    const serial = `ACR-${vintage_year}-${String(Date.now()).slice(-4)}`;

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('carbon_credits')
      .insert({
        serial_number: serial,
        project_id,
        vintage_year,
        quantity,
        status: 'issued',
        price_per_tonne: price_per_tonne || 0,
        enrollment_ids: enrollment_ids || [],
        minted_by: user.id,
        minted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credit: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to mint credits' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
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

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { credit_id, status } = await req.json();
    if (!credit_id || !status) {
      return NextResponse.json({ error: 'credit_id and status required' }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('carbon_credits')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', credit_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ credit: data });
  } catch {
    return NextResponse.json({ error: 'Failed to update credit' }, { status: 500 });
  }
}
