/**
 * Transaction Monitoring Service
 *
 * Real-time screening of financial transactions against velocity rules
 * and amount thresholds. Flags suspicious activity for review.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  TransactionFlag,
  VelocityRule,
  TransactionContext,
  FlagType,
  FlagSeverity,
} from './types';

export class MonitoringService {
  private rulesCache: VelocityRule[] | null = null;
  private cacheExpiry = 0;

  constructor(private db: SupabaseClient) {}

  /**
   * Screen a transaction against all active rules.
   * Call this AFTER a transaction is recorded in the ledger.
   * Returns any flags that were created.
   */
  async screenTransaction(ctx: TransactionContext): Promise<TransactionFlag[]> {
    const rules = await this.getActiveRules();
    const flags: TransactionFlag[] = [];

    for (const rule of rules) {
      // Skip rules that don't apply to this currency/country
      if (rule.currency && rule.currency !== ctx.currency) continue;
      if (rule.country_code && rule.country_code !== ctx.country_code) continue;

      let triggered = false;

      // Check velocity (transaction count)
      if (rule.max_count) {
        const count = await this.getTransactionCount(
          ctx.user_id,
          rule.window_minutes,
          ctx.currency
        );
        if (count >= rule.max_count) triggered = true;
      }

      // Check amount threshold
      if (rule.max_amount) {
        const total = await this.getTransactionTotal(
          ctx.user_id,
          rule.window_minutes,
          ctx.currency
        );
        if (total >= rule.max_amount) triggered = true;
      }

      if (triggered) {
        const flag = await this.createFlag({
          user_id: ctx.user_id,
          flag_type: rule.flag_type,
          severity: rule.severity as FlagSeverity,
          details: {
            rule_id: rule.id,
            rule_name: rule.name,
            transaction_amount: ctx.amount,
            currency: ctx.currency,
            country_code: ctx.country_code,
            ip_address: ctx.ip_address,
            device_fingerprint: ctx.device_fingerprint,
            geolocation: ctx.geolocation,
            threshold: rule.max_amount || rule.max_count,
            window_minutes: rule.window_minutes,
          },
        });
        flags.push(flag);
      }
    }

    return flags;
  }

  /**
   * Create a manual flag on a transaction
   */
  async createFlag(input: {
    transaction_id?: string;
    wallet_txn_id?: string;
    user_id: string;
    flag_type: FlagType;
    severity: FlagSeverity;
    details: Record<string, unknown>;
  }): Promise<TransactionFlag> {
    const { data, error } = await this.db
      .from('transaction_flags')
      .insert({
        transaction_id: input.transaction_id || null,
        wallet_txn_id: input.wallet_txn_id || null,
        user_id: input.user_id,
        flag_type: input.flag_type,
        severity: input.severity,
        details: input.details,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create flag: ${error.message}`);
    return data as TransactionFlag;
  }

  /**
   * Review a flag (update status)
   */
  async reviewFlag(
    flagId: string,
    reviewedBy: string,
    status: TransactionFlag['status'],
    notes?: string
  ): Promise<TransactionFlag> {
    const { data, error } = await this.db
      .from('transaction_flags')
      .update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', flagId)
      .select()
      .single();

    if (error) throw new Error(`Failed to review flag: ${error.message}`);
    return data as TransactionFlag;
  }

  /**
   * Escalate a flag to bank partner AML team
   */
  async escalateFlag(
    flagId: string,
    escalatedTo: string,
    reviewedBy: string,
    notes?: string
  ): Promise<TransactionFlag> {
    const { data, error } = await this.db
      .from('transaction_flags')
      .update({
        status: 'escalated',
        escalated_to: escalatedTo,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq('id', flagId)
      .select()
      .single();

    if (error) throw new Error(`Failed to escalate flag: ${error.message}`);
    return data as TransactionFlag;
  }

  /**
   * Get all flags with pagination and filtering
   */
  async getFlags(options: {
    status?: string;
    severity?: string;
    user_id?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ flags: TransactionFlag[]; total: number }> {
    const { limit = 50, offset = 0 } = options;

    let query = this.db
      .from('transaction_flags')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (options.status) query = query.eq('status', options.status);
    if (options.severity) query = query.eq('severity', options.severity);
    if (options.user_id) query = query.eq('user_id', options.user_id);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to get flags: ${error.message}`);

    return { flags: (data || []) as TransactionFlag[], total: count || 0 };
  }

  /**
   * Get flag statistics for dashboard
   */
  async getStats(): Promise<{
    total_pending: number;
    total_investigating: number;
    total_escalated: number;
    high_severity_pending: number;
  }> {
    const [pending, investigating, escalated, highPending] = await Promise.all([
      this.db.from('transaction_flags').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      this.db.from('transaction_flags').select('id', { count: 'exact', head: true }).eq('status', 'investigating'),
      this.db.from('transaction_flags').select('id', { count: 'exact', head: true }).eq('status', 'escalated'),
      this.db.from('transaction_flags').select('id', { count: 'exact', head: true }).eq('status', 'pending').in('severity', ['high', 'critical']),
    ]);

    return {
      total_pending: pending.count || 0,
      total_investigating: investigating.count || 0,
      total_escalated: escalated.count || 0,
      high_severity_pending: highPending.count || 0,
    };
  }

  // ─── Velocity Rule Management ───

  async getActiveRules(): Promise<VelocityRule[]> {
    // Cache rules for 5 minutes
    if (this.rulesCache && Date.now() < this.cacheExpiry) {
      return this.rulesCache;
    }

    const { data, error } = await this.db
      .from('velocity_rules')
      .select('*')
      .eq('is_active', true);

    if (error) throw new Error(`Failed to get rules: ${error.message}`);

    this.rulesCache = (data || []) as VelocityRule[];
    this.cacheExpiry = Date.now() + 5 * 60 * 1000;
    return this.rulesCache;
  }

  async createRule(rule: Omit<VelocityRule, 'id'>): Promise<VelocityRule> {
    const { data, error } = await this.db
      .from('velocity_rules')
      .insert(rule)
      .select()
      .single();

    if (error) throw new Error(`Failed to create rule: ${error.message}`);
    this.rulesCache = null; // Invalidate cache
    return data as VelocityRule;
  }

  async updateRule(id: string, updates: Partial<VelocityRule>): Promise<VelocityRule> {
    const { data, error } = await this.db
      .from('velocity_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update rule: ${error.message}`);
    this.rulesCache = null;
    return data as VelocityRule;
  }

  // ─── Private Helpers ───

  private async getTransactionCount(
    userId: string,
    windowMinutes: number,
    currency?: string
  ): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    let query = this.db
      .from('wallet_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('wallet_id', userId) // Note: we need wallet_id, will join via wallet
      .gte('created_at', since);

    if (currency) query = query.eq('currency', currency);

    const { count } = await query;
    return count || 0;
  }

  private async getTransactionTotal(
    userId: string,
    windowMinutes: number,
    currency?: string
  ): Promise<number> {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    let query = this.db
      .from('wallet_transactions')
      .select('amount')
      .gte('created_at', since);

    if (currency) query = query.eq('currency', currency);

    // Filter by user's wallets
    const { data: wallets } = await this.db
      .from('wallet_accounts')
      .select('id')
      .eq('user_id', userId);

    if (!wallets || wallets.length === 0) return 0;

    const walletIds = wallets.map((w: { id: string }) => w.id);
    query = query.in('wallet_id', walletIds);

    const { data } = await query;
    return (data || []).reduce(
      (sum: number, t: { amount: number }) => sum + Math.abs(Number(t.amount)), 0
    );
  }
}
