import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createInboxConversation } from '@/lib/inbox/create-conversation';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

export async function POST(req: Request) {
  try {
    const { name, email, tier, country, phone, organization, farmSize, crops, about } = await req.json();

    if (!name || !email || !tier || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = name.split(' ')[0];

    // Notify Devon + Peter
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_TO,
      subject: `New Membership Application from ${name} — ${tier} tier — ${country}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:24px;text-align:center">
          <h2 style="color:#5DB347;margin:0;font-size:20px">New Membership Application</h2>
          <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">AFU Portal</p>
        </div>
        <div style="padding:24px;background:#f8faf6">
          <div style="background:white;border-left:4px solid #5DB347;padding:14px;border-radius:4px;margin-bottom:18px">
            <p style="margin:0;font-size:15px;color:#1B2A4A;font-weight:600">${name} wants to join as a <strong>${tier}</strong> member</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b;width:130px">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A;font-weight:500">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Country</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${country}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Tier</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#5DB347;font-weight:600">${tier}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Organization</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${organization || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Farm Size</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${farmSize ? farmSize + ' ha' : 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Crops</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${crops || 'N/A'}</td></tr>
            ${about ? `<tr><td style="padding:10px 0;color:#64748b;vertical-align:top">About</td><td style="padding:10px 0;color:#1B2A4A">${about.substring(0, 500)}</td></tr>` : ''}
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
      subject: 'Welcome to the African Farming Union!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:30px;text-align:center">
          <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
          <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p>
        </div>
        <div style="padding:30px;background:#f8faf6">
          <h2 style="color:#1B2A4A;margin-top:0">Welcome, ${firstName}!</h2>
          <p style="color:#333;line-height:1.6">Your <strong>${tier}</strong> membership application has been received and will be reviewed within <strong>48 hours</strong>.</p>
          <div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px">
            <p style="margin:0;color:#555;font-size:14px">A real person from our team will review your application and reach out to welcome you personally. We can't wait to start this journey with you.</p>
          </div>
          <p style="color:#333;line-height:1.6">In the meantime, explore our platform:</p>
          <ul style="color:#555;line-height:2">
            <li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li>
            <li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Benefits</a></li>
            <li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li>
            <li><a href="https://africanfarmingunion.org/marketplace" style="color:#5DB347">AFU Marketplace</a></li>
          </ul>
          <p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p>
        </div>
        <div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div>
      </div>`,
    });

    // Create inbox conversation
    createInboxConversation({
      name, email, phone, country, type: tier === 'ambassador' ? 'ambassador' : tier === 'partner' ? 'supplier' : 'member',
      subject: `${tier} Application`,
      message: `Tier: ${tier}\nCountry: ${country}\nPhone: ${phone || 'N/A'}\nOrg: ${organization || 'N/A'}\nFarm: ${farmSize || 'N/A'} ha\nCrops: ${crops || 'N/A'}\n\n${about || ''}`,
      tags: ['application', tier],
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Apply notify error:', err);
    return NextResponse.json({ success: true }); // Don't fail the form even if email fails
  }
}
