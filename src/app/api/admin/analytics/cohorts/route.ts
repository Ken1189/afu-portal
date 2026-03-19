import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/analytics/cohorts
 *
 * Returns member cohort retention data grouped by join month.
 * "Retained" means the member has activity (payment or loan) in the last 30 days.
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

    // Fetch all members with their join date
    const { data: members, error: membersError } = await adminClient
      .from('members')
      .select('id, created_at');

    if (membersError) {
      return NextResponse.json({ error: membersError.message }, { status: 500 });
    }

    if (!members || members.length === 0) {
      return NextResponse.json({ cohorts: [] });
    }

    // Get members who have recent activity (payment or loan action in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoff = thirtyDaysAgo.toISOString();

    const [recentPaymentsRes, recentLoansRes] = await Promise.all([
      adminClient
        .from('payments')
        .select('member_id')
        .gte('created_at', cutoff),
      adminClient
        .from('loans')
        .select('member_id')
        .gte('updated_at', cutoff),
    ]);

    // Build set of active member IDs
    const activeMemberIds = new Set<string>();
    (recentPaymentsRes.data ?? []).forEach((p) => activeMemberIds.add(p.member_id));
    (recentLoansRes.data ?? []).forEach((l) => activeMemberIds.add(l.member_id));

    // Group members by cohort month (YYYY-MM)
    const cohortMap = new Map<string, { joined: number; retained: number }>();

    for (const member of members) {
      const date = new Date(member.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!cohortMap.has(monthKey)) {
        cohortMap.set(monthKey, { joined: 0, retained: 0 });
      }

      const cohort = cohortMap.get(monthKey)!;
      cohort.joined += 1;

      if (activeMemberIds.has(member.id)) {
        cohort.retained += 1;
      }
    }

    // Convert to sorted array
    const cohorts = Array.from(cohortMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        joined: data.joined,
        retained: data.retained,
        retentionRate: data.joined > 0
          ? Number(((data.retained / data.joined) * 100).toFixed(1))
          : 0,
      }));

    return NextResponse.json({ cohorts });
  } catch (err) {
    console.error('Cohorts API error:', err);
    return NextResponse.json({ error: 'Failed to fetch cohort data' }, { status: 500 });
  }
}
