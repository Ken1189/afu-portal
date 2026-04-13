import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/admin/foober/approve-driver
 * Approve a driver application: creates auth user, profile, and foober_drivers record
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!adminProfile || !['admin', 'super_admin'].includes(adminProfile.role)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { applicationId } = await request.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId required' }, { status: 400 });
    }

    // Get application
    const { data: app } = await supabase
      .from('foober_driver_applications')
      .select('*')
      .eq('id', applicationId)
      .eq('status', 'pending')
      .single();

    if (!app) {
      return NextResponse.json({ error: 'Application not found or already processed' }, { status: 404 });
    }

    // Create auth user with temporary password
    const tempPassword = `Foober-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: app.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: app.full_name, role: 'driver' },
    });

    if (authError) {
      // User might already exist
      const { data: existingUsers } = await supabase.auth.admin.listUsers();
      const existing = existingUsers?.users?.find(u => u.email === app.email);
      if (existing) {
        // User exists — just create driver record and update role
        await supabase.from('profiles').update({ role: 'driver' }).eq('id', existing.id);

        const { error: driverErr } = await supabase.from('foober_drivers').insert({
          profile_id: existing.id,
          full_name: app.full_name,
          phone: app.phone,
          email: app.email,
          vehicle_type: app.vehicle_type,
          vehicle_registration: app.vehicle_registration,
          license_number: app.license_number,
          status: 'active',
          country: app.country,
          region: app.region,
          city: app.city,
        });

        if (driverErr) {
          return NextResponse.json({ error: driverErr.message }, { status: 500 });
        }

        // Update application
        await supabase.from('foober_driver_applications').update({
          status: 'approved',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        }).eq('id', applicationId);

        // Email
        await sendEmail(app.email, 'Welcome to Foober — You\'re Approved!',
          `<h2>Welcome to Foober, ${app.full_name}!</h2>
           <p>Your driver application has been approved. Log in to your Driver Portal to start accepting deliveries.</p>
           <p><a href="https://www.africanfarmingunion.org/driver">Go to Driver Portal</a></p>`
        ).catch(() => {});

        return NextResponse.json({ success: true, existingUser: true });
      }
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    const userId = authUser.user.id;

    // Create profile
    await supabase.from('profiles').upsert({
      id: userId,
      email: app.email,
      full_name: app.full_name,
      phone: app.phone,
      role: 'driver',
      country: app.country,
      region: app.region,
    });

    // Create member record (drivers are also members)
    try {
      await supabase.from('members').insert({
        profile_id: userId,
        tier: 'free',
        status: 'active',
      });
    } catch { /* may already exist */ }

    // Create driver record
    await supabase.from('foober_drivers').insert({
      profile_id: userId,
      full_name: app.full_name,
      phone: app.phone,
      email: app.email,
      vehicle_type: app.vehicle_type,
      vehicle_registration: app.vehicle_registration,
      license_number: app.license_number,
      status: 'active',
      country: app.country,
      region: app.region,
      city: app.city,
    });

    // Update application
    await supabase.from('foober_driver_applications').update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', applicationId);

    // Send welcome email
    await sendEmail(
      app.email,
      'Welcome to Foober — You\'re Approved!',
      `<h2>Welcome to Foober, ${app.full_name}!</h2>
       <p>Your driver application has been approved.</p>
       <p><strong>Login details:</strong><br>
       Email: ${app.email}<br>
       Temporary password: ${tempPassword}</p>
       <p>Please change your password after your first login.</p>
       <p><a href="https://www.africanfarmingunion.org/driver">Go to Driver Portal</a></p>`
    ).catch(() => {});

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('[admin/foober/approve]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
