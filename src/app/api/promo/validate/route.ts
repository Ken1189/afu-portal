import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/promo/validate
 * Body: { code: string, context?: 'farmer' | 'supplier' | 'ambassador' | 'investor' | 'membership' | 'subscription' }
 * Returns the promo code details if valid, or an error message.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const code = String(body.code || '').toUpperCase().trim();
    const context = String(body.context || 'all').toLowerCase();

    if (!code) {
      return NextResponse.json({ valid: false, error: 'No code provided' }, { status: 400 });
    }

    const admin = await createAdminClient();
    const { data: promo, error } = await admin
      .from('promo_codes')
      .select('id, code, discount_type, discount_value, currency, applies_to, max_uses, current_uses, starts_at, expires_at, is_active')
      .eq('code', code)
      .maybeSingle();

    if (error || !promo) {
      return NextResponse.json({ valid: false, error: 'Invalid promo code' });
    }

    // Check active
    if (!promo.is_active) {
      return NextResponse.json({ valid: false, error: 'This code is no longer active' });
    }

    // Check expiry
    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ valid: false, error: 'This code has expired' });
    }

    // Check start date
    if (promo.starts_at && new Date(promo.starts_at) > new Date()) {
      return NextResponse.json({ valid: false, error: 'This code is not yet active' });
    }

    // Check usage limit
    if (promo.max_uses != null && promo.current_uses >= promo.max_uses) {
      return NextResponse.json({ valid: false, error: 'This code has reached its usage limit' });
    }

    // Check applies_to
    if (promo.applies_to !== 'all' && promo.applies_to !== context) {
      return NextResponse.json({ valid: false, error: `This code is not valid for ${context} signups` });
    }

    return NextResponse.json({
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discount_type: promo.discount_type,
        discount_value: promo.discount_value,
        currency: promo.currency,
      },
    });
  } catch (err) {
    console.error('[promo/validate] error:', err);
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
