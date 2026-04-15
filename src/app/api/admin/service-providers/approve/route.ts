import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sendEmail } from '@/lib/email';
import { fireAutomations } from '@/lib/automations/executor';

/**
 * POST /api/admin/service-providers/approve
 *
 * Approves a service provider application:
 * 1. Fetches the application from service_provider_applications
 * 2. Creates auth account with temp password
 * 3. Creates/updates profile with role 'supplier'
 * 4. Creates a service_providers directory record
 * 5. Updates application status to 'approved'
 * 6. Sends welcome email with login credentials
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() { /* read-only */ },
        },
      }
    );

    // Verify the caller is authenticated
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !adminUser) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Service-role client for admin operations (bypasses RLS)
    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify admin role
    const { data: adminProfile } = await svc.from('profiles').select('role').eq('id', adminUser.id).single();
    if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { applicationId, notes } = await request.json();
    if (!applicationId) {
      return NextResponse.json({ success: false, error: 'applicationId required' }, { status: 400 });
    }

    // Fetch the application
    const { data: application, error: appErr } = await svc
      .from('service_provider_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (appErr || !application) {
      return NextResponse.json({ success: false, error: 'Application not found' }, { status: 404 });
    }

    if (application.status === 'approved') {
      return NextResponse.json({ success: false, error: 'Application already approved' }, { status: 400 });
    }

    const email = application.email;
    if (!email) {
      // Approve without account creation if no email
      await svc.from('service_provider_applications').update({
        status: 'approved',
        reviewed_by: adminUser.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes || null,
      }).eq('id', applicationId);

      return NextResponse.json({
        success: true,
        accountCreated: false,
        message: 'Application approved (no email on file — cannot send credentials).',
      });
    }

    // Generate temp password
    const tempPassword = `AFU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Try to create auth user
    let userId: string | null = null;
    let accountCreated = false;

    const { data: newUser, error: createErr } = await svc.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'supplier',
        full_name: application.full_name || application.business_name,
      },
    });

    if (createErr) {
      if (createErr.message?.includes('already been registered') || createErr.message?.includes('already exists')) {
        // Find existing user
        const { data: existingUsers } = await svc.auth.admin.listUsers();
        const existing = existingUsers?.users?.find((u: { email?: string }) => u.email === email);
        if (existing) userId = existing.id;
      } else {
        // Still approve the application even if account creation fails
        await svc.from('service_provider_applications').update({
          status: 'approved',
          reviewed_by: adminUser.id,
          reviewed_at: new Date().toISOString(),
          admin_notes: notes || null,
        }).eq('id', applicationId);

        return NextResponse.json({
          success: true,
          accountCreated: false,
          message: `Application approved. Could not create account: ${createErr.message}`,
        });
      }
    } else {
      userId = newUser.user.id;
      accountCreated = true;
    }

    // Create/update profile with role 'supplier' (so they get supplier portal access)
    if (userId) {
      await svc.from('profiles').upsert({
        id: userId,
        email,
        full_name: application.full_name || application.business_name || email,
        phone: application.phone || null,
        role: 'supplier',
        country: application.country || null,
      });
    }

    // Create service_providers directory record
    const { data: spRecord, error: spErr } = await svc.from('service_providers').insert({
      profile_id: userId,
      application_id: applicationId,
      provider_type: application.provider_type,
      display_name: application.full_name || application.business_name || email,
      business_name: application.business_name || null,
      email,
      phone: application.phone || null,
      country: application.country,
      region: application.provider_details?.region || null,
      bio: application.motivation || null,
      website: application.website || null,
      provider_details: application.provider_details || {},
      is_listed: true,
      is_verified: true,
    }).select('id').single();

    if (spErr) {
      console.error('Failed to create service_providers record:', spErr);
    }

    // Update application status
    await svc.from('service_provider_applications').update({
      status: 'approved',
      reviewed_by: adminUser.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: notes || null,
    }).eq('id', applicationId);

    // Format provider type for display
    const typeLabels: Record<string, string> = {
      trader: 'Trader',
      vet: 'Veterinarian',
      offtaker: 'Offtaker',
      processing_hub: 'Processing Hub',
    };
    const providerLabel = typeLabels[application.provider_type] || application.provider_type;
    const displayName = application.full_name || application.business_name || email;

    // Send welcome email
    try {
      await sendEmail(
        email,
        `Welcome to AFU — You're Approved as a ${providerLabel}!`,
        `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1B2A4A;padding:30px;text-align:center">
            <h1 style="color:#5DB347;margin:0;font-size:24px">African Farming Union</h1>
            <p style="color:#8CB89C;margin:8px 0 0;font-size:14px">Service Provider Directory</p>
          </div>
          <div style="padding:30px;background:#f8faf6">
            <h2 style="color:#1B2A4A;margin-top:0">Welcome, ${displayName}!</h2>
            <p style="color:#333;font-size:15px;line-height:1.6">
              Great news — your application as a <strong>${providerLabel}</strong> has been
              <strong style="color:#5DB347">approved</strong>. You are now listed in the AFU
              Service Provider Directory and can receive requests from farmers across Africa.
            </p>

            ${accountCreated ? `
            <div style="background:white;border:2px solid #5DB347;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">Your Login Credentials</h3>
              <table style="width:100%;font-size:14px">
                <tr>
                  <td style="padding:8px 0;color:#64748b;width:120px">Login URL</td>
                  <td style="padding:8px 0"><a href="https://africanfarmingunion.org/login" style="color:#2563eb;font-weight:600">africanfarmingunion.org/login</a></td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Email</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600">${email}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#64748b">Password</td>
                  <td style="padding:8px 0;color:#1B2A4A;font-weight:600;font-family:monospace;font-size:16px">${tempPassword}</td>
                </tr>
              </table>
              <p style="color:#EF4444;font-size:12px;margin-bottom:0">Please change your password after your first login.</p>
            </div>
            ` : `
            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <p style="color:#333;font-size:14px;margin:0">You already have an account. Log in at <a href="https://africanfarmingunion.org/login" style="color:#2563eb;font-weight:600">africanfarmingunion.org/login</a> to access your dashboard.</p>
            </div>
            `}

            <div style="background:white;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0">
              <h3 style="color:#1B2A4A;margin-top:0;font-size:16px">What You Can Do Now</h3>
              <ol style="color:#333;font-size:14px;line-height:1.8;padding-left:20px">
                <li>Log into your <a href="https://africanfarmingunion.org/supplier" style="color:#2563eb">Supplier Dashboard</a></li>
                <li>Complete your provider profile</li>
                <li>Start receiving service requests from farmers</li>
                <li>Manage bookings and build your reputation</li>
              </ol>
            </div>

            <div style="text-align:center;margin-top:24px">
              <a href="https://africanfarmingunion.org/supplier" style="display:inline-block;background:#5DB347;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Go to Dashboard</a>
            </div>
          </div>
          <div style="padding:16px;text-align:center;color:#999;font-size:12px">
            African Farming Union | <a href="https://africanfarmingunion.org" style="color:#999">africanfarmingunion.org</a>
          </div>
        </div>`
      );
    } catch (emailErr) {
      console.error('Failed to send service provider welcome email:', emailErr);
    }

    // Notify Devon + Peter
    try {
      await sendEmail(
        'peterw@africanfarmingunion.org',
        `Service Provider Approved: ${displayName} (${providerLabel})`,
        `<div style="font-family:Arial,sans-serif;padding:20px">
          <h2 style="color:#1B2A4A">Service Provider Approved</h2>
          <p><strong>${displayName}</strong> has been approved as a <strong>${providerLabel}</strong>.</p>
          <p>Business: ${application.business_name || 'N/A'}</p>
          <p>Country: ${application.country || 'N/A'}</p>
          <p>Account created: ${accountCreated ? 'Yes' : 'No (existing)'}</p>
          <a href="https://africanfarmingunion.org/admin/service-providers" style="display:inline-block;background:#5DB347;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">View in Admin</a>
        </div>`
      );
    } catch (err) { console.error("[admin/service-providers/approve] admin notification non-critical:", err); }

    // Fire marketing automations
    fireAutomations('service_provider_approved', {
      name: application.full_name || application.business_name,
      email,
      phone: application.phone || undefined,
      country: application.country || undefined,
      provider_type: application.provider_type,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      accountCreated,
      serviceProviderId: spRecord?.id || null,
      tempPassword: accountCreated ? tempPassword : null,
      message: accountCreated
        ? `Account created for ${email}. Welcome email sent with login credentials.`
        : `Provider approved. Welcome email sent. (Existing account — no new password.)`,
    });
  } catch (err) {
    console.error('Service provider approve error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
