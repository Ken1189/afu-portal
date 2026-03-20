import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/sponsor/farmers
 * Query params: ?country=Uganda &featured=true
 * Returns active farmer public profiles with their latest 1 farmer_update each.
 * Public endpoint — no auth required.
 */
export async function GET(req: NextRequest) {
  try {
    const db = svc();
    const { searchParams } = new URL(req.url);
    const country = searchParams.get('country');
    const featured = searchParams.get('featured');

    // Build profile query
    let query = db
      .from('farmer_public_profiles')
      .select('*')
      .eq('is_active', true)
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (country) {
      query = query.eq('country', country);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    const { data: profiles, error: profilesError } = await query;

    if (profilesError) {
      console.error('GET /api/sponsor/farmers profiles error:', profilesError);
      return NextResponse.json({ error: profilesError.message }, { status: 500 });
    }

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ farmers: [] });
    }

    // Fetch the latest 1 update for each farmer profile
    const profileIds = profiles.map((p) => p.id);

    const { data: updates, error: updatesError } = await db
      .from('farmer_updates')
      .select('*')
      .in('farmer_profile_id', profileIds)
      .order('created_at', { ascending: false });

    if (updatesError) {
      console.error('GET /api/sponsor/farmers updates error:', updatesError);
      // Still return profiles even if updates fetch fails
    }

    // Attach only the latest update to each profile
    const latestUpdateByFarmer: Record<string, object> = {};
    if (updates) {
      for (const update of updates) {
        if (!latestUpdateByFarmer[update.farmer_profile_id]) {
          latestUpdateByFarmer[update.farmer_profile_id] = update;
        }
      }
    }

    const farmers = profiles.map((profile) => ({
      ...profile,
      latest_update: latestUpdateByFarmer[profile.id] ?? null,
    }));

    return NextResponse.json({ farmers });
  } catch (err) {
    console.error('GET /api/sponsor/farmers unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
