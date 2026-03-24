'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Leaf,
  Briefcase,
  Globe2,
  Target,
  Heart,
  Sprout,
  Droplets,
  Sun,
  GraduationCap,
  Handshake,
  Loader2,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

// ── SDG Data ─────────────────────────────────────────────────────────────────

const sdgCards = [
  {
    sdg: 1,
    title: 'No Poverty',
    color: '#E5243B',
    description: '19,000 farmer households targeted for income improvement',
    icon: Target,
  },
  {
    sdg: 2,
    title: 'Zero Hunger',
    color: '#DDA63A',
    description: '40-60% yield improvement through AI advisory and training',
    icon: Sprout,
  },
  {
    sdg: 5,
    title: 'Gender Equality',
    color: '#FF3A21',
    description: 'Target 40% women farmers in all programs',
    icon: Heart,
  },
  {
    sdg: 8,
    title: 'Decent Work',
    color: '#A21942',
    description: '200+ direct jobs via blueberry project and export hub',
    icon: Briefcase,
  },
  {
    sdg: 13,
    title: 'Climate Action',
    color: '#3F7E44',
    description: 'Climate-resilient crop selection, carbon credit generation',
    icon: Leaf,
  },
  {
    sdg: 17,
    title: 'Partnerships',
    color: '#19486A',
    description: 'Cross-border cooperation across 10 African nations',
    icon: Handshake,
  },
];

const environmentalMetrics = [
  {
    title: 'Carbon Credits Generated',
    value: 'Measurement in progress',
    icon: Leaf,
    color: 'text-green-600',
    bg: 'bg-green-50',
  },
  {
    title: 'Sustainable Farming Practices',
    value: 'Conservation tillage, cover crops, reduced chemicals',
    icon: Sprout,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Water Efficiency',
    value: 'Solar irrigation reducing water waste by 30%',
    icon: Droplets,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
];

const communityImpact = [
  {
    title: 'Women in Agriculture',
    description: 'Training and empowerment programs targeting 40% women farmer participation across all country operations',
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    title: 'Feed a Child Initiative',
    description: 'Nutritional programs funded by 10% of profits, targeting food-insecure communities near project sites',
    icon: Sprout,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
  },
  {
    title: 'Young Farmers Incubators',
    description: 'Youth agricultural entrepreneurship programs providing mentorship, land access, and startup financing',
    icon: GraduationCap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function InvestorImpactPage() {
  const [farmersCount, setFarmersCount] = useState<number | null>(null);
  const [hectares, setHectares] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      try {
        // Fetch farmer count from members / profiles
        const { count: memberCount } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true });

        if (memberCount !== null && memberCount > 0) {
          setFarmersCount(memberCount);
        }

        // Fetch hectares from farm_plots
        const { data: plotData } = await supabase
          .from('farm_plots')
          .select('size_hectares');

        if (plotData && plotData.length > 0) {
          const total = plotData.reduce(
            (sum: number, row: Record<string, unknown>) =>
              sum + ((row.size_hectares as number) || 0),
            0
          );
          if (total > 0) setHectares(Math.round(total));
        }
      } catch {
        // keep fallbacks
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  const overviewStats = [
    {
      label: 'Farmers Supported',
      value: farmersCount !== null ? farmersCount.toLocaleString() : '19,000+',
      icon: Users,
      color: 'text-[#5DB347]',
      bg: 'bg-[#5DB347]/10',
    },
    {
      label: 'Hectares Under Management',
      value: hectares !== null ? hectares.toLocaleString() : '50,000+',
      icon: Sun,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Jobs Created',
      value: '200+',
      icon: Briefcase,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Countries Active',
      value: '10',
      icon: Globe2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* Header */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#5DB347]/10 rounded-xl flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#5DB347]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">ESG & Impact</h1>
            <p className="text-sm text-gray-500">Environmental, Social, and Governance impact metrics</p>
          </div>
        </div>
      </motion.div>

      {/* ─── Impact Overview Stats ─── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={cardVariants}
              whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              {loading && stat.label !== 'Jobs Created' && stat.label !== 'Countries Active' ? (
                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
              ) : (
                <p className="text-2xl font-bold text-[#1B2A4A]">{stat.value}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── SDG Alignment ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">SDG Alignment</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sdgCards.map((sdg) => {
            const Icon = sdg.icon;
            return (
              <motion.div
                key={sdg.sdg}
                variants={cardVariants}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${sdg.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: sdg.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                        style={{ backgroundColor: sdg.color }}
                      >
                        SDG {sdg.sdg}
                      </span>
                      <h3 className="text-sm font-semibold text-[#1B2A4A] truncate">{sdg.title}</h3>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{sdg.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Environmental Metrics ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <Leaf className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Environmental Metrics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {environmentalMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.title} className={`${metric.bg} rounded-xl p-5`}>
                <div className={`w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">{metric.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{metric.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Community Impact (10% profits) ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Community Impact</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">10% of profits dedicated to community programs</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityImpact.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </motion.div>
  );
}
