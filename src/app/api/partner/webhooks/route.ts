/**
 * Partner Webhook Receiver
 *
 * Receives notifications from bank partner:
 * - KYC verification results
 * - Payment confirmations
 * - Account status updates
 * - Compliance alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { authenticatePartner } from '@/lib/banking/partner-auth';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const auth = await authenticatePartner(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await req.json();
    const { event_type, data } = body;
    const db = getServiceClient();

    // Log all webhooks for audit
    await db.from('audit_logs').insert({
      action: `partner_webhook:${event_type}`,
      entity_type: 'partner',
      entity_id: auth.partner.partner_id,
      details: { event_type, data, partner: auth.partner.name },
    }).then(() => {/* ignore errors on audit log */});

    switch (event_type) {
      case 'kyc.verified': {
        // Bank confirmed KYC verification
        if (data.user_id) {
          await db.from('kyc_verifications')
            .update({
              status: 'verified',
              verified_at: new Date().toISOString(),
              bank_reference: data.reference,
            })
            .eq('user_id', data.user_id);
        }
        return NextResponse.json({ received: true, event: 'kyc.verified' });
      }

      case 'kyc.rejected': {
        if (data.user_id) {
          await db.from('kyc_verifications')
            .update({
              status: 'rejected',
              rejection_reason: data.reason,
              bank_reference: data.reference,
            })
            .eq('user_id', data.user_id);
        }
        return NextResponse.json({ received: true, event: 'kyc.rejected' });
      }

      case 'payment.confirmed': {
        // Bank confirmed a payment/settlement
        if (data.reference) {
          await db.from('payments')
            .update({
              status: 'completed',
              bank_reference: data.bank_reference,
              settled_at: new Date().toISOString(),
            })
            .eq('reference', data.reference);
        }
        return NextResponse.json({ received: true, event: 'payment.confirmed' });
      }

      case 'payment.failed': {
        if (data.reference) {
          await db.from('payments')
            .update({
              status: 'failed',
              failure_reason: data.reason,
              bank_reference: data.bank_reference,
            })
            .eq('reference', data.reference);
        }
        return NextResponse.json({ received: true, event: 'payment.failed' });
      }

      case 'account.frozen': {
        // Bank requested account freeze (compliance)
        if (data.wallet_id) {
          await db.from('wallet_accounts')
            .update({
              status: 'frozen',
              frozen_reason: data.reason || 'Bank compliance hold',
              frozen_at: new Date().toISOString(),
            })
            .eq('id', data.wallet_id);
        }
        return NextResponse.json({ received: true, event: 'account.frozen' });
      }

      case 'account.unfrozen': {
        if (data.wallet_id) {
          await db.from('wallet_accounts')
            .update({
              status: 'active',
              frozen_reason: null,
              frozen_at: null,
            })
            .eq('id', data.wallet_id);
        }
        return NextResponse.json({ received: true, event: 'account.unfrozen' });
      }

      case 'compliance.alert': {
        // Bank flagging suspicious activity
        await db.from('transaction_flags').insert({
          user_id: data.user_id || null,
          flag_type: 'sanctions_hit',
          severity: data.severity || 'high',
          details: {
            source: 'bank_partner',
            partner: auth.partner.name,
            ...data,
          },
          status: 'pending',
        });
        return NextResponse.json({ received: true, event: 'compliance.alert' });
      }

      default:
        // Log unknown events but don't reject them
        return NextResponse.json({
          received: true,
          event: event_type,
          warning: 'Unknown event type — logged for review',
        });
    }
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
