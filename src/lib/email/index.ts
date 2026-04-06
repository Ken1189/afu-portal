export { sendTemplatedEmail, sendEmail } from './resend';
export type { SendEmailParams, SendEmailResult, DirectEmailParams } from './resend';
export { logEmailError } from './log-error';
export {
  sendLoanApprovalEmail,
  sendLoanRejectionEmail,
  sendKycApprovalEmail,
  sendOrderStatusEmail,
  sendMembershipExpiryWarningEmail,
  sendMembershipExpiredEmail,
  sendWelcomeSeriesEmail,
} from './lifecycle-emails';
