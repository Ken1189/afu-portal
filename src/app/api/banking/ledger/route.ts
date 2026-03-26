/**
 * Ledger API (Admin only)
 * GET  — Query ledger entries, validate zero-balance
 * POST — Record manual ledger transaction
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { LedgerService } from '@/lib/banking';

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const role = user.user_metadata?.role;
  if (role !== 'admin' && role !== 'super_admin') return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await createAdminClient();
    const ledger = new LedgerService(db);

    const action = req.nextUrl.searchParams.get('action');

    if (action === 'validate') {
      const currency = req.nextUrl.searchParams.get('currency') || undefined;
      const result = await ledger.validateZeroBalance(currency);
      return NextResponse.json(result);
    }

    if (action === 'transaction') {
      const txnId = req.nextUrl.searchParams.get('transaction_id');
      if (!txnId) return NextResponse.json({ error: 'transaction_id required' }, { status: 400 });
      const entries = await ledger.getTransaction(txnId);
      return NextResponse.json(entries);
    }

    // Default: get entries for an account
    const accountId = req.nextUrl.searchParams.get('account_id');
    if (!accountId) return NextResponse.json({ error: 'account_id or action required' }, { status: 400 });

    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    const result = await ledger.getAccountEntries(accountId, { limit, offset });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { debit_account_id, credit_account_id, amount, currency, description, reference, reference_type } = body;

    if (!debit_account_id || !credit_account_id || !amount || !currency) {
      return NextResponse.json({
        error: 'debit_account_id, credit_account_id, amount, and currency are required'
      }, { status: 400 });
    }

    const db = await createAdminClient();
    const ledger = new LedgerService(db);

    const result = await ledger.recordTransaction({
      debit_account_id,
      credit_account_id,
      amount,
      currency,
      description,
      reference,
      reference_type,
      operator_id: user.id,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
