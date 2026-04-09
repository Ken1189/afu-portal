// ---------------------------------------------------------------------------
// Centralized email module — ALL API routes should use sendEmail() or
// sendTemplatedEmail() from this file instead of creating their own
// `new Resend()` instances.
//
// Usage:
//   import { sendEmail } from '@/lib/email';
//   await sendEmail('user@example.com', 'Subject', '<p>Body</p>');
//
// TODO: Migrate remaining API routes that still instantiate Resend directly:
//   - /api/ambassador/notify
//   - /api/insurance/*
//   - /api/loans/*
//   - /api/messaging/*
//   - /api/orders/*
//   - /api/kyc/*
//   - /api/cron/*
// ---------------------------------------------------------------------------

import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Resend client — lazily initialised so the module can be imported even when
// the env var is missing (e.g. during build or in test environments).
// ---------------------------------------------------------------------------

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not configured. Set it in your environment variables.',
    );
  }
  return new Resend(apiKey);
}

// ---------------------------------------------------------------------------
// Supabase admin client (service role) for fetching templates (bypasses RLS).
// ---------------------------------------------------------------------------

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SendEmailParams {
  to: string;
  templateKey: string;
  variables: Record<string, string>;
}

export interface SendEmailResult {
  success: true;
  messageId: string;
}

export interface DirectEmailParams {
  to: string;
  subject: string;
  html: string;
}

// ---------------------------------------------------------------------------
// Default sender — change when a verified domain is set up in Resend.
// ---------------------------------------------------------------------------

// Resend verified domain is mail.africanfarmingunion.org
// Replies still route to info@africanfarmingunion.org via Reply-To header
const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? 'African Farming Union <info@mail.africanfarmingunion.org>';

// ---------------------------------------------------------------------------
// Template variable substitution
// ---------------------------------------------------------------------------

function substituteVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    return variables[key] ?? `{{${key}}}`;
  });
}

// ---------------------------------------------------------------------------
// sendTemplatedEmail
//
// 1. Fetches the template row from `notification_templates` by its `key`.
// 2. Substitutes `{{variable}}` placeholders in subject + body.
// 3. Sends via Resend.
// ---------------------------------------------------------------------------

export async function sendTemplatedEmail(
  params: SendEmailParams,
): Promise<SendEmailResult> {
  const { to, templateKey, variables } = params;

  const supabase = getAdminSupabase();

  // Fetch template --------------------------------------------------------
  const { data: template, error: fetchError } = await supabase
    .from('notification_templates')
    .select('subject, body, from_email')
    .eq('key', templateKey)
    .single();

  if (fetchError || !template) {
    throw new Error(
      `Email template "${templateKey}" not found: ${fetchError?.message ?? 'no rows returned'}`,
    );
  }

  // Substitute variables --------------------------------------------------
  const subject = substituteVariables(template.subject, variables);
  const html = substituteVariables(template.body, variables);
  const from = template.from_email || DEFAULT_FROM;

  // Send ------------------------------------------------------------------
  return sendEmail(to, subject, html, from);
}

// ---------------------------------------------------------------------------
// sendEmail — direct send (no template lookup).
// ---------------------------------------------------------------------------

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  from: string = DEFAULT_FROM,
  replyTo?: string,
): Promise<SendEmailResult> {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  const messageId = data?.id ?? 'unknown';

  // Log to unified inbox so admins can see sent emails
  try {
    const supabase = getAdminSupabase();

    // Find or create a conversation for this recipient
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('contact_email', to)
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let conversationId = existing?.id;
    if (!conversationId) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          contact_email: to,
          contact_name: to.split('@')[0],
          subject,
          status: 'resolved',
          unread_count: 0,
        })
        .select('id')
        .single();
      conversationId = newConv?.id;
    } else {
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);
    }

    if (conversationId) {
      await supabase.from('conversation_messages').insert({
        conversation_id: conversationId,
        direction: 'outbound',
        channel: 'email',
        sender_name: 'AFU System',
        sender_email: from,
        subject,
        body: html.replace(/<[^>]+>/g, '').slice(0, 2000),
        html_body: html,
        status: 'sent',
        message_id: messageId,
      });
    }
  } catch (logErr) {
    // Don't fail the email send if logging fails
    console.warn('[email] inbox log failed:', logErr);
  }

  return { success: true, messageId };
}
