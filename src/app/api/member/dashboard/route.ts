import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * GET /api/member/dashboard
 *
 * Returns the authenticated member's dashboard data:
 * - Profile info + member record
 * - Recent orders
 * - Loan summary
 * - Recent notifications
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    // Get the authenticated user from session cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* read-only */ },
        },
      }
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Use service role to bypass RLS for aggregated queries
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Run all queries in parallel
    const [profileRes, memberRes, ordersRes, loansRes, notificationsRes] = await Promise.all([
      svc.from('profiles').select('*').eq('id', user.id).single(),
      svc.from('members').select('*').eq('profile_id', user.id).single(),
      svc.from('orders')
        .select('id, order_number, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(5),
      svc.from('loans')
        .select('id, loan_number, loan_type, amount, interest_rate, term_months, status, created_at, amount_repaid')
        .order('created_at', { ascending: false })
        .limit(5),
      svc.from('notifications')
        .select('id, title, body, type, is_read, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const profile = profileRes.data;
    const member = memberRes.data;
    const orders = ordersRes.data || [];
    const loans = loansRes.data || [];
    const notifications = notificationsRes.data || [];

    // Calculate summaries
    const totalSpent = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
    const totalLoanAmount = loans.reduce((s, l) => s + (Number(l.amount) || 0), 0);
    const totalRepaid = loans.reduce((s, l) => s + (Number(l.amount_repaid) || 0), 0);
    const activeLoans = loans.filter(l => ['approved', 'disbursed', 'repaying'].includes(l.status));
    // S2.5: Fixed column names to match DB schema (body/is_read instead of message/read)
    const unreadNotifications = notifications.filter(n => !n.is_read).length;

    return NextResponse.json({
      profile,
      member,
      stats: {
        totalSpent,
        orderCount: orders.length,
        totalLoanAmount,
        totalRepaid,
        activeLoanCount: activeLoans.length,
        unreadNotifications,
        memberSince: member?.join_date || profile?.created_at,
        tier: member?.tier || 'new_enterprise',
        creditScore: member?.credit_score || 0,
      },
      recentOrders: orders,
      recentLoans: loans,
      notifications,
    });
  } catch (err) {
    console.error('Member dashboard error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
