import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

async function writeAudit(
  svc: SupabaseClient,
  payload: { user_id: string; action: string; entity_id: string; details: Record<string, unknown> }
) {
  try {
    const { error } = await (svc.from('audit_log') as unknown as {
      insert: (row: Record<string, unknown>) => Promise<{ error: { message: string } | null }>;
    }).insert({
      user_id: payload.user_id,
      action: payload.action,
      entity_type: 'profiles',
      entity_id: payload.entity_id,
      details: payload.details,
    });
    if (error) {
      console.warn('[AUDIT] insert failed, falling back to log:', error.message, payload);
    }
  } catch (e) {
    console.warn('[AUDIT] exception, falling back to log:', e, payload);
  }
}

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

/**
 * DELETE /api/admin/users/[id]
 *
 * Soft-deletes a user by default: anonymizes email, sets role='deleted',
 * marks deleted_at=now(). If body has `{ hard: true }`, performs a hard
 * delete via supabase.auth.admin.deleteUser which cascades.
 *
 * Rules:
 * - super_admin only
 * - Cannot delete yourself
 * - Cannot delete other super_admins
 * - Optional `{ confirm: 'DELETE' }` in body for safety
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Missing user id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const hard: boolean = body?.hard === true;
    const confirm: string | undefined = body?.confirm;

    // ── Auth ─────────────────────────────────────────────────────────
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

    if (!callerProfile || callerProfile.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden: super_admin required to delete users' },
        { status: 403 }
      );
    }

    // Cannot delete yourself
    if (caller.id === targetUserId) {
      return NextResponse.json(
        { success: false, error: 'You cannot delete your own account' },
        { status: 400 }
      );
    }

    // Fetch target
    const { data: targetProfile, error: targetErr } = await svc
      .from('profiles')
      .select('id, full_name, email, role')
      .eq('id', targetUserId)
      .single();

    if (targetErr || !targetProfile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Cannot delete another super_admin without explicit force flag
    if (targetProfile.role === 'super_admin' && !body?.force) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete another super_admin without { force: true }' },
        { status: 403 }
      );
    }

    // Optional confirmation
    if (confirm !== undefined && confirm !== 'DELETE') {
      return NextResponse.json(
        { success: false, error: 'Confirmation string must be "DELETE"' },
        { status: 400 }
      );
    }

    let mode: 'soft' | 'hard' = 'soft';

    if (hard) {
      // HARD DELETE — cascades profile via FK
      const { error: delErr } = await svc.auth.admin.deleteUser(targetUserId);
      if (delErr) {
        return NextResponse.json(
          { success: false, error: 'Hard delete failed: ' + delErr.message },
          { status: 500 }
        );
      }
      mode = 'hard';
    } else {
      // SOFT DELETE — anonymize
      const anonymizedEmail = `deleted+${targetUserId}@example.invalid`;
      const softUpdate: Record<string, unknown> = {
        email: anonymizedEmail,
        role: 'deleted',
        deleted_at: new Date().toISOString(),
      };
      const { error: updErr } = await svc
        .from('profiles')
        .update(softUpdate)
        .eq('id', targetUserId);

      if (updErr) {
        // If deleted_at column doesn't exist, retry without it
        if (/deleted_at/i.test(updErr.message)) {
          delete softUpdate.deleted_at;
          const { error: retryErr } = await svc
            .from('profiles')
            .update(softUpdate)
            .eq('id', targetUserId);
          if (retryErr) {
            return NextResponse.json(
              { success: false, error: 'Soft delete failed: ' + retryErr.message },
              { status: 500 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Soft delete failed: ' + updErr.message },
            { status: 500 }
          );
        }
      }

      // Also update auth.users email so the account can't sign in with the old address
      try {
        await svc.auth.admin.updateUserById(targetUserId, {
          email: anonymizedEmail,
          ban_duration: '876000h', // ~100 years
        });
      } catch (e) {
        console.warn('[admin/users DELETE] failed to ban/anonymize auth user:', e);
      }
    }

    await writeAudit(svc, {
      user_id: caller.id,
      action: 'user_deleted',
      entity_id: targetUserId,
      details: {
        target_user_id: targetUserId,
        target_email: targetProfile.email,
        target_role: targetProfile.role,
        mode,
      },
    });

    return NextResponse.json({ success: true, mode });
  } catch (err) {
    console.error('[admin/users DELETE] error', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
