/**
 * SMS Webhook — POST handler for incoming SMS (Twilio / Africa's Talking).
 *
 * Parses inbound message, logs to sms_messages, auto-replies for keywords.
 * No auth required (webhook from provider).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { SmsService } from '@/lib/messaging/sms';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let from: string;
    let body: string;
    let provider: string;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Twilio sends form-encoded
      const formData = await request.formData();
      from = String(formData.get('From') || '');
      body = String(formData.get('Body') || '');
      provider = 'twilio';

      // Africa's Talking format
      if (!from && formData.get('from')) {
        from = String(formData.get('from') || '');
        body = String(formData.get('text') || '');
        provider = 'africastalking';
      }
    } else {
      // JSON format (Africa's Talking or testing)
      const json = await request.json();
      from = json.from || json.From || json.phoneNumber || '';
      body = json.text || json.Body || json.body || '';
      provider = json.provider || 'unknown';
    }

    if (!from) {
      return NextResponse.json({ error: 'Missing sender' }, { status: 400 });
    }

    const supabase = await createAdminClient();
    const smsService = new SmsService(supabase);

    const result = await smsService.handleInbound(from, body, provider);

    // Twilio expects TwiML response
    if (provider === 'twilio' && result.reply) {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(result.reply)}</Message></Response>`;
      return new NextResponse(twiml, {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Africa's Talking / generic response
    return NextResponse.json({ success: true, reply: result.reply || null });
  } catch (error) {
    console.error('[api/sms/webhook] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
