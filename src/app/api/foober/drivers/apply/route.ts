import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, notifyAdmins } from '@/lib/email';

/**
 * POST /api/foober/drivers/apply
 * Submit a Foober driver application
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, email, phone, country, region, city, vehicle_type, vehicle_registration, license_number, experience_description, promo_code } = body;

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Spam protection: honeypot + gibberish detection
    if (body.website_url || body.fax) {
      return NextResponse.json({ success: true }, { status: 200 });
    }
    const textFields = [full_name, experience_description].filter(Boolean);
    for (const text of textFields) {
      if (typeof text === 'string' && text.length > 10) {
        const vowelRatio = (text.match(/[aeiouAEIOU]/g) || []).length / text.length;
        const spaceRatio = (text.match(/ /g) || []).length / text.length;
        if (vowelRatio < 0.12 && spaceRatio < 0.05) {
          return NextResponse.json({ success: true }, { status: 200 });
        }
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for duplicate application
    const { data: existing } = await supabase
      .from('foober_driver_applications')
      .select('id, status')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      if (existing.status === 'pending') {
        return NextResponse.json({ error: 'You already have a pending application' }, { status: 409 });
      }
      if (existing.status === 'approved') {
        return NextResponse.json({ error: 'You are already an approved driver' }, { status: 409 });
      }
    }

    // Create application
    const { data: application, error } = await supabase
      .from('foober_driver_applications')
      .insert({
        full_name,
        email,
        phone: phone || null,
        country: country || null,
        region: region || null,
        city: city || null,
        vehicle_type: vehicle_type || 'motorcycle',
        vehicle_registration: vehicle_registration || null,
        license_number: license_number || null,
        experience_description: experience_description || null,
        promo_code: promo_code || null,
        status: 'pending',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[foober/apply]', error);
      return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    // Send confirmation email to applicant
    await sendEmail(
      email,
      'Foober Driver Application Received',
      `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B2A4A;">Application Received</h2>
        <p>Hi ${full_name},</p>
        <p>Thank you for applying to become a Foober delivery driver with the African Farming Union.</p>
        <p>We will review your application and get back to you within 2-3 business days.</p>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">African Farming Union — Foober Logistics</p>
      </div>`
    ).catch(() => {});

    // Notify admins
    await notifyAdmins({
      subject: `New Foober Driver Application: ${full_name}`,
      type: 'foober_driver_application',
      data: {
        name: full_name,
        email,
        phone: phone || '',
        city: city || '',
        country: country || '',
        vehicle_type: vehicle_type || 'motorcycle',
      },
      name: full_name,
      country: country || undefined,
    }).catch(() => {});

    return NextResponse.json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error('[foober/apply]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
