/**
 * GET /api/cron/membership-expiry
 *
 * Membership lifecycle cron job — run daily.
 *
 * 1. Members whose expiry_date is within 7 days  -> send warning email
 * 2. Members whose expiry_date is past            -> set status to 'expired' + send expired email
 * 3. Members whose expiry_date is 30+ days past   -> downgrade tier to 'free'
 *
 * Protected by CRON_SECRET env var.  Call from Vercel Cron or external scheduler:
 *   curl -H "Authorization: Bearer $CRON_SECRET" https://yoursite.com/api/cron/membership-expiry
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  sendMembershipExpiryWarningEmail,
  sendMembershipExpiredEmail,
  sendTierDowngradeEmail,
} from '@/lib/email/lifecycle-emails';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // seconds (Vercel serverless timeout)

export async function GET(request: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────────────────
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const svc = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const now = new Date();
  const results = { warnings: 0, expired: 0, downgraded: 0, errors: 0 };

  try {
    // ── 1. Expiry warning (within 7 days) ──────────────────────────────────
    // Select active members whose expiry_date falls between now and now + 7 days.
    const warningCutoff = new Date(now);
    warningCutoff.setDate(warningCutoff.getDate() + 7);

    const { data: warningMembers } = await svc
      .from('members')
      .select('id, profile_id, tier, expiry_date, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .gte('expiry_date', now.toISOString())
      .lte('expiry_date', warningCutoff.toISOString());

    if (warningMembers && warningMembers.length > 0) {
      for (const member of warningMembers) {
        try {
          const profile = member.profiles as unknown as { email: string; full_name: string };
          if (profile?.email) {
            await sendMembershipExpiryWarningEmail(
              profile.email,
              profile.full_name || 'Member',
              member.expiry_date!,
              member.tier,
            );
          }

          // Audit log
          await svc.from('audit_log').insert({
            action: 'membership_expiry_warning_sent',
            entity_type: 'member',
            entity_id: member.id,
            details: { expiry_date: member.expiry_date, sent_at: now.toISOString() },
          });

          results.warnings++;
        } catch {
          results.errors++;
        }
      }
    }

    // ── 2. Expired (past expiry_date, still active) ────────────────────────
    const { data: expiredMembers } = await svc
      .from('members')
      .select('id, profile_id, tier, expiry_date, profiles!inner(email, full_name)')
      .eq('status', 'active')
      .lt('expiry_date', now.toISOString());

    if (expiredMembers && expiredMembers.length > 0) {
      for (const member of expiredMembers) {
        try {
          // Update status to expired
          await svc
            .from('members')
            .update({ status: 'expired', updated_at: now.toISOString() })
            .eq('id', member.id);

          const profile = member.profiles as unknown as { email: string; full_name: string };
          if (profile?.email) {
            await sendMembershipExpiredEmail(
              profile.email,
              profile.full_name || 'Member',
              member.tier,
            );
          }

          // Audit log
          await svc.from('audit_log').insert({
            action: 'membership_expired',
            entity_type: 'member',
            entity_id: member.id,
            details: { expiry_date: member.expiry_date, tier: member.tier },
          });

          results.expired++;
        } catch {
          results.errors++;
        }
      }
    }

    // ── 3. Downgrade (30+ days past expiry) ────────────────────────────────
    const downgradeCutoff = new Date(now);
    downgradeCutoff.setDate(downgradeCutoff.getDate() - 30);

    const { data: downgradeMembers } = await svc
      .from('members')
      .select('id, profile_id, tier, expiry_date, email')
      .eq('status', 'expired')
      .neq('tier', 'free')
      .lt('expiry_date', downgradeCutoff.toISOString());

    if (downgradeMembers && downgradeMembers.length > 0) {
      for (const member of downgradeMembers) {
        try {
          const previousTier = member.tier;

          await svc
            .from('members')
            .update({ tier: 'free', updated_at: now.toISOString() })
            .eq('id', member.id);

          // Audit log
          await svc.from('audit_log').insert({
            action: 'membership_tier_downgraded',
            entity_type: 'member',
            entity_id: member.id,
            details: {
              previous_tier: previousTier,
              new_tier: 'free',
              expiry_date: member.expiry_date,
            },
          });

          results.downgraded++;

          // Notify member of downgrade
          if (member.email) {
            try {
              await sendTierDowngradeEmail(member.email, member.email.split('@')[0], previousTier);
            } catch {
              // Don't fail cron if email fails
            }
          }
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
    console.error('Membership-expiry cron error:', err);
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 });
  }
}
