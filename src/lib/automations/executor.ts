import { createClient } from '@supabase/supabase-js';

const svc = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

interface EventContext {
  name?: string;
  email?: string;
  phone?: string;
  country?: string;
  tier?: string;
  [key: string]: unknown;
}

/**
 * Fire all matching automation rules for a given trigger event.
 * Call this from approval flows, form submissions, etc.
 *
 * Usage:
 *   await fireAutomations('member_approved', { name: 'Grace', email: 'grace@farm.co', tier: 'smallholder' });
 */
export async function fireAutomations(triggerType: string, context: EventContext) {
  try {
    const db = svc();

    // Fetch active rules matching this trigger
    const { data: rules } = await db
      .from('automation_rules')
      .select('*')
      .eq('trigger_type', triggerType)
      .eq('is_active', true);

    if (!rules || rules.length === 0) return;

    for (const rule of rules) {
      // Check trigger conditions (e.g., tier filter)
      const config = (rule.trigger_config || {}) as Record<string, string>;
      if (config.tier && context.tier && config.tier !== context.tier) continue;
      if (config.country && context.country && config.country !== context.country) continue;

      // Execute action (with delay if configured)
      const delayMs = (rule.delay_minutes || 0) * 60 * 1000;

      if (delayMs > 0) {
        // For delays, we'd need a job queue. For now, use setTimeout for short delays (<5min)
        // and skip longer ones (those would need a proper cron job)
        if (delayMs <= 300000) {
          setTimeout(() => executeAction(rule, context), delayMs);
        }
        // Longer delays would be handled by a cron job checking automation_rules
      } else {
        await executeAction(rule, context);
      }

      // Update run count
      await db
        .from('automation_rules')
        .update({
          run_count: (rule.run_count || 0) + 1,
          last_run_at: new Date().toISOString(),
        })
        .eq('id', rule.id);
    }
  } catch (err) {
    console.error('Automation executor error:', err);
  }
}

async function executeAction(
  rule: { action_type: string; action_config: Record<string, unknown> },
  context: EventContext
) {
  const config = rule.action_config || {};
  const interpolate = (text: string) =>
    text
      .replace(/\{\{name\}\}/g, context.name || '')
      .replace(/\{\{email\}\}/g, context.email || '')
      .replace(/\{\{phone\}\}/g, context.phone || '')
      .replace(/\{\{country\}\}/g, context.country || '')
      .replace(/\{\{tier\}\}/g, context.tier || '');

  try {
    switch (rule.action_type) {
      case 'send_email': {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        if (context.email) {
          await resend.emails.send({
            from: 'African Farming Union <noreply@mail.africanfarmingunion.org>',
            to: context.email,
            subject: interpolate((config.subject as string) || 'Message from AFU'),
            html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
              <div style="background:#1B2A4A;padding:24px;text-align:center"><h2 style="color:#5DB347;margin:0">African Farming Union</h2></div>
              <div style="padding:24px;background:#f8faf6"><p style="color:#333;font-size:14px;line-height:1.6;white-space:pre-wrap">${interpolate((config.body as string) || '')}</p></div>
              <div style="padding:12px;text-align:center;color:#999;font-size:12px">africanfarmingunion.org</div>
            </div>`,
          });
        }
        break;
      }

      case 'send_sms': {
        if (context.phone) {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://africanfarmingunion.org';
          await fetch(`${baseUrl}/api/sms/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
              to: context.phone,
              body: interpolate((config.body as string) || ''),
            }),
          });
        }
        break;
      }

      case 'create_notification': {
        const db = svc();
        if (context.email) {
          // Find user profile by email
          const { data: profile } = await db
            .from('profiles')
            .select('id')
            .eq('email', context.email)
            .maybeSingle();

          if (profile) {
            await db.from('notifications').insert({
              user_id: profile.id,
              title: interpolate((config.title as string) || 'Notification'),
              message: interpolate((config.body as string) || ''),
              type: 'info',
              read: false,
            });
          }
        }
        break;
      }

      case 'add_tag': {
        const db = svc();
        if (context.email) {
          const { data: conv } = await db
            .from('conversations')
            .select('id, tags')
            .eq('contact_email', context.email)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (conv) {
            const newTags = [...(conv.tags || []), config.tag as string].filter(
              (v, i, a) => a.indexOf(v) === i
            );
            await db.from('conversations').update({ tags: newTags }).eq('id', conv.id);
          }
        }
        break;
      }

      default:
        console.log(`Unknown automation action: ${rule.action_type}`);
    }
  } catch (err) {
    console.error(`Automation action ${rule.action_type} failed:`, err);
  }
}
