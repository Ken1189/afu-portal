/**
 * Lifecycle Email Functions
 *
 * Centralised email senders for key member lifecycle events:
 * loan approval/rejection, KYC, order status, membership expiry, welcome series.
 *
 * All functions use Resend via the shared `sendEmail` helper and the AFU branded
 * HTML wrapper.  Errors are logged (via logEmailError) but never thrown so that
 * calling code is not disrupted by transient email failures.
 */

import { sendEmail } from './resend';
import { logEmailError } from './log-error';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PORTAL_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://africanfarmingunion.org';
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

// ---------------------------------------------------------------------------
// Branded HTML wrapper
// ---------------------------------------------------------------------------

function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;">
    <tr><td align="center" style="padding:24px 0;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1B2A4A;padding:24px 32px;text-align:center;">
            <img src="${PORTAL_URL}/afu-logo.svg" alt="AFU" width="48" height="48" style="display:inline-block;vertical-align:middle;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;margin-left:12px;vertical-align:middle;">African Farming Union</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 32px;text-align:center;font-size:12px;color:#6b7280;">
            African Farming Union &bull; <a href="${PORTAL_URL}" style="color:#2D7A1E;">africanfarmingunion.org</a><br>
            You received this email because you are a registered AFU member.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function cta(label: string, href: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background:#2D7A1E;border-radius:6px;padding:12px 28px;">
      <a href="${href}" style="color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;">${label}</a>
    </td></tr>
  </table>`;
}

// ---------------------------------------------------------------------------
// 1. Loan Approval
// ---------------------------------------------------------------------------

export async function sendLoanApprovalEmail(
  memberEmail: string,
  memberName: string,
  loanAmount: number,
  tier: string,
): Promise<void> {
  try {
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Your Loan Has Been Approved</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        Great news! Your loan application has been <strong style="color:#2D7A1E;">approved</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:12px 16px;background:#f0fdf4;border-radius:6px;">
            <strong style="color:#1B2A4A;">Loan Amount:</strong>
            <span style="color:#2D7A1E;font-size:18px;font-weight:700;margin-left:8px;">$${loanAmount.toLocaleString()}</span>
          </td>
        </tr>
        <tr><td style="padding:4px;"></td></tr>
        <tr>
          <td style="padding:12px 16px;background:#f0fdf4;border-radius:6px;">
            <strong style="color:#1B2A4A;">Membership Tier:</strong>
            <span style="margin-left:8px;">${tier}</span>
          </td>
        </tr>
      </table>
      <p style="color:#374151;line-height:1.6;">
        Funds will be disbursed to your registered payment method. Log in to view repayment details.
      </p>
      ${cta('View Loan Details', `${PORTAL_URL}/farm/financing`)}
    `);

    await sendEmail(memberEmail, 'Your loan has been approved', html, FROM);
  } catch (err) {
    await logEmailError('sendLoanApprovalEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 1b. Loan Disbursed
// ---------------------------------------------------------------------------

export async function sendLoanDisbursedEmail(
  memberEmail: string,
  memberName: string,
  loanAmount: number,
  currency: string,
  monthlyPayment: number,
  firstDueDate: string,
): Promise<void> {
  try {
    const formattedDue = new Date(firstDueDate).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Your Loan Has Been Disbursed</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        Your loan of <strong style="color:#2D7A1E;">${currency} ${loanAmount.toLocaleString()}</strong>
        has been credited to your AFU wallet and is available for use immediately.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:12px 16px;background:#f0fdf4;border-radius:6px;">
          <strong style="color:#1B2A4A;">Monthly Payment:</strong>
          <span style="color:#2D7A1E;margin-left:8px;">${currency} ${monthlyPayment.toLocaleString(undefined,{maximumFractionDigits:2})}</span>
        </td></tr>
        <tr><td style="padding:4px;"></td></tr>
        <tr><td style="padding:12px 16px;background:#f0fdf4;border-radius:6px;">
          <strong style="color:#1B2A4A;">First Due Date:</strong>
          <span style="margin-left:8px;">${formattedDue}</span>
        </td></tr>
      </table>
      <p style="color:#374151;line-height:1.6;">
        Your repayment schedule is now available in your dashboard.
      </p>
      ${cta('View Wallet & Schedule', `${PORTAL_URL}/farm/financing`)}
    `);
    await sendEmail(memberEmail, 'Your loan has been disbursed', html, FROM);
  } catch (err) {
    await logEmailError('sendLoanDisbursedEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 2. Loan Rejection
// ---------------------------------------------------------------------------

export async function sendLoanRejectionEmail(
  memberEmail: string,
  memberName: string,
  reason: string,
): Promise<void> {
  try {
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Loan Application Update</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        After careful review, we are unable to approve your loan application at this time.
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:12px 16px;background:#fef2f2;border-radius:6px;color:#7f1d1d;">
            <strong>Reason:</strong> ${reason}
          </td>
        </tr>
      </table>
      <p style="color:#374151;line-height:1.6;">
        You can improve your eligibility by increasing your credit score, completing training courses,
        or upgrading your membership tier. Feel free to reapply once conditions are met.
      </p>
      ${cta('View Financing Options', `${PORTAL_URL}/farm/financing`)}
    `);

    await sendEmail(memberEmail, 'Loan application update', html, FROM);
  } catch (err) {
    await logEmailError('sendLoanRejectionEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 3. KYC Approval
// ---------------------------------------------------------------------------

export async function sendKycApprovalEmail(
  memberEmail: string,
  memberName: string,
): Promise<void> {
  try {
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">KYC Verification Complete</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        Your identity verification (KYC) has been <strong style="color:#2D7A1E;">successfully completed</strong>.
      </p>
      <p style="color:#374151;line-height:1.6;">
        You now have full access to financing, payments, and marketplace features based on your membership tier.
      </p>
      ${cta('Go to Dashboard', `${PORTAL_URL}/farm`)}
    `);

    await sendEmail(memberEmail, 'KYC verification complete', html, FROM);
  } catch (err) {
    await logEmailError('sendKycApprovalEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 4. Order Status Update
// ---------------------------------------------------------------------------

export async function sendOrderStatusEmail(
  memberEmail: string,
  memberName: string,
  orderId: string,
  status: string,
): Promise<void> {
  try {
    const statusColors: Record<string, string> = {
      confirmed: '#2D7A1E',
      processing: '#ca8a04',
      shipped: '#2563eb',
      delivered: '#2D7A1E',
      cancelled: '#dc2626',
      refunded: '#6b7280',
    };
    const color = statusColors[status] ?? '#374151';
    const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Order Status Update</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        Your order <strong>#${orderId}</strong> has been updated:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr>
          <td style="padding:12px 16px;background:#f0fdf4;border-radius:6px;text-align:center;">
            <span style="color:${color};font-size:18px;font-weight:700;">${statusLabel}</span>
          </td>
        </tr>
      </table>
      ${cta('View Order', `${PORTAL_URL}/farm/warehouse`)}
    `);

    await sendEmail(memberEmail, 'Order status update', html, FROM);
  } catch (err) {
    await logEmailError('sendOrderStatusEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 5. Membership Expiry Warning (7 days)
// ---------------------------------------------------------------------------

export async function sendMembershipExpiryWarningEmail(
  memberEmail: string,
  memberName: string,
  expiryDate: string,
  tier: string,
): Promise<void> {
  try {
    const formattedDate = new Date(expiryDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Your Membership Expires Soon</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        Your <strong>${tier}</strong> membership with the African Farming Union expires on
        <strong style="color:#dc2626;">${formattedDate}</strong>.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Renew now to keep uninterrupted access to financing, marketplace, insurance, and all your
        tier benefits.
      </p>
      ${cta('Renew Membership', `${PORTAL_URL}/farm/membership`)}
      <p style="color:#6b7280;font-size:13px;margin-top:8px;">
        If you do not renew, your account will be downgraded and some features may become unavailable.
      </p>
    `);

    await sendEmail(memberEmail, 'Your membership expires in 7 days', html, FROM);
  } catch (err) {
    await logEmailError('sendMembershipExpiryWarningEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 6. Membership Expired
// ---------------------------------------------------------------------------

export async function sendMembershipExpiredEmail(
  memberEmail: string,
  memberName: string,
  tier: string,
): Promise<void> {
  try {
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Your Membership Has Expired</h2>
      <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
      <p style="color:#374151;line-height:1.6;">
        Your <strong>${tier}</strong> membership has expired. Some features are now restricted.
      </p>
      <p style="color:#374151;line-height:1.6;">
        You can still access basic tools, but financing, marketplace, and advanced features
        require an active membership. Renew today to restore full access.
      </p>
      ${cta('Renew Now', `${PORTAL_URL}/farm/membership`)}
    `);

    await sendEmail(memberEmail, 'Your membership has expired', html, FROM);
  } catch (err) {
    await logEmailError('sendMembershipExpiredEmail', err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 7. Welcome Series (emails 1, 2, 3)
// ---------------------------------------------------------------------------

const WELCOME_SUBJECTS: Record<number, string> = {
  1: 'Welcome to the African Farming Union!',
  2: 'Get the most out of your AFU membership',
  3: 'Your next steps with AFU',
};

export async function sendWelcomeSeriesEmail(
  memberEmail: string,
  memberName: string,
  emailNumber: number,
): Promise<void> {
  try {
    const subject = WELCOME_SUBJECTS[emailNumber] ?? `Welcome to AFU (${emailNumber})`;

    let body: string;

    switch (emailNumber) {
      case 1:
        body = `
          <h2 style="color:#1B2A4A;margin:0 0 16px;">Welcome to AFU, ${memberName}!</h2>
          <p style="color:#374151;line-height:1.6;">
            We are thrilled to have you join the African Farming Union. You are now part of a
            community of farmers across Africa working together for a more prosperous future.
          </p>
          <p style="color:#374151;line-height:1.6;">Here is what you can do right away:</p>
          <ul style="color:#374151;line-height:1.8;">
            <li>Check real-time <strong>weather forecasts</strong> for your region</li>
            <li>Browse <strong>market prices</strong> for your crops</li>
            <li>Start the <strong>Farm Basics</strong> training course to unlock more features</li>
          </ul>
          ${cta('Explore Your Dashboard', `${PORTAL_URL}/farm`)}
        `;
        break;

      case 2:
        body = `
          <h2 style="color:#1B2A4A;margin:0 0 16px;">Unlock More Features</h2>
          <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
          <p style="color:#374151;line-height:1.6;">
            Did you know you can unlock powerful tools by completing short training courses?
          </p>
          <ul style="color:#374151;line-height:1.8;">
            <li><strong>Farm Journal</strong> &mdash; keep digital records of your activities</li>
            <li><strong>Cooperatives</strong> &mdash; join or form a farming cooperative</li>
            <li><strong>Crop Management</strong> &mdash; track planting and harvests</li>
          </ul>
          <p style="color:#374151;line-height:1.6;">
            Complete the <strong>Farm Basics</strong> course to reach Sprout tier and access these features.
          </p>
          ${cta('Start Training', `${PORTAL_URL}/farm/training`)}
        `;
        break;

      case 3:
      default:
        body = `
          <h2 style="color:#1B2A4A;margin:0 0 16px;">Your Next Steps</h2>
          <p style="color:#374151;line-height:1.6;">Hi ${memberName},</p>
          <p style="color:#374151;line-height:1.6;">
            Here are a few things to help you get the most from your membership:
          </p>
          <ul style="color:#374151;line-height:1.8;">
            <li>Complete your <strong>farm profile</strong> with crops and farm size</li>
            <li>Upgrade your tier to access <strong>financing and insurance</strong></li>
            <li>Connect with other farmers in your <strong>region</strong></li>
          </ul>
          <p style="color:#374151;line-height:1.6;">
            Need help? Our support team is always here for you.
          </p>
          ${cta('Complete Your Profile', `${PORTAL_URL}/farm/profile`)}
        `;
        break;
    }

    const html = wrap(body);
    await sendEmail(memberEmail, subject, html, FROM);
  } catch (err) {
    await logEmailError(`sendWelcomeSeriesEmail(#${emailNumber})`, err, memberEmail);
  }
}

// ---------------------------------------------------------------------------
// 8. Newsletter Confirmation
// ---------------------------------------------------------------------------

export async function sendNewsletterConfirmationEmail(
  email: string,
): Promise<void> {
  try {
    const subject = 'Welcome to the AFU Newsletter';
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">You're subscribed!</h2>
      <p style="color:#374151;line-height:1.6;">
        Thank you for joining the African Farming Union newsletter. You'll receive updates on:
      </p>
      <ul style="color:#374151;line-height:1.8;padding-left:20px;">
        <li>Market prices and commodity trends</li>
        <li>New features and platform updates</li>
        <li>Farming tips and best practices</li>
        <li>Training opportunities and events</li>
      </ul>
      <p style="color:#374151;line-height:1.6;">
        Want to do more? Join our community and unlock financing, inputs, and trade opportunities.
      </p>
      ${cta('Explore AFU', PORTAL_URL)}
    `);
    await sendEmail(email, subject, html, FROM);
  } catch (err) {
    await logEmailError('sendNewsletterConfirmationEmail', err, email);
  }
}

// ---------------------------------------------------------------------------
// 9. Membership Payment Confirmation (tier upgrade)
// ---------------------------------------------------------------------------

export async function sendMembershipPaymentConfirmationEmail(
  email: string,
  name: string,
  tier: string,
  amount: string,
): Promise<void> {
  try {
    const subject = `Your ${tier} membership is confirmed`;
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Payment Received</h2>
      <p style="color:#374151;line-height:1.6;">
        Hi ${name},
      </p>
      <p style="color:#374151;line-height:1.6;">
        Your payment of <strong>${amount}</strong> for the <strong>${tier}</strong> membership tier has been processed successfully.
      </p>
      <table style="margin:16px 0;border-collapse:collapse;width:100%;">
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Membership Tier</td>
          <td style="padding:8px 0;font-weight:600;color:#1B2A4A;border-bottom:1px solid #e5e7eb;text-align:right;">${tier}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;border-bottom:1px solid #e5e7eb;">Amount Paid</td>
          <td style="padding:8px 0;font-weight:600;color:#1B2A4A;border-bottom:1px solid #e5e7eb;text-align:right;">${amount}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;color:#6b7280;">Status</td>
          <td style="padding:8px 0;font-weight:600;color:#2D7A1E;text-align:right;">Active</td>
        </tr>
      </table>
      <p style="color:#374151;line-height:1.6;">
        You now have full access to all ${tier}-tier features including financing, insurance, and marketplace benefits.
      </p>
      ${cta('Go to Dashboard', `${PORTAL_URL}/farm`)}
    `);
    await sendEmail(email, subject, html, FROM);
  } catch (err) {
    await logEmailError('sendMembershipPaymentConfirmationEmail', err, email);
  }
}

// ---------------------------------------------------------------------------
// 10. Tier Downgrade Notification
// ---------------------------------------------------------------------------

export async function sendTierDowngradeEmail(
  email: string,
  name: string,
  previousTier: string,
): Promise<void> {
  try {
    const subject = 'Your AFU membership has been downgraded';
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Membership Update</h2>
      <p style="color:#374151;line-height:1.6;">
        Hi ${name},
      </p>
      <p style="color:#374151;line-height:1.6;">
        Your <strong>${previousTier}</strong> membership expired more than 30 days ago and has been automatically downgraded to the <strong>Free</strong> tier.
      </p>
      <p style="color:#374151;line-height:1.6;">
        As a Free member, you'll still have access to basic features, but some capabilities are now restricted:
      </p>
      <ul style="color:#374151;line-height:1.8;padding-left:20px;">
        <li>Financing and loan applications</li>
        <li>Insurance products</li>
        <li>Full marketplace access</li>
        <li>Export and trade finance tools</li>
      </ul>
      <p style="color:#374151;line-height:1.6;">
        Renew your membership to regain full access to everything AFU offers.
      </p>
      ${cta('Renew Membership', `${PORTAL_URL}/memberships`)}
    `);
    await sendEmail(email, subject, html, FROM);
  } catch (err) {
    await logEmailError('sendTierDowngradeEmail', err, email);
  }
}

// ---------------------------------------------------------------------------
// 11. Job Application Received
// ---------------------------------------------------------------------------

export async function sendJobApplicationReceivedEmail(
  email: string,
  name: string,
  jobTitle: string,
): Promise<void> {
  try {
    const subject = `Application received: ${jobTitle}`;
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">We received your application</h2>
      <p style="color:#374151;line-height:1.6;">
        Hi ${name},
      </p>
      <p style="color:#374151;line-height:1.6;">
        Thank you for applying for the <strong>${jobTitle}</strong> position at the African Farming Union.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Our team will review your application and get back to you within <strong>5-7 business days</strong>.
        If your profile matches our needs, we'll reach out to schedule a conversation.
      </p>
      <p style="color:#374151;line-height:1.6;">
        In the meantime, you can learn more about what we do on our website.
      </p>
      ${cta('Visit AFU', PORTAL_URL)}
    `);
    await sendEmail(email, subject, html, FROM);
  } catch (err) {
    await logEmailError('sendJobApplicationReceivedEmail', err, email);
  }
}

// ---------------------------------------------------------------------------
// 12. Loan Application Received (auto-reply)
// ---------------------------------------------------------------------------

export async function sendLoanApplicationReceivedEmail(
  email: string,
  name: string,
  amount: number,
): Promise<void> {
  try {
    const subject = 'Your loan application has been received';
    const html = wrap(`
      <h2 style="color:#1B2A4A;margin:0 0 16px;">Loan Application Received</h2>
      <p style="color:#374151;line-height:1.6;">
        Hi ${name},
      </p>
      <p style="color:#374151;line-height:1.6;">
        We've received your loan application for <strong>$${amount.toLocaleString()}</strong>.
      </p>
      <p style="color:#374151;line-height:1.6;">
        Our credit team will review your application, farming history, and membership standing.
        You can expect a decision within <strong>3-5 business days</strong>.
      </p>
      <p style="color:#374151;line-height:1.6;">
        You can check the status of your application any time in your dashboard.
      </p>
      ${cta('View Application Status', `${PORTAL_URL}/farm/financing`)}
    `);
    await sendEmail(email, subject, html, FROM);
  } catch (err) {
    await logEmailError('sendLoanApplicationReceivedEmail', err, email);
  }
}
