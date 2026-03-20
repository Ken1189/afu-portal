'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Camera,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  Calendar,
  ArrowLeft,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/* Inline mock data (formerly from @/lib/data/insurance)               */
/* ------------------------------------------------------------------ */
type InsuranceType = 'crop' | 'livestock' | 'equipment' | 'weather-index';
type ClaimStatus = 'submitted' | 'under-review' | 'approved' | 'rejected' | 'paid';

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

/* ------------------------------------------------------------------ */
/* Animation Variants                                                  */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, ease: 'easeOut' as const } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

/* ------------------------------------------------------------------ */
/* Type icon map                                                       */
/* ------------------------------------------------------------------ */
const typeIcons: Record<string, string> = {
  crop: '\u{1F33E}',
  livestock: '\u{1F404}',
  equipment: '\u{1F69C}',
  'weather-index': '\u{1F326}\uFE0F',
};

/* ------------------------------------------------------------------ */
/* Status config                                                       */
/* ------------------------------------------------------------------ */
const statusConfig: Record<
  ClaimStatus,
  { bg: string; text: string; dot: string; icon: typeof Clock }
> = {
  submitted: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', icon: FileText },
  'under-review': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', icon: Clock },
  approved: { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500', icon: CheckCircle2 },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500', icon: XCircle },
  paid: { bg: 'bg-teal/10', text: 'text-teal', dot: 'bg-teal', icon: DollarSign },
};

/* ------------------------------------------------------------------ */
/* Filter tabs                                                         */
/* ------------------------------------------------------------------ */
type FilterKey = 'all' | ClaimStatus;

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function ClaimsPage() {
  const { t } = useLanguage();
  const ti = t.insurance;

  const insuranceClaims = mockInsuranceClaims;

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null);

  /* ── Computed data ── */
  const filteredClaims = useMemo(
    () =>
      activeFilter === 'all'
        ? insuranceClaims
        : insuranceClaims.filter((c) => c.status === activeFilter),
    [activeFilter],
  );

  const totalClaims = insuranceClaims.length;
  const paidAmount = insuranceClaims
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.approvedAmount ?? 0), 0);
  const pendingCount = insuranceClaims.filter(
    (c) => c.status === 'submitted' || c.status === 'under-review',
  ).length;
  const approvedCount = insuranceClaims.filter(
    (c) => c.status === 'approved' || c.status === 'paid',
  ).length;

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'submitted', label: ti.submitted },
    { key: 'under-review', label: ti.underReview },
    { key: 'approved', label: ti.approved },
    { key: 'rejected', label: ti.rejected },
    { key: 'paid', label: ti.paid },
  ];

  const statusLabel = (status: ClaimStatus) => {
    const map: Record<ClaimStatus, string> = {
      submitted: ti.submitted,
      'under-review': ti.underReview,
      approved: ti.approved,
      rejected: ti.rejected,
      paid: ti.paid,
    };
    return map[status];
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* ── Back link ── */}
      <Link
        href="/farm/insurance"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.common.back}
      </Link>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy">{ti.myClaims}</h1>
          <p className="text-sm text-gray-500 mt-1">{ti.claimHistory}</p>
        </div>
        <Link
          href="/farm/insurance/claim"
          className="bg-teal hover:bg-teal-dark active:bg-teal-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <FileText className="w-4 h-4" />
          {ti.fileClaim}
        </Link>
      </div>

      {/* ── Summary Cards ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          {
            label: 'Total Claims',
            value: totalClaims.toString(),
            color: 'bg-blue-50 text-blue-600',
            icon: FileText,
          },
          {
            label: ti.paid,
            value: `$${paidAmount.toLocaleString()}`,
            color: 'bg-teal/10 text-teal',
            icon: DollarSign,
          },
          {
            label: ti.pendingClaims,
            value: pendingCount.toString(),
            color: 'bg-amber-50 text-amber-600',
            icon: Clock,
          },
          {
            label: ti.approved,
            value: approvedCount.toString(),
            color: 'bg-green-50 text-green-600',
            icon: CheckCircle2,
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm"
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${stat.color}`}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-lg sm:text-xl font-bold text-navy">{stat.value}</p>
              <p className="text-[11px] sm:text-xs text-gray-500">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Filter Tabs ── */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max pb-1">
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            const count =
              f.key === 'all'
                ? insuranceClaims.length
                : insuranceClaims.filter((c) => c.status === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                {f.label}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20' : 'bg-gray-100'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Claims List ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          className="space-y-3"
        >
          {filteredClaims.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="font-semibold text-navy text-lg mb-2">{ti.noActiveClaims}</h3>
              <p className="text-sm text-gray-500">
                No claims match the selected filter. Try selecting a different status.
              </p>
            </motion.div>
          ) : (
            filteredClaims.map((claim) => {
              const config = statusConfig[claim.status];
              const StatusIcon = config.icon;
              const isExpanded = expandedClaim === claim.id;

              return (
                <motion.div
                  key={claim.id}
                  variants={itemVariants}
                  layout
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  {/* ── Claim Header (always visible) ── */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                          {typeIcons[claim.type] || '\u{1F4CB}'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-navy text-sm truncate">
                            {claim.policyName}
                          </p>
                          <p className="text-xs text-gray-400">{claim.id}</p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${config.bg} ${config.text}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusLabel(claim.status)}
                      </span>
                    </div>

                    {/* Claim details */}
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">{claim.description}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-[11px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ti.incidentDate}
                        </p>
                        <p className="font-medium text-navy">{formatDate(claim.incidentDate)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">{ti.submitted}</p>
                        <p className="font-medium text-navy">{formatDate(claim.submittedDate)}</p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">{ti.estimatedLoss}</p>
                        <p className="font-semibold text-navy">
                          ${claim.estimatedLoss.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">{ti.approvedAmount}</p>
                        <p className="font-semibold text-navy">
                          {claim.approvedAmount !== null
                            ? `$${claim.approvedAmount.toLocaleString()}`
                            : '\u2014'}
                        </p>
                      </div>
                    </div>

                    {/* Photos count + expand toggle */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      {claim.photos > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Camera className="w-3.5 h-3.5" />
                          {claim.photos} photo{claim.photos !== 1 ? 's' : ''}
                        </div>
                      )}
                      {claim.photos === 0 && <span />}
                      <button
                        onClick={() =>
                          setExpandedClaim(isExpanded ? null : claim.id)
                        }
                        className="flex items-center gap-1 text-xs font-medium text-teal hover:text-teal-dark transition-colors min-h-[44px] px-2"
                      >
                        {isExpanded ? 'Hide' : 'View'} Timeline
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ── Expandable Timeline ── */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-5 sm:px-5">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-4">
                              {ti.status} Timeline
                            </h4>
                            <div className="space-y-0">
                              {claim.timeline.map((step, idx) => {
                                const isLast = idx === claim.timeline.length - 1;
                                return (
                                  <div key={idx} className="flex gap-3">
                                    {/* Timeline dot + line */}
                                    <div className="flex flex-col items-center">
                                      <div
                                        className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                                          isLast ? config.dot : 'bg-gray-300'
                                        }`}
                                      />
                                      {!isLast && (
                                        <div className="w-0.5 flex-1 bg-gray-200 min-h-[24px]" />
                                      )}
                                    </div>
                                    {/* Timeline content */}
                                    <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-semibold text-navy">
                                          {step.status}
                                        </span>
                                        <span className="text-[10px] text-gray-400">
                                          {formatDate(step.date)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-600 leading-relaxed">
                                        {step.note}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
