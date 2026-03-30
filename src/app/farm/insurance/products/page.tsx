'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';
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
  X,
  Loader2,
  Calendar,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import type { FarmPlotRow } from '@/lib/supabase/use-farm-plots';

/* ------------------------------------------------------------------ */
/* Inline mock data (formerly from @/lib/data/insurance)               */
/* ------------------------------------------------------------------ */
type InsuranceType = 'crop' | 'livestock' | 'equipment' | 'weather-index';

interface InsuranceProduct {
  id: string;
  name: string;
  type: InsuranceType;
  description: string;
  coverageDetails: string[];
  premiumRange: { min: number; max: number };
  coverageRange: { min: number; max: number };
  deductible: number;
  waitingPeriod: string;
  claimProcess: string;
  eligibility: string[];
  popular: boolean;
  icon: string;
}

const FALLBACK_INSURANCE_PRODUCTS: InsuranceProduct[] = [
  {
    id: 'INS-PROD-001',
    name: 'Crop Shield Basic',
    type: 'crop',
    description: 'Essential crop protection against drought, flood, and pest damage. Ideal for smallholder farmers growing staple crops.',
    coverageDetails: [
      'Drought damage (rainfall below 60% of average)',
      'Flood damage (waterlogging > 72 hours)',
      'Pest infestation (verified by agronomist)',
      'Hail damage',
      'Fire (accidental)',
    ],
    premiumRange: { min: 15, max: 45 },
    coverageRange: { min: 500, max: 5000 },
    deductible: 10,
    waitingPeriod: '14 days after enrollment',
    claimProcess: 'Submit photos + agronomist verification within 7 days of incident',
    eligibility: [
      'AFU member in good standing',
      'Farm size 0.5 - 20 hectares',
      'Crops registered on platform',
    ],
    popular: true,
    icon: '🌾',
  },
  {
    id: 'INS-PROD-002',
    name: 'Crop Shield Premium',
    type: 'crop',
    description: 'Comprehensive crop coverage with higher limits and additional perils including market price drops and disease.',
    coverageDetails: [
      'All Basic plan coverage',
      'Crop disease (verified diagnosis)',
      'Market price decline (> 30% drop)',
      'Input loss (seed/fertilizer spoilage)',
      'Replanting costs',
      'Revenue guarantee up to 80%',
    ],
    premiumRange: { min: 35, max: 90 },
    coverageRange: { min: 2000, max: 15000 },
    deductible: 5,
    waitingPeriod: '7 days after enrollment',
    claimProcess: 'Submit photos + AFU field officer visit within 14 days',
    eligibility: [
      'AFU member for 6+ months',
      'Complete KYC verification',
      'Active crop tracking on platform',
    ],
    popular: false,
    icon: '🛡️',
  },
  {
    id: 'INS-PROD-003',
    name: 'Livestock Guardian',
    type: 'livestock',
    description: 'Protect your livestock investment against disease, theft, and natural disasters. Covers cattle, goats, sheep, and poultry.',
    coverageDetails: [
      'Disease-related death (verified by vet)',
      'Theft (with police report)',
      'Natural disaster (flood, drought stress)',
      'Predator attack',
      'Accidental injury',
      'Emergency veterinary costs',
    ],
    premiumRange: { min: 20, max: 80 },
    coverageRange: { min: 300, max: 10000 },
    deductible: 15,
    waitingPeriod: '21 days after enrollment',
    claimProcess: 'Vet report + photos within 48 hours of incident',
    eligibility: [
      'AFU member in good standing',
      'Livestock registered with ear tags/photos',
      'Vaccination records up to date',
    ],
    popular: true,
    icon: '🐄',
  },
  {
    id: 'INS-PROD-004',
    name: 'Equipment Protect',
    type: 'equipment',
    description: 'Insurance for farming equipment and machinery against breakdowns, theft, and damage. Covers owned and rented equipment.',
    coverageDetails: [
      'Mechanical breakdown',
      'Theft (with police report)',
      'Fire and lightning damage',
      'Flood damage',
      'Vandalism',
      'Transit damage (during transport)',
    ],
    premiumRange: { min: 25, max: 120 },
    coverageRange: { min: 500, max: 25000 },
    deductible: 10,
    waitingPeriod: '7 days after enrollment',
    claimProcess: 'Photos + repair estimate from authorized mechanic',
    eligibility: [
      'AFU member in good standing',
      'Equipment registered on platform',
      'Equipment value verified',
    ],
    popular: false,
    icon: '🚜',
  },
  {
    id: 'INS-PROD-005',
    name: 'Weather Index',
    type: 'weather-index',
    description: 'Automatic payouts based on satellite weather data. No claims process needed — payments trigger automatically when conditions are met.',
    coverageDetails: [
      'Rainfall deficit (< 70% of 10-year average)',
      'Excess rainfall (> 150% of average)',
      'Temperature extremes (> 40°C or < 5°C for 3+ days)',
      'Automatic satellite monitoring',
      'No claims paperwork required',
      'Payout within 14 days of trigger',
    ],
    premiumRange: { min: 10, max: 35 },
    coverageRange: { min: 200, max: 3000 },
    deductible: 0,
    waitingPeriod: 'Coverage starts at planting date',
    claimProcess: 'Automatic — no claims needed. Satellite data triggers payout.',
    eligibility: [
      'AFU member in good standing',
      'Farm GPS coordinates registered',
      'Active for current growing season',
    ],
    popular: true,
    icon: '🌦️',
  },
  {
    id: 'INS-PROD-006',
    name: 'Comprehensive Farm Shield',
    type: 'crop',
    description: 'All-in-one protection combining crop, livestock, and equipment coverage at a bundled discount. Best value for diversified farms.',
    coverageDetails: [
      'Full Crop Shield Premium coverage',
      'Full Livestock Guardian coverage',
      'Basic Equipment Protect coverage',
      '15% bundle discount on premiums',
      'Priority claims processing',
      'Dedicated claims officer',
    ],
    premiumRange: { min: 60, max: 200 },
    coverageRange: { min: 5000, max: 50000 },
    deductible: 5,
    waitingPeriod: '7 days after enrollment',
    claimProcess: 'Priority processing — dedicated officer assigned within 24 hours',
    eligibility: [
      'AFU member for 12+ months',
      'Complete KYC verification',
      'Min 2 hectares farm size',
      'Active crop + livestock records',
    ],
    popular: false,
    icon: '⭐',
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
  const { user } = useAuth();
  const ti = t.insurance;

  const [insuranceProducts, setInsuranceProducts] = useState<InsuranceProduct[]>(FALLBACK_INSURANCE_PRODUCTS);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      try {
        const { data } = await supabase
          .from('insurance_products')
          .select('*')
          .eq('active', true)
          .order('name');
        if (data && data.length > 0) {
          setInsuranceProducts(data.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: (p.type || 'crop') as InsuranceType,
            description: p.description || '',
            coverageDetails: p.coverage_details?.details || [],
            premiumRange: p.premium_range || { min: 10, max: 100 },
            coverageRange: { min: 500, max: 50000 },
            deductible: p.deductible_percent || 10,
            waitingPeriod: `${p.waiting_period_days || 14} days after enrollment`,
            claimProcess: 'Submit photos + verification within 14 days',
            eligibility: p.eligibility || ['AFU member in good standing'],
            popular: false,
            icon: p.type === 'livestock' ? '\u{1F404}' : p.type === 'equipment' ? '\u{1F69C}' : p.type === 'weather-index' ? '\u{1F326}\uFE0F' : '\u{1F33E}',
          })));
        }
      } catch { /* keep fallback */ }
      setDataLoading(false);
    };
    load();
  }, [user]);

  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [showAllCoverage, setShowAllCoverage] = useState<Record<string, boolean>>({});

  const filteredProducts = useMemo(
    () =>
      activeFilter === 'all'
        ? insuranceProducts
        : insuranceProducts.filter((p) => p.type === activeFilter),
    [activeFilter, insuranceProducts],
  );

  const toggleCoverageExpand = (id: string) => {
    setShowAllCoverage((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // ── Apply Modal State ──
  const [applyProduct, setApplyProduct] = useState<InsuranceProduct | null>(null);
  const [farmPlots, setFarmPlots] = useState<FarmPlotRow[]>([]);
  const [plotsLoading, setPlotsLoading] = useState(false);
  const [applyForm, setApplyForm] = useState({
    coverage_amount: '',
    farm_plot_id: '',
    start_date: '',
  });
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');

  const openApplyModal = useCallback(async (product: InsuranceProduct) => {
    setApplyProduct(product);
    setApplyForm({
      coverage_amount: String(product.coverageRange.min),
      farm_plot_id: '',
      start_date: new Date().toISOString().split('T')[0],
    });
    setApplySuccess(false);
    setApplyError('');

    // Load user's farm plots
    if (user) {
      setPlotsLoading(true);
      try {
        const supabase = createClient();
        const { data: member } = await supabase
          .from('members')
          .select('id')
          .eq('profile_id', user.id)
          .single();
        if (member) {
          const { data: plots } = await supabase
            .from('farm_plots')
            .select('*')
            .eq('member_id', member.id)
            .order('name');
          setFarmPlots((plots as FarmPlotRow[]) || []);
        }
      } catch { /* ignore */ }
      setPlotsLoading(false);
    }
  }, [user]);

  const calculatePremium = useCallback((product: InsuranceProduct, coverageAmount: number): number => {
    const range = product.premiumRange;
    const covRange = product.coverageRange;
    const ratio = (coverageAmount - covRange.min) / (covRange.max - covRange.min || 1);
    const premium = range.min + ratio * (range.max - range.min);
    return Math.round(premium * 100) / 100;
  }, []);

  const handleApplySubmit = useCallback(async () => {
    if (!applyProduct || !user) return;
    const coverageAmt = parseFloat(applyForm.coverage_amount);
    if (isNaN(coverageAmt) || coverageAmt < applyProduct.coverageRange.min || coverageAmt > applyProduct.coverageRange.max) {
      setApplyError(`Coverage must be between $${applyProduct.coverageRange.min.toLocaleString()} and $${applyProduct.coverageRange.max.toLocaleString()}`);
      return;
    }
    if (!applyForm.start_date) {
      setApplyError('Please select a start date');
      return;
    }

    setApplySubmitting(true);
    setApplyError('');

    try {
      const supabase = createClient();
      const { data: member } = await supabase
        .from('members')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (!member) {
        setApplyError('Member profile not found. Please complete your profile first.');
        setApplySubmitting(false);
        return;
      }

      const premium = calculatePremium(applyProduct, coverageAmt);
      const startDate = new Date(applyForm.start_date);
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);

      const policyNumber = `POL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { error: insertError } = await supabase
        .from('insurance_policies')
        .insert({
          member_id: member.id,
          product_id: applyProduct.id,
          policy_number: policyNumber,
          coverage_amount: coverageAmt,
          premium,
          status: 'pending',
          start_date: applyForm.start_date,
          end_date: endDate.toISOString().split('T')[0],
        });

      if (insertError) {
        setApplyError(insertError.message);
      } else {
        setApplySuccess(true);
      }
    } catch (err: any) {
      setApplyError(err?.message || 'Something went wrong. Please try again.');
    }
    setApplySubmitting(false);
  }, [applyProduct, applyForm, user, calculatePremium]);

  const estimatedPremium = applyProduct
    ? calculatePremium(applyProduct, parseFloat(applyForm.coverage_amount) || applyProduct.coverageRange.min)
    : 0;

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
                    <button
                      onClick={() => openApplyModal(product)}
                      className="flex-1 bg-[#5DB347] hover:bg-[#449933] active:bg-[#449933] text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
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
        className="bg-gradient-to-br from-navy to-[#8CB89C] rounded-2xl p-5 sm:p-6 text-white"
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

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* APPLY MODAL                                                   */}
      {/* ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {applyProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => !applySubmitting && setApplyProduct(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto shadow-xl"
            >
              {applySuccess ? (
                /* ── Success State ── */
                <div className="p-6 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#5DB347]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#5DB347]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Application Submitted!</h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-6">
                    Your insurance application for <span className="font-semibold">{applyProduct.name}</span> has been submitted.
                    We will review it within 48 hours and notify you of the outcome.
                  </p>
                  <button
                    onClick={() => setApplyProduct(null)}
                    className="w-full py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold hover:bg-[#449933] transition-colors min-h-[44px]"
                  >
                    Done
                  </button>
                </div>
              ) : (
                /* ── Form State ── */
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center text-xl">
                        {applyProduct.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#1B2A4A]">Apply for Insurance</h3>
                        <p className="text-xs text-gray-400">{applyProduct.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setApplyProduct(null)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Form */}
                  <div className="p-4 space-y-4">
                    {/* Coverage Amount */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                        <DollarSign className="w-3.5 h-3.5 inline mr-1" />
                        Coverage Amount (USD)
                      </label>
                      <input
                        type="number"
                        min={applyProduct.coverageRange.min}
                        max={applyProduct.coverageRange.max}
                        value={applyForm.coverage_amount}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, coverage_amount: e.target.value }))}
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                        placeholder={`$${applyProduct.coverageRange.min} - $${applyProduct.coverageRange.max}`}
                      />
                      <p className="text-[11px] text-gray-400 mt-1">
                        Range: ${applyProduct.coverageRange.min.toLocaleString()} - ${applyProduct.coverageRange.max.toLocaleString()}
                      </p>
                    </div>

                    {/* Farm Plot */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                        <MapPin className="w-3.5 h-3.5 inline mr-1" />
                        Farm Plot (optional)
                      </label>
                      {plotsLoading ? (
                        <div className="flex items-center gap-2 py-3 text-xs text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading your plots...
                        </div>
                      ) : (
                        <select
                          value={applyForm.farm_plot_id}
                          onChange={(e) => setApplyForm(prev => ({ ...prev, farm_plot_id: e.target.value }))}
                          className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-[#1B2A4A] bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                        >
                          <option value="">-- Select a plot --</option>
                          {farmPlots.map(plot => (
                            <option key={plot.id} value={plot.id}>
                              {plot.name} {plot.size_ha ? `(${plot.size_ha} ha)` : ''} {plot.crop ? `- ${plot.crop}` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                        <Calendar className="w-3.5 h-3.5 inline mr-1" />
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={applyForm.start_date}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setApplyForm(prev => ({ ...prev, start_date: e.target.value }))}
                        className="w-full px-3.5 py-3 rounded-xl border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-all"
                      />
                    </div>

                    {/* Premium Estimate */}
                    <div className="rounded-xl bg-[#5DB347]/5 border border-[#5DB347]/20 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">Estimated Monthly Premium</p>
                          <p className="text-xl font-bold text-[#5DB347]">${estimatedPremium.toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Deductible</p>
                          <p className="text-sm font-semibold text-[#1B2A4A]">{applyProduct.deductible}%</p>
                        </div>
                      </div>
                    </div>

                    {/* Error */}
                    {applyError && (
                      <div className="rounded-xl bg-red-50 border border-red-200 p-3 flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600">{applyError}</p>
                      </div>
                    )}

                    {/* Submit */}
                    <button
                      onClick={handleApplySubmit}
                      disabled={applySubmitting}
                      className="w-full py-3 rounded-xl bg-[#5DB347] text-white text-sm font-semibold hover:bg-[#449933] active:scale-[0.98] transition-all min-h-[44px] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {applySubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4" />
                          Submit Application
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                      Your application will be reviewed by our team. Status: pending until approved.
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
