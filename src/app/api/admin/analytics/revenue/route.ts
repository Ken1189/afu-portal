import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/analytics/revenue
 *
 * Returns revenue breakdown by month (last 12 months), by country, and by purpose.
 */
export async function GET() {
  try {
    // Authenticate user
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Verify admin role
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch completed payments from last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const cutoff = twelveMonthsAgo.toISOString();

    const { data: payments, error: paymentsError } = await adminClient
      .from('payments')
      .select('id, amount, purpose, member_id, created_at, member:members(profile:profiles(country))')
      .eq('status', 'completed')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: true })
      .limit(5000);

    if (paymentsError) {
      return NextResponse.json({ error: paymentsError.message }, { status: 500 });
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ byMonth: [], byCountry: [], byPurpose: [] });
    }

    // Build member-to-country map from joined data (single query)
    const memberCountryMap = new Map<string, string>();
    for (const payment of payments) {
      if (!memberCountryMap.has(payment.member_id)) {
        const member = payment.member as unknown as { profile: { country: string | null } | null } | null;
        memberCountryMap.set(payment.member_id, member?.profile?.country || 'Unknown');
      }
    }

    // Aggregate by month
    const monthMap = new Map<string, number>();
    // Aggregate by country
    const countryMap = new Map<string, number>();
    // Aggregate by purpose
    const purposeMap = new Map<string, number>();

    for (const payment of payments) {
      const amount = Number(payment.amount) || 0;

      // By month
      const date = new Date(payment.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + amount);

      // By country
      const country = memberCountryMap.get(payment.member_id) || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + amount);

      // By purpose
      const purpose = payment.purpose || 'other';
      purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + amount);
    }

    const byMonth = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month, revenue: Number(revenue.toFixed(2)) }));

    const byCountry = Array.from(countryMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([country, revenue]) => ({ country, revenue: Number(revenue.toFixed(2)) }));

    const byPurpose = Array.from(purposeMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([purpose, revenue]) => ({ purpose, revenue: Number(revenue.toFixed(2)) }));

    return NextResponse.json({ byMonth, byCountry, byPurpose });
  } catch (err) {
    console.error('Revenue API error:', err);
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 });
  }
}
