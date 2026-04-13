import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { rateLimitAsync } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/service-requests
 * Farmer submits a service request to a provider.
 */
export async function POST(request: NextRequest) {
  // Rate limit
  const rlResponse = await rateLimitAsync(request);
  if (rlResponse) return rlResponse;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const {
    provider_id,
    request_type,
    subject,
    description,
    preferred_date,
    preferred_time,
    commodity,
    quantity,
    unit,
  } = body;

  // Validate required fields
  if (!provider_id || !subject) {
    return NextResponse.json(
      { error: 'provider_id and subject are required' },
      { status: 400 },
    );
  }

  // Verify provider exists and is listed
  const { data: provider, error: providerErr } = await supabase
    .from('service_providers')
    .select('id, business_name, profile_id, email')
    .eq('id', provider_id)
    .eq('is_listed', true)
    .single();

  if (providerErr || !provider) {
    return NextResponse.json(
      { error: 'Service provider not found or not currently listed' },
      { status: 404 },
    );
  }

  // Insert service request
  const { data: serviceRequest, error: insertErr } = await supabase
    .from('service_requests')
    .insert({
      farmer_id: user.id,
      provider_id,
      request_type: request_type || null,
      subject,
      description: description || null,
      preferred_date: preferred_date || null,
      preferred_time: preferred_time || null,
      commodity: commodity || null,
      quantity: quantity || null,
      unit: unit || null,
      status: 'pending',
    })
    .select('id')
    .single();

  if (insertErr) {
    console.error('Failed to create service request:', insertErr);
    return NextResponse.json(
      { error: 'Failed to create service request' },
      { status: 500 },
    );
  }

  // Send email notification to the provider
  const providerEmail = provider.email;
  if (providerEmail) {
    try {
      // Look up farmer name for the email
      const { data: farmerProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const farmerName = farmerProfile?.full_name || farmerProfile?.email || 'A farmer';

      await sendEmail(
        providerEmail,
        `New Service Request: ${subject}`,
        `
        <h2>New Service Request</h2>
        <p><strong>${farmerName}</strong> has submitted a service request to <strong>${provider.business_name}</strong>.</p>
        <table style="border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:4px 12px 4px 0;font-weight:600;">Subject:</td><td>${subject}</td></tr>
          ${request_type ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Type:</td><td>${request_type}</td></tr>` : ''}
          ${description ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Description:</td><td>${description}</td></tr>` : ''}
          ${preferred_date ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Preferred Date:</td><td>${preferred_date}</td></tr>` : ''}
          ${commodity ? `<tr><td style="padding:4px 12px 4px 0;font-weight:600;">Commodity:</td><td>${commodity}${quantity ? ` (${quantity} ${unit || ''})` : ''}</td></tr>` : ''}
        </table>
        <p>Log in to your dashboard to review and respond to this request.</p>
        `,
      );
    } catch (emailErr) {
      // Non-blocking — log but don't fail the request
      console.error('Failed to send provider notification email:', emailErr);
    }
  }

  return NextResponse.json({
    success: true,
    id: serviceRequest.id,
    message: 'Service request submitted successfully',
  });
}

/**
 * GET /api/service-requests
 * List service requests for the authenticated user (as farmer or provider).
 */
export async function GET(request: NextRequest) {
  const rlResponse = await rateLimitAsync(request);
  if (rlResponse) return rlResponse;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get provider IDs owned by this user
  const { data: myProviders } = await supabase
    .from('service_providers')
    .select('id')
    .eq('profile_id', user.id);

  const providerIds = (myProviders || []).map((p: any) => p.id);

  // Fetch requests where user is the farmer OR the provider
  let query = supabase
    .from('service_requests')
    .select(`
      *,
      provider:service_providers (
        id,
        business_name,
        email
      ),
      farmer:profiles!service_requests_farmer_id_fkey (
        id,
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (providerIds.length > 0) {
    // User is both a farmer and a provider — get both
    query = query.or(
      `farmer_id.eq.${user.id},provider_id.in.(${providerIds.join(',')})`,
    );
  } else {
    // User is only a farmer
    query = query.eq('farmer_id', user.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch service requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service requests' },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: data || [] });
}
