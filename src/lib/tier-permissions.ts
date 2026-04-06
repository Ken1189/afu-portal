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
  | 'money' | 'payments';

export type TierName = 'free' | 'smallholder' | 'commercial' | 'enterprise' | 'partner';

const TIER_FEATURES: Record<TierName, FeatureKey[]> = {
  free: [
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'training', 'market_prices',
    'cooperatives', 'money', 'payments',
  ],
  smallholder: [
    // Everything in free, plus:
    'crops', 'livestock', 'weather', 'journal',
    'marketplace', 'marketplace_sell', 'training',
    'insurance', 'financing', 'equipment',
    'cooperatives', 'market_prices',
    'money', 'payments', 'ai_tools',
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
  ],
};

export function hasFeatureAccess(tier: string | null | undefined, feature: FeatureKey): boolean {
  const normalizedTier = (tier || 'free').toLowerCase() as TierName;
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
  return map[(tier || 'free').toLowerCase()] || 'Free';
}

export function getUpgradeTier(currentTier: string | null | undefined): TierName | null {
  const order: TierName[] = ['free', 'smallholder', 'commercial', 'enterprise'];
  const current = (currentTier || 'free').toLowerCase() as TierName;
  const idx = order.indexOf(current);
  if (idx < 0 || idx >= order.length - 1) return null;
  return order[idx + 1];
}
