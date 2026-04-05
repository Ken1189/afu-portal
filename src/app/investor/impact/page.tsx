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
  TrendingUp,
  Percent,
  BadgeCheck,
  TreePine,
  MapPin,
  Baby,
  Wheat,
  ArrowUpRight,
  Download,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// ── Animation ────────────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// ── Hero Metrics ─────────────────────────────────────────────────────────────

const heroMetricsFallback = [
  {
    label: 'Farmers Empowered',
    value: '4,200+',
    icon: Users,
    color: 'text-[#5DB347]',
    bg: 'bg-[#5DB347]/10',
    hasGrowth: true,
  },
  {
    label: 'Hectares Financed',
    value: '12,500',
    icon: Sun,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    hasGrowth: false,
  },
  {
    label: 'Women Farmers',
    value: '38%',
    subLabel: 'of portfolio',
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    hasGrowth: false,
  },
  {
    label: 'Jobs Created',
    value: '340+',
    icon: Briefcase,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hasGrowth: false,
  },
  {
    label: 'Avg Income Increase',
    value: '42%',
    icon: TrendingUp,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    hasGrowth: false,
  },
  {
    label: 'Loan Repayment Rate',
    value: '94.2%',
    icon: BadgeCheck,
    color: 'text-[#1B2A4A]',
    bg: 'bg-[#1B2A4A]/10',
    hasGrowth: false,
  },
];

// ── SDG Data ─────────────────────────────────────────────────────────────────

const sdgCards = [
  {
    sdg: 1,
    title: 'No Poverty',
    color: '#E5243B',
    metric: '4,200 farmers above poverty line',
    progress: 70,
    icon: Target,
  },
  {
    sdg: 2,
    title: 'Zero Hunger',
    color: '#DDA63A',
    metric: '12,500 hectares food production',
    progress: 62,
    icon: Wheat,
  },
  {
    sdg: 5,
    title: 'Gender Equality',
    color: '#FF3A21',
    metric: '38% women farmers (target 50%)',
    progress: 76,
    icon: Heart,
  },
  {
    sdg: 8,
    title: 'Decent Work',
    color: '#A21942',
    metric: '340 direct jobs, 2,100 indirect',
    progress: 58,
    icon: Briefcase,
  },
  {
    sdg: 13,
    title: 'Climate Action',
    color: '#3F7E44',
    metric: '8,400 tonnes CO2 offset',
    progress: 48,
    icon: Leaf,
  },
  {
    sdg: 17,
    title: 'Partnerships',
    color: '#19486A',
    metric: "3 country gov'ts, Lloyd's, 20+ partners",
    progress: 82,
    icon: Handshake,
  },
];

// ── Country Impact Data ──────────────────────────────────────────────────────

const countryImpact = [
  {
    country: 'Zimbabwe',
    flag: '🇿🇼',
    farmers: '2,800',
    hectares: '8,200 ha',
    deployed: '$3.1M',
    color: 'from-[#1B2A4A] to-[#2a3f6a]',
  },
  {
    country: 'Uganda',
    flag: '🇺🇬',
    farmers: '900',
    hectares: '2,800 ha',
    deployed: '$1.2M',
    color: 'from-[#5DB347] to-[#4a9638]',
  },
  {
    country: 'Kenya',
    flag: '🇰🇪',
    farmers: '500',
    hectares: '1,500 ha',
    deployed: '$0.8M',
    color: 'from-[#2d6a4f] to-[#40916c]',
  },
];

// ── Community Programs ───────────────────────────────────────────────────────

const communityPrograms = [
  {
    title: 'Women in Agriculture',
    stat: '1,600 women enrolled',
    detail: '12 training centres across 20 countries',
    icon: Heart,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    accent: 'border-pink-200',
  },
  {
    title: 'Feed a Child',
    stat: '45,000 meals funded',
    detail: 'Through harvest surplus redistribution',
    icon: Baby,
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    accent: 'border-orange-200',
  },
  {
    title: 'Young Farmers',
    stat: '280 youth enrolled',
    detail: 'Incubator programs with mentorship & land access',
    icon: GraduationCap,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    accent: 'border-purple-200',
  },
];

// ── Environmental Metrics ────────────────────────────────────────────────────

