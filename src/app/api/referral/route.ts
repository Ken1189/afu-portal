import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * GET /api/referral — Get user's referral code and stats
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll(); }, setAll() {} } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get profile with referral code
    const { data: profile } = await svc
      .from('profiles')
      .select('id, referral_code, full_name')
      .eq('id', user.id)
      .single();

    // Generate referral code if doesn't exist
    let referralCode = profile?.referral_code;
    if (!referralCode) {
      referralCode = user.id.slice(0, 8).toUpperCase();
      // Try to save it (will fail gracefully if column doesn't exist yet)
      await svc
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', user.id)
        .then(() => {});
    }

    // Try to get referral rewards (will return empty if table doesn't exist)
    let referralCount = 0;
    let totalEarnings = 0;
    let pendingEarnings = 0;
    const recentReferrals: Array<{ name: string; date: string; amount: number; reward: number; status: string }> = [];

    try {
      const { data: rewards } = await svc
        .from('referral_rewards')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (rewards) {
        referralCount = rewards.length;
        totalEarnings = rewards.filter(r => r.status === 'paid').reduce((s, r) => s + Number(r.reward_amount), 0);
        pendingEarnings = rewards.filter(r => r.status === 'pending').reduce((s, r) => s + Number(r.reward_amount), 0);
      }
    } catch {
      // referral_rewards table may not exist yet
    }

    return NextResponse.json({
      referralCode,
      referralCount,
      totalEarnings,
      pendingEarnings,
      recentReferrals,
    });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
