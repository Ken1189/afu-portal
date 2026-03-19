/**
 * Payment Gateway Infrastructure for AFU Portal
 * Abstract interfaces and types for multi-country payment processing
 * Serving 9 African countries: BW, ZW, TZ, KE, ZA, NG, ZM, MZ, SL
 */

export type PaymentProvider =
  | 'stripe'
  | 'mpesa'
  | 'ecocash'
  | 'orange-money'
  | 'mtn-momo'
  | 'airtel-money'
  | 'bank-transfer';

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'reversed'
  | 'expired';

export type PaymentMethod = 'card' | 'mobile-money' | 'bank-transfer' | 'ussd';

export type Currency =
  | 'USD'
  | 'BWP'
  | 'ZWG'
  | 'TZS'
  | 'KES'
  | 'ZAR'
  | 'NGN'
  | 'ZMW'
  | 'MZN'
  | 'SLE';

export interface PaymentRequest {
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  provider: PaymentProvider;
  memberId: string;
  description: string;
  metadata?: Record<string, string>;
  /** Mobile money specific — subscriber phone number */
  phoneNumber?: string;
  /** Card specific — URL to redirect after payment */
  returnUrl?: string;
  /** Bank transfer specific — bank code */
  bankCode?: string;
  /** Bank transfer specific — account number */
  accountNumber?: string;
}

export interface PaymentResult {
  id: string;
  status: PaymentStatus;
  provider: PaymentProvider;
  providerReference: string;
  amount: number;
  currency: Currency;
  /** For redirects (Stripe checkout, some mobile money flows) */
  redirectUrl?: string;
  /** For USSD-based payment initiation */
  ussdCode?: string;
  /** Human-readable message (e.g. "Check your phone for STK push") */
  message?: string;
}

export interface PaymentGateway {
  provider: PaymentProvider;

  /**
   * Initiate a payment. Returns a PaymentResult which may include
   * a redirect URL, USSD code, or message depending on the provider.
   */
  initiate(request: PaymentRequest): Promise<PaymentResult>;

  /**
   * Check the current status of a previously initiated payment.
   */
  checkStatus(providerReference: string): Promise<PaymentStatus>;

  /**
   * Refund a completed payment. If amount is omitted, a full refund
   * is issued. Returns a PaymentResult for the refund transaction.
   */
  refund(providerReference: string, amount?: number): Promise<PaymentResult>;
}

/**
 * Base error class for payment gateway errors.
 */
export class PaymentGatewayError extends Error {
  public readonly provider: PaymentProvider;
  public readonly code: string;

  constructor(provider: PaymentProvider, code: string, message: string) {
    super(`[${provider}] ${message}`);
    this.name = 'PaymentGatewayError';
    this.provider = provider;
    this.code = code;
  }
}

/**
 * Thrown when a required environment variable is missing.
 */
export class MissingConfigError extends PaymentGatewayError {
  constructor(provider: PaymentProvider, envVar: string) {
    super(
      provider,
      'MISSING_CONFIG',
      `Required environment variable ${envVar} is not set. ` +
        `Please configure it before using the ${provider} gateway.`
    );
    this.name = 'MissingConfigError';
  }
}

/**
 * Utility to require an environment variable or throw a descriptive error.
 */
export function requireEnv(provider: PaymentProvider, envVar: string): string {
  const value = process.env[envVar];
  if (!value) {
    throw new MissingConfigError(provider, envVar);
  }
  return value;
}

/**
 * Generate a unique transaction reference for internal tracking.
 */
export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `afu_${timestamp}_${random}`;
}
