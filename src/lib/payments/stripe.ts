/**
 * Stripe Payment Gateway
 * Card payments for all 10 AFU countries.
 * Uses dynamic import so the stripe package is only loaded when needed.
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

type StripeInstance = import('stripe').default;

let stripeInstance: StripeInstance | null = null;

/**
 * Lazily load and cache the Stripe SDK instance.
 */
async function getStripe(): Promise<StripeInstance> {
  if (stripeInstance) return stripeInstance;

  const secretKey = requireEnv('stripe', 'STRIPE_SECRET_KEY');

  let Stripe: typeof import('stripe').default;
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

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia' as any,
    typescript: true,
  });

  return stripeInstance;
}

/**
 * Map Stripe payment intent status to our PaymentStatus.
 */
function mapStripeStatus(stripeStatus: string): PaymentStatus {
  switch (stripeStatus) {
    case 'succeeded':
      return 'completed';
    case 'processing':
      return 'processing';
    case 'requires_payment_method':
    case 'requires_confirmation':
    case 'requires_action':
      return 'pending';
    case 'canceled':
      return 'failed';
    default:
      return 'pending';
  }
}

export class StripeGateway implements PaymentGateway {
  public readonly provider: PaymentProvider = 'stripe';

  async initiate(request: PaymentRequest): Promise<PaymentResult> {
    const stripe = await getStripe();
    const transactionId = generateTransactionId();

    // If a returnUrl is provided, create a Checkout Session (redirect flow).
    // Otherwise create a PaymentIntent (embedded / server-side flow).
    if (request.returnUrl) {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: request.currency.toLowerCase(),
              unit_amount: Math.round(request.amount * 100), // Stripe uses cents
              product_data: {
                name: request.description,
                metadata: {
                  memberId: request.memberId,
                  transactionId,
                },
              },
            },
            quantity: 1,
          },
        ],
        metadata: {
          memberId: request.memberId,
          transactionId,
          ...request.metadata,
        },
        success_url: `${request.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: request.returnUrl,
      });

      return {
        id: transactionId,
        status: 'pending',
        provider: 'stripe',
        providerReference: session.id,
        amount: request.amount,
        currency: request.currency,
        redirectUrl: session.url ?? undefined,
      };
    }

    // PaymentIntent flow (no redirect)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(request.amount * 100),
      currency: request.currency.toLowerCase(),
      description: request.description,
      metadata: {
        memberId: request.memberId,
        transactionId,
        ...request.metadata,
      },
      automatic_payment_methods: { enabled: true },
    });

    return {
      id: transactionId,
      status: mapStripeStatus(paymentIntent.status),
      provider: 'stripe',
      providerReference: paymentIntent.id,
      amount: request.amount,
      currency: request.currency,
      message: 'Payment intent created. Use client secret to confirm on the frontend.',
    };
  }

  async checkStatus(providerReference: string): Promise<PaymentStatus> {
    const stripe = await getStripe();

    // Handle both checkout session IDs and payment intent IDs
    if (providerReference.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(providerReference);
      switch (session.payment_status) {
        case 'paid':
          return 'completed';
        case 'unpaid':
          return 'pending';
        case 'no_payment_required':
          return 'completed';
        default:
          return 'pending';
      }
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(providerReference);
    return mapStripeStatus(paymentIntent.status);
  }

  async refund(providerReference: string, amount?: number): Promise<PaymentResult> {
    const stripe = await getStripe();
    const transactionId = generateTransactionId();

    // If it's a checkout session, retrieve the payment intent first
    let paymentIntentId = providerReference;
    if (providerReference.startsWith('cs_')) {
      const session = await stripe.checkout.sessions.retrieve(providerReference);
      paymentIntentId = session.payment_intent as string;
      if (!paymentIntentId) {
        throw new PaymentGatewayError(
          'stripe',
          'NO_PAYMENT_INTENT',
          'Checkout session has no associated payment intent to refund.'
        );
      }
    }

    const refundParams: Record<string, unknown> = {
      payment_intent: paymentIntentId,
    };
    if (amount !== undefined) {
      refundParams.amount = Math.round(amount * 100);
    }

    const refund = await stripe.refunds.create(refundParams as any);

    return {
      id: transactionId,
      status: refund.status === 'succeeded' ? 'reversed' : 'processing',
      provider: 'stripe',
      providerReference: refund.id,
      amount: amount ?? (refund.amount / 100),
      currency: refund.currency?.toUpperCase() as any ?? 'USD',
      message: `Refund ${refund.status}`,
    };
  }
}
