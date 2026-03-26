/**
 * Partner API: Regulatory Reporting Feeds
 *
 * Automated data exports for banking partner regulatory filings:
 * - Daily transaction summary
 * - Monthly aggregates
 * - KYC status report
 * - Loan book report
 * - Account balances
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticatePartner, checkRateLimit } from '@/lib/banking/partner-auth';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const auth = await authenticatePartner(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!checkRateLimit(auth.partner.partner_id, 50)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const report = req.nextUrl.searchParams.get('report');
    const date = req.nextUrl.searchParams.get('date'); // YYYY-MM-DD
    const month = req.nextUrl.searchParams.get('month'); // YYYY-MM
    const currency = req.nextUrl.searchParams.get('currency') || 'USD';
    const db = getServiceClient();

    switch (report) {
      case 'daily_transactions': {
        if (!date) return NextResponse.json({ error: 'date required (YYYY-MM-DD)' }, { status: 400 });
        const startOfDay = `${date}T00:00:00.000Z`;
        const endOfDay = `${date}T23:59:59.999Z`;

        const { data: entries } = await db
          .from('ledger_entries')
          .select('entry_type, amount, currency, reference_type, created_at')
          .eq('currency', currency)
          .gte('created_at', startOfDay)
          .lte('created_at', endOfDay);

        const summary = {
          date,
          currency,
          total_transactions: entries?.length || 0,
          total_debits: 0,
          total_credits: 0,
          by_type: {} as Record<string, { count: number; total: number }>,
        };

        (entries || []).forEach((e: { entry_type: string; amount: number; reference_type: string | null }) => {
          const amt = Number(e.amount);
          if (e.entry_type === 'debit') summary.total_debits += amt;
          else summary.total_credits += amt;

          const type = e.reference_type || 'other';
          if (!summary.by_type[type]) summary.by_type[type] = { count: 0, total: 0 };
          summary.by_type[type].count++;
          summary.by_type[type].total += amt;
        });

        return NextResponse.json(summary);
      }

      case 'monthly_aggregates': {
        if (!month) return NextResponse.json({ error: 'month required (YYYY-MM)' }, { status: 400 });
        const startOfMonth = `${month}-01T00:00:00.000Z`;
        const [year, m] = month.split('-').map(Number);
        const endDate = new Date(year, m, 0); // last day of month
        const endOfMonth = `${month}-${endDate.getDate().toString().padStart(2, '0')}T23:59:59.999Z`;

        // Active wallets
        const { count: activeWallets } = await db
          .from('wallet_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .eq('currency', currency);

        // Transaction volumes
        const { data: entries } = await db
          .from('ledger_entries')
          .select('amount, entry_type, reference_type')
          .eq('currency', currency)
          .eq('entry_type', 'credit')
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        const totalVolume = (entries || []).reduce(
          (sum: number, e: { amount: number }) => sum + Number(e.amount), 0
        );

        // New accounts this month
        const { count: newAccounts } = await db
          .from('wallet_accounts')
          .select('id', { count: 'exact', head: true })
          .eq('currency', currency)
          .gte('created_at', startOfMonth)
          .lte('created_at', endOfMonth);

        return NextResponse.json({
          month,
          currency,
          active_accounts: activeWallets || 0,
          new_accounts: newAccounts || 0,
          total_transactions: entries?.length || 0,
          total_volume: totalVolume,
        });
      }

      case 'kyc_status': {
        const { data: kycData } = await db
          .from('kyc_verifications')
          .select('status')
          .order('created_at', { ascending: false });

        const statusCounts: Record<string, number> = {};
        (kycData || []).forEach((k: { status: string }) => {
          statusCounts[k.status] = (statusCounts[k.status] || 0) + 1;
        });

        return NextResponse.json({
          report_date: new Date().toISOString().split('T')[0],
          total: kycData?.length || 0,
          by_status: statusCounts,
        });
      }

      case 'loan_book': {
        const { data: loans } = await db
          .from('loans')
          .select('status, amount, currency, disbursed_amount, repaid_amount');

        const summary = {
          report_date: new Date().toISOString().split('T')[0],
          currency,
          total_loans: 0,
          total_outstanding: 0,
          total_disbursed: 0,
          total_repaid: 0,
          by_status: {} as Record<string, { count: number; amount: number }>,
        };

        (loans || []).forEach((l: { status: string; amount: number; disbursed_amount: number; repaid_amount: number; currency: string }) => {
          if (l.currency !== currency) return;
          summary.total_loans++;
          summary.total_disbursed += Number(l.disbursed_amount || 0);
          summary.total_repaid += Number(l.repaid_amount || 0);
          summary.total_outstanding += Number(l.disbursed_amount || 0) - Number(l.repaid_amount || 0);

          if (!summary.by_status[l.status]) summary.by_status[l.status] = { count: 0, amount: 0 };
          summary.by_status[l.status].count++;
          summary.by_status[l.status].amount += Number(l.amount || 0);
        });

        return NextResponse.json(summary);
      }

      case 'account_balances': {
        const { data: accounts } = await db
          .from('ledger_accounts')
          .select('account_type, currency, balance, is_system')
          .eq('currency', currency);

        const systemAccounts = (accounts || []).filter((a: { is_system: boolean }) => a.is_system);
        const userAccounts = (accounts || []).filter((a: { is_system: boolean }) => !a.is_system);

        return NextResponse.json({
          report_date: new Date().toISOString().split('T')[0],
          currency,
          system_accounts: systemAccounts.map((a: { account_type: string; balance: number }) => ({
            type: a.account_type,
            balance: Number(a.balance),
          })),
          user_accounts_summary: {
            total_accounts: userAccounts.length,
            total_balance: userAccounts.reduce(
              (sum: number, a: { balance: number }) => sum + Number(a.balance), 0
            ),
          },
        });
      }

      default:
        return NextResponse.json({
          error: 'Invalid report type',
          available: ['daily_transactions', 'monthly_aggregates', 'kyc_status', 'loan_book', 'account_balances'],
        }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
