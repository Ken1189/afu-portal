import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/foober/accept
 * Driver accepts a delivery request
 */
export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { deliveryId } = await request.json();
    if (!deliveryId) {
      return NextResponse.json({ error: 'deliveryId required' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user is an active driver
    const { data: driver } = await supabase
      .from('foober_drivers')
      .select('id, full_name, phone')
      .eq('profile_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!driver) {
      return NextResponse.json({ error: 'You are not an active driver' }, { status: 403 });
    }

    // Check delivery is still available
    const { data: delivery } = await supabase
      .from('foober_deliveries')
      .select('*, requester:profiles!requester_id(full_name, email)')
      .eq('id', deliveryId)
      .eq('status', 'requested')
      .maybeSingle();

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery is no longer available' }, { status: 409 });
    }

    // Assign driver
    const { error } = await supabase
      .from('foober_deliveries')
      .update({
        driver_id: driver.id,
        status: 'accepted',
        updated_at: new Date().toISOString(),
      })
      .eq('id', deliveryId);

    if (error) {
      return NextResponse.json({ error: 'Failed to accept delivery' }, { status: 500 });
    }

    // Notify requester
    const requester = delivery.requester as any;
    if (requester?.email) {
      await sendEmail(
        requester.email,
        `Foober: Driver accepted your delivery #${delivery.delivery_number}`,
        `<p>Hi ${requester.full_name || 'there'},</p>
         <p>Great news! <strong>${driver.full_name}</strong> has accepted your delivery request.</p>
         <p><strong>Delivery #:</strong> ${delivery.delivery_number}<br>
         <strong>Driver phone:</strong> ${driver.phone || 'N/A'}<br>
         <strong>From:</strong> ${delivery.pickup_address}<br>
         <strong>To:</strong> ${delivery.dropoff_address}</p>
         <p>Track your delivery at <a href="https://www.africanfarmingunion.org/foober/track/${delivery.delivery_number}">africanfarmingunion.org</a></p>`
      ).catch(() => {});
    }

    // In-app notification to requester
    await supabase.from('notifications').insert({
      user_id: delivery.requester_id,
      title: 'Driver Accepted',
      message: `${driver.full_name} is on the way to pick up your delivery #${delivery.delivery_number}`,
      type: 'foober',
      link: `/foober/track/${delivery.delivery_number}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[foober/accept]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
