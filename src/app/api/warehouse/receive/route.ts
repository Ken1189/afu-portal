/**
 * POST /api/warehouse/receive
 *
 * Complete receiving flow: creates a warehouse receipt and quality inspection record.
 * Accessible by: warehouse_operator, admin, super_admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

interface ReceiveBody {
  farmer_id: string | null;
  farmer_name: string;
  farmer_phone: string | null;
  commodity: string;
  bags: number;
  gross_weight_kg: number;
  tare_weight_kg: number;
  net_weight_kg: number;
  unit_price: number;
  total_value: number;
  quality_data: {
    moisture_percent: number;
    foreign_matter_percent: number;
    damage_percent: number;
    aflatoxin_level: string;
    color_assessment: string;
    odor: string;
    grade: string;
  };
}

function generateReceiptNumber(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  return `WR-${dateStr}-${seq}`;
}

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Role check
    const adminClient = await createAdminClient();
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['warehouse_operator', 'admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body: ReceiveBody = await request.json();

    // Validation
    if (!body.commodity || !body.farmer_name) {
      return NextResponse.json({ error: 'Commodity and farmer name are required' }, { status: 400 });
    }
    if (body.net_weight_kg <= 0) {
      return NextResponse.json({ error: 'Net weight must be greater than 0' }, { status: 400 });
    }

    const receiptNumber = generateReceiptNumber();

    // Create warehouse receipt
    const { data: receipt, error: receiptError } = await adminClient
      .from('warehouse_receipts')
      .insert({
        receipt_number: receiptNumber,
        farmer_id: body.farmer_id,
        farmer_name: body.farmer_name,
        farmer_phone: body.farmer_phone,
        commodity: body.commodity,
        bags: body.bags,
        gross_weight_kg: body.gross_weight_kg,
        tare_weight_kg: body.tare_weight_kg,
        net_weight_kg: body.net_weight_kg,
        unit_price: body.unit_price,
        total_value: body.total_value,
        grade: body.quality_data.grade,
        status: body.quality_data.grade === 'Reject' ? 'rejected' : 'received',
        received_by: user.id,
      })
      .select()
      .single();

    if (receiptError) {
      console.error('Receipt insert error:', receiptError);
      return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
    }

    // Create quality inspection
    const { error: inspError } = await adminClient
      .from('quality_inspections')
      .insert({
        receipt_id: receipt.id,
        receipt_number: receiptNumber,
        farmer_name: body.farmer_name,
        commodity: body.commodity,
        moisture_percent: body.quality_data.moisture_percent,
        foreign_matter_percent: body.quality_data.foreign_matter_percent,
        damage_percent: body.quality_data.damage_percent,
        aflatoxin_level: body.quality_data.aflatoxin_level,
        color_assessment: body.quality_data.color_assessment,
        odor: body.quality_data.odor,
        grade: body.quality_data.grade,
        status: 'completed',
        inspector_id: user.id,
      });

    if (inspError) {
      console.error('Inspection insert error:', inspError);
      // Receipt was created successfully — don't fail the whole operation
    }

    // Update warehouse capacity (best-effort)
    try {
      const weightMT = body.net_weight_kg / 1000;
      await adminClient.rpc('increment_warehouse_stock', { weight_mt: weightMT });
    } catch {
      // If the RPC doesn't exist, try a direct update
      try {
        const { data: wh } = await adminClient
          .from('warehouses')
          .select('id, current_stock_mt')
          .limit(1)
          .single();
        if (wh) {
          await adminClient
            .from('warehouses')
            .update({ current_stock_mt: (wh.current_stock_mt || 0) + body.net_weight_kg / 1000 })
            .eq('id', wh.id);
        }
      } catch {
        // Non-critical — log and continue
      }
    }

    // Trigger SMS to farmer (best-effort, non-blocking)
    if (body.farmer_phone) {
      try {
        const smsBody = JSON.stringify({
          to: body.farmer_phone,
          body: `AFU Warehouse Receipt: ${receiptNumber}. ${body.commodity} ${body.net_weight_kg}kg Grade ${body.quality_data.grade}. Value: $${body.total_value.toFixed(2)}. Thank you!`,
        });
        // Fire and forget — don't await
        fetch(new URL('/api/sms/send', request.url).toString(), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: request.headers.get('cookie') || '',
          },
          body: smsBody,
        }).catch(() => {
          // SMS send is best-effort
        });
      } catch {
        // SMS is non-critical
      }
    }

    return NextResponse.json({
      receipt: {
        id: receipt.id,
        receipt_number: receiptNumber,
        farmer_name: body.farmer_name,
        commodity: body.commodity,
        net_weight_kg: body.net_weight_kg,
        grade: body.quality_data.grade,
        total_value: body.total_value,
        created_at: receipt.created_at,
      },
    });
  } catch (err) {
    console.error('Warehouse receive error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
