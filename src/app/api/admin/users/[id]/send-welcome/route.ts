import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { sendWelcomeEmail } from '@/lib/email/welcome-user';

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

function generateTempPassword(): string {
  return `AFU-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
}

/**
 * POST /api/admin/users/[id]/send-welcome
 *
 * Generates a NEW temporary password, updates the auth user, and re-sends
 * the welcome email containing the user's accessible portals + features.
 */
export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ success: false, error: 'Missing user id' }, { status: 400 });
    }

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

    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: admin access required' },
        { status: 403 }
      );
    }

    // Fetch target profile
    const { data: targetProfile, error: targetErr } = await svc
      .from('profiles')
      .select('id, full_name, email, role, capabilities')
      .eq('id', targetUserId)
      .single();

    if (targetErr || !targetProfile) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (!targetProfile.email) {
      return NextResponse.json(
        { success: false, error: 'User has no email address' },
        { status: 400 }
      );
    }

    // Generate new temp password and update auth user
    const tempPassword = generateTempPassword();
    const { error: updErr } = await svc.auth.admin.updateUserById(targetUserId, {
      password: tempPassword,
    });
    if (updErr) {
      return NextResponse.json(
        { success: false, error: 'Failed to reset password: ' + updErr.message },
        { status: 500 }
      );
    }

    // Send welcome email
    try {
      await sendWelcomeEmail({
        userId: targetUserId,
        email: targetProfile.email,
        full_name: targetProfile.full_name,
        role: targetProfile.role || 'member',
        capabilities: Array.isArray(targetProfile.capabilities) ? targetProfile.capabilities : [],
        temp_password: tempPassword,
      });
    } catch (e) {
      console.error('[send-welcome] email failed:', e);
      return NextResponse.json(
        { success: false, error: 'Password reset but welcome email failed to send' },
        { status: 500 }
      );
    }

    await writeAudit(svc, {
      user_id: caller.id,
      action: 'welcome_resent',
      entity_id: targetUserId,
      details: {
        target_user_id: targetUserId,
        target_email: targetProfile.email,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/users send-welcome] error', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
