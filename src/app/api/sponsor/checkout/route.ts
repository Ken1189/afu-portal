import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const NOTIFY_TO = ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'];

// NOTE: Stripe integration coming soon — currently records the sponsorship in DB only.

function svc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface CheckoutBody {
  farmer_profile_id: string;
  sponsor_name: string;
  sponsor_email: string;
  sponsor_company?: string;
  sponsor_country?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'corporate';
  billing_cycle: 'monthly' | 'annual' | 'one_time';
  amount_usd: number;
  program_id?: string;
}

/**
 * POST /api/sponsor/checkout
 * Creates a sponsorship record in the DB and updates the farmer's funding stats.
 * No Stripe yet — pure DB write. Stripe integration coming soon.
 * Public endpoint — no auth required.
 */
export async function POST(req: NextRequest) {
  try {
    const body: CheckoutBody = await req.json();

    // Validate required fields
    const required: (keyof CheckoutBody)[] = [
      'farmer_profile_id',
      'sponsor_name',
      'sponsor_email',
      'tier',
      'billing_cycle',
      'amount_usd',
    ];

    for (const field of required) {
      if (body[field] === undefined || body[field] === null || body[field] === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.sponsor_email)) {
      return NextResponse.json(
        { error: 'Invalid sponsor_email format' },
        { status: 400 }
      );
    }

    // Validate tier
    const validTiers = ['bronze', 'silver', 'gold', 'corporate'];
    if (!validTiers.includes(body.tier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate billing_cycle
    const validCycles = ['monthly', 'annual', 'one_time'];
    if (!validCycles.includes(body.billing_cycle)) {
      return NextResponse.json(
        { error: `Invalid billing_cycle. Must be one of: ${validCycles.join(', ')}` },
        { status: 400 }
      );
    }

    if (typeof body.amount_usd !== 'number' || body.amount_usd <= 0) {
      return NextResponse.json(
        { error: 'amount_usd must be a positive number' },
        { status: 400 }
      );
    }

    const db = svc();

    // Verify the farmer profile exists and is active
    const { data: farmer, error: farmerError } = await db
      .from('farmer_public_profiles')
      .select('id, total_sponsors, monthly_funding_received, monthly_funding_needed')
      .eq('id', body.farmer_profile_id)
      .eq('is_active', true)
      .single();

    if (farmerError || !farmer) {
      return NextResponse.json(
        { error: 'Farmer profile not found or inactive' },
        { status: 404 }
      );
    }

    // Insert sponsorship record
    const { data: sponsorship, error: insertError } = await db
      .from('sponsorships')
      .insert({
        farmer_profile_id: body.farmer_profile_id,
        program_id: body.program_id ?? null,
        sponsor_name: body.sponsor_name.trim(),
        sponsor_email: body.sponsor_email.trim().toLowerCase(),
        sponsor_company: body.sponsor_company?.trim() ?? null,
        sponsor_country: body.sponsor_country?.trim() ?? null,
        tier: body.tier,
        billing_cycle: body.billing_cycle,
        amount_usd: body.amount_usd,
        status: 'active',
        // stripe_subscription_id: null — Stripe integration coming soon
      })
      .select('id')
      .single();

    if (insertError || !sponsorship) {
      console.error('POST /api/sponsor/checkout insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create sponsorship' },
        { status: 500 }
      );
    }

    // Calculate the effective monthly contribution for tracking
    // Annual billing: divide by 12 for monthly equivalent
    let monthlyEquivalent = body.amount_usd;
    if (body.billing_cycle === 'annual') {
      monthlyEquivalent = body.amount_usd / 12;
    } else if (body.billing_cycle === 'one_time') {
      monthlyEquivalent = 0; // one-time doesn't count toward monthly recurring
    }

    // Update farmer's total_sponsors (increment) and monthly_funding_received
    const newTotalSponsors = (farmer.total_sponsors ?? 0) + 1;
    const newMonthlyReceived = (farmer.monthly_funding_received ?? 0) + monthlyEquivalent;

    const { error: updateError } = await db
      .from('farmer_public_profiles')
      .update({
        total_sponsors: newTotalSponsors,
        monthly_funding_received: newMonthlyReceived,
      })
      .eq('id', body.farmer_profile_id);

    if (updateError) {
      // Log but don't fail — the sponsorship record was created successfully
      console.error('POST /api/sponsor/checkout farmer update error:', updateError);
    }

    // Send thank-you email to sponsor
    try {
      const firstName = body.sponsor_name.split(' ')[0];
      await resend.emails.send({
        from: FROM,
        to: body.sponsor_email,
        subject: 'Thank You for Sponsoring an African Farmer! 🌾',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:30px;text-align:center">
            <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
            <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Sponsor a Farmer</p>
          </div>
          <div style="padding:30px;background:#f8faf6">
            <h2 style="color:#1B2A4A;margin-top:0">Thank you, ${firstName}!</h2>
            <p style="color:#333;font-size:15px;line-height:1.6">
              Your <strong>${body.tier.charAt(0).toUpperCase() + body.tier.slice(1)}</strong> sponsorship of <strong>$${body.amount_usd}</strong> (${body.billing_cycle}) is making a real difference in an African farmer's life.
            </p>
            <div style="background:white;border-left:4px solid #5DB347;padding:16px;border-radius:4px;margin:20px 0">
              <p style="margin:0;font-size:14px;color:#1B2A4A"><strong>Sponsorship ID:</strong> ${sponsorship.id.slice(0, 8).toUpperCase()}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#1B2A4A"><strong>Tier:</strong> ${body.tier.charAt(0).toUpperCase() + body.tier.slice(1)}</p>
              <p style="margin:8px 0 0;font-size:14px;color:#1B2A4A"><strong>Amount:</strong> $${body.amount_usd} (${body.billing_cycle})</p>
            </div>
            <p style="color:#333;font-size:14px;line-height:1.6">
              We'll keep you updated on your sponsored farmer's progress. You'll receive regular updates showing the impact of your support.
            </p>
            <div style="text-align:center;margin-top:24px">
              <a href="https://africanfarmingunion.org/sponsor" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Your Sponsorship</a>
            </div>
          </div>
          <div style="padding:12px;text-align:center;color:#999;font-size:12px">African Farming Union | africanfarmingunion.org</div>
        </div>`,
      });
    } catch { /* non-critical */ }

    // Notify Devon + Peter
    try {
      await resend.emails.send({
        from: FROM,
        to: NOTIFY_TO,
        subject: `New Sponsorship: ${body.sponsor_name} — $${body.amount_usd} (${body.tier})`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:#1B2A4A">New Farmer Sponsorship</h2>
          <p><strong>${body.sponsor_name}</strong>${body.sponsor_company ? ` (${body.sponsor_company})` : ''}</p>
          <p>Tier: ${body.tier} | Amount: $${body.amount_usd} | Cycle: ${body.billing_cycle}</p>
          <p>Email: ${body.sponsor_email} | Country: ${body.sponsor_country || 'N/A'}</p>
          <a href="https://africanfarmingunion.org/admin/sponsor" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
        </div>`,
      });
    } catch { /* non-critical */ }

    return NextResponse.json({
      success: true,
      sponsorship_id: sponsorship.id,
    });
  } catch (err) {
    console.error('POST /api/sponsor/checkout unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
