/**
 * Ad Revenue Integration with Double-Entry Ledger
 *
 * When a supplier pays for an ad package, the payment flows through
 * the ledger system: debit ad_escrow → credit ad_revenue.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { LedgerService } from '../banking/ledger';

// System account IDs for advertising
const AD_REVENUE_ACCOUNT = '00000000-0000-0000-0000-000000000009';
const AD_ESCROW_ACCOUNT = '00000000-0000-0000-0000-00000000000a';

export class AdRevenueService {
  private ledger: LedgerService;

  constructor(private db: SupabaseClient) {
    this.ledger = new LedgerService(db);
  }

  /**
   * Record an ad payment.
   * Creates a ledger transaction and records in ad_payments table.
   */
  async recordPayment(input: {
    ad_id: string;
    supplier_id: string;
    package_id?: string;
    amount: number;
    currency?: string;
    payment_method?: string;
    payment_reference?: string;
    stripe_session_id?: string;
  }): Promise<{ payment_id: string; ledger_transaction_id: string }> {
    const currency = input.currency || 'USD';

    // Record in ledger: debit escrow (money in), credit revenue (earned)
    const txn = await this.ledger.recordTransaction({
      debit_account_id: AD_ESCROW_ACCOUNT,
      credit_account_id: AD_REVENUE_ACCOUNT,
      amount: input.amount,
      currency,
      description: `Ad payment: ${input.ad_id}`,
      reference: input.ad_id,
      reference_type: 'ad_payment',
    });

    // Generate invoice number
    const invoiceNumber = 'ADV-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') +
      '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

    // Record in ad_payments
    const { data, error } = await this.db.from('ad_payments').insert({
      ad_id: input.ad_id,
      supplier_id: input.supplier_id,
      package_id: input.package_id || null,
      amount: input.amount,
      currency,
      payment_method: input.payment_method || null,
      payment_reference: input.payment_reference || null,
      stripe_session_id: input.stripe_session_id || null,
      ledger_transaction_id: txn.transaction_id,
      status: 'completed',
      invoice_number: invoiceNumber,
    }).select().single();

    if (error) throw new Error(`Failed to record ad payment: ${error.message}`);

    return {
      payment_id: data.id,
      ledger_transaction_id: txn.transaction_id,
    };
  }

  /**
   * Get total ad revenue for a period
   */
  async getRevenue(options: {
    from?: string;
    to?: string;
    currency?: string;
  } = {}): Promise<{
    total: number;
    count: number;
    by_method: Record<string, number>;
    by_month: { month: string; total: number }[];
  }> {
    let query = this.db
      .from('ad_payments')
      .select('amount, payment_method, created_at')
      .eq('status', 'completed');

    if (options.from) query = query.gte('created_at', options.from);
    if (options.to) query = query.lte('created_at', options.to);
    if (options.currency) query = query.eq('currency', options.currency);

    const { data } = await query;

    const result = {
      total: 0,
      count: 0,
      by_method: {} as Record<string, number>,
      by_month: [] as { month: string; total: number }[],
    };

    const monthMap: Record<string, number> = {};

    (data || []).forEach((p: { amount: number; payment_method: string | null; created_at: string }) => {
      const amt = Number(p.amount);
      result.total += amt;
      result.count++;

      const method = p.payment_method || 'unknown';
      result.by_method[method] = (result.by_method[method] || 0) + amt;

      const month = p.created_at.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + amt;
    });

    result.by_month = Object.entries(monthMap)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return result;
  }

  /**
   * Get supplier's ad spend
   */
  async getSupplierSpend(supplierId: string): Promise<{
    total_spent: number;
    active_campaigns: number;
    payments: Array<{
      id: string;
      amount: number;
      invoice_number: string;
      created_at: string;
    }>;
  }> {
    const { data: payments } = await this.db
      .from('ad_payments')
      .select('id, amount, invoice_number, created_at')
      .eq('supplier_id', supplierId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    const { count: activeCampaigns } = await this.db
      .from('advertisements')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplierId)
      .eq('status', 'active');

    return {
      total_spent: (payments || []).reduce((sum: number, p: { amount: number }) => sum + Number(p.amount), 0),
      active_campaigns: activeCampaigns || 0,
      payments: (payments || []) as Array<{ id: string; amount: number; invoice_number: string; created_at: string }>,
    };
  }
}
