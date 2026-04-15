import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { WalletService } from '@/lib/banking';

/**
 * POST /api/admin/wallet/adjust
 * Manually adjust a user's wallet balance (credit or debit).
 * Body: { userId, amount, type: 'credit' | 'debit', reason }
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
    const { userId, amount, type, reason } = body as {
      userId?: string;
      amount?: number;
      type?: 'credit' | 'debit';
      reason?: string;
    };

    if (!userId || !amount || !type || !reason) {
      return NextResponse.json({ error: 'userId, amount, type (credit/debit), and reason are required' }, { status: 400 });
    }

    if (!['credit', 'debit'].includes(type)) {
      return NextResponse.json({ error: 'type must be credit or debit' }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: 'amount must be positive' }, { status: 400 });
    }

    const walletService = new WalletService(db);

    // Get user's primary wallet
    const wallets = await walletService.getUserWallets(userId);
    if (!wallets || wallets.length === 0) {
      return NextResponse.json({ error: 'User has no wallet' }, { status: 404 });
    }

    const wallet = wallets[0];
    const description = `Admin adjustment: ${reason} (by ${user.email})`;

    let result;
    if (type === 'credit') {
      result = await walletService.deposit({
        wallet_id: wallet.id,
        amount,
        description,
        reference: `admin-adjust-${Date.now()}`,
        operator_id: user.id,
      });
    } else {
      // Check sufficient balance for debit
      if ((wallet.balance ?? 0) < amount) {
        return NextResponse.json({ error: `Insufficient balance. Current: ${wallet.balance}` }, { status: 400 });
      }
      result = await walletService.withdraw({
        wallet_id: wallet.id,
        amount,
        description,
        reference: `admin-adjust-${Date.now()}`,
        operator_id: user.id,
      });
    }

    // Audit log
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'wallet_adjustment',
      entity_type: 'wallet_accounts',
      entity_id: wallet.id,
      details: {
        target_user_id: userId,
        type,
        amount,
        currency: wallet.currency,
        reason,
        balance_before: wallet.balance,
        transaction_id: result?.id,
      },
    }).then(({ error }) => {
      if (error) console.error('[admin/wallet/adjust] audit log error:', error);
    });

    return NextResponse.json({
      success: true,
      type,
      amount,
      wallet_id: wallet.id,
      reason,
    });
  } catch (err) {
    console.error('[admin/wallet/adjust] error:', err);
    return NextResponse.json({ error: 'Failed to adjust wallet' }, { status: 500 });
  }
}
