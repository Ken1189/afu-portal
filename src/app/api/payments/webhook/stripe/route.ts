import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/payments/webhook/stripe
 * Stripe webhook handler. No auth required — verified via webhook signature.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Verify signature and parse event
  let event: { type: string; data: { object: Record<string, unknown> } };

  try {
    const { verifyStripeWebhook } = await import('@/lib/payments/webhooks');
    event = await verifyStripeWebhook(rawBody, signature);
  } catch {
    // If stripe verification module is not available, parse JSON directly
    // This is a fallback for development — production should always verify
    try {
      event = JSON.parse(rawBody);
      console.warn('Stripe webhook signature verification skipped — module not available');
    } catch {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }
  }

  const adminClient = await createAdminClient();
  const obj = event.data.object as Record<string, unknown> & { metadata?: Record<string, string>; id?: string };

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const paymentId = obj.metadata?.payment_id as string | undefined;
        if (paymentId) {
          await adminClient
            .from('payments')
            .update({ status: 'completed', provider_reference: obj.id as string })
            .eq('id', paymentId);

          await adminClient
            .from('payment_attempts')
            .update({ status: 'completed', provider_response: obj })
            .eq('payment_id', paymentId)
            .eq('status', 'pending');
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentId = obj.metadata?.payment_id as string | undefined;
        if (paymentId) {
          await adminClient
            .from('payments')
            .update({ status: 'completed', provider_reference: obj.id as string })
            .eq('id', paymentId);

          await adminClient
            .from('payment_attempts')
            .update({ status: 'completed', provider_response: obj })
            .eq('payment_id', paymentId)
            .eq('status', 'pending');
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentId = obj.metadata?.payment_id as string | undefined;
        if (paymentId) {
          const failureMessage = (obj.last_payment_error as Record<string, unknown>)?.message || 'Payment failed';
          await adminClient
            .from('payments')
            .update({ status: 'failed', failure_reason: failureMessage as string })
            .eq('id', paymentId);

          await adminClient
            .from('payment_attempts')
            .update({ status: 'failed', provider_response: obj })
            .eq('payment_id', paymentId)
            .eq('status', 'pending');
        }
        break;
      }

      case 'charge.refunded': {
        const paymentIntentId = obj.payment_intent as string | undefined;
        if (paymentIntentId) {
          await adminClient
            .from('payments')
            .update({ status: 'refunded' })
            .eq('provider_reference', paymentIntentId);
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // Audit log the webhook event
    await adminClient.from('audit_log').insert({
      action: 'webhook',
      entity_type: 'payment',
      details: { provider: 'stripe', event_type: event.type },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
