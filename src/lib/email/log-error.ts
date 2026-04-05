import { createClient } from '@supabase/supabase-js';

/**
 * Log email send failures to the notification_queue table for visibility.
 * Non-blocking — never throws.
 */
export async function logEmailError(context: string, error: unknown, recipient?: string) {
  try {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`[Email Error] ${context}: ${msg} (to: ${recipient || 'unknown'})`);

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await sb.from('notification_queue').insert({
        category: 'system',
        priority: 'high',
        channel: 'email',
        title: `Email Failed: ${context}`,
        body: `Failed to send email to ${recipient || 'unknown'}. Error: ${msg}`,
        status: 'failed',
        error: msg,
      });
    }
  } catch {
    // Never fail
  }
}
