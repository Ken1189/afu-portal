/**
 * MTN Mobile Money (MoMo) Gateway
 * Supports Nigeria and Zambia via the MTN MoMo Collection API.
 * Sandbox: https://momodeveloper.mtn.com/
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

const SANDBOX_BASE_URL = 'https://sandbox.momodeveloper.mtn.com';

interface MoMoTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface MoMoTransactionStatus {
  amount: string;
  currency: string;
  financialTransactionId: string;
  externalId: string;
  payer: {
    partyIdType: string;
    partyId: string;
  };
  status: 'SUCCESSFUL' | 'FAILED' | 'PENDING';
  reason?: {
    code: string;
    message: string;
  };
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generate OAuth2 access token for MTN MoMo API.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const apiKey = requireEnv('mtn-momo', 'MTN_MOMO_API_KEY');
  const apiSecret = requireEnv('mtn-momo', 'MTN_MOMO_API_SECRET');
  const subscriptionKey = requireEnv('mtn-momo', 'MTN_MOMO_SUBSCRIPTION_KEY');

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

  const response = await fetch(
    `${SANDBOX_BASE_URL}/collection/token/`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
    }
  );

  if (!response.ok) {
    throw new PaymentGatewayError(
      'mtn-momo',
      'AUTH_FAILED',
      `Failed to obtain MTN MoMo access token: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as MoMoTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

/**
 * Get the target environment (sandbox or production).
 */
function getEnvironment(): string {
  return process.env.MTN_MOMO_ENVIRONMENT || 'sandbox';
}

/**
 * Map MTN MoMo status to our PaymentStatus.
 */
function mapMoMoStatus(momoStatus: string): PaymentStatus {
  switch (momoStatus) {
    case 'SUCCESSFUL':
      return 'completed';
    case 'FAILED':
      return 'failed';
    case 'PENDING':
      return 'processing';
    default:
      return 'pending';
  }
}

/**
 * Generate a UUID v4 for MTN MoMo reference IDs.
 */
function generateUUID(): string {
  const { randomUUID } = require('crypto') as typeof import('crypto');
  return randomUUID();
}

export class MtnMomoGateway implements PaymentGateway {
  public readonly provider: PaymentProvider = 'mtn-momo';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.phoneNumber) {
      throw new PaymentGatewayError(
        'mtn-momo',
        'MISSING_PHONE',
        'Phone number is required for MTN MoMo payments.'
      );
    }

    const subscriptionKey = requireEnv('mtn-momo', 'MTN_MOMO_SUBSCRIPTION_KEY');
    const accessToken = await getAccessToken();
    const transactionId = generateTransactionId();
    const referenceId = generateUUID();
    const environment = getEnvironment();
    const callbackUrl = process.env.MTN_MOMO_CALLBACK_URL || '';

    const payload = {
      amount: request.amount.toString(),
      currency: request.currency,
      externalId: transactionId,
      payer: {
        partyIdType: 'MSISDN',
        partyId: request.phoneNumber.replace(/^\+/, ''),
      },
      payerMessage: request.description.substring(0, 160),
      payeeNote: `AFU Portal payment: ${transactionId}`,
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'X-Reference-Id': referenceId,
      'X-Target-Environment': environment,
      'Ocp-Apim-Subscription-Key': subscriptionKey,
      'Content-Type': 'application/json',
    };

    if (callbackUrl) {
      headers['X-Callback-Url'] = callbackUrl;
    }

    const response = await fetch(
      `${SANDBOX_BASE_URL}/collection/v1_0/requesttopay`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }
    );

    // MTN MoMo returns 202 Accepted for successful request
    if (response.status !== 202 && !response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'mtn-momo',
        'REQUEST_FAILED',
        `MTN MoMo request-to-pay failed: ${response.status} — ${errorBody}`
      );
    }

    return {
      id: transactionId,
      status: 'pending',
      provider: 'mtn-momo',
      providerReference: referenceId,
      amount: request.amount,
      currency: request.currency,
      message: 'Payment request sent. Please approve the transaction on your phone.',
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatus> {
    const subscriptionKey = requireEnv('mtn-momo', 'MTN_MOMO_SUBSCRIPTION_KEY');
    const accessToken = await getAccessToken();
    const environment = getEnvironment();

    const response = await fetch(
      `${SANDBOX_BASE_URL}/collection/v1_0/requesttopay/${providerReference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Target-Environment': environment,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
        },
      }
    );

    if (!response.ok) {
      throw new PaymentGatewayError(
        'mtn-momo',
        'STATUS_CHECK_FAILED',
        `Failed to check MTN MoMo transaction status: ${response.status}`
      );
    }

    const data = (await response.json()) as MoMoTransactionStatus;
    return mapMoMoStatus(data.status);
  }

  async refund(providerReference: string, amount?: number): Promise<PaymentResult> {
    const subscriptionKey = requireEnv('mtn-momo', 'MTN_MOMO_SUBSCRIPTION_KEY');
    const accessToken = await getAccessToken();
    const environment = getEnvironment();
    const transactionId = generateTransactionId();
    const refundReferenceId = generateUUID();

    // First, get the original transaction details
    const statusResponse = await fetch(
      `${SANDBOX_BASE_URL}/collection/v1_0/requesttopay/${providerReference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Target-Environment': environment,
          'Ocp-Apim-Subscription-Key': subscriptionKey,
        },
      }
    );

    if (!statusResponse.ok) {
      throw new PaymentGatewayError(
        'mtn-momo',
        'REFUND_LOOKUP_FAILED',
        `Could not retrieve original transaction for refund: ${statusResponse.status}`
      );
    }

    const originalTx = (await statusResponse.json()) as MoMoTransactionStatus;

    if (originalTx.status !== 'SUCCESSFUL') {
      throw new PaymentGatewayError(
        'mtn-momo',
        'REFUND_INVALID_STATE',
        `Cannot refund transaction in "${originalTx.status}" state. Only SUCCESSFUL transactions can be refunded.`
      );
    }

    const refundAmount = amount ?? parseFloat(originalTx.amount);

    // Use the Disbursement API for refunds (transfer back to payer)
    // Note: Disbursement requires a separate subscription key in production
    const disbursementKey = process.env.MTN_MOMO_DISBURSEMENT_KEY || subscriptionKey;

    const payload = {
      amount: refundAmount.toString(),
      currency: originalTx.currency,
      externalId: transactionId,
      payee: {
        partyIdType: originalTx.payer.partyIdType,
        partyId: originalTx.payer.partyId,
      },
      payerMessage: `Refund for ${providerReference}`,
      payeeNote: `AFU Portal refund: ${transactionId}`,
    };

    const response = await fetch(
      `${SANDBOX_BASE_URL}/disbursement/v1_0/transfer`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'X-Reference-Id': refundReferenceId,
          'X-Target-Environment': environment,
          'Ocp-Apim-Subscription-Key': disbursementKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status !== 202 && !response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'mtn-momo',
        'REFUND_FAILED',
        `MTN MoMo refund (disbursement) failed: ${response.status} — ${errorBody}`
      );
    }

    return {
      id: transactionId,
      status: 'processing',
      provider: 'mtn-momo',
      providerReference: refundReferenceId,
      amount: refundAmount,
      currency: originalTx.currency as any,
      message: 'Refund disbursement initiated. Funds will be transferred to the original payer.',
    };
  }
}
