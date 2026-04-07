// ---------------------------------------------------------------------------
// Centralized admin notification helper.
//
// Every public form submission should call notifyAdmins() so that:
//   1. Email is sent to all 3 admin recipients (info, peter, devon)
//   2. The submission is recorded in the universal inbox
//      (conversations + conversation_messages tables) so admins can reply
//      via /admin/inbox or /admin/messaging.
//
// Usage:
//   import { notifyAdmins } from '@/lib/email/admin-notifications';
//   await notifyAdmins({
//     subject: 'New contact form submission',
//     type: 'contact',
//     data: { name, email, message },
//     reply_to: email,
//   });
// ---------------------------------------------------------------------------

import { sendEmail } from './resend';
import { createInboxConversation } from '@/lib/inbox/create-conversation';

export const ADMIN_RECIPIENTS = [
  'info@africanfarmingunion.org',
  'peter@africanfarmingunion.org',
  'devon@africanfarmingunion.org',
] as const;

export const ADMIN_FROM =
  process.env.EMAIL_FROM ??
  'African Farming Union <info@africanfarmingunion.org>';

export type NotifyType =
  | 'contact'
  | 'application'
  | 'sponsor'
  | 'donate'
  | 'investor'
  | 'newsletter'
  | 'job'
  | 'supplier'
  | 'ambassador'
  | 'partner'
  | 'lead';

export interface NotifyAdminsParams {
  subject: string;
  type: NotifyType | string;
  data: Record<string, unknown>;
  reply_to?: string;
  /** Optional friendly name of the submitter (for inbox display). */
  name?: string;
  /** Optional phone (for inbox display). */
  phone?: string;
  /** Optional country (for inbox display). */
  country?: string;
  /** Optional business name (for inbox display). */
  businessName?: string;
  /** Optional extra tags for the inbox conversation. */
  tags?: string[];
}

export interface NotifyAdminsResult {
  emailSent: boolean;
  conversationId: string | null;
  errors: string[];
}

// ---------------------------------------------------------------------------
// HTML escaping
// ---------------------------------------------------------------------------

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatLabel(key: string): string {
  return key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ') || 'N/A';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

// ---------------------------------------------------------------------------
// AFU-branded HTML template
// ---------------------------------------------------------------------------

function buildEmailHtml(params: NotifyAdminsParams): string {
  const { subject, type, data, reply_to } = params;
  const safeSubject = escapeHtml(subject);
  const safeType = escapeHtml(type);
  const submitterName =
    params.name ??
    (data.full_name as string | undefined) ??
    (data.name as string | undefined) ??
    (data.contactName as string | undefined) ??
    (data.investorName as string | undefined) ??
    'Anonymous';

  const rows = Object.entries(data)
    .filter(([k]) => k !== 'password' && k !== 'token')
    .map(
      ([k, v]) =>
        `<tr>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f4;color:#64748b;width:160px;vertical-align:top;font-size:13px;">${escapeHtml(
            formatLabel(k),
          )}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #eef2f4;color:#1B2A4A;font-size:14px;">${escapeHtml(
            formatValue(v),
          ).replace(/\n/g, '<br>')}</td>
        </tr>`,
    )
    .join('');

  const replyToBlock = reply_to
    ? `<p style="margin:16px 0 0;color:#64748b;font-size:13px;">
         Reply to: <a href="mailto:${escapeHtml(reply_to)}" style="color:#2563eb;text-decoration:none;">${escapeHtml(reply_to)}</a>
       </p>`
    : '';

  return `<!doctype html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;">
    <div style="background:#1B2A4A;padding:28px 32px;border-bottom:4px solid #5DB347;">
      <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:600;">African Farming Union</h1>
      <p style="color:#8CB89C;margin:6px 0 0;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">Admin Notification &middot; ${safeType}</p>
    </div>
    <div style="padding:28px 32px;">
      <div style="background:#f0fdf4;border-left:4px solid #5DB347;padding:14px 16px;border-radius:0 6px 6px 0;margin-bottom:22px;">
        <p style="margin:0;color:#1B2A4A;font-size:15px;font-weight:600;">New ${safeType} submission from ${escapeHtml(submitterName)}</p>
        <p style="margin:4px 0 0;color:#475569;font-size:13px;">${safeSubject}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;border:1px solid #eef2f4;border-radius:6px;overflow:hidden;">
        ${rows}
      </table>
      ${replyToBlock}
      <div style="margin-top:24px;text-align:center;">
        <a href="https://africanfarmingunion.org/admin/inbox" style="display:inline-block;background:#5DB347;color:#ffffff;padding:12px 26px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">Open Admin Inbox</a>
      </div>
    </div>
    <div style="padding:18px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
      <p style="margin:0;color:#94a3b8;font-size:12px;">African Farming Union &middot; africanfarmingunion.org</p>
    </div>
  </div>
</body></html>`;
}

// ---------------------------------------------------------------------------
// Build a plain-text body for the inbox conversation message
// ---------------------------------------------------------------------------

function buildInboxBody(params: NotifyAdminsParams): string {
  const lines = Object.entries(params.data)
    .filter(([k]) => k !== 'password' && k !== 'token')
    .map(([k, v]) => `${formatLabel(k)}: ${formatValue(v)}`);
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// notifyAdmins — single entry point
// ---------------------------------------------------------------------------

export async function notifyAdmins(
  params: NotifyAdminsParams,
): Promise<NotifyAdminsResult> {
  const result: NotifyAdminsResult = {
    emailSent: false,
    conversationId: null,
    errors: [],
  };

  const html = buildEmailHtml(params);

  // 1. Send email to all 3 admin recipients (in parallel) ------------------
  await Promise.all(
    ADMIN_RECIPIENTS.map(async (recipient) => {
      try {
        await sendEmail(recipient, params.subject, html, ADMIN_FROM);
        result.emailSent = true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[notifyAdmins] Email to ${recipient} failed:`, msg);
        result.errors.push(`email:${recipient}:${msg}`);
      }
    }),
  );

  // 2. Insert into the universal inbox -------------------------------------
  try {
    const data = params.data as Record<string, unknown>;
    const submitterName =
      params.name ??
      (data.full_name as string | undefined) ??
      (data.name as string | undefined) ??
      (data.contactName as string | undefined) ??
      (data.investorName as string | undefined) ??
      params.reply_to ??
      'Form submission';

    const inbox = await createInboxConversation({
      name: submitterName,
      email: params.reply_to,
      phone:
        params.phone ??
        (data.phone as string | undefined) ??
        (data.phone_number as string | undefined),
      country:
        params.country ??
        (data.country as string | undefined),
      businessName:
        params.businessName ??
        (data.company as string | undefined) ??
        (data.organization as string | undefined) ??
        (data.entity_name as string | undefined) ??
        (data.entityName as string | undefined),
      type: mapTypeForInbox(params.type),
      subject: params.subject,
      message: buildInboxBody(params),
      channel: 'form',
      tags: ['form', String(params.type), ...(params.tags ?? [])],
    });

    result.conversationId = inbox?.id ?? null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[notifyAdmins] inbox insert failed:', msg);
    result.errors.push(`inbox:${msg}`);
  }

  return result;
}

function mapTypeForInbox(type: string): string {
  switch (type) {
    case 'application':
      return 'member';
    case 'supplier':
    case 'partner':
      return 'supplier';
    case 'ambassador':
      return 'ambassador';
    case 'investor':
    case 'sponsor':
    case 'donate':
      return 'investor';
    case 'job':
    case 'contact':
    case 'newsletter':
    default:
      return 'lead';
  }
}
