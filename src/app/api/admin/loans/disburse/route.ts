import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications/engine';
import { paymentReceivedTemplate } from '@/lib/notifications/templates';
import { loanDisburseSchema } from '@/lib/validation/schemas';

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
    const parsed = loanDisburseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { loanId, amount, method, currency } = parsed.data;

    // Verify loan exists and is approved
    const { data: loan, error: loanError } = await svc
      .from('loans')
      .select('id, status, member_id, amount')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'approved') {
      return NextResponse.json({ error: `Cannot disburse: loan status is "${loan.status}", must be "approved"` }, { status: 400 });
    }

    // Create disbursement record
    const { data: disbursement, error: disbError } = await svc
      .from('loan_disbursements')
      .insert({
        loan_id: loanId,
        member_id: loan.member_id,
        amount,
        currency: currency || 'USD',
        disbursement_method: method,
        status: 'completed',
        disbursed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (disbError) {
      return NextResponse.json({ error: disbError.message }, { status: 500 });
    }

    // Update loan status to disbursed
    await svc
      .from('loans')
      .update({
        status: 'disbursed',
        disbursed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', loanId);

    // Log to audit
    await svc.from('audit_log').insert({
      user_id: user.id,
      action: 'loan_disbursed',
      entity_type: 'loan',
      entity_id: loanId,
      details: { amount, method, currency: currency || 'USD', disbursement_id: disbursement.id },
    });

    // Notify member of disbursement (fire-and-forget)
    if (loan.member_id) {
      const cur = currency || 'USD';
      const template = paymentReceivedTemplate(String(amount), cur, disbursement.id);
      sendNotification({
        recipientId: loan.member_id,
        category: 'loan',
        priority: 'high',
        channels: ['in_app', 'email', 'sms'],
        actionUrl: '/dashboard/financing',
        ...template,
        title: 'Loan Disbursed',
        body: `Your loan of ${cur} ${amount.toLocaleString()} has been disbursed via ${method}.`,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, disbursement });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
