import { NextRequest, NextResponse } from 'next/server';
import { calculateFee, haversineDistance, suggestVehicle, type VehicleType, type PackageSize } from '@/lib/foober-pricing';

/**
 * POST /api/foober/estimate
 * Get a price estimate for a delivery (no auth required)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      pickupLat, pickupLng, dropoffLat, dropoffLng,
      distanceKm: providedDistance,
      vehicleType, packageSize, weightKg,
    } = body as {
      pickupLat?: number; pickupLng?: number;
      dropoffLat?: number; dropoffLng?: number;
      distanceKm?: number;
      vehicleType?: VehicleType;
      packageSize?: PackageSize;
      weightKg?: number;
    };

    // Calculate distance from coordinates or use provided distance
    let distance = providedDistance || 0;
    if (!distance && pickupLat && pickupLng && dropoffLat && dropoffLng) {
      distance = haversineDistance(pickupLat, pickupLng, dropoffLat, dropoffLng);
    }

    if (!distance || distance <= 0) {
      return NextResponse.json({ error: 'Distance required (provide coordinates or distanceKm)' }, { status: 400 });
    }

    const size: PackageSize = packageSize || 'medium';
    const vehicle: VehicleType = vehicleType || suggestVehicle(size, weightKg);

    const estimate = calculateFee(distance, vehicle, size);

    return NextResponse.json({
      ...estimate,
      suggestedVehicle: vehicle,
    });
  } catch (error) {
    console.error('[foober/estimate]', error);
    return NextResponse.json({ error: 'Failed to calculate estimate' }, { status: 500 });
  }
}
