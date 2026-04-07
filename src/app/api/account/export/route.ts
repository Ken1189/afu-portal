import { NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const admin = await createAdminClient();

    // Fetch all user-owned data
    const [profile, member, applications, payments, loans, kyc, farms, plots, livestock, journal, orders, conversations] = await Promise.all([
      admin.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      admin.from('members').select('*').eq('profile_id', user.id),
      admin.from('membership_applications').select('*').eq('email', user.email),
      admin.from('payments').select('*').eq('user_id', user.id),
      admin.from('loans').select('*').eq('borrower_id', user.id),
      admin.from('kyc_documents').select('*').eq('user_id', user.id),
      admin.from('farms').select('*').eq('user_id', user.id),
      admin.from('farm_plots').select('*').eq('user_id', user.id),
      admin.from('livestock').select('*').eq('user_id', user.id),
      admin.from('farm_activities').select('*').eq('user_id', user.id),
      admin.from('orders').select('*').eq('member_id', user.id),
      admin.from('conversations').select('*, conversation_messages(*)').eq('sender_email', user.email),
    ]);

    const exportData = {
      exported_at: new Date().toISOString(),
      user_id: user.id,
      email: user.email,
      profile: profile.data,
      member: member.data,
      applications: applications.data,
      payments: payments.data,
      loans: loans.data,
      kyc_documents: kyc.data,
      farms: farms.data,
      farm_plots: plots.data,
      livestock: livestock.data,
      farm_activities: journal.data,
      orders: orders.data,
      conversations: conversations.data,
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="afu-data-export-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    console.error('[GDPR Export] Error:', err);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
