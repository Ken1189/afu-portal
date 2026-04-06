import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * POST /api/automations/evaluate
 *
 * Evaluates all active lifecycle-based automation rules.
 * Designed to be called by a cron job / scheduled task (e.g. every 15 min).
 *
 * Auth: expects a secret bearer token so only the scheduler can invoke it.
 * Set AUTOMATION_CRON_SECRET in your environment.
 */

const LIFECYCLE_TRIGGERS = [
  'incomplete_profile',
  'inactive_user',
  'abandoned_application',
  'new_member_welcome',
  'tier_upgrade_eligible',
  'payment_overdue',
  'course_incomplete',
  'referral_milestone',
] as const;

type LifecycleTrigger = (typeof LIFECYCLE_TRIGGERS)[number];

interface MatchedUser {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  country: string | null;
  membership_tier: string | null;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger_type: string;
  trigger_config: Record<string, string>;
  action_type: string;
  action_config: Record<string, string>;
  delay_minutes: number;
  is_active: boolean;
  run_count: number;
}

/* ──────────────────────────────────────────────
 *  Trigger evaluators — each returns matching user IDs
 * ────────────────────────────────────────────── */

async function evaluateIncompleteProfile(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const hours = parseInt(config.hours || '24', 10);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  // Users created before cutoff whose profile is still incomplete
  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, phone, country, membership_tier')
    .lt('created_at', cutoff)
    .or('full_name.is.null,phone.is.null,country.is.null')
    .limit(500);

  return (data || []) as MatchedUser[];
}

async function evaluateInactiveUser(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const days = parseInt(config.days || '14', 10);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, phone, country, membership_tier')
    .lt('last_sign_in_at', cutoff)
    .eq('status', 'active')
    .limit(500);

  return (data || []) as MatchedUser[];
}

async function evaluateAbandonedApplication(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const hours = parseInt(config.hours || '48', 10);
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('applications')
    .select('id, email, full_name, phone, country, membership_tier:tier_applied')
    .eq('status', 'draft')
    .lt('created_at', cutoff)
    .limit(500);

  return (data || []) as MatchedUser[];
}

async function evaluateNewMemberWelcome(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
) {
  // Members approved in the last evaluation window (30 min) who haven't been welcomed
  const since = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, phone, country, membership_tier')
    .eq('status', 'active')
    .gte('approved_at', since)
    .limit(500);

  return (data || []) as MatchedUser[];
}

