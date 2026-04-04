import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = 'African Farming Union <noreply@mail.africanfarmingunion.org>';

const STATUS_MESSAGES: Record<string, string> = {
  afu_review: 'Your trade order is now under AFU review.',
  afu_fulfilling: 'AFU is fulfilling your trade order directly.',
  marketplace: 'Your trade order has been listed on the marketplace for supplier quotes.',
  quoted: 'A supplier has submitted a quote for your trade order.',
  accepted: 'Your trade order has been accepted and is being processed.',
  delivered: 'Your trade order has been delivered.',
  completed: 'Your trade order is now complete. Thank you for trading with AFU!',
  cancelled: 'Your trade order has been cancelled.',
};

/**
 * GET /api/trading/[id]
 * Fetch a single trade order with its quotes.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Fetch order
    const { data: order, error: orderErr } = await adminClient
      .from('trade_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (orderErr || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Fetch quotes for this order
    const { data: quotes } = await adminClient
      .from('trade_quotes')
      .select('*')
      .eq('order_id', id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ order, quotes: quotes || [] });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/trading/[id]
 * Update order status (admin only) and optionally set afu_price.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Verify admin role
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.status) {
      const validStatuses = ['open', 'afu_review', 'afu_fulfilling', 'marketplace', 'quoted', 'accepted', 'delivered', 'completed', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.afu_price !== undefined) {
      updates.afu_price = body.afu_price;
    }

    updates.updated_at = new Date().toISOString();

    const { data: order, error } = await adminClient
      .from('trade_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notification email to the order owner (fire and forget)
    if (body.status && order?.user_id) {
      try {
        const { data: ownerProfile } = await adminClient.from('profiles').select('email, full_name').eq('id', order.user_id).single();
        if (ownerProfile?.email) {
          const msg = STATUS_MESSAGES[body.status] || `Your trade order status has been updated to: ${body.status}`;
          resend.emails.send({
            from: FROM,
            to: ownerProfile.email,
            subject: `Trade Order ${order.order_number} — Status Update`,
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1B2A4A;padding:24px;text-align:center"><h2 style="color:#5DB347;margin:0">Trade Order Update</h2></div>
              <div style="padding:24px;background:#f8faf6">
                <p style="font-size:15px;color:#333">Hi ${ownerProfile.full_name?.split(' ')[0] || 'there'},</p>
                <div style="background:white;border-left:4px solid #5DB347;padding:16px;border-radius:4px;margin:16px 0">
                  <p style="margin:0;font-size:14px;color:#1B2A4A"><strong>Order:</strong> ${order.order_number}</p>
                  <p style="margin:8px 0 0;font-size:14px;color:#1B2A4A"><strong>Commodity:</strong> ${order.commodity} — ${order.quantity} ${order.unit}</p>
                  <p style="margin:8px 0 0;font-size:15px;color:#5DB347;font-weight:600">${msg}</p>
                </div>
                <div style="text-align:center;margin-top:20px">
                  <a href="https://africanfarmingunion.org/farm/trade" style="display:inline-block;background:#5DB347;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">View Your Orders</a>
                </div>
              </div>
              <div style="padding:12px;text-align:center;color:#999;font-size:12px">African Farming Union</div>
            </div>`,
          }).catch(() => {});
        }
      } catch { /* non-critical */ }
    }

    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
