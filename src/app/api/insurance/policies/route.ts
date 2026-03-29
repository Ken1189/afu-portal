import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { notifyUser, notifyAdmins } from '@/lib/events/notifications';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id').eq('profile_id', user.id).single();
  const { data: profile } = await adminClient.from('profiles').select('role').eq('id', user.id).single();
  return member ? { userId: user.id, memberId: member.id, isAdmin: ['admin', 'super_admin'].includes(profile?.role || '') } : null;
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = await createAdminClient();
  let query = adminClient.from('insurance_policies').select('*, product:insurance_products(*)').order('created_at', { ascending: false });
  if (!auth.isAdmin) query = query.eq('member_id', auth.memberId);
  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ policies: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const adminClient = await createAdminClient();

  // Generate policy number
  const year = new Date().getFullYear();
  const { data: seq } = await adminClient.rpc('generate_policy_number');
  const policyNumber = seq || `POL-${year}-${Date.now()}`;

  const { data, error } = await adminClient
    .from('insurance_policies')
    .insert({ ...body, member_id: auth.memberId, policy_number: policyNumber })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // S3.4: Notify user and admins of insurance purchase
  if (data) {
    notifyUser(
      auth.userId,
      'Insurance Policy Created',
      `Your insurance policy ${policyNumber} has been created. Coverage is now active.`,
      'all',
      { type: 'insurance', actionUrl: '/dashboard/insurance' },
    ).catch(() => {});

    notifyAdmins(
      'New Insurance Policy',
      `Policy ${policyNumber} created for member ${auth.memberId}`,
      { type: 'insurance', actionUrl: '/admin/insurance' },
    ).catch(() => {});
  }

  return NextResponse.json({ policy: data }, { status: 201 });
}
