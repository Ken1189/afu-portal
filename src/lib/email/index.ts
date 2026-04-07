export { sendTemplatedEmail, sendEmail } from './resend';
export type { SendEmailParams, SendEmailResult, DirectEmailParams } from './resend';
export { logEmailError } from './log-error';
export {
  notifyAdmins,
  ADMIN_RECIPIENTS,
  ADMIN_FROM,
} from './admin-notifications';
export type {
  NotifyAdminsParams,
  NotifyAdminsResult,
  NotifyType,
} from './admin-notifications';
export {
  sendLoanApprovalEmail,
  sendLoanRejectionEmail,
  sendKycApprovalEmail,
  sendOrderStatusEmail,
  sendMembershipExpiryWarningEmail,
  sendMembershipExpiredEmail,
  sendWelcomeSeriesEmail,
} from './lifecycle-emails';
