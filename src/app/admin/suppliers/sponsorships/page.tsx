'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Award,
  Crown,
  Star,
  Shield,
  Medal,
  CheckCircle2,
  X,
  DollarSign,
  Users,
  FileText,
  Send,
  Pencil,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Headphones,
  BarChart3,
  CalendarDays,
  Code2,
  Layout,
  Megaphone,
  Zap,
} from 'lucide-react';
import { suppliers as mockSuppliers, type SponsorshipTier } from '@/lib/data/suppliers';
const suppliers = mockSuppliers;

// ── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ── Tier configuration ────────────────────────────────────────────────────

interface TierConfig {
  key: SponsorshipTier;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  gradientFrom: string;
  gradientTo: string;
  annualFee: number;
  setupFee: number;
  description: string;
}

const tierConfigs: TierConfig[] = [
  {
    key: 'platinum',
    label: 'Platinum',
    icon: <Crown className="w-6 h-6" />,
    color: 'text-gray-800',
    bgColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
    borderColor: 'border-gray-300',
    gradientFrom: 'from-gray-700',
    gradientTo: 'to-gray-900',
    annualFee: 25000,
    setupFee: 5000,
    description: 'Premium tier with maximum visibility, dedicated support, and exclusive benefits.',
  },
  {
    key: 'gold',
    label: 'Gold',
    icon: <Star className="w-6 h-6" />,
    color: 'text-yellow-700',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-300',
    gradientFrom: 'from-yellow-600',
    gradientTo: 'to-amber-700',
    annualFee: 15000,
    setupFee: 3000,
    description: 'Enhanced presence with priority placement and advanced analytics access.',
  },
  {
    key: 'silver',
    label: 'Silver',
    icon: <Shield className="w-6 h-6" />,
    color: 'text-gray-600',
    bgColor: 'bg-gradient-to-br from-gray-50 to-slate-100',
    borderColor: 'border-gray-200',
    gradientFrom: 'from-gray-500',
    gradientTo: 'to-slate-600',
    annualFee: 8000,
    setupFee: 1500,
    description: 'Strong foundation with featured listings and standard analytics.',
  },
  {
    key: 'bronze',
    label: 'Bronze',
    icon: <Medal className="w-6 h-6" />,
    color: 'text-orange-700',
    bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
    borderColor: 'border-orange-200',
    gradientFrom: 'from-orange-600',
    gradientTo: 'to-amber-700',
    annualFee: 3000,
    setupFee: 500,
    description: 'Entry-level sponsorship with basic branding and marketplace presence.',
  },
];

// ── Benefits matrix ───────────────────────────────────────────────────────

interface Benefit {
  name: string;
  icon: React.ReactNode;
  platinum: string | boolean;
  gold: string | boolean;
  silver: string | boolean;
  bronze: string | boolean;
}

const benefits: Benefit[] = [
  {
    name: 'Logo Placement',
    icon: <Layout className="w-4 h-4" />,
    platinum: 'Homepage + All pages',
    gold: 'Homepage + Category',
    silver: 'Category page',
    bronze: 'Supplier directory',
  },
  {
    name: 'Featured Listing',
    icon: <Sparkles className="w-4 h-4" />,
    platinum: 'Top of all searches',
    gold: 'Top of category',
    silver: 'Highlighted in category',
    bronze: 'Standard listing',
  },
  {
    name: 'Ad Credits (Annual)',
    icon: <Megaphone className="w-4 h-4" />,
    platinum: '$5,000',
    gold: '$2,500',
    silver: '$1,000',
    bronze: '$250',
  },
  {
    name: 'Commission Discount',
    icon: <DollarSign className="w-4 h-4" />,
    platinum: '3% reduction',
    gold: '2% reduction',
    silver: '1% reduction',
    bronze: '0.5% reduction',
  },
  {
    name: 'Support Level',
    icon: <Headphones className="w-4 h-4" />,
    platinum: 'Dedicated manager',
    gold: 'Priority support',
    silver: 'Standard support',
    bronze: 'Email support',
  },
  {
    name: 'API Access',
    icon: <Code2 className="w-4 h-4" />,
    platinum: true,
    gold: true,
    silver: 'Read-only',
    bronze: false,
  },
  {
    name: 'Analytics Access',
    icon: <BarChart3 className="w-4 h-4" />,
    platinum: 'Full + Market insights',
    gold: 'Full analytics',
    silver: 'Basic analytics',
    bronze: 'Sales summary only',
  },
  {
    name: 'Annual Meeting Invitation',
    icon: <CalendarDays className="w-4 h-4" />,
    platinum: 'VIP + Speaking slot',
    gold: 'VIP attendance',
    silver: true,
    bronze: false,
  },
];

