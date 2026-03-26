/**
 * Wallet & Account Service
 *
 * User-facing account management. Every wallet is backed by a ledger account
 * for double-entry compliance. Supports deposits, withdrawals, transfers,
 * balance enquiry, and mini-statement generation.
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { LedgerService } from './ledger';
import type {
  WalletAccount,
  WalletTransaction,
  CreateWalletInput,
  TransferInput,
} from './types';

export class WalletService {
  private ledger: LedgerService;

  constructor(private db: SupabaseClient) {
    this.ledger = new LedgerService(db);
  }

  /**
   * Create a new wallet for a user.
   * Automatically creates backing ledger account.
   */
  async createWallet(input: CreateWalletInput): Promise<WalletAccount> {
    const {
      user_id,
      account_type = 'savings',
      currency = 'USD',
      display_name,
    } = input;

    // Check for existing wallet of same type + currency
    const { data: existing } = await this.db
      .from('wallet_accounts')
      .select('id')
      .eq('user_id', user_id)
      .eq('account_type', account_type)
      .eq('currency', currency)
      .single();

    if (existing) {
      throw new Error(`User already has a ${account_type} wallet in ${currency}`);
    }

    // Create backing ledger account
    const ledgerAccount = await this.ledger.createAccount({
      user_id,
      account_type: 'wallet',
      name: `${display_name || account_type} - ${currency}`,
      currency,
    });

    // Generate account number
    const accountNumber = 'AFU' + Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');

    // Create wallet
    const { data, error } = await this.db
      .from('wallet_accounts')
      .insert({
        user_id,
        ledger_account_id: ledgerAccount.id,
        account_number: accountNumber,
        account_type,
        currency,
        display_name: display_name || null,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create wallet: ${error.message}`);
    return data as WalletAccount;
  }

  /**
   * Get wallet by ID with current balance from ledger
   */
  async getWallet(walletId: string): Promise<WalletAccount | null> {
    const { data, error } = await this.db
      .from('wallet_accounts')
      .select('*, ledger_accounts!inner(balance)')
      .eq('id', walletId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      balance: data.ledger_accounts?.balance || 0,
      ledger_accounts: undefined,
    } as WalletAccount;
  }

  /**
   * Get all wallets for a user
   */
  async getUserWallets(userId: string): Promise<WalletAccount[]> {
    const { data, error } = await this.db
      .from('wallet_accounts')
      .select('*, ledger_accounts!inner(balance)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`Failed to get wallets: ${error.message}`);

    return (data || []).map((w: Record<string, unknown>) => {
      const { ledger_accounts: la, ...rest } = w as Record<string, unknown>;
      return {
        ...rest,
        balance: (la as { balance: number } | null)?.balance || 0,
      } as unknown as WalletAccount;
    });
  }

  /**
   * Deposit funds into a wallet (from external source)
   */
  async deposit(input: {
    wallet_id: string;
    amount: number;
    description?: string;
    reference?: string;
    operator_id?: string;
  }): Promise<WalletTransaction> {
    const wallet = await this.getWallet(input.wallet_id);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.status !== 'active') throw new Error(`Wallet is ${wallet.status}`);

    // Get system settlement account for this currency
    const systemAccount = await this.ledger.getSystemAccount('settlement', wallet.currency);
    if (!systemAccount) throw new Error(`No settlement account for ${wallet.currency}`);

    // Record in ledger: debit settlement (money comes in), credit wallet (balance increases)
    const txn = await this.ledger.recordTransaction({
      debit_account_id: systemAccount.id,
      credit_account_id: wallet.ledger_account_id,
      amount: input.amount,
      currency: wallet.currency,
      description: input.description || 'Deposit',
      reference: input.reference,
      reference_type: 'deposit',
      operator_id: input.operator_id,
    });

    // Record wallet transaction for user view
    return this.recordWalletTransaction({
      wallet_id: wallet.id,
      ledger_entry_id: txn.credit_entry.id,
      type: 'deposit',
      amount: input.amount,
      currency: wallet.currency,
      balance_after: txn.credit_balance_after,
      description: input.description || 'Deposit',
      reference: input.reference,
    });
  }

  /**
   * Withdraw funds from a wallet (to external destination)
   */
  async withdraw(input: {
    wallet_id: string;
    amount: number;
    description?: string;
    reference?: string;
    operator_id?: string;
  }): Promise<WalletTransaction> {
    const wallet = await this.getWallet(input.wallet_id);
    if (!wallet) throw new Error('Wallet not found');
    if (wallet.status !== 'active') throw new Error(`Wallet is ${wallet.status}`);
    if ((wallet.balance || 0) < input.amount) throw new Error('Insufficient funds');

    const systemAccount = await this.ledger.getSystemAccount('settlement', wallet.currency);
    if (!systemAccount) throw new Error(`No settlement account for ${wallet.currency}`);

    // Record in ledger: debit wallet (balance decreases), credit settlement (money goes out)
    const txn = await this.ledger.recordTransaction({
      debit_account_id: wallet.ledger_account_id,
      credit_account_id: systemAccount.id,
      amount: input.amount,
      currency: wallet.currency,
      description: input.description || 'Withdrawal',
      reference: input.reference,
      reference_type: 'withdrawal',
      operator_id: input.operator_id,
    });

    return this.recordWalletTransaction({
      wallet_id: wallet.id,
      ledger_entry_id: txn.debit_entry.id,
      type: 'withdrawal',
      amount: -input.amount,
      currency: wallet.currency,
      balance_after: txn.debit_balance_after,
      description: input.description || 'Withdrawal',
      reference: input.reference,
    });
  }

  /**
   * Transfer between two wallets
   */
  async transfer(input: TransferInput): Promise<{
    from_txn: WalletTransaction;
    to_txn: WalletTransaction;
  }> {
    const fromWallet = await this.getWallet(input.from_wallet_id);
    const toWallet = await this.getWallet(input.to_wallet_id);

    if (!fromWallet) throw new Error('Source wallet not found');
    if (!toWallet) throw new Error('Destination wallet not found');
    if (fromWallet.status !== 'active') throw new Error(`Source wallet is ${fromWallet.status}`);
    if (toWallet.status !== 'active') throw new Error(`Destination wallet is ${toWallet.status}`);
    if (fromWallet.currency !== toWallet.currency) throw new Error('Cross-currency transfers not yet supported');
    if ((fromWallet.balance || 0) < input.amount) throw new Error('Insufficient funds');

    // Record in ledger: debit source, credit destination
    const txn = await this.ledger.recordTransaction({
      debit_account_id: fromWallet.ledger_account_id,
      credit_account_id: toWallet.ledger_account_id,
      amount: input.amount,
      currency: fromWallet.currency,
      description: input.description || 'Transfer',
      reference: input.reference,
      reference_type: 'transfer',
      operator_id: input.operator_id,
    });

    // Record both wallet transactions
    const [from_txn, to_txn] = await Promise.all([
      this.recordWalletTransaction({
        wallet_id: fromWallet.id,
        ledger_entry_id: txn.debit_entry.id,
        type: 'transfer_out',
        amount: -input.amount,
        currency: fromWallet.currency,
        balance_after: txn.debit_balance_after,
        description: input.description || 'Transfer out',
        reference: input.reference,
        counterparty: toWallet.display_name || toWallet.account_number,
      }),
      this.recordWalletTransaction({
        wallet_id: toWallet.id,
        ledger_entry_id: txn.credit_entry.id,
        type: 'transfer_in',
        amount: input.amount,
        currency: toWallet.currency,
        balance_after: txn.credit_balance_after,
        description: input.description || 'Transfer in',
        reference: input.reference,
        counterparty: fromWallet.display_name || fromWallet.account_number,
      }),
    ]);

    return { from_txn, to_txn };
  }

  /**
   * Get transaction history for a wallet (mini-statement)
   */
  async getTransactions(
    walletId: string,
    options: { limit?: number; offset?: number; type?: string } = {}
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const { limit = 20, offset = 0, type } = options;

    let query = this.db
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('wallet_id', walletId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (type) query = query.eq('type', type);

    const { data, error, count } = await query;
    if (error) throw new Error(`Failed to get transactions: ${error.message}`);

    return { transactions: (data || []) as WalletTransaction[], total: count || 0 };
  }

  /**
   * Freeze a wallet
   */
  async freezeWallet(walletId: string, reason: string, frozenBy: string): Promise<void> {
    const { error } = await this.db
      .from('wallet_accounts')
      .update({
        status: 'frozen',
        frozen_reason: reason,
        frozen_by: frozenBy,
        frozen_at: new Date().toISOString(),
      })
      .eq('id', walletId);

    if (error) throw new Error(`Failed to freeze wallet: ${error.message}`);
  }

  /**
   * Unfreeze a wallet
   */
  async unfreezeWallet(walletId: string): Promise<void> {
    const { error } = await this.db
      .from('wallet_accounts')
      .update({
        status: 'active',
        frozen_reason: null,
        frozen_by: null,
        frozen_at: null,
      })
      .eq('id', walletId);

    if (error) throw new Error(`Failed to unfreeze wallet: ${error.message}`);
  }

  /**
   * Get wallet by account number
   */
  async getWalletByNumber(accountNumber: string): Promise<WalletAccount | null> {
    const { data, error } = await this.db
      .from('wallet_accounts')
      .select('*, ledger_accounts!inner(balance)')
      .eq('account_number', accountNumber)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      balance: data.ledger_accounts?.balance || 0,
      ledger_accounts: undefined,
    } as WalletAccount;
  }

  // ─── Private Helpers ───

  private async recordWalletTransaction(input: {
    wallet_id: string;
    ledger_entry_id: string;
    type: string;
    amount: number;
    currency: string;
    balance_after: number;
    description?: string;
    reference?: string;
    counterparty?: string;
  }): Promise<WalletTransaction> {
    const { data, error } = await this.db
      .from('wallet_transactions')
      .insert({
        wallet_id: input.wallet_id,
        ledger_entry_id: input.ledger_entry_id,
        type: input.type,
        amount: input.amount,
        currency: input.currency,
        balance_after: input.balance_after,
        description: input.description || null,
        reference: input.reference || null,
        counterparty: input.counterparty || null,
        status: 'completed',
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to record wallet transaction: ${error.message}`);
    return data as WalletTransaction;
  }
}
