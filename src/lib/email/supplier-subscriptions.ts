// Supplier subscription lifecycle emails (Resend)
import { Resend } from 'resend';

const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://africanfarmingunion.org';

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const wrap = (title: string, body: string) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:#1B2A4A;padding:24px;text-align:center">
    <h1 style="color:#5DB347;margin:0;font-size:22px">${title}</h1>
  </div>
  <div style="padding:24px;background:#f8faf6;color:#1B2A4A;font-size:15px;line-height:1.6">
    ${body}
  </div>
  <div style="padding:12px;text-align:center;color:#999;font-size:12px">
    African Farming Union | africanfarmingunion.org
  </div>
</div>`;

export async function sendSubscriptionConfirmation(
  to: string,
  companyName: string,
  planName: string,
  priceMonthly: number
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Welcome to AFU ${planName}!`,
      html: wrap(
        `Welcome to AFU ${planName}`,
        `<p>Hello ${companyName},</p>
         <p>Your <strong>${planName}</strong> subscription is now active at <strong>$${priceMonthly.toFixed(2)}/month</strong>.</p>
         <p>You can now list more products, get featured placement, and grow your sales on the AFU Marketplace.</p>
         <p><a href="${SITE}/supplier/billing" style="display:inline-block;background:#5DB347;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Manage Billing</a></p>`
      ),
    });
  } catch (e) {
    console.error('[sendSubscriptionConfirmation] failed:', e);
  }
}

export async function sendPaymentReceived(
  to: string,
  companyName: string,
  amount: number,
  invoiceUrl: string
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Payment received: $${amount.toFixed(2)}`,
      html: wrap(
        'Payment Received',
        `<p>Hello ${companyName},</p>
         <p>We received your payment of <strong>$${amount.toFixed(2)}</strong> for your AFU supplier subscription. Thank you!</p>
         ${invoiceUrl ? `<p><a href="${invoiceUrl}" style="display:inline-block;background:#5DB347;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">View Invoice</a></p>` : ''}`
      ),
    });
  } catch (e) {
    console.error('[sendPaymentReceived] failed:', e);
  }
}

export async function sendPaymentFailed(
  to: string,
  companyName: string,
  amount: number,
  invoiceUrl: string
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Action required: Your AFU payment failed',
      html: wrap(
        'Payment Failed',
        `<p>Hello ${companyName},</p>
         <p>We were unable to process your payment of <strong>$${amount.toFixed(2)}</strong> for your AFU supplier subscription.</p>
         <p>Please update your payment method to keep your subscription active and avoid losing access to your listings.</p>
         <p><a href="${SITE}/supplier/billing" style="display:inline-block;background:#d97706;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Update Payment Method</a></p>
         ${invoiceUrl ? `<p style="margin-top:12px"><a href="${invoiceUrl}" style="color:#5DB347">View invoice details</a></p>` : ''}`
      ),
    });
  } catch (e) {
    console.error('[sendPaymentFailed] failed:', e);
  }
}

export async function sendSubscriptionCanceled(
  to: string,
  companyName: string,
  planName: string,
  endDate: string | null
): Promise<void> {
  try {
    const resend = getResend();
    if (!resend) return;
    const endStr = endDate ? new Date(endDate).toLocaleDateString() : 'the end of your billing period';
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Your AFU subscription has been canceled',
      html: wrap(
        'Subscription Canceled',
        `<p>Hello ${companyName},</p>
         <p>Your <strong>${planName}</strong> subscription has been canceled and will end on <strong>${endStr}</strong>.</p>
         <p>You'll continue to have full access until then. If you change your mind, you can reactivate any time.</p>
         <p><a href="${SITE}/supplier/billing" style="display:inline-block;background:#5DB347;color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Manage Subscription</a></p>`
      ),
    });
  } catch (e) {
    console.error('[sendSubscriptionCanceled] failed:', e);
  }
}
