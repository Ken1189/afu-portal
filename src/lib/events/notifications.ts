/**
 * AFU Central Notification Dispatch Service
 *
 * Provides unified notification functions that route to SMS, email, push,
 * and in-app channels. Respects user notification preferences stored in
 * profiles.preferences and gracefully handles missing config (no Resend
 * key, no phone number, etc.).
 */

import { createClient } from '@supabase/supabase-js';

// ── Types ──

export type NotifyChannel = 'sms' | 'email' | 'push' | 'in_app' | 'all';

interface UserContactInfo {
  id: string;
  email?: string | null;
  phone?: string | null;
  full_name?: string | null;
  preferences?: Record<string, unknown> | null;
}

// ── Admin supabase ──

function getAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── Resolve user contact info ──

async function resolveUser(userId: string): Promise<UserContactInfo | null> {
  const supabase = getAdmin();
  const { data } = await supabase
    .from('profiles')
    .select('id, email, phone, full_name, preferences')
    .eq('id', userId)
    .single();
  return data;
}

// ── Channel: In-App notification ──

async function sendInApp(
  userId: string,
  title: string,
  body: string,
  opts?: { type?: string; actionUrl?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const supabase = getAdmin();
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    type: opts?.type || 'info',
    channel: 'in_app',
    is_read: false,
    action_url: opts?.actionUrl || null,
    metadata: opts?.metadata || {},
  });
}

// ── Channel: SMS ──

async function sendSms(phone: string, message: string): Promise<void> {
  // Use the SmsService pattern — log to sms_messages table
  const supabase = getAdmin();
  try {
    await supabase.from('sms_messages').insert({
      to_number: phone,
      body: message,
      direction: 'outbound',
      status: 'queued',
      provider: 'africastalking',
    });
  } catch {
    // SMS table may not exist — log and continue
    console.warn('[Notifications] SMS log failed — sms_messages table may not exist');
  }
}

// ── Channel: Email ──

async function sendEmail(email: string, subject: string, body: string): Promise<void> {
  // Only send if Resend is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Notifications] Email skipped — RESEND_API_KEY not configured');
    return;
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'AFU <noreply@noreply.africanfarmingunion.org>',
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #16a34a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 20px;">African Farming Union</h1>
          </div>
          <div style="padding: 24px; background: #ffffff;">
            <h2 style="color: #16a34a; margin-top: 0;">${subject}</h2>
            <p style="color: #374151; line-height: 1.6;">${body}</p>
          </div>
          <div style="padding: 16px; text-align: center; color: #9ca3af; font-size: 12px;">
            African Farming Union &mdash; Empowering African Agriculture
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Notifications] Email send failed:', err);
  }
}

// ── Check user notification preferences ──

function shouldNotify(
  preferences: Record<string, unknown> | null | undefined,
  channel: string,
): boolean {
  if (!preferences) return true; // Default: allow all
  const notifPrefs = preferences.notifications as Record<string, boolean> | undefined;
  if (!notifPrefs) return true;
  return notifPrefs[channel] !== false;
}

// ── Public API ──

/**
 * Send a notification to a specific user across specified channels.
 */
export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  channel: NotifyChannel = 'in_app',
  opts?: { type?: string; actionUrl?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const user = await resolveUser(userId);
  if (!user) {
    console.warn(`[Notifications] User ${userId} not found — skipping notification`);
    return;
  }

  const channels: NotifyChannel[] = channel === 'all'
    ? ['in_app', 'sms', 'email']
    : [channel];

  const promises: Promise<void>[] = [];

  for (const ch of channels) {
    if (!shouldNotify(user.preferences, ch)) continue;

    switch (ch) {
      case 'in_app':
        promises.push(sendInApp(userId, title, body, opts));
        break;
      case 'sms':
        if (user.phone) {
          promises.push(sendSms(user.phone, `AFU: ${body}`));
        }
        break;
      case 'email':
        if (user.email) {
          promises.push(sendEmail(user.email, title, body));
        }
        break;
      case 'push':
        // Push notifications — placeholder for future FCM integration
        promises.push(sendInApp(userId, title, body, { ...opts, type: 'push' }));
        break;
    }
  }

  await Promise.allSettled(promises);
}

/**
 * Send a notification to all admin / super_admin users.
 */
export async function notifyAdmins(
  title: string,
  body: string,
  opts?: { type?: string; actionUrl?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const supabase = getAdmin();
  const { data: admins } = await supabase
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'super_admin']);

  if (!admins || admins.length === 0) return;

  const promises = admins.map((admin) =>
    sendInApp(admin.id, title, body, opts),
  );

  await Promise.allSettled(promises);
}

/**
 * Send a notification to all users with a specific role.
 */
export async function notifyRole(
  role: string,
  title: string,
  body: string,
  opts?: { type?: string; actionUrl?: string; metadata?: Record<string, unknown> },
): Promise<void> {
  const supabase = getAdmin();
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', role);

  if (!users || users.length === 0) return;

  const promises = users.map((u) =>
    sendInApp(u.id, title, body, opts),
  );

  await Promise.allSettled(promises);
}
