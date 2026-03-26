/**
 * Payment Router
 * Smart routing of payments by country and payment method.
 * Maps each of the 20 AFU countries to their available payment providers.
 */

import {
  PaymentGateway,
  PaymentMethod,
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentGatewayError,
} from './gateway';
import { StripeGateway } from './stripe';
import { MpesaGateway } from './mpesa';
import { EcoCashGateway } from './ecocash';
import { MtnMomoGateway } from './mtn-momo';
import { OrangeMoneyGateway } from './orange-money';
import { AirtelMoneyGateway } from './airtel-money';

/**
 * Country-level payment provider configuration.
 */
interface CountryPaymentConfig {
  mobileMoney: PaymentProvider[];
  bankTransfer: boolean;
  card: boolean;
}

/**
 * Payment providers available per country.
 * BW = Botswana, ZW = Zimbabwe, TZ = Tanzania, KE = Kenya,
 * ZA = South Africa, NG = Nigeria, ZM = Zambia, MZ = Mozambique, SL = Sierra Leone, UG = Uganda
 */
const COUNTRY_PROVIDERS: Record<string, CountryPaymentConfig> = {
  BW: { mobileMoney: ['orange-money'], bankTransfer: true, card: true },
  ZW: { mobileMoney: ['ecocash'], bankTransfer: true, card: true },
  TZ: { mobileMoney: ['mpesa', 'airtel-money'], bankTransfer: true, card: true },
  KE: { mobileMoney: ['mpesa', 'airtel-money'], bankTransfer: true, card: true },
  ZA: { mobileMoney: [], bankTransfer: true, card: true },
  NG: { mobileMoney: ['mtn-momo'], bankTransfer: true, card: true },
  ZM: { mobileMoney: ['mtn-momo', 'airtel-money'], bankTransfer: true, card: true },
  MZ: { mobileMoney: ['mpesa'], bankTransfer: true, card: true },
  SL: { mobileMoney: ['orange-money'], bankTransfer: true, card: true },
  UG: { mobileMoney: ['mtn-momo', 'airtel-money'], bankTransfer: true, card: true },
  // Expansion countries (planned)
  GH: { mobileMoney: ['mtn-momo'], bankTransfer: true, card: true },
  EG: { mobileMoney: [], bankTransfer: true, card: true },
  ET: { mobileMoney: [], bankTransfer: true, card: true },
  MW: { mobileMoney: ['airtel-money'], bankTransfer: true, card: true },
  NA: { mobileMoney: [], bankTransfer: true, card: true },
  GN: { mobileMoney: ['orange-money', 'mtn-momo'], bankTransfer: true, card: true },
  GW: { mobileMoney: ['orange-money'], bankTransfer: true, card: true },
  LR: { mobileMoney: ['orange-money', 'mtn-momo'], bankTransfer: true, card: true },
  ML: { mobileMoney: ['orange-money'], bankTransfer: true, card: true },
  CI: { mobileMoney: ['orange-money', 'mtn-momo'], bankTransfer: true, card: true },
};

/**
 * Singleton gateway instances, created lazily.
 */
const gatewayInstances = new Map<PaymentProvider, PaymentGateway>();

/**
 * Get or create a PaymentGateway instance for the given provider.
 */
export function getGateway(provider: PaymentProvider): PaymentGateway {
  const existing = gatewayInstances.get(provider);
  if (existing) return existing;

  let gateway: PaymentGateway;

  switch (provider) {
    case 'stripe':
      gateway = new StripeGateway();
      break;
    case 'mpesa':
      gateway = new MpesaGateway();
      break;
    case 'ecocash':
      gateway = new EcoCashGateway();
      break;
    case 'mtn-momo':
      gateway = new MtnMomoGateway();
      break;
    case 'orange-money':
      gateway = new OrangeMoneyGateway();
      break;
    case 'airtel-money':
      gateway = new AirtelMoneyGateway();
      break;
    case 'bank-transfer':
      throw new PaymentGatewayError(
        'bank-transfer',
        'NOT_IMPLEMENTED',
        'Bank transfer gateway is not yet implemented. ' +
          'Bank transfers are currently handled manually.'
      );
    default:
      throw new PaymentGatewayError(
        provider,
        'UNKNOWN_PROVIDER',
        `Unknown payment provider: ${provider}`
      );
  }

  gatewayInstances.set(provider, gateway);
  return gateway;
}