// ── Donut chart colors ────────────────────────────────────────────────────

const pieColors: Record<SponsorshipTier, string> = {
  platinum: '#374151',
  gold: '#D97706',
  silver: '#6B7280',
  bronze: '#EA580C',
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function SponsorshipsPage() {
  // ── Compute sponsor data ──────────────────────────────────────────────
  const sponsoredSuppliers = useMemo(
    () => suppliers.filter((s) => s.sponsorshipTier !== null),
    []
  );

  const sponsorsByTier = useMemo(() => {
    const grouped: Record<SponsorshipTier, typeof suppliers> = {
      platinum: [],
      gold: [],
      silver: [],
      bronze: [],
    };
    sponsoredSuppliers.forEach((s) => {
      if (s.sponsorshipTier) grouped[s.sponsorshipTier].push(s);
    });
    return grouped;
  }, [sponsoredSuppliers]);

  const totalSponsorshipRevenue = useMemo(() => {
    let total = 0;
    sponsoredSuppliers.forEach((s) => {
      const tier = tierConfigs.find((t) => t.key === s.sponsorshipTier);
      if (tier) total += tier.annualFee;
    });
    return total;
  }, [sponsoredSuppliers]);

  const donutData = useMemo(
    () =>
      tierConfigs
        .map((t) => ({
          name: t.label,
          value: sponsorsByTier[t.key].length,
          color: pieColors[t.key],
        }))
        .filter((d) => d.value > 0),
    [sponsorsByTier]
  );

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/suppliers"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-navy transition-colors mb-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Suppliers
          </Link>
          <h1 className="text-2xl font-bold text-navy">Sponsorship Tiers</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage founding sponsor tiers, benefits, and pricing</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="inline-flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Send className="w-4 h-4" />
            Invite Sponsor
          </button>
          <button className="inline-flex items-center gap-2 bg-navy hover:bg-navy/90 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Pencil className="w-4 h-4" />
            Edit Benefits
          </button>
          <button className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors">
            <Download className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          HERO - 4 TIER CARDS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tierConfigs.map((tier) => (
          <motion.div
            key={tier.key}
            variants={cardVariants}
            whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(27,42,74,0.12)' }}
            className={`relative rounded-xl border ${tier.borderColor} overflow-hidden`}
          >
            {/* Header gradient strip */}
            <div className={`h-2 bg-gradient-to-r ${tier.gradientFrom} ${tier.gradientTo}`} />
            <div className={`p-5 ${tier.bgColor}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-xl bg-white/80 flex items-center justify-center ${tier.color} shadow-sm`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="font-bold text-navy text-lg">{tier.label}</h3>
                  <p className="text-xs text-gray-500">
                    {sponsorsByTier[tier.key].length} sponsor{sponsorsByTier[tier.key].length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{tier.description}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-navy">${tier.annualFee.toLocaleString()}</span>
                <span className="text-xs text-gray-400">/year</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">+ ${tier.setupFee.toLocaleString()} setup</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          BENEFITS MATRIX
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-navy text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-gold" />
            Benefits Matrix
          </h2>
          <p className="text-xs text-gray-400 mt-1">Compare sponsorship benefits across all tiers</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cream/50 border-b border-gray-100">
                <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">
                  Benefit
                </th>
                {tierConfigs.map((tier) => (
                  <th
                    key={tier.key}
                    className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider min-w-[140px]"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span className={tier.color}>{tier.icon}</span>
                      <span className="text-gray-600">{tier.label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {benefits.map((benefit, i) => (
                <tr key={i} className="hover:bg-cream/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{benefit.icon}</span>
                      <span className="font-medium text-navy text-sm">{benefit.name}</span>
                    </div>
                  </td>
                  {(['platinum', 'gold', 'silver', 'bronze'] as SponsorshipTier[]).map((tierKey) => {
                    const val = benefit[tierKey];
                    return (
                      <td key={tierKey} className="py-3 px-4 text-center">
                        {val === true ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                        ) : val === false ? (
                          <X className="w-5 h-5 text-gray-300 mx-auto" />
                        ) : (
                          <span className="text-xs text-gray-600 font-medium">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          TIER PRICING SECTION
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div
        variants={cardVariants}
        className="bg-white rounded-xl border border-gray-100 p-5"
      >
        <h2 className="font-semibold text-navy text-sm flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-teal" />
          Tier Pricing
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Annual Fee</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Setup Fee (One-time)</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total First Year</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Sponsors</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue (Annual)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tierConfigs.map((tier) => {
                const count = sponsorsByTier[tier.key].length;
                return (
                  <tr key={tier.key} className="hover:bg-cream/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={tier.color}>{tier.icon}</span>
                        <span className="font-semibold text-navy">{tier.label}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-navy tabular-nums">
                      ${tier.annualFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-500 tabular-nums">
                      ${tier.setupFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-navy tabular-nums">
                      ${(tier.annualFee + tier.setupFee).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-cream font-semibold text-navy text-sm">
                        {count}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-navy tabular-nums">
                      ${(tier.annualFee * count).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-cream/50">
                <td className="py-3 px-4 font-bold text-navy" colSpan={4}>Total Annual Revenue</td>
                <td className="py-3 px-4 text-center font-bold text-navy">{sponsoredSuppliers.length}</td>
                <td className="py-3 px-4 text-right font-bold text-navy text-lg tabular-nums">
                  ${totalSponsorshipRevenue.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          SUMMARY STATS + DONUT
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary Cards */}
        <motion.div variants={cardVariants} className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal/10 flex items-center justify-center text-teal">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Sponsorship Revenue</p>
                <p className="text-2xl font-bold text-navy">${totalSponsorshipRevenue.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Annual recurring revenue from all sponsor tiers</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Sponsors</p>
                <p className="text-2xl font-bold text-navy">{sponsoredSuppliers.length}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tierConfigs.map((tier) => (
                <span
                  key={tier.key}
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${tier.borderColor} ${tier.color}`}
                >
                  {sponsorsByTier[tier.key].length} {tier.label}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-navy/10 flex items-center justify-center text-navy">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Avg Revenue per Sponsor</p>
                <p className="text-2xl font-bold text-navy">
                  {sponsoredSuppliers.length > 0
                    ? formatCurrency(Math.round(totalSponsorshipRevenue / sponsoredSuppliers.length))
                    : '$0'}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Average annual fee across all active sponsors</p>
          </div>
        </motion.div>

        {/* Donut Chart */}
        <motion.div
          variants={cardVariants}
          className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Sponsors by Tier</h3>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${Number(value)} sponsor${Number(value) !== 1 ? 's' : ''}`, 'Count']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value: string) => <span className="text-gray-600 font-medium">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          CURRENT SPONSORS BY TIER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={containerVariants} className="space-y-6">
        {tierConfigs.map((tier) => {
          const tierSuppliers = sponsorsByTier[tier.key];
          if (tierSuppliers.length === 0) return null;

          return (
            <motion.div
              key={tier.key}
              variants={cardVariants}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              {/* Tier header */}
              <div className={`px-5 py-3 border-b border-gray-100 flex items-center gap-3 ${tier.bgColor}`}>
                <div className={`w-8 h-8 rounded-lg bg-white/80 flex items-center justify-center ${tier.color} shadow-sm`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-navy text-sm">{tier.label} Sponsors</h3>
                  <p className="text-xs text-gray-500">{tierSuppliers.length} active sponsor{tierSuppliers.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Sponsor cards */}
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {tierSuppliers.map((supplier) => (
                    <Link
                      key={supplier.id}
                      href={`/admin/suppliers/${supplier.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-teal/30 hover:shadow-sm transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                        <img
                          src={supplier.logo}
                          alt={supplier.companyName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-navy text-sm truncate group-hover:text-teal transition-colors">
                            {supplier.companyName}
                          </p>
                          {supplier.verified && <ShieldCheck className="w-3.5 h-3.5 text-teal flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{supplier.region}, {supplier.country}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-500">{supplier.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-300 mx-1">|</span>
                          <span className="text-xs text-gray-500">{formatCurrency(supplier.totalSales)} sales</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-teal flex-shrink-0 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
