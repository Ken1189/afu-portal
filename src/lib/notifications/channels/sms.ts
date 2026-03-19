/**
 * SMS channel — sends text messages via the Twilio REST API.
 *
 * Requires:
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_FROM_NUMBER
 */

function getConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    const missing: string[] = [];
    if (!accountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!authToken) missing.push('TWILIO_AUTH_TOKEN');
    if (!fromNumber) missing.push('TWILIO_FROM_NUMBER');
    throw new Error(
      `[sms] Missing Twilio env vars: ${missing.join(', ')}. Configure them in your environment.`,
    );
  }

  return { accountSid, authToken, fromNumber };
}

/**
 * Send an SMS via the Twilio REST API.
 *
 * @param to   Recipient phone number in E.164 format (e.g. +254712345678)
 * @param body Message text (max 1600 characters)
 * @returns    The Twilio message SID
 */
export async function sendSms(
  to: string,
  body: string,
): Promise<{ messageId: string }> {
  const { accountSid, authToken, fromNumber } = getConfig();

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params = new URLSearchParams();
  params.set('To', to);
  params.set('From', fromNumber);
  params.set('Body', body);

  const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `[sms] Twilio API error ${response.status}: ${errorBody}`,
    );
  }

  const data = (await response.json()) as { sid: string };
  return { messageId: data.sid };
}
