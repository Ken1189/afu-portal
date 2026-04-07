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

    // Notify all 3 admins + write to universal inbox
    await notifyAdmins({
      subject: `New Membership Application from ${name} — ${tier} tier — ${country}`,
      type: 'application',
      data: {
        name, email, phone: phone || '', country, tier,
        organization: organization || '', farmSize: farmSize || '',
        crops: crops || '', about: about || '',
      },
      reply_to: email,
      name, phone, country,
      businessName: organization,
      tags: ['application', String(tier)],
    });

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

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Apply notify error:', err);
    return NextResponse.json({ error: 'Failed to process application notification' }, { status: 500 });
  }
}
