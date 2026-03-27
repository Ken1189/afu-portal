'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  Star,
  Lock,
  CheckCircle2,
  TrendingUp,
  Award,
  Target,
  Clock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
/* ------------------------------------------------------------------ */
/*  Badge types & data (inlined from @/lib/data/badges)                 */
/* ------------------------------------------------------------------ */

type BadgeCategory = 'onboarding' | 'farming' | 'financial' | 'education' | 'community' | 'marketplace';
type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  requirement: string;
  points: number;
}

interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

const badges: Badge[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete the onboarding process and join the AFU community.', icon: '👣', category: 'onboarding', rarity: 'common', requirement: 'Complete onboarding', points: 10 },
  { id: 'profile-perfect', name: 'Profile Perfect', description: 'Fill out every section of your farmer profile to 100%.', icon: '✨', category: 'onboarding', rarity: 'common', requirement: '100% profile completion', points: 15 },
  { id: 'verified-farmer', name: 'Verified Farmer', description: 'Complete KYC verification and become a trusted member.', icon: '🛡️', category: 'onboarding', rarity: 'uncommon', requirement: 'Complete KYC verification', points: 25 },
  { id: 'green-thumb', name: 'Green Thumb', description: 'Create your first farm plot and start your digital farming journey.', icon: '🌱', category: 'farming', rarity: 'common', requirement: 'Create first farm plot', points: 10 },
  { id: 'harvest-hero', name: 'Harvest Hero', description: 'Successfully complete your first harvest cycle.', icon: '🌾', category: 'farming', rarity: 'uncommon', requirement: 'Complete first harvest', points: 25 },
  { id: 'master-grower', name: 'Master Grower', description: 'Manage 5 or more active farm plots simultaneously.', icon: '🏕️', category: 'farming', rarity: 'rare', requirement: '5+ active plots', points: 50 },
  { id: 'soil-guardian', name: 'Soil Guardian', description: 'Achieve a soil health score above 90 on every one of your plots.', icon: '🌍', category: 'farming', rarity: 'epic', requirement: 'Health score > 90 on all plots', points: 100 },
  { id: 'first-payment', name: 'First Payment', description: 'Complete your first payment through the AFU platform.', icon: '💳', category: 'financial', rarity: 'common', requirement: 'Complete first payment', points: 10 },
  { id: 'perfect-record', name: 'Perfect Record', description: 'Maintain a flawless repayment history with 100% on-time payments.', icon: '📊', category: 'financial', rarity: 'rare', requirement: '100% on-time loan repayments', points: 75 },
  { id: 'credit-champion', name: 'Credit Champion', description: 'Achieve an exceptional credit score above 800.', icon: '👑', category: 'financial', rarity: 'legendary', requirement: 'Credit score > 800', points: 200 },
  { id: 'insured-farmer', name: 'Insured Farmer', description: 'Protect your farm by purchasing your first insurance policy.', icon: '☂️', category: 'financial', rarity: 'uncommon', requirement: 'Purchase first insurance policy', points: 20 },
  { id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Enroll in your first training course on the platform.', icon: '📖', category: 'education', rarity: 'common', requirement: 'Enroll in first course', points: 10 },
  { id: 'scholar', name: 'Scholar', description: 'Complete 3 training courses and broaden your expertise.', icon: '🎓', category: 'education', rarity: 'uncommon', requirement: 'Complete 3 courses', points: 30 },
  { id: 'expert-farmer', name: 'Expert Farmer', description: 'Complete 10 courses and become a true agricultural expert.', icon: '🧠', category: 'education', rarity: 'rare', requirement: 'Complete 10 courses', points: 75 },
  { id: 'certified-pro', name: 'Certified Pro', description: 'Earn an official certification from the AFU training program.', icon: '🏅', category: 'education', rarity: 'epic', requirement: 'Earn a certification', points: 100 },
  { id: 'team-player', name: 'Team Player', description: 'Join a cooperative and start collaborating with fellow farmers.', icon: '🤝', category: 'community', rarity: 'common', requirement: 'Join a cooperative', points: 10 },
  { id: 'referral-champion', name: 'Referral Champion', description: 'Refer 5 or more farmers to join the AFU platform.', icon: '📣', category: 'community', rarity: 'uncommon', requirement: '5+ referrals', points: 30 },
  { id: 'community-leader', name: 'Community Leader', description: 'Become an officer in your cooperative and lead your community.', icon: '🏛️', category: 'community', rarity: 'rare', requirement: 'Become a cooperative officer', points: 50 },
  { id: 'first-purchase', name: 'First Purchase', description: 'Buy your first product from the AFU marketplace.', icon: '🛒', category: 'marketplace', rarity: 'common', requirement: 'Buy first product', points: 10 },
  { id: 'export-ready', name: 'Export Ready', description: 'Complete your first export transaction through the platform.', icon: '🚢', category: 'marketplace', rarity: 'rare', requirement: 'Complete first export', points: 50 },
  { id: 'market-maven', name: 'Market Maven', description: 'Complete 10 or more marketplace transactions like a pro.', icon: '💎', category: 'marketplace', rarity: 'epic', requirement: '10+ marketplace transactions', points: 75 },
];

const defaultEarnedBadges: EarnedBadge[] = [
  { badgeId: 'first-steps', earnedAt: '2025-09-15T10:30:00Z' },
  { badgeId: 'profile-perfect', earnedAt: '2025-09-18T14:22:00Z' },
  { badgeId: 'verified-farmer', earnedAt: '2025-10-02T09:15:00Z' },
  { badgeId: 'green-thumb', earnedAt: '2025-10-10T11:45:00Z' },
  { badgeId: 'first-payment', earnedAt: '2025-11-05T16:30:00Z' },
  { badgeId: 'knowledge-seeker', earnedAt: '2025-11-20T08:00:00Z' },
  { badgeId: 'team-player', earnedAt: '2025-12-01T13:10:00Z' },
  { badgeId: 'first-purchase', earnedAt: '2026-01-14T10:55:00Z' },
];

const rarityColors: Record<BadgeRarity, string> = {
  common: '#6B7280',
  uncommon: '#22C55E',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F59E0B',
};

const categoryLabels: Record<BadgeCategory, string> = {
  onboarding: 'Onboarding',
  farming: 'Farming',
  financial: 'Financial',
  education: 'Education',
  community: 'Community',
  marketplace: 'Marketplace',
};

/* ------------------------------------------------------------------ */
/*  Level helpers                                                       */
/* ------------------------------------------------------------------ */

interface Level {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  bgGradient: string;
}

const levels: Level[] = [
  { name: 'Bronze', minPoints: 0, maxPoints: 100, color: '#CD7F32', bgGradient: 'from-amber-700 to-amber-900' },
  { name: 'Silver', minPoints: 100, maxPoints: 300, color: '#C0C0C0', bgGradient: 'from-gray-400 to-gray-600' },
  { name: 'Gold', minPoints: 300, maxPoints: 600, color: '#FFD700', bgGradient: 'from-yellow-400 to-yellow-600' },
  { name: 'Platinum', minPoints: 600, maxPoints: 1000, color: '#E5E4E2', bgGradient: 'from-slate-300 to-slate-500' },
  { name: 'Diamond', minPoints: 1000, maxPoints: Infinity, color: '#B9F2FF', bgGradient: 'from-cyan-300 to-cyan-500' },
];

function getLevel(points: number): Level {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) return levels[i];
  }
  return levels[0];
}

