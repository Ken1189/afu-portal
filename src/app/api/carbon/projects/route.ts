import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('carbon_projects')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data || [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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

    const body = await req.json();
    const {
      name, description, methodology, registry, country, region,
      eligible_practices, price_per_credit, co_benefits, status,
      start_date, end_date, target_credits,
    } = body;

    if (!name || !methodology || !registry) {
      return NextResponse.json({ error: 'Name, methodology and registry are required' }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data, error } = await admin
      .from('carbon_projects')
      .insert({
        name,
        description: description || '',
        methodology,
        registry,
        country: country || 'Zimbabwe',
        region: region || '',
        eligible_practices: eligible_practices || [],
        price_per_credit: price_per_credit || 0,
        co_benefits: co_benefits || [],
        status: status || 'draft',
        start_date: start_date || null,
        end_date: end_date || null,
        target_credits: target_credits || 0,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
