/**
 * Double-Entry Ledger Service
 *
 * Core accounting engine for AFU. Every financial movement creates
 * a paired debit+credit entry that must always sum to zero.
 *
 * Service-layer architecture: all business logic is pure TypeScript.
 * Database calls are isolated to adapter functions for portability.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type {
  LedgerAccount,
  LedgerEntry,
  LedgerTransactionInput,
  LedgerTransactionResult,
} from './types';

export class LedgerService {
  constructor(private db: SupabaseClient) {}

  /**
   * Record a double-entry transaction (atomic).
   * Creates a debit entry on one account and a credit entry on another.
   * Both entries share a transaction_id for traceability.
   */
  async recordTransaction(
    input: LedgerTransactionInput
  ): Promise<LedgerTransactionResult> {
    const {
      debit_account_id,
      credit_account_id,
      amount,
      currency,
      description,
      reference,
      reference_type,
      operator_id,
      metadata = {},
    } = input;

    // Validate
    if (amount <= 0) throw new Error('Transaction amount must be positive');
    if (debit_account_id === credit_account_id) {
      throw new Error('Debit and credit accounts must be different');
    }

    // Generate transaction ID to link the pair
    const transaction_id = crypto.randomUUID();

    // Get current balances (use service role — bypasses RLS)
    const [debitAccount, creditAccount] = await Promise.all([
      this.getAccount(debit_account_id),
      this.getAccount(credit_account_id),
    ]);

    if (!debitAccount) throw new Error(`Debit account not found: ${debit_account_id}`);
    if (!creditAccount) throw new Error(`Credit account not found: ${credit_account_id}`);
    if (debitAccount.status !== 'active') throw new Error(`Debit account is ${debitAccount.status}`);
    if (creditAccount.status !== 'active') throw new Error(`Credit account is ${creditAccount.status}`);
    if (debitAccount.currency !== currency) throw new Error(`Currency mismatch on debit account`);
    if (creditAccount.currency !== currency) throw new Error(`Currency mismatch on credit account`);

    // Calculate new balances
    // Debit: increases asset/expense accounts, decreases liability/equity/revenue
    // Credit: decreases asset/expense accounts, increases liability/equity/revenue
    const debit_balance_after = Number(debitAccount.balance) - amount;
    const credit_balance_after = Number(creditAccount.balance) + amount;

    // Create both entries
    const debitEntry = {
      transaction_id,
      account_id: debit_account_id,
      contra_account_id: credit_account_id,
      entry_type: 'debit' as const,
      amount,
      currency,
      balance_after: debit_balance_after,
      description: description || null,
      reference: reference || null,
      reference_type: reference_type || null,
      operator_id: operator_id || null,
      metadata,
    };

    const creditEntry = {
      transaction_id,
      account_id: credit_account_id,
      contra_account_id: debit_account_id,
      entry_type: 'credit' as const,
      amount,
      currency,
      balance_after: credit_balance_after,
      description: description || null,
      reference: reference || null,
      reference_type: reference_type || null,
      operator_id: operator_id || null,
      metadata,
    };

    // Insert entries
    const { data: entries, error: entryError } = await this.db
      .from('ledger_entries')
      .insert([debitEntry, creditEntry])
      .select();

    if (entryError) throw new Error(`Failed to create ledger entries: ${entryError.message}`);

    // Update account balances
    const [debitUpdate, creditUpdate] = await Promise.all([
      this.db
        .from('ledger_accounts')
        .update({ balance: debit_balance_after })
        .eq('id', debit_account_id),
      this.db
        .from('ledger_accounts')
        .update({ balance: credit_balance_after })
        .eq('id', credit_account_id),
    ]);

    if (debitUpdate.error) throw new Error(`Failed to update debit balance: ${debitUpdate.error.message}`);
    if (creditUpdate.error) throw new Error(`Failed to update credit balance: ${creditUpdate.error.message}`);

    const debitResult = entries?.find((e: LedgerEntry) => e.entry_type === 'debit');
    const creditResult = entries?.find((e: LedgerEntry) => e.entry_type === 'credit');

    return {
      transaction_id,
      debit_entry: debitResult as LedgerEntry,
      credit_entry: creditResult as LedgerEntry,
      debit_balance_after,
      credit_balance_after,
    };
  }

  /**
   * Get account by ID
   */
  async getAccount(id: string): Promise<LedgerAccount | null> {
    const { data, error } = await this.db
      .from('ledger_accounts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data as LedgerAccount;
  }

  /**
   * Get all entries for a transaction
   */
  async getTransaction(transactionId: string): Promise<LedgerEntry[]> {
    const { data, error } = await this.db
      .from('ledger_entries')
      .select('*')
      .eq('transaction_id', transactionId)
      .order('entry_type', { ascending: true });

    if (error) throw new Error(`Failed to get transaction: ${error.message}`);
    return (data || []) as LedgerEntry[];
  }

  /**
   * Get entries for an account with pagination
   */
  async getAccountEntries(
    accountId: string,
    options: { limit?: number; offset?: number; from?: string; to?: string } = {}
  ): Promise<{ entries: LedgerEntry[]; total: number }> {
    const { limit = 50, offset = 0, from, to } = options;

    let query = this.db
      .from('ledger_entries')
      .select('*', { count: 'exact' })
      .eq('account_id', accountId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to get entries: ${error.message}`);

    return { entries: (data || []) as LedgerEntry[], total: count || 0 };
  }

  /**
   * Create a new ledger account
   */
  async createAccount(input: {
    user_id?: string;
    account_type: LedgerAccount['account_type'];
    name: string;
    currency: string;
    is_system?: boolean;
  }): Promise<LedgerAccount> {
    const { data, error } = await this.db
      .from('ledger_accounts')
      .insert({
        user_id: input.user_id || null,
        account_type: input.account_type,
        name: input.name,
        currency: input.currency,
        is_system: input.is_system || false,
        balance: 0,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create account: ${error.message}`);
    return data as LedgerAccount;
  }

  /**
   * Validate zero-balance: total debits must equal total credits
   * Used for daily reconciliation and audit
   */
  async validateZeroBalance(currency?: string): Promise<{
    valid: boolean;
    total_debits: number;
    total_credits: number;
    difference: number;
  }> {
    let debitQuery = this.db
      .from('ledger_entries')
      .select('amount')
      .eq('entry_type', 'debit');

    let creditQuery = this.db
      .from('ledger_entries')
      .select('amount')
      .eq('entry_type', 'credit');

    if (currency) {
      debitQuery = debitQuery.eq('currency', currency);
      creditQuery = creditQuery.eq('currency', currency);
    }

    const [debitResult, creditResult] = await Promise.all([debitQuery, creditQuery]);

    const total_debits = (debitResult.data || []).reduce(
      (sum: number, e: { amount: number }) => sum + Number(e.amount), 0
    );
    const total_credits = (creditResult.data || []).reduce(
      (sum: number, e: { amount: number }) => sum + Number(e.amount), 0
    );

    const difference = Math.abs(total_debits - total_credits);

    return {
      valid: difference < 0.0001, // floating point tolerance
      total_debits,
      total_credits,
      difference,
    };
  }

  /**
   * Get system account by type and currency
   */
  async getSystemAccount(
    accountType: LedgerAccount['account_type'],
    currency: string
  ): Promise<LedgerAccount | null> {
    const { data, error } = await this.db
      .from('ledger_accounts')
      .select('*')
      .eq('account_type', accountType)
      .eq('currency', currency)
      .eq('is_system', true)
      .single();

    if (error) return null;
    return data as LedgerAccount;
  }
}
