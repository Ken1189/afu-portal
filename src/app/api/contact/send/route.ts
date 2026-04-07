import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createInboxConversation } from '@/lib/inbox/create-conversation';

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
      return NextResponse.json({ error: 'Organization too long (max 200)' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeOrganization = escapeHtml(organization);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');
    const firstName = escapeHtml(String(name).split(' ')[0]);
    const messagePreview = escapeHtml(String(message).substring(0, 200)) + (String(message).length > 200 ? '...' : '');

    // Email to Peter + Devon — uses centralized sendEmail from @/lib/email
    const notifyRecipients = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];
    for (const recipient of notifyRecipients) {
      await sendEmail(
        recipient,
        `[AFU Contact] ${subject} — from ${name}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Contact Form Submission</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Name:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Organization:</strong> ${safeOrganization || 'N/A'}</p><p><strong>Subject:</strong> ${safeSubject}</p><hr style="border:1px solid #eee"><p><strong>Message:</strong></p><p>${safeMessage}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
      );
    }

    // Auto-reply to submitter
    await sendEmail(
      email,
      'Thank you for contacting the African Farming Union',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">Thank you, ${firstName}!</h2><p style="color:#333;line-height:1.6">We've received your message and a member of our team will get back to you within <strong>24-48 hours</strong>.</p><div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px"><p style="margin:0;color:#555;font-size:14px"><strong>Your message:</strong></p><p style="margin:8px 0 0;color:#777;font-size:14px">${messagePreview}</p></div><p style="color:#333;line-height:1.6">In the meantime, explore our platform:</p><ul style="color:#555;line-height:2"><li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li><li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Tiers</a></li><li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li></ul><p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org | African Countries</div></div>`,
    );

    // Create inbox conversation
    createInboxConversation({
      name, email, subject: `Contact: ${subject}`, type: subject === 'investor' ? 'investor' : 'lead',
      message: `Organization: ${organization || 'N/A'}\n\n${message}`,
      tags: [subject], country: undefined,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return NextResponse.json({ error: 'Failed to send contact email' }, { status: 500 });
  }
}
