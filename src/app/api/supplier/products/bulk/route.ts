import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/supplier/products/bulk
 * Body: { products: Array<{ name, description?, category, price, member_price?, currency?, unit?, sku?, in_stock?, stock_quantity?, tags? }> }
 * Bulk-inserts products for the authenticated supplier.
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const admin = await createAdminClient();

    // Find supplier
    const { data: supplier } = await admin
      .from('suppliers')
      .select('id')
      .eq('profile_id', user.id)
      .maybeSingle();

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const rows = body.products;
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No products provided' }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 products per upload' }, { status: 400 });
    }

    // Validate & map
    const validCategories = [
      // Legacy supplier types (still accepted)
      'input-supplier', 'equipment', 'logistics', 'processing', 'technology', 'financial-services',
      // Expanded product categories
      'seeds', 'seedlings', 'grain', 'oilseeds', 'pulses', 'vegetables', 'fruit', 'herbs-spices', 'flowers', 'fodder', 'tobacco', 'cotton', 'coffee-tea', 'nuts',
      'fertilizer', 'pesticides', 'herbicides', 'fungicides', 'bio-inputs', 'growth-regulators', 'soil-amendments',
      'animal-feed', 'veterinary', 'livestock', 'poultry', 'aquaculture', 'dairy', 'apiculture',
      'irrigation', 'tools', 'spare-parts', 'solar-energy', 'greenhouses', 'drones-precision',
      'packaging', 'storage', 'cold-chain', 'milling', 'drying-curing',
      'software', 'lab-testing', 'training-consulting', 'insurance',
      'enterprise',
    ];
    const toInsert = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.name || !r.price) {
        errors.push(`Row ${i + 1}: name and price are required`);
        continue;
      }
      const price = parseFloat(r.price);
      if (isNaN(price) || price < 0) {
        errors.push(`Row ${i + 1}: invalid price "${r.price}"`);
        continue;
      }
      const category = validCategories.includes(r.category) ? r.category : 'seeds';
      const memberPrice = r.member_price ? parseFloat(r.member_price) : null;
      const discountPercent = memberPrice && memberPrice < price
        ? Math.round(((price - memberPrice) / price) * 100 * 100) / 100
        : 0;

      toInsert.push({
        supplier_id: supplier.id,
        name: String(r.name).trim(),
        description: r.description ? String(r.description).trim() : null,
        category,
        price,
        member_price: memberPrice,
        discount_percent: discountPercent,
        currency: r.currency || 'USD',
        unit: r.unit || 'unit',
        sku: r.sku || null,
        in_stock: r.in_stock !== false && r.in_stock !== 'false' && r.in_stock !== '0',
        stock_quantity: parseInt(r.stock_quantity) || 0,
        tags: r.tags ? (Array.isArray(r.tags) ? r.tags : String(r.tags).split(',').map((t: string) => t.trim()).filter(Boolean)) : null,
      });
    }

    if (toInsert.length === 0) {
      return NextResponse.json({ error: 'No valid products to insert', errors }, { status: 400 });
    }

    const { data: inserted, error: insertErr } = await admin
      .from('products')
      .insert(toInsert)
      .select('id, name');

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    // Update supplier product count
    const { error: rpcErr } = await admin.rpc('update_supplier_product_count', { p_supplier_id: supplier.id });
    if (rpcErr) {
      // If RPC doesn't exist, update manually
      await admin
        .from('suppliers')
        .update({ products_count: (inserted?.length || 0) })
        .eq('id', supplier.id);
    }

    return NextResponse.json({
      success: true,
      inserted: inserted?.length || 0,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('[bulk products] error:', err);
    return NextResponse.json({ error: 'Bulk upload failed' }, { status: 500 });
  }
}
