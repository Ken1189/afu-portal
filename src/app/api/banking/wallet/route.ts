/**
 * Wallet API
 * GET  — Get user's wallets (or specific wallet by ID)
 * POST — Create new wallet / deposit / withdraw / transfer
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { WalletService } from '@/lib/banking';

async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await createAdminClient();
    const walletService = new WalletService(db);

    const walletId = req.nextUrl.searchParams.get('id');

    if (walletId) {
      const wallet = await walletService.getWallet(walletId);
      if (!wallet) return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
      if (wallet.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      return NextResponse.json(wallet);
    }

    const wallets = await walletService.getUserWallets(user.id);
    return NextResponse.json(wallets);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const db = await createAdminClient();
    const walletService = new WalletService(db);

    switch (action) {
      case 'create': {
        const wallet = await walletService.createWallet({
          user_id: user.id,
          account_type: body.account_type || 'savings',
          currency: body.currency || 'USD',
          display_name: body.display_name,
        });
        return NextResponse.json(wallet, { status: 201 });
      }

      case 'deposit': {
        if (!body.wallet_id || !body.amount) {
          return NextResponse.json({ error: 'wallet_id and amount required' }, { status: 400 });
        }
        const txn = await walletService.deposit({
          wallet_id: body.wallet_id,
          amount: body.amount,
          description: body.description,
          reference: body.reference,
          operator_id: user.id,
        });
        return NextResponse.json(txn);
      }

      case 'withdraw': {
        if (!body.wallet_id || !body.amount) {
          return NextResponse.json({ error: 'wallet_id and amount required' }, { status: 400 });
        }
        const txn = await walletService.withdraw({
          wallet_id: body.wallet_id,
          amount: body.amount,
          description: body.description,
          reference: body.reference,
          operator_id: user.id,
        });
        return NextResponse.json(txn);
      }

      case 'transfer': {
        if (!body.from_wallet_id || !body.to_wallet_id || !body.amount) {
          return NextResponse.json({ error: 'from_wallet_id, to_wallet_id, and amount required' }, { status: 400 });
        }
        const result = await walletService.transfer({
          from_wallet_id: body.from_wallet_id,
          to_wallet_id: body.to_wallet_id,
          amount: body.amount,
          description: body.description,
          reference: body.reference,
          operator_id: user.id,
        });
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: create, deposit, withdraw, transfer' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
