import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// Revenue split: 70% farmer, 20% AFU, 10% buffer pool
const FARMER_SHARE = 0.7;
const AFU_SHARE = 0.2;
const BUFFER_SHARE = 0.1;

export async function POST(req: NextRequest) {
  try {
    const { credit_id, buyer_name, buyer_email, buyer_company, quantity, payment_method } = await req.json();

    if (!credit_id || !buyer_name || !buyer_email || !quantity) {
      return NextResponse.json(
        { error: 'credit_id, buyer_name, buyer_email and quantity are required' },
        { status: 400 }
      );
    }

    const admin = await createAdminClient();

    // Check credit is available
    const { data: credit, error: creditErr } = await admin
      .from('carbon_credits')
      .select('*, carbon_projects(name, price_per_credit)')
      .eq('id', credit_id)
      .single();

    if (creditErr || !credit) {
      return NextResponse.json({ error: 'Credit not found' }, { status: 404 });
    }

    if (!['issued', 'listed'].includes(credit.status)) {
      return NextResponse.json({ error: 'Credit is not available for purchase' }, { status: 400 });
    }

    if (quantity > (credit.quantity || 0)) {
      return NextResponse.json({ error: 'Requested quantity exceeds available credits' }, { status: 400 });
    }

    const pricePerTonne = credit.price_per_tonne || credit.carbon_projects?.price_per_credit || 15;
    const totalAmount = quantity * pricePerTonne;
    const farmerRevenue = totalAmount * FARMER_SHARE;
    const afuRevenue = totalAmount * AFU_SHARE;
    const bufferAmount = totalAmount * BUFFER_SHARE;

    // Insert purchase
    const { data: purchase, error: purchaseErr } = await admin
      .from('carbon_purchases')
      .insert({
        credit_id,
        buyer_name,
        buyer_email,
        buyer_company: buyer_company || null,
        quantity,
        price_per_tonne: pricePerTonne,
        total_amount: totalAmount,
        farmer_revenue: farmerRevenue,
        afu_revenue: afuRevenue,
        buffer_amount: bufferAmount,
        payment_method: payment_method || 'bank_transfer',
        status: 'pending',
        purchased_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (purchaseErr) {
      return NextResponse.json({ error: purchaseErr.message }, { status: 500 });
    }

    // Update credit status to sold
    await admin
      .from('carbon_credits')
      .update({
        status: 'sold',
        buyer_name,
        buyer_email,
        updated_at: new Date().toISOString(),
      })
      .eq('id', credit_id);

    // Update buffer pool
    await admin
      .from('carbon_buffer_pool')
      .insert({
        credit_id,
        purchase_id: purchase.id,
        amount_tonnes: quantity * BUFFER_SHARE,
        value_usd: bufferAmount,
        reason: 'purchase_buffer',
      });

    // Emit CARBON_CREDITS_SOLD event (fire-and-forget)
    try {
      await admin.from('event_log').insert({
        event_type: 'CARBON_CREDITS_SOLD',
        payload: {
          purchaseId: purchase.id,
          creditId: credit_id,
          buyerName: buyer_name,
          buyerEmail: buyer_email,
          quantity,
          totalAmount,
          farmerRevenue,
          afuRevenue,
          bufferAmount,
        },
        status: 'processed',
      });
    } catch {
      // Non-critical: event logging failure shouldn't block purchase
    }

    return NextResponse.json({
      purchase,
      message: `Thank you! Your purchase of ${quantity} tonnes CO\u2082 is being processed. Certificate will be emailed within 24 hours.`,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 });
  }
}
