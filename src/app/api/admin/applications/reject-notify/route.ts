import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

/**
 * POST /api/admin/applications/reject-notify
 * Sends a rejection notification email to the applicant.
 */
export async function POST(req: Request) {
  try {
    const { email, full_name, notes, type } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const firstName = full_name?.split(' ')[0] || 'Applicant';
    const appType = type === 'ambassador' ? 'Ambassador' : type === 'supplier' ? 'Supplier' : 'Membership';

    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Update on Your AFU ${appType} Application`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:30px;text-align:center">
          <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
        </div>
        <div style="padding:30px;background:#f8faf6">
          <h2 style="color:#1B2A4A;margin-top:0">Dear ${firstName},</h2>
          <p style="color:#333;font-size:15px;line-height:1.6">
            Thank you for your interest in the African Farming Union. After careful review, we are unable to approve your ${appType.toLowerCase()} application at this time.
          </p>
          ${notes ? `<div style="background:white;border-left:4px solid #F59E0B;padding:16px;border-radius:4px;margin:20px 0"><p style="color:#333;font-size:14px;margin:0"><strong>Feedback:</strong> ${notes}</p></div>` : ''}
          <p style="color:#333;font-size:15px;line-height:1.6">
            This doesn't have to be the end of the road. We encourage you to:
          </p>
          <ul style="color:#333;font-size:14px;line-height:1.8">
            <li>Review the feedback above and address any gaps</li>
            <li>Reapply when you're ready — we'd love to hear from you again</li>
            <li><a href="https://africanfarmingunion.org/contact" style="color:#2563eb">Contact us</a> if you have questions about this decision</li>
          </ul>
          <p style="color:#333;font-size:15px;line-height:1.6">
            We're committed to supporting African agriculture and hope to work with you in the future.
          </p>
          <p style="color:#333;font-size:14px;margin-top:20px">
            Warm regards,<br>
            <strong>The AFU Team</strong>
          </p>
        </div>
        <div style="padding:16px;text-align:center;color:#999;font-size:12px">
          African Farming Union | <a href="https://africanfarmingunion.org" style="color:#999">africanfarmingunion.org</a>
        </div>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Rejection notify error:', err);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
