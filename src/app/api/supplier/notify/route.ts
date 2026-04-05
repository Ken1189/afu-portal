import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createInboxConversation } from '@/lib/inbox/create-conversation';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

export async function POST(req: Request) {
  try {
    const { company, contactName, email, phone, country, category, website, description } = await req.json();

    if (!company || !email || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const firstName = (contactName || company).split(' ')[0];

    // Notify Devon + Peter
    await resend.emails.send({
      from: FROM,
      to: NOTIFY_TO,
      subject: `New Supplier Application from ${company} — ${category}`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:24px;text-align:center">
          <h2 style="color:#5DB347;margin:0;font-size:20px">New Supplier Application</h2>
          <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">AFU Supplier Network</p>
        </div>
        <div style="padding:24px;background:#f8faf6">
          <div style="background:white;border-left:4px solid #5DB347;padding:14px;border-radius:4px;margin-bottom:18px">
            <p style="margin:0;font-size:15px;color:#1B2A4A;font-weight:600">${company} wants to join the AFU supplier network (${category})</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b;width:130px">Business</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A;font-weight:500">${company}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Contact</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${contactName || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Email</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Phone</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${phone || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Country</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${country || 'N/A'}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Category</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#5DB347;font-weight:600">${category}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #eee;color:#64748b">Website</td><td style="padding:10px 0;border-bottom:1px solid #eee;color:#1B2A4A">${website ? `<a href="${website}" style="color:#2563eb">${website}</a>` : 'N/A'}</td></tr>
            ${description ? `<tr><td style="padding:10px 0;color:#64748b;vertical-align:top">Description</td><td style="padding:10px 0;color:#1B2A4A">${description.substring(0, 500)}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;text-align:center">
            <a href="https://africanfarmingunion.org/admin/applications" style="display:inline-block;background:#5DB347;color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Review in Admin</a>
          </div>
        </div>
        <div style="padding:16px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div>
      </div>`,
    });

    // Auto-reply to supplier
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Thank you for applying to the AFU Supplier Network!',
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1B2A4A;padding:30px;text-align:center">
          <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
          <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Supplier Network</p>
        </div>
        <div style="padding:30px;background:#f8faf6">
          <h2 style="color:#1B2A4A;margin-top:0">Thank you, ${firstName}!</h2>
          <p style="color:#333;line-height:1.6">Thank you for applying to join the AFU supplier network! We'll review your application within <strong>48 hours</strong>.</p>
          <div style="background:white;border-left:4px solid #5DB347;padding:15px;margin:20px 0;border-radius:4px">
            <p style="margin:0;color:#555;font-size:14px">As an AFU supplier, you'll gain access to thousands of farmers across Africa who need quality ${category} products and services. We'll match you with the right opportunities.</p>
          </div>
          <p style="color:#333;line-height:1.6">In the meantime, explore our platform:</p>
          <ul style="color:#555;line-height:2">
            <li><a href="https://africanfarmingunion.org/services" style="color:#5DB347">Our Services</a></li>
            <li><a href="https://africanfarmingunion.org/marketplace" style="color:#5DB347">AFU Marketplace</a></li>
            <li><a href="https://africanfarmingunion.org/countries" style="color:#5DB347">Countries We Operate In</a></li>
            <li><a href="https://africanfarmingunion.org/memberships" style="color:#5DB347">Membership Tiers</a></li>
          </ul>
          <p style="color:#333">Best regards,<br><strong>The AFU Team</strong></p>
        </div>
        <div style="padding:20px;text-align:center;color:#999;font-size:12px">African Farming Union | Gaborone, Botswana<br>africanfarmingunion.org</div>
      </div>`,
    });

    createInboxConversation({
      name: contactName || company, email, phone, country, type: 'supplier',
      subject: 'Supplier Application',
      message: `Company: ${company}\nContact: ${contactName}\nCategory: ${category || 'N/A'}\nCountry: ${country || 'N/A'}\nWebsite: ${website || 'N/A'}\n\n${description || ''}`,
      tags: ['supplier', 'application'], businessName: company,
    }).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Supplier notify error:', err);
    return NextResponse.json({ success: true }); // Don't fail the form even if email fails
  }
}
