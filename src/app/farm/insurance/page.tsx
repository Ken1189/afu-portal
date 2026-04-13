'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  DollarSign,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Calculator,
  ChevronRight,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import FeatureGate from '@/components/ui/FeatureGate';
import { useMembershipTier } from '@/lib/membership-context';
import { useInsurancePolicies, useInsuranceClaims } from '@/lib/supabase/use-insurance';

// ---------------------------------------------------------------------------
// Inlined types & data (previously from @/lib/data/insurance)
// ---------------------------------------------------------------------------

type InsuranceType = 'crop' | 'livestock' | 'equipment' | 'weather-index';
type PolicyStatus = 'active' | 'expired' | 'pending' | 'cancelled';
type ClaimStatus = 'submitted' | 'under-review' | 'approved' | 'rejected' | 'paid';

interface InsurancePolicy {
  id: string;
  productId: string;
  productName: string;
  type: InsuranceType;
  status: PolicyStatus;
  startDate: string;
  endDate: string;
  premiumAmount: number;
  premiumFrequency: 'monthly' | 'quarterly' | 'annual';
  nextPremiumDue: string;
  coverageAmount: number;
  deductible: number;
  coveredItems: string[];
  claimsCount: number;
  lastClaimDate: string | null;
}

interface InsuranceClaim {
  id: string;
  policyId: string;
  policyName: string;
  type: InsuranceType;
  status: ClaimStatus;
  submittedDate: string;
  incidentDate: string;
  description: string;
  estimatedLoss: number;
  approvedAmount: number | null;
  paidDate: string | null;
  photos: number;
  timeline: { date: string; status: string; note: string }[];
}

const FALLBACK_INSURANCE_POLICIES: InsurancePolicy[] = [];

const FALLBACK_INSURANCE_CLAIMS: InsuranceClaim[] = [];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      ease: 'easeOut' as const,
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

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 22,
    },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const typeIcons: Record<InsuranceType, string> = {
  crop: '●',
  livestock: '●',
  equipment: '●',
  'weather-index': '●',
};

const typeLabels: Record<InsuranceType, string> = {
  crop: 'Crop',
  livestock: 'Livestock',
  equipment: 'Equipment',
  'weather-index': 'Weather Index',
};

const typeColors: Record<InsuranceType, string> = {
  crop: '#8CB89C',
  livestock: '#D4A843',
  equipment: '#1B2A4A',
  'weather-index': '#6366F1',
};

