import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/cooperatives — list cooperatives
export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const memberId = searchParams.get('member_id');

    let query = supabase.from('cooperatives').select('*').order('name');

    if (country) {
      query = query.eq('country', country);
    }

    const { data: cooperatives, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If member_id provided, filter to cooperatives the member belongs to
    if (memberId) {
      const { data: memberships } = await supabase
        .from('cooperative_members')
        .select('cooperative_id')
        .eq('member_id', memberId);

      const memberCoopIds = new Set((memberships || []).map(m => m.cooperative_id));
      const filtered = (cooperatives || []).filter(c => memberCoopIds.has(c.id));
      return NextResponse.json({ cooperatives: filtered });
    }

    return NextResponse.json({ cooperatives: cooperatives || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cooperatives — create cooperative
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();

    const { name, country, region, type, description } = body;

    if (!name || !country) {
      return NextResponse.json({ error: 'Name and country are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('cooperatives')
      .insert({
        name,
        country,
        region: region || null,
        description: description || null,
        status: 'forming',
        member_count: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ cooperative: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
