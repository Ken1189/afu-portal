import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * GET /api/admin/financial
 *
 * Returns comprehensive financial data:
 * - Payments (all records with member info)
 * - Loans (portfolio summary + individual records)
 * - Commissions (pending + paid)
 * - Audit log (recent entries)
 */
export async function GET() {
  try {
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [paymentsRes, loansRes, commissionsRes, auditRes, ordersRes] = await Promise.all([
      svc.from('payments').select('*').order('created_at', { ascending: false }).limit(100),
      svc.from('loans').select('*').order('created_at', { ascending: false }).limit(100),
      svc.from('commissions').select('*').order('created_at', { ascending: false }).limit(100),
      svc.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50),
      svc.from('orders').select('id, order_number, total, status, created_at').order('created_at', { ascending: false }).limit(50),
    ]);

    const payments = paymentsRes.data || [];
    const loans = loansRes.data || [];
    const commissions = commissionsRes.data || [];
    const audit = auditRes.data || [];
    const orders = ordersRes.data || [];

    // Payment aggregations
    const completedPayments = payments.filter(p => p.status === 'completed');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const failedPayments = payments.filter(p => p.status === 'failed');

    // Loan aggregations
    const activeLoans = loans.filter(l => ['approved', 'disbursed', 'repaying'].includes(l.status));
    const pendingLoans = loans.filter(l => ['draft', 'submitted', 'under_review'].includes(l.status));
    const completedLoans = loans.filter(l => l.status === 'completed');
    const defaultedLoans = loans.filter(l => l.status === 'defaulted');

    // Commission aggregations
    const pendingCommissions = commissions.filter(c => c.status === 'pending');
    const paidCommissions = commissions.filter(c => c.status === 'completed');

    return NextResponse.json({
      payments: {
        records: payments,
        stats: {
          total: payments.length,
          totalCollected: completedPayments.reduce((s, p) => s + Number(p.amount), 0),
          totalPending: pendingPayments.reduce((s, p) => s + Number(p.amount), 0),
          totalFailed: failedPayments.reduce((s, p) => s + Number(p.amount), 0),
          completedCount: completedPayments.length,
          pendingCount: pendingPayments.length,
          failedCount: failedPayments.length,
        },
      },
      loans: {
        records: loans,
        stats: {
          total: loans.length,
          totalDeployed: activeLoans.reduce((s, l) => s + Number(l.amount), 0),
          totalRepaid: loans.reduce((s, l) => s + Number(l.amount_repaid || 0), 0),
          activeCount: activeLoans.length,
          pendingCount: pendingLoans.length,
          completedCount: completedLoans.length,
          defaultedCount: defaultedLoans.length,
          defaultRate: loans.length > 0 ? ((defaultedLoans.length / loans.length) * 100).toFixed(1) : '0.0',
        },
      },
      commissions: {
        records: commissions,
        stats: {
          total: commissions.length,
          pendingAmount: pendingCommissions.reduce((s, c) => s + Number(c.commission_amount), 0),
          paidAmount: paidCommissions.reduce((s, c) => s + Number(c.commission_amount), 0),
          pendingCount: pendingCommissions.length,
          paidCount: paidCommissions.length,
        },
      },
      audit: audit.map(a => ({
        ...a,
        severity: a.action?.includes('delete') || a.action?.includes('suspend') ? 'warning'
          : a.action?.includes('create') || a.action?.includes('approve') ? 'info'
          : 'low',
      })),
      orders: {
        records: orders,
        stats: {
          total: orders.length,
          totalRevenue: orders.reduce((s, o) => s + Number(o.total || 0), 0),
        },
      },
    });
  } catch (err) {
    console.error('Financial API error:', err);
    return NextResponse.json({ error: 'Failed to fetch financial data' }, { status: 500 });
  }
}