async function evaluateTierUpgradeEligible(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const currentTier = config.current_tier || 'free';
  const minDays = parseInt(config.min_days || '30', 10);
  const cutoff = new Date(Date.now() - minDays * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, phone, country, membership_tier')
    .eq('membership_tier', currentTier)
    .lt('created_at', cutoff)
    .eq('status', 'active')
    .limit(500);

  return (data || []) as MatchedUser[];
}

async function evaluatePaymentOverdue(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const days = parseInt(config.days || '7', 10);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('payments')
    .select('user_id, profiles!inner(id, email, full_name, phone, country, membership_tier)')
    .eq('status', 'overdue')
    .lt('due_date', cutoff)
    .limit(500);

  // Flatten the join
  return ((data || []) as unknown as { profiles: MatchedUser }[]).map(r => r.profiles);
}

async function evaluateCourseIncomplete(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const days = parseInt(config.days || '14', 10);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await admin
    .from('course_enrollments')
    .select('user_id, profiles!inner(id, email, full_name, phone, country, membership_tier)')
    .eq('status', 'in_progress')
    .lt('started_at', cutoff)
    .limit(500);

  return ((data || []) as unknown as { profiles: MatchedUser }[]).map(r => r.profiles);
}

async function evaluateReferralMilestone(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  config: Record<string, string>,
) {
  const milestone = parseInt(config.milestone || '5', 10);

  // Find ambassadors whose referral_count just hit the milestone
  // We check for exact match — the dedup log prevents re-firing
  const { data } = await admin
    .from('profiles')
    .select('id, email, full_name, phone, country, membership_tier')
    .eq('role', 'ambassador')
    .eq('referral_count', milestone)
    .limit(500);

  return (data || []) as MatchedUser[];
}

/* ──────────────────────────────────────────────
 *  Action executors
 * ────────────────────────────────────────────── */

function interpolate(template: string, user: MatchedUser): string {
  return template
    .replace(/\{\{name\}\}/g, user.full_name || 'Member')
    .replace(/\{\{email\}\}/g, user.email || '')
    .replace(/\{\{phone\}\}/g, user.phone || '')
    .replace(/\{\{country\}\}/g, user.country || '')
    .replace(/\{\{tier\}\}/g, user.membership_tier || 'free');
}

async function executeAction(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  actionType: string,
  actionConfig: Record<string, string>,
  user: MatchedUser,
) {
  switch (actionType) {
    case 'send_email': {
      // Queue email via the outbound_emails table (picked up by email worker)
      await admin.from('outbound_emails').insert({
        to_email: user.email,
        to_name: user.full_name,
        subject: interpolate(actionConfig.subject || '', user),
        body: interpolate(actionConfig.body || '', user),
        status: 'queued',
      });
      break;
    }

    case 'send_sms':
    case 'send_whatsapp': {
      await admin.from('outbound_messages').insert({
        channel: actionType === 'send_sms' ? 'sms' : 'whatsapp',
        to_phone: user.phone,
        body: interpolate(actionConfig.body || '', user),
        status: 'queued',
      });
      break;
    }

    case 'create_notification': {
      await admin.from('notifications').insert({
        user_id: user.id,
        title: interpolate(actionConfig.title || '', user),
        message: interpolate(actionConfig.body || '', user),
        type: 'automation',
        is_read: false,
      });
      break;
    }

    case 'add_tag': {
      await admin.from('user_tags').upsert(
        { user_id: user.id, tag: actionConfig.tag },
        { onConflict: 'user_id,tag' },
      );
      break;
    }

    case 'update_status': {
      if (actionConfig.status) {
        await admin
          .from('profiles')
          .update({ status: actionConfig.status })
          .eq('id', user.id);
      }
      break;
    }
  }
}

/* ──────────────────────────────────────────────
 *  Main handler
 * ────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization') || '';
  const secret = process.env.AUTOMATION_CRON_SECRET;
  if (secret && authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const admin = await createAdminClient();

    // Fetch all active lifecycle rules
    const { data: rules, error: rulesErr } = await admin
      .from('automation_rules')
      .select('*')
      .eq('is_active', true)
      .in('trigger_type', LIFECYCLE_TRIGGERS as unknown as string[]);

    if (rulesErr) {
      return NextResponse.json({ error: rulesErr.message }, { status: 500 });
    }

    const results: { rule_id: string; rule_name: string; matched: number; executed: number }[] = [];

    for (const rule of (rules || []) as AutomationRule[]) {
      let matchedUsers: MatchedUser[] = [];

      // Evaluate trigger
      switch (rule.trigger_type as LifecycleTrigger) {
        case 'incomplete_profile':
          matchedUsers = await evaluateIncompleteProfile(admin, rule.trigger_config);
          break;
        case 'inactive_user':
          matchedUsers = await evaluateInactiveUser(admin, rule.trigger_config);
          break;
        case 'abandoned_application':
          matchedUsers = await evaluateAbandonedApplication(admin, rule.trigger_config);
          break;
        case 'new_member_welcome':
          matchedUsers = await evaluateNewMemberWelcome(admin);
          break;
        case 'tier_upgrade_eligible':
          matchedUsers = await evaluateTierUpgradeEligible(admin, rule.trigger_config);
          break;
        case 'payment_overdue':
          matchedUsers = await evaluatePaymentOverdue(admin, rule.trigger_config);
          break;
        case 'course_incomplete':
          matchedUsers = await evaluateCourseIncomplete(admin, rule.trigger_config);
          break;
        case 'referral_milestone':
          matchedUsers = await evaluateReferralMilestone(admin, rule.trigger_config);
          break;
      }

      // Dedup: check automation_logs so we don't fire the same rule for the same user twice
      let executedCount = 0;
      for (const user of matchedUsers) {
        const { data: existing } = await admin
          .from('automation_logs')
          .select('id')
          .eq('rule_id', rule.id)
          .eq('user_id', user.id)
          .limit(1);

        if (existing && existing.length > 0) continue; // already fired

        // Execute the action
        await executeAction(admin, rule.action_type, rule.action_config, user);

        // Log execution
        await admin.from('automation_logs').insert({
          rule_id: rule.id,
          user_id: user.id,
          trigger_type: rule.trigger_type,
          action_type: rule.action_type,
          executed_at: new Date().toISOString(),
        });

        executedCount++;
      }

      // Update run count on the rule
      if (executedCount > 0) {
        await admin
          .from('automation_rules')
          .update({
            run_count: (rule.run_count || 0) + executedCount,
            last_run_at: new Date().toISOString(),
          })
          .eq('id', rule.id);
      }

      results.push({
        rule_id: rule.id,
        rule_name: rule.name,
        matched: matchedUsers.length,
        executed: executedCount,
      });
    }

    return NextResponse.json({
      success: true,
      evaluated_at: new Date().toISOString(),
      rules_evaluated: results.length,
      results,
    });
  } catch (err) {
    console.error('[automations/evaluate] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
