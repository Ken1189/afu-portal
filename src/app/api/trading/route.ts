import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

/**
 * GET /api/trading
 * Fetch trade orders with optional filters.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    const country = url.searchParams.get('country');
    const commodity = url.searchParams.get('commodity');
    const userId = url.searchParams.get('user_id');

    const adminClient = await createAdminClient();
    let query = adminClient.from('trade_orders').select('*').order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('order_type', type);
    if (country) query = query.eq('country', country);
    if (commodity) query = query.eq('commodity', commodity);
    if (userId) query = query.eq('user_id', userId);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trading
 * Create a new trade order with auto-generated order number (TRD-YYYYMMDD-XXXX).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const {
      type,
      commodity,
      quantity,
      unit,
      quality_grade,
      country,
      delivery_location,
      deadline,
      target_price,
      currency,
      notes,
    } = body;

    // Validate required fields
    if (!type || !commodity || !quantity || !delivery_location || !deadline || !target_price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['buy', 'sell'].includes(type)) {
      return NextResponse.json({ error: 'Type must be "buy" or "sell"' }, { status: 400 });
    }

    // Generate order number: TRD-YYYYMMDD-XXXX
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
    const orderNumber = `TRD-${dateStr}-${seq}`;

    const adminClient = await createAdminClient();

    const { data: order, error } = await adminClient
      .from('trade_orders')
      .insert({
        order_number: orderNumber,
        user_id: user.id,
        order_type: type,
        commodity,
        quantity: parseFloat(quantity),
        unit: unit || 'kg',
        quality_grade: quality_grade || 'Grade B (Standard)',
        country: country || null,
        delivery_location,
        target_price: parseFloat(target_price),
        currency: currency || 'USD',
        notes: notes || null,
        status: 'open',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Emit cross-system event (fire-and-forget)
    emitEventAsync({
      type: 'TRADE_ORDER_CREATED',
      data: {
        orderId: order.id,
        userId: user.id,
        type,
        commodity,
        quantity: parseFloat(quantity),
        country: country || undefined,
        orderNumber,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
