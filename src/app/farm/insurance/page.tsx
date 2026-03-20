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
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

const mockInsurancePolicies: InsurancePolicy[] = [
  {
    id: 'POL-001',
    productId: 'INS-PROD-001',
    productName: 'Crop Shield Basic',
    type: 'crop',
    status: 'active',
    startDate: '2025-10-01',
    endDate: '2026-09-30',
    premiumAmount: 28,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-01',
    coverageAmount: 3500,
    deductible: 10,
    coveredItems: ['Maize (Plot A - 2.1 ha)', 'Groundnuts (Plot B - 1.5 ha)'],
    claimsCount: 1,
    lastClaimDate: '2026-01-15',
  },
  {
    id: 'POL-002',
    productId: 'INS-PROD-003',
    productName: 'Livestock Guardian',
    type: 'livestock',
    status: 'active',
    startDate: '2025-11-15',
    endDate: '2026-11-14',
    premiumAmount: 45,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-15',
    coverageAmount: 6000,
    deductible: 15,
    coveredItems: ['Cattle (12 head)', 'Goats (8 head)'],
    claimsCount: 0,
    lastClaimDate: null,
  },
  {
    id: 'POL-003',
    productId: 'INS-PROD-005',
    productName: 'Weather Index',
    type: 'weather-index',
    status: 'active',
    startDate: '2025-12-01',
    endDate: '2026-05-31',
    premiumAmount: 18,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-01',
    coverageAmount: 1500,
    deductible: 0,
    coveredItems: ['All registered plots (3.6 ha total)'],
    claimsCount: 1,
    lastClaimDate: '2026-02-10',
  },
  {
    id: 'POL-004',
    productId: 'INS-PROD-004',
    productName: 'Equipment Protect',
    type: 'equipment',
    status: 'expired',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    premiumAmount: 35,
    premiumFrequency: 'quarterly',
    nextPremiumDue: '2026-01-01',
    coverageAmount: 4500,
    deductible: 10,
    coveredItems: ['Water pump (Honda WB30)', 'Maize sheller (manual)'],
    claimsCount: 1,
    lastClaimDate: '2025-08-20',
  },
  {
    id: 'POL-005',
    productId: 'INS-PROD-002',
    productName: 'Crop Shield Premium',
    type: 'crop',
    status: 'pending',
    startDate: '2026-04-01',
    endDate: '2027-03-31',
    premiumAmount: 55,
    premiumFrequency: 'monthly',
    nextPremiumDue: '2026-04-01',
    coverageAmount: 8000,
    deductible: 5,
    coveredItems: ['Soya Beans (Plot C - 1.8 ha)', 'Sunflower (Plot D - 0.9 ha)'],
    claimsCount: 0,
    lastClaimDate: null,
  },
];

