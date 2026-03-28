/**
 * WhatsApp Webhook — GET for verification, POST for incoming messages.
 *
 * GET: Meta webhook verification (hub.verify_token check)
 * POST: Incoming WhatsApp messages
 * No auth required (webhook from Meta).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { WhatsAppService } from '@/lib/messaging/whatsapp';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'afu_whatsapp_verify_2024';

/**
 * GET — Webhook verification.
 * Meta sends: hub.mode, hub.verify_token, hub.challenge
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[whatsapp/webhook] Verification successful');
    return new NextResponse(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST — Incoming WhatsApp messages.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Meta requires 200 response quickly
    // Process in background-like manner but still await for logging
    const supabase = await createAdminClient();
    const whatsAppService = new WhatsAppService(supabase);

    await whatsAppService.handleIncoming(payload);

    // Always return 200 to Meta to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[api/whatsapp/webhook] Error:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ success: true });
  }
}
