'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FARMER_TIERS,
  TIER_ORDER,
  getNextTier,
  getTierProgress,
  type FarmerTier,
} from '@/lib/farmer-tiers';

interface TierProgressProps {
  currentTier: FarmerTier;
  totalXp: number;
  totalCoursesCompleted: number;
  compact?: boolean;
}

export function TierProgress({
  currentTier,
  totalXp,
  totalCoursesCompleted,
  compact = false,
}: TierProgressProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [prevTier, setPrevTier] = useState<FarmerTier>(currentTier);

  const tierConfig = FARMER_TIERS[currentTier];
  const nextTier = getNextTier(currentTier);
  const nextTierConfig = nextTier ? FARMER_TIERS[nextTier] : null;
  const progress = getTierProgress(currentTier, totalXp);
  const currentIndex = TIER_ORDER.indexOf(currentTier);
  const overallProgress = ((currentIndex + 1) / TIER_ORDER.length) * 100;

  // Detect tier change and trigger celebration
  useEffect(() => {
    if (currentTier !== prevTier) {
      const prevIdx = TIER_ORDER.indexOf(prevTier);
      const newIdx = TIER_ORDER.indexOf(currentTier);
      if (newIdx > prevIdx) {
        setShowCelebration(true);
        const timer = setTimeout(() => setShowCelebration(false), 3000);
        return () => clearTimeout(timer);
      }
      setPrevTier(currentTier);
    }
  }, [currentTier, prevTier]);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg">{tierConfig.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-xs font-semibold text-white/90">{tierConfig.name}</span>
            {nextTierConfig && (
              <span className="text-[10px] text-white/50">
                {nextTierConfig.emoji} Next
              </span>
            )}
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: tierConfig.color }}
              initial={{ width: 0 }}
              animate={{ width: `${nextTier ? progress : 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 rounded-xl backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-center"
            >
              <motion.span
                className="text-4xl block mb-2"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6 }}
              >
                {tierConfig.emoji}
              </motion.span>
              <p className="text-white font-bold text-sm">Tier Unlocked!</p>
              <p className="text-white/70 text-xs">{tierConfig.name} — {tierConfig.description}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        {/* Current tier badge */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${tierConfig.color}20` }}
          >
            {tierConfig.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">{tierConfig.name}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: `${tierConfig.color}30`,
                  color: tierConfig.color,
                }}
              >
                Tier {currentIndex + 1}/{TIER_ORDER.length}
              </span>
            </div>
            <p className="text-xs text-white/50">{tierConfig.description}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-white">{totalXp}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">XP</p>
          </div>
        </div>

        {/* Overall progress dots */}
        <div className="flex items-center gap-1.5 mb-3">
          {TIER_ORDER.map((tier, idx) => {
            const config = FARMER_TIERS[tier];
            const unlocked = idx <= currentIndex;
            return (
              <div key={tier} className="flex-1 flex items-center gap-1.5">
                <motion.div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                  style={{
                    backgroundColor: unlocked ? config.color : 'rgba(255,255,255,0.1)',
                  }}
                  initial={false}
                  animate={{ scale: tier === currentTier ? 1.1 : 1 }}
                >
                  {unlocked ? config.emoji : ''}
                </motion.div>
                {idx < TIER_ORDER.length - 1 && (
                  <div className="flex-1 h-0.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: unlocked ? config.color : 'transparent' }}
                      initial={{ width: 0 }}
                      animate={{ width: unlocked ? '100%' : '0%' }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress to next tier */}
        {nextTierConfig ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-white/60">
                Next: {nextTierConfig.emoji} {nextTierConfig.name}
              </span>
              <span className="text-[11px] font-semibold text-white/80">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: nextTierConfig.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            {nextTierConfig.requiredCourse && (
              <p className="text-[10px] text-white/40 mt-1.5">
                Complete &quot;{nextTierConfig.requiredCourse.replace(/-/g, ' ')}&quot; course to unlock
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-1">
            <span className="text-[11px] text-white/60 font-medium">
              Maximum tier reached — Full platform access
            </span>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          <div>
            <p className="text-xs font-bold text-white/80">{totalCoursesCompleted}</p>
            <p className="text-[10px] text-white/40">Courses</p>
          </div>
          <div>
            <p className="text-xs font-bold text-white/80">{currentIndex + 1}/{TIER_ORDER.length}</p>
            <p className="text-[10px] text-white/40">Tiers</p>
          </div>
          <div className="ml-auto">
            <p className="text-xs font-bold text-white/80">{Math.round(overallProgress)}%</p>
            <p className="text-[10px] text-white/40">Overall</p>
          </div>
        </div>
      </div>
    </div>
  );
}
