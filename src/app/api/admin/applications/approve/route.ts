import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { Resend } from 'resend';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

/**
 * POST /api/admin/applications/approve
 *
 * Approves a membership application:
 * 1. Fetches the application record
 * 2. Creates a Supabase auth user with a temp password
 * 3. Creates a profiles record with role: 'member'
 * 4. Updates the application status to 'approved'
 * 5. Returns the temp password so admin can share credentials
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    // Verify the caller is an authenticated admin
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // read-only in route handlers
          },
        },
      }
    );

    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !adminUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Use service role to check admin's role and perform privileged operations
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify caller is admin or super_admin
    const { data: adminProfile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'applicationId is required' }, { status: 400 });
    }

    // Fetch the application record
    const { data: application, error: appError } = await svc
      .from('membership_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appError || !application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'approved') {
      return NextResponse.json({ success: false, error: 'Application is already approved' }, { status: 400 });
    }

    // S1.2: Assign role based on application type instead of hardcoding 'member'
    const ROLE_MAP: Record<string, string> = {
      farmer: 'farmer',
      supplier: 'supplier',
      ambassador: 'ambassador',
      partner: 'partner',
    };
    const assignedRole = ROLE_MAP[application.application_type] || 'member';

    // Generate a temporary password
    const tempPassword = `AFU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Create a Supabase auth user with the applicant's email
    const { data: newUser, error: createUserError } = await svc.auth.admin.createUser({
      email: application.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: assignedRole,
        full_name: application.full_name,
      },
    });

    if (createUserError) {
      // If the user already exists, try to look them up
      if (createUserError.message?.includes('already been registered') || createUserError.message?.includes('already exists')) {
        // User exists already - just update the application status
        const { error: updateError } = await svc
          .from('membership_applications')
          .update({
            status: 'approved',
            reviewed_by: adminUser.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', applicationId);

        if (updateError) {
          return NextResponse.json({ success: false, error: 'Failed to update application: ' + updateError.message }, { status: 500 });
        }

        // Still send a notification email
        const fn = application.full_name?.split(' ')[0] || 'Member';
        try {
          await resend.emails.send({
            from: FROM,
            to: application.email,
            subject: 'Your AFU Membership Has Been Approved! 🌾',
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1B2A4A;padding:30px;text-align:center">
                <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
              </div>
              <div style="padding:30px;background:#f8faf6">
                <h2 style="color:#1B2A4A;margin-top:0">Welcome, ${fn}!</h2>
                <p style="color:#333;font-size:15px;line-height:1.6">Your membership application has been <strong style="color:#5DB347">approved</strong>. Log in to access your dashboard.</p>
                <div style="text-align:center;margin-top:24px">
                  <a href="https://africanfarmingunion.org/login" style="display:inline-block;background:#5DB347;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Log In</a>
                </div>
              </div>
            </div>`,
          });
        } catch { /* non-critical */ }

        return NextResponse.json({
          success: true,
          tempPassword: null,
          message: 'Application approved. User already has an account — approval email sent.',
        });
      }

      return NextResponse.json({ success: false, error: 'Failed to create user: ' + createUserError.message }, { status: 500 });
    }

    const userId = newUser.user.id;

    // Create a profiles record
    const { error: profileError } = await svc
      .from('profiles')
      .upsert({
        id: userId,
        email: application.email,
        full_name: application.full_name,
        phone: application.phone || null,
        role: assignedRole,
        country: application.country || null,
        region: application.region || null,
      });

    if (profileError) {
      console.error('Failed to create profile:', profileError.message);
      // Not a fatal error — the user can still log in
    }

    // Create a member record
    const memberId = `AFU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
    const { error: memberError } = await svc.from('members').insert({
      profile_id: userId,
      member_id: memberId,
      tier: application.requested_tier || 'new_enterprise',
      status: 'active',
      farm_name: application.farm_name || null,
      farm_size_ha: application.farm_size_ha || null,
      primary_crops: application.primary_crops || null,
    });
    if (memberError) {
      console.error('Failed to create member:', memberError.message);
    }

    // Update the application status to approved
    const { error: updateError } = await svc
      .from('membership_applications')
      .update({
        status: 'approved',
        profile_id: userId,
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error('Failed to update application status:', updateError.message);
    }

    // Emit cross-system event (fire-and-forget)
    emitEventAsync({
      type: 'APPLICATION_APPROVED',
      data: { applicationId, userId, email: application.email, fullName: application.full_name },
    });

    // Send welcome email with credentials
    const firstName = application.full_name?.split(' ')[0] || 'Member';
    const tierName = application.requested_tier
      ? application.requested_tier.charAt(0).toUpperCase() + application.requested_tier.slice(1).replace(/_/g, ' ')
      : 'Member';

    try {
      await resend.emails.send({
        from: FROM,
        to: application.email,
        subject: 'Welcome to African Farming Union! 🌾',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:30px;text-align:center">
            <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
            <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Welcome to the Family</p>
          </div>
          <div style="padding:30px;background:#f8faf6">
            <h2 style="color:#1B2A4A;margin-top:0">Welcome, ${firstName}!</h2>
            <p style="color:#333;font-size:15px;line-height:1.6">
              Your <strong>${tierName}</strong> membership has been <strong style="color:#5DB347">approved</strong>.
              You now have access to the AFU platform — financing, insurance, marketplace, training, and more.
            </p>

            <div style="background:white;border:2px solid #5DB347;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">Your Login Credentials</h3>
              <table style="width:100%;font-size:14px">
                <tr>
                  <td style="padding:8px 0;color:#64748b;width:120px">Login URL</td>
                  <td style="padding:8px 0"><a href="https://africanfarmingunion.org/login" style="color:#2563eb;font-weight:600">africanfarmingunion.org/login</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Email</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${application.email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Password</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600;font-family:monospace;font-size:16px">${tempPassword}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Member ID</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${memberId}</td>
                </tr>
              </table>
              <p style="color:#EF4444;font-size:12px;margin-bottom:0">Please change your password after your first login.</p>
            </div>

            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">What You Can Do Now</h3>
              <ol style="color:#333;font-size:14px;line-height:1.8;padding-left:20px">
                <li>Log into your <a href="https://africanfarmingunion.org/dashboard" style="color:#2563eb">Member Dashboard</a></li>
                <li>Complete your farm profile</li>
                <li>Browse the <a href="https://africanfarmingunion.org/marketplace" style="color:#2563eb">Marketplace</a> for seeds, fertilizer & equipment</li>
                <li>Apply for <a href="https://africanfarmingunion.org/dashboard/financing" style="color:#2563eb">financing</a> and <a href="https://africanfarmingunion.org/farm/insurance" style="color:#2563eb">insurance</a></li>
                <li>Access free <a href="https://africanfarmingunion.org/farm/training" style="color:#2563eb">training courses</a></li>
              </ol>
            </div>

            <div style="text-align:center;margin-top:24px">
              <a href="https://africanfarmingunion.org/dashboard" style="display:inline-block;background:#5DB347;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Go to Dashboard</a>
            </div>
          </div>
          <div style="padding:16px;text-align:center;color:#999;font-size:12px">
            African Farming Union | <a href="https://africanfarmingunion.org" style="color:#999">africanfarmingunion.org</a>
          </div>
        </div>`,
      });
    } catch (emailErr) {
      console.error('Failed to send welcome email:', emailErr);
    }

    // Notify Devon + Peter
    try {
      await resend.emails.send({
        from: FROM,
        to: ['peterw@africanfarmingunion.org', 'devonk@africanfarmingunion.org'],
        subject: `Member Approved: ${application.full_name} (${tierName})`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:#1B2A4A">Member Approved</h2>
          <p><strong>${application.full_name}</strong> — ${tierName} tier</p>
          <p>Country: ${application.country || 'N/A'} | Email: ${application.email}</p>
          <p>Member ID: ${memberId}</p>
          <a href="https://africanfarmingunion.org/admin/members" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
        </div>`,
      });
    } catch { /* non-critical */ }

    return NextResponse.json({
      success: true,
      tempPassword,
      message: `Account created for ${application.email}. Welcome email sent with login credentials.`,
    });
  } catch (err: unknown) {
    console.error('Approve application error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
