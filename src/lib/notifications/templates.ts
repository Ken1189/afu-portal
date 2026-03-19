/**
 * Notification Templates
 *
 * Each template function returns a channel-agnostic payload that the
 * notification engine can spread into a NotificationPayload. Templates
 * include optional channel-specific overrides (emailSubject, emailHtml,
 * smsBody) so every channel gets an optimized version of the message.
 */

// ---------------------------------------------------------------------------
// Shared HTML helpers
// ---------------------------------------------------------------------------

function emailWrapper(heading: string, bodyHtml: string, ctaUrl?: string, ctaLabel?: string): string {
  const ctaBlock =
    ctaUrl && ctaLabel
      ? `<div style="text-align:center;margin:24px 0">
           <a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;background-color:#0d9488;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px">
             ${ctaLabel}
           </a>
         </div>`
      : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5">
  <div style="max-width:560px;margin:0 auto;background:#ffffff">
    <div style="background:#1e293b;padding:20px 24px">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700">AFU Portal</h1>
    </div>
    <div style="padding:24px">
      <h2 style="margin:0 0 12px;color:#1e293b;font-size:18px">${heading}</h2>
      <div style="color:#374151;font-size:15px;line-height:1.6">${bodyHtml}</div>
      ${ctaBlock}
    </div>
    <div style="padding:16px 24px;background:#f9fafb;color:#9ca3af;font-size:12px;text-align:center">
      &copy; ${new Date().getFullYear()} African Farmers Union. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Template return type
// ---------------------------------------------------------------------------

export interface NotificationTemplate {
  title: string;
  body: string;
  emailSubject?: string;
  emailHtml?: string;
  smsBody?: string;
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

/** Payment confirmation */
export function paymentReceivedTemplate(
  amount: string,
  currency: string,
  reference: string,
): NotificationTemplate {
  const title = 'Payment Received';
  const body = `Your payment of ${currency} ${amount} has been received. Ref: ${reference}`;

  return {
    title,
    body,
    emailSubject: 'Payment Confirmation - AFU Portal',
    emailHtml: emailWrapper(
      title,
      `<p>Your payment of <strong>${currency} ${amount}</strong> has been successfully received.</p>
       <p>Reference: <strong>${reference}</strong></p>
       <p>Thank you for your payment. If you have any questions, please contact your cooperative administrator.</p>`,
    ),
    smsBody: `AFU: Payment of ${currency} ${amount} received. Ref: ${reference}`,
  };
}

/** Loan approval */
export function loanApprovedTemplate(
  amount: string,
  currency: string,
  reference: string,
): NotificationTemplate {
  const title = 'Loan Approved';
  const body = `Your loan application for ${currency} ${amount} has been approved. Ref: ${reference}`;

  return {
    title,
    body,
    emailSubject: 'Loan Approved - AFU Portal',
    emailHtml: emailWrapper(
      title,
      `<p>Congratulations! Your loan application for <strong>${currency} ${amount}</strong> has been approved.</p>
       <p>Reference: <strong>${reference}</strong></p>
       <p>Funds will be disbursed to your registered account. Please review the loan terms in your dashboard.</p>`,
      undefined,
      undefined,
    ),
    smsBody: `AFU: Loan of ${currency} ${amount} approved. Ref: ${reference}. Check your dashboard for details.`,
  };
}

/** Insurance claim status update */
export function insuranceClaimUpdateTemplate(
  claimId: string,
  status: string,
): NotificationTemplate {
  const title = 'Insurance Claim Update';
  const body = `Your insurance claim ${claimId} has been updated to: ${status}`;

  return {
    title,
    body,
    emailSubject: 'Insurance Claim Update - AFU Portal',
    emailHtml: emailWrapper(
      title,
      `<p>Your insurance claim <strong>${claimId}</strong> has a new status:</p>
       <p style="font-size:17px;font-weight:600;color:#0d9488">${status}</p>
       <p>Log in to your dashboard for full details and any required actions.</p>`,
    ),
    smsBody: `AFU: Claim ${claimId} updated to "${status}". Check your dashboard.`,
  };
}

/** Harvest reminder */
export function harvestReminderTemplate(
  plotName: string,
  daysLeft: number,
): NotificationTemplate {
  const title = 'Harvest Reminder';
  const dayWord = daysLeft === 1 ? 'day' : 'days';
  const body = `Your plot "${plotName}" is expected to be ready for harvest in ${daysLeft} ${dayWord}.`;

  return {
    title,
    body,
    emailSubject: 'Harvest Reminder - AFU Portal',
    emailHtml: emailWrapper(
      title,
      `<p>Your plot <strong>"${plotName}"</strong> is estimated to be ready for harvest in <strong>${daysLeft} ${dayWord}</strong>.</p>
       <p>Make sure your equipment and labour are prepared. Check the Farm Management section for detailed recommendations.</p>`,
    ),
    smsBody: `AFU: Plot "${plotName}" harvest in ${daysLeft} ${dayWord}. Prepare accordingly.`,
  };
}

/** KYC verification completed */
export function kycVerifiedTemplate(tier: string): NotificationTemplate {
  const title = 'KYC Verified';
  const body = `Your identity has been verified. You are now at ${tier} tier.`;

  return {
    title,
    body,
    emailSubject: 'Identity Verified - AFU Portal',
    emailHtml: emailWrapper(
      title,
      `<p>Your identity verification is complete. You have been upgraded to the <strong>${tier}</strong> tier.</p>
       <p>You now have access to additional features and higher transaction limits.</p>`,
    ),
    smsBody: `AFU: KYC verified. You are now ${tier} tier with expanded access.`,
  };
}

/** Course / training completion */
export function courseCompletedTemplate(courseName: string): NotificationTemplate {
  const title = 'Course Completed';
  const body = `Congratulations! You have completed the course: ${courseName}`;

  return {
    title,
    body,
    emailSubject: 'Course Completed - AFU Portal',
    emailHtml: emailWrapper(
      title,
      `<p>Congratulations! You have successfully completed:</p>
       <p style="font-size:17px;font-weight:600;color:#1e293b">${courseName}</p>
       <p>Your certificate is available in the Training section of your dashboard.</p>`,
    ),
    smsBody: `AFU: Congrats! You completed "${courseName}". View your certificate on the portal.`,
  };
}

/** Commodity price alert */
export function priceAlertTemplate(
  commodity: string,
  price: string,
  currency: string,
): NotificationTemplate {
  const title = 'Price Alert';
  const body = `${commodity} is now at ${currency} ${price}. Check the marketplace for opportunities.`;

  return {
    title,
    body,
    emailSubject: `Price Alert: ${commodity} - AFU Portal`,
    emailHtml: emailWrapper(
      title,
      `<p>The price of <strong>${commodity}</strong> has reached:</p>
       <p style="font-size:22px;font-weight:700;color:#0d9488">${currency} ${price}</p>
       <p>Visit the marketplace to explore buying or selling opportunities.</p>`,
    ),
    smsBody: `AFU: ${commodity} at ${currency} ${price}. Check marketplace.`,
  };
}

/** Security alert (login from new device, password change, etc.) */
export function securityAlertTemplate(
  action: string,
  location: string,
): NotificationTemplate {
  const title = 'Security Alert';
  const body = `A security event was detected: ${action} from ${location}. If this wasn't you, secure your account immediately.`;

  return {
    title,
    body,
    emailSubject: 'Security Alert - AFU Portal',
    emailHtml: emailWrapper(
      'Security Alert',
      `<p style="color:#dc2626;font-weight:600">A security event was detected on your account.</p>
       <p><strong>Action:</strong> ${action}</p>
       <p><strong>Location:</strong> ${location}</p>
       <p>If this was not you, please change your password and enable two-factor authentication immediately.</p>`,
    ),
    smsBody: `AFU SECURITY: ${action} from ${location}. If not you, secure your account now.`,
  };
}
