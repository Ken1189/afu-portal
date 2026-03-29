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

// ---------------------------------------------------------------------------
// S5.7: Onboarding email templates — Day 0, Day 3, Day 7 nurture sequence
// ---------------------------------------------------------------------------

/** Day 0: Welcome email sent immediately after signup */
export function onboardingWelcomeTemplate(name: string): NotificationTemplate {
  const title = 'Welcome to African Farming Union!';
  const body = `Welcome${name ? `, ${name}` : ''}! Complete your profile to unlock financing, insurance, and training.`;

  return {
    title,
    body,
    emailSubject: 'Welcome to AFU - Complete Your Profile',
    emailHtml: emailWrapper(
      'Welcome to AFU!',
      `<p>Hi${name ? ` ${name}` : ''},</p>
       <p>Welcome to the African Farming Union! You&rsquo;ve taken the first step toward transforming your farming operation.</p>
       <p><strong>Complete your profile</strong> to unlock:</p>
       <ul>
         <li>Access to financing (working capital, input finance)</li>
         <li>Crop &amp; livestock insurance</li>
         <li>Training courses &amp; certifications</li>
         <li>Market access &amp; guaranteed offtake</li>
       </ul>
       <p>It only takes 2 minutes.</p>`,
      'https://africanfarmingunion.org/onboarding',
      'Complete Your Profile',
    ),
    smsBody: `AFU: Welcome${name ? ` ${name}` : ''}! Complete your profile at africanfarmingunion.org/onboarding to unlock financing & training.`,
  };
}

/** Day 3: Reminder for users who signed up but didn't complete onboarding */
export function onboardingReminderDay3Template(name: string): NotificationTemplate {
  const title = 'You\'re Almost There!';
  const body = `${name ? `${name}, y` : 'Y'}our AFU profile is incomplete. Finish setup to access financing and insurance.`;

  return {
    title,
    body,
    emailSubject: 'Finish Your AFU Profile - 2 Minutes Left',
    emailHtml: emailWrapper(
      'You&rsquo;re Almost There!',
      `<p>Hi${name ? ` ${name}` : ''},</p>
       <p>You started your AFU membership but haven&rsquo;t finished setting up. You&rsquo;re just a few steps away from:</p>
       <ul>
         <li><strong>$500 - $50,000</strong> in working capital financing</li>
         <li><strong>Crop insurance</strong> backed by Lloyd&rsquo;s of London</li>
         <li><strong>Free training courses</strong> to boost your yields</li>
       </ul>
       <p>Complete your profile now &mdash; it only takes 2 minutes.</p>`,
      'https://africanfarmingunion.org/onboarding',
      'Complete My Profile',
    ),
    smsBody: `AFU: ${name ? `${name}, f` : 'F'}inish your profile to unlock financing & insurance. 2 min: africanfarmingunion.org/onboarding`,
  };
}

/** Day 7: Final nudge for users who haven't completed onboarding */
export function onboardingReminderDay7Template(name: string): NotificationTemplate {
  const title = 'Don\'t Miss Out on AFU Benefits';
  const body = `${name ? `${name}, y` : 'Y'}our AFU membership is pending. Complete setup to access all services.`;

  return {
    title,
    body,
    emailSubject: 'Last Chance - Complete Your AFU Membership',
    emailHtml: emailWrapper(
      'Don&rsquo;t Miss Out',
      `<p>Hi${name ? ` ${name}` : ''},</p>
       <p>It&rsquo;s been a week since you signed up for the African Farming Union, but your profile is still incomplete.</p>
       <p>Thousands of farmers across 20 countries are already using AFU to:</p>
       <ul>
         <li>Access affordable financing</li>
         <li>Protect their crops with insurance</li>
         <li>Sell their harvest at guaranteed prices</li>
         <li>Learn modern farming techniques</li>
       </ul>
       <p>Don&rsquo;t get left behind. Complete your profile today.</p>`,
      'https://africanfarmingunion.org/onboarding',
      'Finish Setup Now',
    ),
    smsBody: `AFU: Last reminder! Complete your profile to access financing, insurance & training: africanfarmingunion.org/onboarding`,
  };
}
