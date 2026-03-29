import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications/engine';
import { kycVerifiedTemplate } from '@/lib/notifications/templates';
import { kycApproveSchema } from '@/lib/validation/schemas';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {},
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const svc = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify admin role
    const { data: profile } = await svc
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const raw = await request.json();
    const parsed = kycApproveSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { memberId, action, tier, notes, documentId } = parsed.data;

    const newStatus = action === 'approve' ? 'verified' : 'rejected';

    // Update the specific document if provided
    if (documentId) {
      const { error: docError } = await svc
        .from('kyc_documents')
        .update({
          verification_status: newStatus,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          ...(action === 'reject' && notes ? { rejection_reason: notes } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (docError) {
        return NextResponse.json({ error: docError.message }, { status: 500 });
      }
    }

    // Create KYC verification record
    const tierValue = tier ? `tier_${tier}` : 'tier_1';
    const { data: verification, error: insertError } = await svc
      .from('kyc_verifications')
      .insert({
        member_id: memberId,
        tier: tierValue,
        provider: 'manual_review',
        provider_reference: `admin:${user.id}`,
        status: newStatus,
        details: { reviewed_by: user.id, notes, action },
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Log to audit
    await svc.from('audit_log').insert({
      user_id: user.id,
      action: `kyc_${action}`,
      entity_type: 'kyc_verification',
      entity_id: verification.id,
      details: { member_id: memberId, tier: tierValue, notes },
    });

    // Send notification to member (fire-and-forget)
    const tierLabel = tierValue.replace('_', ' ').replace('tier', 'Tier');
    if (action === 'approve') {
      const template = kycVerifiedTemplate(tierLabel);
      sendNotification({
        recipientId: memberId,
        category: 'security',
        priority: 'high',
        channels: ['in_app', 'email', 'sms'],
        actionUrl: '/dashboard/kyc',
        ...template,
      }).catch(() => {});
    } else {
      sendNotification({
        recipientId: memberId,
        category: 'security',
        priority: 'high',
        channels: ['in_app', 'email'],
        title: 'KYC Verification Rejected',
        body: `Your ${tierLabel} identity verification was not approved.${notes ? ` Reason: ${notes}` : ''} Please resubmit your documents.`,
        actionUrl: '/dashboard/kyc',
      }).catch(() => {});
    }

    // S2.10: Emit KYC_APPROVED event for cross-system workflows
    if (action === 'approve') {
      emitEventAsync({
        type: 'KYC_APPROVED',
        data: { userId: memberId },
      });
    }

    return NextResponse.json({ success: true, verification });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
