/**
 * Ad Package Definitions & Pricing Logic
 */

export interface AdPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  maxImpressions: number;
  allowedTypes: string[];
  maxPlacements: number;
  durationDays: number;
  countryTier?: string;
  includesNewsletter: boolean;
  includesPush: boolean;
}

export const COUNTRY_TIERS: Record<string, { tier: string; name: string }> = {
  KE: { tier: 'tier_1', name: 'Kenya' },
  ZA: { tier: 'tier_1', name: 'South Africa' },
  NG: { tier: 'tier_1', name: 'Nigeria' },
  GH: { tier: 'tier_1', name: 'Ghana' },
  ZW: { tier: 'tier_2', name: 'Zimbabwe' },
  UG: { tier: 'tier_2', name: 'Uganda' },
  TZ: { tier: 'tier_2', name: 'Tanzania' },
  BW: { tier: 'tier_2', name: 'Botswana' },
  RW: { tier: 'tier_2', name: 'Rwanda' },
  MZ: { tier: 'tier_2', name: 'Mozambique' },
  EG: { tier: 'tier_3', name: 'Egypt' },
  ET: { tier: 'tier_3', name: 'Ethiopia' },
  MW: { tier: 'tier_3', name: 'Malawi' },
  NA: { tier: 'tier_3', name: 'Namibia' },
  SL: { tier: 'tier_3', name: 'Sierra Leone' },
  GN: { tier: 'tier_3', name: 'Guinea' },
  GW: { tier: 'tier_3', name: 'Guinea-Bissau' },
  LR: { tier: 'tier_3', name: 'Liberia' },
  ML: { tier: 'tier_3', name: 'Mali' },
  CI: { tier: 'tier_3', name: 'Ivory Coast' },
};

export const PLACEMENT_TYPES = [
  'banner',
  'featured-product',
  'sponsored-content',
  'sidebar',
] as const;

export const PLACEMENT_PAGES = [
  'homepage',
  'dashboard',
  'marketplace',
  'farm-portal',
  'training',
  'insurance',
  'financing',
  'country-page',
  'services',
] as const;

export const SUPPLIER_CATEGORIES = [
  'seeds',
  'fertiliser',
  'equipment',
  'processing',
  'transport',
  'finance',
  'insurance',
  'veterinary',
  'legal',
  'technology',
  'storage',
  'packaging',
] as const;

export const SEASONS = ['planting', 'growing', 'harvest', 'off-season'] as const;

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
}

export function getCountryTier(countryCode: string): string {
  return COUNTRY_TIERS[countryCode]?.tier || 'tier_3';
}

export function getCountriesByTier(tier: string): string[] {
  return Object.entries(COUNTRY_TIERS)
    .filter(([, v]) => v.tier === tier)
    .map(([code]) => code);
}
