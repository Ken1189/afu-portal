import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

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

        return NextResponse.json({
          success: true,
          tempPassword: null,
          message: 'Application approved. User already has an account — no new credentials generated.',
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

    // Create a member record if applicable
    await svc.from('members').insert({
      profile_id: userId,
      tier: application.requested_tier || 'new_enterprise',
      status: 'active',
      farm_name: application.farm_name || null,
      farm_size_ha: application.farm_size_ha || null,
      primary_crops: application.primary_crops || null,
    });
    // Ignore member insert errors (table may not exist or have different schema)

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
      data: {
        applicationId,
        userId,
        tempPassword,
        email: application.email,
        fullName: application.full_name,
      },
    });

    return NextResponse.json({
      success: true,
      tempPassword,
      message: `Account created for ${application.email}. Share the temporary password with the applicant.`,
    });
  } catch (err: unknown) {
    console.error('Approve application error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
