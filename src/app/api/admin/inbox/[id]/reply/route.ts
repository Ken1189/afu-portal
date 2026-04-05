import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

/**
 * POST /api/admin/inbox/[id]/reply — Send reply in conversation
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();
    const body = await req.json();
    const { message, channel } = body;

    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // Get conversation
    const { data: conv } = await admin.from('conversations').select('*').eq('id', id).single();
    if (!conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });

    // Get sender profile
    const { data: profile } = await admin.from('profiles').select('full_name, email').eq('id', user.id).single();

    // Determine channel
    const sendChannel = channel || (conv.contact_phone ? 'sms' : 'email');

    // Create message record
    const { data: msg, error: msgErr } = await admin.from('conversation_messages').insert({
      conversation_id: id,
      direction: 'outbound',
      channel: sendChannel,
      sender_name: profile?.full_name || 'AFU Admin',
      sender_email: profile?.email,
      subject: conv.subject ? `Re: ${conv.subject}` : undefined,
      body: message,
      status: 'sent',
    }).select().single();

    if (msgErr) return NextResponse.json({ error: msgErr.message }, { status: 500 });

    // Update conversation
    await admin.from('conversations').update({
      last_message_at: new Date().toISOString(),
      status: conv.status === 'open' ? 'assigned' : conv.status,
      assigned_to: conv.assigned_to || user.id,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    // Send via channel
    let sendError: string | null = null;
    try {
      if (sendChannel === 'email' && conv.contact_email) {
        await resend.emails.send({
          from: FROM,
          to: conv.contact_email,
          subject: conv.subject ? `Re: ${conv.subject}` : 'Message from African Farming Union',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:#1B2A4A;padding:20px;text-align:center">
              <h2 style="color:#5DB347;margin:0;font-size:18px">African Farming Union</h2>
            </div>
            <div style="padding:24px;background:#f8faf6">
              <p style="color:#333;font-size:14px;line-height:1.6;white-space:pre-wrap">${message}</p>
            </div>
            <div style="padding:12px;text-align:center;color:#999;font-size:11px">
              Reply to this email to continue the conversation | africanfarmingunion.org
            </div>
          </div>`,
        });
      } else if (sendChannel === 'sms' && conv.contact_phone) {
        // Use SMS service
        const smsRes = await fetch(new URL('/api/sms/send', req.url).toString(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
          body: JSON.stringify({ to: conv.contact_phone, body: message }),
        });
        if (!smsRes.ok) sendError = 'SMS send failed';
      }
    } catch (err) {
      sendError = err instanceof Error ? err.message : 'Send failed';
    }

    if (sendError) {
      await admin.from('conversation_messages').update({ status: 'failed', metadata: { error: sendError } }).eq('id', msg.id);
    }

    return NextResponse.json({ message: msg, sendError });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
