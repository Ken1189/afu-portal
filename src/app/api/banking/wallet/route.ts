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

    const action = req.nextUrl.searchParams.get('action');

    // ── Balance endpoint ──────────────────────────────────────────────
    if (action === 'balance') {
      const wallets = await walletService.getUserWallets(user.id);
      if (!wallets || wallets.length === 0) {
        return NextResponse.json({ balance: 0, currency: 'USD', wallet_id: null });
      }
      const primary = wallets[0];
      return NextResponse.json({
        balance: primary.balance ?? 0,
        currency: primary.currency,
        wallet_id: primary.id,
        account_number: primary.account_number,
        status: primary.status,
      });
    }

    // ── Transaction history endpoint ──────────────────────────────────
    if (action === 'history') {
      const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
      const limit = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20', 10), 100);
      const type = req.nextUrl.searchParams.get('type') || 'all';
      const offset = (page - 1) * limit;

      // Get user's wallet IDs first
      const wallets = await walletService.getUserWallets(user.id);
      const walletIds = wallets.map((w: any) => w.id);

      if (walletIds.length === 0) {
        return NextResponse.json({ transactions: [], total: 0, page, limit });
      }

      let query = db
        .from('wallet_transactions')
        .select('*', { count: 'exact' })
        .in('wallet_id', walletIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data: transactions, count, error } = await query;

      if (error) throw error;

      return NextResponse.json({
        transactions: transactions || [],
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      });
    }

    // ── QR code data endpoint ─────────────────────────────────────────
    if (action === 'qr') {
      const wallets = await walletService.getUserWallets(user.id);
      if (!wallets || wallets.length === 0) {
        return NextResponse.json({ error: 'No wallet found' }, { status: 404 });
      }
      const primary = wallets[0];
      return NextResponse.json({
        qr_data: `afu:pay:${primary.account_number}`,
        account_number: primary.account_number,
        display_name: primary.display_name || 'AFU Wallet',
        currency: primary.currency,
      });
    }

    // ── Default: Get wallets (existing behavior) ──────────────────────
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
        if (!body.amount) {
          return NextResponse.json({ error: 'amount required' }, { status: 400 });
        }

        let fromWalletId = body.from_wallet_id;
        let toWalletId = body.to_wallet_id;

        // If no from_wallet_id, use authenticated user's primary wallet
        if (!fromWalletId) {
          const senderWallets = await walletService.getUserWallets(user.id);
          if (!senderWallets || senderWallets.length === 0) {
            return NextResponse.json({ error: 'You do not have a wallet' }, { status: 400 });
          }
          fromWalletId = senderWallets[0].id;
        }

        // If recipient is specified by email/phone instead of wallet ID, look them up
        if (!toWalletId && body.recipient) {
          const recipient = body.recipient.trim();
          // Try to find user by email or phone
          let recipientUserId: string | null = null;

          const { data: byEmail } = await db
            .from('profiles')
            .select('id')
            .eq('email', recipient)
            .limit(1)
            .single();

          if (byEmail) {
            recipientUserId = byEmail.id;
          } else {
            const { data: byPhone } = await db
              .from('profiles')
              .select('id')
              .eq('phone', recipient)
              .limit(1)
              .single();
            if (byPhone) {
              recipientUserId = byPhone.id;
            }
          }

          if (!recipientUserId) {
            return NextResponse.json({ error: 'Recipient not found' }, { status: 404 });
          }

          // Get recipient's primary wallet
          const recipientWallets = await walletService.getUserWallets(recipientUserId);
          if (!recipientWallets || recipientWallets.length === 0) {
            return NextResponse.json({ error: 'Recipient does not have a wallet' }, { status: 400 });
          }
          toWalletId = recipientWallets[0].id;
        }

        if (!fromWalletId || !toWalletId) {
          return NextResponse.json({ error: 'from_wallet_id and to_wallet_id (or recipient) required' }, { status: 400 });
        }

        const result = await walletService.transfer({
          from_wallet_id: fromWalletId,
          to_wallet_id: toWalletId,
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
