// Tier feature gating — controls what each membership tier can access
// Tiers: free, smallholder, commercial, enterprise, partner

export type FeatureKey =
  | 'crops' | 'livestock' | 'weather' | 'journal'
  | 'marketplace' | 'marketplace_sell'
  | 'training' | 'training_premium'
  | 'insurance' | 'insurance_claim'
  | 'financing' | 'trade_finance'
  | 'equipment' | 'equipment_booking'
  | 'cooperatives' | 'cooperatives_create'
  | 'exports' | 'exchange' | 'trade'
  | 'ai_tools' | 'carbon_credits'
  | 'warehouse' | 'market_prices'
  | 'money' | 'payments'
  | 'agriculture' | 'forestry' | 'game_farming';

export type TierName = 'free' | 'smallholder' | 'commercial' | 'enterprise' | 'partner';

const TIER_FEATURES: Record<TierName, FeatureKey[]> = {
  free: [
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'training', 'market_prices',
    'cooperatives', 'money', 'payments',
    'agriculture',
  ],
  smallholder: [
    // Everything in free, plus:
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'marketplace_sell', 'training',
    'insurance', 'financing', 'equipment',
    'cooperatives', 'market_prices',
    'money', 'payments', 'ai_tools',
    'agriculture', 'forestry', 'game_farming',
  ],
  commercial: [
    // Everything in smallholder, plus:
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'marketplace_sell', 'training', 'training_premium',
    'insurance', 'insurance_claim', 'financing', 'trade_finance',
    'equipment', 'equipment_booking',
    'cooperatives', 'cooperatives_create',
    'exports', 'exchange', 'trade',
    'ai_tools', 'carbon_credits',
    'warehouse', 'market_prices',
    'money', 'payments',
    'agriculture', 'forestry', 'game_farming',
  ],
  enterprise: [
    // Everything — full access
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'marketplace_sell', 'training', 'training_premium',
    'insurance', 'insurance_claim', 'financing', 'trade_finance',
    'equipment', 'equipment_booking',
    'cooperatives', 'cooperatives_create',
    'exports', 'exchange', 'trade',
    'ai_tools', 'carbon_credits',
    'warehouse', 'market_prices',
    'money', 'payments',
    'agriculture', 'forestry', 'game_farming',
  ],
  partner: [
    // Full access (suppliers/partners)
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'marketplace_sell', 'training', 'training_premium',
    'insurance', 'insurance_claim', 'financing', 'trade_finance',
    'equipment', 'equipment_booking',
    'cooperatives', 'cooperatives_create',
    'exports', 'exchange', 'trade',
    'ai_tools', 'carbon_credits',
    'warehouse', 'market_prices',
    'money', 'payments',
    'agriculture', 'forestry', 'game_farming',
  ],
};

// Map legacy / alternate DB tier names to canonical tier names
const TIER_ALIASES: Record<string, TierName> = {
  'student': 'free',
  'new_enterprise': 'enterprise',
  'farmer_grower': 'smallholder',
  'bronze': 'commercial',
  'gold': 'enterprise',
  'platinum': 'enterprise',
};

export function hasFeatureAccess(tier: string | null | undefined, feature: FeatureKey): boolean {
  const normalizedTier = TIER_ALIASES[tier?.toLowerCase() || ''] || (tier || 'free').toLowerCase() as TierName;
  const features = TIER_FEATURES[normalizedTier] || TIER_FEATURES.free;
  return features.includes(feature);
}

export function getTierName(tier: string | null | undefined): string {
  const map: Record<string, string> = {
    free: 'Free',
    smallholder: 'Smallholder',
    commercial: 'Commercial',
    enterprise: 'Enterprise',
    partner: 'Partner',
  };
  const normalized = TIER_ALIASES[tier?.toLowerCase() || ''] || (tier || 'free').toLowerCase();
  return map[normalized] || 'Free';
}

export function getUpgradeTier(currentTier: string | null | undefined): TierName | null {
  const order: TierName[] = ['free', 'smallholder', 'commercial', 'enterprise'];
  const normalized = TIER_ALIASES[currentTier?.toLowerCase() || ''] || (currentTier || 'free').toLowerCase() as TierName;
  const idx = order.indexOf(normalized);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}
