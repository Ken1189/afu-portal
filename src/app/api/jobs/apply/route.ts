import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { createInboxConversation } from '@/lib/inbox/create-conversation';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';
const ADMIN_EMAILS = [
  'peterw@africanfarmingunion.org',
  'devonk@africanfarmingunion.org',
];

// Brand colors
const NAVY = '#1B2A4A';
const GREEN = '#5DB347';
const BG = '#f8faf6';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      job_id,
      job_title,
      cover_message,
      cv_url,
      full_name,
      email,
      phone,
      country,
      skills,
    } = body;

    // Validate required fields
    if (!job_id || !job_title || !cover_message || !full_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: job_id, job_title, cover_message, full_name, email' },
        { status: 400 },
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // --- Get user from auth header (optional - frontend checks auth) ---
    let userId: string | null = null;
    const auth = req.headers.get('authorization');
    if (auth?.startsWith('Bearer ')) {
      const { data: { user } } = await supabase.auth.getUser(auth.slice(7));
      userId = user?.id ?? null;
    }

    // --- Upsert talent_profiles ---
    let talentId: string | null = null;

    if (userId) {
      // Try to find existing talent profile for this user
      const { data: existingProfile } = await supabase
        .from('talent_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingProfile) {
        // Update existing profile
        await supabase
          .from('talent_profiles')
          .update({
            full_name,
            email,
            phone: phone || null,
            country: country || null,
            cv_url: cv_url || null,
            skills: skills || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id);
        talentId = existingProfile.id;
      } else {
        // Create new profile
        const { data: newProfile, error: profileError } = await supabase
          .from('talent_profiles')
          .insert({
            user_id: userId,
            full_name,
            email,
            phone: phone || null,
            country: country || null,
            cv_url: cv_url || null,
            skills: skills || null,
          })
          .select('id')
          .single();

        if (profileError) {
          console.error('[talent_profiles insert]', profileError.message);
        }
        talentId = newProfile?.id ?? null;
      }
    }

    // --- Insert job_applications ---
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .insert({
        job_id,
        talent_id: talentId,
        applicant_name: full_name,
        applicant_email: email,
        applicant_phone: phone || null,
        cover_message,
        cv_url: cv_url || null,
        status: 'applied',
      })
      .select('id')
      .single();

    if (appError) {
      console.error('[job_applications insert]', appError.message);
      return NextResponse.json(
        { error: 'Failed to submit application: ' + appError.message },
        { status: 500 },
      );
    }

    const applicationId = application?.id;

    // --- Send notification email to admins ---
    const cvLink = cv_url
      ? `<p><a href="${cv_url}" style="display:inline-block;padding:10px 20px;background:${GREEN};color:white;text-decoration:none;border-radius:6px;font-weight:bold;">Download CV</a></p>`
      : '<p style="color:#999;">No CV uploaded</p>';

    const adminHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:${NAVY};padding:24px;text-align:center">
    <h2 style="color:${GREEN};margin:0;font-size:20px">New Job Application</h2>
    <p style="color:#8CB89C;margin:6px 0 0;font-size:13px">AFU Jobs Board</p>
  </div>
  <div style="padding:24px;background:${BG}">
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr>
        <td style="padding:8px 0;color:#666;width:130px;vertical-align:top;"><strong>Applicant:</strong></td>
        <td style="padding:8px 0;color:${NAVY};">${full_name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;vertical-align:top;"><strong>Email:</strong></td>
        <td style="padding:8px 0;"><a href="mailto:${email}" style="color:${GREEN};">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;vertical-align:top;"><strong>Phone:</strong></td>
        <td style="padding:8px 0;color:${NAVY};">${phone || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;vertical-align:top;"><strong>Country:</strong></td>
        <td style="padding:8px 0;color:${NAVY};">${country || 'N/A'}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;color:#666;vertical-align:top;"><strong>Job Title:</strong></td>
        <td style="padding:8px 0;color:${NAVY};font-weight:bold;">${job_title}</td>
      </tr>
    </table>

    <div style="margin:20px 0;background:white;border-left:4px solid ${GREEN};padding:16px;border-radius:4px;">
      <p style="margin:0 0 8px;color:#666;font-size:13px;font-weight:bold;">Cover Message:</p>
      <p style="margin:0;color:#333;font-size:14px;line-height:1.6;white-space:pre-line;">${cover_message}</p>
    </div>

    ${cvLink}

    <p style="margin-top:20px;color:#999;font-size:12px;">Application ID: APP-${applicationId}</p>
  </div>
  <div style="padding:16px;text-align:center;color:#999;font-size:11px;">
    African Farming Union | africanfarmingunion.org
  </div>
</div>`;

    try {
      await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAILS,
        subject: `[AFU Job Application] ${job_title} — from ${full_name}`,
        html: adminHtml,
      });
    } catch (emailErr) {
      console.error('[admin notification email]', emailErr);
    }

    // --- Send auto-reply to applicant ---
    const firstName = full_name.split(' ')[0];
    const applicantHtml = `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
  <div style="background:${NAVY};padding:30px;text-align:center">
    <h1 style="color:${GREEN};margin:0;font-size:24px;">African Farming Union</h1>
    <p style="color:#8CB89C;margin:8px 0 0;font-size:14px;">Farmers for Farmers</p>
  </div>
  <div style="padding:30px;background:${BG}">
    <h2 style="color:${NAVY};margin-top:0;">Thank you, ${firstName}!</h2>
    <p style="color:#333;line-height:1.6;">
      We have received your application for <strong>${job_title}</strong>.
      Our team will review your application and we aim to respond within <strong>48 hours</strong>.
    </p>

    <div style="background:white;border-left:4px solid ${GREEN};padding:16px;margin:20px 0;border-radius:4px;">
      <p style="margin:0 0 6px;color:#666;font-size:13px;font-weight:bold;">Your cover message:</p>
      <p style="margin:0;color:#777;font-size:14px;line-height:1.5;">${cover_message.substring(0, 300)}${cover_message.length > 300 ? '...' : ''}</p>
    </div>

    <div style="background:white;border:1px solid #e5e7eb;padding:14px;border-radius:8px;margin:20px 0;">
      <p style="margin:0;color:#666;font-size:13px;">
        <strong>Reference:</strong> APP-${applicationId}
      </p>
    </div>

    <p style="color:#333;line-height:1.6;">
      In the meantime, explore more opportunities on our platform:
    </p>
    <p style="text-align:center;margin:24px 0;">
      <a href="https://africanfarmingunion.org/jobs" style="display:inline-block;padding:12px 28px;background:${GREEN};color:white;text-decoration:none;border-radius:8px;font-weight:bold;font-size:14px;">
        View More Jobs
      </a>
    </p>

    <p style="color:#333;">
      Best regards,<br>
      <strong>The AFU Team</strong>
    </p>
  </div>
  <div style="padding:20px;text-align:center;color:#999;font-size:12px;">
    African Farming Union | Gaborone, Botswana<br>
    africanfarmingunion.org | 20 African Countries
  </div>
</div>`;

    try {
      await resend.emails.send({
        from: FROM,
        to: email,
        subject: `Application Received — ${job_title}`,
        html: applicantHtml,
      });
    } catch (emailErr) {
      console.error('[applicant auto-reply email]', emailErr);
    }

    // Create inbox conversation
    createInboxConversation({
      name: full_name, email, phone, type: 'lead',
      subject: `Job Application: ${job_title}`,
      message: `Applied for: ${job_title}\nCV: ${cv_url || 'Not uploaded'}\n\n${cover_message}`,
      tags: ['job-application', 'recruitment'],
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      applicationId,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[POST /api/jobs/apply]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
