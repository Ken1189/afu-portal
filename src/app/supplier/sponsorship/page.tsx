'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import {
  Star,
  ArrowLeft,
  Check,
  X,
  Crown,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Award,
  LayoutDashboard,
  Megaphone,
  Percent,
  UserCheck,
  Sparkles,
  Globe,
  BarChart3,
  CalendarClock,
  ArrowUpRight,
  RefreshCcw,
  ChevronUp,
  Shield,
  Mic,
} from 'lucide-react';
import { suppliers } from '@/lib/data/suppliers';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ── Supplier context ────────────────────────────────────────────────────────

const currentSupplier = suppliers.find((s) => s.id === 'SUP-001')!;

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ── Tier definitions ────────────────────────────────────────────────────────

interface TierDef {
  id: string;
  label: string;
  price: string;
  priceValue: number;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const tiers: TierDef[] = [
  {
    id: 'bronze',
    label: 'Bronze',
    price: '$500/yr',
    priceValue: 500,
    color: '#CD7F32',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-700',
  },
  {
    id: 'silver',
    label: 'Silver',
    price: '$2,500/yr',
    priceValue: 2500,
    color: '#A0A0A0',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-600',
  },
  {
    id: 'gold',
    label: 'Gold',
    price: '$10,000/yr',
    priceValue: 10000,
    color: '#D4A843',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
  },
  {
    id: 'platinum',
    label: 'Platinum',
    price: '$25,000/yr',
    priceValue: 25000,
    color: '#2AA198',
    bgColor: 'bg-[#2AA198]/5',
    borderColor: 'border-[#2AA198]/30',
    textColor: 'text-[#2AA198]',
  },
];

// ── Benefits grid ───────────────────────────────────────────────────────────

interface Benefit {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  tiers: string[]; // which tiers include this benefit
}

const benefits: Benefit[] = [
  {
    id: 'priority-listing',
    label: 'Priority listing in marketplace',
    description: 'Your products appear at the top of search results and category pages',
    icon: <LayoutDashboard className="w-5 h-5" />,
    tiers: ['bronze', 'silver', 'gold', 'platinum'],
  },
  {
    id: 'featured-banner',
    label: 'Featured banner placement',
    description: 'Complimentary banner ad slots per month (varies by tier)',
    icon: <Megaphone className="w-5 h-5" />,
    tiers: ['silver', 'gold', 'platinum'],
  },
  {
    id: 'reduced-commission',
    label: 'Reduced commission rate',
    description: 'Lower marketplace commission (5% vs standard 10%)',
    icon: <Percent className="w-5 h-5" />,
    tiers: ['gold', 'platinum'],
  },
  {
    id: 'account-manager',
    label: 'Dedicated account manager',
    description: 'Personal point of contact for all platform needs',
    icon: <UserCheck className="w-5 h-5" />,
    tiers: ['gold', 'platinum'],
  },
  {
    id: 'early-access',
    label: 'Early access to new features',
    description: 'Preview and test new platform features before general release',
    icon: <Sparkles className="w-5 h-5" />,
    tiers: ['silver', 'gold', 'platinum'],
  },
  {
    id: 'logo-website',
    label: 'Logo on AFU website',
    description: 'Brand visibility on the AFU main website and marketing materials',
    icon: <Globe className="w-5 h-5" />,
    tiers: ['gold', 'platinum'],
  },
  {
    id: 'quarterly-insights',
    label: 'Quarterly business insights report',
    description: 'Custom analytics report on market trends, buyer behavior, and opportunities',
    icon: <BarChart3 className="w-5 h-5" />,
    tiers: ['platinum'],
  },
  {
    id: 'event-speaking',
    label: 'Event speaking opportunities',
    description: 'Invitation to speak at AFU conferences, webinars, and field days',
    icon: <Mic className="w-5 h-5" />,
    tiers: ['platinum'],
  },
];

// ── Comparison table data ───────────────────────────────────────────────────

interface ComparisonRow {
  feature: string;
  bronze: string | boolean;
  silver: string | boolean;
  gold: string | boolean;
  platinum: string | boolean;
}

const comparisonRows: ComparisonRow[] = [
  { feature: 'Priority marketplace listing', bronze: true, silver: true, gold: true, platinum: true },
  { feature: 'Featured banner slots/month', bronze: false, silver: '1/month', gold: '2/month', platinum: '4/month' },
  { feature: 'Commission rate', bronze: '9%', silver: '8%', gold: '6%', platinum: '5%' },
  { feature: 'Dedicated account manager', bronze: false, silver: false, gold: true, platinum: true },
  { feature: 'Early access to features', bronze: false, silver: true, gold: true, platinum: true },
  { feature: 'Logo on AFU website', bronze: false, silver: false, gold: true, platinum: true },
  { feature: 'Quarterly insights report', bronze: false, silver: false, gold: false, platinum: true },
  { feature: 'Event speaking opportunities', bronze: false, silver: false, gold: false, platinum: true },
  { feature: 'Training content sponsorship', bronze: false, silver: false, gold: '1 module', platinum: '3 modules' },
  { feature: 'Annual co-marketing budget', bronze: false, silver: '$200', gold: '$1,000', platinum: '$5,000' },
  { feature: 'Data export access', bronze: 'Basic', silver: 'Standard', gold: 'Advanced', platinum: 'Full API' },
  { feature: 'Support response time', bronze: '48hrs', silver: '24hrs', gold: '12hrs', platinum: '4hrs' },
];

// ── Impact metrics ──────────────────────────────────────────────────────────

const impactMetrics = [
  {
    label: 'Farmers Reached',
    value: '1,240',
    icon: <Users className="w-5 h-5" />,
    change: '+12%',
    bgColor: 'bg-green-50',
    color: 'text-green-600',
  },
  {
    label: 'Revenue from AFU',
    value: '$847K',
    icon: <DollarSign className="w-5 h-5" />,
    change: '+22%',
    bgColor: 'bg-[#2AA198]/10',
    color: 'text-[#2AA198]',
  },
  {
    label: 'Products Listed',
    value: '12',
    icon: <Package className="w-5 h-5" />,
    change: '+3',
    bgColor: 'bg-blue-50',
    color: 'text-blue-600',
  },
  {
    label: 'Average Order Value',
    value: '$380',
    icon: <ShoppingCart className="w-5 h-5" />,
    change: '+8%',
    bgColor: 'bg-amber-50',
    color: 'text-[#D4A843]',
  },
];

// ── Monthly performance data for chart ──────────────────────────────────────

const monthlyPerformance = [
  { month: 'Oct', farmers: 820, revenue: 56000 },
  { month: 'Nov', farmers: 910, revenue: 68000 },
  { month: 'Dec', farmers: 980, revenue: 72000 },
  { month: 'Jan', farmers: 1050, revenue: 78000 },
  { month: 'Feb', farmers: 1140, revenue: 85000 },
  { month: 'Mar', farmers: 1240, revenue: 94000 },
];

// ── Renewal details ─────────────────────────────────────────────────────────

const renewalStart = '2026-01-01';
const renewalEnd = '2026-12-31';
const now = new Date();
const endDate = new Date(renewalEnd);
const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

// ── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-[#1B2A4A] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-[#1B2A4A]">
            {entry.name === 'Revenue' ? formatCurrency(entry.value) : entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SponsorshipProgram() {
  const [showUpgradeInfo, setShowUpgradeInfo] = useState(false);
  const currentTierIndex = tiers.findIndex((t) => t.id === currentSupplier.sponsorshipTier);
  const currentTier = tiers[currentTierIndex];

  // Current benefits for this tier
  const currentBenefits = benefits.filter((b) =>
    b.tiers.includes(currentSupplier.sponsorshipTier || '')
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/supplier"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Founding Sponsorship</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Your sponsorship benefits and program details
          </p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CURRENT TIER BADGE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="rounded-xl p-6 text-white relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #D4A843 0%, #B8912E 50%, #8B6914 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/20" />
          <div className="absolute -bottom-14 -left-14 w-72 h-72 rounded-full bg-white/10" />
        </div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Star className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white/70 text-xs font-medium uppercase tracking-widest">
                  Current Tier
                </span>
                <Crown className="w-3.5 h-3.5 text-white/60" />
              </div>
              <h2 className="text-3xl font-bold">
                {currentTier?.label || 'Platinum'} Sponsor
              </h2>
              <p className="text-white/70 text-sm mt-0.5">
                {currentSupplier.companyName} &bull; Founding Member since{' '}
                {new Date(currentSupplier.joinDate).getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
              <p className="text-2xl font-bold tabular-nums">{daysRemaining}</p>
              <p className="text-[10px] text-white/70 uppercase tracking-wider">Days Left</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CURRENT BENEFITS GRID
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#2AA198]" />
          Current Benefits
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {currentBenefits.map((benefit, i) => (
            <motion.div
              key={benefit.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 4px 12px rgba(27,42,74,0.06)' }}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 cursor-default"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2AA198]/10 flex items-center justify-center text-[#2AA198] flex-shrink-0 mt-0.5">
                {benefit.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1B2A4A] leading-tight">{benefit.label}</p>
                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          TIER COMPARISON TABLE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-[#1B2A4A] text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#2AA198]" />
            Tier Comparison
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[180px]">
                  Feature
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.id}
                    className={`text-center py-3 px-3 text-xs font-medium uppercase tracking-wider min-w-[100px] ${
                      tier.id === currentSupplier.sponsorshipTier
                        ? 'bg-[#2AA198]/5'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`font-semibold ${
                          tier.id === currentSupplier.sponsorshipTier
                            ? 'text-[#2AA198]'
                            : 'text-gray-500'
                        }`}
                      >
                        {tier.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal normal-case">
                        {tier.price}
                      </span>
                      {tier.id === currentSupplier.sponsorshipTier && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#2AA198] text-white font-semibold">
                          Current
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {comparisonRows.map((row, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="hover:bg-cream/50 transition-colors"
                >
                  <td className="py-2.5 px-4 text-xs font-medium text-[#1B2A4A]">
                    {row.feature}
                  </td>
                  {(['bronze', 'silver', 'gold', 'platinum'] as const).map((tierId) => {
                    const val = row[tierId];
                    const isCurrentTier = tierId === currentSupplier.sponsorshipTier;
                    return (
                      <td
                        key={tierId}
                        className={`py-2.5 px-3 text-center ${
                          isCurrentTier ? 'bg-[#2AA198]/5' : ''
                        }`}
                      >
                        {val === true ? (
                          <Check className="w-4 h-4 text-[#2AA198] mx-auto" />
                        ) : val === false ? (
                          <X className="w-4 h-4 text-gray-300 mx-auto" />
                        ) : (
                          <span className={`text-xs font-medium ${isCurrentTier ? 'text-[#2AA198]' : 'text-gray-600'}`}>
                            {val}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          IMPACT METRICS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#2AA198]" />
          Impact Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {impactMetrics.map((metric, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -2, boxShadow: '0 6px 20px rgba(27,42,74,0.06)' }}
              className="bg-gray-50 rounded-xl p-4 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-9 h-9 rounded-lg ${metric.bgColor} flex items-center justify-center ${metric.color}`}>
                  {metric.icon}
                </div>
                <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                  <ArrowUpRight className="w-3 h-3" />
                  {metric.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#1B2A4A] tabular-nums">{metric.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{metric.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Performance chart */}
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyPerformance} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="farmers" name="Farmers Reached" radius={[4, 4, 0, 0]}>
                {monthlyPerformance.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === monthlyPerformance.length - 1 ? '#2AA198' : '#2AA198'}
                    opacity={0.4 + (index / monthlyPerformance.length) * 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          RENEWAL SECTION
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-[#1B2A4A] text-sm mb-4 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-[#2AA198]" />
          Sponsorship Renewal
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current period details */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Current Period</p>
                <p className="text-sm font-semibold text-[#1B2A4A]">
                  {new Date(renewalStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} -{' '}
                  {new Date(renewalEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Days Remaining</p>
                <p className="text-sm font-semibold text-[#1B2A4A] tabular-nums">{daysRemaining} days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-0.5">Current Tier</p>
                <p className="text-sm font-semibold text-[#D4A843]">
                  {currentTier?.label || 'Platinum'} ({currentTier?.price || '$25,000/yr'})
                </p>
              </div>
            </div>

            {/* Renewal progress */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">Sponsorship period progress</span>
                <span className="font-medium text-[#1B2A4A] tabular-nums">
                  {Math.round(((365 - daysRemaining) / 365) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((365 - daysRemaining) / 365) * 100}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  className="h-3 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #2AA198 0%, #D4A843 100%)',
                  }}
                />
              </div>
            </div>

            {/* Upgrade info */}
            {showUpgradeInfo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#2AA198]/5 border border-[#2AA198]/20 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#1B2A4A]">Upgrade Options</h4>
                  <button
                    onClick={() => setShowUpgradeInfo(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  You are currently on the highest tier. As a Platinum sponsor, you enjoy all available benefits.
                  Thank you for your continued support of the AFU community!
                </p>
                <div className="flex flex-wrap gap-2">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${
                        tier.id === currentSupplier.sponsorshipTier
                          ? 'bg-[#2AA198] text-white'
                          : 'bg-white border border-gray-200 text-gray-600'
                      }`}
                    >
                      {tier.label} - {tier.price}
                      {tier.id === currentSupplier.sponsorshipTier && ' (Current)'}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <button
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-medium transition-all hover:shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2AA198 0%, #1A7A72 100%)' }}
            >
              <RefreshCcw className="w-4 h-4" />
              Renew Sponsorship
            </button>
            <button
              onClick={() => setShowUpgradeInfo(!showUpgradeInfo)}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium border-2 border-[#D4A843] text-[#D4A843] hover:bg-[#D4A843]/5 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              Upgrade Tier
            </button>
            <p className="text-[10px] text-gray-400 text-center">
              Auto-renewal is enabled. You will be charged on{' '}
              {new Date(renewalEnd).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              .
            </p>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          FOUNDING MEMBER BADGE
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={fadeUp}
        className="rounded-xl p-5 border-2 border-dashed border-[#D4A843]/30 bg-[#D4A843]/5 text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-5 h-5 text-[#D4A843] fill-[#D4A843]" />
          <h3 className="font-bold text-[#1B2A4A] text-base">Founding Member</h3>
          <Star className="w-5 h-5 text-[#D4A843] fill-[#D4A843]" />
        </div>
        <p className="text-xs text-gray-500 max-w-lg mx-auto">
          As one of the original founding sponsors, {currentSupplier.companyName} has been instrumental in
          building the AFU marketplace. Your commitment to empowering African farmers through quality
          agricultural supplies and competitive pricing makes a real difference in the lives of over
          1,200 farming families across Botswana, Zimbabwe, and Tanzania.
        </p>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#2AA198]" />
            <span className="text-xs font-medium text-[#2AA198]">Verified Supplier</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-[#D4A843]" />
            <span className="text-xs font-medium text-[#D4A843]">{currentSupplier.rating} Rating</span>
          </div>
          <div className="flex items-center gap-1">
            <Package className="w-3.5 h-3.5 text-[#1B2A4A]" />
            <span className="text-xs font-medium text-[#1B2A4A]">{currentSupplier.productsCount} Products</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
