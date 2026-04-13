// ============================================================================
// Foober Pricing Engine
// Calculates delivery fees based on distance, vehicle type, and package size
// ============================================================================

export type VehicleType = 'bicycle' | 'motorcycle' | 'car' | 'van' | 'truck';
export type PackageSize = 'small' | 'medium' | 'large' | 'extra_large';

export interface PricingConfig {
  base_rate: number;
  per_km_rate: number;
  min_fee: number;
  platform_commission_pct: number;
}

// Default pricing (used when DB pricing not available)
const DEFAULT_PRICING: Record<VehicleType, PricingConfig> = {
  bicycle:    { base_rate: 1.00, per_km_rate: 0.10, min_fee: 2.00, platform_commission_pct: 0.15 },
  motorcycle: { base_rate: 2.00, per_km_rate: 0.15, min_fee: 3.00, platform_commission_pct: 0.15 },
  car:        { base_rate: 3.00, per_km_rate: 0.20, min_fee: 5.00, platform_commission_pct: 0.15 },
  van:        { base_rate: 4.00, per_km_rate: 0.30, min_fee: 8.00, platform_commission_pct: 0.15 },
  truck:      { base_rate: 5.00, per_km_rate: 0.50, min_fee: 12.00, platform_commission_pct: 0.15 },
};

const SIZE_MULTIPLIERS: Record<PackageSize, number> = {
  small: 1.0,
  medium: 1.2,
  large: 1.5,
  extra_large: 2.0,
};

export interface FooberEstimate {
  fee: number;
  platformCommission: number;
  driverPayout: number;
  distanceKm: number;
  vehicleType: VehicleType;
  packageSize: PackageSize;
  currency: string;
}

/**
 * Calculate delivery fee
 */
export function calculateFee(
  distanceKm: number,
  vehicleType: VehicleType = 'motorcycle',
  packageSize: PackageSize = 'medium',
  pricing?: PricingConfig,
): FooberEstimate {
  const config = pricing || DEFAULT_PRICING[vehicleType];
  const sizeMultiplier = SIZE_MULTIPLIERS[packageSize];

  const rawFee = (config.base_rate + (distanceKm * config.per_km_rate)) * sizeMultiplier;
  const fee = Math.max(config.min_fee, Math.round(rawFee * 100) / 100);
  const platformCommission = Math.round(fee * config.platform_commission_pct * 100) / 100;
  const driverPayout = Math.round((fee - platformCommission) * 100) / 100;

  return {
    fee,
    platformCommission,
    driverPayout,
    distanceKm,
    vehicleType,
    packageSize,
    currency: 'USD',
  };
}

/**
 * Estimate distance between two coordinates using Haversine formula
 * Returns distance in km
 */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Add 30% for road distance approximation
  return Math.round(R * c * 1.3 * 100) / 100;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Suggest vehicle type based on package size and weight
 */
export function suggestVehicle(packageSize: PackageSize, weightKg?: number): VehicleType {
  if (weightKg && weightKg > 500) return 'truck';
  if (weightKg && weightKg > 100) return 'van';
  if (packageSize === 'extra_large') return 'van';
  if (packageSize === 'large') return 'car';
  if (packageSize === 'small') return 'motorcycle';
  return 'motorcycle';
}
