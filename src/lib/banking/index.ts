/**
 * AFU Banking Infrastructure
 *
 * Service-layer architecture for banking-grade financial operations.
 * All modules are database-agnostic — swap the Supabase adapter
 * for any PostgreSQL client when migrating to a bank partner's CBS.
 *
 * Modules:
 * - LedgerService: Double-entry accounting ledger
 * - WalletService: User wallet accounts with balance management
 * - MonitoringService: Transaction screening, velocity checks, AML hooks
 * - ReconciliationService: Daily recon against payment providers
 */

export { LedgerService } from './ledger';
export { WalletService } from './wallet';
export { MonitoringService } from './monitoring';
export { ReconciliationService } from './reconciliation';

// Re-export types
export type {
  LedgerAccount,
  LedgerEntry,
  LedgerTransactionInput,
  LedgerTransactionResult,
  WalletAccount,
  WalletTransaction,
  CreateWalletInput,
  TransferInput,
  TransactionFlag,
  VelocityRule,
  TransactionContext,
  ReconciliationRun,
  ReconciliationItem,
  LedgerAccountType,
  EntryType,
  AccountStatus,
  FlagType,
  FlagSeverity,
  FlagStatus,
  ReconStatus,
  SupportedCurrency,
} from './types';

export { SUPPORTED_CURRENCIES, SYSTEM_ACCOUNTS } from './types';