const mockInsuranceClaims: InsuranceClaim[] = [
  {
    id: 'CLM-001',
    policyId: 'POL-001',
    policyName: 'Crop Shield Basic',
    type: 'crop',
    status: 'paid',
    submittedDate: '2026-01-15',
    incidentDate: '2026-01-12',
    description: 'Severe drought in January affected maize crop on Plot A. Rainfall recorded at 42% of average. Estimated 60% yield loss on 2.1 hectares.',
    estimatedLoss: 2100,
    approvedAmount: 1890,
    paidDate: '2026-02-05',
    photos: 4,
    timeline: [
      { date: '2026-01-15', status: 'Submitted', note: 'Claim submitted with 4 photos and weather station data' },
      { date: '2026-01-17', status: 'Under Review', note: 'Assigned to claims officer Grace Nkomo' },
      { date: '2026-01-22', status: 'Field Visit', note: 'Agronomist field inspection completed — confirmed drought damage' },
      { date: '2026-01-28', status: 'Approved', note: 'Claim approved for $1,890 (90% of estimated loss minus deductible)' },
      { date: '2026-02-05', status: 'Paid', note: 'Payment of $1,890 sent via EcoCash to registered mobile wallet' },
    ],
  },
  {
    id: 'CLM-002',
    policyId: 'POL-003',
    policyName: 'Weather Index',
    type: 'weather-index',
    status: 'paid',
    submittedDate: '2026-02-10',
    incidentDate: '2026-02-10',
    description: 'Automatic trigger: February rainfall at 58% of 10-year average. Weather index payout for all registered plots.',
    estimatedLoss: 750,
    approvedAmount: 750,
    paidDate: '2026-02-24',
    photos: 0,
    timeline: [
      { date: '2026-02-10', status: 'Auto-Triggered', note: 'Satellite data confirmed rainfall deficit (58% of average)' },
      { date: '2026-02-12', status: 'Processing', note: 'Automatic payout calculation: $750 based on coverage parameters' },
      { date: '2026-02-24', status: 'Paid', note: 'Automatic payment of $750 sent to registered account' },
    ],
  },
  {
    id: 'CLM-003',
    policyId: 'POL-004',
    policyName: 'Equipment Protect',
    type: 'equipment',
    status: 'paid',
    submittedDate: '2025-08-20',
    incidentDate: '2025-08-18',
    description: 'Water pump (Honda WB30) mechanical failure during irrigation. Motor seized due to bearing failure. Repair quote from authorized Honda dealer.',
    estimatedLoss: 850,
    approvedAmount: 765,
    paidDate: '2025-09-10',
    photos: 3,
    timeline: [
      { date: '2025-08-20', status: 'Submitted', note: 'Claim submitted with repair quote and 3 photos' },
      { date: '2025-08-23', status: 'Under Review', note: 'Quote verified with authorized Honda dealer' },
      { date: '2025-09-01', status: 'Approved', note: 'Claim approved for $765 (90% after deductible)' },
      { date: '2025-09-10', status: 'Paid', note: 'Payment sent via bank transfer' },
    ],
  },
  {
    id: 'CLM-004',
    policyId: 'POL-001',
    policyName: 'Crop Shield Basic',
    type: 'crop',
    status: 'under-review',
    submittedDate: '2026-03-10',
    incidentDate: '2026-03-08',
    description: 'Pest infestation (fall armyworm) detected on groundnut field (Plot B). Approximately 35% of crop affected across 1.5 hectares.',
    estimatedLoss: 980,
    approvedAmount: null,
    paidDate: null,
    photos: 6,
    timeline: [
      { date: '2026-03-10', status: 'Submitted', note: 'Claim submitted with 6 photos showing armyworm damage' },
      { date: '2026-03-12', status: 'Under Review', note: 'Assigned to claims officer — field visit scheduled for March 18' },
    ],
  },
  {
    id: 'CLM-005',
    policyId: 'POL-002',
    policyName: 'Livestock Guardian',
    type: 'livestock',
    status: 'submitted',
    submittedDate: '2026-03-14',
    incidentDate: '2026-03-13',
    description: 'Two goats lost to suspected predator attack (wild dogs) overnight. Found evidence of attack near northern boundary fence.',
    estimatedLoss: 450,
    approvedAmount: null,
    paidDate: null,
    photos: 3,
    timeline: [
      { date: '2026-03-14', status: 'Submitted', note: 'Claim submitted with photos and incident report' },
    ],
  },
  {
    id: 'CLM-006',
    policyId: 'POL-001',
    policyName: 'Crop Shield Basic',
    type: 'crop',
    status: 'rejected',
    submittedDate: '2025-11-05',
    incidentDate: '2025-10-28',
    description: 'Claim for crop damage due to late planting. Maize planted 6 weeks after recommended window resulted in poor germination.',
    estimatedLoss: 600,
    approvedAmount: null,
    paidDate: null,
    photos: 2,
    timeline: [
      { date: '2025-11-05', status: 'Submitted', note: 'Claim submitted citing poor germination' },
      { date: '2025-11-08', status: 'Under Review', note: 'Claims officer reviewing planting records' },
      { date: '2025-11-15', status: 'Rejected', note: 'Claim rejected — late planting is not a covered peril. Damage resulted from farmer action, not an insured event.' },
    ],
  },
  {
    id: 'CLM-007',
    policyId: 'POL-003',
    policyName: 'Weather Index',
    type: 'weather-index',
    status: 'approved',
    submittedDate: '2026-03-15',
    incidentDate: '2026-03-15',
    description: 'Automatic trigger: March rainfall tracking at 65% of average (below 70% threshold). Payout processing.',
    estimatedLoss: 500,
    approvedAmount: 500,
    paidDate: null,
    photos: 0,
    timeline: [
      { date: '2026-03-15', status: 'Auto-Triggered', note: 'Satellite data confirmed March rainfall deficit (65% of average)' },
      { date: '2026-03-16', status: 'Approved', note: 'Automatic payout of $500 approved — processing payment' },
    ],
  },
  {
    id: 'CLM-008',
    policyId: 'POL-002',
    policyName: 'Livestock Guardian',
    type: 'livestock',
    status: 'paid',
    submittedDate: '2025-12-20',
    incidentDate: '2025-12-18',
    description: 'One cow died from suspected tick-borne disease (East Coast Fever). Vet report confirming diagnosis attached.',
    estimatedLoss: 800,
    approvedAmount: 680,
    paidDate: '2026-01-08',
    photos: 2,
    timeline: [
      { date: '2025-12-20', status: 'Submitted', note: 'Claim submitted with vet report and photos' },
      { date: '2025-12-23', status: 'Under Review', note: 'Vet report being verified' },
      { date: '2025-12-30', status: 'Approved', note: 'Claim approved for $680 (85% after deductible)' },
      { date: '2026-01-08', status: 'Paid', note: 'Payment sent via EcoCash' },
    ],
  },
];

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
  crop: '🌾',
  livestock: '🐄',
  equipment: '🚜',
  'weather-index': '🌦️',
};

