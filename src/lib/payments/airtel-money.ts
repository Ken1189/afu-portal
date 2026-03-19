/**
 * Airtel Money Payment Gateway
 * Supports Tanzania, Zambia, and Kenya via the Airtel Money Africa API.
 * Docs: https://developers.airtel.africa/
 */

import {
  PaymentGateway,
  PaymentProvider,
  PaymentRequest,
  PaymentResult,
  PaymentStatus,
  PaymentGatewayError,
  requireEnv,
  generateTransactionId,
} from './gateway';

const API_BASE_URL = 'https://openapiuat.airtel.africa'; // UAT/sandbox
const PRODUCTION_URL = 'https://openapi.airtel.africa';

interface AirtelTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface AirtelPaymentResponse {
  data: {
    transaction: {
      id: string;
      status: string;
      message?: string;
    };
  };
  status: {
    code: string;
    message: string;
    result_code: string;
    response_code: string;
    success: boolean;
  };
}

interface AirtelStatusResponse {
  data: {
    transaction: {
      airtel_money_id: string;
      id: string;
      message: string;
      status: string;
    };
  };
  status: {
    code: string;
    message: string;
    result_code: string;
    response_code: string;
    success: boolean;
  };
}

interface AirtelRefundResponse {
  data: {
    transaction: {
      airtel_money_id: string;
      status: string;
    };
  };
  status: {
    code: string;
    message: string;
    success: boolean;
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get base URL depending on environment configuration.
 */
function getBaseUrl(): string {
  const env = process.env.AIRTEL_ENVIRONMENT || 'sandbox';
  return env === 'production' ? PRODUCTION_URL : API_BASE_URL;
}

/**
 * Generate OAuth2 access token for Airtel Money API.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = requireEnv('airtel-money', 'AIRTEL_CLIENT_ID');
  const clientSecret = requireEnv('airtel-money', 'AIRTEL_CLIENT_SECRET');
  const baseUrl = getBaseUrl();

  const response = await fetch(`${baseUrl}/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new PaymentGatewayError(
      'airtel-money',
      'AUTH_FAILED',
      `Failed to obtain Airtel Money access token: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as AirtelTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

/**
 * Map currency to Airtel Money country code for the X-Country header.
 */
function currencyToCountryCode(currency: string): string {
  const mapping: Record<string, string> = {
    TZS: 'TZ',
    ZMW: 'ZM',
    KES: 'KE',
    USD: 'US',
  };
  return mapping[currency] || 'KE';
}

/**
 * Map Airtel Money transaction status to our PaymentStatus.
 */
function mapAirtelStatus(status: string): PaymentStatus {
  const normalized = status.toUpperCase().replace(/\s+/g, '_');
  switch (normalized) {
    case 'TS':
    case 'TIP': // Transaction In Progress
      return 'processing';
    case 'TF': // Transaction Failed
      return 'failed';
    case 'TA': // Transaction Ambiguous
      return 'processing';
    case 'SUCCESS':
    case 'SUCCESSFUL':
      return 'completed';
    case 'FAILED':
      return 'failed';
    case 'PENDING':
    case 'IN_PROGRESS':
      return 'processing';
    default:
      return 'pending';
  }
}

export class AirtelMoneyGateway implements PaymentGateway {
  public readonly provider: PaymentProvider = 'airtel-money';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.phoneNumber) {
      throw new PaymentGatewayError(
        'airtel-money',
        'MISSING_PHONE',
        'Phone number is required for Airtel Money payments.'
      );
    }

    const accessToken = await getAccessToken();
    const transactionId = generateTransactionId();
    const baseUrl = getBaseUrl();
    const countryCode = currencyToCountryCode(request.currency);

    // Clean phone number: remove country code prefix if present
    const phone = request.phoneNumber.replace(/^\+?\d{1,3}/, '');

    const payload = {
      reference: transactionId,
      subscriber: {
        country: countryCode,
        currency: request.currency,
        msisdn: request.phoneNumber.replace(/^\+/, ''),
      },
      transaction: {
        amount: request.amount,
        country: countryCode,
        currency: request.currency,
        id: transactionId,
      },
    };

    const response = await fetch(
      `${baseUrl}/merchant/v1/payments/`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Country': countryCode,
          'X-Currency': request.currency,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'airtel-money',
        'PAYMENT_FAILED',
        `Airtel Money payment request failed: ${response.status} — ${errorBody}`
      );
    }

    const data = (await response.json()) as AirtelPaymentResponse;

    if (!data.status.success) {
      throw new PaymentGatewayError(
        'airtel-money',
        'PAYMENT_REJECTED',
        `Airtel Money rejected payment: ${data.status.message} (code: ${data.status.response_code})`
      );
    }

    return {
      id: transactionId,
      status: 'pending',
      provider: 'airtel-money',
      providerReference: data.data.transaction.id || transactionId,
      amount: request.amount,
      currency: request.currency,
      message:
        data.data.transaction.message ||
        'Payment request sent. Please approve the transaction on your phone.',
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatus> {
    const accessToken = await getAccessToken();
    const baseUrl = getBaseUrl();

    // We need a country header; default to KE but this should ideally
    // be stored alongside the transaction reference
    const country = process.env.AIRTEL_DEFAULT_COUNTRY || 'KE';

    const response = await fetch(
      `${baseUrl}/standard/v1/payments/${providerReference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
          'X-Country': country,
          'X-Currency': 'USD', // Required header, actual currency comes from response
        },
      }
    );

    if (!response.ok) {
      throw new PaymentGatewayError(
        'airtel-money',
        'STATUS_CHECK_FAILED',
        `Failed to check Airtel Money transaction status: ${response.status}`
      );
    }

    const data = (await response.json()) as AirtelStatusResponse;
    return mapAirtelStatus(data.data.transaction.status);
  }

  async refund(providerReference: string, amount?: number): Promise<PaymentResult> {
    const accessToken = await getAccessToken();
    const transactionId = generateTransactionId();
    const baseUrl = getBaseUrl();
    const country = process.env.AIRTEL_DEFAULT_COUNTRY || 'KE';

    const payload = {
      transaction: {
        airtel_money_id: providerReference,
      },
    };

    const response = await fetch(`${baseUrl}/standard/v1/payments/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Country': country,
        'X-Currency': 'USD',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'airtel-money',
        'REFUND_FAILED',
        `Airtel Money refund failed: ${response.status} — ${errorBody}`
      );
    }

    const data = (await response.json()) as AirtelRefundResponse;

    if (!data.status.success) {
      throw new PaymentGatewayError(
        'airtel-money',
        'REFUND_REJECTED',
        `Airtel Money refund rejected: ${data.status.message}`
      );
    }

    return {
      id: transactionId,
      status: 'processing',
      provider: 'airtel-money',
      providerReference: data.data.transaction.airtel_money_id || providerReference,
      amount: amount ?? 0,
      currency: 'USD', // Will be overridden by actual response data when available
      message: 'Refund request submitted successfully.',
    };
  }
}
