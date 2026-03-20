import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

    const body = await request.json();
    const { memberId, action, tier, notes, documentId } = body as {
      memberId: string;
      action: 'approve' | 'reject';
      tier?: number;
      notes?: string;
      documentId?: string;
    };

    if (!memberId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'memberId and action (approve|reject) required' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, verification });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
