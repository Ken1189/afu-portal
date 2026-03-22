import { describe, it, expect } from 'vitest';
import {
  FARMER_TIERS,
  TIER_ORDER,
  FARM_SIDEBAR_ITEMS,
  isTierUnlocked,
  getNextTier,
  getTierIndex,
  getTierProgress,
  getSidebarItemsByTier,
} from '@/lib/farmer-tiers';

describe('FARMER_TIERS constants', () => {
  it('has five tiers defined', () => {
    expect(Object.keys(FARMER_TIERS)).toHaveLength(5);
  });

  it('TIER_ORDER matches FARMER_TIERS keys', () => {
    expect(TIER_ORDER).toEqual(Object.keys(FARMER_TIERS));
  });

  it('seedling tier has no requiredCourse (always unlocked)', () => {
    expect(FARMER_TIERS.seedling.requiredCourse).toBeNull();
  });

  it('every non-seedling tier has a requiredCourse', () => {
    for (const tier of TIER_ORDER.slice(1)) {
      expect(FARMER_TIERS[tier].requiredCourse).toBeTruthy();
    }
  });
});

describe('isTierUnlocked', () => {
  it('seedling unlocks seedling', () => {
    expect(isTierUnlocked('seedling', 'seedling')).toBe(true);
  });

  it('seedling does NOT unlock sprout', () => {
    expect(isTierUnlocked('seedling', 'sprout')).toBe(false);
  });

  it('pioneer unlocks all tiers', () => {
    for (const tier of TIER_ORDER) {
      expect(isTierUnlocked('pioneer', tier)).toBe(true);
    }
  });

  it('growth unlocks seedling and sprout but not harvest', () => {
    expect(isTierUnlocked('growth', 'seedling')).toBe(true);
    expect(isTierUnlocked('growth', 'sprout')).toBe(true);
    expect(isTierUnlocked('growth', 'growth')).toBe(true);
    expect(isTierUnlocked('growth', 'harvest')).toBe(false);
  });
});

describe('getNextTier', () => {
  it('returns sprout after seedling', () => {
    expect(getNextTier('seedling')).toBe('sprout');
  });

  it('returns null for pioneer (max tier)', () => {
    expect(getNextTier('pioneer')).toBeNull();
  });

  it('returns harvest after growth', () => {
    expect(getNextTier('growth')).toBe('harvest');
  });
});

describe('getTierIndex', () => {
  it('seedling is index 0', () => {
    expect(getTierIndex('seedling')).toBe(0);
  });

  it('pioneer is index 4', () => {
    expect(getTierIndex('pioneer')).toBe(4);
  });
});

describe('getTierProgress', () => {
  it('pioneer always returns 100', () => {
    expect(getTierProgress('pioneer', 999)).toBe(100);
  });

  it('returns 0 when xp is exactly at tier boundary', () => {
    // seedling is tier 0, xpPerTier = 100, so xp = 0 means 0% progress
    expect(getTierProgress('seedling', 0)).toBe(0);
  });

  it('returns 50 when halfway through a tier', () => {
    // seedling (idx 0): xpInCurrentTier = 50 - 0*100 = 50, progress = 50/100*100 = 50
    expect(getTierProgress('seedling', 50)).toBe(50);
  });

  it('clamps to 100 when xp exceeds tier threshold', () => {
    expect(getTierProgress('seedling', 200)).toBe(100);
  });

  it('clamps to 0 for negative xp in tier', () => {
    // sprout (idx 1): xpInCurrentTier = 50 - 1*100 = -50, should clamp to 0
    expect(getTierProgress('sprout', 50)).toBe(0);
  });
});

describe('getSidebarItemsByTier', () => {
  it('returns a record keyed by each tier', () => {
    const grouped = getSidebarItemsByTier();
    for (const tier of TIER_ORDER) {
      expect(grouped[tier]).toBeDefined();
      expect(Array.isArray(grouped[tier])).toBe(true);
    }
  });

  it('seedling group contains expected items', () => {
    const grouped = getSidebarItemsByTier();
    const seedlingHrefs = grouped.seedling.map((item) => item.href);
    expect(seedlingHrefs).toContain('/farm');
    expect(seedlingHrefs).toContain('/farm/weather');
  });

  it('total items across all tiers equals FARM_SIDEBAR_ITEMS length', () => {
    const grouped = getSidebarItemsByTier();
    const total = TIER_ORDER.reduce((sum, tier) => sum + grouped[tier].length, 0);
    expect(total).toBe(FARM_SIDEBAR_ITEMS.length);
  });
});
