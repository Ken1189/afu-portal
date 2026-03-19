import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminClient } from '@/lib/supabase/server';

async function getAuthMember(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const adminClient = await createAdminClient();
  const { data: member } = await adminClient.from('members').select('id').eq('profile_id', user.id).single();
  return member ? { userId: user.id, memberId: member.id } : null;
}

/**
 * GET /api/payments
 * List payments for the authenticated member. Supports ?status= and ?purpose= filters.
 */
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const purpose = searchParams.get('purpose');

  const adminClient = await createAdminClient();
  let query = adminClient
    .from('payments')
    .select('*')
    .eq('member_id', auth.memberId)
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);
  if (purpose) query = query.eq('purpose', purpose);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ payments: data });
}

/**
 * POST /api/payments
 * Initiate a new payment.
 * Body: { amount, currency, method, provider, purpose, description, phoneNumber?,
 *         relatedEntityType?, relatedEntityId?, metadata? }
 */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const auth = await getAuthMember(supabase);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { amount, currency, method, provider, purpose, description, phoneNumber, relatedEntityType, relatedEntityId, metadata } = body as {
    amount: number;
    currency: string;
    method: string;
    provider: string;
    purpose: string;
    description?: string;
    phoneNumber?: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
    metadata?: Record<string, unknown>;
  };

  if (!amount || !currency || !method || !provider || !purpose) {
    return NextResponse.json(
      { error: 'Missing required fields: amount, currency, method, provider, purpose' },
      { status: 400 }
    );
  }

  const adminClient = await createAdminClient();

  // Get member's country for payment routing
  const { data: memberData } = await adminClient
    .from('members')
    .select('id, profile:profiles(country)')
    .eq('id', auth.memberId)
    .single();
  const profile = memberData?.profile as unknown as { country: string | null } | null;
  const memberCountry = profile?.country || 'BW';

  // Create payment record with pending status
  const { data: payment, error: paymentError } = await adminClient
    .from('payments')
    .insert({
      member_id: auth.memberId,
      amount,
      currency,
      method,
      provider,
      purpose,
      description: description || null,
      phone_number: phoneNumber || null,
      related_entity_type: relatedEntityType || null,
      related_entity_id: relatedEntityId || null,
      metadata: metadata || null,
      status: 'pending',
    })
    .select()
    .single();

  if (paymentError) {
    return NextResponse.json({ error: paymentError.message }, { status: 500 });
  }

  // Route the payment through the payment gateway
  let redirectUrl: string | undefined;
  let ussdCode: string | undefined;
  let message: string | undefined;

  try {
    const { routePayment } = await import('@/lib/payments/router');
    const gatewayResult = await routePayment(
      memberCountry,
      method as 'card' | 'mobile-money' | 'bank-transfer' | 'ussd',
      {
        amount,
        currency: currency as import('@/lib/payments/gateway').Currency,
        method: method as import('@/lib/payments/gateway').PaymentMethod,
        provider: provider as import('@/lib/payments/gateway').PaymentProvider,
        memberId: auth.memberId,
        description: description || '',
        phoneNumber: phoneNumber as string | undefined,
        metadata: metadata as Record<string, string> | undefined,
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://afu-portal.vercel.app'}/farm/payments`,
      }
    );

    redirectUrl = gatewayResult.redirectUrl;
    ussdCode = gatewayResult.ussdCode;
    message = gatewayResult.message;

    // Update payment with provider reference if returned
    if (gatewayResult.providerReference) {
      await adminClient
        .from('payments')
        .update({ provider_reference: gatewayResult.providerReference })
        .eq('id', payment.id);
    }
  } catch (err) {
    // Gateway routing failed — mark payment as failed
    await adminClient
      .from('payments')
      .update({ status: 'failed' })
      .eq('id', payment.id);

    return NextResponse.json(
      { error: 'Payment gateway error', details: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    );
  }

  // Create payment attempt record
  await adminClient.from('payment_attempts').insert({
    payment_id: payment.id,
    provider,
    method,
    amount,
    currency,
    status: 'pending',
  });

  // Audit log
  await adminClient.from('audit_log').insert({
    user_id: auth.userId,
    action: 'create',
    entity_type: 'payment',
    entity_id: payment.id,
    details: { amount, currency, method, provider, purpose },
  });

  return NextResponse.json(
    {
      payment,
      redirectUrl: redirectUrl || undefined,
      ussdCode: ussdCode || undefined,
      message: message || 'Payment initiated successfully',
    },
    { status: 201 }
  );
}
