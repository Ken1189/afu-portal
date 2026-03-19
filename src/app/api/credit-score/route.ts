import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id').eq('profile_id', user.id).single();
  return member ? { userId: user.id, memberId: member.id } : null;
}

/**
 * GET /api/credit-score
 * Returns the authenticated member's credit score. Returns null if no score exists.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();

  const { data: creditScore, error } = await adminClient
    .from('credit_scores')
    .select('*')
    .eq('member_id', auth.memberId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!creditScore) {
    return NextResponse.json({
      creditScore: null,
      message: 'No credit score available for this member. A score will be generated after sufficient transaction history.',
    });
  }

  return NextResponse.json({ creditScore });
}
