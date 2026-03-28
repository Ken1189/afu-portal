import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getSupabase() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

// GET /api/cooperatives/[id]/orders — list cooperative's trade orders
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('trade_orders')
      .select('*')
      .eq('cooperative_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cooperatives/[id]/orders — create cooperative bulk order
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const body = await req.json();

    const {
      type,
      commodity,
      quantity,
      unit = 'kg',
      quality_grade = 'Grade B (Standard)',
      target_price,
      currency = 'USD',
      deadline,
      notes,
    } = body;

    if (!type || !commodity || !quantity || !target_price || !deadline) {
      return NextResponse.json(
        { error: 'type, commodity, quantity, target_price, and deadline are required' },
        { status: 400 }
      );
    }

    // Get cooperative details for country/location
    const { data: coop } = await supabase
      .from('cooperatives')
      .select('country, region, name')
      .eq('id', id)
      .single();

    // Generate order number
    const prefix = type === 'buy' ? 'COOP-BUY' : 'COOP-SELL';
    const timestamp = Date.now().toString(36).toUpperCase();
    const orderNumber = `${prefix}-${timestamp}`;

    const { data, error } = await supabase
      .from('trade_orders')
      .insert({
        order_number: orderNumber,
        type,
        commodity,
        quantity: parseFloat(quantity),
        unit,
        quality_grade,
        country: coop?.country || 'Unknown',
        delivery_location: coop?.region || 'Cooperative Warehouse',
        deadline,
        target_price: parseFloat(target_price),
        currency,
        notes: notes || `Cooperative order from ${coop?.name || 'Unknown'}`,
        status: 'open',
        cooperative_id: id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ order: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
