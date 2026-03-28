// ============================================================================
// Farmer Progression Tier Configuration
// Defines the tier system, sidebar items, and helper functions
// ============================================================================

export const FARMER_TIERS = {
  seedling: {
    name: 'Seedling',
    emoji: '\u{1F331}',
    color: '#8CB89C',
    description: 'Getting started with AFU',
    features: ['overview', 'weather', 'market-prices', 'training', 'help'],
    requiredCourse: null, // unlocked by default
  },
  sprout: {
    name: 'Sprout',
    emoji: '\u{1F33F}',
    color: '#5DB347',
    description: 'Farm record keeping',
    features: ['journal', 'crops', 'calendar', 'cooperatives'],
    requiredCourse: 'farm-basics',
  },
  growth: {
    name: 'Growth',
    emoji: '\u{1F333}',
    color: '#449933',
    description: 'Financial tools',
    features: ['financing', 'insurance', 'payments', 'wallet', 'money'],
    requiredCourse: 'financial-literacy',
  },
  harvest: {
    name: 'Harvest',
    emoji: '\u{1F33E}',
    color: '#2D7A1E',
    description: 'Digital agriculture',
    features: ['ai-tools', 'doctor', 'scanner', 'sustainability', 'exports'],
    requiredCourse: 'digital-agriculture',
  },
  pioneer: {
    name: 'Pioneer',
    emoji: '\u{1F3C6}',
    color: '#1B5E14',
    description: 'Full platform access',
    features: ['marketplace', 'exchange', 'offtake', 'logistics', 'tokenize', 'staking'],
    requiredCourse: 'advanced-trading',
  },
} as const;

export type FarmerTier = keyof typeof FARMER_TIERS;

export const TIER_ORDER: FarmerTier[] = ['seedling', 'sprout', 'growth', 'harvest', 'pioneer'];

// All sidebar items with their tier requirements
export const FARM_SIDEBAR_ITEMS = [
  // Seedling tier (always visible)
  { href: '/farm', label: 'My Farm', icon: 'Home', tier: 'seedling' as FarmerTier },
  { href: '/farm/weather', label: 'Weather', icon: 'CloudSun', tier: 'seedling' as FarmerTier },
  { href: '/farm/market-prices', label: 'Market Prices', icon: 'BarChart3', tier: 'seedling' as FarmerTier },
  { href: '/farm/training', label: 'Training Hub', icon: 'GraduationCap', tier: 'seedling' as FarmerTier },

  // Sprout tier
  { href: '/farm/journal', label: 'Farm Journal', icon: 'BookOpen', tier: 'sprout' as FarmerTier },
  { href: '/farm/crops', label: 'My Crops', icon: 'Sprout', tier: 'sprout' as FarmerTier },
  { href: '/farm/cooperatives', label: 'Cooperatives', icon: 'UsersRound', tier: 'sprout' as FarmerTier },

  // Growth tier
  { href: '/farm/financing', label: 'Financing', icon: 'Wallet', tier: 'growth' as FarmerTier },
  { href: '/farm/insurance', label: 'Insurance', icon: 'Shield', tier: 'growth' as FarmerTier },
  { href: '/farm/payments', label: 'Payments', icon: 'CreditCard', tier: 'growth' as FarmerTier },
  { href: '/farm/trade-finance', label: 'Trade Finance', icon: 'Ship', tier: 'growth' as FarmerTier },
  { href: '/farm/legal', label: 'Legal Help', icon: 'Scale', tier: 'growth' as FarmerTier },
  { href: '/farm/vet', label: 'Vet Services', icon: 'Stethoscope', tier: 'growth' as FarmerTier },

  // Harvest tier
  { href: '/farm/ai-tools', label: 'AI Tools', icon: 'Brain', tier: 'harvest' as FarmerTier },
  { href: '/farm/doctor', label: 'Crop Doctor', icon: 'Camera', tier: 'harvest' as FarmerTier },
  { href: '/farm/sustainability', label: 'Sustainability', icon: 'Leaf', tier: 'harvest' as FarmerTier },
  { href: '/farm/exports', label: 'Exports', icon: 'Ship', tier: 'harvest' as FarmerTier },

  // Pioneer tier
  { href: '/farm/trade', label: 'Trading', icon: 'ArrowLeftRight', tier: 'pioneer' as FarmerTier },
  { href: '/farm/marketplace', label: 'Marketplace', icon: 'ShoppingBag', tier: 'pioneer' as FarmerTier },
  { href: '/farm/exchange', label: 'Exchange', icon: 'Coins', tier: 'pioneer' as FarmerTier },
  { href: '/farm/logistics', label: 'Logistics', icon: 'Truck', tier: 'pioneer' as FarmerTier },
  { href: '/farm/tokenize', label: 'Tokenize', icon: 'Coins', tier: 'pioneer' as FarmerTier },
];

/** Check if a required tier is unlocked given the user's current tier */
export function isTierUnlocked(currentTier: FarmerTier, requiredTier: FarmerTier): boolean {
  return TIER_ORDER.indexOf(currentTier) >= TIER_ORDER.indexOf(requiredTier);
}

/** Get the next tier after the current one, or null if at max */
export function getNextTier(currentTier: FarmerTier): FarmerTier | null {
  const idx = TIER_ORDER.indexOf(currentTier);
  return idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null;
}

/** Get tier index (0-based) */
export function getTierIndex(tier: FarmerTier): number {
  return TIER_ORDER.indexOf(tier);
}

/** Get progress percentage toward next tier (0-100) */
export function getTierProgress(currentTier: FarmerTier, totalXp: number): number {
  const xpPerTier = 100; // XP needed per tier
  const currentIdx = getTierIndex(currentTier);
  if (currentIdx >= TIER_ORDER.length - 1) return 100; // Pioneer = max
  const xpInCurrentTier = totalXp - currentIdx * xpPerTier;
  return Math.min(100, Math.max(0, Math.round((xpInCurrentTier / xpPerTier) * 100)));
}

/** Group sidebar items by tier */
export function getSidebarItemsByTier(): Record<FarmerTier, typeof FARM_SIDEBAR_ITEMS> {
  const grouped: Record<string, typeof FARM_SIDEBAR_ITEMS> = {};
  for (const tier of TIER_ORDER) {
    grouped[tier] = FARM_SIDEBAR_ITEMS.filter((item) => item.tier === tier);
  }
  return grouped as Record<FarmerTier, typeof FARM_SIDEBAR_ITEMS>;
}
