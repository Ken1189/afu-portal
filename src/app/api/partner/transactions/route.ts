/**
 * Partner API: Transactions
 *
 * Bank partner can:
 * - GET transaction history for an account
 * - POST to record deposits/withdrawals from bank side
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticatePartner, checkRateLimit } from '@/lib/banking/partner-auth';
import { WalletService, MonitoringService } from '@/lib/banking';

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

    const walletId = req.nextUrl.searchParams.get('wallet_id');
    const accountNumber = req.nextUrl.searchParams.get('account_number');

    let targetWalletId = walletId;

    if (!targetWalletId && accountNumber) {
      const wallet = await walletService.getWalletByNumber(accountNumber);
      if (!wallet) return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      targetWalletId = wallet.id;
    }

    if (!targetWalletId) {
      return NextResponse.json({ error: 'wallet_id or account_number required' }, { status: 400 });
    }

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    const result = await walletService.getTransactions(targetWalletId, { limit, offset });
    return NextResponse.json(result);
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
    const monitoring = new MonitoringService(db);

    switch (action) {
      case 'deposit': {
        if (!body.wallet_id || !body.amount) {
          return NextResponse.json({ error: 'wallet_id and amount required' }, { status: 400 });
        }

        const txn = await walletService.deposit({
          wallet_id: body.wallet_id,
          amount: body.amount,
          description: body.description || `Bank deposit via ${auth.partner.name}`,
          reference: body.reference,
        });

        // Screen transaction
        const wallet = await walletService.getWallet(body.wallet_id);
        if (wallet) {
          await monitoring.screenTransaction({
            user_id: wallet.user_id,
            amount: body.amount,
            currency: wallet.currency,
            country_code: body.country_code,
            ip_address: req.headers.get('x-forwarded-for') || undefined,
          });
        }

        return NextResponse.json({
          transaction_id: txn.id,
          status: 'completed',
          balance_after: txn.balance_after,
        });
      }

      case 'withdrawal': {
        if (!body.wallet_id || !body.amount) {
          return NextResponse.json({ error: 'wallet_id and amount required' }, { status: 400 });
        }

        const txn = await walletService.withdraw({
          wallet_id: body.wallet_id,
          amount: body.amount,
          description: body.description || `Bank withdrawal via ${auth.partner.name}`,
          reference: body.reference,
        });

        return NextResponse.json({
          transaction_id: txn.id,
          status: 'completed',
          balance_after: txn.balance_after,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: deposit, withdrawal' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
