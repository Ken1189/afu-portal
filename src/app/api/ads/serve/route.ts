/**
 * Ad Serve API
 * GET — Returns the best ad for a given page/slot/country context
 * Cached for 60 seconds per combination
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AdServer } from '@/lib/ads';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get('page');
    const slot = req.nextUrl.searchParams.get('slot');
    const country = req.nextUrl.searchParams.get('country') || undefined;
    const crop = req.nextUrl.searchParams.get('crop') || undefined;
    const multiple = req.nextUrl.searchParams.get('multiple') === 'true';
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '3');

    if (!page || !slot) {
      return NextResponse.json({ error: 'page and slot required' }, { status: 400 });
    }

    const db = getServiceClient();
    const adServer = new AdServer(db);

    if (multiple) {
      const ads = await adServer.getAds({ page, slot, country, limit });
      return NextResponse.json({ ads }, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    const ad = await adServer.getAd({ page, slot, country, crop });

    if (!ad) {
      return NextResponse.json({ ad: null }, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    return NextResponse.json({ ad }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
