import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/market-prices
 * Public endpoint — returns latest market prices, optionally filtered.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const commodity = searchParams.get('commodity');
  const country = searchParams.get('country');
  const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 500);

  const adminClient = await createAdminClient();
  let query = adminClient
    .from('market_prices')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (commodity) query = query.eq('commodity', commodity);
  if (country) query = query.eq('country', country);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also return distinct commodities for filtering
  const commodities = [...new Set((data || []).map(p => p.commodity))];

  return NextResponse.json({ prices: data, commodities });
}
