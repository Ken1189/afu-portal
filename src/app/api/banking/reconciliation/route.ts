/**
 * Reconciliation API (Admin only)
 * GET  — Get recon runs, items, EOD summary
 * POST — Start run, reconcile, resolve items
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { ReconciliationService } from '@/lib/banking';

// S1.9: Check role from DB, not JWT metadata
async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = await createAdminClient();
  const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) return null;
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await createAdminClient();
    const recon = new ReconciliationService(db);

    const action = req.nextUrl.searchParams.get('action');

    if (action === 'eod') {
      const date = req.nextUrl.searchParams.get('date');
      if (!date) return NextResponse.json({ error: 'date required (YYYY-MM-DD)' }, { status: 400 });
      const summary = await recon.getEODSummary(date);
      return NextResponse.json(summary);
    }

    if (action === 'items') {
      const runId = req.nextUrl.searchParams.get('run_id');
      if (!runId) return NextResponse.json({ error: 'run_id required' }, { status: 400 });
      const status = req.nextUrl.searchParams.get('status') || undefined;
      const items = await recon.getRunItems(runId, status);
      return NextResponse.json(items);
    }

    // Default: get recent runs
    const provider = req.nextUrl.searchParams.get('provider') || undefined;
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '30');

    const runs = await recon.getRecentRuns({ provider, status, limit });
    return NextResponse.json(runs);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;

    const db = await createAdminClient();
    const recon = new ReconciliationService(db);

    switch (action) {
      case 'start': {
        if (!body.run_date || !body.provider || !body.currency) {
          return NextResponse.json({ error: 'run_date, provider, and currency required' }, { status: 400 });
        }
        const run = await recon.startRun({
          run_date: body.run_date,
          provider: body.provider,
          currency: body.currency,
          run_by: user.id,
        });
        return NextResponse.json(run, { status: 201 });
      }

      case 'reconcile': {
        if (!body.run_id || !body.provider_statements) {
          return NextResponse.json({ error: 'run_id and provider_statements required' }, { status: 400 });
        }
        const run = await recon.reconcile(body.run_id, body.provider_statements);
        return NextResponse.json(run);
      }

      case 'resolve': {
        if (!body.item_id || !body.notes) {
          return NextResponse.json({ error: 'item_id and notes required' }, { status: 400 });
        }
        const item = await recon.resolveItem(body.item_id, user.id, body.notes);
        return NextResponse.json(item);
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: start, reconcile, resolve' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
