/**
 * EcoCash Payment Gateway (Zimbabwe)
 * Integrates via Paynow Zimbabwe payment platform.
 * API docs: https://developers.paynow.co.zw/
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

const PAYNOW_INITIATE_URL = 'https://www.paynow.co.zw/interface/initiatetransaction';
const PAYNOW_STATUS_URL = 'https://www.paynow.co.zw/interface/pollstatus'; // not used directly; poll URL is per-transaction

interface PaynowInitResponse {
  status: string;
  browserurl: string;
  pollurl: string;
  hash: string;
  paynowreference?: string;
  instructions?: string;
}

interface PaynowPollResponse {
  status: string;
  amount: string;
  reference: string;
  paynowreference: string;
  hash: string;
}

/**
 * Generate a Paynow hash for request integrity verification.
 * Hash = SHA512(values concatenated + integration key)
 */
async function generateHash(values: Record<string, string>, integrationKey: string): Promise<string> {
  const { createHash } = await import('crypto');
  const concat = Object.values(values).join('') + integrationKey;
  return createHash('sha512').update(concat).digest('hex').toUpperCase();
}

/**
 * Parse Paynow's URL-encoded response body into a key-value object.
 */
function parsePaynowResponse(body: string): Record<string, string> {
  const result: Record<string, string> = {};
  const pairs = body.split('&');
  for (const pair of pairs) {
    const [key, ...rest] = pair.split('=');
    result[decodeURIComponent(key)] = decodeURIComponent(rest.join('='));
  }
  return result;
}

/**
 * Map Paynow status strings to our PaymentStatus.
 */
function mapPaynowStatus(paynowStatus: string): PaymentStatus {
  const normalized = paynowStatus.toLowerCase().trim();
  switch (normalized) {
    case 'paid':
      return 'completed';
    case 'awaiting delivery':
    case 'delivered':
      return 'completed';
    case 'created':
    case 'sent':
      return 'pending';
    case 'disputed':
    case 'cancelled':
    case 'failed':
      return 'failed';
    case 'refunded':
      return 'reversed';
    default:
      return 'processing';
  }
}

export class EcoCashGateway implements PaymentGateway {
  public readonly provider: PaymentProvider = 'ecocash';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    const merchantId = requireEnv('ecocash', 'ECOCASH_MERCHANT_ID');
    const apiKey = requireEnv('ecocash', 'ECOCASH_API_KEY');
    const transactionId = generateTransactionId();

    // Paynow result and return URLs (your server endpoints)
    const resultUrl = process.env.ECOCASH_RESULT_URL || 'https://localhost/payments/ecocash/result';
    const returnUrl = request.returnUrl || process.env.ECOCASH_RETURN_URL || 'https://localhost/payments/ecocash/return';

    const values: Record<string, string> = {
      id: merchantId,
      reference: transactionId,
      amount: request.amount.toFixed(2),
      additionalinfo: request.description.substring(0, 100),
      returnurl: returnUrl,
      resulturl: resultUrl,
      status: 'Message',
    };

    const hash = await generateHash(values, apiKey);

    const formBody = new URLSearchParams({
      ...values,
      hash,
    });

    // If phone number provided, add for mobile money (EcoCash) flow
    if (request.phoneNumber) {
      formBody.append('phone', request.phoneNumber);
      formBody.append('method', 'ecocash');
      formBody.append('authemail', ''); // Required but can be empty for mobile
    }

    const response = await fetch(PAYNOW_INITIATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formBody.toString(),
    });

    if (!response.ok) {
      throw new PaymentGatewayError(
        'ecocash',
        'INITIATE_FAILED',
        `Paynow request failed with HTTP ${response.status}`
      );
    }

    const responseBody = await response.text();
    const parsed = parsePaynowResponse(responseBody);

    if (parsed.status?.toLowerCase() === 'error') {
      throw new PaymentGatewayError(
        'ecocash',
        'PAYNOW_ERROR',
        `Paynow returned error: ${parsed.error || responseBody}`
      );
    }

    if (parsed.status?.toLowerCase() !== 'ok') {
      throw new PaymentGatewayError(
        'ecocash',
        'UNEXPECTED_STATUS',
        `Unexpected Paynow status: ${parsed.status}. Full response: ${responseBody}`
      );
    }

    // The pollurl is the key piece — it's how we check status later
    return {
      id: transactionId,
      status: 'pending',
      provider: 'ecocash',
      providerReference: parsed.pollurl || '',
      amount: request.amount,
      currency: request.currency,
      redirectUrl: parsed.browserurl || undefined,
      message: parsed.instructions || 'Payment initiated. Complete payment on your phone or via redirect.',
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatus> {
    // providerReference is the poll URL returned during initiation
    if (!providerReference || !providerReference.startsWith('http')) {
      throw new PaymentGatewayError(
        'ecocash',
        'INVALID_POLL_URL',
        'Provider reference must be the Paynow poll URL returned during initiation.'
      );
    }

    const response = await fetch(providerReference, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new PaymentGatewayError(
        'ecocash',
        'POLL_FAILED',
        `Paynow poll request failed with HTTP ${response.status}`
      );
    }

    const body = await response.text();
    const parsed = parsePaynowResponse(body);

    return mapPaynowStatus(parsed.status || 'unknown');
  }

  async refund(providerReference: string, amount?: number): Promise<PaymentResult> {
    // Paynow does not provide a programmatic refund API.
    // Refunds must be handled manually through the Paynow merchant dashboard.
    const transactionId = generateTransactionId();

    throw new PaymentGatewayError(
      'ecocash',
      'REFUND_NOT_SUPPORTED',
      'Paynow/EcoCash does not support programmatic refunds. ' +
        'Please process refunds manually through the Paynow merchant dashboard. ' +
        `Transaction reference: ${providerReference}, amount: ${amount ?? 'full'}`
    );
  }
}
