import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimitAsync } from '@/lib/rateLimit';
import { sendEmail, notifyAdmins } from '@/lib/email';

export async function POST(req: Request) {
  // Rate limit
  const blocked = await rateLimitAsync(req);
  if (blocked) return blocked;

  const body = await req.json();

  // Validate required fields
  if (!body.full_name || !body.email || !body.country || !body.trading_type || !body.agreed_to_terms) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const svc = await createAdminClient();

  // Insert trader application
  const { data, error } = await svc.from('service_provider_applications').insert({
    full_name: body.full_name,
    email: body.email,
    phone: body.phone || null,
    country: body.country,
    business_name: body.business_name || null,
    business_registration: body.business_registration || null,
    trading_type: body.trading_type,
    experience_level: body.experience_level || 'new',
    annual_volume: body.annual_volume || null,
    preferred_commodities: body.preferred_commodities || [],
    preferred_countries: body.preferred_countries || [],
    settlement_currency: body.settlement_currency || 'USD',
    bank_name: body.bank_name || null,
    bank_account: body.bank_account || null,
    has_export_license: body.has_export_license || false,
    export_license_number: body.export_license_number || null,
    motivation: body.motivation || null,
    referral_source: body.referral_source || null,
    agreed_to_terms: body.agreed_to_terms,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send confirmation email to applicant (fire and forget)
  try {
    await sendEmail(body.email, 'Trading Application Received — AFU', `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1B2A4A;">African Farming Union</h1>
        <h2 style="color: #5DB347;">Trading Application Received</h2>
        <p>Dear ${body.full_name},</p>
        <p>Thank you for applying to trade on the AFU platform. We have received your application and will review it within 3-5 business days.</p>
        <p><strong>Trading type:</strong> ${body.trading_type}</p>
        <p><strong>Country:</strong> ${body.country}</p>
        <p>We will contact you at ${body.email} once your application has been reviewed.</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">African Farming Union | info@africanfarmingunion.org</p>
      </div>
    `);
  } catch (err) { console.error("[trading/signup] confirmation email non-critical:", err); }

  // Notify admins
  try {
    await notifyAdmins({
      subject: 'New Trader Application',
      type: 'trader_application',
      data: { full_name: body.full_name, email: body.email, country: body.country, trading_type: body.trading_type },
      name: body.full_name,
      country: body.country,
    });
  } catch (err) { console.error("[trading/signup] admin notification non-critical:", err); }

  return NextResponse.json({ success: true, id: data?.id });
}
