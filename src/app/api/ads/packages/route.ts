/**
 * Ad Packages API
 * GET — Returns all active ad_packages with ad_country_tiers for pricing
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET() {
  try {
    const db = getServiceClient();

    // Fetch active packages
    const { data: packages, error: pkgError } = await db
      .from('ad_packages')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (pkgError) {
      return NextResponse.json({ error: pkgError.message }, { status: 500 });
    }

    // Fetch active country tiers
    const { data: countryTiers, error: tierError } = await db
      .from('ad_country_tiers')
      .select('*')
      .eq('is_active', true)
      .order('tier', { ascending: true });

    if (tierError) {
      return NextResponse.json({ error: tierError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        packages: packages || [],
        countryTiers: countryTiers || [],
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
