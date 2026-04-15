import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/applications/auto-approve-free
 * For free tier applications, sends a verification email first.
 * If the email is already verified, auto-approves immediately.
 */
export async function POST(req: Request) {
  // Rate limit: max 3 auto-approvals per IP per minute
  const { rateLimitAsync } = await import('@/lib/rateLimit');
  const blocked = await rateLimitAsync(req);
  if (blocked) return blocked;

  const { applicationId } = await req.json();
  if (!applicationId) {
    return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
  }

  const svc = await createAdminClient();

  // Verify it's actually a free tier application
  const { data: app } = await svc
    .from('membership_applications')
    .select('*')
    .eq('id', applicationId)
    .single();

  if (!app || app.requested_tier !== 'free') {
    return NextResponse.json({ error: 'Not a free tier application' }, { status: 400 });
  }

  // If email is already verified, proceed with auto-approval
  if (app.email_verified) {
    return autoApprove(svc, app, applicationId);
  }

  // Generate verification token and send email
  const token = crypto.randomUUID();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://africanfarmingunion.org';
  const verifyUrl = `${baseUrl}/api/applications/verify-email?token=${token}`;

  // Save token and update status to pending_verification
  await svc
    .from('membership_applications')
    .update({
      status: 'pending_verification',
      verification_token: token,
      verification_sent_at: new Date().toISOString(),
    })
    .eq('id', applicationId);

  // Send verification email
  try {
    await sendEmail(
      app.email,
      'Verify your email — African Farming Union',
      `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1B2A4A; margin: 0;">African Farming Union</h1>
        </div>
        <h2 style="color: #1B2A4A;">Welcome, ${app.full_name}!</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">
          Thank you for joining the African Farming Union. Please verify your email address to activate your free membership.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #5DB347; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
            Verify My Email
          </a>
        </div>
        <p style="color: #666; font-size: 14px; line-height: 1.6;">
          If the button above does not work, copy and paste this link into your browser:<br/>
          <a href="${verifyUrl}" style="color: #5DB347; word-break: break-all;">${verifyUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
          This link expires in 48 hours. If you did not sign up for African Farming Union, you can safely ignore this email.
        </p>
      </div>
      `,
    );
  } catch (emailErr) {
    console.error('[auto-approve-free] Failed to send verification email:', emailErr);
    // Don't fail the request — admin can resend or approve manually
  }

  return NextResponse.json({ success: true, requiresVerification: true });
}

/**
 * Auto-approve: creates auth user, profile, and member record.
 * Extracted so it can be called from both this route and verify-email.
 */
export async function autoApprove(
  svc: Awaited<ReturnType<typeof createAdminClient>>,
  app: Record<string, any>,
  applicationId: string,
) {
  // Create auth user
  const tempPassword = 'AFU-' + Math.random().toString(36).slice(2, 10);
  const { data: newUser, error: authErr } = await svc.auth.admin.createUser({
    email: app.email,
    password: tempPassword,
    email_confirm: true,
  });
  if (authErr || !newUser?.user) {
    return NextResponse.json(
      { error: authErr?.message || 'Failed to create user' },
      { status: 500 },
    );
  }

  // Create profile
  await svc.from('profiles').upsert({
    id: newUser.user.id,
    full_name: app.full_name,
    email: app.email,
    phone: app.phone,
    country: app.country,
    role: 'farmer',
  });

  // Create member record
  await svc.from('members').insert({
    profile_id: newUser.user.id,
    tier: 'free',
    status: 'active',
    farm_name: app.farm_name,
    farm_size_ha: app.farm_size_ha,
    primary_crops: app.primary_crops,
  });

  // Update application status
  await svc
    .from('membership_applications')
    .update({ status: 'approved', reviewed_at: new Date().toISOString() })
    .eq('id', applicationId);

  // Send welcome email with login credentials
  const firstName = (app.full_name || '').split(' ')[0] || 'Farmer';
  try {
    await sendEmail(
      app.email,
      'Your AFU Account is Ready — Login Credentials',
      `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1B2A4A;">Welcome to AFU, ${firstName}!</h2>
        <p>Your email has been verified and your free membership is now <strong style="color: #5DB347;">active</strong>.</p>
        <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px;"><strong>Email:</strong> ${app.email}</p>
          <p style="margin: 0 0 8px;"><strong>Temporary Password:</strong> ${tempPassword}</p>
          <p style="margin: 0; font-size: 13px; color: #6b7280;">Please change your password after your first login.</p>
        </div>
        <a href="https://www.africanfarmingunion.org/login" style="display: inline-block; background: #5DB347; color: white; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Log In to Your Farm Portal</a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">African Farming Union — By Farmers, For Farmers</p>
      </div>`
    );
  } catch (err) {
    console.error("[applications/auto-approve-free] welcome email non-critical:", err);
    // Email failed — user can reset password from login page
  }

  return NextResponse.json({ success: true, tempPassword });
}
