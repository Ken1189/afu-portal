import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { emitEventAsync } from '@/lib/events/event-bus';
import '@/lib/events/handlers';

interface MpesaStkCallback {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResultCode: number;
  ResultDesc: string;
  CallbackMetadata?: {
    Item: Array<{ Name: string; Value: string | number }>;
  };
}

interface MpesaCallbackBody {
  Body: {
    stkCallback: MpesaStkCallback;
  };
}

/**
 * POST /api/payments/webhook/mpesa
 * M-Pesa STK Push callback handler. No auth required.
 */
export async function POST(request: NextRequest) {
  let body: MpesaCallbackBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const callback = body?.Body?.stkCallback;
  if (!callback) {
    return NextResponse.json({ error: 'Invalid M-Pesa callback format' }, { status: 400 });
  }

  const { CheckoutRequestID, ResultCode, ResultDesc } = callback;

  if (!CheckoutRequestID) {
    return NextResponse.json({ error: 'Missing CheckoutRequestID' }, { status: 400 });
  }

  const adminClient = await createAdminClient();
  const isSuccess = ResultCode === 0;
  const newStatus = isSuccess ? 'completed' : 'failed';

  try {
    // Update payment by matching provider_reference = CheckoutRequestID
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .update({
        status: newStatus,
        failure_reason: isSuccess ? null : ResultDesc,
      })
      .eq('provider_reference', CheckoutRequestID)
      .select('id')
      .single();

    if (paymentError || !payment) {
      console.error('M-Pesa callback: payment not found for CheckoutRequestID', CheckoutRequestID);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Update payment attempt
    await adminClient
      .from('payment_attempts')
      .update({
        status: newStatus,
        provider_response: callback,
      })
      .eq('payment_id', payment.id)
      .eq('status', 'pending');

    // S2.7: Emit PAYMENT_RECEIVED event on successful M-Pesa payment
    if (isSuccess && payment) {
      // Look up user from payment record
      const { data: paymentData } = await adminClient
        .from('payments')
        .select('user_id, amount, currency')
        .eq('id', payment.id)
        .single();

      if (paymentData?.user_id) {
        emitEventAsync({
          type: 'PAYMENT_RECEIVED',
          data: {
            paymentId: payment.id,
            userId: paymentData.user_id,
            amount: Number(paymentData.amount),
            currency: paymentData.currency || 'KES',
            method: 'mpesa',
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
        provider: 'mpesa',
        result_code: ResultCode,
        result_desc: ResultDesc,
        checkout_request_id: CheckoutRequestID,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing M-Pesa callback:', err);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}
