/**
 * Webhook Verification Helpers
 * Validates incoming webhook payloads from payment providers.
 */

import { PaymentGatewayError } from './gateway';

// ─── Stripe Webhook Verification ───────────────────────────────────────────

/**
 * Verify a Stripe webhook signature and return the parsed event.
 *
 * @param payload - Raw request body as a string
 * @param signature - Value of the `stripe-signature` header
 * @returns Parsed Stripe event object
 * @throws PaymentGatewayError if verification fails
 */
export async function verifyStripeWebhook(
  payload: string,
  signature: string
): Promise<any> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new PaymentGatewayError(
      'stripe',
      'MISSING_CONFIG',
      'STRIPE_WEBHOOK_SECRET environment variable is not set.'
    );
  }

  let Stripe: any;
  try {
    const mod = await import('stripe');
    Stripe = mod.default;
  } catch {
    throw new PaymentGatewayError(
      'stripe',
      'SDK_NOT_INSTALLED',
      'The "stripe" npm package is not installed. Run: npm install stripe'
    );
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
  });

  try {
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    return event;
  } catch (err: unknown) {
    throw new PaymentGatewayError(
      'stripe',
      'WEBHOOK_VERIFICATION_FAILED',
      `Stripe webhook signature verification failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ─── M-Pesa Callback Verification ──────────────────────────────────────────

/**
 * Expected structure of an M-Pesa STK Push callback.
 */
interface MpesaCallbackBody {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value?: string | number;
        }>;
      };
    };
  };
}

/**
 * Validate the structure of an M-Pesa STK Push callback.
 * M-Pesa does not use cryptographic signatures for callbacks,
 * so validation is structural. In production, also verify the
 * source IP is from Safaricom's known ranges.
 *
 * @param body - Parsed JSON body of the callback request
 * @returns true if the callback has a valid M-Pesa structure
 * @throws PaymentGatewayError if validation fails
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function verifyMpesaCallback(body: any): body is MpesaCallbackBody {
  if (!body || typeof body !== 'object') {
    throw new PaymentGatewayError(
      'mpesa',
      'INVALID_CALLBACK',
      'M-Pesa callback body is null or not an object.'
    );
  }

  if (!body.Body || typeof body.Body !== 'object') {
    throw new PaymentGatewayError(
      'mpesa',
      'INVALID_CALLBACK',
      'M-Pesa callback is missing the "Body" field.'
    );
  }

  const stkCallback = body.Body.stkCallback;
  if (!stkCallback || typeof stkCallback !== 'object') {
    throw new PaymentGatewayError(
      'mpesa',
      'INVALID_CALLBACK',
      'M-Pesa callback is missing "Body.stkCallback" field.'
    );
  }

  if (typeof stkCallback.MerchantRequestID !== 'string') {
    throw new PaymentGatewayError(
      'mpesa',
      'INVALID_CALLBACK',
      'M-Pesa callback is missing or has invalid "MerchantRequestID".'
    );
  }

  if (typeof stkCallback.CheckoutRequestID !== 'string') {
    throw new PaymentGatewayError(
      'mpesa',
      'INVALID_CALLBACK',
      'M-Pesa callback is missing or has invalid "CheckoutRequestID".'
    );
  }

  if (typeof stkCallback.ResultCode !== 'number') {
    throw new PaymentGatewayError(
      'mpesa',
      'INVALID_CALLBACK',
      'M-Pesa callback is missing or has invalid "ResultCode".'
    );
  }

  // If ResultCode is 0 (success), CallbackMetadata should be present
  if (stkCallback.ResultCode === 0) {
    if (!stkCallback.CallbackMetadata || !Array.isArray(stkCallback.CallbackMetadata.Item)) {
      throw new PaymentGatewayError(
        'mpesa',
        'INVALID_CALLBACK',
        'Successful M-Pesa callback is missing "CallbackMetadata.Item" array.'
      );
    }
  }

  return true;
}

/**
 * Extract key fields from a validated M-Pesa callback.
 */
export function parseMpesaCallback(body: MpesaCallbackBody): {
  checkoutRequestId: string;
  merchantRequestId: string;
  resultCode: number;
  resultDesc: string;
  amount?: number;
  mpesaReceiptNumber?: string;
  phoneNumber?: string;
  transactionDate?: string;
} {
  const cb = body.Body.stkCallback;
  const result: ReturnType<typeof parseMpesaCallback> = {
    checkoutRequestId: cb.CheckoutRequestID,
    merchantRequestId: cb.MerchantRequestID,
    resultCode: cb.ResultCode,
    resultDesc: cb.ResultDesc,
  };

  if (cb.CallbackMetadata?.Item) {
    for (const item of cb.CallbackMetadata.Item) {
      switch (item.Name) {
        case 'Amount':
          result.amount = item.Value as number;
          break;
        case 'MpesaReceiptNumber':
          result.mpesaReceiptNumber = item.Value as string;
          break;
        case 'PhoneNumber':
          result.phoneNumber = String(item.Value);
          break;
        case 'TransactionDate':
          result.transactionDate = String(item.Value);
          break;
      }
    }
  }

  return result;
}

// ─── Paynow (EcoCash) Callback Verification ────────────────────────────────

/**
 * Expected structure of a Paynow payment notification callback.
 */
interface PaynowCallbackBody {
  reference: string;
  paynowreference: string;
  amount: string;
  status: string;
  pollurl: string;
  hash: string;
}

/**
 * Verify the integrity of a Paynow (EcoCash) webhook callback.
 * Paynow uses SHA512 hash verification with the integration key.
 *
 * @param body - Parsed form data or JSON body from the Paynow callback
 * @returns true if the callback is valid
 * @throws PaymentGatewayError if validation fails
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyPaynowCallback(body: any): Promise<boolean> {
  if (!body || typeof body !== 'object') {
    throw new PaymentGatewayError(
      'ecocash',
      'INVALID_CALLBACK',
      'Paynow callback body is null or not an object.'
    );
  }

  const requiredFields = ['reference', 'paynowreference', 'amount', 'status', 'pollurl', 'hash'];
  for (const field of requiredFields) {
    if (!(field in body) || typeof body[field] !== 'string') {
      throw new PaymentGatewayError(
        'ecocash',
        'INVALID_CALLBACK',
        `Paynow callback is missing or has invalid "${field}" field.`
      );
    }
  }

  // Verify hash integrity
  const integrationKey = process.env.ECOCASH_API_KEY;
  if (!integrationKey) {
    throw new PaymentGatewayError(
      'ecocash',
      'MISSING_CONFIG',
      'ECOCASH_API_KEY environment variable is not set. Cannot verify callback hash.'
    );
  }

  const { createHash } = await import('crypto');

  // Hash is computed over all values except the hash itself, concatenated + integration key
  const valuesToHash: string[] = [];
  for (const field of requiredFields) {
    if (field === 'hash') continue;
    valuesToHash.push(body[field]);
  }
  const concat = valuesToHash.join('') + integrationKey;
  const expectedHash = createHash('sha512').update(concat).digest('hex').toUpperCase();

  if (body.hash.toUpperCase() !== expectedHash) {
    throw new PaymentGatewayError(
      'ecocash',
      'HASH_MISMATCH',
      'Paynow callback hash verification failed. The callback may have been tampered with.'
    );
  }

  return true;
}

/**
 * Parse a verified Paynow callback into a structured result.
 */
export function parsePaynowCallback(body: PaynowCallbackBody): {
  reference: string;
  paynowReference: string;
  amount: number;
  status: string;
  pollUrl: string;
} {
  return {
    reference: body.reference,
    paynowReference: body.paynowreference,
    amount: parseFloat(body.amount),
    status: body.status,
    pollUrl: body.pollurl,
  };
}
