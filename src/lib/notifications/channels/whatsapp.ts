/**
 * WhatsApp channel — sends template messages via the WhatsApp Cloud API
 * (Meta Business Platform).
 *
 * Requires:
 *   - WHATSAPP_TOKEN          (permanent or temporary access token)
 *   - WHATSAPP_PHONE_NUMBER_ID (the phone-number ID from Meta dashboard)
 */

const GRAPH_API_VERSION = 'v18.0';

function getConfig() {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    const missing: string[] = [];
    if (!token) missing.push('WHATSAPP_TOKEN');
    if (!phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
    throw new Error(
      `[whatsapp] Missing env vars: ${missing.join(', ')}. Configure them in your environment.`,
    );
  }

  return { token, phoneNumberId };
}

/**
 * Send a WhatsApp template message.
 *
 * The WhatsApp Business API requires pre-approved templates for
 * business-initiated conversations. The `params` array maps to the
 * positional {{1}}, {{2}}, ... placeholders in the template.
 *
 * @param to            Recipient phone number in E.164 format
 * @param templateName  The approved template name (e.g. 'payment_confirmation')
 * @param params        Positional parameters for the template body
 * @returns             The WhatsApp message ID
 */
export async function sendWhatsApp(
  to: string,
  templateName: string,
  params: string[],
): Promise<{ messageId: string }> {
  const { token, phoneNumberId } = getConfig();

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    to: to.replace(/[^+\d]/g, ''), // strip non-digit chars except +
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: params.map((text) => ({
            type: 'text',
            text,
          })),
        },
      ],
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `[whatsapp] WhatsApp Cloud API error ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as {
    messages: Array<{ id: string }>;
  };

  if (!data.messages?.[0]?.id) {
    throw new Error('[whatsapp] Unexpected API response — no message ID returned');
  }

  return { messageId: data.messages[0].id };
}
