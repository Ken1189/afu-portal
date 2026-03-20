import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    return NextResponse.json({
      success: true,
      sponsorship_id: sponsorship.id,
    });
  } catch (err) {
    console.error('POST /api/sponsor/checkout unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