const statusBadge: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  expired: 'bg-gray-50 text-gray-500 border-gray-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Custom Tooltip for PieChart
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 px-3 py-2">
        <p className="text-xs font-semibold text-navy">{payload[0].name}</p>
        <p className="text-xs text-gray-500">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InsuranceHomePage() {
  const { t } = useLanguage();
  const { membershipTier } = useMembershipTier();

  // --- Supabase data ---
  const { policies: dbPolicies, loading: policiesLoading } = useInsurancePolicies();
  const { claims: dbClaims, loading: claimsLoading } = useInsuranceClaims();
  const loading = policiesLoading || claimsLoading;

  // Map DB rows → local shape, fall back to mock when DB returns nothing
  const insurancePolicies: InsurancePolicy[] = useMemo(() => {
    if (dbPolicies.length > 0) {
      return dbPolicies.map((p) => ({
        id: p.policy_number || p.id,
        productId: p.product_id,
        productName: p.product?.name || 'Insurance Policy',
        type: (p.product?.type || 'crop') as InsuranceType,
        status: p.status as PolicyStatus,
        startDate: p.start_date,
        endDate: p.end_date,
        premiumAmount: p.premium,
        premiumFrequency: 'monthly' as const,
        nextPremiumDue: p.end_date,
        coverageAmount: p.coverage_amount,
        deductible: p.product?.deductible_percent || 10,
        coveredItems: [],
        claimsCount: 0,
        lastClaimDate: null,
      }));
    }
    if (policiesLoading) return [];
    return FALLBACK_INSURANCE_POLICIES;
  }, [dbPolicies, policiesLoading]);

  const insuranceClaims: InsuranceClaim[] = useMemo(() => {
    if (dbClaims.length > 0) {
      return dbClaims.map((c) => ({
        id: c.id,
        policyId: c.policy_id,
        policyName: '',
        type: 'crop' as InsuranceType,
        status: c.status as ClaimStatus,
        submittedDate: c.submitted_at,
        incidentDate: c.submitted_at,
        description: c.description || '',
        estimatedLoss: c.claim_amount,
        approvedAmount: c.approved_amount,
        paidDate: c.reviewed_at,
        photos: c.evidence_urls?.length || 0,
        timeline: [],
      }));
    }
    if (claimsLoading) return [];
    return FALLBACK_INSURANCE_CLAIMS;
  }, [dbClaims, claimsLoading]);

  // Compute stats from data
  const stats = useMemo(() => {
    const activePolicies = insurancePolicies.filter((p) => p.status === 'active');
    const totalCoverage = activePolicies.reduce((sum, p) => sum + p.coverageAmount, 0);
    const monthlyPremium = activePolicies
      .filter((p) => p.premiumFrequency === 'monthly')
      .reduce((sum, p) => sum + p.premiumAmount, 0);
    const pendingClaims = insuranceClaims.filter(
      (c) => c.status === 'submitted' || c.status === 'under-review'
    ).length;

    return {
      activePoliciesCount: activePolicies.length,
      totalCoverage,
      monthlyPremium,
      pendingClaims,
      activePolicies,
    };
  }, [insurancePolicies, insuranceClaims]);

  // Coverage by type for pie chart
  const coverageByType = useMemo(() => {
    const activePolicies = insurancePolicies.filter((p) => p.status === 'active');
    const grouped: Record<string, number> = {};
    activePolicies.forEach((p) => {
      grouped[p.type] = (grouped[p.type] || 0) + p.coverageAmount;
    });
    return Object.entries(grouped).map(([type, value]) => ({
      name: typeLabels[type as InsuranceType],
      value,
      fill: typeColors[type as InsuranceType],
    }));
  }, [insurancePolicies]);

  // Quick links
  const quickLinks = [
    {
      href: '/farm/insurance/policies',
      label: t.insurance.myPolicies,
      icon: FileText,
      color: 'bg-[#5DB347]/10 text-[#5DB347]',
      iconBg: 'bg-[#5DB347]/15',
    },
    {
      href: '/farm/insurance/claim',
      label: t.insurance.fileClaim,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-100',
    },
    {
      href: '/farm/insurance/products',
      label: t.insurance.browseProducts,
      icon: Search,
      color: 'bg-indigo-50 text-indigo-700',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/farm/insurance/quote',
      label: t.insurance.getQuote,
      icon: Calculator,
      color: 'bg-green-50 text-green-700',
      iconBg: 'bg-green-100',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading insurance data...</span>
      </div>
    );
  }

  return (
    <FeatureGate feature="insurance" tier={membershipTier}>
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 py-4"
    >
      {/* ================================================================= */}
      {/* 1. WELCOME BANNER                                                 */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#5DB347] to-[#449933] p-5 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-20">
            <Shield size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-white/90" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Mkulima Hub
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">{t.insurance.title}</h2>
            <p className="text-sm text-white/80 mt-1">{t.insurance.subtitle}</p>

            <Link
              href="/farm/insurance/claim"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-white/15 active:bg-white/25 text-sm font-medium transition-colors min-h-[44px]"
            >
              <AlertTriangle size={16} />
              {t.insurance.fileClaim}
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 2. STAT CARDS (2x2 grid)                                          */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Active Policies */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-[#5DB347]/10 flex items-center justify-center">
                <ShieldCheck size={14} className="text-[#5DB347]" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {t.insurance.activePolicies}
              </span>
            </div>
            <p className="text-2xl font-bold text-[#5DB347]">{stats.activePoliciesCount}</p>
          </motion.div>

          {/* Total Coverage */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center">
                <TrendingUp size={14} className="text-green-600" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {t.insurance.totalCoverage}
              </span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.totalCoverage)}
            </p>
          </motion.div>

          {/* Monthly Premium */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                <DollarSign size={14} className="text-gold" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {t.insurance.monthlyPremium}
              </span>
            </div>
            <p className="text-2xl font-bold text-gold">
              {formatCurrency(stats.monthlyPremium)}
            </p>
          </motion.div>

          {/* Pending Claims */}
          <motion.div
            variants={cardVariants}
            className="rounded-2xl bg-white border border-gray-100 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                <Clock size={14} className="text-red-500" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {t.insurance.pendingClaims}
              </span>
            </div>
            <p className="text-2xl font-bold text-red-500">{stats.pendingClaims}</p>
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 3. COVERAGE DONUT CHART                                           */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="rounded-2xl bg-white border border-gray-100 p-4">
          <h3 className="text-sm font-bold text-navy mb-3">
            {t.insurance.coverage} by Type
          </h3>

          <div className="flex items-center gap-4">
            {/* Chart */}
            <div className="w-[140px] h-[140px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coverageByType}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {coverageByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-2.5">
              {coverageByType.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: entry.fill }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-navy truncate">{entry.name}</p>
                    <p className="text-[11px] text-gray-400">{formatCurrency(entry.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 4. QUICK LINKS (2-col grid)                                       */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="grid grid-cols-2 gap-2.5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-2xl ${link.color} p-4 active:scale-[0.97] transition-transform min-h-[44px]`}
              >
                <div
                  className={`w-10 h-10 rounded-xl ${link.iconBg} flex items-center justify-center mb-2`}
                >
                  <Icon size={20} />
                </div>
                <p className="text-sm font-semibold leading-tight">{link.label}</p>
                <ChevronRight size={14} className="mt-1 opacity-50" />
              </Link>
            );
          })}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* 5. ACTIVE POLICIES PREVIEW                                        */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-navy">{t.insurance.activePolicies}</h3>
          <Link
            href="/farm/insurance/policies"
            className="text-xs text-[#5DB347] font-medium flex items-center gap-0.5"
          >
            {t.common.viewAll} <ChevronRight size={14} />
          </Link>
        </div>

        <div className="space-y-2.5">
          {stats.activePolicies.slice(0, 3).map((policy) => (
            <motion.div
              key={policy.id}
              variants={cardVariants}
              className="rounded-2xl bg-white border border-gray-100 p-3.5"
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl shrink-0">
                  {typeIcons[policy.type]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-navy truncate">
                      {policy.productName}
                    </p>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${
                        statusBadge[policy.status]
                      }`}
                    >
                      {policy.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">{policy.id}</p>

                  <div className="flex items-center gap-4 mt-2">
                    <div>
                      <p className="text-[10px] text-gray-400">{t.insurance.coverageAmount}</p>
                      <p className="text-sm font-bold text-green-600">
                        {formatCurrency(policy.coverageAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">{t.insurance.premium}</p>
                      <p className="text-sm font-semibold text-navy">
                        {formatCurrency(policy.premiumAmount)}
                        <span className="text-[10px] text-gray-400 font-normal">
                          {t.insurance.perMonth}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Next payment */}
                  <div className="flex items-center gap-1.5 mt-2">
                    <Clock size={11} className="text-gray-300" />
                    <p className="text-[11px] text-gray-400">
                      {t.insurance.nextPayment}:{' '}
                      <span className="font-medium text-navy">
                        {new Date(policy.nextPremiumDue).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>
    </motion.div>
    </FeatureGate>
  );
}
