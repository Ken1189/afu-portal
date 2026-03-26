/**
 * Ad Track API
 * POST — Record impression or click event
 * Rate-limited: 100 events per IP per minute
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AdTracker } from '@/lib/ads';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  entry.count++;
  return entry.count <= 100;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRate(ip)) {
      return NextResponse.json({ error: 'Rate limited' }, { status: 429 });
    }

    const body = await req.json();
    const { ad_id, event_type, page, placement_slot, country_code, user_id, device_type } = body;

    if (!ad_id || !event_type || !page || !placement_slot) {
      return NextResponse.json({ error: 'ad_id, event_type, page, placement_slot required' }, { status: 400 });
    }

    if (!['impression', 'click', 'conversion'].includes(event_type)) {
      return NextResponse.json({ error: 'event_type must be impression, click, or conversion' }, { status: 400 });
    }

    const db = getServiceClient();
    const tracker = new AdTracker(db);

    // Hash IP for privacy
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(ip + ad_id));
    const ipHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);

    let tracked = false;

    if (event_type === 'impression') {
      tracked = await tracker.trackImpression({
        ad_id,
        user_id: user_id || undefined,
        page,
        placement_slot,
        country_code: country_code || undefined,
        device_type: device_type || undefined,
        ip_hash: ipHash,
      });
    } else if (event_type === 'click') {
      tracked = await tracker.trackClick({
        ad_id,
        user_id: user_id || undefined,
        page,
        placement_slot,
        country_code: country_code || undefined,
        device_type: device_type || undefined,
      });
    } else if (event_type === 'conversion' && user_id) {
      tracked = await tracker.trackConversion({
        ad_id,
        user_id,
        page,
        placement_slot,
        country_code: country_code || undefined,
      });
    }

    return NextResponse.json({ tracked });
  } catch (err) {
    // Fire-and-forget — don't fail the page load
    return NextResponse.json({ tracked: false, error: (err as Error).message }, { status: 200 });
  }
}
