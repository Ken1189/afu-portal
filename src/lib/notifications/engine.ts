/**
 * Multi-channel Notification Engine
 *
 * Central dispatcher that routes notifications to email, SMS, push,
 * in-app, and WhatsApp channels. Each channel is handled independently
 * so a failure in one does not block the others.
 */

import { createAdminClient } from '@/lib/supabase/server';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app' | 'whatsapp';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationCategory =
  | 'payment'
  | 'loan'
  | 'insurance'
  | 'farming'
  | 'marketplace'
  | 'training'
  | 'system'
  | 'security'
  | 'promotion'
  | 'cooperative';

export interface NotificationPayload {
  recipientId: string; // member_id
  category: NotificationCategory;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  title: string;
  body: string;
  data?: Record<string, string>;
  actionUrl?: string;
  // Channel-specific overrides
  emailSubject?: string;
  emailHtml?: string;
  smsBody?: string;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolve the recipient's contact details from the members table so each
 * channel handler has the address it needs (email, phone, etc.).
 */
async function resolveRecipient(memberId: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('members')
    .select('id, email, phone, full_name, push_subscription')
    .eq('id', memberId)
    .single();

  if (error || !data) {
    throw new Error(`Could not resolve recipient ${memberId}: ${error?.message ?? 'not found'}`);
  }
  return data as {
    id: string;
    email: string | null;
    phone: string | null;
    full_name: string | null;
    push_subscription: unknown | null;
  };
}

/**
 * Persist every dispatch attempt to the `notification_queue` table for
 * auditing and retry logic.
 */
async function logToQueue(
  payload: NotificationPayload,
  results: NotificationResult[],
) {
  try {
    const supabase = await createAdminClient();

    const rows = results.map((r) => ({
      recipient_id: payload.recipientId,
      category: payload.category,
      priority: payload.priority,
      channel: r.channel,
      title: payload.title,
      body: payload.body,
      data: payload.data ?? null,
      action_url: payload.actionUrl ?? null,
      status: r.success ? 'sent' : 'failed',
      message_id: r.messageId ?? null,
      error: r.error ?? null,
      sent_at: r.success ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
    }));

    await supabase.from('notification_queue').insert(rows);
  } catch {
    // Logging should never break the notification flow
    console.error('[notifications] Failed to log to notification_queue');
  }
}

// ---------------------------------------------------------------------------
// Channel dispatchers
// ---------------------------------------------------------------------------

async function dispatchToChannel(
  channel: NotificationChannel,
  payload: NotificationPayload,
  recipient: Awaited<ReturnType<typeof resolveRecipient>>,
): Promise<NotificationResult> {
  try {
    switch (channel) {
      case 'email': {
        if (!recipient.email) {
          return { channel, success: false, error: 'Recipient has no email address' };
        }
        const { sendEmail } = await import('./channels/email');
        const subject = payload.emailSubject ?? payload.title;
        const html = payload.emailHtml ?? `<p>${payload.body}</p>`;
        const result = await sendEmail(recipient.email, subject, html, payload.body);
        return { channel, success: true, messageId: result.messageId };
      }

      case 'sms': {
        if (!recipient.phone) {
          return { channel, success: false, error: 'Recipient has no phone number' };
        }
        const { sendSms } = await import('./channels/sms');
        const smsBody = payload.smsBody ?? payload.body;
        const result = await sendSms(recipient.phone, smsBody);
        return { channel, success: true, messageId: result.messageId };
      }

      case 'push': {
        if (!recipient.push_subscription) {
          return { channel, success: false, error: 'Recipient has no push subscription' };
        }
        const { sendPush } = await import('./channels/push');
        const result = await sendPush(
          recipient.push_subscription,
          payload.title,
          payload.body,
          payload.actionUrl,
        );
        return { channel, success: result.success, error: result.success ? undefined : 'Push delivery failed' };
      }

      case 'in_app': {
        const { sendInApp } = await import('./channels/in-app');
        const result = await sendInApp(
          payload.recipientId,
          payload.title,
          payload.body,
          payload.actionUrl,
          payload.data,
        );
        return { channel, success: true, messageId: result.id };
      }

      case 'whatsapp': {
        if (!recipient.phone) {
          return { channel, success: false, error: 'Recipient has no phone number' };
        }
        const { sendWhatsApp } = await import('./channels/whatsapp');
        // Default template; callers can override via data.whatsapp_template
        const templateName = payload.data?.whatsapp_template ?? 'general_notification';
        const params = [payload.title, payload.body];
        const result = await sendWhatsApp(recipient.phone, templateName, params);
        return { channel, success: true, messageId: result.messageId };
      }

      default:
        return { channel, success: false, error: `Unknown channel: ${channel}` };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { channel, success: false, error: message };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Send a notification to a single recipient across one or more channels.
 * Channels are dispatched in parallel; individual failures do not affect
 * the other channels.
 */
export async function sendNotification(
  payload: NotificationPayload,
): Promise<NotificationResult[]> {
  const recipient = await resolveRecipient(payload.recipientId);

  const results = await Promise.all(
    payload.channels.map((channel) =>
      dispatchToChannel(channel, payload, recipient),
    ),
  );

  // Fire-and-forget logging
  logToQueue(payload, results).catch(() => {});

  return results;
}

/**
 * Send the same notification to many recipients. Returns aggregate counts.
 */
export async function sendBulkNotification(
  recipientIds: string[],
  payload: Omit<NotificationPayload, 'recipientId'>,
): Promise<{ total: number; sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  // Process in batches of 20 to avoid overwhelming external APIs
  const BATCH_SIZE = 20;

  for (let i = 0; i < recipientIds.length; i += BATCH_SIZE) {
    const batch = recipientIds.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (recipientId) => {
        try {
          const results = await sendNotification({ ...payload, recipientId });
          // Count as "sent" if at least one channel succeeded
          const anySuccess = results.some((r) => r.success);
          return anySuccess;
        } catch {
          return false;
        }
      }),
    );

    for (const success of batchResults) {
      if (success) sent++;
      else failed++;
    }
  }

  return { total: recipientIds.length, sent, failed };
}
