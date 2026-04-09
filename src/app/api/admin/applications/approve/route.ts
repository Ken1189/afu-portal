import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { Resend } from 'resend';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';
import { fireAutomations } from '@/lib/automations/executor';

function escapeHtml(input: unknown): string {
  if (input === null || input === undefined) return '';
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
      member: 'farmer',
      supplier: 'supplier',
      ambassador: 'ambassador',
      partner: 'partner',
    };
    const assignedRole = ROLE_MAP[application.application_type] || 'farmer';

    // Generate a temporary password
    const tempPassword = `AFU-${crypto.randomBytes(12).toString('hex').toUpperCase()}`;

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

        // If this is a partner application, still create the managed_partners row
        if (assignedRole === 'partner') {
          const companyName = application.farm_name || application.full_name || 'Unnamed';
          await svc.from('managed_partners').insert({
            name: companyName,
            website_url: null,
            category: 'NGO',
            country: application.country || null,
            is_featured: false,
            is_published: true,
            display_order: 0,
          }).then(({ error: pe }) => {
            if (pe) console.error('[approve] managed_partners insert (existing user):', pe.message);
          });
        }

        // Still send a notification email
        const fn = escapeHtml(application.full_name?.split(' ')[0] || 'Member');
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

    // Look up the referring ambassador by referral_code (if any)
    let referredByAmbassadorProfileId: string | null = null;
    if (application.referral_code) {
      try {
        const { data: amb } = await svc
          .from('ambassadors')
          .select('id, user_id')
          .eq('referral_code', application.referral_code)
          .maybeSingle();
        if (amb?.user_id) {
          referredByAmbassadorProfileId = amb.user_id;
        } else {
          // Fallback: check referral_links table
          const { data: link } = await svc
            .from('referral_links')
            .select('ambassador_id, ambassadors(user_id)')
            .eq('referral_code', application.referral_code)
            .maybeSingle();
          const linked = (link as unknown as { ambassadors?: { user_id?: string } } | null)?.ambassadors;
          if (linked?.user_id) referredByAmbassadorProfileId = linked.user_id;
        }
      } catch (e) {
        console.error('[approve] ambassador lookup failed:', e);
      }
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
      referred_by: referredByAmbassadorProfileId,
      referral_code_used: application.referral_code || null,
    });
    if (memberError) {
      console.error('Failed to create member:', memberError.message);
    }

    // If approved as supplier or partner, create a suppliers row
    if (assignedRole === 'supplier' || assignedRole === 'partner') {
      const companyName = application.farm_name || application.full_name || 'Unnamed';
      const supplierInsert = {
        profile_id: userId,
        company_name: companyName,
        contact_name: application.full_name || 'Unknown',
        email: application.email,
        phone: application.phone || null,
        category: 'input-supplier' as const,
        country: application.country || 'Unknown',
        status: 'active' as const,
        verified: false,
      };
      console.log('[approve] Creating supplier row:', supplierInsert);
      const { error: supplierRowError } = await svc.from('suppliers').insert(supplierInsert);
      if (supplierRowError) {
        console.error('[approve] Failed to create suppliers row:', supplierRowError.message, supplierRowError);
        return NextResponse.json(
          { success: false, error: 'Failed to create supplier record: ' + supplierRowError.message },
          { status: 500 }
        );
      }
      console.log('[approve] Supplier row created successfully for profile:', userId);

      // Also create a managed_partners record so they appear in Partner Management
      if (assignedRole === 'partner') {
        const { error: partnerError } = await svc.from('managed_partners').insert({
          name: companyName,
          website_url: null,
          category: 'NGO',
          country: application.country || null,
          is_featured: false,
          is_published: true,
          display_order: 0,
        });
        if (partnerError) {
          console.error('[approve] Failed to create managed_partners row:', partnerError.message);
          // Non-fatal — supplier record already created, admin can add to partners manually
        } else {
          console.log('[approve] managed_partners row created for:', companyName);
        }
      }
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
    const firstName = escapeHtml(application.full_name?.split(' ')[0] || 'Member');
    const safeFullName = escapeHtml(application.full_name || '');
    const tierNameRaw = application.requested_tier
      ? application.requested_tier.charAt(0).toUpperCase() + application.requested_tier.slice(1).replace(/_/g, ' ')
      : 'Member';
    const tierName = escapeHtml(tierNameRaw);
    const safeEmail = escapeHtml(application.email);
    const safeMemberId = escapeHtml(memberId);
    const safeTempPassword = escapeHtml(tempPassword);
    const safeCountry = escapeHtml(application.country || 'N/A');

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
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${safeEmail}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Password</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600;font-family:monospace;font-size:16px">${safeTempPassword}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Member ID</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${safeMemberId}</td>
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
        subject: `Member Approved: ${application.full_name} (${tierNameRaw})`,
        html: `<div style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:#1B2A4A">Member Approved</h2>
          <p><strong>${safeFullName}</strong> — ${tierName} tier</p>
          <p>Country: ${safeCountry} | Email: ${safeEmail}</p>
          <p>Member ID: ${safeMemberId}</p>
          <a href="https://africanfarmingunion.org/admin/members" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
        </div>`,
      });
    } catch { /* non-critical */ }

    // Fire marketing automations (non-blocking)
    fireAutomations('member_approved', {
      name: application.full_name,
      email: application.email,
      phone: application.phone || undefined,
      country: application.country || undefined,
      tier: application.requested_tier || undefined,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Account created for ${application.email}. Welcome email sent with login credentials.`,
    });
  } catch (err: unknown) {
    console.error('Approve application error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
