import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

export async function POST(req: Request) {
  try {
    const { name, email, organization, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Email to Peter
    await resend.emails.send({
      from: FROM,
      to: ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'],
      subject: `[AFU Contact] ${subject} — from ${name}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:20px;text-align:center"><h2 style="color:#5DB347;margin:0">New Contact Form Submission</h2></div><div style="padding:20px;background:#f8faf6"><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Organization:</strong> ${organization || 'N/A'}</p><p><strong>Subject:</strong> ${subject}</p><hr style="border:1px solid #eee"><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p></div><div style="padding:15px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div></div>`,
    });

    // Auto-reply to submitter
    const firstName = name.split(' ')[0];
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Thank you for contacting the African Farming Union',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:#1B2A4A;padding:30px;text-align:center"><h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1><p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p></div><div style="padding:30px;background:#f8faf6"><h2 style="color:#1B2A4A;margin-top:0">Thank you, ${firstName}!</h2><p style="color:#333;line-height:1.6">We've received your message and a member of our team will get back to you within <strong>24-48 hours</strong>.</p><div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px"><p style="margin:0;color:#555;font-size:14px"><strong>Your message:</strong></p><p style="margin:8px 0 0;color:#777;font-size:14px">${message.substring(0, 200)}${message.length > 200 ? '...' : ''}</p></div><p style="color:#333;line-height:1.6">In the meantime, explore our platform:</p><ul style="color:#555;line-height:2"><li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li><li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Tiers</a></li><li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li></ul><p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p></div><div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org | 20 African Countries</div></div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return NextResponse.json({ success: true }); // Don't fail the form even if email fails
  }
}
