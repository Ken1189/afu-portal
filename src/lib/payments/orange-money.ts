/**
 * Orange Money Payment Gateway
 * Supports Botswana and Sierra Leone.
 * Uses Orange Money merchant payment API.
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

const API_BASE_URL = 'https://api.orange.com/orange-money-webpay/dev/v1';

interface OrangeTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}

interface OrangePaymentResponse {
  status: number;
  message: string;
  pay_token: string;
  payment_url: string;
  notif_token: string;
}

interface OrangeTransactionStatus {
  status: string;
  order_id: string;
  txnid: string;
  amount: string;
  message?: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get OAuth2 access token from Orange API.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const merchantKey = requireEnv('orange-money', 'ORANGE_MONEY_MERCHANT_KEY');
  const clientId = process.env.ORANGE_MONEY_CLIENT_ID || '';
  const clientSecret = process.env.ORANGE_MONEY_CLIENT_SECRET || '';

  // Orange uses client credentials grant
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch('https://api.orange.com/oauth/v3/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new PaymentGatewayError(
      'orange-money',
      'AUTH_FAILED',
      `Failed to obtain Orange Money access token: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as OrangeTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

/**
 * Map Orange Money status to our PaymentStatus.
 */
function mapOrangeStatus(status: string): PaymentStatus {
  const normalized = status.toUpperCase();
  switch (normalized) {
    case 'SUCCESS':
    case 'SUCCESSFULL':
      return 'completed';
    case 'FAILED':
    case 'REFUSED':
      return 'failed';
    case 'PENDING':
    case 'INITIATED':
      return 'pending';
    case 'EXPIRED':
      return 'expired';
    case 'CANCELLED':
      return 'failed';
    default:
      return 'processing';
  }
}

export class OrangeMoneyGateway implements PaymentGateway {
  public readonly provider: PaymentProvider = 'orange-money';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    const merchantKey = requireEnv('orange-money', 'ORANGE_MONEY_MERCHANT_KEY');
    const accessToken = await getAccessToken();
    const transactionId = generateTransactionId();

    const notifUrl = process.env.ORANGE_MONEY_NOTIFY_URL || 'https://localhost/payments/orange/notify';
    const returnUrl = request.returnUrl || process.env.ORANGE_MONEY_RETURN_URL || 'https://localhost/payments/orange/return';
    const cancelUrl = process.env.ORANGE_MONEY_CANCEL_URL || returnUrl;

    // Map our currency to Orange Money's country code
    const currencyToCountry: Record<string, string> = {
      BWP: 'BW',
      SLE: 'SL',
      USD: 'US',
    };

    const payload = {
      merchant_key: merchantKey,
      currency: request.currency,
      order_id: transactionId,
      amount: request.amount,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notif_url: notifUrl,
      lang: 'en',
      reference: request.description.substring(0, 100),
      metadata: JSON.stringify({
        memberId: request.memberId,
        ...request.metadata,
      }),
    };

    const response = await fetch(`${API_BASE_URL}/webpayment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'orange-money',
        'INITIATE_FAILED',
        `Orange Money payment initiation failed: ${response.status} — ${errorBody}`
      );
    }

    const data = (await response.json()) as OrangePaymentResponse;

    if (data.status !== 201 && data.status !== 200) {
      throw new PaymentGatewayError(
        'orange-money',
        'PAYMENT_REJECTED',
        `Orange Money rejected payment: ${data.message || 'Unknown error'}`
      );
    }

    return {
      id: transactionId,
      status: 'pending',
      provider: 'orange-money',
      providerReference: data.pay_token,
      amount: request.amount,
      currency: request.currency,
      redirectUrl: data.payment_url || undefined,
      message: 'Payment initiated. Complete payment via the redirect URL or on your phone.',
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatus> {
    const accessToken = await getAccessToken();

    const response = await fetch(
      `${API_BASE_URL}/transactionstatus?pay_token=${encodeURIComponent(providerReference)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new PaymentGatewayError(
        'orange-money',
        'STATUS_CHECK_FAILED',
        `Failed to check Orange Money transaction status: ${response.status}`
      );
    }

    const data = (await response.json()) as OrangeTransactionStatus;
    return mapOrangeStatus(data.status);
  }

  async refund(providerReference: string, amount?: number): Promise<PaymentResult> {
    // Orange Money web payment API does not provide a direct refund endpoint.
    // Refunds are typically handled through merchant-to-customer transfers
    // or through the Orange Money merchant portal.
    throw new PaymentGatewayError(
      'orange-money',
      'REFUND_NOT_SUPPORTED',
      'Orange Money web payment API does not support programmatic refunds. ' +
        'Please process refunds through the Orange Money merchant portal or ' +
        'via a manual transfer. ' +
        `Transaction pay_token: ${providerReference}, amount: ${amount ?? 'full'}`
    );
  }
}
