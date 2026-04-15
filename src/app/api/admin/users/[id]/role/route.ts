import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { notifyUser } from '@/lib/events/notifications';

const ALLOWED_ROLES = [
  'farmer', 'supplier', 'ambassador', 'investor',
  'partner', 'admin', 'super_admin', 'member',
] as const;

type AllowedRole = typeof ALLOWED_ROLES[number];

 
async function writeAudit(
  svc: any,
  payload: { user_id: string; action: string; details: Record<string, unknown>; entity_id: string }
) {
  try {
    // audit_log may not be in generated types — cast through unknown
    const { error } = await (svc.from('audit_log') as unknown as {
      insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }).insert({
      user_id: payload.user_id,
      action: payload.action,
      details: payload.details,
      entity_id: payload.entity_id,
    });
    if (error) {
      console.warn('[AUDIT] insert failed, falling back to log:', error.message, payload);
      // audit_log is created in migrations 001 + 047; insert failures here
      // are non-fatal (caller continues, warning logged).
    }
  } catch (e) {
    console.warn('[AUDIT] exception:', e, payload);
    // audit_log is created in migrations 001 + 047; non-fatal here.
  }
}

/**
 * PATCH /api/admin/users/[id]/role
 * Body: { role: AllowedRole }
 * Updates profiles.role and creates linked supplier/ambassador/member rows when needed.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Missing user id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const newRole = body?.role as string | undefined;
    if (!newRole || !ALLOWED_ROLES.includes(newRole as AllowedRole)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Must be one of: ${ALLOWED_ROLES.join(', ')}` },
        { status: 400 }
      );
    }

    // ── Auth ─────────────────────────────────────────────────────────────
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
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
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
      return NextResponse.json({ success: false, error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // Only super_admin can grant super_admin
    if (newRole === 'super_admin' && callerProfile.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Only super_admin can assign super_admin' },
        { status: 403 }
      );
    }

    // Fetch existing target profile
    const { data: targetProfile, error: targetErr } = await svc
      .from('profiles')
      .select('id, full_name, email, country, region, role')
      .eq('id', targetUserId)
      .single();

    if (targetErr || !targetProfile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const oldRole = targetProfile.role;

    // Update role
    const { error: updateErr } = await svc
      .from('profiles')
      .update({ role: newRole })
      .eq('id', targetUserId);

    if (updateErr) {
      return NextResponse.json(
        { success: false, error: 'Failed to update role: ' + updateErr.message },
        { status: 500 }
      );
    }

    const sideEffects: string[] = [];

    // Side effect: supplier
    if (newRole === 'supplier') {
      const { data: existingSupplier } = await svc
        .from('suppliers')
        .select('id')
        .eq('profile_id', targetUserId)
        .maybeSingle();

      if (!existingSupplier) {
        const { error: supErr } = await svc.from('suppliers').insert({
          profile_id: targetUserId,
          company_name: targetProfile.full_name || 'Unnamed',
          contact_name: targetProfile.full_name || 'Unknown',
          email: targetProfile.email,
          category: 'input-supplier',
          country: targetProfile.country || 'Unknown',
          status: 'active',
          verified: false,
        });
        if (supErr) {
          console.error('[role PATCH] failed to create suppliers row:', supErr.message);
        } else {
          sideEffects.push('created suppliers row');
        }
      }
    }

    // Side effect: ambassador
    if (newRole === 'ambassador') {
      const { data: existingAmb } = await svc
        .from('ambassadors')
        .select('id')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (!existingAmb) {
        const { error: ambErr } = await svc.from('ambassadors').insert({
          user_id: targetUserId,
          full_name: targetProfile.full_name || 'Unnamed',
          email: targetProfile.email,
          country: targetProfile.country || 'Unknown',
          bio: null,
          sector: 'mixed',
        });
        if (ambErr) {
          console.error('[role PATCH] failed to create ambassadors row:', ambErr.message);
        } else {
          sideEffects.push('created ambassadors row');
        }
      }
    }

    // Side effect: farmer/member
    if (newRole === 'farmer' || newRole === 'member') {
      const { data: existingMember } = await svc
        .from('members')
        .select('id')
        .eq('profile_id', targetUserId)
        .maybeSingle();

      if (!existingMember) {
        const memberId = `AFU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`;
        const { error: memErr } = await svc.from('members').insert({
          profile_id: targetUserId,
          member_id: memberId,
          tier: 'free',
          status: 'active',
        });
        if (memErr) {
          console.error('[role PATCH] failed to create members row:', memErr.message);
        } else {
          sideEffects.push('created members row');
        }
      }
    }

    await writeAudit(svc, {
      user_id: caller.id,
      action: 'role_change',
      entity_id: targetUserId,
      details: {
        target_user_id: targetUserId,
        old_role: oldRole,
        new_role: newRole,
        side_effects: sideEffects,
      },
    });

    // Notify the user about their role change
    if (oldRole !== newRole) {
      const roleLabel = newRole.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
      notifyUser(
        targetUserId,
        'Account Role Updated',
        `Your account role has been updated to ${roleLabel}. You may now have access to new features and portals.`,
        'all',
        { type: 'system', actionUrl: '/dashboard' },
      ).catch((err) => console.error('[role PATCH] notification non-critical:', err));
    }

    return NextResponse.json({
      success: true,
      role: newRole,
      sideEffects,
    });
  } catch (err) {
    console.error('[admin/users role PATCH] error', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
