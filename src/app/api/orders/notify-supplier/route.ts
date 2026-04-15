import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/orders/notify-supplier
 * Notifies the supplier(s) when a new order is placed.
 * Also inserts a notification record for the in-app notification bell.
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = (await request.json()) as { orderId: string };
    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Fetch order with items and supplier info
    const { data: order } = await supabase
      .from('orders')
      .select('id, order_number, total, currency, status, member_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Get order items with supplier details
    const { data: items } = await supabase
      .from('order_items')
      .select('supplier_id, quantity, total_price, product:products(name)')
      .eq('order_id', orderId);

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No order items' }, { status: 404 });
    }

    // Group items by supplier
    const supplierItems = new Map<string, typeof items>();
    for (const item of items) {
      const sid = item.supplier_id;
      if (!sid) continue;
      if (!supplierItems.has(sid)) supplierItems.set(sid, []);
      supplierItems.get(sid)!.push(item);
    }

    // Get buyer name
    const { data: member } = await supabase
      .from('members')
      .select('profile:profiles(full_name)')
      .eq('id', order.member_id)
      .single();
    const buyerName = (member?.profile as any)?.full_name || 'A customer';

    // Notify each supplier
    for (const [supplierId, supplierOrderItems] of supplierItems) {
      // Get supplier email
      const { data: supplier } = await supabase
        .from('suppliers')
        .select('id, company_name, email, profile_id')
        .eq('id', supplierId)
        .single();

      if (!supplier) continue;

      const itemTotal = supplierOrderItems.reduce((sum, i) => sum + Number(i.total_price), 0);
      const itemList = supplierOrderItems
        .map((i) => `${(i.product as any)?.name || 'Product'} x${i.quantity}`)
        .join(', ');

      // 1. Insert in-app notification
      if (supplier.profile_id) {
        try {
          await supabase.from('notifications').insert({
            user_id: supplier.profile_id,
            title: 'New Order Received',
            message: `${buyerName} placed order #${order.order_number} (${itemList}) — $${itemTotal.toFixed(2)}`,
            type: 'order',
            link: '/supplier/orders',
          });
        } catch (err) { console.error("[orders/notify-supplier] notification insert non-critical:", err); }
      }

      // 2. Send email notification
      if (supplier.email) {
        await sendEmail(
          supplier.email,
          `New Order #${order.order_number} — $${itemTotal.toFixed(2)}`,
          `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1B2A4A;">New Order Received</h2>
            <p>Hi ${supplier.company_name},</p>
            <p><strong>${buyerName}</strong> placed a new order on AFU:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; font-weight: bold;">Order #</td>
                <td style="padding: 8px 12px;">${order.order_number}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold;">Items</td>
                <td style="padding: 8px 12px;">${itemList}</td>
              </tr>
              <tr style="background: #f9fafb;">
                <td style="padding: 8px 12px; font-weight: bold;">Total</td>
                <td style="padding: 8px 12px;">$${itemTotal.toFixed(2)} ${order.currency || 'USD'}</td>
              </tr>
            </table>
            <p>Log in to your <a href="https://www.africanfarmingunion.org/supplier/orders" style="color: #5DB347;">Supplier Portal</a> to process this order.</p>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">African Farming Union</p>
          </div>
          `
        ).catch(() => { /* email is non-critical */ });
      }
    }

    return NextResponse.json({ success: true, suppliersNotified: supplierItems.size });
  } catch (error) {
    console.error('[notify-supplier]', error);
    return NextResponse.json({ error: 'Failed to notify' }, { status: 500 });
  }
}
