import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { sendNotification } from '@/lib/notifications/engine';
import { paymentReceivedTemplate } from '@/lib/notifications/templates';
import { loanDisburseSchema } from '@/lib/validation/schemas';
import { emitEventAsync } from '@/lib/events/event-bus';
import { sendLoanDisbursedEmail } from '@/lib/email/lifecycle-emails';
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
    const parsed = loanDisburseSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }
    const { loanId, amount, method, currency } = parsed.data;

    // Verify loan exists and is approved
    const { data: loan, error: loanError } = await svc
      .from('loans')
      .select('id, status, member_id, borrower_id, amount, currency, interest_rate, term_months')
      .eq('id', loanId)
      .single();

    if (loanError || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    if (loan.status !== 'approved') {
      return NextResponse.json({ error: `Cannot disburse: loan status is "${loan.status}", must be "approved"` }, { status: 400 });
    }

    // Resolve borrower id (schema has both member_id and borrower_id variants)
    const borrowerId: string | null =
      (loan as { borrower_id?: string | null }).borrower_id ||
      (loan as { member_id?: string | null }).member_id ||
      null;
    const loanCurrency = (loan as { currency?: string }).currency || currency || 'USD';
    const termMonths = Number((loan as { term_months?: number }).term_months || 12);
    const interestRate = Number((loan as { interest_rate?: number }).interest_rate || 0.10);
    const loanAmount = Number((loan as { amount?: number }).amount || amount);

    // Create disbursement record
    const { data: disbursement, error: disbError } = await svc
      .from('loan_disbursements')
      .insert({
        loan_id: loanId,
        member_id: borrowerId,
        amount,
        currency: loanCurrency,
        disbursement_method: method,
        status: 'completed',
        disbursed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (disbError) {
      return NextResponse.json({ error: disbError.message }, { status: 500 });
    }

    // ----------------------------------------------------------------------
    // 1. Find or create borrower wallet
    // ----------------------------------------------------------------------
    let walletId: string | undefined;
    if (borrowerId) {
      const { data: wallet } = await svc
        .from('wallet_accounts')
        .select('id')
        .eq('user_id', borrowerId)
        .maybeSingle();
      walletId = wallet?.id;
      if (!walletId) {
        const { data: newWallet } = await svc
          .from('wallet_accounts')
          .insert({
            user_id: borrowerId,
            balance: 0,
            currency: loanCurrency,
            status: 'active',
          })
          .select('id')
          .single();
        walletId = newWallet?.id;
      }

      // 2. Credit wallet atomically
      if (walletId) {
        await svc.rpc('credit_wallet', {
          p_wallet_id: walletId,
          p_amount: loanAmount,
          p_description: `Loan disbursement: ${loanId}`,
        });

        // 3. Insert wallet transaction for audit
        await svc.from('wallet_transactions').insert({
          wallet_id: walletId,
          user_id: borrowerId,
          amount: loanAmount,
          type: 'credit',
          status: 'completed',
          description: 'Loan disbursement',
          reference: loanId,
        });
      }
    }

    // ----------------------------------------------------------------------
    // 4. Generate repayment schedule
    // ----------------------------------------------------------------------
    const monthlyAmount = (loanAmount * (1 + interestRate)) / termMonths;
    const scheduleRows: Array<{
      loan_id: string;
      due_date: string;
      amount_due: number;
      status: string;
    }> = [];
    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + i);
      scheduleRows.push({
        loan_id: loanId,
        due_date: dueDate.toISOString().split('T')[0],
        amount_due: Number(monthlyAmount.toFixed(2)),
        status: 'pending',
      });
    }
    if (scheduleRows.length > 0) {
      await svc.from('loan_schedules').insert(scheduleRows);
    }

    // 5. Update loan status + disbursement details
    await svc
      .from('loans')
      .update({
        status: 'disbursed',
        disbursed_at: new Date().toISOString(),
        disbursed_amount: loanAmount,
        next_payment_amount: Number(monthlyAmount.toFixed(2)),
        next_payment_date: scheduleRows[0]?.due_date,
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
    if (borrowerId) {
      const template = paymentReceivedTemplate(String(amount), loanCurrency, disbursement.id);
      sendNotification({
        recipientId: borrowerId,
        category: 'loan',
        priority: 'high',
        channels: ['in_app', 'email', 'sms'],
        actionUrl: '/dashboard/financing',
        ...template,
        title: 'Loan Disbursed',
        body: `Your loan of ${loanCurrency} ${amount.toLocaleString()} has been disbursed via ${method}.`,
      }).catch(() => {});

      // Lifecycle email with repayment details
      try {
        const { data: prof } = await svc
          .from('profiles')
          .select('email, full_name, first_name')
          .eq('id', borrowerId)
          .maybeSingle();
        const email = (prof as { email?: string } | null)?.email;
        const name =
          (prof as { full_name?: string; first_name?: string } | null)?.full_name ||
          (prof as { first_name?: string } | null)?.first_name ||
          'Member';
        if (email && scheduleRows[0]) {
          sendLoanDisbursedEmail(
            email,
            name,
            loanAmount,
            loanCurrency,
            Number(monthlyAmount.toFixed(2)),
            scheduleRows[0].due_date,
          ).catch(() => {});
        }
      } catch { /* non-blocking */ }
    }

    // S2.9: Emit LOAN_DISBURSED event for cross-system workflows
    if (borrowerId) {
      emitEventAsync({
        type: 'LOAN_DISBURSED',
        data: {
          loanId,
          userId: borrowerId,
          amount: loanAmount,
          walletId,
        },
      });
    }

    return NextResponse.json({ success: true, disbursement });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
