import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

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
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
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

        // Handle donation confirmation
        if (paymentType === 'donation') {
          const donorEmail = session.customer_details?.email || session.customer_email;
          const donorName = session.customer_details?.name || meta.donorName || 'Generous Donor';
          const amount = ((session.amount_total || 0) / 100).toFixed(2);
          const program = meta.program || 'General Fund';
          const isMonthly = meta.isMonthly === 'true';

          // Thank-you email to donor
          if (donorEmail) {
            try {
              await resend.emails.send({
                from: FROM,
                to: donorEmail,
                subject: 'Thank You for Your Donation to AFU! 🌾',
                html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                  <div style="background:#1B2A4A;padding:30px;text-align:center">
                    <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
                    <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Thank You</p>
                  </div>
                  <div style="padding:30px;background:#f8faf6">
                    <h2 style="color:#1B2A4A;margin-top:0">Thank you, ${donorName.split(' ')[0]}!</h2>
                    <p style="color:#333;font-size:15px;line-height:1.6">
                      Your ${isMonthly ? 'monthly ' : ''}donation of <strong>$${amount}</strong> to the <strong>${program.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</strong> is helping African farmers build a better future.
                    </p>
                    <div style="background:white;border-left:4px solid #5DB347;padding:16px;border-radius:4px;margin:20px 0">
                      <p style="margin:0;font-size:14px;color:#1B2A4A"><strong>Amount:</strong> $${amount}${isMonthly ? '/month' : ''}</p>
                      <p style="margin:8px 0 0;font-size:14px;color:#1B2A4A"><strong>Program:</strong> ${program.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}</p>
                    </div>
                    <p style="color:#333;font-size:14px">Every dollar goes directly to supporting farmers across Africa with financing, inputs, training, and market access.</p>
                    <div style="text-align:center;margin-top:24px">
                      <a href="https://africanfarmingunion.org" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Visit AFU</a>
                    </div>
                  </div>
                  <div style="padding:12px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div>
                </div>`,
              });
            } catch { /* non-critical */ }
          }

          // Notify Devon + Peter
          try {
            await resend.emails.send({
              from: FROM,
              to: NOTIFY_TO,
              subject: `New Donation: $${amount} from ${donorName}`,
              html: `<div style="font-family:Arial,sans-serif;padding:20px">
                <h2 style="color:#1B2A4A">New Donation Received</h2>
                <p><strong>${donorName}</strong> donated <strong>$${amount}</strong>${isMonthly ? ' (monthly)' : ''} to ${program}</p>
                <p>Email: ${donorEmail || 'N/A'}</p>
                <a href="https://africanfarmingunion.org/admin/payments" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
              </div>`,
            });
          } catch { /* non-critical */ }
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

          // S2.6: Emit PAYMENT_RECEIVED event on confirmed payment (not at checkout)
          const userId = intent.metadata?.user_id || intent.metadata?.farmerId;
          if (userId) {
            emitEventAsync({
              type: 'PAYMENT_RECEIVED',
              data: {
                paymentId,
                userId,
                amount: intent.amount / 100,
                currency: intent.currency.toUpperCase(),
                method: 'stripe',
              },
            });
          }
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
        console.warn(`Unhandled Stripe event type: ${event.type}`);
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
