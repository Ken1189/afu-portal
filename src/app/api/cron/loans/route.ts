/**
 * GET /api/cron/loans
 *
 * S3.10 + S3.11: Loan lifecycle cron job.
 * - Detects overdue loans and marks them
 * - Sends repayment reminders for upcoming due dates
 *
 * Protected by CRON_SECRET env var. Call from Vercel Cron or external scheduler:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://yoursite.com/api/cron/loans
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { notifyUser } from '@/lib/events/notifications';

export async function GET(request: NextRequest) {
  // Auth: verify cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date();
  const results = { overdue: 0, reminders: 0, errors: 0 };

  try {
    // ── S3.10: Detect overdue loans ──────────────────────────────────────
    // Loans that are disbursed/repaying and past their due date
    const { data: overdueLoans } = await svc
      .from('loans')
      .select('id, member_id, amount, loan_number, due_date, status')
      .in('status', ['disbursed', 'repaying'])
      .lt('due_date', now.toISOString())
      .neq('status', 'defaulted');

    if (overdueLoans && overdueLoans.length > 0) {
      for (const loan of overdueLoans) {
        try {
          // Mark as overdue (update status or add flag)
          await svc
            .from('loans')
            .update({ status: 'overdue', updated_at: now.toISOString() })
            .eq('id', loan.id);

          // Notify the member
          if (loan.member_id) {
            await notifyUser(
              loan.member_id,
              'Loan Overdue',
              `Your loan${loan.loan_number ? ` #${loan.loan_number}` : ''} of $${Number(loan.amount).toLocaleString()} is past due. Please make a repayment to avoid penalties.`,
              'all',
              { type: 'loan', actionUrl: '/dashboard/financing' },
            );
          }

          // Audit log
          await svc.from('audit_log').insert({
            action: 'loan_overdue_detected',
            entity_type: 'loan',
            entity_id: loan.id,
            details: { due_date: loan.due_date, detected_at: now.toISOString() },
          });

          results.overdue++;
        } catch {
          results.errors++;
        }
      }
    }

    // ── S3.11: Send repayment reminders (7 days before due) ─────────────
    const reminderDate = new Date(now);
    reminderDate.setDate(reminderDate.getDate() + 7);

    const { data: upcomingLoans } = await svc
      .from('loans')
      .select('id, member_id, amount, loan_number, due_date, next_payment_amount')
      .in('status', ['disbursed', 'repaying'])
      .gte('due_date', now.toISOString())
      .lte('due_date', reminderDate.toISOString());

    if (upcomingLoans && upcomingLoans.length > 0) {
      for (const loan of upcomingLoans) {
        try {
          if (loan.member_id) {
            const dueDate = new Date(loan.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const paymentAmount = loan.next_payment_amount || loan.amount;

            await notifyUser(
              loan.member_id,
              'Loan Repayment Reminder',
              `Your loan${loan.loan_number ? ` #${loan.loan_number}` : ''} payment of $${Number(paymentAmount).toLocaleString()} is due on ${dueDate}. Please ensure funds are available.`,
              'sms',
              { type: 'loan', actionUrl: '/dashboard/financing' },
            );
          }

          results.reminders++;
        } catch {
          results.errors++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error('Loan cron error:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
