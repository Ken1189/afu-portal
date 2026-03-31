import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    // Auto-reply only — no notification to Devon/Peter (too noisy for newsletter signups)
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Welcome to the AFU Newsletter!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:30px;text-align:center">
          <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
          <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Newsletter</p>
        </div>
        <div style="padding:30px;background:#f8faf6">
          <h2 style="color:#1B2A4A;margin-top:0">Welcome to the AFU Newsletter!</h2>
          <p style="color:#333;line-height:1.6">You'll receive monthly updates on African agriculture, market insights, and farmer stories straight to your inbox.</p>
          <div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px">
            <p style="margin:0;color:#555;font-size:14px"><strong>What to expect:</strong></p>
            <ul style="margin:8px 0 0;padding-left:18px;color:#555;font-size:14px;line-height:1.8">
              <li>Market price updates across Africa</li>
              <li>Success stories from AFU farmers</li>
              <li>New services and feature launches</li>
              <li>Agricultural tips and best practices</li>
            </ul>
          </div>
          <p style="color:#333;line-height:1.6">While you wait for the next issue, explore our platform:</p>
          <ul style="color:#555;line-height:2">
            <li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li>
            <li><a href="https://africanfarmingunion.org/apply" style="color:#5DB347">Become a Member</a></li>
            <li><a href="https://africanfarmingunion.org/marketplace" style="color:#5DB347">AFU Marketplace</a></li>
            <li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li>
          </ul>
          <p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p>
        </div>
        <div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Newsletter notify error:', err);
    return NextResponse.json({ success: true }); // Don't fail the form even if email fails
  }
}
