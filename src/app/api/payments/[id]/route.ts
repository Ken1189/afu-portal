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
 * GET /api/payments/[id]
 * Get a single payment with its attempts. Verifies ownership.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();
  const { data: payment, error } = await adminClient
    .from('payments')
    .select('*, payment_attempts(*)')
    .eq('id', id)
    .single();

  if (error || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  // Verify the payment belongs to the requesting member
  if (payment.member_id !== auth.memberId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ payment });
}
