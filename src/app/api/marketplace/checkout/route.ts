import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

const checkoutSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  deliveryAddress: z.string().min(5, 'Delivery address is required'),
  deliveryNotes: z.string().optional().default(''),
});

/**
 * POST /api/marketplace/checkout
 * Authenticated. Creates an order + order_item for a single product purchase
 * and returns a Stripe Checkout Session URL. The webhook flips the order
 * to 'paid' and writes a commission row when payment completes.
 */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Payment system is not configured. Please contact support.' },
        { status: 503 }
      );
    }

    // ── Auth ──────────────────────────────────────────────────────────────
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // ── Validate body ─────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((i) => i.message).join(', ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }
    const { productId, quantity, deliveryAddress, deliveryNotes } = parsed.data;

    const admin = await createAdminClient();

    // ── Idempotency: reuse existing checkout if key matches ─────────────────
    const idempotencyKey = req.headers.get('idempotency-key');
    if (idempotencyKey) {
      const { data: existingPayment } = await admin
        .from('payments')
        .select('id, order_id, provider_reference, description')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      if (existingPayment?.provider_reference) {
        return NextResponse.json({
          url: existingPayment.provider_reference,
          orderId: existingPayment.order_id,
          idempotent: true,
        });
      }
    }

    // ── Look up the product ───────────────────────────────────────────────
    const { data: product, error: productErr } = await admin
      .from('products')
      .select('id, name, price, member_price, currency, supplier_id, in_stock, stock_quantity')
      .eq('id', productId)
      .maybeSingle();

    if (productErr || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.in_stock === false) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    }
    if (
      product.stock_quantity != null &&
      (product.stock_quantity <= 0 || product.stock_quantity < quantity)
    ) {
      return NextResponse.json(
        { error: `Out of stock${product.stock_quantity > 0 ? ` (only ${product.stock_quantity} available)` : ''}` },
        { status: 400 }
      );
    }

    // ── Atomic stock decrement (fixes oversell race condition) ──────────────
    const { data: stockOk, error: stockErr } = await admin.rpc('decrement_product_stock', {
      p_product_id: product.id,
      p_quantity: quantity,
    });
    if (stockErr) {
      console.error('[marketplace/checkout] stock decrement failed:', stockErr);
      return NextResponse.json({ error: 'Failed to reserve stock' }, { status: 500 });
    }
    if (stockOk === false) {
      return NextResponse.json({ error: 'Product is out of stock' }, { status: 400 });
    }

    // ── Resolve buyer's member row ────────────────────────────────────────
    const { data: member } = await admin
      .from('members')
      .select('id, membership_tier, email')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!member) {
      return NextResponse.json(
        { error: 'No member profile found for this user' },
        { status: 400 }
      );
    }

    // Pricing — members get member_price if available
    const unitPrice = Number(
      member.membership_tier && product.member_price ? product.member_price : product.price
    );
    const totalPrice = +(unitPrice * quantity).toFixed(2);
    const currency = (product.currency || 'USD').toLowerCase();

    // ── Create order + order_item ────────────────────────────────────────
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .insert({
        order_number: orderNumber,
        member_id: member.id,
        status: 'pending',
        subtotal: totalPrice,
        total: totalPrice,
        currency: currency.toUpperCase(),
        shipping_address: { address: deliveryAddress, notes: deliveryNotes },
        notes: deliveryNotes || null,
      })
      .select('id')
      .single();

    if (orderErr || !order) {
      console.error('[marketplace/checkout] Failed to create order:', orderErr);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    const { data: orderItem, error: itemErr } = await admin
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        supplier_id: product.supplier_id,
        quantity,
        unit_price: unitPrice,
        total_price: totalPrice,
      })
      .select('id')
      .single();

    if (itemErr || !orderItem) {
      console.error('[marketplace/checkout] Failed to create order_item:', itemErr);
      return NextResponse.json({ error: 'Failed to create order item' }, { status: 500 });
    }

    // ── Stripe Checkout Session ──────────────────────────────────────────
    const origin = req.nextUrl.origin;
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: member.email || user.email || undefined,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name: product.name,
              description: `AFU Marketplace order ${orderNumber}`,
            },
          },
          quantity,
        },
      ],
      success_url: `${origin}/marketplace/success?session_id={CHECKOUT_SESSION_ID}&order=${order.id}`,
      cancel_url: `${origin}/marketplace?cancelled=1`,
      metadata: {
        type: 'order',
        order_id: order.id,
        order_item_id: orderItem.id,
        product_id: product.id,
        supplier_id: product.supplier_id,
        member_id: member.id,
        user_id: user.id,
        quantity: String(quantity),
      },
    });

    // Persist the payment row with idempotency key + session URL so retries
    // with the same Idempotency-Key return the same checkout URL.
    if (idempotencyKey || session.url) {
      await admin.from('payments').insert({
        order_id: order.id,
        member_id: member.id,
        amount: totalPrice,
        description: `Order ${orderNumber}`,
        provider: 'stripe',
        provider_reference: session.url,
        idempotency_key: idempotencyKey || null,
        status: 'pending',
      });
    }

    return NextResponse.json({ url: session.url, orderId: order.id });
  } catch (err) {
    console.error('POST /api/marketplace/checkout error:', err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
