import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

const KNOWN_PROVIDERS = ['ecocash', 'mtn', 'orange', 'airtel'] as const;
type MobileProvider = (typeof KNOWN_PROVIDERS)[number];

interface MobileCallbackBody {
  provider: string;
  reference: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * POST /api/payments/webhook/mobile
 * Generic mobile money callback for EcoCash, MTN, Orange, Airtel.
 * No auth required.
 * Accepts normalized format: { provider, reference, status, amount, currency }
 */
export async function POST(request: NextRequest) {
  let body: MobileCallbackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { provider, reference, status, amount, currency } = body;

  if (!provider || !reference || !status) {
    return NextResponse.json(
      { error: 'Missing required fields: provider, reference, status' },
      { status: 400 }
    );
  }

  const normalizedProvider = provider.toLowerCase() as MobileProvider;
  if (!KNOWN_PROVIDERS.includes(normalizedProvider)) {
    return NextResponse.json(
      { error: `Unknown provider: ${provider}. Must be one of: ${KNOWN_PROVIDERS.join(', ')}` },
      { status: 400 }
    );
  }

  // Map incoming status to internal status
  const statusMap: Record<string, string> = {
    success: 'completed',
    completed: 'completed',
    failed: 'failed',
    failure: 'failed',
    cancelled: 'cancelled',
    pending: 'pending',
  };
  const mappedStatus = statusMap[status.toLowerCase()] || 'failed';

  const adminClient = await createAdminClient();

  try {
    // Update payment by provider_reference
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .update({
        status: mappedStatus,
        ...(mappedStatus === 'failed' ? { failure_reason: `Provider reported: ${status}` } : {}),
      })
      .eq('provider_reference', reference)
      .eq('provider', normalizedProvider)
      .select('id')
      .single();

    if (paymentError || !payment) {
      console.error(`Mobile callback: payment not found for reference ${reference}, provider ${normalizedProvider}`);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment attempt
    await adminClient
      .from('payment_attempts')
      .update({
        status: mappedStatus,
        provider_response: { provider: normalizedProvider, reference, status, amount, currency },
      })
      .eq('payment_id', payment.id)
      .eq('status', 'pending');

    // S2.8: Emit PAYMENT_RECEIVED event on successful mobile money payment
    if (mappedStatus === 'completed' && payment) {
      const { data: paymentData } = await adminClient
        .from('payments')
        .select('user_id')
        .eq('id', payment.id)
        .single();

      if (paymentData?.user_id) {
        emitEventAsync({
          type: 'PAYMENT_RECEIVED',
          data: {
            paymentId: payment.id,
            userId: paymentData.user_id,
            amount: amount || 0,
            currency: currency || 'USD',
            method: normalizedProvider,
          },
        });
      }
    }

    // Audit log
    await adminClient.from('audit_log').insert({
      action: 'webhook',
      entity_type: 'payment',
      entity_id: payment.id,
      details: {
        provider: normalizedProvider,
        reference,
        status: mappedStatus,
        original_status: status,
        amount,
        currency,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing mobile money callback:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
