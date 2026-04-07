import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

export async function POST(req: Request) {
  try {
    const {
      action, // 'apply' | 'upgrade' | 'renew'
      tier, // 'bronze' | 'silver' | 'gold' | 'platinum'
      sponsoredItem, // free-text: program/job/initiative being sponsored (optional)
      company,
      contactName,
      email,
      phone,
      country,
      notes,
    } = await req.json();

    if (!tier || !company || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: tier, company, email' },
        { status: 400 }
      );
    }

    const subject = `Sponsorship ${action || 'application'} — ${company} (${tier})`;

    await resend.emails.send({
      from: FROM,
      to: NOTIFY_TO,
      subject,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:24px;text-align:center">
          <h2 style="color:#D4A843;margin:0;font-size:20px">Sponsorship ${action || 'Application'}</h2>
          <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">AFU Supplier Sponsorship</p>
        </div>
        <div style="padding:24px;background:#FAF7F0">
          <div style="background:white;border-left:4px solid #D4A843;padding:14px;border-radius:4px;margin-bottom:18px">
            <p style="margin:0;font-size:15px;color:#1B2A4A;font-weight:600">
              ${company} wants to ${action || 'apply for'} the <strong>${tier.toUpperCase()}</strong> tier
            </p>
            ${sponsoredItem ? `<p style="margin:8px 0 0;font-size:13px;color:#64748b">Sponsoring: <strong>${sponsoredItem}</strong></p>` : ''}
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b;width:130px">Business</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A;font-weight:500">${company}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Contact</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${contactName || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Country</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${country || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Tier</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#D4A843;font-weight:600">${tier.toUpperCase()}</td></tr>
            ${sponsoredItem ? `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Item</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${sponsoredItem}</td></tr>` : ''}
            ${notes ? `<tr><td style="padding:10px 0;color:#64748b;vertical-align:top">Notes</td><td style="padding:10px 0;color:#1B2A4A">${notes}</td></tr>` : ''}
          </table>
        </div>
      </div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Sponsorship apply error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to submit sponsorship request' },
      { status: 500 }
    );
  }
}
