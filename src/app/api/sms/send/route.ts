/**
 * Send SMS API — POST handler for sending SMS messages.
 *
 * Protected: admin/super_admin only.
 * Body: { to, body?, templateName?, variables? }
 * Returns: { success, messageId }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { SmsService } from '@/lib/messaging/sms';

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check — admin or super_admin only
    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { to, body: messageBody, templateName, variables } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing required field: to' }, { status: 400 });
    }

    if (!messageBody && !templateName) {
      return NextResponse.json({ error: 'Provide either body or templateName' }, { status: 400 });
    }

    const smsService = new SmsService(adminClient);

    let result;
    if (templateName) {
      result = await smsService.sendTemplateSMS(to, templateName, variables || {});
    } else {
      result = await smsService.sendSMS(to, messageBody);
    }

    return NextResponse.json({
      success: result.success,
      messageId: result.messageId,
      status: result.status,
      error: result.error,
    });
  } catch (error) {
    console.error('[api/sms/send] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
