import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendLoanApplicationReceivedEmail } from '@/lib/email/lifecycle-emails';
import { notifyAdmins } from '@/lib/email';
import { fireAutomations } from '@/lib/automations/executor';

/**
 * POST /api/loans/notify
 * Called after a loan application is inserted client-side.
 * Sends confirmation email to applicant + notifies admins + fires automations.
 */
export async function POST(req: NextRequest) {
  try {
    const { loan_id } = await req.json();

    if (!loan_id) {
      return NextResponse.json({ error: 'loan_id required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    // Fetch loan + member + profile
    const { data: loan, error: loanErr } = await supabase
      .from('loans')
      .select('id, loan_number, loan_type, amount, purpose, status, member_id')
      .eq('id', loan_id)
      .single();

    if (loanErr || !loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Get member profile
    const { data: member } = await supabase
      .from('members')
      .select('id, tier, profiles!inner(email, full_name, country)')
      .eq('id', loan.member_id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    const profile = member.profiles as unknown as { email: string; full_name: string; country: string };

    // 1. Send confirmation email to applicant
    if (profile?.email) {
      try {
        await sendLoanApplicationReceivedEmail(
          profile.email,
          profile.full_name || 'Member',
          loan.amount,
        );
      } catch (e) {
        console.error('[loan notify] email failed:', e);
      }
    }

    // 2. Notify admins
    try {
      await notifyAdmins({
        subject: `[Loan Application] ${loan.loan_type} — BWP ${Number(loan.amount).toLocaleString()} from ${profile.full_name || 'Member'}`,
        type: 'loan',
        data: {
          loan_id: loan.id,
          loan_number: loan.loan_number,
          loan_type: loan.loan_type,
          amount: loan.amount,
          purpose: loan.purpose || '',
          applicant: profile.full_name || '',
          email: profile.email || '',
        },
        reply_to: profile.email,
        name: profile.full_name || 'Member',
        country: profile.country || undefined,
        tags: ['loan-application', 'finance'],
      });
    } catch (e) {
      console.error('[loan notify] admin notification failed:', e);
    }

    // 3. Fire automations
    try {
      await fireAutomations('loan_submitted', {
        name: profile.full_name || '',
        email: profile.email || '',
        country: profile.country || '',
        tier: member.tier || '',
        loan_type: loan.loan_type,
        amount: String(loan.amount),
      });
    } catch (e) {
      console.error('[loan notify] automation failed:', e);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/loans/notify]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
