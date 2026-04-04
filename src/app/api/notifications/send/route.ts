import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

/**
 * POST /api/notifications/send
 * Generic notification email sender for status updates.
 * Body: { to, name, subject, message }
 */
export async function POST(req: Request) {
  try {
    const { to, name, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = name?.split(' ')[0] || 'Member';

    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:24px;text-align:center">
          <h2 style="color:#5DB347;margin:0;font-size:20px">African Farming Union</h2>
        </div>
        <div style="padding:24px;background:#f8faf6">
          <p style="font-size:15px;color:#333">Hi ${firstName},</p>
          <div style="background:white;border-left:4px solid #5DB347;padding:16px;border-radius:4px;margin:16px 0">
            <p style="margin:0;font-size:14px;color:#1B2A4A">${message}</p>
          </div>
          <div style="text-align:center;margin-top:20px">
            <a href="https://africanfarmingunion.org/dashboard" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Go to Dashboard</a>
          </div>
        </div>
        <div style="padding:12px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Notification send error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
