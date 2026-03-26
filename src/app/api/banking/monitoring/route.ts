/**
 * Transaction Monitoring API (Admin only)
 * GET  — Get flags, stats, velocity rules
 * POST — Review/escalate flags, manage rules
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { MonitoringService } from '@/lib/banking';

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
    const monitoring = new MonitoringService(db);

    const action = req.nextUrl.searchParams.get('action');

    if (action === 'stats') {
      const stats = await monitoring.getStats();
      return NextResponse.json(stats);
    }

    if (action === 'rules') {
      const rules = await monitoring.getActiveRules();
      return NextResponse.json(rules);
    }

    // Default: get flags
    const status = req.nextUrl.searchParams.get('status') || undefined;
    const severity = req.nextUrl.searchParams.get('severity') || undefined;
    const userId = req.nextUrl.searchParams.get('user_id') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    const result = await monitoring.getFlags({ status, severity, user_id: userId, limit, offset });
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
    const { action } = body;

    const db = await createAdminClient();
    const monitoring = new MonitoringService(db);

    switch (action) {
      case 'review': {
        if (!body.flag_id || !body.status) {
          return NextResponse.json({ error: 'flag_id and status required' }, { status: 400 });
        }
        const flag = await monitoring.reviewFlag(body.flag_id, user.id, body.status, body.notes);
        return NextResponse.json(flag);
      }

      case 'escalate': {
        if (!body.flag_id || !body.escalated_to) {
          return NextResponse.json({ error: 'flag_id and escalated_to required' }, { status: 400 });
        }
        const flag = await monitoring.escalateFlag(body.flag_id, body.escalated_to, user.id, body.notes);
        return NextResponse.json(flag);
      }

      case 'create_rule': {
        if (!body.name || !body.window_minutes) {
          return NextResponse.json({ error: 'name and window_minutes required' }, { status: 400 });
        }
        const rule = await monitoring.createRule(body);
        return NextResponse.json(rule, { status: 201 });
      }

      case 'update_rule': {
        if (!body.rule_id) {
          return NextResponse.json({ error: 'rule_id required' }, { status: 400 });
        }
        const { rule_id, ...updates } = body;
        const rule = await monitoring.updateRule(rule_id, updates);
        return NextResponse.json(rule);
      }

      default:
        return NextResponse.json({ error: 'Invalid action. Use: review, escalate, create_rule, update_rule' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
