import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';

/**
 * PATCH /api/foober/status
 * Update delivery status (driver updates: picking_up, in_transit, delivered)
 */
export async function PATCH(request: NextRequest) {
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { deliveryId, status, photoProofUrl, lat, lng } = await request.json();
    if (!deliveryId || !status) {
      return NextResponse.json({ error: 'deliveryId and status required' }, { status: 400 });
    }

    const validStatuses = ['picking_up', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify user is the assigned driver (or admin)
    const { data: delivery } = await supabase
      .from('foober_deliveries')
      .select('*, driver:foober_drivers!driver_id(profile_id, full_name, id), requester:profiles!requester_id(full_name, email)')
      .eq('id', deliveryId)
      .single();

    if (!delivery) {
      return NextResponse.json({ error: 'Delivery not found' }, { status: 404 });
    }

    const driverProfileId = (delivery.driver as any)?.profile_id;
    const { data: userProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = userProfile?.role === 'admin' || userProfile?.role === 'super_admin';

    if (!isAdmin && driverProfileId !== user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    // Build update
    const update: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'picking_up') {
      update.pickup_time = new Date().toISOString();
    }
    if (status === 'delivered') {
      update.dropoff_time = new Date().toISOString();
      if (photoProofUrl) update.photo_proof_url = photoProofUrl;
    }

    const { error } = await supabase
      .from('foober_deliveries')
      .update(update)
      .eq('id', deliveryId);

    if (error) {
      return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
    }

    // Update driver location if provided
    if (lat && lng && delivery.driver) {
      await supabase
        .from('foober_drivers')
        .update({ current_latitude: lat, current_longitude: lng })
        .eq('id', (delivery.driver as any).id);
    }

    // On delivery: update driver stats
    if (status === 'delivered' && delivery.driver) {
      const driverId = (delivery.driver as any).id;
      // Update driver stats — direct update (no RPC needed)
      try {
        const { data: driverRecord } = await supabase
          .from('foober_drivers')
          .select('total_deliveries, total_earned')
          .eq('id', driverId)
          .single();
        if (driverRecord) {
          await supabase
            .from('foober_drivers')
            .update({
              total_deliveries: (driverRecord.total_deliveries || 0) + 1,
              total_earned: (driverRecord.total_earned || 0) + (delivery.driver_payout || 0),
            })
            .eq('id', driverId);
        }
      } catch { /* non-critical */ }
    }

    // Notify requester of status change
    const requester = delivery.requester as any;
    const statusMessages: Record<string, string> = {
      picking_up: `Driver is heading to pick up your delivery #${delivery.delivery_number}`,
      in_transit: `Your delivery #${delivery.delivery_number} is on its way!`,
      delivered: `Your delivery #${delivery.delivery_number} has been delivered!`,
      cancelled: `Delivery #${delivery.delivery_number} has been cancelled`,
    };

    await supabase.from('notifications').insert({
      user_id: delivery.requester_id,
      title: status === 'delivered' ? 'Delivery Complete' : 'Delivery Update',
      message: statusMessages[status] || `Delivery status: ${status}`,
      type: 'foober',
    });

    if (requester?.email && (status === 'delivered' || status === 'in_transit')) {
      await sendEmail(
        requester.email,
        `Foober: ${statusMessages[status]}`,
        `<p>${statusMessages[status]}</p>`
      ).catch(() => {});
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('[foober/status]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
