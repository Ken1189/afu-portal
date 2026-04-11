import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const svc = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

/**
 * POST /api/admin/automations/seed
 *
 * Seeds the automation_rules table with default lifecycle rules.
 * Skips any rule whose name already exists (idempotent).
 * Requires admin auth or CRON_SECRET bearer token.
 */
export async function POST(request: Request) {
  // Auth: accept admin session or cron secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || process.env.AUTOMATION_CRON_SECRET;
  const isCron = cronSecret && authHeader === `Bearer ${cronSecret}`;

  if (!isCron) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const { createClient: createBrowserClient } = await import('@supabase/supabase-js');
    const userClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader || '' } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const db = svc();
    const { data: profile } = await db.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const DEFAULT_RULES = [
    // ── Welcome Series (3 emails over first week) ──
    {
      name: 'Welcome Email #1 — Immediate',
      description: 'Send first welcome email immediately when a member is approved',
      trigger_type: 'member_approved',
      trigger_config: {},
      action_type: 'send_welcome_series',
      action_config: { email_number: 1 },
      delay_minutes: 0,
      is_active: true,
    },
    {
      name: 'Welcome Email #2 — Day 2',
      description: 'Send second welcome email 2 days after approval (getting started guide)',
      trigger_type: 'member_approved',
      trigger_config: {},
      action_type: 'send_welcome_series',
      action_config: { email_number: 2 },
      delay_minutes: 2880, // 2 days
      is_active: true,
    },
    {
      name: 'Welcome Email #3 — Day 5',
      description: 'Send third welcome email 5 days after approval (explore features)',
      trigger_type: 'member_approved',
      trigger_config: {},
      action_type: 'send_welcome_series',
      action_config: { email_number: 3 },
      delay_minutes: 7200, // 5 days
      is_active: true,
    },

    // ── Member Approved — In-App Notification ──
    {
      name: 'Member Approved — Notification',
      description: 'Create in-app notification when member is approved',
      trigger_type: 'member_approved',
      trigger_config: {},
      action_type: 'create_notification',
      action_config: {
        title: 'Welcome to AFU!',
        body: 'Hi {{name}}, your membership has been approved. Start exploring your farm dashboard!',
      },
      delay_minutes: 0,
      is_active: true,
    },

    // ── Loan Application Submitted ──
    {
      name: 'Loan Application — Confirmation Email',
      description: 'Send confirmation email when farmer submits a loan application',
      trigger_type: 'loan_submitted',
      trigger_config: {},
      action_type: 'send_loan_application_received',
      action_config: {},
      delay_minutes: 0,
      is_active: true,
    },
    {
      name: 'Loan Application — Notification',
      description: 'Create in-app notification when loan application is submitted',
      trigger_type: 'loan_submitted',
      trigger_config: {},
      action_type: 'create_notification',
      action_config: {
        title: 'Loan Application Received',
        body: 'Your loan application has been submitted and is under review. We\'ll notify you once it\'s processed.',
      },
      delay_minutes: 0,
      is_active: true,
    },

    // ── Supplier Approved ──
    {
      name: 'Supplier Approved — Welcome Email',
      description: 'Send welcome email when supplier is approved',
      trigger_type: 'supplier_approved',
      trigger_config: {},
      action_type: 'send_email',
      action_config: {
        subject: 'Welcome to AFU Marketplace, {{name}}!',
        body: 'Congratulations {{name}}! Your supplier account has been approved.\n\nYou can now:\n- List your products on the AFU Marketplace\n- Receive orders from farmers across Africa\n- Access our supplier dashboard\n\nLog in at africanfarmingunion.org/supplier to get started.',
      },
      delay_minutes: 0,
      is_active: true,
    },
    {
      name: 'Supplier Approved — Notification',
      description: 'In-app notification when supplier is approved',
      trigger_type: 'supplier_approved',
      trigger_config: {},
      action_type: 'create_notification',
      action_config: {
        title: 'Supplier Account Approved',
        body: 'Your supplier account is now active. Start listing your products on the marketplace!',
      },
      delay_minutes: 0,
      is_active: true,
    },

    // ── Ambassador Approved ──
    {
      name: 'Ambassador Approved — Welcome Email',
      description: 'Send welcome email when ambassador is approved',
      trigger_type: 'ambassador_approved',
      trigger_config: {},
      action_type: 'send_email',
      action_config: {
        subject: 'Welcome to the AFU Ambassador Programme, {{name}}!',
        body: 'Hi {{name}},\n\nYou\'ve been approved as an AFU Ambassador! You can now:\n- Share your unique referral link with farmers\n- Earn commissions on referrals\n- Access ambassador resources and training\n\nVisit your dashboard at africanfarmingunion.org/ambassador to find your referral link.',
      },
      delay_minutes: 0,
      is_active: true,
    },

    // ── Newsletter Subscribed ──
    {
      name: 'Newsletter — Confirmation Email',
      description: 'Send confirmation email when someone subscribes to the newsletter',
      trigger_type: 'newsletter_subscribed',
      trigger_config: {},
      action_type: 'send_newsletter_confirmation',
      action_config: {},
      delay_minutes: 0,
      is_active: true,
    },

    // ── Job Application ──
    {
      name: 'Job Application — Confirmation Email',
      description: 'Send confirmation email when someone applies for a job',
      trigger_type: 'job_application',
      trigger_config: {},
      action_type: 'send_job_application_received',
      action_config: {},
      delay_minutes: 0,
      is_active: true,
    },

    // ── Lifecycle Cron Rules ──
    {
      name: 'Incomplete Profile — Nudge Email',
      description: 'Email users who haven\'t completed their profile after 3 days',
      trigger_type: 'incomplete_profile',
      trigger_config: { days_threshold: 3 },
      action_type: 'send_email',
      action_config: {
        subject: 'Complete your AFU profile, {{name}}',
        body: 'Hi {{name}},\n\nYour AFU profile is almost complete! Adding your farm details, phone number, and country helps us:\n- Match you with relevant loans and insurance\n- Connect you to suppliers in your region\n- Show you market prices for your crops\n\nLog in at africanfarmingunion.org to complete your profile.',
      },
      delay_minutes: 0,
      is_active: true,
    },
    {
      name: 'Inactive User — Re-engagement Email',
      description: 'Email users who haven\'t logged in for 14 days',
      trigger_type: 'inactive_user',
      trigger_config: { days_threshold: 14 },
      action_type: 'send_email',
      action_config: {
        subject: 'We miss you, {{name}}!',
        body: 'Hi {{name}},\n\nIt\'s been a while since you visited AFU. Here\'s what\'s new:\n- Updated market prices for your region\n- New loan products available\n- Seasonal insurance options open for enrolment\n\nLog in at africanfarmingunion.org to check it out.',
      },
      delay_minutes: 0,
      is_active: true,
    },
    {
      name: 'Abandoned Application — Follow-up',
      description: 'Email applicants who started but didn\'t complete their application after 48 hours',
      trigger_type: 'abandoned_application',
      trigger_config: { hours_threshold: 48 },
      action_type: 'send_email',
      action_config: {
        subject: 'Your AFU application is waiting, {{name}}',
        body: 'Hi {{name}},\n\nYou started an application with the African Farming Union but haven\'t completed it yet.\n\nIt only takes a few minutes to finish. Your progress has been saved — just log in and pick up where you left off.\n\nVisit africanfarmingunion.org/apply to continue.',
      },
      delay_minutes: 0,
      is_active: true,
    },
    {
      name: 'Payment Overdue — Reminder',
      description: 'Email members with payments overdue by 3+ days',
      trigger_type: 'payment_overdue',
      trigger_config: { days_threshold: 3 },
      action_type: 'send_email',
      action_config: {
        subject: 'Payment reminder — African Farming Union',
        body: 'Hi {{name}},\n\nThis is a friendly reminder that you have an outstanding payment with AFU.\n\nPlease log in to your dashboard to view and settle your balance. If you\'ve already made a payment, please disregard this message.\n\nVisit africanfarmingunion.org/farm/payments for details.',
      },
      delay_minutes: 0,
      is_active: true,
    },
  ];

  const db = svc();

  // Fetch existing rule names to avoid duplicates
  const { data: existing } = await db
    .from('automation_rules')
    .select('name');
  const existingNames = new Set((existing || []).map((r: { name: string }) => r.name));

  const toInsert = DEFAULT_RULES.filter((r) => !existingNames.has(r.name));

  if (toInsert.length === 0) {
    return NextResponse.json({ message: 'All rules already exist', seeded: 0 });
  }

  const { error } = await db.from('automation_rules').insert(toInsert);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: `Seeded ${toInsert.length} automation rules`,
    seeded: toInsert.length,
    skipped: DEFAULT_RULES.length - toInsert.length,
    rules: toInsert.map((r) => r.name),
  });
}
