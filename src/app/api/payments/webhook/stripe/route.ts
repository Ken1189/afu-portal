import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { emitEventAsync } from '@/lib/events/event-bus';
import { sendEmail } from '@/lib/email/resend';
import { sendWelcomeSeriesEmail, sendMembershipPaymentConfirmationEmail } from '@/lib/email/lifecycle-emails';
import {
  sendSubscriptionConfirmation,
  sendPaymentReceived,
  sendPaymentFailed,
  sendSubscriptionCanceled,
} from '@/lib/email/supplier-subscriptions';
import '@/lib/events/handlers';

// ── Helper: upsert supplier_subscriptions from a Stripe.Subscription ──
async function upsertSupplierSubscription(
  adminClient: ReturnType<typeof createAdminClient> extends Promise<infer T> ? T : never,
  subscription: Stripe.Subscription
): Promise<{ supplierId: string | null; planSlug: string | null }> {
  const meta = subscription.metadata || {};
  let supplierId: string | null = meta.supplier_id || null;
  let planSlug: string | null = meta.plan_slug || null;

  // Fallback: look up supplier by stripe_customer_id
  if (!supplierId && subscription.customer) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer.id;
    const { data } = await adminClient
      .from('suppliers')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data) supplierId = data.id;
  }

  // Fallback: derive plan slug from price
  if (!planSlug) {
    const priceId = subscription.items?.data?.[0]?.price?.id;
    if (priceId) {
      const { data: planByPrice } = await adminClient
        .from('supplier_subscription_plans')
        .select('slug')
        .eq('stripe_price_id', priceId)
        .maybeSingle();
      if (planByPrice) planSlug = planByPrice.slug;
    }
  }

  if (!supplierId) return { supplierId: null, planSlug };

  // Look up plan id by slug
  let planId: string | null = null;
  if (planSlug) {
    const { data: plan } = await adminClient
      .from('supplier_subscription_plans')
      .select('id')
      .eq('slug', planSlug)
      .maybeSingle();
    if (plan) planId = plan.id;
  }

  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id || null;

  // Stripe SDK types vary; use any for period accessors
  const subAny = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    items?: { data?: Array<{ current_period_start?: number; current_period_end?: number }> };
  };
  const itemPeriod = subAny.items?.data?.[0] || {};
  const startSec = subAny.current_period_start ?? itemPeriod.current_period_start;
  const endSec = subAny.current_period_end ?? itemPeriod.current_period_end;
  const periodStart = startSec ? new Date(startSec * 1000).toISOString() : null;
  const periodEnd = endSec ? new Date(endSec * 1000).toISOString() : null;
  const trialEnd = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;
  const canceledAt = subscription.canceled_at
    ? new Date(subscription.canceled_at * 1000).toISOString()
    : null;

  // Upsert by stripe_subscription_id
  const { data: existing } = await adminClient
    .from('supplier_subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .maybeSingle();

  const row = {
    supplier_id: supplierId,
    plan_id: planId,
    plan_slug: planSlug || 'starter',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status: subscription.status,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end || false,
    canceled_at: canceledAt,
    trial_end: trialEnd,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await adminClient
      .from('supplier_subscriptions')
      .update(row)
      .eq('id', existing.id);
  } else {
    await adminClient.from('supplier_subscriptions').insert(row);
  }

  // Mirror onto suppliers table for fast lookups
  await adminClient
    .from('suppliers')
    .update({
      subscription_plan_slug: planSlug || 'starter',
      subscription_status: subscription.status,
      subscription_current_period_end: periodEnd,
      ...(customerId ? { stripe_customer_id: customerId } : {}),
    })
    .eq('id', supplierId);

  return { supplierId, planSlug };
}

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

  // ── Deduplication: prevent reprocessing on Stripe retries ────────────────
  {
    const { data: existingEvent } = await adminClient
      .from('stripe_event_log')
      .select('id, status')
      .eq('stripe_event_id', event.id)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({ received: true, duplicate: true });
    }

    const { error: insertErr } = await adminClient
      .from('stripe_event_log')
      .insert({
        stripe_event_id: event.id,
        event_type: event.type,
        status: 'processing',
        payload: event as unknown as Record<string, unknown>,
      });

    // If insert failed due to unique constraint (concurrent retry), treat as duplicate
    if (insertErr && insertErr.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true });
    }
  }

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

        // ── Wallet deposit checkout completed ──
        if (paymentType === 'wallet_deposit') {
          try {
            const walletId = meta.wallet_id;
            const depositUserId = meta.user_id;
            const depositAmount = parseFloat(meta.amount || '0');
            const depositCurrency = meta.currency || 'USD';

            if (walletId && depositAmount > 0) {
              // Import WalletService dynamically to avoid circular deps
              const { WalletService } = await import('@/lib/banking');
              const walletService = new WalletService(adminClient);

              await walletService.deposit({
                wallet_id: walletId,
                amount: depositAmount,
                description: `Card deposit via Stripe`,
                reference: `STRIPE-${session.id}`,
                operator_id: depositUserId || undefined,
              });

              console.log(`[wallet_deposit] Credited $${depositAmount} ${depositCurrency} to wallet ${walletId}`);
            } else {
              console.warn('[wallet_deposit] Missing wallet_id or invalid amount in metadata:', meta);
            }
          } catch (e) {
            console.error('[wallet_deposit] handler error:', e);
          }
          break;
        }

        // ── Supplier subscription checkout completed ──
        if (paymentType === 'supplier_subscription') {
          try {
            const supplierId = meta.supplier_id;
            const planSlug = meta.plan_slug;
            const customerId =
              typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id || null;
            const subscriptionId =
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription?.id || null;

            if (supplierId && customerId) {
              await adminClient
                .from('suppliers')
                .update({ stripe_customer_id: customerId })
                .eq('id', supplierId);
            }

            // Pre-create / upsert supplier_subscriptions row (status updates via subscription.* events)
            if (supplierId && subscriptionId) {
              const { data: existing } = await adminClient
                .from('supplier_subscriptions')
                .select('id')
                .eq('stripe_subscription_id', subscriptionId)
                .maybeSingle();
              if (!existing) {
                await adminClient.from('supplier_subscriptions').insert({
                  supplier_id: supplierId,
                  plan_slug: planSlug || 'starter',
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                  status: 'incomplete',
                });
              }
            }
          } catch (e) {
            console.error('[supplier checkout completed] handler error:', e);
          }
        }

        // Handle membership activation
        if (paymentType === 'membership' && tier) {
          const userId = meta.user_id || null;
          const customerEmail =
            session.customer_details?.email ||
            session.customer_email ||
            meta.email ||
            null;
          const customerName =
            session.customer_details?.name || 'AFU Member';
          const subscriptionId = (session.subscription as string) || null;

          try {
            let memberId: string | null = null;

            // Look up by profile_id (the canonical link)
            if (userId) {
              const { data: existing, error: lookupErr } = await adminClient
                .from('members')
                .select('id')
                .eq('profile_id', userId)
                .maybeSingle();
              if (lookupErr) {
                console.error('[webhook membership] member lookup by profile_id failed:', lookupErr);
              }
              if (existing) memberId = existing.id;
            }

            // Fallback: look up by email column (legacy/back-compat)
            if (!memberId && customerEmail) {
              const { data: byEmail } = await adminClient
                .from('members')
                .select('id')
                .eq('email', customerEmail)
                .maybeSingle();
              if (byEmail) memberId = byEmail.id;
            }

            if (memberId) {
              const { error: updErr } = await adminClient
                .from('members')
                .update({
                  tier,
                  status: 'active',
                  stripe_subscription_id: subscriptionId,
                  ...(customerEmail ? { email: customerEmail } : {}),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', memberId);
              if (updErr) {
                console.error('[webhook membership] member update failed:', updErr);
              }
            } else {
              // Create a new member record so the user actually gets upgraded
              const { error: insErr } = await adminClient
                .from('members')
                .insert({
                  profile_id: userId,
                  email: customerEmail,
                  tier,
                  status: 'active',
                  stripe_subscription_id: subscriptionId,
                });
              if (insErr) {
                console.error('[webhook membership] member insert failed:', insErr);
              }
            }

            // Update payments row tier (in case it was missing)
            if (paymentId) {
              await adminClient
                .from('payments')
                .update({ tier, status: 'completed' })
                .eq('id', paymentId);
            }

            // ── Ambassador commission auto-trigger (Sprint 2B) ───────────
            try {
              // Find the member record (re-use memberId from above if set)
              type RefMemberRow = { id: string; referred_by: string | null };
              let refMemberRow: RefMemberRow | null = null;
              if (memberId) {
                const { data } = await adminClient
                  .from('members')
                  .select('id, referred_by')
                  .eq('id', memberId)
                  .maybeSingle();
                refMemberRow = (data as unknown) as RefMemberRow | null;
              } else if (userId) {
                const { data } = await adminClient
                  .from('members')
                  .select('id, referred_by')
                  .eq('profile_id', userId)
                  .maybeSingle();
                refMemberRow = (data as unknown) as RefMemberRow | null;
              }

              if (refMemberRow?.referred_by) {
                // Look up ambassador by user_id (profile id)
                const { data: amb } = await adminClient
                  .from('ambassadors')
                  .select('id, user_id, tier, commission_rate_override, email, name')
                  .eq('user_id', refMemberRow.referred_by)
                  .maybeSingle();

                if (amb?.id) {
                  // Determine rate — prefer override, fall back to 10%
                  let ratePercent = 10;
                  const override = amb.commission_rate_override as
                    | { membership?: number }
                    | null
                    | undefined;
                  if (override && typeof override.membership === 'number') {
                    ratePercent = override.membership;
                  } else {
                    // Try commission_rates table for membership type
                    const { data: rateRow } = await adminClient
                      .from('commission_rates')
                      .select('rate_percent, tier')
                      .eq('commission_type', 'membership')
                      .eq('is_active', true)
                      .order('tier', { ascending: true });
                    if (rateRow && rateRow.length > 0) {
                      const matched =
                        rateRow.find((r: { tier: string | null }) => r.tier === amb.tier) ||
                        rateRow.find((r: { tier: string | null }) => r.tier === null);
                      if (matched) ratePercent = Number(matched.rate_percent) || 10;
                    }
                  }

                  const sourceAmount = (session.amount_total || 0) / 100;
                  const commissionAmount = +(sourceAmount * (ratePercent / 100)).toFixed(2);

                  const { error: commErr } = await adminClient
                    .from('commission_entries')
                    .insert({
                      ambassador_id: amb.id,
                      commission_type: 'membership',
                      description: `Membership payment (${tier}) from ${customerName}`,
                      source_amount: sourceAmount,
                      rate_percent: ratePercent,
                      commission_amount: commissionAmount,
                      currency: (session.currency || 'usd').toUpperCase(),
                      source_reference: paymentId || session.id,
                      source_type: 'membership_payment',
                      status: 'pending',
                      reference_id: refMemberRow.id,
                      reference_type: 'member',
                    });

                  if (commErr) {
                    console.error('[webhook membership] commission insert failed:', commErr);
                  } else {
                    // Bump ambassador totals (best-effort)
                    await adminClient
                      .from('ambassadors')
                      .update({
                        pending_earnings: (amb as unknown as { pending_earnings?: number }).pending_earnings
                          ? ((amb as unknown as { pending_earnings: number }).pending_earnings + commissionAmount)
                          : commissionAmount,
                      })
                      .eq('id', amb.id);

                    // Notify the ambassador (fire-and-forget)
                    const ambEmail = (amb as unknown as { email?: string }).email;
                    const ambName = (amb as unknown as { name?: string }).name || 'Ambassador';
                    if (ambEmail) {
                      try {
                        await sendEmail(
                          ambEmail,
                          `You earned a $${commissionAmount.toFixed(2)} commission!`,
                          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                            <div style="background:#1B2A4A;padding:24px;text-align:center">
                              <h1 style="color:#5DB347;margin:0;font-size:22px">New Commission Earned</h1>
                            </div>
                            <div style="padding:24px;background:#f8faf6">
                              <p style="color:#1B2A4A">Hi ${ambName},</p>
                              <p style="color:#333;font-size:15px;line-height:1.6">
                                One of your referrals just purchased a <strong>${tier}</strong> membership, and you've earned a commission!
                              </p>
                              <div style="background:white;border-left:4px solid #5DB347;padding:16px;border-radius:4px;margin:16px 0">
                                <p style="margin:0;color:#1B2A4A"><strong>Commission:</strong> $${commissionAmount.toFixed(2)} (${ratePercent}%)</p>
                                <p style="margin:6px 0 0;color:#1B2A4A"><strong>Status:</strong> Pending payout</p>
                              </div>
                              <a href="https://africanfarmingunion.org/ambassador" style="display:inline-block;background:#5DB347;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View Dashboard</a>
                            </div>
                          </div>`,
                          FROM
                        );
                      } catch (emailErr) {
                        console.error('[webhook membership] ambassador email failed:', emailErr);
                      }
                    }
                  }
                }
              }
            } catch (commissionErr) {
              console.error('[webhook membership] commission handler error:', commissionErr);
            }

            // Welcome email + payment confirmation
            if (customerEmail) {
              try {
                await sendWelcomeSeriesEmail(customerEmail, customerName, 1);
              } catch (e) {
                console.error('[webhook membership] welcome email failed:', e);
              }
              try {
                const amount = session.amount_total ? `$${(session.amount_total / 100).toFixed(2)}` : 'N/A';
                await sendMembershipPaymentConfirmationEmail(customerEmail, customerName, tier, amount);
              } catch (e) {
                console.error('[webhook membership] payment confirmation failed:', e);
              }
            }

            // Admin notification
            try {
              const adminHtml = `<div style="font-family:Arial,sans-serif;padding:20px">
                  <h2 style="color:#1B2A4A">New Paid Membership</h2>
                  <p><strong>${customerName}</strong> just signed up for the <strong>${tier}</strong> tier.</p>
                  <p>Email: ${customerEmail || 'N/A'}</p>
                  <p>User ID: ${userId || 'N/A'}</p>
                  <p>Stripe Subscription: ${subscriptionId || 'N/A'}</p>
                  <a href="https://africanfarmingunion.org/admin/members" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
                </div>`;
              for (const adminEmail of NOTIFY_TO) {
                await sendEmail(adminEmail, `New ${tier} Member: ${customerName}`, adminHtml, FROM);
              }
            } catch (e) {
              console.error('[webhook membership] admin notification failed:', e);
            }
          } catch (e) {
            console.error('[webhook membership] handler exception:', e);
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

          // Increment farmer's sponsor count atomically
          if (farmerId) {
            await adminClient.rpc('increment_farmer_sponsors', {
              p_farmer_id: farmerId,
              p_amount: (session.amount_total || 0) / 100,
            });
          }
        }

        // ── Marketplace order ───────────────────────────────────────
        if (paymentType === 'order') {
          const orderId = meta.order_id;
          const supplierId = meta.supplier_id;
          const orderItemId = meta.order_item_id;

          if (orderId) {
            // 1) Mark order as confirmed (order_status enum: pending|confirmed|processing|shipped|delivered|cancelled|refunded — 'paid' is invalid)
            const { data: order, error: orderUpdErr } = await adminClient
              .from('orders')
              .update({
                status: 'confirmed',
                updated_at: new Date().toISOString(),
              })
              .eq('id', orderId)
              .select('id, total, currency, member_id')
              .single();

            if (orderUpdErr) {
              console.error('[marketplace order] failed to mark order confirmed:', orderUpdErr);
            }

            const orderTotal = Number(order?.total ?? (session.amount_total || 0) / 100);

            // Look up real commission_rate from suppliers table (fallback 10%)
            // Override with subscription plan's commission_rate if supplier has an active sub
            let commissionRate = 10;
            if (supplierId) {
              const { data: supplierRate } = await adminClient
                .from('suppliers')
                .select('commission_rate, subscription_plan_slug, subscription_status')
                .eq('id', supplierId)
                .maybeSingle();
              if (supplierRate?.commission_rate != null) {
                commissionRate = Number(supplierRate.commission_rate) || 10;
              }
              // If active subscription, prefer plan's commission rate
              if (
                supplierRate?.subscription_plan_slug &&
                ['active', 'trialing'].includes(supplierRate.subscription_status || '')
              ) {
                const { data: planRate } = await adminClient
                  .from('supplier_subscription_plans')
                  .select('commission_rate')
                  .eq('slug', supplierRate.subscription_plan_slug)
                  .maybeSingle();
                if (planRate?.commission_rate != null) {
                  commissionRate = Number(planRate.commission_rate) || commissionRate;
                }
              }
            }
            const commissionAmount = +(orderTotal * (commissionRate / 100)).toFixed(2);

            // 2) Insert commission row
            if (supplierId) {
              await adminClient.from('commissions').insert({
                supplier_id: supplierId,
                order_id: orderId,
                order_item_id: orderItemId || null,
                sale_amount: orderTotal,
                commission_rate: commissionRate,
                commission_amount: commissionAmount,
                status: 'pending',
              });
            }

            // 3) Notify supplier + buyer
            try {
              const { data: supplier } = supplierId
                ? await adminClient
                    .from('suppliers')
                    .select('email, company_name')
                    .eq('id', supplierId)
                    .maybeSingle()
                : { data: null };

              const buyerEmail =
                session.customer_details?.email || session.customer_email || null;
              const buyerName = session.customer_details?.name || 'Customer';

              if (supplier?.email) {
                await sendEmail(
                  supplier.email,
                  `New AFU Marketplace Order — $${orderTotal.toFixed(2)}`,
                  `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                    <div style="background:#1B2A4A;padding:24px;text-align:center">
                      <h1 style="color:#5DB347;margin:0;font-size:22px">New Order Received</h1>
                    </div>
                    <div style="padding:24px;background:#f8faf6">
                      <p style="color:#1B2A4A">Hello ${supplier.company_name || 'Supplier'},</p>
                      <p style="color:#333;font-size:15px;line-height:1.6">
                        You have a new paid order on the AFU Marketplace.
                      </p>
                      <div style="background:white;border-left:4px solid #5DB347;padding:16px;border-radius:4px;margin:16px 0">
                        <p style="margin:0;color:#1B2A4A"><strong>Order total:</strong> $${orderTotal.toFixed(2)}</p>
                        <p style="margin:6px 0 0;color:#1B2A4A"><strong>Buyer:</strong> ${buyerName}</p>
                        <p style="margin:6px 0 0;color:#1B2A4A"><strong>Commission (${commissionRate}%):</strong> $${commissionAmount.toFixed(2)}</p>
                      </div>
                      <a href="https://africanfarmingunion.org/supplier/orders" style="display:inline-block;background:#5DB347;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View Order</a>
                    </div>
                  </div>`,
                  FROM
                );
              }

              if (buyerEmail) {
                await sendEmail(
                  buyerEmail,
                  `Order Confirmation — AFU Marketplace`,
                  `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
                    <div style="background:#1B2A4A;padding:24px;text-align:center">
                      <h1 style="color:#5DB347;margin:0;font-size:22px">Thank you for your order!</h1>
                    </div>
                    <div style="padding:24px;background:#f8faf6">
                      <p style="color:#333;font-size:15px;line-height:1.6">
                        Your AFU Marketplace order of <strong>$${orderTotal.toFixed(2)}</strong> has been confirmed and the supplier has been notified.
                      </p>
                      <a href="https://africanfarmingunion.org/farmer/orders" style="display:inline-block;background:#5DB347;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View My Orders</a>
                    </div>
                  </div>`,
                  FROM
                );
              }
            } catch (e) {
              console.error('[marketplace order] email send failed:', e);
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
              await sendEmail(
                donorEmail,
                'Thank You for Your Donation to AFU!',
                `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
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
                FROM
              );
            } catch (err) { console.error("[payments/webhook/stripe] donation thank-you email non-critical:", err); }
          }

          // Notify Devon + Peter
          try {
            const donationAdminHtml = `<div style="font-family:Arial,sans-serif;padding:20px">
                <h2 style="color:#1B2A4A">New Donation Received</h2>
                <p><strong>${donorName}</strong> donated <strong>$${amount}</strong>${isMonthly ? ' (monthly)' : ''} to ${program}</p>
                <p>Email: ${donorEmail || 'N/A'}</p>
                <a href="https://africanfarmingunion.org/admin/payments" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
              </div>`;
            for (const adminEmail of NOTIFY_TO) {
              await sendEmail(adminEmail, `New Donation: $${amount} from ${donorName}`, donationAdminHtml, FROM);
            }
          } catch (err) { console.error("[payments/webhook/stripe] donation admin notification non-critical:", err); }
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

      // ── Subscription created (new supplier sub) ─────────────────────────
      case 'customer.subscription.created': {
        try {
          const subscription = event.data.object as Stripe.Subscription;
          if (subscription.metadata?.type === 'supplier_subscription') {
            const { supplierId, planSlug } = await upsertSupplierSubscription(
              adminClient,
              subscription
            );
            // Send welcome / confirmation email
            if (supplierId && planSlug) {
              try {
                const { data: supplier } = await adminClient
                  .from('suppliers')
                  .select('email, company_name')
                  .eq('id', supplierId)
                  .maybeSingle();
                const { data: plan } = await adminClient
                  .from('supplier_subscription_plans')
                  .select('name, price_monthly')
                  .eq('slug', planSlug)
                  .maybeSingle();
                if (supplier?.email && plan) {
                  await sendSubscriptionConfirmation(
                    supplier.email,
                    supplier.company_name || 'Supplier',
                    plan.name,
                    Number(plan.price_monthly)
                  );
                }
              } catch (e) {
                console.error('[supplier subscription.created] email failed:', e);
              }
            }
          }
        } catch (e) {
          console.error('[customer.subscription.created] handler error:', e);
        }
        break;
      }

      // ── Subscription updated (status, plan changes) ──────────────────────
      case 'customer.subscription.updated': {
        try {
          const subscription = event.data.object as Stripe.Subscription;
          // Try to detect supplier subscription via metadata or customer match
          const isSupplier =
            subscription.metadata?.type === 'supplier_subscription' ||
            (await (async () => {
              const customerId =
                typeof subscription.customer === 'string'
                  ? subscription.customer
                  : subscription.customer?.id;
              if (!customerId) return false;
              const { data } = await adminClient
                .from('suppliers')
                .select('id')
                .eq('stripe_customer_id', customerId)
                .maybeSingle();
              return !!data;
            })());

          if (isSupplier) {
            await upsertSupplierSubscription(adminClient, subscription);
          }
        } catch (e) {
          console.error('[customer.subscription.updated] handler error:', e);
        }
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const subId = subscription.id;

        // Deactivate member subscription
        try {
          await adminClient
            .from('members')
            .update({ status: 'inactive', updated_at: new Date().toISOString() })
            .eq('stripe_subscription_id', subId);
        } catch (e) {
          console.error('[subscription.deleted] members update failed:', e);
        }

        // Deactivate sponsorship subscription
        try {
          await adminClient
            .from('sponsorships')
            .update({ status: 'cancelled' })
            .eq('stripe_subscription_id', subId);
        } catch (e) {
          console.error('[subscription.deleted] sponsorships update failed:', e);
        }

        // Supplier subscription cancellation
        try {
          const { data: subRow } = await adminClient
            .from('supplier_subscriptions')
            .select('id, supplier_id, plan_slug, current_period_end')
            .eq('stripe_subscription_id', subId)
            .maybeSingle();

          if (subRow) {
            const canceledAtIso = subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000).toISOString()
              : new Date().toISOString();

            await adminClient
              .from('supplier_subscriptions')
              .update({
                status: 'canceled',
                canceled_at: canceledAtIso,
                updated_at: new Date().toISOString(),
              })
              .eq('id', subRow.id);

            await adminClient
              .from('suppliers')
              .update({
                subscription_plan_slug: null,
                subscription_status: 'canceled',
                subscription_current_period_end: null,
              })
              .eq('id', subRow.supplier_id);

            // Send cancellation email
            try {
              const { data: supplier } = await adminClient
                .from('suppliers')
                .select('email, company_name')
                .eq('id', subRow.supplier_id)
                .maybeSingle();
              const { data: plan } = await adminClient
                .from('supplier_subscription_plans')
                .select('name')
                .eq('slug', subRow.plan_slug)
                .maybeSingle();
              if (supplier?.email) {
                await sendSubscriptionCanceled(
                  supplier.email,
                  supplier.company_name || 'Supplier',
                  plan?.name || subRow.plan_slug,
                  subRow.current_period_end
                );
              }
            } catch (e) {
              console.error('[subscription.deleted] supplier email failed:', e);
            }
          }
        } catch (e) {
          console.error('[subscription.deleted] supplier update failed:', e);
        }

        break;
      }

      // ── Invoice payment succeeded ────────────────────────────────────────
      case 'invoice.payment_succeeded': {
        try {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId =
            typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer?.id || null;
          const invoiceAny = invoice as unknown as { subscription?: string | { id: string } | null };
          const subscriptionId =
            typeof invoiceAny.subscription === 'string'
              ? invoiceAny.subscription
              : invoiceAny.subscription?.id || null;

          if (customerId) {
            // Find supplier
            const { data: supplier } = await adminClient
              .from('suppliers')
              .select('id, email, company_name, subscription_plan_slug')
              .eq('stripe_customer_id', customerId)
              .maybeSingle();

            if (supplier) {
              // Find local subscription row
              let subscriptionRowId: string | null = null;
              if (subscriptionId) {
                const { data: subRow } = await adminClient
                  .from('supplier_subscriptions')
                  .select('id')
                  .eq('stripe_subscription_id', subscriptionId)
                  .maybeSingle();
                if (subRow) subscriptionRowId = subRow.id;
              }

              await adminClient.from('supplier_invoices').upsert(
                {
                  supplier_id: supplier.id,
                  subscription_id: subscriptionRowId,
                  stripe_invoice_id: invoice.id,
                  amount: ((invoice.amount_paid || 0) / 100),
                  currency: invoice.currency || 'usd',
                  status: 'paid',
                  invoice_pdf: invoice.invoice_pdf || null,
                  hosted_invoice_url: invoice.hosted_invoice_url || null,
                  period_start: invoice.period_start
                    ? new Date(invoice.period_start * 1000).toISOString()
                    : null,
                  period_end: invoice.period_end
                    ? new Date(invoice.period_end * 1000).toISOString()
                    : null,
                  paid_at: invoice.status_transitions?.paid_at
                    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                    : new Date().toISOString(),
                },
                { onConflict: 'stripe_invoice_id' }
              );

              // Email
              try {
                if (supplier.email) {
                  await sendPaymentReceived(
                    supplier.email,
                    supplier.company_name || 'Supplier',
                    (invoice.amount_paid || 0) / 100,
                    invoice.hosted_invoice_url || ''
                  );
                }
              } catch (e) {
                console.error('[invoice.payment_succeeded] email failed:', e);
              }
            }
          }
        } catch (e) {
          console.error('[invoice.payment_succeeded] handler error:', e);
        }
        break;
      }

      // ── Invoice payment failed ───────────────────────────────────────────
      case 'invoice.payment_failed': {
        try {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId =
            typeof invoice.customer === 'string'
              ? invoice.customer
              : invoice.customer?.id || null;
          const invoiceAny = invoice as unknown as { subscription?: string | { id: string } | null };
          const subscriptionId =
            typeof invoiceAny.subscription === 'string'
              ? invoiceAny.subscription
              : invoiceAny.subscription?.id || null;

          if (customerId) {
            const { data: supplier } = await adminClient
              .from('suppliers')
              .select('id, email, company_name')
              .eq('stripe_customer_id', customerId)
              .maybeSingle();

            if (supplier) {
              let subscriptionRowId: string | null = null;
              if (subscriptionId) {
                const { data: subRow } = await adminClient
                  .from('supplier_subscriptions')
                  .select('id')
                  .eq('stripe_subscription_id', subscriptionId)
                  .maybeSingle();
                if (subRow) subscriptionRowId = subRow.id;
              }

              await adminClient.from('supplier_invoices').upsert(
                {
                  supplier_id: supplier.id,
                  subscription_id: subscriptionRowId,
                  stripe_invoice_id: invoice.id,
                  amount: ((invoice.amount_due || 0) / 100),
                  currency: invoice.currency || 'usd',
                  status: 'open',
                  invoice_pdf: invoice.invoice_pdf || null,
                  hosted_invoice_url: invoice.hosted_invoice_url || null,
                  period_start: invoice.period_start
                    ? new Date(invoice.period_start * 1000).toISOString()
                    : null,
                  period_end: invoice.period_end
                    ? new Date(invoice.period_end * 1000).toISOString()
                    : null,
                },
                { onConflict: 'stripe_invoice_id' }
              );

              try {
                if (supplier.email) {
                  await sendPaymentFailed(
                    supplier.email,
                    supplier.company_name || 'Supplier',
                    (invoice.amount_due || 0) / 100,
                    invoice.hosted_invoice_url || ''
                  );
                }
              } catch (e) {
                console.error('[invoice.payment_failed] email failed:', e);
              }
            }
          }
        } catch (e) {
          console.error('[invoice.payment_failed] handler error:', e);
        }
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

    // Mark event as completed in dedup log
    await adminClient
      .from('stripe_event_log')
      .update({ status: 'completed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing Stripe webhook:', err);
    // Mark failed so Stripe retries can be reprocessed if needed
    await adminClient
      .from('stripe_event_log')
      .update({ status: 'failed', processed_at: new Date().toISOString() })
      .eq('stripe_event_id', event.id);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
