import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/applications/auto-approve-free
 * Auto-approves free tier applications without admin auth.
 * Creates auth user, profile, and member record instantly.
 */
export async function POST(req: Request) {
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

  return NextResponse.json({ success: true, tempPassword });
}
