/**
 * AFU Portal Payment Gateway Infrastructure
 *
 * Multi-country payment processing for 9 African countries:
 * Botswana, Zimbabwe, Tanzania, Kenya, South Africa,
 * Nigeria, Zambia, Mozambique, Sierra Leone.
 *
 * Supported providers:
 * - Stripe (card payments, all countries)
 * - M-Pesa (KE, TZ, MZ)
 * - EcoCash via Paynow (ZW)
 * - MTN MoMo (NG, ZM)
 * - Orange Money (BW, SL)
 * - Airtel Money (TZ, ZM, KE)
 */

// Types and interfaces
export type {
  PaymentProvider,
  PaymentStatus,
  PaymentMethod,
  Currency,
  PaymentRequest,
  PaymentResult,
  PaymentGateway,
} from './gateway';

// Error classes and utilities
export {
  PaymentGatewayError,
  MissingConfigError,
  requireEnv,
  generateTransactionId,
} from './gateway';

// Gateway implementations
export { StripeGateway } from './stripe';
export { MpesaGateway } from './mpesa';
export { EcoCashGateway } from './ecocash';
export { MtnMomoGateway } from './mtn-momo';
export { OrangeMoneyGateway } from './orange-money';
export { AirtelMoneyGateway } from './airtel-money';

// Router
export {
  getGateway,
  getAvailableProviders,
  routePayment,
  checkPaymentStatus,
  refundPayment,
} from './router';
export type { AvailableProviders } from './router';

// Webhook verification
export {
  verifyStripeWebhook,
  verifyMpesaCallback,
  parseMpesaCallback,
  verifyPaynowCallback,
  parsePaynowCallback,
} from './webhooks';
