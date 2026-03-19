export type BadgeCategory = 'onboarding' | 'farming' | 'financial' | 'education' | 'community' | 'marketplace';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  points: number;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Badge Definitions                                                   */
/* ------------------------------------------------------------------ */

export const badges: Badge[] = [
  // Onboarding
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete the onboarding process and join the AFU community.',
    icon: '👣',
    category: 'onboarding',
    rarity: 'common',
    requirement: 'Complete onboarding',
    points: 10,
  },
  {
    id: 'profile-perfect',
    name: 'Profile Perfect',
    description: 'Fill out every section of your farmer profile to 100%.',
    icon: '✨',
    category: 'onboarding',
    rarity: 'common',
    requirement: '100% profile completion',
    points: 15,
  },
  {
    id: 'verified-farmer',
    name: 'Verified Farmer',
    description: 'Complete KYC verification and become a trusted member.',
    icon: '🛡️',
    category: 'onboarding',
    rarity: 'uncommon',
    requirement: 'Complete KYC verification',
    points: 25,
  },

  // Farming
  {
    id: 'green-thumb',
    name: 'Green Thumb',
    description: 'Create your first farm plot and start your digital farming journey.',
    icon: '🌱',
    category: 'farming',
    rarity: 'common',
    requirement: 'Create first farm plot',
    points: 10,
  },
  {
    id: 'harvest-hero',
    name: 'Harvest Hero',
    description: 'Successfully complete your first harvest cycle.',
    icon: '🌾',
    category: 'farming',
    rarity: 'uncommon',
    requirement: 'Complete first harvest',
    points: 25,
  },
  {
    id: 'master-grower',
    name: 'Master Grower',
    description: 'Manage 5 or more active farm plots simultaneously.',
    icon: '🏕️',
    category: 'farming',
    rarity: 'rare',
    requirement: '5+ active plots',
    points: 50,
  },
  {
    id: 'soil-guardian',
    name: 'Soil Guardian',
    description: 'Achieve a soil health score above 90 on every one of your plots.',
    icon: '🌍',
    category: 'farming',
    rarity: 'epic',
    requirement: 'Health score > 90 on all plots',
    points: 100,
  },

  // Financial
  {
    id: 'first-payment',
    name: 'First Payment',
    description: 'Complete your first payment through the AFU platform.',
    icon: '💳',
    category: 'financial',
    rarity: 'common',
    requirement: 'Complete first payment',
    points: 10,
  },
  {
    id: 'perfect-record',
    name: 'Perfect Record',
    description: 'Maintain a flawless repayment history with 100% on-time payments.',
    icon: '📊',
    category: 'financial',
    rarity: 'rare',
    requirement: '100% on-time loan repayments',
    points: 75,
  },
  {
    id: 'credit-champion',
    name: 'Credit Champion',
    description: 'Achieve an exceptional credit score above 800.',
    icon: '👑',
    category: 'financial',
    rarity: 'legendary',
    requirement: 'Credit score > 800',
    points: 200,
  },
  {
    id: 'insured-farmer',
    name: 'Insured Farmer',
    description: 'Protect your farm by purchasing your first insurance policy.',
    icon: '☂️',
    category: 'financial',
    rarity: 'uncommon',
    requirement: 'Purchase first insurance policy',
    points: 20,
  },

  // Education
  {
    id: 'knowledge-seeker',
    name: 'Knowledge Seeker',
    description: 'Enroll in your first training course on the platform.',
    icon: '📖',
    category: 'education',
    rarity: 'common',
    requirement: 'Enroll in first course',
    points: 10,
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'Complete 3 training courses and broaden your expertise.',
    icon: '🎓',
    category: 'education',
    rarity: 'uncommon',
    requirement: 'Complete 3 courses',
    points: 30,
  },
  {
    id: 'expert-farmer',
    name: 'Expert Farmer',
    description: 'Complete 10 courses and become a true agricultural expert.',
    icon: '🧠',
    category: 'education',
    rarity: 'rare',
    requirement: 'Complete 10 courses',
    points: 75,
  },
  {
    id: 'certified-pro',
    name: 'Certified Pro',
    description: 'Earn an official certification from the AFU training program.',
    icon: '🏅',
    category: 'education',
    rarity: 'epic',
    requirement: 'Earn a certification',
    points: 100,
  },

  // Community
  {
    id: 'team-player',
    name: 'Team Player',
    description: 'Join a cooperative and start collaborating with fellow farmers.',
    icon: '🤝',
    category: 'community',
    rarity: 'common',
    requirement: 'Join a cooperative',
    points: 10,
  },
  {
    id: 'referral-champion',
    name: 'Referral Champion',
    description: 'Refer 5 or more farmers to join the AFU platform.',
    icon: '📣',
    category: 'community',
    rarity: 'uncommon',
    requirement: '5+ referrals',
    points: 30,
  },
  {
    id: 'community-leader',
    name: 'Community Leader',
    description: 'Become an officer in your cooperative and lead your community.',
    icon: '🏛️',
    category: 'community',
    rarity: 'rare',
    requirement: 'Become a cooperative officer',
    points: 50,
  },

  // Marketplace
  {
    id: 'first-purchase',
    name: 'First Purchase',
    description: 'Buy your first product from the AFU marketplace.',
    icon: '🛒',
    category: 'marketplace',
    rarity: 'common',
    requirement: 'Buy first product',
    points: 10,
  },
  {
    id: 'export-ready',
    name: 'Export Ready',
    description: 'Complete your first export transaction through the platform.',
    icon: '🚢',
    category: 'marketplace',
    rarity: 'rare',
    requirement: 'Complete first export',
    points: 50,
  },
  {
    id: 'market-maven',
    name: 'Market Maven',
    description: 'Complete 10 or more marketplace transactions like a pro.',
    icon: '💎',
    category: 'marketplace',
    rarity: 'epic',
    requirement: '10+ marketplace transactions',
    points: 75,
  },
];

/* ------------------------------------------------------------------ */
/*  Mock Earned Badges (demo user)                                      */
/* ------------------------------------------------------------------ */

export const earnedBadges: EarnedBadge[] = [
  { badgeId: 'first-steps', earnedAt: '2025-09-15T10:30:00Z' },
  { badgeId: 'profile-perfect', earnedAt: '2025-09-18T14:22:00Z' },
  { badgeId: 'verified-farmer', earnedAt: '2025-10-02T09:15:00Z' },
  { badgeId: 'green-thumb', earnedAt: '2025-10-10T11:45:00Z' },
  { badgeId: 'first-payment', earnedAt: '2025-11-05T16:30:00Z' },
  { badgeId: 'knowledge-seeker', earnedAt: '2025-11-20T08:00:00Z' },
  { badgeId: 'team-player', earnedAt: '2025-12-01T13:10:00Z' },
  { badgeId: 'first-purchase', earnedAt: '2026-01-14T10:55:00Z' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

export const rarityColors: Record<BadgeRarity, string> = {
  common: '#6B7280',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

export const categoryLabels: Record<BadgeCategory, string> = {
  onboarding: 'Onboarding',
  farming: 'Farming',
  financial: 'Financial',
  education: 'Education',
  community: 'Community',
  marketplace: 'Marketplace',
};