function getNextLevel(points: number): Level | null {
  const current = getLevel(points);
  const idx = levels.indexOf(current);
  return idx < levels.length - 1 ? levels[idx + 1] : null;
}

/* ------------------------------------------------------------------ */
/*  Filter type                                                         */
/* ------------------------------------------------------------------ */

type FilterTab = 'all' | 'earned' | 'locked';

/* ------------------------------------------------------------------ */
/*  Animation variants                                                  */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/*  Rarity label component                                              */
/* ------------------------------------------------------------------ */

function RarityBadge({ rarity }: { rarity: BadgeRarity }) {
  const color = rarityColors[rarity];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {rarity}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge card                                                          */
/* ------------------------------------------------------------------ */

function BadgeCard({ badge, earned, earnedAt }: { badge: Badge; earned: boolean; earnedAt?: string }) {
  return (
    <motion.div
      variants={item}
      whileHover={{ scale: 1.03, y: -4 }}
      className={`relative rounded-2xl border p-5 transition-shadow ${
        earned
          ? 'border-[#0B3D2C]/20 bg-white shadow-md hover:shadow-lg'
          : 'border-gray-200 bg-gray-50 opacity-70 hover:opacity-90'
      }`}
    >
      {/* Earned check */}
      {earned && (
        <div className="absolute -top-2 -right-2 rounded-full bg-emerald-500 p-1 shadow-md">
          <CheckCircle2 className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Icon */}
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl ${
          earned ? 'bg-gradient-to-br from-[#0B3D2C]/10 to-[#8CB89C]/10' : 'bg-gray-100'
        }`}
      >
        {earned ? (
          badge.icon
        ) : (
          <Lock className="h-6 w-6 text-gray-400" />
        )}
      </div>

      {/* Name */}
      <h3 className={`mt-3 text-center text-sm font-bold ${earned ? 'text-[#0B3D2C]' : 'text-gray-400'}`}>
        {badge.name}
      </h3>

      {/* Description or requirement */}
      <p className={`mt-1 text-center text-xs leading-relaxed ${earned ? 'text-gray-600' : 'text-gray-400'}`}>
        {earned ? badge.description : badge.requirement}
      </p>

      {/* Rarity + Points */}
      <div className="mt-3 flex items-center justify-between">
        <RarityBadge rarity={badge.rarity} />
        <span
          className={`flex items-center gap-1 text-xs font-semibold ${
            earned ? 'text-[#D4A017]' : 'text-gray-400'
          }`}
        >
          <Star className="h-3 w-3" />
          {badge.points} pts
        </span>
      </div>

      {/* Earned date */}
      {earned && earnedAt && (
        <p className="mt-2 text-center text-[10px] text-gray-400">
          Earned {new Date(earnedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function AchievementsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [filter, setFilter] = useState<FilterTab>('all');
  const [categoryFilter, setCategoryFilter] = useState<BadgeCategory | 'all'>('all');
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>(defaultEarnedBadges);
  const [_loading, setLoading] = useState(true);

  // Fetch earned badges from Supabase
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchAchievements() {
      setLoading(true);
      try {
        // Try fetching from farmer_badges or achievements table
        const { data: badgeData } = await supabase
          .from('farmer_badges')
          .select('badge_id, earned_at')
          .eq('profile_id', user!.id);

        if (!cancelled && badgeData && badgeData.length > 0) {
          const mapped: EarnedBadge[] = badgeData.map((b: Record<string, unknown>) => ({
            badgeId: b.badge_id as string,
            earnedAt: b.earned_at as string,
          }));
          setEarnedBadges(mapped);
        }
        // If no data, keep default earned badges as fallback

        // Also try to derive achievements from course_enrollments and farmer_tiers
        const [enrollRes, tierRes] = await Promise.all([
          supabase.from('course_enrollments').select('id, status, enrolled_at').eq('profile_id', user!.id),
          supabase.from('farmer_tiers').select('tier, points').eq('profile_id', user!.id).maybeSingle(),
        ]);

        if (!cancelled) {
          const derivedBadges: EarnedBadge[] = [];
          // Derive education badges from course enrollments
          if (enrollRes.data && enrollRes.data.length > 0) {
            const completedCourses = enrollRes.data.filter((e: Record<string, unknown>) => e.status === 'completed');
            if (enrollRes.data.length > 0) {
              derivedBadges.push({
                badgeId: 'knowledge-seeker',
                earnedAt: (enrollRes.data[0] as Record<string, unknown>).enrolled_at as string || new Date().toISOString(),
              });
            }
            if (completedCourses.length >= 3) {
              derivedBadges.push({
                badgeId: 'scholar',
                earnedAt: (completedCourses[2] as Record<string, unknown>).enrolled_at as string || new Date().toISOString(),
              });
            }
            if (completedCourses.length >= 10) {
              derivedBadges.push({
                badgeId: 'expert-farmer',
                earnedAt: (completedCourses[9] as Record<string, unknown>).enrolled_at as string || new Date().toISOString(),
              });
            }
          }

          // Merge derived badges with existing (avoid duplicates)
          if (derivedBadges.length > 0) {
            setEarnedBadges((prev) => {
              const existingIds = new Set(prev.map((b) => b.badgeId));
              const newBadges = derivedBadges.filter((b) => !existingIds.has(b.badgeId));
              return newBadges.length > 0 ? [...prev, ...newBadges] : prev;
            });
          }
        }
      } catch {
        // Supabase fetch failed — keep default earned badges as fallback
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAchievements();
    return () => { cancelled = true; };
  }, [user, supabase]);

  /* Computed values */
  const earnedSet = useMemo(() => new Set(earnedBadges.map((e) => e.badgeId)), [earnedBadges]);

  const earnedMap = useMemo(() => {
    const m = new Map<string, string>();
    earnedBadges.forEach((e) => m.set(e.badgeId, e.earnedAt));
    return m;
  }, [earnedBadges]);

  const totalPoints = useMemo(
    () => badges.filter((b) => earnedSet.has(b.id)).reduce((sum, b) => sum + b.points, 0),
    [earnedSet],
  );

  const currentLevel = getLevel(totalPoints);
  const nextLevel = getNextLevel(totalPoints);
  const progressPercent = nextLevel
    ? ((totalPoints - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  const earnedCount = earnedBadges.length;
  const lockedCount = badges.length - earnedCount;

  /* Filtered badges */
  const filteredBadges = useMemo(() => {
    let list = [...badges];
    if (filter === 'earned') list = list.filter((b) => earnedSet.has(b.id));
    if (filter === 'locked') list = list.filter((b) => !earnedSet.has(b.id));
    if (categoryFilter !== 'all') list = list.filter((b) => b.category === categoryFilter);
    // Sort earned first, then by rarity weight
    const rarityWeight: Record<BadgeRarity, number> = {
      legendary: 5,
      epic: 4,
      rare: 3,
      uncommon: 2,
      common: 1,
    };
    list.sort((a, b) => {
      const ae = earnedSet.has(a.id) ? 1 : 0;
      const be = earnedSet.has(b.id) ? 1 : 0;
      if (ae !== be) return be - ae;
      return rarityWeight[b.rarity] - rarityWeight[a.rarity];
    });
    return list;
  }, [filter, categoryFilter, earnedSet]);

  /* Recent achievements (last 5) */
  const recentAchievements = useMemo(() => {
    return [...earnedBadges]
      .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
      .slice(0, 5)
      .map((eb) => ({
        ...eb,
        badge: badges.find((b) => b.id === eb.badgeId)!,
      }));
  }, [earnedBadges]);

  /* Categories for filter */
  const categories: (BadgeCategory | 'all')[] = [
    'all',
    'onboarding',
    'farming',
    'financial',
    'education',
    'community',
    'marketplace',
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#8CB89C] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#0B3D2C] hover:text-[#8CB89C] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* -------------------------------------------------------- */}
        {/*  Header                                                    */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-[#0B3D2C]">
                Achievements &amp; Badges
              </h1>
              <p className="mt-1 text-gray-500">
                Track your progress and unlock rewards as you grow on the AFU platform.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#0B3D2C] to-[#8CB89C] px-5 py-3 text-white shadow-lg">
              <Trophy className="h-6 w-6 text-[#D4A017]" />
              <div>
                <p className="text-xs font-medium opacity-80">Total Points</p>
                <p className="text-xl font-extrabold">{totalPoints}</p>
              </div>
              <div className="ml-3 border-l border-white/30 pl-3">
                <p className="text-xs font-medium opacity-80">Level</p>
                <p className="text-lg font-bold" style={{ color: currentLevel.color }}>
                  {currentLevel.name}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/*  Progress bar to next level                                */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#0B3D2C]">
              {currentLevel.name}
            </span>
            {nextLevel ? (
              <span className="text-sm font-semibold text-gray-400">
                {nextLevel.name} — {nextLevel.minPoints} pts
              </span>
            ) : (
              <span className="text-sm font-semibold text-[#D4A017]">Max Level!</span>
            )}
          </div>
          <div className="relative h-4 w-full overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#0B3D2C] to-[#8CB89C]"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {nextLevel
              ? `${nextLevel.minPoints - totalPoints} points to ${nextLevel.name}`
              : 'You have reached the highest level!'}
          </p>
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/*  Stats row                                                 */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {[
            {
              label: 'Badges Earned',
              value: `${earnedCount} / ${badges.length}`,
              icon: Award,
              color: 'text-[#8CB89C]',
              bg: 'bg-[#8CB89C]/10',
            },
            {
              label: 'Points Earned',
              value: totalPoints.toString(),
              icon: Star,
              color: 'text-[#D4A017]',
              bg: 'bg-[#D4A017]/10',
            },
            {
              label: 'Current Level',
              value: currentLevel.name,
              icon: Trophy,
              color: 'text-[#0B3D2C]',
              bg: 'bg-[#0B3D2C]/10',
            },
            {
              label: 'Next Milestone',
              value: nextLevel ? `${nextLevel.minPoints} pts` : 'Max!',
              icon: Target,
              color: 'text-purple-600',
              bg: 'bg-purple-100',
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className={`inline-flex rounded-xl p-2 ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="mt-2 text-lg font-extrabold text-[#0B3D2C]">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/*  Filter tabs                                               */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex flex-wrap gap-2"
        >
          {/* Status filter */}
          {(
            [
              { key: 'all' as FilterTab, label: 'All', count: badges.length },
              { key: 'earned' as FilterTab, label: 'Earned', count: earnedCount },
              { key: 'locked' as FilterTab, label: 'Locked', count: lockedCount },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-[#0B3D2C] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#0B3D2C]/30'
              }`}
            >
              {tab.label}{' '}
              <span
                className={`ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                  filter === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}

          {/* Divider */}
          <div className="mx-1 hidden h-8 w-px bg-gray-200 sm:block" />

          {/* Category filter */}
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-full px-3 py-2 text-xs font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-[#8CB89C] text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-[#8CB89C]/30'
              }`}
            >
              {cat === 'all' ? 'All Categories' : categoryLabels[cat]}
            </button>
          ))}
        </motion.div>

        {/* -------------------------------------------------------- */}
        {/*  Badge grid                                                */}
        {/* -------------------------------------------------------- */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={earnedSet.has(badge.id)}
                earnedAt={earnedMap.get(badge.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredBadges.length === 0 && (
          <div className="mb-12 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-16">
            <Lock className="h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No badges match your filters.</p>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/*  Recent Achievements Timeline                              */}
        {/* -------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#8CB89C]" />
            <h2 className="text-lg font-bold text-[#0B3D2C]">Recent Achievements</h2>
          </div>

          <div className="relative space-y-6">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-[#8CB89C] to-gray-200" />

            {recentAchievements.map((achievement, idx) => (
              <motion.div
                key={achievement.badgeId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.08 }}
                className="relative flex items-start gap-4 pl-1"
              >
                {/* Timeline dot */}
                <div className="relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white border-2 border-[#8CB89C] shadow-sm text-lg">
                  {achievement.badge.icon}
                </div>

                <div className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-[#0B3D2C]">{achievement.badge.name}</h3>
                    <RarityBadge rarity={achievement.badge.rarity} />
                    <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-[#D4A017]">
                      <Star className="h-3 w-3" />
                      +{achievement.badge.points} pts
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">{achievement.badge.description}</p>
                  <p className="mt-2 text-[10px] text-gray-400">
                    {new Date(achievement.earnedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
