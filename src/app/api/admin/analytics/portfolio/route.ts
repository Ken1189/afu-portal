import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/analytics/portfolio
 *
 * Returns loan portfolio quality metrics including PAR30, PAR90,
 * totals for disbursed/outstanding/repaid, and country breakdown.
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

    // Fetch all loans with member country info via JOIN (single query)
    const { data: loans, error: loansError } = await adminClient
      .from('loans')
      .select('id, amount, amount_repaid, status, due_date, disbursed_at, created_at, member_id, member:members(profile:profiles(country))')
      .limit(5000);

    if (loansError) {
      return NextResponse.json({ error: loansError.message }, { status: 500 });
    }

    if (!loans || loans.length === 0) {
      return NextResponse.json({
        par30: 0,
        par90: 0,
        totalDisbursed: 0,
        totalOutstanding: 0,
        totalRepaid: 0,
        byCountry: [],
      });
    }

    // Build member-to-country map from joined data
    const memberCountryMap = new Map<string, string>();
    for (const loan of loans) {
      if (!memberCountryMap.has(loan.member_id)) {
        const member = loan.member as unknown as { profile: { country: string | null } | null } | null;
        memberCountryMap.set(loan.member_id, member?.profile?.country || 'Unknown');
      }
    }

    const now = new Date();
    const activeStatuses = ['active', 'disbursed', 'repaying', 'overdue', 'defaulted'];

    let totalDisbursed = 0;
    let totalRepaid = 0;
    let totalOutstanding = 0;
    let overdueAmount30 = 0;
    let overdueAmount90 = 0;

    // Country breakdown accumulators
    const countryStats = new Map<string, {
      totalDisbursed: number;
      totalOutstanding: number;
      totalRepaid: number;
      activeCount: number;
      overdueCount: number;
    }>();

    for (const loan of loans) {
      const amount = Number(loan.amount) || 0;
      const repaid = Number(loan.amount_repaid) || 0;
      const outstanding = amount - repaid;
      const country = memberCountryMap.get(loan.member_id) || 'Unknown';

      totalDisbursed += amount;
      totalRepaid += repaid;

      // Initialize country entry
      if (!countryStats.has(country)) {
        countryStats.set(country, {
          totalDisbursed: 0,
          totalOutstanding: 0,
          totalRepaid: 0,
          activeCount: 0,
          overdueCount: 0,
        });
      }
      const cs = countryStats.get(country)!;
      cs.totalDisbursed += amount;
      cs.totalRepaid += repaid;

      if (activeStatuses.includes(loan.status)) {
        totalOutstanding += outstanding;
        cs.totalOutstanding += outstanding;
        cs.activeCount += 1;

        // Check days overdue
        if (loan.due_date) {
          const dueDate = new Date(loan.due_date);
          const daysOverdue = Math.floor(
            (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          if (daysOverdue > 30) {
            overdueAmount30 += outstanding;
            cs.overdueCount += 1;
          }
          if (daysOverdue > 90) {
            overdueAmount90 += outstanding;
          }
        } else if (['overdue', 'defaulted'].includes(loan.status)) {
          // No due_date but status is overdue/defaulted — count toward PAR30
          overdueAmount30 += outstanding;
          overdueAmount90 += outstanding;
          cs.overdueCount += 1;
        }
      }
    }

    const par30 = totalOutstanding > 0
      ? Number(((overdueAmount30 / totalOutstanding) * 100).toFixed(2))
      : 0;
    const par90 = totalOutstanding > 0
      ? Number(((overdueAmount90 / totalOutstanding) * 100).toFixed(2))
      : 0;

    const byCountry = Array.from(countryStats.entries())
      .map(([country, stats]) => ({
        country,
        ...stats,
      }))
      .sort((a, b) => b.totalDisbursed - a.totalDisbursed);

    return NextResponse.json({
      par30,
      par90,
      totalDisbursed,
      totalOutstanding,
      totalRepaid,
      byCountry,
    });
  } catch (err) {
    console.error('Portfolio API error:', err);
    return NextResponse.json({ error: 'Failed to fetch portfolio data' }, { status: 500 });
  }
}
