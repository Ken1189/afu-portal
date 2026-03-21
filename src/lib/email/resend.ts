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

const DEFAULT_FROM =
  process.env.EMAIL_FROM ?? 'AFU Portal <noreply@afu-portal.vercel.app>';

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
): Promise<SendEmailResult> {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Resend API error: ${error.message}`);
  }

  return { success: true, messageId: data?.id ?? 'unknown' };
}
