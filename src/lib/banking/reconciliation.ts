/**
 * Reconciliation Engine
 *
 * Daily automated comparison of AFU internal ledger against
 * payment provider statements. Identifies discrepancies and
 * generates settlement files.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { ReconciliationRun, ReconciliationItem, ReconStatus } from './types';

export interface ProviderStatement {
  reference: string;
  amount: number;
  date: string;
  currency: string;
  status: string;
}

export class ReconciliationService {
  constructor(private db: SupabaseClient) {}

  /**
   * Start a reconciliation run for a specific provider and date
   */
  async startRun(input: {
    run_date: string;
    provider: string;
    currency: string;
    run_by?: string;
  }): Promise<ReconciliationRun> {
    // Calculate our total from ledger entries for this provider on this date
    const ourBalance = await this.calculateOurBalance(
      input.provider,
      input.run_date,
      input.currency
    );

    const { data, error } = await this.db
      .from('reconciliation_runs')
      .insert({
        run_date: input.run_date,
        provider: input.provider,
        currency: input.currency,
        our_balance: ourBalance,
        status: 'pending',
        run_by: input.run_by || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to start recon run: ${error.message}`);
    return data as ReconciliationRun;
  }

  /**
   * Reconcile our transactions against provider statement
   */
  async reconcile(
    runId: string,
    providerStatements: ProviderStatement[]
  ): Promise<ReconciliationRun> {
    // Get the run
    const run = await this.getRun(runId);
    if (!run) throw new Error('Reconciliation run not found');

    // Get our transactions for this provider and date
    const ourTransactions = await this.getOurTransactions(
      run.provider,
      run.run_date,
      run.currency
    );

    // Match transactions
    const matched: ReconciliationItem[] = [];
    const unmatchedOurs: ReconciliationItem[] = [];
    const unmatchedProvider: ReconciliationItem[] = [];

    const providerUsed = new Set<number>();

    // Try to match each of our transactions
    for (const ours of ourTransactions) {
      let found = false;

      for (let i = 0; i < providerStatements.length; i++) {
        if (providerUsed.has(i)) continue;

        const theirs = providerStatements[i];

        // Match on reference and approximate amount
        if (
          ours.reference === theirs.reference &&
          Math.abs(ours.amount - theirs.amount) < 0.01
        ) {
          providerUsed.add(i);
          found = true;

          matched.push({
            id: '',
            run_id: runId,
            our_reference: ours.reference,
            our_amount: ours.amount,
            our_date: ours.date,
            provider_reference: theirs.reference,
            provider_amount: theirs.amount,
            provider_date: theirs.date,
            status: 'matched',
            discrepancy_amount: null,
            discrepancy_reason: null,
            resolved_by: null,
            resolved_at: null,
            resolution_notes: null,
            created_at: '',
          });
          break;
        }
      }

      if (!found) {
        unmatchedOurs.push({
          id: '',
          run_id: runId,
          our_reference: ours.reference,
          our_amount: ours.amount,
          our_date: ours.date,
          provider_reference: null,
          provider_amount: null,
          provider_date: null,
          status: 'discrepancy',
          discrepancy_amount: ours.amount,
          discrepancy_reason: 'No matching provider transaction',
          resolved_by: null,
          resolved_at: null,
          resolution_notes: null,
          created_at: '',
        });
      }
    }

    // Find unmatched provider transactions
    for (let i = 0; i < providerStatements.length; i++) {
      if (providerUsed.has(i)) continue;
      const theirs = providerStatements[i];

      unmatchedProvider.push({
        id: '',
        run_id: runId,
        our_reference: null,
        our_amount: null,
        our_date: null,
        provider_reference: theirs.reference,
        provider_amount: theirs.amount,
        provider_date: theirs.date,
        status: 'discrepancy',
        discrepancy_amount: theirs.amount,
        discrepancy_reason: 'No matching internal transaction',
        resolved_by: null,
        resolved_at: null,
        resolution_notes: null,
        created_at: '',
      });
    }

    // Insert all items
    const allItems = [...matched, ...unmatchedOurs, ...unmatchedProvider];
    if (allItems.length > 0) {
      const inserts = allItems.map((item) => ({
        run_id: runId,
        our_reference: item.our_reference,
        our_amount: item.our_amount,
        our_date: item.our_date,
        provider_reference: item.provider_reference,
        provider_amount: item.provider_amount,
        provider_date: item.provider_date,
        status: item.status,
        discrepancy_amount: item.discrepancy_amount,
        discrepancy_reason: item.discrepancy_reason,
      }));

      const { error } = await this.db.from('reconciliation_items').insert(inserts);
      if (error) throw new Error(`Failed to insert recon items: ${error.message}`);
    }

    // Calculate provider balance
    const providerBalance = providerStatements.reduce(
      (sum, s) => sum + s.amount, 0
    );

    // Update run
    const totalUnmatched = unmatchedOurs.length + unmatchedProvider.length;
    const discrepancy = Math.abs(run.our_balance - providerBalance);
    const status: ReconStatus = totalUnmatched === 0 && discrepancy < 0.01
      ? 'matched'
      : 'discrepancy';

    const { data: updatedRun, error: updateError } = await this.db
      .from('reconciliation_runs')
      .update({
        provider_balance: providerBalance,
        discrepancy,
        total_matched: matched.length,
        total_unmatched: totalUnmatched,
        status,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId)
      .select()
      .single();

    if (updateError) throw new Error(`Failed to update run: ${updateError.message}`);
    return updatedRun as ReconciliationRun;
  }

  /**
   * Resolve a discrepancy item
   */
  async resolveItem(
    itemId: string,
    resolvedBy: string,
    notes: string
  ): Promise<ReconciliationItem> {
    const { data, error } = await this.db
      .from('reconciliation_items')
      .update({
        status: 'resolved',
        resolved_by: resolvedBy,
        resolved_at: new Date().toISOString(),
        resolution_notes: notes,
      })
      .eq('id', itemId)
      .select()
      .single();

    if (error) throw new Error(`Failed to resolve item: ${error.message}`);
    return data as ReconciliationItem;
  }

  /**
   * Get reconciliation run by ID
   */
  async getRun(runId: string): Promise<ReconciliationRun | null> {
    const { data, error } = await this.db
      .from('reconciliation_runs')
      .select('*')
      .eq('id', runId)
      .single();

    if (error) return null;
    return data as ReconciliationRun;
  }

  /**
   * Get recent runs
   */
  async getRecentRuns(options: {
    provider?: string;
    status?: string;
    limit?: number;
  } = {}): Promise<ReconciliationRun[]> {
    const { limit = 30 } = options;

    let query = this.db
      .from('reconciliation_runs')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(limit);

    if (options.provider) query = query.eq('provider', options.provider);
    if (options.status) query = query.eq('status', options.status);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get runs: ${error.message}`);
    return (data || []) as ReconciliationRun[];
  }

  /**
   * Get items for a run
   */
  async getRunItems(
    runId: string,
    status?: string
  ): Promise<ReconciliationItem[]> {
    let query = this.db
      .from('reconciliation_items')
      .select('*')
      .eq('run_id', runId)
      .order('created_at', { ascending: true });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get items: ${error.message}`);
    return (data || []) as ReconciliationItem[];
  }

  /**
   * Generate EOD balance summary
   */
  async getEODSummary(date: string): Promise<{
    provider: string;
    currency: string;
    our_balance: number;
    provider_balance: number | null;
    discrepancy: number | null;
    status: string;
  }[]> {
    const { data, error } = await this.db
      .from('reconciliation_runs')
      .select('provider, currency, our_balance, provider_balance, discrepancy, status')
      .eq('run_date', date);

    if (error) throw new Error(`Failed to get EOD summary: ${error.message}`);
    return (data || []) as {
      provider: string;
      currency: string;
      our_balance: number;
      provider_balance: number | null;
      discrepancy: number | null;
      status: string;
    }[];
  }

  // ─── Private Helpers ───

  private async calculateOurBalance(
    provider: string,
    date: string,
    currency: string
  ): Promise<number> {
    // Sum all ledger entries for this provider on this date
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data } = await this.db
      .from('ledger_entries')
      .select('amount, entry_type')
      .eq('currency', currency)
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .like('reference_type', `%${provider}%`);

    if (!data) return 0;

    return data.reduce((sum: number, e: { amount: number; entry_type: string }) => {
      return sum + (e.entry_type === 'credit' ? Number(e.amount) : -Number(e.amount));
    }, 0);
  }

  private async getOurTransactions(
    provider: string,
    date: string,
    currency: string
  ): Promise<{ reference: string; amount: number; date: string }[]> {
    const startOfDay = `${date}T00:00:00.000Z`;
    const endOfDay = `${date}T23:59:59.999Z`;

    const { data } = await this.db
      .from('ledger_entries')
      .select('reference, amount, created_at')
      .eq('currency', currency)
      .eq('entry_type', 'credit')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .not('reference', 'is', null);

    return (data || []).map((e: { reference: string; amount: number; created_at: string }) => ({
      reference: e.reference,
      amount: Number(e.amount),
      date: e.created_at,
    }));
  }
}
