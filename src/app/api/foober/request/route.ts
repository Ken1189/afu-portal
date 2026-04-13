import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { calculateFee, haversineDistance, suggestVehicle, type VehicleType, type PackageSize } from '@/lib/foober-pricing';
import { sendEmail } from '@/lib/email';

/**
 * POST /api/foober/request
 * Create a new delivery request (auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const authClient = await createServerSupabaseClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const {
      pickupAddress, pickupLat, pickupLng,
      dropoffAddress, dropoffLat, dropoffLng,
      description, packageSize, weightKg, vehicleType,
      orderId, notes,
    } = body;

    if (!pickupAddress || !dropoffAddress) {
      return NextResponse.json({ error: 'Pickup and dropoff addresses are required' }, { status: 400 });
    }

    // Calculate distance and fee
    let distanceKm = 10; // default 10km if no coordinates
    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
      distanceKm = haversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    }

    const size: PackageSize = packageSize || 'medium';
    const vehicle: VehicleType = vehicleType || suggestVehicle(size, weightKg);
    const estimate = calculateFee(distanceKm, vehicle, size);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Generate delivery number
    const { data: deliveryNumber } = await supabase.rpc('generate_foober_delivery_number');
    const number = deliveryNumber || `FOO-${Date.now()}`;

    // Create delivery record
    const { data: delivery, error } = await supabase
      .from('foober_deliveries')
      .insert({
        delivery_number: number,
        requester_id: user.id,
        status: 'requested',
        pickup_address: pickupAddress,
        pickup_lat: pickupLat || null,
        pickup_lng: pickupLng || null,
        dropoff_address: dropoffAddress,
        dropoff_lat: dropoffLat || null,
        dropoff_lng: dropoffLng || null,
        distance_km: distanceKm,
        description: description || null,
        package_size: size,
        weight_kg: weightKg || null,
        fee: estimate.fee,
        currency: estimate.currency,
        platform_commission: estimate.platformCommission,
        driver_payout: estimate.driverPayout,
        order_id: orderId || null,
        notes: notes || null,
      })
      .select('*')
      .single();

    if (error) {
      console.error('[foober/request]', error);
      return NextResponse.json({ error: 'Failed to create delivery request' }, { status: 500 });
    }

    // Notify available drivers in the area (simplified: notify all active drivers in same country)
    const { data: profile } = await supabase.from('profiles').select('country').eq('id', user.id).single();
    const country = profile?.country;

    if (country) {
      const { data: drivers } = await supabase
        .from('foober_drivers')
        .select('profile_id, email, full_name')
        .eq('status', 'active')
        .eq('is_available', true)
        .eq('country', country)
        .limit(20);

      if (drivers) {
        for (const driver of drivers) {
          // In-app notification
          await supabase.from('notifications').insert({
            user_id: driver.profile_id,
            title: 'New Delivery Request',
            message: `${pickupAddress} → ${dropoffAddress} — $${estimate.fee.toFixed(2)}`,
            type: 'foober',
            link: '/driver/deliveries',
          });

          // Email
          if (driver.email) {
            await sendEmail(
              driver.email,
              `Foober: New delivery — $${estimate.fee.toFixed(2)}`,
              `<p>Hi ${driver.full_name}, a new delivery request is available:</p>
               <p><strong>From:</strong> ${pickupAddress}<br>
               <strong>To:</strong> ${dropoffAddress}<br>
               <strong>Fee:</strong> $${estimate.fee.toFixed(2)} (you earn $${estimate.driverPayout.toFixed(2)})<br>
               <strong>Distance:</strong> ${distanceKm.toFixed(1)} km</p>
               <p><a href="https://www.africanfarmingunion.org/driver/deliveries">Accept this delivery</a></p>`
            ).catch(() => {});
          }
        }
      }
    }

    return NextResponse.json({ success: true, delivery });
  } catch (error) {
    console.error('[foober/request]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
