import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyAdmins, sendEmail } from '@/lib/email';

const FROM = 'African Farming Union <info@mail.africanfarmingunion.org>';

// Brand colors
const NAVY = '#1B2A4A';
const GREEN = '#5DB347';
const BG = '#f8faf6';

// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5;    // max per window
const RATE_WINDOW = 3600000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.reset) {
    rateMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  if (entry.count > RATE_LIMIT) return true;
  return false;
}

export async function POST(req: Request) {
  try {
    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || req.headers.get('x-real-ip')
      || 'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    const {
      full_name,
      email,
      phone,
      country,
      region,
      date_of_birth,
      gender,
      job_title,
      experience_years,
      education_level,
      qualifications,
      languages,
      skills,
      sectors,
      employment_type,
      availability,
      salary_expectation,
      preferred_countries,
      willing_to_relocate,
      bio,
      cv_url,
      photo_url,
      referral_source,
      agreed_to_terms,
    } = body;

    // Validate required fields
    if (!full_name?.trim()) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 });
    }
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (!country?.trim()) {
      return NextResponse.json({ error: 'Country is required' }, { status: 400 });
    }
    if (!agreed_to_terms) {
      return NextResponse.json({ error: 'You must agree to the terms' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Insert talent application
    const { data: application, error: insertError } = await supabase
      .from('talent_applications')
      .insert({
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone || null,
        country,
        region: region || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        job_title: job_title || null,
        experience_years: experience_years || null,
        education_level: education_level || null,
        qualifications: qualifications || null,
        languages: languages || [],
        skills: skills || [],
        sectors: sectors || [],
        employment_type: employment_type || null,
        availability: availability || null,
        salary_expectation: salary_expectation || null,
        preferred_countries: preferred_countries || [],
        willing_to_relocate: willing_to_relocate || false,
        bio: bio || null,
        cv_url: cv_url || null,
        photo_url: photo_url || null,
        referral_source: referral_source || null,
        agreed_to_terms: agreed_to_terms || false,
        status: 'pending',
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('[talent_applications insert]', insertError.message);
      return NextResponse.json(
        { error: 'Failed to submit application: ' + insertError.message },
        { status: 500 },
      );
    }

    const applicationId = application?.id;
    const firstName = full_name.trim().split(' ')[0];

    // Notify admins
    try {
      await notifyAdmins({
        subject: `[AFU Talent Signup] ${full_name} — ${country}`,
        type: 'talent_application',
        data: {
          application_id: applicationId,
          full_name,
          email,
          phone: phone || '',
          country,
          region: region || '',
          job_title: job_title || '',
          experience_years: experience_years || '',
          skills: (skills || []).join(', '),
          employment_type: employment_type || '',
          availability: availability || '',
        },
        reply_to: email,
        name: full_name,
        phone,
        country,
        tags: ['talent-signup', 'recruitment'],
      });
    } catch (emailErr) {
      console.error('[talent admin notification]', emailErr);
    }

    // Send confirmation email to applicant
    const applicantHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:${NAVY};padding:30px;text-align:center">
    <h1 style="color:${GREEN};margin:0;font-size:24px;">African Farming Union</h1>
    <p style="color:#8CB89C;margin:8px 0 0;font-size:14px;">Farmers for Farmers</p>
  </div>
  <div style="padding:30px;background:${BG}">
    <h2 style="color:${NAVY};margin-top:0;">Welcome to AFU, ${firstName}!</h2>
    <p style="color:#333;line-height:1.6;">
      Thank you for registering with Africa's Agricultural Workforce.
      We have received your talent profile and our team will review it shortly.
    </p>

    <div style="background:white;border-left:4px solid ${GREEN};padding:16px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 8px;color:#666;font-size:13px;font-weight:bold;">What happens next:</p>
      <ul style="margin:0;padding-left:20px;color:#555;font-size:14px;line-height:1.8;">
        <li>Our team reviews your profile within 48 hours</li>
        <li>We match your skills with available opportunities</li>
        <li>You'll be contacted when suitable positions arise</li>
      </ul>
    </div>

    <div style="background:white;border:1px solid #e5e7eb;padding:14px;border-radius:8px;margin:20px 0;">
      <p style="margin:0;color:#666;font-size:13px;">
        <strong>Reference:</strong> TAL-${applicationId?.substring(0, 8).toUpperCase()}
      </p>
    </div>

    <p style="text-align:center;margin:24px 0;">
      <a href="https://africanfarmingunion.org/jobs" style="display:inline-block;padding:12px 28px;background:${GREEN};color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
        Browse Job Opportunities
      </a>
    </p>

    <p style="color:#333;">
      Best regards,<br>
      <strong>The AFU Team</strong>
    </p>
  </div>
  <div style="padding:20px;text-align:center;color:#999;font-size:12px;">
    African Farming Union | Gaborone, Botswana<br>
    africanfarmingunion.org
  </div>
</div>`;

    try {
      await sendEmail(
        email.trim().toLowerCase(),
        'Welcome to AFU - Talent Profile Received',
        applicantHtml,
        FROM,
      );
    } catch (emailErr) {
      console.error('[talent applicant auto-reply]', emailErr);
    }

    return NextResponse.json({
      success: true,
      applicationId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/jobs/talent-signup]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
