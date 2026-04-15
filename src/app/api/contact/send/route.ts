import { NextResponse } from 'next/server';
import { sendEmail, notifyAdmins } from '@/lib/email';

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(req: Request) {
  try {
    // Rate limit: max 5 contact submissions per IP per minute
    const { rateLimitAsync } = await import('@/lib/rateLimit');
    const blocked = await rateLimitAsync(req);
    if (blocked) return blocked;

    const { name, email, organization, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Length validation
    if (String(name).length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100)' }, { status: 400 });
    }
    if (String(email).length > 200) {
      return NextResponse.json({ error: 'Email too long (max 200)' }, { status: 400 });
    }
    if (String(message).length > 5000) {
      return NextResponse.json({ error: 'Message too long (max 5000)' }, { status: 400 });
    }
    if (String(subject).length > 200) {
      return NextResponse.json({ error: 'Subject too long (max 200)' }, { status: 400 });
    }
    if (organization && String(organization).length > 200) {
      return NextResponse.json({ error: 'Organisation too long (max 200)' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOrganization = escapeHtml(organization);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    const firstName = escapeHtml(String(name).split(' ')[0]);
    const messagePreview = escapeHtml(String(message).substring(0, 200)) + (String(message).length > 200 ? '...' : '');

    // Notify admins (non-blocking — don't fail the request if email fails)
    try {
      await notifyAdmins({
        subject: `[AFU Contact] ${subject} — from ${name}`,
        type: 'contact',
        data: { name, email, organization: organization || '', subject, message },
        reply_to: email,
        name,
        tags: ['contact', String(subject)],
      });
    } catch (adminErr) {
      console.error('Admin notification failed:', adminErr);
      // Continue — don't fail the contact form just because admin email failed
    }

    // Auto-reply to submitter (non-blocking)
    try {
      await sendEmail(
        email,
        'Thank you for contacting the African Farming Union',
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">Thank you, ${firstName}!</h2><p style="color:#333;line-height:1.6">We have received your message and a member of our team will get back to you within <strong>24-48 hours</strong>.</p><div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px"><p style="margin:0;color:#555;font-size:14px"><strong>Your message:</strong></p><p style="margin:8px 0 0;color:#777;font-size:14px">${messagePreview}</p></div><p style="color:#333;line-height:1.6">In the meantime, explore our platform:</p><ul style="color:#555;line-height:2"><li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li><li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Tiers</a></li><li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li></ul><p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org | African Countries</div></div>`,
      );
    } catch (replyErr) {
      console.error('Auto-reply email failed:', replyErr);
      // Continue — contact was still received
    }

    // Also store in DB so it's visible in admin inbox even if email fails
    try {
      const { createAdminClient } = await import('@/lib/supabase/server');
      const svc = await createAdminClient();
      await svc.from('contact_submissions').insert({
        name: safeName,
        email: safeEmail,
        organization: safeOrganization || null,
        subject: safeSubject,
        message: safeMessage,
      });
    } catch (err) {
      console.error("[contact/send] DB insert non-critical:", err);
      // contact_submissions table might not exist — that's OK
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return NextResponse.json({ error: 'Failed to send contact email' }, { status: 500 });
  }
}
