import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { notifyUser } from '@/lib/events/notifications';

/**
 * POST /api/admin/users/[id]/suspend
 * Temporarily suspend or unsuspend a user account.
 * Body: { action: 'suspend' | 'unsuspend', reason?: string }
 *
 * Suspend: bans user for 100 years, sets profile status to 'suspended'
 * Unsuspend: removes ban, restores profile status to 'active'
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await context.params;
    if (!targetUserId) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();
    const { data: { user: caller } } = await supabase.auth.getUser();
    if (!caller) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await createAdminClient();

    // Verify admin
    const { data: callerProfile } = await db.from('profiles').select('role').eq('id', caller.id).single();
    if (!callerProfile || !['admin', 'super_admin'].includes(callerProfile.role)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    // Can't suspend yourself
    if (targetUserId === caller.id) {
      return NextResponse.json({ error: 'Cannot suspend your own account' }, { status: 400 });
    }

    const body = await request.json();
    const { action, reason } = body as { action?: string; reason?: string };

    if (!action || !['suspend', 'unsuspend'].includes(action)) {
      return NextResponse.json({ error: 'action must be suspend or unsuspend' }, { status: 400 });
    }

    // Get target user
    const { data: targetProfile } = await db.from('profiles').select('role, email, full_name').eq('id', targetUserId).single();
    if (!targetProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Don't allow suspending super_admin
    if (targetProfile.role === 'super_admin') {
      return NextResponse.json({ error: 'Cannot suspend a super_admin' }, { status: 403 });
    }

    if (action === 'suspend') {
      // Ban the auth user (prevents login)
      await db.auth.admin.updateUserById(targetUserId, {
        ban_duration: '876000h', // ~100 years
      });

      // Update profile — store suspended_at and reason for audit
      await db.from('profiles').update({
        suspended_at: new Date().toISOString(),
        suspension_reason: reason || null,
      }).eq('id', targetUserId);

      // Also suspend their member record if it exists
      await db.from('members').update({ status: 'suspended' }).eq('profile_id', targetUserId);

      // Notify the user
      notifyUser(
        targetUserId,
        'Account Suspended',
        `Your account has been temporarily suspended.${reason ? ` Reason: ${reason}` : ''} Contact support if you believe this is an error.`,
        'email',
        { type: 'system' },
      ).catch((err) => console.error('[suspend] notification error:', err));

    } else {
      // Unsuspend — remove ban
      await db.auth.admin.updateUserById(targetUserId, {
        ban_duration: 'none',
      });

      // Clear suspension fields
      await db.from('profiles').update({
        suspended_at: null,
        suspension_reason: null,
      }).eq('id', targetUserId);

      // Reactivate member record
      await db.from('members').update({ status: 'active' }).eq('profile_id', targetUserId);

      // Notify the user
      notifyUser(
        targetUserId,
        'Account Reactivated',
        'Your account has been reactivated. You can now log in and access all your services.',
        'all',
        { type: 'system', actionUrl: '/dashboard' },
      ).catch((err) => console.error('[unsuspend] notification error:', err));
    }

    // Audit log
    await db.from('audit_log').insert({
      user_id: caller.id,
      action: `user_${action}ed`,
      entity_type: 'profiles',
      entity_id: targetUserId,
      details: {
        target_email: targetProfile.email,
        target_role: targetProfile.role,
        reason: reason || null,
      },
    }).then(({ error }) => {
      if (error) console.error('[suspend] audit log error:', error);
    });

    return NextResponse.json({
      success: true,
      action,
      userId: targetUserId,
      reason: reason || null,
    });
  } catch (err) {
    console.error('[admin/users/suspend] error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
