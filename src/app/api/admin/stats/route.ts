import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/stats
 *
 * Returns aggregated dashboard statistics from all Supabase tables.
 * Requires admin authentication.
 */
export async function GET() {
  try {
    // S1.4: Auth guard — verify caller is authenticated admin
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: profile } = await svc.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // Run all queries in parallel for speed
    const [
      membersRes,
      suppliersRes,
      ordersRes,
      paymentsRes,
      applicationsRes,
      loansRes,
      productsRes,
      recentAuditRes,
    ] = await Promise.all([
      // Members by status
      svc.from('members').select('id, status, tier, created_at', { count: 'exact' }),
      // Suppliers by status
      svc.from('suppliers').select('id, status, total_sales, total_orders, created_at', { count: 'exact' }),
      // Orders
      svc.from('orders').select('id, total, status, created_at', { count: 'exact' }),
      // Payments
      svc.from('payments').select('id, amount, status, created_at', { count: 'exact' }),
      // Pending applications
      svc.from('membership_applications').select('id, status, created_at', { count: 'exact' }),
      // Loans
      svc.from('loans').select('id, amount, status, created_at', { count: 'exact' }),
      // Products
      svc.from('products').select('id, in_stock', { count: 'exact' }),
      // Recent audit log entries
      svc.from('audit_log').select('id, action, entity_type, details, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const members = membersRes.data || [];
    const suppliers = suppliersRes.data || [];
    const orders = ordersRes.data || [];
    const payments = paymentsRes.data || [];
    const applications = applicationsRes.data || [];
    const loans = loansRes.data || [];
    const products = productsRes.data || [];
    const recentAudit = recentAuditRes.data || [];

    // Aggregate stats
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalPayments = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const totalLoanAmount = loans.reduce((sum, l) => sum + (Number(l.amount) || 0), 0);
    const supplierSales = suppliers.reduce((sum, s) => sum + (Number(s.total_sales) || 0), 0);

    const stats = {
      members: {
        total: members.length,
        active: members.filter(m => m.status === 'active').length,
        pending: members.filter(m => m.status === 'pending').length,
        suspended: members.filter(m => m.status === 'suspended').length,
        byTier: {
          student: members.filter(m => m.tier === 'student').length,
          new_enterprise: members.filter(m => m.tier === 'new_enterprise').length,
          smallholder: members.filter(m => m.tier === 'smallholder').length,
          farmer_grower: members.filter(m => m.tier === 'farmer_grower').length,
          commercial: members.filter(m => m.tier === 'commercial').length,
        },
      },
      suppliers: {
        total: suppliers.length,
        active: suppliers.filter(s => s.status === 'active').length,
        pending: suppliers.filter(s => s.status === 'pending').length,
        suspended: suppliers.filter(s => s.status === 'suspended').length,
        totalSales: supplierSales,
      },
      orders: {
        total: orders.length,
        revenue: totalRevenue,
        pending: orders.filter(o => o.status === 'pending').length,
        completed: orders.filter(o => o.status === 'delivered').length,
      },
      payments: {
        total: payments.length,
        collected: totalPayments,
        pending: payments.filter(p => p.status === 'pending').length,
      },
      applications: {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        approved: applications.filter(a => a.status === 'approved').length,
        rejected: applications.filter(a => a.status === 'rejected').length,
      },
      loans: {
        total: loans.length,
        totalAmount: totalLoanAmount,
        active: loans.filter(l => ['approved', 'disbursed', 'repaying'].includes(l.status)).length,
        pending: loans.filter(l => ['draft', 'submitted', 'under_review'].includes(l.status)).length,
      },
      products: {
        total: products.length,
        inStock: products.filter(p => p.in_stock).length,
      },
      recentActivity: recentAudit,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error('Admin stats error:', err);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
