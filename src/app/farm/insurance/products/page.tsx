'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  Bot,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { insuranceProducts as mockInsuranceProducts, type InsuranceType, type InsuranceProduct } from '@/lib/data/insurance';

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
/* Filter config                                                       */
/* ------------------------------------------------------------------ */
type FilterKey = 'all' | InsuranceType;

const filterOptions: { key: FilterKey; label: string; emoji: string }[] = [
  { key: 'all', label: 'All', emoji: '\u{1F30D}' },
  { key: 'crop', label: 'Crop', emoji: '\u{1F33E}' },
  { key: 'livestock', label: 'Livestock', emoji: '\u{1F404}' },
  { key: 'equipment', label: 'Equipment', emoji: '\u{1F69C}' },
  { key: 'weather-index', label: 'Weather Index', emoji: '\u{1F326}\uFE0F' },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function ProductsPage() {
  const { t } = useLanguage();
  const ti = t.insurance;

  const insuranceProducts: InsuranceProduct[] = mockInsuranceProducts;

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showAllCoverage, setShowAllCoverage] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(
    () =>
      activeFilter === 'all'
        ? insuranceProducts
        : insuranceProducts.filter((p) => p.type === activeFilter),
    [activeFilter],
  );

  const toggleCoverageExpand = (id: string) => {
    setShowAllCoverage((prev) => ({ ...prev, [id]: !prev[id] }));
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
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-navy">{ti.browseProducts}</h1>
        <p className="text-sm text-gray-500 mt-1">{ti.subtitle}</p>
      </div>

      {/* ── Filter Buttons ── */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 min-w-max pb-1">
          {filterOptions.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'bg-navy text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 active:bg-gray-50'
                }`}
              >
                <span className="text-base">{f.emoji}</span>
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Product Cards ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          className="space-y-4"
        >
          {filteredProducts.map((product) => {
            const isExpanded = expandedProduct === product.id;
            const coverageExpanded = showAllCoverage[product.id] || false;
            const visibleCoverage = coverageExpanded
              ? product.coverageDetails
              : product.coverageDetails.slice(0, 3);
            const hasMoreCoverage = product.coverageDetails.length > 3;

            return (
              <motion.div
                key={product.id}
                variants={itemVariants}
                layout
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-5">
                  {/* Product Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center text-2xl flex-shrink-0">
                        {product.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-navy text-base">{product.name}</h3>
                          {product.popular && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold/15 text-gold flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5" />
                              {ti.popular}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 capitalize">{product.type.replace('-', ' ')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>

                  {/* Key Info Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="bg-teal/5 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                        {ti.premium}
                      </p>
                      <p className="text-sm font-bold text-navy">
                        ${product.premiumRange.min} - ${product.premiumRange.max}
                      </p>
                      <p className="text-[10px] text-gray-400">{ti.perMonth}</p>
                    </div>
                    <div className="bg-blue-50/50 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                        {ti.coverage}
                      </p>
                      <p className="text-sm font-bold text-navy">
                        ${product.coverageRange.min.toLocaleString()} - ${product.coverageRange.max.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-amber-50/50 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                        {ti.deductible}
                      </p>
                      <p className="text-sm font-bold text-navy">{product.deductible}%</p>
                    </div>
                    <div className="bg-purple-50/50 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                        {ti.waitingPeriod}
                      </p>
                      <p className="text-xs font-semibold text-navy leading-tight">
                        {product.waitingPeriod}
                      </p>
                    </div>
                  </div>

                  {/* Coverage Details */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                      {ti.coverage} Details
                    </p>
                    <ul className="space-y-1.5">
                      {visibleCoverage.map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-600"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                    {hasMoreCoverage && (
                      <button
                        onClick={() => toggleCoverageExpand(product.id)}
                        className="mt-2 text-xs font-medium text-teal hover:text-teal-dark transition-colors flex items-center gap-1 min-h-[36px]"
                      >
                        {coverageExpanded
                          ? 'Show less'
                          : `+${product.coverageDetails.length - 3} more`}
                        {coverageExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link
                      href="/farm/insurance/quote"
                      className="flex-1 bg-teal hover:bg-teal-dark active:bg-teal-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {ti.getQuote}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() =>
                        setExpandedProduct(isExpanded ? null : product.id)
                      }
                      className="px-4 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 active:bg-gray-50 transition-colors min-h-[44px] flex items-center gap-1.5"
                    >
                      {ti.viewDetails}
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ── Expandable Details ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-5 sm:px-5 space-y-4">
                        <div className="border-t border-gray-100 pt-4" />

                        {/* Claim Process */}
                        <div className="bg-blue-50/50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <h4 className="text-xs font-semibold text-navy uppercase tracking-wider">
                              {ti.claimProcess}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600">{product.claimProcess}</p>
                        </div>

                        {/* Eligibility */}
                        <div>
                          <h4 className="text-xs font-semibold text-navy uppercase tracking-wider mb-3">
                            {ti.eligibilityCheck}
                          </h4>
                          <ul className="space-y-2">
                            {product.eligibility.map((req, idx) => (
                              <li
                                key={idx}
                                className="flex items-center gap-2.5 text-sm text-gray-600"
                              >
                                <div className="w-5 h-5 rounded-full bg-teal/10 flex items-center justify-center flex-shrink-0">
                                  <CheckCircle2 className="w-3 h-3 text-teal" />
                                </div>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* ── Compare / AI Helper Section ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-navy to-teal rounded-2xl p-5 sm:p-6 text-white"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Need help choosing?</h3>
            <p className="text-sm opacity-85 mb-4 leading-relaxed">
              Our AI assistant can help you compare products, understand coverage details, and find
              the best insurance plan for your farm.
            </p>
            <Link
              href="/farm/assistant"
              className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/30 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors min-h-[44px]"
            >
              <Bot className="w-4 h-4" />
              Talk to AI Assistant
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
