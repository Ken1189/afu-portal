import { NextRequest, NextResponse } from 'next/server';
import { createInboxConversation } from '@/lib/inbox/create-conversation';
import { sendEmail } from '@/lib/email';

const ADMIN_EMAILS = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * POST /api/chat/human — Public endpoint for chatbot "Talk to Human" requests.
 * No authentication required (visitors are not logged in).
 * Creates an inbox conversation and notifies admins via email.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, message, chatHistory, conversationId } = body;

    // Length validation
    if (name && String(name).length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100)' }, { status: 400 });
    }
    if (email && String(email).length > 200) {
      return NextResponse.json({ error: 'Email too long (max 200)' }, { status: 400 });
    }
    if (message && String(message).length > 5000) {
      return NextResponse.json({ error: 'Message too long (max 5000)' }, { status: 400 });
    }

    // Get request IP for conversation owner verification
    const forwardedFor = req.headers.get('x-forwarded-for');
    const requestIp = forwardedFor?.split(',')[0]?.trim() || 'unknown';

    // ── Follow-up message to an existing conversation ──
    if (conversationId && message) {
      const { createClient } = await import('@supabase/supabase-js');
      const db = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Verify conversation exists and belongs to the same email/IP
      const { data: existingConvo, error: convoErr } = await db
        .from('conversations')
        .select('id, email, ip_address')
        .eq('id', conversationId)
        .maybeSingle();

      if (convoErr || !existingConvo) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      const emailMatches = email && existingConvo.email && existingConvo.email === email;
      const ipMatches = existingConvo.ip_address && existingConvo.ip_address === requestIp;
      if (!emailMatches && !ipMatches) {
        return NextResponse.json({ error: 'Not authorized for this conversation' }, { status: 403 });
      }

      await db.from('conversation_messages').insert({
        conversation_id: conversationId,
        direction: 'inbound',
        channel: 'chat',
        sender_name: name || 'Visitor',
        sender_email: email || null,
        body: message,
        status: 'delivered',
      });

      // Bump conversation timestamp + unread count
      await db.from('conversations').update({
        last_message_at: new Date().toISOString(),
        unread_count: 1,
        updated_at: new Date().toISOString(),
      }).eq('id', conversationId);

      return NextResponse.json({ success: true, conversationId });
    }

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Build the full message body with chat context
    const fullMessage = [
      message || '',
      '',
      '--- Chat History ---',
      chatHistory || '(no history)',
    ].filter(Boolean).join('\n');

    // Create inbox conversation using service-role client (no auth needed)
    const result = await createInboxConversation({
      name,
      email,
      phone: phone || undefined,
      type: 'lead',
      subject: 'Chat — Talk to Human',
      message: fullMessage,
      channel: 'form',
      tags: ['chatbot', 'talk-to-human'],
    });

    // Send email notification to admins — uses centralized sendEmail from @/lib/email
    try {
      const safeName = escapeHtml(name);
      const safeEmail = escapeHtml(email);
      const safePhone = escapeHtml(phone);
      const safeMessage = escapeHtml(message);
      const safeChatHistory = escapeHtml(chatHistory || '(no history)');
      const adminHtml = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:20px;text-align:center">
            <h2 style="color:#5DB347;margin:0">New Chat Request</h2>
            <p style="color:#8CB89C;margin:4px 0 0;font-size:13px">Someone wants to talk to a human</p>
          </div>
          <div style="padding:24px;background:#f8faf6">
            <p style="color:#333;font-size:14px"><strong>Name:</strong> ${safeName}</p>
            <p style="color:#333;font-size:14px"><strong>Email:</strong> ${safeEmail}</p>
            ${phone ? `<p style="color:#333;font-size:14px"><strong>Phone:</strong> ${safePhone}</p>` : ''}
            ${message ? `<hr style="border:1px solid #eee;margin:16px 0"><p style="color:#333;font-size:14px"><strong>Message:</strong></p><p style="color:#555;font-size:14px;white-space:pre-wrap">${safeMessage}</p>` : ''}
            <hr style="border:1px solid #eee;margin:16px 0">
            <p style="color:#999;font-size:12px"><strong>Chat History:</strong></p>
            <pre style="color:#777;font-size:12px;white-space:pre-wrap;background:#fff;padding:12px;border-radius:6px;border:1px solid #eee">${safeChatHistory}</pre>
          </div>
          <div style="padding:16px;text-align:center">
            <a href="https://africanfarmingunion.org/admin/inbox${result.id ? `?conversation=${result.id}` : ''}" style="display:inline-block;padding:10px 24px;background:#5DB347;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:600">View in Inbox</a>
          </div>
          <div style="padding:12px;text-align:center;color:#999;font-size:11px">
            African Farming Union | africanfarmingunion.org
          </div>
        </div>`;
      for (const recipient of ADMIN_EMAILS) {
        await sendEmail(recipient, `[AFU Chat] Talk to Human request from ${name}`, adminHtml);
      }
    } catch (emailErr) {
      console.error('Chat human email notification error:', emailErr);
      // Don't fail the request if email notification fails
    }

    // Send auto-reply to the visitor
    try {
      const firstName = escapeHtml(String(name).split(' ')[0]);
      await sendEmail(
        email,
        'We received your message - African Farming Union',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:24px;text-align:center">
            <h1 style="color:#5DB347;margin:0;font-size:22px">African Farming Union</h1>
            <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">Farmers for Farmers</p>
          </div>
          <div style="padding:28px;background:#f8faf6">
            <h2 style="color:#1B2A4A;margin-top:0">Hi ${firstName}!</h2>
            <p style="color:#333;line-height:1.6;font-size:14px">Thanks for reaching out through our chat. A member of our team will get back to you within <strong>24 hours</strong>.</p>
            <p style="color:#333;line-height:1.6;font-size:14px">In the meantime, feel free to explore:</p>
            <ul style="color:#555;line-height:2;font-size:14px">
              <li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li>
              <li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Tiers</a></li>
              <li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Serve</a></li>
            </ul>
            <p style="color:#333;font-size:14px">Best regards,<br><strong>The AFU Team</strong></p>
          </div>
          <div style="padding:16px;text-align:center;color:#999;font-size:11px">
            African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org
          </div>
        </div>`,
      );
    } catch (autoReplyErr) {
      console.error('Chat human auto-reply error:', autoReplyErr);
    }

    return NextResponse.json({ success: true, conversationId: result.id });
  } catch (err) {
    console.error('Chat human endpoint error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
