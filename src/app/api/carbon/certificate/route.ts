import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const purchaseId = searchParams.get('purchase_id');

    if (!purchaseId) {
      return NextResponse.json({ error: 'purchase_id is required' }, { status: 400 });
    }

    const supabase = await createServerSupabaseClient();

    const { data: purchase, error } = await supabase
      .from('carbon_purchases')
      .select('*, carbon_credits(serial_number, vintage_year, project_id, carbon_projects(name, registry, methodology, country))')
      .eq('id', purchaseId)
      .single();

    if (error || !purchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });
    }

    const credit = purchase.carbon_credits;
    const project = credit?.carbon_projects;

    const certificate = {
      certificate_number: `CERT-${purchase.id.slice(0, 8).toUpperCase()}`,
      purchase_date: purchase.purchased_at,
      buyer: {
        name: purchase.buyer_name,
        email: purchase.buyer_email,
        company: purchase.buyer_company,
      },
      credit: {
        serial_number: credit?.serial_number,
        vintage_year: credit?.vintage_year,
        quantity_tonnes: purchase.quantity,
      },
      project: {
        name: project?.name,
        registry: project?.registry,
        methodology: project?.methodology,
        country: project?.country,
      },
      total_co2_offset_tonnes: purchase.quantity,
      total_amount_usd: purchase.total_amount,
      status: purchase.status === 'completed' ? 'retired' : 'pending_retirement',
      issued_by: 'African Farming Union (AFU)',
      issued_date: new Date().toISOString(),
      verification_url: `https://afu.africa/carbon/verify/${purchase.id}`,
    };

    return NextResponse.json({ certificate });
  } catch {
    return NextResponse.json({ error: 'Failed to generate certificate' }, { status: 500 });
  }
}
