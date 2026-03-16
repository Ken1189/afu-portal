'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  Shield,
  Search,
  RefreshCw,
  FileWarning,
  AlertTriangle,
  Inbox,
} from 'lucide-react';
import {
  insurancePolicies,
  type InsuranceType,
  type PolicyStatus,
} from '@/lib/data/insurance';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const typeIcons: Record<InsuranceType, string> = {
  crop: '🌾',
  livestock: '🐄',
  equipment: '🚜',
  'weather-index': '🌦️',
};

const statusBadge: Record<PolicyStatus, { bg: string; label: string }> = {
  active: { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Active' },
  expired: { bg: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Expired' },
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Pending' },
  cancelled: { bg: 'bg-red-50 text-red-600 border-red-200', label: 'Cancelled' },
};

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

type FilterTab = 'all' | PolicyStatus;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PoliciesPage() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filterTabs: { key: FilterTab; label: string; count: number }[] = useMemo(
    () => [
      { key: 'all', label: 'All', count: insurancePolicies.length },
      {
        key: 'active',
        label: 'Active',
        count: insurancePolicies.filter((p) => p.status === 'active').length,
      },
      {
        key: 'expired',
        label: 'Expired',
        count: insurancePolicies.filter((p) => p.status === 'expired').length,
      },
      {
        key: 'pending',
        label: 'Pending',
        count: insurancePolicies.filter((p) => p.status === 'pending').length,
      },
    ],
    []
  );

  const filteredPolicies = useMemo(
    () =>
      activeFilter === 'all'
        ? insurancePolicies
        : insurancePolicies.filter((p) => p.status === activeFilter),
    [activeFilter]
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5 py-4"
    >
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-navy">{t.insurance.myPolicies}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {insurancePolicies.length} policies total
            </p>
          </div>
          <Link
            href="/farm/insurance"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal/10 text-teal text-sm font-medium active:bg-teal/20 transition-colors min-h-[44px]"
          >
            <Search size={15} />
            {t.insurance.browseProducts}
          </Link>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* FILTER TABS                                                       */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] ${
                activeFilter === tab.key
                  ? 'bg-teal text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-100 active:bg-gray-50'
              }`}
            >
              {tab.label}
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  activeFilter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* POLICY CARDS                                                      */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 space-y-3 pb-2">
        <AnimatePresence mode="popLayout">
          {filteredPolicies.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="rounded-2xl bg-white border border-gray-100 p-8 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                <Inbox size={24} className="text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-navy mb-1">No policies found</p>
              <p className="text-xs text-gray-400">
                No policies match the selected filter. Try a different filter or browse products.
              </p>
            </motion.div>
          ) : (
            filteredPolicies.map((policy) => {
              const isExpanded = expandedId === policy.id;
              const badge = statusBadge[policy.status];

              return (
                <motion.div
                  key={policy.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 24,
                  }}
                  className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
                >
                  {/* Card Header — always visible */}
                  <button
                    onClick={() => toggleExpand(policy.id)}
                    className="w-full p-4 text-left active:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl shrink-0">
                        {typeIcons[policy.type]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-sm font-bold text-navy truncate">
                            {policy.productName}
                          </p>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border capitalize shrink-0 ${badge.bg}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400">{policy.id}</p>

                        {/* Coverage & Premium row */}
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-[10px] text-gray-400">
                              {t.insurance.coverageAmount}
                            </p>
                            <p className="text-base font-bold text-green-600">
                              {formatCurrency(policy.coverageAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400">{t.insurance.premium}</p>
                            <p className="text-sm font-semibold text-navy">
                              {formatCurrency(policy.premiumAmount)}
                              <span className="text-[10px] text-gray-400 font-normal">
                                /{policy.premiumFrequency}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Next payment (active only) */}
                        {policy.status === 'active' && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <Clock size={11} className="text-gray-300" />
                            <p className="text-[11px] text-gray-400">
                              {t.insurance.nextPayment}:{' '}
                              <span className="font-medium text-navy">
                                {formatDate(policy.nextPremiumDue)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Expand indicator */}
                      <div className="shrink-0 mt-1">
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-gray-300" />
                        ) : (
                          <ChevronDown size={18} className="text-gray-300" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expandable Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          type: 'spring' as const,
                          stiffness: 300,
                          damping: 28,
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-gray-50">
                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-3 mt-3">
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {t.insurance.startDate}
                              </p>
                              <p className="text-xs font-semibold text-navy mt-0.5">
                                {formatDate(policy.startDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {t.insurance.endDate}
                              </p>
                              <p className="text-xs font-semibold text-navy mt-0.5">
                                {formatDate(policy.endDate)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                {t.insurance.deductible}
                              </p>
                              <p className="text-xs font-semibold text-navy mt-0.5">
                                {policy.deductible}%
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                                Claims
                              </p>
                              <p className="text-xs font-semibold text-navy mt-0.5">
                                {policy.claimsCount} filed
                              </p>
                            </div>
                          </div>

                          {/* Covered Items */}
                          <div className="mt-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1.5">
                              {t.insurance.coveredItems}
                            </p>
                            <div className="space-y-1">
                              {policy.coveredItems.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs text-navy"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-4">
                            {policy.status === 'expired' && (
                              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-medium active:bg-teal-dark transition-colors min-h-[44px]">
                                <RefreshCw size={15} />
                                {t.insurance.renewPolicy}
                              </button>
                            )}
                            {policy.status === 'active' && (
                              <Link
                                href="/farm/insurance/claim"
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 text-amber-700 text-sm font-medium active:bg-amber-100 transition-colors min-h-[44px]"
                              >
                                <FileWarning size={15} />
                                {t.insurance.fileClaim}
                              </Link>
                            )}
                            <Link
                              href="/farm/insurance"
                              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium active:bg-gray-100 transition-colors min-h-[44px]"
                            >
                              {t.insurance.viewDetails}
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  );
}
