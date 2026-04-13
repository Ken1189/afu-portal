import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyAdmins } from '@/lib/email/admin-notifications';

// ---------------------------------------------------------------------------
// Rate-limit tracking (simple in-memory, per-IP)
// ---------------------------------------------------------------------------
const submissions = new Map<string, number[]>();
const RATE_LIMIT = 3; // max per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (submissions.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (timestamps.length >= RATE_LIMIT) return true;
  timestamps.push(now);
  submissions.set(ip, timestamps);
  return false;
}

// ---------------------------------------------------------------------------
// POST /api/projects/submit
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    // Rate limit
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await req.json();

    // Validate required fields
    const { full_name, email, country, project_name, project_description, project_country, agreed_to_terms } = body;

    if (!full_name || !email || !country || !project_name || !project_description || !project_country) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 },
      );
    }

    if (!agreed_to_terms) {
      return NextResponse.json(
        { error: 'You must agree to the terms to submit.' },
        { status: 400 },
      );
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 },
      );
    }

    // Insert using service role (bypasses RLS for anon inserts if needed)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: insertError } = await supabase.from('project_submissions').insert({
      full_name: body.full_name,
      email: body.email,
      phone: body.phone || null,
      country: body.country,
      organisation: body.organisation || null,
      role_in_project: body.role_in_project || null,
      project_name: body.project_name,
      project_category: body.project_category || null,
      project_stage: body.project_stage || null,
      project_description: body.project_description,
      target_beneficiaries: body.target_beneficiaries || null,
      beneficiary_count: body.beneficiary_count || null,
      project_country: body.project_country,
      project_region: body.project_region || null,
      project_countries: body.project_countries || [],
      funding_required: body.funding_required || false,
      funding_amount: body.funding_amount || null,
      funding_purpose: body.funding_purpose || null,
      existing_funding: body.existing_funding || null,
      support_needed: body.support_needed || [],
      proposal_url: body.proposal_url || null,
      timeline: body.timeline || null,
      impact_description: body.impact_description || null,
      referral_source: body.referral_source || null,
      agreed_to_terms: true,
      status: 'pending',
    });

    if (insertError) {
      console.error('[projects/submit] Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit project. Please try again.' },
        { status: 500 },
      );
    }

    // Notify admins (non-blocking)
    notifyAdmins({
      subject: `New Project Submission: ${body.project_name}`,
      type: 'application',
      name: body.full_name,
      reply_to: body.email,
      phone: body.phone || undefined,
      country: body.project_country,
      businessName: body.organisation || undefined,
      tags: ['project-submission', body.project_category || 'uncategorised'].filter(Boolean),
      data: {
        full_name: body.full_name,
        email: body.email,
        phone: body.phone || 'N/A',
        country: body.country,
        organisation: body.organisation || 'N/A',
        role: body.role_in_project || 'N/A',
        project_name: body.project_name,
        category: body.project_category || 'N/A',
        stage: body.project_stage || 'N/A',
        project_country: body.project_country,
        project_region: body.project_region || 'N/A',
        funding_required: body.funding_required ? 'Yes' : 'No',
        funding_amount: body.funding_amount || 'N/A',
        support_needed: (body.support_needed || []).join(', ') || 'N/A',
        description: body.project_description?.substring(0, 500) || 'N/A',
      },
    }).catch((err) => console.error('[projects/submit] Notify error:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[projects/submit] Unexpected error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
