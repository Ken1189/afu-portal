import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { ParametricEngine } from '@/lib/insurance/parametric';
import { WalletService } from '@/lib/banking/wallet';

async function getAuth(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = await createAdminClient();
  const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
  return {
    userId: user.id,
    isAdmin: ['admin', 'super_admin'].includes(profile?.role || ''),
  };
}

/**
 * GET /api/insurance/parametric/policies
 * Returns user's policies (or all for admin).
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuth(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = await createAdminClient();
  let query = admin
    .from('parametric_policies')
    .select('*, product:parametric_products(*)')
    .order('created_at', { ascending: false });

  if (!auth.isAdmin) {
    query = query.eq('user_id', auth.userId);
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  if (status) query = query.eq('status', status);

  const productId = searchParams.get('product_id');
  if (productId) query = query.eq('product_id', productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ policies: data || [] });
}

/**
 * POST /api/insurance/parametric/policies
 * Purchase a new parametric policy.
 *
 * Body: { product_id, coverage_amount, latitude, longitude, farm_plot_id?, start_date, end_date }
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuth(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const { product_id, coverage_amount, latitude, longitude, farm_plot_id, start_date, end_date } = body;

  if (!product_id || !coverage_amount || latitude == null || longitude == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const admin = await createAdminClient();

  // 1. Validate product exists and is active
  const { data: product, error: prodError } = await admin
    .from('parametric_products')
    .select('*')
    .eq('id', product_id)
    .eq('active', true)
    .single();

  if (prodError || !product) {
    return NextResponse.json({ error: 'Product not found or inactive' }, { status: 400 });
  }

  // 2. Validate coverage amount
  if (coverage_amount < product.min_coverage || coverage_amount > product.max_coverage) {
    return NextResponse.json({
      error: `Coverage must be between ${product.min_coverage} and ${product.max_coverage}`,
    }, { status: 400 });
  }

  // 3. Calculate premium
  const premium = Math.round(coverage_amount * product.premium_rate * 100) / 100;

  // 4. Check wallet balance and deduct premium
  try {
    const walletService = new WalletService(admin);
    const wallets = await walletService.getUserWallets(auth.userId);
    const wallet = wallets.find((w) => w.status === 'active');

    if (wallet && (wallet.balance || 0) >= premium) {
      await walletService.withdraw({
        wallet_id: wallet.id,
        amount: premium,
        description: `Parametric insurance premium - ${product.name}`,
        reference: `PAR-PREM-${Date.now()}`,
      });
    }
    // If no wallet or insufficient balance, we still create the policy
    // (premium could be collected via other payment methods)
  } catch (err) {
    console.warn('Premium deduction from wallet failed (proceeding anyway):', err);
  }

  // 5. Generate policy number and insert
  const engine = new ParametricEngine(admin);
  const policyNumber = engine.generatePolicyNumber();

  const policyStart = start_date || new Date().toISOString().split('T')[0];
  const policyEnd =
    end_date ||
    new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

  const { data: policy, error: polError } = await admin
    .from('parametric_policies')
    .insert({
      user_id: auth.userId,
      product_id,
      policy_number: policyNumber,
      status: 'active',
      coverage_amount,
      premium_paid: premium,
      latitude,
      longitude,
      farm_plot_id: farm_plot_id || null,
      start_date: policyStart,
      end_date: policyEnd,
    })
    .select('*, product:parametric_products(*)')
    .single();

  if (polError) return NextResponse.json({ error: polError.message }, { status: 500 });

  return NextResponse.json({ policy, policy_number: policyNumber, premium_charged: premium }, { status: 201 });
}
