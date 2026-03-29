import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { ParametricEngine } from '@/lib/insurance/parametric';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

/**
 * POST /api/insurance/parametric/check
 *
 * Run trigger check across all active parametric policies.
 * Callable by Vercel cron or manually by admin.
 */
export async function POST() {
  // Check auth — must be admin or cron secret
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const admin = await createAdminClient();
    const { data: profile } = await admin.from('profiles').select('role').eq('id', user.id).single();
    if (!['admin', 'super_admin'].includes(profile?.role || '')) {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }
  }
  // Allow unauthenticated calls for cron (in production, verify CRON_SECRET header)

  try {
    const admin = await createAdminClient();
    const engine = new ParametricEngine(admin);
    const result = await engine.checkAllPolicies();

    // Emit INSURANCE_PAYOUT events for each triggered payout (fire-and-forget)
    if (result.details && Array.isArray(result.details)) {
      for (const detail of result.details) {
        if (detail.triggered && detail.payoutAmount) {
          // Look up policy owner from the database
          const { data: policy } = await admin
            .from('parametric_policies')
            .select('user_id')
            .eq('id', detail.policyId)
            .single();

          if (policy?.user_id) {
            emitEventAsync({
              type: 'INSURANCE_PAYOUT',
              data: {
                policyId: detail.policyId,
                userId: policy.user_id,
                amount: detail.payoutAmount,
                triggerType: 'parametric',
              },
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked: result.checked,
      triggered: result.triggered,
      payouts_initiated: result.payouts_initiated,
      details: result.details,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Parametric check failed:', err);
    return NextResponse.json(
      { error: 'Check failed', details: String(err) },
      { status: 500 }
    );
  }
}
