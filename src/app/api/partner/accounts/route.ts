/**
 * Partner API: Account Management
 *
 * Bank partner can:
 * - GET accounts by user or account number
 * - POST to create accounts, freeze/unfreeze
 *
 * All requests authenticated via HMAC-SHA256 + API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticatePartner, checkRateLimit } from '@/lib/banking/partner-auth';
import { WalletService } from '@/lib/banking';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(req: NextRequest) {
  const auth = await authenticatePartner(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!checkRateLimit(auth.partner.partner_id)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const db = getServiceClient();
    const walletService = new WalletService(db);

    const userId = req.nextUrl.searchParams.get('user_id');
    const accountNumber = req.nextUrl.searchParams.get('account_number');

    if (accountNumber) {
      const wallet = await walletService.getWalletByNumber(accountNumber);
      if (!wallet) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      return NextResponse.json({
        account_number: wallet.account_number,
        account_type: wallet.account_type,
        currency: wallet.currency,
        balance: wallet.balance,
        status: wallet.status,
        user_id: wallet.user_id,
        created_at: wallet.created_at,
      });
    }

    if (userId) {
      const wallets = await walletService.getUserWallets(userId);
      return NextResponse.json(wallets.map(w => ({
        account_number: w.account_number,
        account_type: w.account_type,
        currency: w.currency,
        balance: w.balance,
        status: w.status,
        created_at: w.created_at,
      })));
    }

    return NextResponse.json({ error: 'user_id or account_number required' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await authenticatePartner(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (!checkRateLimit(auth.partner.partner_id)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { action } = body;
    const db = getServiceClient();
    const walletService = new WalletService(db);

    switch (action) {
      case 'create': {
        if (!body.user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });
        const wallet = await walletService.createWallet({
          user_id: body.user_id,
          account_type: body.account_type || 'savings',
          currency: body.currency || 'USD',
          display_name: body.display_name,
        });
        return NextResponse.json({
          account_number: wallet.account_number,
          account_type: wallet.account_type,
          currency: wallet.currency,
          status: wallet.status,
        }, { status: 201 });
      }

      case 'freeze': {
        if (!body.wallet_id || !body.reason) {
          return NextResponse.json({ error: 'wallet_id and reason required' }, { status: 400 });
        }
        await walletService.freezeWallet(body.wallet_id, body.reason, 'partner:' + auth.partner.partner_id);
        return NextResponse.json({ status: 'frozen' });
      }

      case 'unfreeze': {
        if (!body.wallet_id) return NextResponse.json({ error: 'wallet_id required' }, { status: 400 });
        await walletService.unfreezeWallet(body.wallet_id);
        return NextResponse.json({ status: 'active' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
