import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/analytics/kpis
 *
 * Returns real-time key performance indicators for the admin dashboard.
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

    // Calculate date boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Run all queries in parallel
    const [
      membersRes,
      newMembersRes,
      activeLoansRes,
      completedPaymentsRes,
      overdueLoansRes,
      totalOutstandingRes,
      creditScoresRes,
    ] = await Promise.all([
      // Total members
      adminClient.from('members').select('id', { count: 'exact', head: true }),
      // New members this month
      adminClient.from('members').select('id', { count: 'exact', head: true }).gte('created_at', startOfMonth),
      // Active loans
      adminClient.from('loans').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      // Total revenue (completed payments)
      adminClient.from('payments').select('amount').eq('status', 'completed'),
      // Overdue loans (status = 'overdue' or 'defaulted')
      adminClient.from('loans').select('id, amount').in('status', ['overdue', 'defaulted']),
      // Total outstanding loans (active + overdue)
      adminClient.from('loans').select('id, amount').in('status', ['active', 'disbursed', 'repaying', 'overdue', 'defaulted']),
      // Credit scores (latest per member for average)
      adminClient.from('credit_scores').select('score'),
    ]);

    const totalMembers = membersRes.count ?? 0;
    const newMembersThisMonth = newMembersRes.count ?? 0;
    const activeLoans = activeLoansRes.count ?? 0;

    // Sum completed payments for total revenue
    const completedPayments = completedPaymentsRes.data ?? [];
    const totalRevenue = completedPayments.reduce(
      (sum, p) => sum + (Number(p.amount) || 0),
      0
    );

    // Portfolio at risk calculation
    const overdueLoans = overdueLoansRes.data ?? [];
    const outstandingLoans = totalOutstandingRes.data ?? [];
    const overdueAmount = overdueLoans.reduce(
      (sum, l) => sum + (Number(l.amount) || 0),
      0
    );
    const totalOutstandingAmount = outstandingLoans.reduce(
      (sum, l) => sum + (Number(l.amount) || 0),
      0
    );
    const portfolioAtRisk =
      totalOutstandingAmount > 0
        ? Number(((overdueAmount / totalOutstandingAmount) * 100).toFixed(2))
        : 0;

    // Average credit score
    const creditScores = creditScoresRes.data ?? [];
    const avgCreditScore =
      creditScores.length > 0
        ? Number(
            (
              creditScores.reduce((sum, cs) => sum + (Number(cs.score) || 0), 0) /
              creditScores.length
            ).toFixed(1)
          )
        : 0;

    return NextResponse.json({
      totalMembers,
      activeLoans,
      totalRevenue,
      newMembersThisMonth,
      portfolioAtRisk,
      avgCreditScore,
    });
  } catch (err) {
    console.error('KPIs API error:', err);
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
  }
}
