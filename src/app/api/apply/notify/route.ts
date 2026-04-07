import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { createInboxConversation } from '@/lib/inbox/create-conversation';

const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

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
    const { name, email, tier, country, phone, organization, farmSize, crops, about } = await req.json();

    if (!name || !email || !tier || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Input length validation
    if (String(name).length > 100) {
      return NextResponse.json({ error: 'Name too long (max 100)' }, { status: 400 });
    }
    if (String(email).length > 200) {
      return NextResponse.json({ error: 'Email too long (max 200)' }, { status: 400 });
    }
    if (about && String(about).length > 5000) {
      return NextResponse.json({ error: 'About text too long (max 5000)' }, { status: 400 });
    }
    if (organization && String(organization).length > 200) {
      return NextResponse.json({ error: 'Organization too long (max 200)' }, { status: 400 });
    }
    if (crops && String(crops).length > 500) {
      return NextResponse.json({ error: 'Crops field too long (max 500)' }, { status: 400 });
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeTier = escapeHtml(tier);
    const safeCountry = escapeHtml(country);
    const safePhone = escapeHtml(phone);
    const safeOrganization = escapeHtml(organization);
    const safeFarmSize = escapeHtml(farmSize);
    const safeCrops = escapeHtml(crops);
    const safeAbout = escapeHtml(about ? String(about).substring(0, 500) : '');
    const firstName = escapeHtml(String(name).split(' ')[0]);

    // Notify Devon + Peter — uses centralized sendEmail from @/lib/email
    for (const recipient of NOTIFY_TO) {
      await sendEmail(
        recipient,
        `New Membership Application from ${name} — ${tier} tier — ${country}`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:24px;text-align:center">
          <h2 style="color:#5DB347;margin:0;font-size:20px">New Membership Application</h2>
          <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">AFU Portal</p>
        </div>
        <div style="padding:24px;background:#f8faf6">
          <div style="background:white;border-left:4px solid #5DB347;padding:14px;border-radius:4px;margin-bottom:18px">
            <p style="margin:0;font-size:15px;color:#1B2A4A;font-weight:600">${safeName} wants to join as a <strong>${safeTier}</strong> member</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b;width:130px">Name</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A;font-weight:500">${safeName}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A"><a href="mailto:${safeEmail}" style="color:#2563eb">${safeEmail}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${safePhone || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Country</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${safeCountry}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Tier</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#5DB347;font-weight:600">${safeTier}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Organization</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${safeOrganization || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Farm Size</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${safeFarmSize ? safeFarmSize + ' ha' : 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Crops</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${safeCrops || 'N/A'}</td></tr>
            ${safeAbout ? `<tr><td style="padding:10px 0;color:#64748b;vertical-align:top">About</td><td style="padding:10px 0;color:#1B2A4A">${safeAbout}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;text-align:center">
            <a href="https://africanfarmingunion.org/admin/applications" style="display:inline-block;background:#5DB347;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Review in Admin</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div>
      </div>`,
      );
    }

    // Auto-reply to applicant
    await sendEmail(
      email,
      'Welcome to the African Farming Union!', `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:30px;text-align:center">
          <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
          <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Farmers for Farmers</p>
        </div>
        <div style="padding:30px;background:#f8faf6">
          <h2 style="color:#1B2A4A;margin-top:0">Welcome, ${firstName}!</h2>
          <p style="color:#333;line-height:1.6">Your <strong>${safeTier}</strong> membership application has been received and will be reviewed within <strong>48 hours</strong>.</p>
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
    );

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
    return NextResponse.json({ error: 'Failed to process application notification' }, { status: 500 });
  }
}
