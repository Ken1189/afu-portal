/**
 * Email channel — sends transactional email via Resend API.
 *
 * Requires:
 *   - RESEND_API_KEY
 *   - EMAIL_FROM (optional, defaults to 'AFU Portal <noreply@afu.org>')
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

function getApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      '[email] RESEND_API_KEY is not set. Configure it in your environment variables.',
    );
  }
  return key;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'AFU Portal <noreply@afu.org>';
}

/**
 * Send an email via the Resend API.
 *
 * @param to      Recipient email address
 * @param subject Email subject line
 * @param html    HTML body
 * @param text    Optional plain-text fallback
 * @returns       The Resend message ID
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text?: string,
): Promise<{ messageId: string }> {
  const apiKey = getApiKey();

  const payload: Record<string, string> = {
    from: getFromAddress(),
    to,
    subject,
    html,
  };

  if (text) {
    payload.text = text;
  }

  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `[email] Resend API error ${response.status}: ${body}`,
    );
  }

  const data = (await response.json()) as { id: string };
  return { messageId: data.id };
}
