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
    emoji: '\u{1F33E}',
    color: '#449933',
    description: 'Financial tools',
    features: ['financing', 'insurance', 'payments', 'wallet', 'money', 'warehouse'],
    requiredCourse: 'financial-literacy',
  },
  harvest: {
    name: 'Harvest',
    emoji: '\u{1F33B}',
    color: '#2D7A1E',
    description: 'Digital agriculture',
    features: ['ai-tools', 'doctor', 'scanner', 'sustainability', 'exports'],
    requiredCourse: 'digital-agriculture',
  },
  pioneer: {
    name: 'Pioneer',
    emoji: '\u{2B50}',
    color: '#1B5E14',
    description: 'Full platform access',
    features: ['marketplace', 'exchange', 'offtake', 'logistics', 'tokenize', 'staking'],
    requiredCourse: 'advanced-trading',
  },
} as const;

export type FarmerTier = keyof typeof FARMER_TIERS;

export const TIER_ORDER: FarmerTier[] = ['seedling', 'sprout', 'growth', 'harvest', 'pioneer'];

// All sidebar items with their tier requirements
// NOTE: Keep sidebar simple — only show core working features.
// Everything else goes under "Coming Soon" (/farm/coming-soon)
export const FARM_SIDEBAR_ITEMS = [
  // Core — always visible, these features work today
  { href: '/farm', label: 'My Farm', icon: 'Home', tier: 'seedling' as FarmerTier },
  { href: '/farm/weather', label: 'Weather', icon: 'CloudSun', tier: 'seedling' as FarmerTier },
  { href: '/farm/market-prices', label: 'Market Prices', icon: 'BarChart3', tier: 'seedling' as FarmerTier },
  { href: '/farm/training', label: 'Training Hub', icon: 'GraduationCap', tier: 'seedling' as FarmerTier },

  // Farm Management — working features
  { href: '/farm/farms', label: 'My Farms', icon: 'Tractor', tier: 'sprout' as FarmerTier, group: 'Farm Management' },
  { href: '/farm/crops', label: 'My Crops', icon: 'Sprout', tier: 'sprout' as FarmerTier, group: 'Farm Management' },
  { href: '/farm/journal', label: 'Farm Journal', icon: 'BookOpen', tier: 'sprout' as FarmerTier, group: 'Farm Management' },
  { href: '/farm/doctor', label: 'Crop Doctor', icon: 'Camera', tier: 'sprout' as FarmerTier, group: 'Farm Management' },

  // Finance — working features
  { href: '/farm/financing', label: 'Financing', icon: 'Wallet', tier: 'growth' as FarmerTier, group: 'Finance' },
  { href: '/farm/money', label: 'Money', icon: 'CreditCard', tier: 'growth' as FarmerTier, group: 'Finance' },

  // Coming Soon — single link to the full roadmap
  { href: '/farm/coming-soon', label: 'Coming Soon', icon: 'Zap', tier: 'seedling' as FarmerTier, group: 'More' },
];

// Features listed on the Coming Soon page (not in sidebar)
export const COMING_SOON_FEATURES = [
  { label: 'Agriculture', icon: 'Wheat', description: 'Detailed crop management and precision agriculture tools', href: '/farm/agriculture' },
  { label: 'Forestry', icon: 'TreePine', description: 'Timber tracking, agroforestry management, and carbon measurement', href: '/farm/forestry' },
  { label: 'Game Farming', icon: 'Rabbit', description: 'Wildlife management, breeding records, and conservation tracking', href: '/farm/game-farming' },
  { label: 'Cooperatives', icon: 'UsersRound', description: 'Join and manage cooperative memberships and group orders', href: '/farm/cooperatives' },
  { label: 'Orders', icon: 'ShoppingBag', description: 'Track your input orders and delivery status', href: '/farm/orders' },
  { label: 'Insurance', icon: 'Shield', description: 'Crop, livestock, and farm insurance with parametric options', href: '/farm/insurance' },
  { label: 'Payments', icon: 'CreditCard', description: 'Digital payments, mobile money, and payment history', href: '/farm/payments' },
  { label: 'Trade Finance', icon: 'Ship', description: 'Pre-export and post-harvest trade financing', href: '/farm/trade-finance' },
  { label: 'Legal Help', icon: 'Scale', description: 'Legal assistance for contracts, land rights, and disputes', href: '/farm/legal' },
  { label: 'Vet Services', icon: 'Stethoscope', description: 'On-demand veterinary consultations and livestock health', href: '/farm/vet' },
  { label: 'Warehouse', icon: 'Warehouse', description: 'Warehouse receipts and inventory management', href: '/farm/warehouse' },
  { label: 'AI Tools', icon: 'Brain', description: 'AI-powered farm recommendations and yield predictions', href: '/farm/ai-tools' },
  { label: 'Sustainability', icon: 'Leaf', description: 'Carbon credit tracking and sustainable farming practices', href: '/farm/sustainability' },
  { label: 'Exports', icon: 'Ship', description: 'Export documentation, compliance, and logistics', href: '/farm/exports' },
  { label: 'Marketplace', icon: 'ShoppingBag', description: 'Buy and sell agricultural products and equipment', href: '/farm/marketplace' },
  { label: 'Exchange', icon: 'Coins', description: 'Credit-based exchange for farming goods and services', href: '/farm/exchange' },
  { label: 'Trading', icon: 'ArrowLeftRight', description: 'Commodity trading with live prices and order matching', href: '/farm/trade' },
  { label: 'Off-take Contracts', icon: 'Handshake', description: 'Secure forward contracts and off-take agreements', href: '/farm/offtake' },
  { label: 'Logistics', icon: 'Truck', description: 'Transport coordination and delivery tracking', href: '/farm/logistics' },
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
