import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * GET /api/admin/users/[id]
 * Returns the user's full profile + role + capabilities + linked-row existence.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user: caller }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !caller) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: callerProfile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: profile, error: profileErr } = await svc
      .from('profiles')
      .select('id, full_name, email, role, country, region, capabilities, created_at')
      .eq('id', targetUserId)
      .single();

    if (profileErr || !profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Linked rows lookup
    const [supplierRes, ambassadorRes, memberRes] = await Promise.all([
      svc.from('suppliers').select('id, created_at').eq('profile_id', targetUserId).maybeSingle(),
      svc.from('ambassadors').select('id, created_at').eq('user_id', targetUserId).maybeSingle(),
      svc.from('members').select('id, tier, created_at').eq('profile_id', targetUserId).maybeSingle(),
    ]);

    return NextResponse.json({
      profile: {
        ...profile,
        capabilities: profile.capabilities || [],
      },
      linked: {
        supplier: supplierRes.data || null,
        ambassador: ambassadorRes.data || null,
        member: memberRes.data || null,
      },
    });
  } catch (err) {
    console.error('[admin/users GET] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
