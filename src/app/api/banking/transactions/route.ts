/**
 * Wallet Transactions API
 * GET — Get transaction history for a wallet (mini-statement)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { WalletService } from '@/lib/banking';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const walletId = req.nextUrl.searchParams.get('wallet_id');
    if (!walletId) return NextResponse.json({ error: 'wallet_id required' }, { status: 400 });

    const db = await createAdminClient();
    const walletService = new WalletService(db);

    // Verify wallet belongs to user
    const wallet = await walletService.getWallet(walletId);
    if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    if (wallet.user_id !== user.id) {
      // Allow admins to view any wallet
      const role = user.user_metadata?.role;
      if (role !== 'admin' && role !== 'super_admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const type = req.nextUrl.searchParams.get('type') || undefined;

    const result = await walletService.getTransactions(walletId, { limit, offset, type });

    return NextResponse.json({
      wallet_id: walletId,
      account_number: wallet.account_number,
      currency: wallet.currency,
      balance: wallet.balance,
      transactions: result.transactions,
      total: result.total,
      limit,
      offset,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
