import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * GET /api/trading/quotes?order_id=xxx
 * Fetch quotes for an order (or all quotes for current user as supplier).
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('order_id');

    const adminClient = await createAdminClient();
    let query = adminClient.from('trade_quotes').select('*').order('created_at', { ascending: false });

    if (orderId) {
      query = query.eq('order_id', orderId);
    } else {
      // If no order_id, return supplier's own quotes
      query = query.eq('supplier_id', user.id);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ quotes: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/trading/quotes
 * Submit a new quote on a marketplace order.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { order_id, price_per_unit, quantity_available, delivery_date, delivery_terms, notes } = body;

    if (!order_id || !price_per_unit || !quantity_available || !delivery_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    // Verify the order exists and is on marketplace
    const { data: order } = await adminClient
      .from('trade_orders')
      .select('id, status')
      .eq('id', order_id)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'marketplace') {
      return NextResponse.json({ error: 'Order is not accepting quotes' }, { status: 400 });
    }

    // Insert the quote
    const { data: quote, error } = await adminClient
      .from('trade_quotes')
      .insert({
        order_id,
        supplier_id: user.id,
        price_per_unit: parseFloat(price_per_unit),
        quantity_available: parseFloat(quantity_available),
        delivery_date,
        delivery_terms: delivery_terms || 'FOB',
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update order status to 'quoted' since at least one quote exists
    await adminClient
      .from('trade_orders')
      .update({ status: 'quoted', updated_at: new Date().toISOString() })
      .eq('id', order_id);

    return NextResponse.json({ quote }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/trading/quotes
 * Accept or reject a quote.
 * Body: { quote_id, status: 'accepted' | 'rejected', order_id }
 */
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await req.json();
    const { quote_id, status, order_id } = body;

    if (!quote_id || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Status must be "accepted" or "rejected"' }, { status: 400 });
    }

    const adminClient = await createAdminClient();

    // Update the quote
    const { data: quote, error } = await adminClient
      .from('trade_quotes')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', quote_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If accepted, update order status to 'accepted' and reject other pending quotes
    if (status === 'accepted' && order_id) {
      await adminClient
        .from('trade_orders')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('id', order_id);

      // Reject all other pending quotes for this order
      await adminClient
        .from('trade_quotes')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('order_id', order_id)
        .eq('status', 'pending')
        .neq('id', quote_id);
    }

    return NextResponse.json({ quote });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
