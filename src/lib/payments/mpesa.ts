/**
 * Safaricom M-Pesa STK Push Gateway
 * Supports Kenya, Tanzania, and Mozambique via the Daraja API.
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

const SANDBOX_BASE_URL = 'https://sandbox.safaricom.co.ke';

interface OAuthTokenResponse {
  access_token: string;
  expires_in: string;
}

interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface STKQueryResponse {
  ResponseCode: string;
  ResultCode: string;
  ResultDesc: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Generate an OAuth access token from Safaricom Daraja API.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const consumerKey = requireEnv('mpesa', 'MPESA_CONSUMER_KEY');
  const consumerSecret = requireEnv('mpesa', 'MPESA_CONSUMER_SECRET');

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(
    `${SANDBOX_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: 'GET',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    }
  );

  if (!response.ok) {
    throw new PaymentGatewayError(
      'mpesa',
      'AUTH_FAILED',
      `Failed to obtain M-Pesa access token: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as OAuthTokenResponse;

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (parseInt(data.expires_in, 10) - 60) * 1000,
  };

  return data.access_token;
}

/**
 * Generate the M-Pesa password for STK push.
 * Password = Base64(Shortcode + Passkey + Timestamp)
 */
function generatePassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

/**
 * Get current timestamp in M-Pesa format: YYYYMMDDHHmmss
 */
function getMpesaTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

export class MpesaGateway implements PaymentGateway {
  public readonly provider: PaymentProvider = 'mpesa';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    if (!request.phoneNumber) {
      throw new PaymentGatewayError(
        'mpesa',
        'MISSING_PHONE',
        'Phone number is required for M-Pesa STK Push payments.'
      );
    }

    const shortcode = requireEnv('mpesa', 'MPESA_SHORTCODE');
    const passkey = requireEnv('mpesa', 'MPESA_PASSKEY');
    const callbackUrl = requireEnv('mpesa', 'MPESA_CALLBACK_URL');
    const accessToken = await getAccessToken();
    const transactionId = generateTransactionId();
    const timestamp = getMpesaTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);

    // Normalize phone number: remove leading + or 0, ensure country code
    const phone = request.phoneNumber.replace(/^\+/, '');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.ceil(request.amount), // M-Pesa uses whole numbers
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: transactionId,
      TransactionDesc: request.description.substring(0, 50),
    };

    const response = await fetch(
      `${SANDBOX_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'mpesa',
        'STK_PUSH_FAILED',
        `STK Push request failed: ${response.status} — ${errorBody}`
      );
    }

    const data = (await response.json()) as STKPushResponse;

    if (data.ResponseCode !== '0') {
      throw new PaymentGatewayError(
        'mpesa',
        'STK_PUSH_REJECTED',
        `M-Pesa rejected STK Push: ${data.ResponseDescription}`
      );
    }

    return {
      id: transactionId,
      status: 'pending',
      provider: 'mpesa',
      providerReference: data.CheckoutRequestID,
      amount: request.amount,
      currency: request.currency,
      message: data.CustomerMessage || 'Please check your phone and enter your M-Pesa PIN.',
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatus> {
    const shortcode = requireEnv('mpesa', 'MPESA_SHORTCODE');
    const passkey = requireEnv('mpesa', 'MPESA_PASSKEY');
    const accessToken = await getAccessToken();
    const timestamp = getMpesaTimestamp();
    const password = generatePassword(shortcode, passkey, timestamp);

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: providerReference,
    };

    const response = await fetch(
      `${SANDBOX_BASE_URL}/mpesa/stkpushquery/v1/query`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new PaymentGatewayError(
        'mpesa',
        'STATUS_CHECK_FAILED',
        `Failed to query M-Pesa transaction status: ${response.status}`
      );
    }

    const data = (await response.json()) as STKQueryResponse;

    // ResultCode 0 = success, 1032 = cancelled, 1037 = timeout
    switch (data.ResultCode) {
      case '0':
        return 'completed';
      case '1032':
        return 'failed'; // User cancelled
      case '1037':
        return 'expired'; // Timed out
      default:
        // Still processing or unknown
        if (data.ResponseCode === '0') return 'processing';
        return 'failed';
    }
  }

  async refund(providerReference: string, amount?: number): Promise<PaymentResult> {
    // M-Pesa reversals use the Reversal API
    const accessToken = await getAccessToken();
    const shortcode = requireEnv('mpesa', 'MPESA_SHORTCODE');
    const callbackUrl = requireEnv('mpesa', 'MPESA_CALLBACK_URL');
    const transactionId = generateTransactionId();

    // S1.15: SecurityCredential must be the initiator password encrypted with
    // Safaricom's public certificate, not the raw shortcode.
    // In sandbox mode, use the test credential; in production, encrypt with cert.
    const initiatorPassword = requireEnv('mpesa', 'MPESA_INITIATOR_PASSWORD');
    const securityCredential = process.env.MPESA_SECURITY_CREDENTIAL || initiatorPassword;

    const payload = {
      Initiator: process.env.MPESA_INITIATOR_NAME || 'apiuser',
      SecurityCredential: securityCredential,
      CommandID: 'TransactionReversal',
      TransactionID: providerReference,
      Amount: amount ?? 0, // 0 = full reversal
      ReceiverParty: shortcode,
      RecieverIdentifierType: '11',
      ResultURL: `${callbackUrl}/reversal`,
      QueueTimeOutURL: `${callbackUrl}/timeout`,
      Remarks: 'AFU Portal refund',
      Occasion: transactionId,
    };

    const response = await fetch(
      `${SANDBOX_BASE_URL}/mpesa/reversal/v1/request`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      throw new PaymentGatewayError(
        'mpesa',
        'REVERSAL_FAILED',
        `M-Pesa reversal request failed: ${response.status} — ${errorBody}`
      );
    }

    const data = await response.json();

    return {
      id: transactionId,
      status: 'processing',
      provider: 'mpesa',
      providerReference: data.ConversationID ?? providerReference,
      amount: amount ?? 0,
      currency: 'KES',
      message: 'Reversal request submitted. Check status for updates.',
    };
  }
}