/**
 * Available payment methods and providers for a given country.
 */
export interface AvailableProviders {
  countryCode: string;
  card: boolean;
  bankTransfer: boolean;
  mobileMoney: PaymentProvider[];
  allProviders: PaymentProvider[];
}

/**
 * Get available payment providers for a country.
 * Throws if the country is not supported.
 */
export function getAvailableProviders(countryCode: string): AvailableProviders {
  const normalized = countryCode.toUpperCase();
  const config = COUNTRY_PROVIDERS[normalized];

  if (!config) {
    throw new PaymentGatewayError(
      'stripe', // Placeholder; not provider-specific
      'UNSUPPORTED_COUNTRY',
      `Country "${countryCode}" is not supported. ` +
        `Supported countries: ${Object.keys(COUNTRY_PROVIDERS).join(', ')}`
    );
  }

  const allProviders: PaymentProvider[] = [...config.mobileMoney];
  if (config.card) allProviders.push('stripe');
  if (config.bankTransfer) allProviders.push('bank-transfer');

  return {
    countryCode: normalized,
    card: config.card,
    bankTransfer: config.bankTransfer,
    mobileMoney: config.mobileMoney,
    allProviders,
  };
}

/**
 * Route a payment to the appropriate gateway based on country and method.
 *
 * If request.provider is specified, it will be used directly (after validation).
 * Otherwise, the router picks the first available provider for the given method.
 */
export async function routePayment(
  countryCode: string,
  method: PaymentMethod,
  request: PaymentRequest
): Promise<PaymentResult> {
  const available = getAvailableProviders(countryCode);

  // Determine which provider to use
  let provider: PaymentProvider;

  if (request.provider && request.provider !== 'bank-transfer') {
    // Validate that the requested provider is available in this country
    if (!available.allProviders.includes(request.provider)) {
      throw new PaymentGatewayError(
        request.provider,
        'PROVIDER_UNAVAILABLE',
        `Provider "${request.provider}" is not available in ${countryCode}. ` +
          `Available providers: ${available.allProviders.join(', ')}`
      );
    }
    provider = request.provider;
  } else {
    // Auto-select provider based on method
    switch (method) {
      case 'card':
        if (!available.card) {
          throw new PaymentGatewayError(
            'stripe',
            'METHOD_UNAVAILABLE',
            `Card payments are not available in ${countryCode}.`
          );
        }
        provider = 'stripe';
        break;

      case 'mobile-money':
        if (available.mobileMoney.length === 0) {
          throw new PaymentGatewayError(
            'stripe',
            'METHOD_UNAVAILABLE',
            `Mobile money is not available in ${countryCode}. ` +
              'Consider using card or bank transfer instead.'
          );
        }
        // Pick the first (preferred) mobile money provider
        provider = available.mobileMoney[0];
        break;

      case 'bank-transfer':
        if (!available.bankTransfer) {
          throw new PaymentGatewayError(
            'bank-transfer',
            'METHOD_UNAVAILABLE',
            `Bank transfers are not available in ${countryCode}.`
          );
        }
        provider = 'bank-transfer';
        break;

      case 'ussd':
        // USSD typically routes through mobile money providers
        if (available.mobileMoney.length === 0) {
          throw new PaymentGatewayError(
            'stripe',
            'METHOD_UNAVAILABLE',
            `USSD payments are not available in ${countryCode}.`
          );
        }
        provider = available.mobileMoney[0];
        break;

      default:
        throw new PaymentGatewayError(
          'stripe',
          'INVALID_METHOD',
          `Unknown payment method: ${method}`
        );
    }
  }

  // Get the gateway and initiate payment
  const gateway = getGateway(provider);

  // Ensure the request has the correct provider set
  const routedRequest: PaymentRequest = {
    ...request,
    provider,
  };

  return gateway.initiate(routedRequest);
}

/**
 * Check the status of a payment by provider and reference.
 */
export async function checkPaymentStatus(
  provider: PaymentProvider,
  providerReference: string
): Promise<import('./gateway').PaymentStatus> {
  const gateway = getGateway(provider);
  return gateway.checkStatus(providerReference);
}

/**
 * Refund a payment by provider and reference.
 */
export async function refundPayment(
  provider: PaymentProvider,
  providerReference: string,
  amount?: number
): Promise<PaymentResult> {
  const gateway = getGateway(provider);
  return gateway.refund(providerReference, amount);
}
