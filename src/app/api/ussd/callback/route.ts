/**
 * USSD Webhook — POST handler for Africa's Talking USSD callback.
 *
 * Receives: sessionId, serviceCode, phoneNumber, text
 * Returns: plain text USSD response (Content-Type: text/plain)
 * No auth required (webhook from Africa's Talking).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { UssdService } from '@/lib/messaging/ussd';

export async function POST(request: NextRequest) {
  try {
    // Africa's Talking sends form-encoded data
    const contentType = request.headers.get('content-type') || '';
    let sessionId: string;
    let serviceCode: string;
    let phoneNumber: string;
    let text: string;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData();
      sessionId = String(formData.get('sessionId') || '');
      serviceCode = String(formData.get('serviceCode') || '');
      phoneNumber = String(formData.get('phoneNumber') || '');
      text = String(formData.get('text') || '');
    } else {
      // JSON fallback (for testing)
      const body = await request.json();
      sessionId = body.sessionId || '';
      serviceCode = body.serviceCode || '';
      phoneNumber = body.phoneNumber || '';
      text = body.text || '';
    }

    if (!sessionId || !phoneNumber) {
      return new NextResponse('END Invalid request', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const supabase = await createAdminClient();
    const ussdService = new UssdService(supabase);

    const response = await ussdService.handleSession(sessionId, phoneNumber, text, serviceCode);

    return new NextResponse(response, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error('[ussd/callback] Error:', error);
    return new NextResponse('END An error occurred. Please try again.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}