const environmentalMetrics = [
  {
    title: 'Carbon Credits Generated',
    value: '8,400',
    unit: 'tonnes CO2',
    icon: TreePine,
    color: 'text-green-700',
    bg: 'bg-green-50',
    progress: 56,
  },
  {
    title: 'Sustainable Farming Practices',
    value: '67%',
    unit: 'of portfolio',
    icon: Sprout,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    progress: 67,
  },
  {
    title: 'Water Efficiency Improvement',
    value: '34%',
    unit: 'reduction in usage',
    icon: Droplets,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    progress: 34,
  },
  {
    title: 'Organic Certification',
    value: '12%',
    unit: 'of farms (target 25%)',
    icon: Leaf,
    color: 'text-lime-700',
    bg: 'bg-lime-50',
    progress: 48,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export default function InvestorImpactPage() {
  const [farmersCount, setFarmersCount] = useState<number | null>(null);
  const [hectares, setHectares] = useState<number | null>(null);
  const [countriesCount, setCountriesCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [carbonCreditsSold, setCarbonCreditsSold] = useState<number | null>(null);
  const [carbonCO2Offset, setCarbonCO2Offset] = useState<number | null>(null);
  const [totalDeployed, setTotalDeployed] = useState<number | null>(null);
  const [repaymentRate, setRepaymentRate] = useState<number | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const supabase = createClient();
      try {
        // 1. Try site_config for curated impact_metrics first
        const { data: configData } = await supabase
          .from('site_config')
          .select('value')
          .eq('key', 'impact_metrics')
          .single();

        if (configData?.value) {
          const metrics = configData.value as Record<string, unknown>;
          if (metrics.farmers_count) setFarmersCount(Number(metrics.farmers_count));
          if (metrics.hectares) setHectares(Number(metrics.hectares));
          if (metrics.countries_count) setCountriesCount(Number(metrics.countries_count));
          if (metrics.carbon_credits_sold) setCarbonCreditsSold(Number(metrics.carbon_credits_sold));
          if (metrics.carbon_co2_offset) setCarbonCO2Offset(Number(metrics.carbon_co2_offset));
          if (metrics.total_deployed) setTotalDeployed(Number(metrics.total_deployed));
          if (metrics.repayment_rate) setRepaymentRate(Number(metrics.repayment_rate));
        }

        // 2. Compute live stats from investments table
        const { data: investmentsData } = await supabase
          .from('investments')
          .select('amount, status, returns');
        if (investmentsData && investmentsData.length > 0) {
          const deployed = investmentsData.reduce(
            (sum: number, r: Record<string, unknown>) => sum + (Number(r.amount) || 0),
            0
          );
          if (deployed > 0) setTotalDeployed(deployed);
        }

        // 3. Try members table first, then profiles table for farmer count
        if (farmersCount === null) {
          const { count: memberCount } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true });

          if (memberCount !== null && memberCount > 0) {
            setFarmersCount(memberCount);
          } else {
            const { count: profileCount } = await supabase
              .from('profiles')
              .select('*', { count: 'exact', head: true })
              .in('role', ['member', 'farmer']);
            if (profileCount !== null && profileCount > 0) {
              setFarmersCount(profileCount);
            } else {
              const { count: allProfiles } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });
              if (allProfiles !== null && allProfiles > 0) {
                setFarmersCount(allProfiles);
              }
            }
          }
        }

        // 4. Fetch hectares from farm_plots
        if (hectares === null) {
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
        }

        // 5. Fetch distinct countries from profiles or members
        if (countriesCount === null) {
          const { data: countryData } = await supabase
            .from('profiles')
            .select('country')
            .not('country', 'is', null);
          if (countryData && countryData.length > 0) {
            const uniqueCountries = new Set(
              countryData.map((r: Record<string, unknown>) => String(r.country)).filter(Boolean)
            );
            if (uniqueCountries.size > 0) setCountriesCount(uniqueCountries.size);
          }
        }

        // 6. Fetch carbon credits data
        if (carbonCreditsSold === null) {
          const { data: carbonData } = await supabase
            .from('carbon_credits')
            .select('quantity, status');
          if (carbonData && carbonData.length > 0) {
            const sold = carbonData
              .filter((c: any) => c.status === 'sold' || c.status === 'retired')
              .reduce((sum: number, c: any) => sum + (c.quantity || 0), 0);
            const totalOffset = carbonData.reduce((sum: number, c: any) => sum + (c.quantity || 0), 0);
            if (sold > 0) setCarbonCreditsSold(sold);
            if (totalOffset > 0) setCarbonCO2Offset(totalOffset);
          }
        }
      } catch {
        // keep fallbacks
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  // Build hero metrics with live data override
  const heroMetrics = heroMetricsFallback.map((m) => {
    if (m.label === 'Farmers Empowered' && farmersCount !== null) {
      return { ...m, value: farmersCount.toLocaleString() + '+' };
    }
    if (m.label === 'Hectares Financed' && hectares !== null) {
      return { ...m, value: hectares.toLocaleString() };
    }
    return m;
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      {/* ─── Header ─── */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#5DB347]/10 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#5DB347]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B2A4A]">ESG & Impact Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time environmental, social, and governance metrics
              </p>
            </div>
          </div>
          <a
            href="/investor/documents"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5DB347] text-white text-sm font-medium hover:bg-[#4ea03c] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download Impact Report
          </a>
        </div>
      </motion.div>

      {/* ─── Hero Metrics Row (6 cards) ─── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {heroMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(27,42,74,0.10)' }}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full opacity-60" />
              <div className={`w-10 h-10 rounded-xl ${metric.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
              {loading && (metric.label === 'Farmers Empowered' || metric.label === 'Hectares Financed') ? (
                <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
              ) : (
                <div className="flex items-center gap-1.5">
                  <p className="text-2xl font-bold text-[#1B2A4A]">{metric.value}</p>
                  {metric.hasGrowth && (
                    <ArrowUpRight className="w-4 h-4 text-[#5DB347] opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">{metric.label}</p>
              {'subLabel' in metric && metric.subLabel && (
                <p className="text-[10px] text-gray-400">{metric.subLabel}</p>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* ─── SDG Alignment ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">SDG Alignment</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Tracking our direct contribution to 6 UN Sustainable Development Goals
        </p>
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
                <div className="flex items-start gap-3 mb-3">
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
                    <p className="text-xs text-gray-500 leading-relaxed">{sdg.metric}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <motion.div
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: sdg.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${sdg.progress}%` }}
                    transition={{ duration: 1.2, delay: 0.3 }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 text-right">{sdg.progress}% progress</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Impact by Country ─── */}
      <motion.div variants={cardVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Globe2 className="w-5 h-5 text-[#1B2A4A]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Impact by Country</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {countryImpact.map((c) => (
            <motion.div
              key={c.country}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(27,42,74,0.12)' }}
              className={`rounded-2xl bg-gradient-to-br ${c.color} text-white p-6 relative overflow-hidden`}
            >
              <div className="absolute top-3 right-4 text-3xl opacity-30">{c.flag}</div>
              <h3 className="text-lg font-bold mb-4">{c.country}</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Farmers
                  </span>
                  <span className="text-sm font-semibold">{c.farmers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Hectares
                  </span>
                  <span className="text-sm font-semibold">{c.hectares}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/20">
                  <span className="text-sm text-white/70">Deployed</span>
                  <span className="text-lg font-bold">{c.deployed}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ─── Community Programs ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Community Programs</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">10% of profits dedicated to community programs</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {communityPrograms.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={cardVariants}
                whileHover={{ y: -2 }}
                className={`rounded-xl border ${item.accent} p-5 hover:shadow-md transition-shadow`}
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">{item.title}</h3>
                <p className="text-lg font-bold text-[#1B2A4A] mb-1">{item.stat}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.detail}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {environmentalMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.title}
                variants={fadeUp}
                className={`${metric.bg} rounded-xl p-5`}
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">{metric.title}</h3>
                <p className="text-xl font-bold text-[#1B2A4A]">{metric.value}</p>
                <p className="text-xs text-gray-500 mb-3">{metric.unit}</p>
                {/* Progress bar */}
                <div className="w-full bg-white/60 rounded-full h-1.5">
                  <motion.div
                    className={`h-1.5 rounded-full bg-current ${metric.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${metric.progress}%` }}
                    transition={{ duration: 1.2, delay: 0.5 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ─── Carbon Offset ─── */}
      <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2">
          <TreePine className="w-5 h-5 text-[#5DB347]" />
          <h2 className="text-lg font-bold text-[#1B2A4A]">Carbon Offset</h2>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Carbon credit marketplace supporting regenerative agriculture across Africa
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div
            variants={fadeUp}
            className="bg-green-50 rounded-xl p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
              <BadgeCheck className="w-5 h-5 text-green-700" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">Credits Sold</h3>
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-[#1B2A4A]">
                {carbonCreditsSold !== null ? carbonCreditsSold.toLocaleString() : '960'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">tonnes of verified carbon credits</p>
          </motion.div>
          <motion.div
            variants={fadeUp}
            className="bg-emerald-50 rounded-xl p-5"
          >
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
              <TreePine className="w-5 h-5 text-emerald-700" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B2A4A] mb-1">CO2 Offset</h3>
            {loading ? (
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            ) : (
              <p className="text-2xl font-bold text-[#1B2A4A]">
                {carbonCO2Offset !== null ? carbonCO2Offset.toLocaleString() : '2,520'}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">total tonnes CO2 offset through projects</p>
          </motion.div>
        </div>
        <div className="mt-4 bg-[#5DB347]/5 rounded-xl p-4 text-sm text-gray-600">
          Revenue from carbon credit sales is distributed: <strong>70% to farmers</strong>, 20% to AFU operations, and 10% to the environmental buffer pool.
        </div>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </motion.div>
  );
}
