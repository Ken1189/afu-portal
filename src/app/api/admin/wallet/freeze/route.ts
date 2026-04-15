import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { notifyUser } from '@/lib/events/notifications';

/**
 * POST /api/admin/wallet/freeze
 * Freeze or unfreeze a user's wallet (compliance hold).
 * Body: { userId, action: 'freeze' | 'unfreeze', reason }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const db = await createAdminClient();

    // Verify admin
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, reason } = body as {
      userId?: string;
      action?: 'freeze' | 'unfreeze';
      reason?: string;
    };

    if (!userId || !action || !reason) {
      return NextResponse.json({ error: 'userId, action (freeze/unfreeze), and reason are required' }, { status: 400 });
    }

    if (!['freeze', 'unfreeze'].includes(action)) {
      return NextResponse.json({ error: 'action must be freeze or unfreeze' }, { status: 400 });
    }

    // Get user's wallets
    const { data: wallets, error: walletErr } = await db
      .from('wallet_accounts')
      .select('id, account_number, currency, status')
      .eq('user_id', userId);

    if (walletErr || !wallets || wallets.length === 0) {
      return NextResponse.json({ error: 'No wallets found for this user' }, { status: 404 });
    }

    const newStatus = action === 'freeze' ? 'frozen' : 'active';

    // Update all wallets for this user
    const { error: updateErr } = await db
      .from('wallet_accounts')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update wallet status: ' + updateErr.message }, { status: 500 });
    }

    // Notify the user
    if (action === 'freeze') {
      notifyUser(
        userId,
        'Wallet Frozen',
        `Your wallet has been temporarily frozen for compliance review. Reason: ${reason}. Contact support for more information.`,
        'all',
        { type: 'system', actionUrl: '/dashboard/wallet' },
      ).catch((err) => console.error('[wallet/freeze] notification error:', err));
    } else {
      notifyUser(
        userId,
        'Wallet Unfrozen',
        'Your wallet has been reactivated. You can now make deposits, withdrawals, and transfers.',
        'all',
        { type: 'system', actionUrl: '/dashboard/wallet' },
      ).catch((err) => console.error('[wallet/unfreeze] notification error:', err));
    }

    // Audit log
    await db.from('audit_log').insert({
      user_id: user.id,
      action: `wallet_${action}`,
      entity_type: 'wallet_accounts',
      entity_id: userId,
      details: {
        target_user_id: userId,
        wallets_affected: wallets.length,
        new_status: newStatus,
        reason,
      },
    }).then(({ error }) => {
      if (error) console.error('[wallet/freeze] audit log error:', error);
    });

    return NextResponse.json({
      success: true,
      action,
      wallets_affected: wallets.length,
      new_status: newStatus,
      reason,
    });
  } catch (err) {
    console.error('[admin/wallet/freeze] error:', err);
    return NextResponse.json({ error: 'Failed to update wallet' }, { status: 500 });
  }
}