const typeLabels: Record<InsuranceType, string> = {
  crop: 'Crop',
  livestock: 'Livestock',
  equipment: 'Equipment',
  'weather-index': 'Weather Index',
};

const typeColors: Record<InsuranceType, string> = {
  crop: '#2AA198',
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

  const insurancePolicies = mockInsurancePolicies;
  const insuranceClaims = mockInsuranceClaims;

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
  }, []);

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
  }, []);

  // Quick links
  const quickLinks = [
    {
      href: '/farm/insurance/policies',
      label: t.insurance.myPolicies,
      icon: FileText,
      color: 'bg-teal/10 text-teal',
      iconBg: 'bg-teal/15',
    },
    {
      href: '/farm/insurance/claim',
      label: t.insurance.fileClaim,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700',
      iconBg: 'bg-amber-100',
    },
    {
      href: '/farm/insurance/policies',
      label: t.insurance.browseProducts,
      icon: Search,
      color: 'bg-indigo-50 text-indigo-700',
      iconBg: 'bg-indigo-100',
    },
    {
      href: '/farm/insurance/policies',
      label: t.insurance.getQuote,
      icon: Calculator,
      color: 'bg-green-50 text-green-700',
      iconBg: 'bg-green-100',
    },
  ];

  return (
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
        <div className="rounded-2xl bg-gradient-to-br from-teal to-teal-dark p-5 text-white relative overflow-hidden">
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
              <div className="w-7 h-7 rounded-lg bg-teal/10 flex items-center justify-center">
                <ShieldCheck size={14} className="text-teal" />
              </div>
              <span className="text-[11px] text-gray-400 truncate">
                {t.insurance.activePolicies}
              </span>
            </div>
            <p className="text-2xl font-bold text-teal">{stats.activePoliciesCount}</p>
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
            className="text-xs text-teal font-medium flex items-center gap-0.5"
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
  );
}
