'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf,
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  Droplets,
  TreePine,
  Sprout,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Users,
  MapPin,
  Target,
  CheckCircle2,
  Circle,
  ShoppingCart,
  Star,
  Globe,
  BarChart3,
  Sparkles,
  ArrowRight,
  BadgeCheck,
  Clock,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import {
  sustainabilityProjects as mockSustainabilityProjects,
  sustainabilityMetrics as mockSustainabilityMetrics,
  carbonCredits as mockCarbonCredits,
  type SustainabilityProject,
  type ProjectType,
  type CarbonCreditType,
  type CarbonCredit,
} from '@/lib/data/sustainability';
import { useCarbonCredits } from '@/lib/supabase/use-sustainability';

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type TabKey = 'projects' | 'score' | 'marketplace';

const tabLabels: Record<TabKey, string> = {
  projects: 'My Projects',
  score: 'Environmental Score',
  marketplace: 'Marketplace',
};

const projectTypeLabels: Record<ProjectType, string> = {
  agroforestry: 'Agroforestry',
  'soil-carbon': 'Soil Carbon',
  'methane-reduction': 'Methane Reduction',
  'conservation-tillage': 'Conservation Tillage',
  biochar: 'Biochar',
  'water-conservation': 'Water Conservation',
  'renewable-energy': 'Renewable Energy',
};

const projectTypeColors: Record<ProjectType, string> = {
  agroforestry: 'bg-green-100 text-green-700 border-green-200',
  'soil-carbon': 'bg-amber-100 text-amber-700 border-amber-200',
  'methane-reduction': 'bg-blue-100 text-blue-700 border-blue-200',
  'conservation-tillage': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  biochar: 'bg-purple-100 text-purple-700 border-purple-200',
  'water-conservation': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'renewable-energy': 'bg-orange-100 text-orange-700 border-orange-200',
};

const creditTypeLabels: Record<CarbonCreditType, string> = {
  agroforestry: 'Agroforestry',
  'soil-carbon': 'Soil Carbon',
  'methane-reduction': 'Methane Reduction',
  'conservation-tillage': 'Conservation Tillage',
  biochar: 'Biochar',
};

const creditTypeColors: Record<CarbonCreditType, string> = {
  agroforestry: 'bg-green-100 text-green-700 border-green-200',
  'soil-carbon': 'bg-amber-100 text-amber-700 border-amber-200',
  'methane-reduction': 'bg-blue-100 text-blue-700 border-blue-200',
  'conservation-tillage': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  biochar: 'bg-purple-100 text-purple-700 border-purple-200',
};

const countryFlags: Record<string, string> = {
  Botswana: '🇧🇼',
  Zimbabwe: '🇿🇼',
  Tanzania: '🇹🇿',
};

const statusBadge: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  planning: 'bg-amber-50 text-amber-700 border-amber-200',
};

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ---------------------------------------------------------------------------
// Impact Metric Card
// ---------------------------------------------------------------------------

function ImpactMetricCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  changePercent,
  color,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  color: string;
}) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400';
  const trendBg =
    trend === 'up' ? 'bg-green-50' : trend === 'down' ? 'bg-red-50' : 'bg-gray-50';

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
          <Icon size={20} />
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBg}`}>
          <TrendIcon size={12} className={trendColor} />
          <span className={`text-xs font-semibold ${trendColor}`}>{changePercent}%</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{unit}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Project Card
// ---------------------------------------------------------------------------

function ProjectCard({ project }: { project: SustainabilityProject }) {
  const [expanded, setExpanded] = useState(false);
  const progressPercent = Math.round((project.earnedCredits / project.targetCredits) * 100);
  const completedMilestones = project.milestones.filter((m) => m.completed).length;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Project header image placeholder */}
      <div className="h-36 bg-gradient-to-br from-[#2AA198]/20 to-[#1B2A4A]/10 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <TreePine size={48} className="text-[#2AA198]/40" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${projectTypeColors[project.type]}`}
          >
            {projectTypeLabels[project.type]}
          </span>
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusBadge[project.status]}`}
          >
            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        <div className="absolute top-3 right-3 text-2xl">{countryFlags[project.country]}</div>
      </div>

      <div className="p-4">
        {/* Name and location */}
        <h3 className="text-base font-bold text-[#1B2A4A] leading-tight">{project.name}</h3>
        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
          <MapPin size={12} />
          <span>
            {project.region}, {project.country}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{project.description}</p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">Carbon Credits Progress</span>
            <span className="font-semibold text-[#1B2A4A]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-[#2AA198] to-[#D4A843] rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-400">
              {project.earnedCredits.toLocaleString()} earned
            </span>
            <span className="text-gray-400">
              {project.targetCredits.toLocaleString()} target
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={13} className="text-[#2AA198]" />
            <span className="font-medium text-[#1B2A4A]">{project.participatingFarmers}</span>
            <span>farmers</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Globe size={13} className="text-[#D4A843]" />
            <span className="font-medium text-[#1B2A4A]">{project.hectaresCovered}</span>
            <span>ha</span>
          </div>
        </div>

        {/* Milestones preview */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs text-[#2AA198] font-medium"
          >
            <span>
              Milestones ({completedMilestones}/{project.milestones.length})
            </span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-0">
                  {project.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 relative">
                      {/* Vertical line */}
                      {idx < project.milestones.length - 1 && (
                        <div
                          className={`absolute left-[7px] top-[18px] w-0.5 h-[calc(100%)] ${
                            milestone.completed ? 'bg-[#2AA198]/30' : 'bg-gray-200'
                          }`}
                        />
                      )}
                      {/* Dot */}
                      <div className="relative z-10 mt-0.5 flex-shrink-0">
                        {milestone.completed ? (
                          <CheckCircle2 size={15} className="text-[#2AA198]" />
                        ) : (
                          <Circle size={15} className="text-gray-300" />
                        )}
                      </div>
                      {/* Content */}
                      <div className="pb-3">
                        <p
                          className={`text-xs font-medium ${
                            milestone.completed ? 'text-[#1B2A4A]' : 'text-gray-400'
                          }`}
                        >
                          {milestone.title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{milestone.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Environmental Score Components
// ---------------------------------------------------------------------------

function ScoreCircle({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color =
    score >= 80 ? '#2AA198' : score >= 60 ? '#D4A843' : score >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 128 128">
        <circle
          cx="64"
          cy="64"
          r="58"
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="8"
        />
        <motion.circle
          cx="64"
          cy="64"
          r="58"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#1B2A4A]">{score}</span>
        <span className="text-xs text-gray-400">/100</span>
      </div>
    </div>
  );
}

function CategoryScoreBar({
  label,
  score,
  color,
  icon: Icon,
}: {
  label: string;
  score: number;
  color: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[#1B2A4A]">{label}</span>
          <span className="text-xs font-bold text-[#1B2A4A]">{score}/100</span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background:
                score >= 80
                  ? '#2AA198'
                  : score >= 60
                    ? '#D4A843'
                    : score >= 40
                      ? '#F59E0B'
                      : '#EF4444',
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Marketplace Credit Card
// ---------------------------------------------------------------------------

function MarketplaceCreditCard({
  credit,
}: {
  credit: CarbonCredit;
}) {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full border ${creditTypeColors[credit.type]}`}
        >
          {creditTypeLabels[credit.type]}
        </span>
        <span className="text-xs font-medium text-gray-400">Vintage {credit.vintageYear}</span>
      </div>

      <h4 className="text-sm font-bold text-[#1B2A4A] leading-tight">{credit.projectName}</h4>

      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
        <ShieldCheck size={12} className="text-[#2AA198]" />
        <span>{credit.verificationBody}</span>
      </div>

      <p className="text-xs text-gray-500 mt-2 line-clamp-2">{credit.description}</p>

      <div className="mt-4 pt-3 border-t border-gray-50">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs text-gray-400">Price per tonne</p>
            <p className="text-lg font-bold text-[#1B2A4A]">
              {formatCurrency(credit.pricePerTonne)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Available</p>
            <p className="text-lg font-bold text-[#2AA198]">
              {credit.credits} <span className="text-xs font-normal text-gray-400">tCO2e</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>Total value</span>
          <span className="font-semibold text-[#1B2A4A]">{formatCurrency(credit.totalValue)}</span>
        </div>

        <button className="w-full py-2.5 rounded-xl bg-[#2AA198] text-white text-sm font-semibold hover:bg-[#2AA198]/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <ShoppingCart size={14} />
          Buy Credits
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Price Trend Bar Chart (CSS-based, no Recharts)
// ---------------------------------------------------------------------------

function PriceTrendChart() {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
  const values = [14.2, 15.1, 15.8, 16.5, 17.2, 18.0, 19.5, 21.0, 22.3];
  const maxVal = Math.max(...values);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#1B2A4A]">Carbon Credit Price Trend</h4>
          <p className="text-xs text-gray-400 mt-0.5">Average price per tonne CO2e</p>
        </div>
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
          <TrendingUp size={12} className="text-green-600" />
          <span className="text-xs font-semibold text-green-600">+57%</span>
        </div>
      </div>

      <div className="flex items-end gap-1.5 h-32">
        {months.map((month, idx) => {
          const height = (values[idx] / maxVal) * 100;
          const isLatest = idx === months.length - 1;
          return (
            <div key={month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-[#1B2A4A]">
                ${values[idx].toFixed(1)}
              </span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.6, delay: idx * 0.06 }}
                className={`w-full rounded-t-md ${
                  isLatest
                    ? 'bg-gradient-to-t from-[#2AA198] to-[#2AA198]/70'
                    : 'bg-gradient-to-t from-[#1B2A4A]/20 to-[#1B2A4A]/5'
                }`}
              />
              <span className="text-[10px] text-gray-400">{month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function SustainabilityPage() {
  const { credits: liveCredits, loading: creditsLoading } = useCarbonCredits();

  // Use live Supabase data when available, fall back to mock data
  const sustainabilityProjects = mockSustainabilityProjects;
  const sustainabilityMetrics = mockSustainabilityMetrics;
  const carbonCredits = liveCredits.length > 0
    ? liveCredits.map((c) => ({
        id: c.id,
        type: c.project_type as CarbonCreditType,
        projectName: c.project_type,
        credits: c.credits_earned,
        pricePerTonne: c.value_usd ? c.value_usd / c.credits_earned : 0,
        totalValue: c.value_usd ?? 0,
        status: c.verification_status as 'verified' | 'pending' | 'retired' | 'listed',
        vintageYear: c.vintage_year ?? new Date().getFullYear(),
        verificationBody: c.registry ?? 'Unknown',
        description: '',
        issuanceDate: c.created_at,
        expiryDate: c.updated_at,
        buyerName: null,
      }))
    : mockCarbonCredits;

  const [activeTab, setActiveTab] = useState<TabKey>('projects');

  // Metrics for the top cards
  const impactMetrics = useMemo(() => {
    const carbon = sustainabilityMetrics.find((m) => m.name === 'Total Carbon Offset');
    const water = sustainabilityMetrics.find((m) => m.name === 'Water Saved');
    const trees = sustainabilityMetrics.find((m) => m.name === 'Trees Planted');
    const soil = sustainabilityMetrics.find((m) => m.name === 'Soil Health Score');
    const energy = sustainabilityMetrics.find((m) => m.name === 'Energy Savings');
    return { carbon, water, trees, soil, energy };
  }, []);

  // Listed credits for marketplace
  const listedCredits = useMemo(() => carbonCredits.filter((c) => c.status === 'listed'), []);

  // Your listed credits (example: some verified credits you can list)
  const yourListedCredits = useMemo(
    () => carbonCredits.filter((c) => c.status === 'verified'),
    []
  );

  // Environmental scores
  const envScores = useMemo(
    () => ({
      overall: 76,
      carbon: 82,
      water: 71,
      biodiversity: 68,
      soil: 78,
      energy: 65,
    }),
    []
  );

  const recommendations = [
    {
      title: 'Expand cover cropping to all fields',
      description: 'Adding cover crops to your remaining 3 fields could boost your soil score by 8 points.',
      impact: '+8 soil score',
      category: 'soil' as const,
    },
    {
      title: 'Install solar-powered irrigation pump',
      description: 'Replacing your diesel pump with solar could cut energy costs by 60% and improve your energy score.',
      impact: '+15 energy score',
      category: 'energy' as const,
    },
    {
      title: 'Plant pollinator hedgerows along field borders',
      description: 'Native hedgerows can dramatically increase pollinator diversity and your biodiversity score.',
      impact: '+12 biodiversity score',
      category: 'biodiversity' as const,
    },
    {
      title: 'Adopt rainwater harvesting systems',
      description: 'Capturing roof runoff for irrigation can reduce water consumption by 30%.',
      impact: '+10 water score',
      category: 'water' as const,
    },
  ];

  const categoryIcons = {
    carbon: { icon: Leaf, color: 'bg-green-100 text-green-600' },
    water: { icon: Droplets, color: 'bg-blue-100 text-blue-600' },
    biodiversity: { icon: TreePine, color: 'bg-emerald-100 text-emerald-600' },
    soil: { icon: Sprout, color: 'bg-amber-100 text-amber-600' },
    energy: { icon: Zap, color: 'bg-orange-100 text-orange-600' },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 py-4"
    >
      {/* ================================================================= */}
      {/* 1. HEADER BANNER                                                  */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-green-600 via-emerald-600 to-[#1B2A4A] p-5 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-20">
            <Leaf size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Leaf size={20} className="text-white/90" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Mkulima Hub
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">Sustainability & Carbon</h2>
            <p className="text-sm text-white/80 mt-1">
              Track your environmental impact and carbon credits
            </p>

            <Link
              href="/farm/sustainability/credits"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
            >
              <Award size={16} />
              View Credits
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 2. IMPACT METRICS                                                 */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Environmental Impact
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {impactMetrics.carbon && (
            <ImpactMetricCard
              icon={Leaf}
              label="Total Carbon Offset"
              value={formatNumber(impactMetrics.carbon.value)}
              unit="tonnes CO2e"
              trend={impactMetrics.carbon.trend}
              changePercent={impactMetrics.carbon.changePercent}
              color="bg-green-100 text-green-600"
            />
          )}
          {impactMetrics.water && (
            <ImpactMetricCard
              icon={Droplets}
              label="Water Saved"
              value={formatNumber(impactMetrics.water.value)}
              unit="litres"
              trend={impactMetrics.water.trend}
              changePercent={impactMetrics.water.changePercent}
              color="bg-blue-100 text-blue-600"
            />
          )}
          {impactMetrics.trees && (
            <ImpactMetricCard
              icon={TreePine}
              label="Trees Planted"
              value={formatNumber(impactMetrics.trees.value)}
              unit="trees"
              trend={impactMetrics.trees.trend}
              changePercent={impactMetrics.trees.changePercent}
              color="bg-emerald-100 text-emerald-600"
            />
          )}
          {impactMetrics.soil && (
            <ImpactMetricCard
              icon={Sprout}
              label="Soil Health Score"
              value={impactMetrics.soil.value.toString()}
              unit="/100"
              trend={impactMetrics.soil.trend}
              changePercent={impactMetrics.soil.changePercent}
              color="bg-amber-100 text-amber-600"
            />
          )}
          {impactMetrics.energy && (
            <div className="col-span-2">
              <ImpactMetricCard
                icon={Zap}
                label="Energy Savings"
                value={`${impactMetrics.energy.value}%`}
                unit="vs baseline year"
                trend={impactMetrics.energy.trend}
                changePercent={impactMetrics.energy.changePercent}
                color="bg-orange-100 text-orange-600"
              />
            </div>
          )}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 3. TAB SWITCHER                                                   */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-white text-[#1B2A4A] shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabLabels[tab]}
            </button>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 4. TAB CONTENT                                                    */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        {/* ─── My Projects Tab ─────────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <motion.section
            key="projects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#1B2A4A]">
                Active Projects ({sustainabilityProjects.filter((p) => p.status === 'active').length})
              </h3>
              <span className="text-xs text-gray-400">
                {sustainabilityProjects.length} total projects
              </span>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              {sustainabilityProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          </motion.section>
        )}

        {/* ─── Environmental Score Tab ─────────────────────────────────── */}
        {activeTab === 'score' && (
          <motion.section
            key="score"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 space-y-4"
          >
            {/* Overall Score */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
            >
              <div className="text-center mb-4">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">
                  Overall Sustainability Score
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Based on your farming practices and projects
                </p>
              </div>
              <ScoreCircle score={envScores.overall} />
              <div className="text-center mt-3">
                <div className="inline-flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                  <Star size={12} className="text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Good - Above Average
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Category Breakdown */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <h4 className="text-sm font-bold text-[#1B2A4A] mb-4">Category Breakdown</h4>
              <div className="space-y-4">
                <CategoryScoreBar
                  label="Carbon"
                  score={envScores.carbon}
                  color={categoryIcons.carbon.color}
                  icon={categoryIcons.carbon.icon}
                />
                <CategoryScoreBar
                  label="Water"
                  score={envScores.water}
                  color={categoryIcons.water.color}
                  icon={categoryIcons.water.icon}
                />
                <CategoryScoreBar
                  label="Biodiversity"
                  score={envScores.biodiversity}
                  color={categoryIcons.biodiversity.color}
                  icon={categoryIcons.biodiversity.icon}
                />
                <CategoryScoreBar
                  label="Soil Health"
                  score={envScores.soil}
                  color={categoryIcons.soil.color}
                  icon={categoryIcons.soil.icon}
                />
                <CategoryScoreBar
                  label="Energy"
                  score={envScores.energy}
                  color={categoryIcons.energy.color}
                  icon={categoryIcons.energy.icon}
                />
              </div>
            </motion.div>

            {/* Comparison Banner */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-[#2AA198]/10 to-[#D4A843]/10 rounded-2xl border border-[#2AA198]/20 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2AA198]/20 flex items-center justify-center flex-shrink-0">
                  <BarChart3 size={20} className="text-[#2AA198]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B2A4A]">Top 15% of AFU Farmers</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Your sustainability score ranks you among the top performers in the AFU network.
                    Keep up the excellent work!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-[#D4A843]" />
                <h4 className="text-sm font-bold text-[#1B2A4A]">Recommendations</h4>
              </div>
              <div className="space-y-3">
                {recommendations.map((rec, idx) => {
                  const catInfo = categoryIcons[rec.category];
                  const CatIcon = catInfo.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${catInfo.color}`}
                      >
                        <CatIcon size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1B2A4A]">{rec.title}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                          {rec.description}
                        </p>
                        <div className="flex items-center gap-1 mt-1.5">
                          <ArrowRight size={10} className="text-[#2AA198]" />
                          <span className="text-[10px] font-semibold text-[#2AA198]">
                            {rec.impact}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* ─── Marketplace Tab ─────────────────────────────────────────── */}
        {activeTab === 'marketplace' && (
          <motion.section
            key="marketplace"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="px-4 space-y-5"
          >
            {/* Price Trend */}
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <PriceTrendChart />
            </motion.div>

            {/* Available Credits */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">
                  Available Credits ({listedCredits.length})
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Tag size={12} />
                  <span>Listed for sale</span>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {listedCredits.map((credit) => (
                  <MarketplaceCreditCard key={credit.id} credit={credit} />
                ))}
              </motion.div>
            </div>

            {/* Your Credits for Sale */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1B2A4A]">Your Verified Credits</h3>
                <span className="text-xs text-gray-400">
                  {yourListedCredits.length} credits available to list
                </span>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {yourListedCredits.map((credit) => (
                  <motion.div
                    key={credit.id}
                    variants={cardVariants}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${creditTypeColors[credit.type]}`}
                        >
                          {creditTypeLabels[credit.type]}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {credit.vintageYear}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-[#1B2A4A] truncate">
                        {credit.projectName}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {credit.credits} tCO2e &middot; {formatCurrency(credit.pricePerTonne)}/t
                      </p>
                    </div>
                    <button className="px-3 py-2 rounded-lg bg-[#1B2A4A] text-white text-xs font-semibold hover:bg-[#1B2A4A]/90 active:scale-[0.98] transition-all flex-shrink-0">
                      List for Sale
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Marketplace Info */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="bg-gradient-to-r from-[#1B2A4A]/5 to-[#2AA198]/5 rounded-2xl border border-[#1B2A4A]/10 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B2A4A]/10 flex items-center justify-center flex-shrink-0">
                  <BadgeCheck size={20} className="text-[#1B2A4A]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1B2A4A]">Verified Carbon Marketplace</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    All credits traded on the AFU marketplace are verified by internationally
                    recognised bodies including Verra (VCS), Gold Standard, and Puro.earth. Credits
                    are transparently tracked and retired on public registries.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
