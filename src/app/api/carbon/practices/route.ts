import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Carbon estimate per practice type (tonnes CO2e per hectare per year, approximate)
const CARBON_ESTIMATES: Record<string, number> = {
  no_till: 0.5,
  cover_crops: 0.8,
  crop_rotation: 0.3,
  agroforestry: 2.5,
  tree_planting: 3.0,
  composting: 0.6,
  organic_farming: 0.7,
  biochar: 1.5,
  rotational_grazing: 0.4,
  mulching: 0.3,
};

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('carbon_practices')
      .select('*')
      .eq('farmer_id', user.id)
      .order('practice_date', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ practices: data || [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch practices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { practice_type, description, practice_date, gps_lat, gps_lng, photo_url, enrollment_id } = await req.json();

    if (!practice_type || !practice_date) {
      return NextResponse.json({ error: 'practice_type and practice_date are required' }, { status: 400 });
    }

    const carbonEstimate = CARBON_ESTIMATES[practice_type] || 0.3;

    const { data, error } = await supabase
      .from('carbon_practices')
      .insert({
        farmer_id: user.id,
        enrollment_id: enrollment_id || null,
        practice_type,
        description: description || '',
        practice_date,
        gps_lat: gps_lat || null,
        gps_lng: gps_lng || null,
        photo_url: photo_url || null,
        carbon_estimate_tonnes: carbonEstimate,
        verification_status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ practice: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to log practice' }, { status: 500 });
  }
}
