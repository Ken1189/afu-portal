/**
 * Ambassador & Referral API
 * GET  — Dashboard stats, commission rates, referral info
 * POST — Register referral, process commission, request payout
 *
 * NOTE: Any user can have a referral code and earn commissions.
 * Ambassadors are power users with higher tiers and bonus rates.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient, createServerSupabaseClient } from '@/lib/supabase/server';
import { CommissionEngine } from '@/lib/ambassadors';

async function getAuthUser() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await createAdminClient();
    const engine = new CommissionEngine(db);
    const action = req.nextUrl.searchParams.get('action');

    // Get rates (public)
    if (action === 'rates') {
      const rates = await engine.getAllRates();
      return NextResponse.json(rates);
    }

    // Get user's referral code (any user)
    if (action === 'referral-code') {
      const { data: profile } = await db.from('profiles').select('referral_code').eq('id', user.id).single();
      let code = profile?.referral_code;

      if (!code) {
        // Generate one: AFU-XXXXXXXX
        code = 'AFU-' + user.id.slice(0, 8).toUpperCase();
        await db.from('profiles').update({ referral_code: code }).eq('id', user.id);
      }

      // Check if user is also an ambassador
      const { data: ambassador } = await db.from('ambassadors').select('id, tier, total_referrals, total_earnings, pending_earnings').eq('user_id', user.id).single();

      // Count referrals for regular users (check referral_links)
      const { count: referralCount } = await db
        .from('referral_links')
        .select('id', { count: 'exact', head: true })
        .eq('referral_code', code);

      return NextResponse.json({
        referral_code: code,
        is_ambassador: !!ambassador,
        ambassador_tier: ambassador?.tier || null,
        total_referrals: ambassador?.total_referrals || referralCount || 0,
        total_earnings: Number(ambassador?.total_earnings || 0),
        pending_earnings: Number(ambassador?.pending_earnings || 0),
        share_url: `https://africanfarmingunion.org/apply?ref=${code}`,
      });
    }

    // Ambassador dashboard (ambassadors only)
    if (action === 'dashboard') {
      const { data: ambassador } = await db.from('ambassadors').select('id').eq('user_id', user.id).single();
      if (!ambassador) return NextResponse.json({ error: 'Not an ambassador' }, { status: 403 });

      const dashboard = await engine.getDashboard(ambassador.id);
      return NextResponse.json(dashboard);
    }

    // Admin: all ambassadors overview
    if (action === 'admin-overview') {
      const role = user.user_metadata?.role;
      if (role !== 'admin' && role !== 'super_admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const { data: ambassadors } = await db
        .from('ambassadors')
        .select('id, full_name, tier, total_referrals, total_earnings, pending_earnings, paid_earnings, referral_code, country, status')
        .order('total_earnings', { ascending: false });

      const { data: pendingPayouts } = await db
        .from('ambassador_payouts')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Total stats
      const totalEarnings = (ambassadors || []).reduce((s: number, a: { total_earnings: number }) => s + Number(a.total_earnings || 0), 0);
      const totalPending = (ambassadors || []).reduce((s: number, a: { pending_earnings: number }) => s + Number(a.pending_earnings || 0), 0);
      const totalReferrals = (ambassadors || []).reduce((s: number, a: { total_referrals: number }) => s + Number(a.total_referrals || 0), 0);

      return NextResponse.json({
        ambassadors: ambassadors || [],
        pending_payouts: pendingPayouts || [],
        stats: {
          total_ambassadors: ambassadors?.length || 0,
          total_referrals: totalReferrals,
          total_earnings: totalEarnings,
          total_pending: totalPending,
        },
      });
    }

    return NextResponse.json({ error: 'action required: rates, referral-code, dashboard, admin-overview' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action } = body;
    const db = await createAdminClient();
    const engine = new CommissionEngine(db);

    switch (action) {
      // Register a referral (called during sign-up)
      case 'register-referral': {
        const { referral_code, new_user_id } = body;
        if (!referral_code) return NextResponse.json({ error: 'referral_code required' }, { status: 400 });

        const userId = new_user_id || user.id;
        const success = await engine.registerReferral(referral_code, userId);

        // Also check if this is a regular user's referral code (not ambassador)
        if (!success) {
          // Try to find a regular user with this referral code
          const { data: referrer } = await db
            .from('profiles')
            .select('id')
            .eq('referral_code', referral_code)
            .single();

          if (referrer) {
            // Create a basic referral link without ambassador table
            await db.from('referral_links').insert({
              ambassador_id: referrer.id, // Using profile ID as fallback
              referred_user_id: userId,
              referral_code: referral_code,
              status: 'active',
            });
          }
        }

        return NextResponse.json({ registered: success });
      }

      // Process a commission (called by payment webhooks)
      case 'process-commission': {
        const role = user.user_metadata?.role;
        if (role !== 'admin' && role !== 'super_admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { referred_user_id, commission_type, source_amount, source_reference, source_type } = body;
        if (!referred_user_id || !commission_type || !source_amount) {
          return NextResponse.json({ error: 'referred_user_id, commission_type, source_amount required' }, { status: 400 });
        }

        const result = await engine.processCommission({
          referred_user_id,
          commission_type,
          source_amount,
          source_reference,
          source_type,
        });

        return NextResponse.json(result || { commission_amount: 0, message: 'User not referred' });
      }

      // Request payout (ambassador)
      case 'request-payout': {
        const { data: ambassador } = await db.from('ambassadors').select('id, pending_earnings, payout_method').eq('user_id', user.id).single();
        if (!ambassador) return NextResponse.json({ error: 'Not an ambassador' }, { status: 403 });

        const amount = body.amount || Number(ambassador.pending_earnings || 0);
        if (amount <= 0) return NextResponse.json({ error: 'No pending earnings' }, { status: 400 });

        const result = await engine.createPayout({
          ambassador_id: ambassador.id,
          amount,
          payout_method: body.payout_method || ambassador.payout_method || 'bank_transfer',
          payout_details: body.payout_details,
        });

        return NextResponse.json(result);
      }

      // Approve payout (admin)
      case 'approve-payout': {
        const role = user.user_metadata?.role;
        if (role !== 'admin' && role !== 'super_admin') {
          return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        if (!body.payout_id) return NextResponse.json({ error: 'payout_id required' }, { status: 400 });
        await engine.approvePayout(body.payout_id, user.id);
        return NextResponse.json({ approved: true });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
