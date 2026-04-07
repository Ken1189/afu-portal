import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/supplier/products
 * Create a product with subscription plan limit enforcement.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Find supplier
    const { data: supplier } = await adminClient
      .from('suppliers')
      .select('id, subscription_plan_slug, subscription_status')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    // Determine product limit
    let productLimit = 10; // default trial limit (Starter equivalent)
    let planSlug: string | null = null;
    let isActive = false;

    if (
      supplier.subscription_plan_slug &&
      ['active', 'trialing', 'past_due'].includes(supplier.subscription_status || '')
    ) {
      planSlug = supplier.subscription_plan_slug;
      isActive = true;
      const { data: plan } = await adminClient
        .from('supplier_subscription_plans')
        .select('product_limit')
        .eq('slug', planSlug)
        .maybeSingle();
      if (plan?.product_limit != null) productLimit = Number(plan.product_limit);
    }

    // Count current products
    const { count: currentCount } = await adminClient
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('supplier_id', supplier.id);

    if ((currentCount || 0) >= productLimit) {
      return NextResponse.json(
        {
          error: `You've reached your plan's product limit (${productLimit}). Upgrade to add more.`,
          limit: productLimit,
          current: currentCount,
          isTrial: !isActive,
        },
        { status: 403 }
      );
    }

    // Parse body
    const body = await request.json().catch(() => ({}));

    // Insert product
    const insertPayload = {
      supplier_id: supplier.id,
      name: body.name,
      description: body.description ?? null,
      price: Number(body.price) || 0,
      currency: body.currency || 'USD',
      stock_quantity: Number(body.stock_quantity) || 0,
      category: body.category,
      unit: body.unit || 'each',
      in_stock: (Number(body.stock_quantity) || 0) > 0,
      image_url: body.image_url ?? null,
    };

    const { data: created, error: insertErr } = await adminClient
      .from('products')
      .insert(insertPayload)
      .select()
      .single();

    if (insertErr) {
      console.error('[supplier products] insert error:', insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ product: created, plan: { slug: planSlug, limit: productLimit, isTrial: !isActive } });
  } catch (err) {
    console.error('[supplier products] error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
