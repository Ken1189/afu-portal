/**
 * POST /api/events/emit  — Emit an event (internal / admin use)
 * GET  /api/events/emit  — List recent events from event_log (admin)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { emitEvent, type AFUEvent, type AFUEventType } from '@/lib/events/event-bus';

// Ensure handlers are registered
import '@/lib/events/handlers';

const VALID_EVENT_TYPES: AFUEventType[] = [
  'COMMODITY_RECEIVED', 'COMMODITY_RELEASED', 'QUALITY_INSPECTION_COMPLETE',
  'TRADE_ORDER_CREATED', 'TRADE_ORDER_MATCHED', 'TRADE_EXECUTED', 'QUOTE_RECEIVED',
  'PAYMENT_RECEIVED', 'LOAN_APPROVED', 'LOAN_DISBURSED', 'LOAN_REPAYMENT',
  'INSURANCE_PAYOUT', 'MEMBER_JOINED', 'APPLICATION_APPROVED', 'KYC_APPROVED',
  'MEMBERSHIP_PAYMENT', 'COOPERATIVE_ORDER_CREATED', 'COOPERATIVE_MEMBER_JOINED',
];

/**
 * POST — Emit an event
 * Body: { type: string, data: object }
 * Protected: admin / super_admin only
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json({ error: 'type and data are required' }, { status: 400 });
    }

    if (!VALID_EVENT_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid event type. Valid types: ${VALID_EVENT_TYPES.join(', ')}` },
        { status: 400 },
      );
    }

    const event = { type, data } as AFUEvent;
    const result = await emitEvent(event);

    return NextResponse.json({
      success: !result.error,
      eventId: result.eventId,
      error: result.error,
    });
  } catch (err) {
    console.error('POST /api/events/emit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET — List recent events from event_log
 * Query params: ?type=EVENT_TYPE&limit=100
 * Protected: admin / super_admin only
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const eventType = url.searchParams.get('type');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '100', 10), 500);

    let query = adminClient
      .from('event_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: events || [] });
  } catch (err) {
    console.error('GET /api/events/emit error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
