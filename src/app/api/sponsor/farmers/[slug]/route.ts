import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/sponsor/farmers/[slug]
 * Returns single farmer profile + all farmer_updates (desc) + active sponsorship count.
 * Public endpoint — no auth required.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const db = svc();

    // Fetch the farmer profile
    const { data: profile, error: profileError } = await db
      .from('farmer_public_profiles')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });
    }

    // Fetch all updates ordered newest first
    const { data: updates, error: updatesError } = await db
      .from('farmer_updates')
      .select('*')
      .eq('farmer_profile_id', profile.id)
      .order('created_at', { ascending: false });

    if (updatesError) {
      console.error('GET /api/sponsor/farmers/[slug] updates error:', updatesError);
    }

    // Count active sponsorships
    const { count: activeSponsorsCount, error: sponsorError } = await db
      .from('sponsorships')
      .select('id', { count: 'exact', head: true })
      .eq('farmer_profile_id', profile.id)
      .eq('status', 'active');

    if (sponsorError) {
      console.error('GET /api/sponsor/farmers/[slug] sponsor count error:', sponsorError);
    }

    return NextResponse.json({
      farmer: {
        ...profile,
        updates: updates ?? [],
        active_sponsors_count: activeSponsorsCount ?? 0,
      },
    });
  } catch (err) {
    console.error('GET /api/sponsor/farmers/[slug] unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
