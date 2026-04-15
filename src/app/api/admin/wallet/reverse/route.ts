import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { WalletService } from '@/lib/banking';

/**
 * POST /api/admin/wallet/reverse
 * Reverse a wallet transaction (creates an opposite transaction).
 * Body: { transactionId, reason }
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
    const { transactionId, reason } = body as { transactionId?: string; reason?: string };

    if (!transactionId || !reason) {
      return NextResponse.json({ error: 'transactionId and reason are required' }, { status: 400 });
    }

    // Fetch the original transaction
    const { data: originalTxn, error: txnErr } = await db
      .from('wallet_transactions')
      .select('id, wallet_id, type, amount, currency, status, description, reference')
      .eq('id', transactionId)
      .single();

    if (txnErr || !originalTxn) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (originalTxn.status === 'reversed') {
      return NextResponse.json({ error: 'Transaction already reversed' }, { status: 400 });
    }

    const walletService = new WalletService(db);
    const reversalDesc = `Reversal of ${originalTxn.reference || transactionId}: ${reason} (by ${user.email})`;

    // Create opposite transaction
    if (originalTxn.type === 'credit' || originalTxn.type === 'deposit') {
      // Original was a credit — reverse by withdrawing
      await walletService.withdraw({
        wallet_id: originalTxn.wallet_id,
        amount: Number(originalTxn.amount),
        description: reversalDesc,
        reference: `reversal-${transactionId}`,
        operator_id: user.id,
      });
    } else {
      // Original was a debit/withdrawal — reverse by crediting
      await walletService.deposit({
        wallet_id: originalTxn.wallet_id,
        amount: Number(originalTxn.amount),
        description: reversalDesc,
        reference: `reversal-${transactionId}`,
        operator_id: user.id,
      });
    }

    // Mark original transaction as reversed
    await db
      .from('wallet_transactions')
      .update({ status: 'reversed' })
      .eq('id', transactionId);

    // Audit log
    await db.from('audit_log').insert({
      user_id: user.id,
      action: 'transaction_reversal',
      entity_type: 'wallet_transactions',
      entity_id: transactionId,
      details: {
        original_type: originalTxn.type,
        amount: originalTxn.amount,
        currency: originalTxn.currency,
        wallet_id: originalTxn.wallet_id,
        reason,
      },
    }).then(({ error }) => {
      if (error) console.error('[admin/wallet/reverse] audit log error:', error);
    });

    return NextResponse.json({
      success: true,
      reversed_transaction_id: transactionId,
      amount: originalTxn.amount,
      reason,
    });
  } catch (err) {
    console.error('[admin/wallet/reverse] error:', err);
    return NextResponse.json({ error: 'Failed to reverse transaction' }, { status: 500 });
  }
}
