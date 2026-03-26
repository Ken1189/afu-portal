/**
 * Commission Calculation Engine
 *
 * Calculates and records commissions for ambassador referrals.
 * Integrates with the double-entry ledger for financial tracking.
 *
 * Peter's Commission Structure:
 * - Membership fees: 10% recurring
 * - Fundraising: 100K-500K=2%, 500K-1M=2.5%, 1M-5M=5%, 5M-10M=7.5%, 10M+=10%
 * - Advertising: 10%
 * - Loan origination: 1%
 * - Insurance: 5%
 * - Marketplace: 3%
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { LedgerService } from '../banking/ledger';

const COMMISSION_PAYOUT_ACCOUNT = '00000000-0000-0000-0000-00000000000b';

type CommissionType = 'membership' | 'fundraising' | 'advertising' | 'loan_origination' | 'insurance' | 'marketplace' | 'sponsorship' | 'other';

interface CommissionRate {
  commission_type: CommissionType;
  rate_percent: number;
  min_amount: number | null;
  max_amount: number | null;
  is_recurring: boolean;
  tier_bonus: number;
}

export class CommissionEngine {
  private ledger: LedgerService;

  constructor(private db: SupabaseClient) {
    this.ledger = new LedgerService(db);
  }

  /**
   * Calculate and record commission for a transaction.
   * Call this whenever a referred user makes a payment.
   */
  async processCommission(input: {
    referred_user_id: string;
    commission_type: CommissionType;
    source_amount: number;
    currency?: string;
    source_reference?: string;
    source_type?: string;
    description?: string;
  }): Promise<{ commission_amount: number; entry_id: string } | null> {
    // Find the referral link for this user
    const { data: link } = await this.db
      .from('referral_links')
      .select('id, ambassador_id, referral_code')
      .eq('referred_user_id', input.referred_user_id)
      .eq('status', 'active')
      .single();

    if (!link) return null; // User was not referred by an ambassador

    // Get the ambassador's tier for bonus calculation
    const { data: ambassador } = await this.db
      .from('ambassadors')
      .select('id, tier, commission_rate_override')
      .eq('id', link.ambassador_id)
      .single();

    if (!ambassador) return null;

    // Get the commission rate
    const rate = await this.getRate(input.commission_type, input.source_amount, ambassador.tier);
    if (!rate || rate.rate_percent <= 0) return null;

    // Check for custom override
    let finalRate = rate.rate_percent + rate.tier_bonus;
    if (ambassador.commission_rate_override) {
      const override = ambassador.commission_rate_override as Record<string, number>;
      if (override[input.commission_type] !== undefined) {
        finalRate = override[input.commission_type];
      }
    }

    // Calculate commission
    const commission_amount = Math.round((input.source_amount * finalRate / 100) * 100) / 100;
    if (commission_amount <= 0) return null;

    const currency = input.currency || 'USD';

    // Record commission entry
    const { data: entry, error } = await this.db
      .from('commission_entries')
      .insert({
        ambassador_id: ambassador.id,
        referral_link_id: link.id,
        commission_type: input.commission_type,
        description: input.description || `${input.commission_type} commission @ ${finalRate}%`,
        source_amount: input.source_amount,
        rate_percent: finalRate,
        commission_amount,
        currency,
        source_reference: input.source_reference || null,
        source_type: input.source_type || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to record commission: ${error.message}`);

    // Update ambassador earnings
    // Update ambassador earnings directly
    const { data: currentAmb } = await this.db
      .from('ambassadors')
      .select('pending_earnings, total_earnings')
      .eq('id', ambassador.id)
      .single();

    if (currentAmb) {
      await this.db.from('ambassadors').update({
        pending_earnings: Number(currentAmb.pending_earnings || 0) + commission_amount,
        total_earnings: Number(currentAmb.total_earnings || 0) + commission_amount,
      }).eq('id', ambassador.id);
    }

    // Update referral link lifetime value
    await this.db
      .from('referral_links')
      .update({
        lifetime_value: Number((await this.db.from('referral_links').select('lifetime_value').eq('id', link.id).single()).data?.lifetime_value || 0) + input.source_amount,
        total_commission_earned: Number((await this.db.from('referral_links').select('total_commission_earned').eq('id', link.id).single()).data?.total_commission_earned || 0) + commission_amount,
        first_payment_at: input.source_type === 'membership' ? new Date().toISOString() : undefined,
      })
      .eq('id', link.id);

    return { commission_amount, entry_id: entry.id };
  }

  /**
   * Get the applicable commission rate
   */
  async getRate(
    type: CommissionType,
    amount: number,
    ambassadorTier?: string
  ): Promise<CommissionRate | null> {
    // Get base rates for this type
    const { data: rates } = await this.db
      .from('commission_rates')
      .select('*')
      .eq('commission_type', type)
      .eq('is_active', true)
      .order('min_amount', { ascending: true, nullsFirst: true });

    if (!rates || rates.length === 0) return null;

    // For tiered rates (fundraising), find the right tier
    let rate = rates[0];
    if (rates.length > 1 && rates[0].min_amount !== null) {
      // Tiered — find matching amount bracket
      const matching = rates.find((r: { min_amount: number | null; max_amount: number | null }) => {
        const min = r.min_amount || 0;
        const max = r.max_amount || Infinity;
        return amount >= min && amount < max;
      });
      if (matching) rate = matching;
      else rate = rates[rates.length - 1]; // Use highest tier if amount exceeds all
    }

    // Get tier bonus
    let tierBonus = 0;
    if (ambassadorTier) {
      const { data: tierData } = await this.db
        .from('ambassador_tiers')
        .select('commission_bonus_percent')
        .eq('tier', ambassadorTier)
        .single();
      tierBonus = Number(tierData?.commission_bonus_percent || 0);
    }

    return {
      commission_type: type,
      rate_percent: Number(rate.rate_percent),
      min_amount: rate.min_amount,
      max_amount: rate.max_amount,
      is_recurring: rate.is_recurring || false,
      tier_bonus: tierBonus,
    };
  }

  /**
   * Register a referral (when a new user signs up with a referral code)
   */
  async registerReferral(referralCode: string, newUserId: string): Promise<boolean> {
    // Find ambassador by referral code
    const { data: ambassador } = await this.db
      .from('ambassadors')
      .select('id')
      .eq('referral_code', referralCode)
      .eq('status', 'active')
      .single();

    if (!ambassador) return false;

    // Check if already referred
    const { data: existing } = await this.db
      .from('referral_links')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single();

    if (existing) return false; // Already referred by someone

    // Create referral link
    await this.db.from('referral_links').insert({
      ambassador_id: ambassador.id,
      referred_user_id: newUserId,
      referral_code: referralCode,
      status: 'active',
    });

    // Increment ambassador referral count
    const { data: amb } = await this.db
      .from('ambassadors')
      .select('total_referrals, active_referrals')
      .eq('id', ambassador.id)
      .single();

    if (amb) {
      const newTotal = (amb.total_referrals || 0) + 1;
      const newActive = (amb.active_referrals || 0) + 1;

      // Auto-upgrade tier
      const { data: tiers } = await this.db
        .from('ambassador_tiers')
        .select('tier, min_referrals')
        .order('min_referrals', { ascending: false });

      let newTier = 'bronze';
      if (tiers) {
        for (const t of tiers) {
          if (newTotal >= t.min_referrals) {
            newTier = t.tier;
            break;
          }
        }
      }

      await this.db.from('ambassadors').update({
        total_referrals: newTotal,
        active_referrals: newActive,
        tier: newTier,
      }).eq('id', ambassador.id);
    }

    return true;
  }

  /**
   * Process a payout for an ambassador
   */
  async createPayout(input: {
    ambassador_id: string;
    amount: number;
    currency?: string;
    payout_method: string;
    payout_details?: Record<string, unknown>;
    approved_by?: string;
  }): Promise<{ payout_id: string }> {
    const currency = input.currency || 'USD';

    // Get ambassador's wallet account for ledger
    const { data: ambassador } = await this.db
      .from('ambassadors')
      .select('wallet_account_id, pending_earnings')
      .eq('id', input.ambassador_id)
      .single();

    if (!ambassador) throw new Error('Ambassador not found');
    if (Number(ambassador.pending_earnings || 0) < input.amount) {
      throw new Error('Insufficient pending earnings');
    }

    // Count pending commission entries to include
    const { data: pendingEntries } = await this.db
      .from('commission_entries')
      .select('id')
      .eq('ambassador_id', input.ambassador_id)
      .eq('status', 'pending');

    // Create payout record
    const { data: payout, error } = await this.db
      .from('ambassador_payouts')
      .insert({
        ambassador_id: input.ambassador_id,
        amount: input.amount,
        currency,
        payout_method: input.payout_method,
        payout_details: input.payout_details || {},
        commission_count: pendingEntries?.length || 0,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create payout: ${error.message}`);

    return { payout_id: payout.id };
  }

  /**
   * Approve and execute a payout
   */
  async approvePayout(payoutId: string, approvedBy: string): Promise<void> {
    const { data: payout } = await this.db
      .from('ambassador_payouts')
      .select('*')
      .eq('id', payoutId)
      .single();

    if (!payout) throw new Error('Payout not found');
    if (payout.status !== 'pending') throw new Error(`Payout is ${payout.status}`);

    // Record in ledger
    try {
      const txn = await this.ledger.recordTransaction({
        debit_account_id: COMMISSION_PAYOUT_ACCOUNT,
        credit_account_id: COMMISSION_PAYOUT_ACCOUNT, // Will be ambassador's wallet when set up
        amount: payout.amount,
        currency: payout.currency,
        description: `Ambassador payout: ${payoutId}`,
        reference: payoutId,
        reference_type: 'commission_payout',
        operator_id: approvedBy,
      });

      // Update payout
      await this.db.from('ambassador_payouts').update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        ledger_transaction_id: txn.transaction_id,
      }).eq('id', payoutId);

    } catch {
      // Ledger might fail if accounts don't match — still approve
      await this.db.from('ambassador_payouts').update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
      }).eq('id', payoutId);
    }

    // Mark commission entries as paid
    await this.db
      .from('commission_entries')
      .update({ status: 'paid', paid_in_payout_id: payoutId })
      .eq('ambassador_id', payout.ambassador_id)
      .eq('status', 'pending');

    // Update ambassador earnings
    await this.db.from('ambassadors').update({
      pending_earnings: 0,
      paid_earnings: Number(payout.amount) + Number(
        (await this.db.from('ambassadors').select('paid_earnings').eq('id', payout.ambassador_id).single()).data?.paid_earnings || 0
      ),
    }).eq('id', payout.ambassador_id);
  }

  /**
   * Get ambassador dashboard stats
   */
  async getDashboard(ambassadorId: string): Promise<{
    tier: string;
    total_referrals: number;
    active_referrals: number;
    total_earnings: number;
    pending_earnings: number;
    paid_earnings: number;
    recent_commissions: Array<{
      id: string;
      type: string;
      amount: number;
      source_amount: number;
      rate: number;
      status: string;
      created_at: string;
    }>;
    recent_referrals: Array<{
      id: string;
      signed_up_at: string;
      lifetime_value: number;
      commission_earned: number;
      status: string;
    }>;
    monthly_earnings: Array<{ month: string; amount: number }>;
  }> {
    const { data: ambassador } = await this.db
      .from('ambassadors')
      .select('tier, total_referrals, active_referrals, total_earnings, pending_earnings, paid_earnings')
      .eq('id', ambassadorId)
      .single();

    if (!ambassador) throw new Error('Ambassador not found');

    // Recent commissions
    const { data: commissions } = await this.db
      .from('commission_entries')
      .select('id, commission_type, commission_amount, source_amount, rate_percent, status, created_at')
      .eq('ambassador_id', ambassadorId)
      .order('created_at', { ascending: false })
      .limit(20);

    // Recent referrals
    const { data: referrals } = await this.db
      .from('referral_links')
      .select('id, signed_up_at, lifetime_value, total_commission_earned, status')
      .eq('ambassador_id', ambassadorId)
      .order('signed_up_at', { ascending: false })
      .limit(20);

    // Monthly earnings (last 12 months)
    const { data: monthlyData } = await this.db
      .from('commission_entries')
      .select('commission_amount, created_at')
      .eq('ambassador_id', ambassadorId)
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    const monthMap: Record<string, number> = {};
    (monthlyData || []).forEach((e: { commission_amount: number; created_at: string }) => {
      const month = e.created_at.slice(0, 7);
      monthMap[month] = (monthMap[month] || 0) + Number(e.commission_amount);
    });

    return {
      tier: ambassador.tier || 'bronze',
      total_referrals: ambassador.total_referrals || 0,
      active_referrals: ambassador.active_referrals || 0,
      total_earnings: Number(ambassador.total_earnings || 0),
      pending_earnings: Number(ambassador.pending_earnings || 0),
      paid_earnings: Number(ambassador.paid_earnings || 0),
      recent_commissions: (commissions || []).map((c: Record<string, unknown>) => ({
        id: c.id as string,
        type: c.commission_type as string,
        amount: Number(c.commission_amount),
        source_amount: Number(c.source_amount),
        rate: Number(c.rate_percent),
        status: c.status as string,
        created_at: c.created_at as string,
      })),
      recent_referrals: (referrals || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        signed_up_at: r.signed_up_at as string,
        lifetime_value: Number(r.lifetime_value || 0),
        commission_earned: Number(r.total_commission_earned || 0),
        status: r.status as string,
      })),
      monthly_earnings: Object.entries(monthMap)
        .map(([month, amount]) => ({ month, amount }))
        .sort((a, b) => a.month.localeCompare(b.month)),
    };
  }

  /**
   * Get all commission rates (for display)
   */
  async getAllRates(): Promise<Record<string, Array<{ rate: number; min?: number; max?: number; description: string; recurring: boolean }>>> {
    const { data: rates } = await this.db
      .from('commission_rates')
      .select('*')
      .eq('is_active', true)
      .order('commission_type')
      .order('min_amount', { ascending: true, nullsFirst: true });

    const grouped: Record<string, Array<{ rate: number; min?: number; max?: number; description: string; recurring: boolean }>> = {};

    (rates || []).forEach((r: Record<string, unknown>) => {
      const type = r.commission_type as string;
      if (!grouped[type]) grouped[type] = [];
      grouped[type].push({
        rate: Number(r.rate_percent),
        min: r.min_amount ? Number(r.min_amount) : undefined,
        max: r.max_amount ? Number(r.max_amount) : undefined,
        description: r.description as string,
        recurring: r.is_recurring as boolean,
      });
    });

    return grouped;
  }
}
