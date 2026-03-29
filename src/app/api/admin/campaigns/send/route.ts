/**
 * POST /api/admin/campaigns/send
 * S3.7: Actually execute a campaign via the CampaignService.
 * Body: { campaignId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';
import { CampaignService } from '@/lib/messaging/campaigns';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const adminClient = await createAdminClient();

    // Verify admin role
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { campaignId } = body;

    if (!campaignId) {
      return NextResponse.json({ error: 'campaignId is required' }, { status: 400 });
    }

    const campaignService = new CampaignService(adminClient);
    const result = await campaignService.sendCampaign(campaignId);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Campaign send failed' }, { status: 500 });
    }

    // Audit log
    await adminClient.from('audit_log').insert({
      user_id: user.id,
      action: 'campaign_sent',
      entity_type: 'message_campaign',
      entity_id: campaignId,
      details: { triggered_by: user.email },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Campaign send error:', err);
    return NextResponse.json({ error: 'Failed to send campaign' }, { status: 500 });
  }
}
