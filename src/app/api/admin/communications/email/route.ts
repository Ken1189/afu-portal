import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email/resend';

/**
 * POST /api/admin/communications/email
 * Send an ad-hoc email to a specific user.
 * Body: { userId?, email?, subject, body }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await createAdminClient();

    // Verify admin
    const { data: profile } = await db.from('profiles').select('role, email').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, email: directEmail, subject, body: emailBody } = body as {
      userId?: string;
      email?: string;
      subject?: string;
      body?: string;
    };

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'subject and body are required' }, { status: 400 });
    }

    // Resolve recipient email
    let recipientEmail: string;
    let recipientName: string | null = null;

    if (directEmail) {
      recipientEmail = directEmail;
    } else if (userId) {
      const { data: recipientProfile } = await db
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();
      if (!recipientProfile?.email) {
        return NextResponse.json({ error: 'User has no email address' }, { status: 404 });
      }
      recipientEmail = recipientProfile.email;
      recipientName = recipientProfile.full_name;
    } else {
      return NextResponse.json({ error: 'Either userId or email is required' }, { status: 400 });
    }

    // Wrap in AFU branded template
    const htmlEmail = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1B2A4A;padding:24px;text-align:center">
        <h1 style="color:#5DB347;margin:0;font-size:22px">African Farming Union</h1>
      </div>
      <div style="padding:24px;background:#f8faf6">
        ${recipientName ? `<p style="color:#333;font-size:15px">Dear ${recipientName},</p>` : ''}
        <div style="color:#333;font-size:15px;line-height:1.6">${emailBody}</div>
      </div>
      <div style="padding:12px;text-align:center;color:#999;font-size:12px">
        African Farming Union | <a href="https://africanfarmingunion.org" style="color:#999">africanfarmingunion.org</a>
      </div>
    </div>`;

    await sendEmail(recipientEmail, subject, htmlEmail);

    // Audit log
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'admin_email_sent',
      entity_type: 'communications',
      entity_id: userId || recipientEmail,
      details: {
        recipient: recipientEmail,
        subject,
        sent_by: profile.email,
      },
    }).then(({ error }) => {
      if (error) console.error('[admin/communications/email] audit log error:', error);
    });

    return NextResponse.json({ success: true, recipient: recipientEmail });
  } catch (err) {
    console.error('[admin/communications/email] error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
