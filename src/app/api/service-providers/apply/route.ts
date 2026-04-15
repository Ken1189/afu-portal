import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimitAsync } from '@/lib/rateLimit';
import { sendEmail, notifyAdmins } from '@/lib/email';

const VALID_TYPES = ['trader', 'vet', 'offtaker', 'processing_hub'] as const;

const TYPE_LABELS: Record<string, string> = {
  trader: 'Commodity Trader',
  vet: 'Veterinary Services',
  offtaker: 'Offtake Partner',
  processing_hub: 'Processing Hub',
};

export async function POST(req: Request) {
  // Rate limit
  const blocked = await rateLimitAsync(req);
  if (blocked) return blocked;

  const body = await req.json();

  // Validate required fields
  const { provider_type, full_name, email, country, agreed_to_terms } = body;

  if (!provider_type || !VALID_TYPES.includes(provider_type)) {
    return NextResponse.json({ error: 'Invalid provider type' }, { status: 400 });
  }
  if (!full_name || !email || !country) {
    return NextResponse.json({ error: 'Name, email, and country are required' }, { status: 400 });
  }
  if (!agreed_to_terms) {
    return NextResponse.json({ error: 'You must agree to the terms' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const svc = await createAdminClient();

  // Check for duplicate email + type
  const { data: existing } = await svc
    .from('service_provider_applications')
    .select('id, status')
    .eq('email', email)
    .eq('provider_type', provider_type)
    .in('status', ['pending', 'approved'])
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: existing.status === 'approved' ? 'You are already registered as this provider type.' : 'You already have a pending application.' },
      { status: 409 }
    );
  }

  // Build provider_details from type-specific fields
  const providerDetails = body.provider_details || {};

  // Insert
  const { data, error } = await svc
    .from('service_provider_applications')
    .insert({
      provider_type,
      full_name,
      email,
      phone: body.phone || null,
      country,
      business_name: body.business_name || null,
      business_registration: body.business_registration || null,
      years_experience: body.years_experience || null,
      website: body.website || null,
      motivation: body.motivation || null,
      referral_source: body.referral_source || null,
      agreed_to_terms: true,
      provider_details: providerDetails,
    })
    .select()
    .single();

  if (error) {
    console.error('[service-providers/apply] insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const typeLabel = TYPE_LABELS[provider_type] || provider_type;

  // Confirmation email to applicant
  try {
    await sendEmail(
      email,
      `${typeLabel} Application Received — African Farming Union`,
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1B2A4A; margin-bottom: 4px;">African Farming Union</h1>
        <div style="height: 3px; width: 60px; background: #5DB347; margin-bottom: 20px;"></div>
        <h2 style="color: #1B2A4A;">Application Received</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Dear ${full_name},
        </p>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for applying to join the African Farming Union as a <strong>${typeLabel}</strong>.
          We have received your application and our team will review it within 3-5 business days.
        </p>
        <div style="background: #f8fdf6; border-left: 4px solid #5DB347; padding: 16px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Application type:</strong> ${typeLabel}<br/>
            <strong>Country:</strong> ${country}
          </p>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          We will contact you at <strong>${email}</strong> once your application has been reviewed.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          African Farming Union | info@africanfarmingunion.org
        </p>
      </div>
      `,
    );
  } catch (err) {
    console.error("[service-providers/apply] confirmation email non-critical:", err);
    // Silent — don't fail the request
  }

  // Notify admins
  try {
    await notifyAdmins({
      subject: `New ${typeLabel} Application`,
      type: 'service_provider_application',
      data: { provider_type, full_name, email, country },
      name: full_name,
      country,
    });
  } catch (err) {
    console.error("[service-providers/apply] admin notification non-critical:", err);
    // Silent
  }

  return NextResponse.json({ success: true, id: data?.id });
}
