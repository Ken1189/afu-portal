import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id').eq('profile_id', user.id).single();
  const { data: profile } = await adminClient.from('profiles').select('country').eq('id', user.id).single();
  return member ? { userId: user.id, memberId: member.id, country: profile?.country as string | null } : null;
}

/**
 * GET /api/payments/gateways
 * Returns active payment gateways. Supports ?country= query parameter.
 * Falls back to member's country from profile if not specified.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const country = searchParams.get('country') || auth.country;

  const adminClient = await createAdminClient();
  let query = adminClient
    .from('payment_gateways')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (country) {
    query = query.contains('supported_countries', [country]);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ gateways: data });
}
