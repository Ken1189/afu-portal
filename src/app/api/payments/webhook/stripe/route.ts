import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

/**
 * POST /api/payments/webhook/stripe
 * Stripe webhook handler. No auth required — verified via webhook signature.
 *
 * Handles:
 *   - checkout.session.completed  (membership + sponsorship subscriptions)
 *   - payment_intent.succeeded
 *   - payment_intent.payment_failed
 *   - charge.refunded
 *   - customer.subscription.deleted
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
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown verification error';
    console.error('Stripe webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  const adminClient = await createAdminClient();

  try {
    switch (event.type) {
      // ── Checkout completed (membership or sponsorship subscription) ──────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const meta = session.metadata || {};
        const paymentType = meta.type; // 'membership' | 'sponsorship'
        const tier = meta.tier;
        const farmerId = meta.farmerId;
        const paymentId = meta.payment_id;

        // Update existing payment record if payment_id is in metadata
        if (paymentId) {
          await adminClient
            .from('payments')
            .update({ status: 'completed', provider_reference: session.id })
            .eq('id', paymentId);

          await adminClient
            .from('payment_attempts')
            .update({ status: 'completed', provider_response: session as unknown as Record<string, unknown> })
            .eq('payment_id', paymentId)
            .eq('status', 'pending');
        }

        // Handle membership activation
        if (paymentType === 'membership' && tier) {
          const customerEmail =
            session.customer_details?.email || session.customer_email || null;

          if (customerEmail) {
            // Find the member by email and update their tier / status
            const { data: member } = await adminClient
              .from('members')
              .select('id')
              .eq('email', customerEmail)
              .maybeSingle();

            if (member) {
              await adminClient
                .from('members')
                .update({
                  membership_tier: tier,
                  status: 'active',
                  stripe_subscription_id: session.subscription as string || null,
                  updated_at: new Date().toISOString(),
                })
                .eq('id', member.id);
            }
          }
        }

        // Handle sponsorship activation
        if (paymentType === 'sponsorship' && tier && farmerId) {
          const customerEmail =
            session.customer_details?.email || session.customer_email || null;
          const customerName = session.customer_details?.name || 'Anonymous Sponsor';

          await adminClient.from('sponsorships').insert({
            farmer_profile_id: farmerId,
            sponsor_name: customerName,
            sponsor_email: customerEmail || '',
            tier,
            billing_cycle: 'monthly',
            amount_usd: (session.amount_total || 0) / 100,
            status: 'active',
            stripe_subscription_id: (session.subscription as string) || null,
          });

          // Increment farmer's sponsor count
          if (farmerId) {
            const { data: farmer } = await adminClient
              .from('farmer_public_profiles')
              .select('total_sponsors, monthly_funding_received')
              .eq('id', farmerId)
              .maybeSingle();

            if (farmer) {
              await adminClient
                .from('farmer_public_profiles')
                .update({
                  total_sponsors: (farmer.total_sponsors ?? 0) + 1,
                  monthly_funding_received:
                    (farmer.monthly_funding_received ?? 0) + (session.amount_total || 0) / 100,
                })
                .eq('id', farmerId);
            }
          }
        }

        break;
      }

      // ── Payment intent succeeded ─────────────────────────────────────────
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const paymentId = intent.metadata?.payment_id;
        if (paymentId) {
          await adminClient
            .from('payments')
            .update({ status: 'completed', provider_reference: intent.id })
            .eq('id', paymentId);

          await adminClient
            .from('payment_attempts')
            .update({ status: 'completed', provider_response: intent as unknown as Record<string, unknown> })
            .eq('payment_id', paymentId)
            .eq('status', 'pending');
        }
        break;
      }

      // ── Payment intent failed ────────────────────────────────────────────
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        const paymentId = intent.metadata?.payment_id;
        if (paymentId) {
          const failureMessage =
            intent.last_payment_error?.message || 'Payment failed';
          await adminClient
            .from('payments')
            .update({ status: 'failed', failure_reason: failureMessage })
            .eq('id', paymentId);

          await adminClient
            .from('payment_attempts')
            .update({ status: 'failed', provider_response: intent as unknown as Record<string, unknown> })
            .eq('payment_id', paymentId)
            .eq('status', 'pending');
        }
        break;
      }

      // ── Refund ───────────────────────────────────────────────────────────
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string | null;
        if (paymentIntentId) {
          await adminClient
            .from('payments')
            .update({ status: 'refunded' })
            .eq('provider_reference', paymentIntentId);
        }
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;

        // Deactivate member subscription
        await adminClient
          .from('members')
          .update({ status: 'inactive', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', subId);

        // Deactivate sponsorship subscription
        await adminClient
          .from('sponsorships')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subId);

        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    // Audit log the webhook event
    await adminClient.from('audit_log').insert({
      action: 'webhook',
      entity_type: 'payment',
      details: { provider: 'stripe', event_type: event.type, event_id: event.id },
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
