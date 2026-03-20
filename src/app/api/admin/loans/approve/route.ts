import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications/engine';
import { loanApprovedTemplate } from '@/lib/notifications/templates';
import { loanApproveSchema } from '@/lib/validation/schemas';

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
    const parsed = loanApproveSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { loanId, action, notes } = parsed.data;

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { data: loan, error: updateError } = await svc
      .from('loans')
      .update({
        status: newStatus,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        ...(notes ? { purpose: notes } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', loanId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Log to audit
    await svc.from('audit_log').insert({
      user_id: user.id,
      action: `loan_${action}`,
      entity_type: 'loan',
      entity_id: loanId,
      details: { status: newStatus, notes },
    });

    // Send notification to the member (fire-and-forget)
    if (loan.member_id) {
      const template = loanApprovedTemplate(
        String(loan.amount),
        'USD',
        loan.loan_number || loanId,
      );
      sendNotification({
        recipientId: loan.member_id,
        category: 'loan',
        priority: 'high',
        channels: ['in_app', 'email', 'sms'],
        actionUrl: '/dashboard/financing',
        ...template,
        title: action === 'approve' ? template.title : 'Loan Application Rejected',
        body: action === 'approve'
          ? template.body
          : `Your loan application (${loan.loan_number || loanId}) has been rejected.${notes ? ` Reason: ${notes}` : ''}`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, loan });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
