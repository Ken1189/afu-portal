import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

export async function POST(req: Request) {
  try {
    const { name, email, country, phone, sector, bio, region } = await req.json();

    if (!name || !email || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = name.split(' ')[0];

    // Notify Devon + Peter
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_TO,
      subject: `New Ambassador Application from ${name} — ${country}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:24px;text-align:center">
          <h2 style="color:#5DB347;margin:0;font-size:20px">New Ambassador Application</h2>
          <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">AFU Ambassador Program</p>
        </div>
        <div style="padding:24px;background:#f8faf6">
          <div style="background:white;border-left:4px solid #5DB347;padding:14px;border-radius:4px;margin-bottom:18px">
            <p style="margin:0;font-size:15px;color:#1B2A4A;font-weight:600">${name} from ${country} wants to become an AFU Ambassador</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b;width:130px">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A;font-weight:500">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Country</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${country}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Region</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${region || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Sector</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${sector || 'N/A'}</td></tr>
            ${bio ? `<tr><td style="padding:10px 0;color:#64748b;vertical-align:top">Motivation</td><td style="padding:10px 0;color:#1B2A4A">${bio.substring(0, 500)}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;text-align:center">
            <a href="https://africanfarmingunion.org/admin/applications" style="display:inline-block;background:#5DB347;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Review in Admin</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div>
      </div>`,
    });

    // Auto-reply to applicant
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Thank you for applying to the AFU Ambassador Program!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:30px;text-align:center">
          <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
          <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Ambassador Program</p>
        </div>
        <div style="padding:30px;background:#f8faf6">
          <h2 style="color:#1B2A4A;margin-top:0">Thank you, ${firstName}!</h2>
          <p style="color:#333;line-height:1.6">Thank you for applying to the AFU Ambassador Program! We review applications within <strong>48 hours</strong>.</p>
          <div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px">
            <p style="margin:0;color:#555;font-size:14px">As an AFU Ambassador, you'll earn commissions for every farmer you refer, access exclusive resources, and play a key role in transforming African agriculture.</p>
          </div>
          <p style="color:#333;line-height:1.6">While you wait, explore what's ahead:</p>
          <ul style="color:#555;line-height:2">
            <li><a href="https://africanfarmingunion.org/ambassadors" style="color:#5DB347">Ambassador Program Details</a></li>
            <li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li>
            <li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li>
            <li><a href="https://africanfarmingunion.org/marketplace" style="color:#5DB347">AFU Marketplace</a></li>
          </ul>
          <p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p>
        </div>
        <div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div>
      </div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Ambassador notify error:', err);
    return NextResponse.json({ success: true }); // Don't fail the form even if email fails
  }
}
