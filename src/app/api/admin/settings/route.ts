import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function getSvc() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

/**
 * GET /api/admin/settings — returns all platform settings
 */
export async function GET() {
  try {
    const svc = getSvc();
    const { data, error } = await svc.from('platform_settings').select('*');

    if (error?.message?.includes('does not exist')) {
      // Table doesn't exist yet — return defaults
      return NextResponse.json({
        general: { platformName: 'African Farming Union', supportEmail: 'support@afu.org', defaultCurrency: 'USD', maintenanceMode: false },
        membership: { autoApprove: false, trialDays: 14, requireKyc: true },
        notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: false },
        security: { maxLoginAttempts: 5, sessionTimeoutMinutes: 60, require2FA: false },
      });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({
        general: { platformName: 'African Farming Union', supportEmail: 'support@afu.org', defaultCurrency: 'USD', maintenanceMode: false },
        membership: { autoApprove: false, trialDays: 14, requireKyc: true },
        notifications: { emailEnabled: true, smsEnabled: false, pushEnabled: false },
        security: { maxLoginAttempts: 5, sessionTimeoutMinutes: 60, require2FA: false },
      });
    }

    // Convert array of {key, value} to object
    const settings: Record<string, unknown> = {};
    data.forEach(row => { settings[row.key] = row.value; });
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/settings — update a setting
 * Body: { key: string, value: object }
 */
export async function PUT(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const svc = getSvc();

    // Check role
    const { data: profile } = await svc.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || !value) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
    }

    const { error } = await svc.from('platform_settings').upsert({
      key,
      value,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await svc.from('audit_log').insert({
      user_id: user.id,
      action: 'update_settings',
      entity_type: 'platform_settings',
      details: { key, changed_by: user.email },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
