// Banking infrastructure types
// Service-layer architecture — database-agnostic for portability

export type LedgerAccountType =
  | 'wallet' | 'escrow' | 'revenue' | 'loan_book'
  | 'insurance_pool' | 'trust' | 'settlement' | 'fees' | 'suspense';

export type EntryType = 'debit' | 'credit';

export type AccountStatus = 'active' | 'frozen' | 'closed' | 'pending';

export type FlagType =
  | 'velocity' | 'amount_threshold' | 'cross_border'
  | 'unusual_pattern' | 'manual_flag' | 'sanctions_hit';

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FlagStatus = 'pending' | 'investigating' | 'cleared' | 'escalated' | 'reported';

export type ReconStatus = 'matched' | 'discrepancy' | 'pending' | 'resolved';

// ─── Ledger ───

export interface LedgerAccount {
  id: string;
  user_id: string | null;
  account_type: LedgerAccountType;
  name: string;
  currency: string;
  balance: number;
  status: AccountStatus;
  is_system: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  transaction_id: string;
  account_id: string;
  contra_account_id: string;
  entry_type: EntryType;
  amount: number;
  currency: string;
  balance_after: number;
  description: string | null;
  reference: string | null;
  reference_type: string | null;
  operator_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LedgerTransactionInput {
  debit_account_id: string;
  credit_account_id: string;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  reference_type?: string;
  operator_id?: string;
  metadata?: Record<string, unknown>;
}

export interface LedgerTransactionResult {
  transaction_id: string;
  debit_entry: LedgerEntry;
  credit_entry: LedgerEntry;
  debit_balance_after: number;
  credit_balance_after: number;
}

// ─── Wallet ───

export interface WalletAccount {
  id: string;
  user_id: string;
  ledger_account_id: string;
  account_number: string;
  account_type: string;
  currency: string;
  display_name: string | null;
  status: AccountStatus;
  frozen_reason: string | null;
  frozen_by: string | null;
  frozen_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined from ledger
  balance?: number;
}

export interface WalletTransaction {
  id: string;
  wallet_id: string;
  ledger_entry_id: string | null;
  type: string;
  amount: number;
  currency: string;
  balance_after: number;
  description: string | null;
  reference: string | null;
  counterparty: string | null;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface CreateWalletInput {
  user_id: string;
  account_type?: string;
  currency?: string;
  display_name?: string;
}

export interface TransferInput {
  from_wallet_id: string;
  to_wallet_id: string;
  amount: number;
  description?: string;
  reference?: string;
  operator_id?: string;
}

// ─── Transaction Monitoring ───

export interface TransactionFlag {
  id: string;
  transaction_id: string | null;
  wallet_txn_id: string | null;
  user_id: string | null;
  flag_type: FlagType;
  severity: FlagSeverity;
  details: Record<string, unknown>;
  status: FlagStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  escalated_to: string | null;
  sar_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface VelocityRule {
  id: string;
  name: string;
  description: string | null;
  country_code: string | null;
  currency: string | null;
  max_count: number | null;
  max_amount: number | null;
  window_minutes: number;
  flag_type: FlagType;
  severity: FlagSeverity;
  is_active: boolean;
}

export interface TransactionContext {
  user_id: string;
  amount: number;
  currency: string;
  country_code?: string;
  ip_address?: string;
  device_fingerprint?: string;
  geolocation?: string;
  transaction_type?: string;
}

// ─── Reconciliation ───

export interface ReconciliationRun {
  id: string;
  run_date: string;
  provider: string;
  currency: string;
  our_balance: number;
  provider_balance: number | null;
  discrepancy: number | null;
  total_matched: number;
  total_unmatched: number;
  status: ReconStatus;
  notes: string | null;
  run_by: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ReconciliationItem {
  id: string;
  run_id: string;
  our_reference: string | null;
  our_amount: number | null;
  our_date: string | null;
  provider_reference: string | null;
  provider_amount: number | null;
  provider_date: string | null;
  status: ReconStatus;
  discrepancy_amount: number | null;
  discrepancy_reason: string | null;
  resolved_by: string | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

// ─── Supported Currencies ───

export const SUPPORTED_CURRENCIES = [
  'USD', 'ZAR', 'KES', 'BWP', 'UGX', 'TZS', 'ZWL', 'GHS',
  'NGN', 'RWF', 'MZN', 'ZMW', 'MWK', 'NAD', 'SLL', 'GNF',
  'XOF', 'LRD', 'EGP', 'ETB',
] as const;

export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// System account IDs by currency
export const SYSTEM_ACCOUNTS: Record<string, Record<string, string>> = {
  USD: {
    revenue: '00000000-0000-0000-0000-000000000001',
    escrow: '00000000-0000-0000-0000-000000000002',
    loan_book: '00000000-0000-0000-0000-000000000003',
    insurance_pool: '00000000-0000-0000-0000-000000000004',
    trust: '00000000-0000-0000-0000-000000000005',
    settlement: '00000000-0000-0000-0000-000000000006',
    fees: '00000000-0000-0000-0000-000000000007',
    suspense: '00000000-0000-0000-0000-000000000008',
  },
  ZAR: {
    revenue: '00000000-0000-0000-0000-000000000011',
    escrow: '00000000-0000-0000-0000-000000000012',
    loan_book: '00000000-0000-0000-0000-000000000013',
  },
  KES: {
    revenue: '00000000-0000-0000-0000-000000000021',
    escrow: '00000000-0000-0000-0000-000000000022',
    loan_book: '00000000-0000-0000-0000-000000000023',
  },
  BWP: {
    revenue: '00000000-0000-0000-0000-000000000031',
    escrow: '00000000-0000-0000-0000-000000000032',
  },
};
