'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Coins,
  Package,
  Hash,
  Calendar,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  Landmark,
  FileText,
  Wheat,
  Coffee,
  Leaf,
  ChevronDown,
  Sparkles,
  DollarSign,
  BarChart3,
  Lock,
  Globe,
  Award,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/* Animation Variants                                                  */
/* ------------------------------------------------------------------ */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, ease: 'easeOut' as const },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

/* ------------------------------------------------------------------ */
/* Mock Data                                                           */
/* ------------------------------------------------------------------ */
interface TokenizedAsset {
  id: string;
  commodity: string;
  icon: React.ReactNode;
  quantity: number;
  unit: string;
  tokenId: string;
  status: 'active' | 'pending';
  estimatedValue: number;
  dateTokenized: string;
  grade: string;
}

const mockTokenizedAssets: TokenizedAsset[] = [
  {
    id: '1',
    commodity: 'Maize',
    icon: <Wheat size={20} className="text-amber-600" />,
    quantity: 50,
    unit: 'tonnes',
    tokenId: '#1001',
    status: 'active',
    estimatedValue: 12500,
    dateTokenized: '2026-01-15',
    grade: 'A',
  },
  {
    id: '2',
    commodity: 'Sorghum',
    icon: <Leaf size={20} className="text-green-600" />,
    quantity: 20,
    unit: 'tonnes',
    tokenId: '#1002',
    status: 'pending',
    estimatedValue: 4800,
    dateTokenized: '2026-02-20',
    grade: 'B',
  },
  {
    id: '3',
    commodity: 'Coffee',
    icon: <Coffee size={20} className="text-amber-800" />,
    quantity: 5,
    unit: 'tonnes',
    tokenId: '#1003',
    status: 'active',
    estimatedValue: 18750,
    dateTokenized: '2026-03-01',
    grade: 'A',
  },
];

const commodityOptions = [
  'Maize',
  'Wheat',
  'Sorghum',
  'Coffee',
  'Cotton',
  'Tobacco',
  'Sugarcane',
  'Tea',
  'Cashews',
  'Sesame',
];

const unitOptions = ['tonnes', 'kg', 'bags'];

const gradeOptions = ['A', 'B', 'C'];

const plotOptions = [
  'Plot A - Riverside (12 ha)',
  'Plot B - Hilltop (8 ha)',
  'Plot C - Valley Floor (15 ha)',
  'Plot D - Northern Fields (6 ha)',
];

const howItWorksSteps = [
  {
    step: 1,
    title: 'Record Your Harvest',
    description: 'Enter your harvest details including commodity type, quantity, and quality grade.',
    icon: <FileText size={22} className="text-[#2AA198]" />,
  },
  {
    step: 2,
    title: 'Admin Verification',
    description: 'An AFU administrator verifies your production records and supporting documents.',
    icon: <Shield size={22} className="text-[#D4A843]" />,
  },
  {
    step: 3,
    title: 'ERC-1155 Token Minted',
    description: 'Once verified, an ERC-1155 token is minted on the EDMA L2 blockchain representing your commodity.',
    icon: <Coins size={22} className="text-[#1B2A4A]" />,
  },
  {
    step: 4,
    title: 'Use or Trade Tokens',
    description: 'Use your tokens as collateral for loans or trade them on the decentralized marketplace.',
    icon: <TrendingUp size={22} className="text-emerald-600" />,
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function TokenizePage() {
  const { t } = useLanguage();

  // Form state
  const [commodity, setCommodity] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('tonnes');
  const [harvestDate, setHarvestDate] = useState('');
  const [plot, setPlot] = useState('');
  const [grade, setGrade] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!commodity) errors.commodity = 'Please select a commodity';
    if (!quantity || parseFloat(quantity) <= 0) errors.quantity = 'Enter a valid quantity';
    if (!harvestDate) errors.harvestDate = 'Select a harvest date';
    if (!plot) errors.plot = 'Select a farm plot';
    if (!grade) errors.grade = 'Select a quality grade';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowSuccess(true);
    // Reset form
    setCommodity('');
    setQuantity('');
    setUnit('tonnes');
    setHarvestDate('');
    setPlot('');
    setGrade('');
    setFormErrors({});
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
        <div className="rounded-2xl bg-gradient-to-br from-[#1B2A4A] via-[#1B2A4A] to-[#2AA198] p-5 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
          <div className="absolute -bottom-8 -right-6 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 opacity-20">
            <Coins size={64} strokeWidth={1} />
          </div>

          <div className="relative z-10">
            <Link
              href="/farm"
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white/90 transition-colors mb-2"
            >
              <ArrowLeft size={14} />
              {t?.common?.back ?? 'Back to Farm'}
            </Link>
            <div className="flex items-center gap-2 mb-1">
              <Coins size={20} className="text-[#D4A843]" />
              <span className="text-xs font-semibold text-white/70 uppercase tracking-wide">
                Real World Assets
              </span>
            </div>
            <h2 className="text-xl font-bold leading-tight">Tokenize Your Harvest</h2>
            <p className="text-sm text-white/80 mt-1">
              Convert your verified harvest records into ERC-1155 tokens on the EDMA L2 blockchain.
              Unlock liquidity, access DeFi, and prove your production on-chain.
            </p>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* MY TOKENIZED ASSETS                                               */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
            My Tokenized Assets
          </h3>
          <span className="text-xs text-gray-400">{mockTokenizedAssets.length} tokens</span>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          {mockTokenizedAssets.map((asset) => (
            <motion.div
              key={asset.id}
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center flex-shrink-0">
                      {asset.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-[#1B2A4A]">{asset.commodity}</h4>
                        <span className="text-[10px] text-gray-400">Grade {asset.grade}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Hash size={10} className="text-gray-400" />
                        <span className="text-xs text-gray-500 font-mono">
                          Token ID {asset.tokenId}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full border flex items-center gap-1 ${
                      asset.status === 'active'
                        ? 'bg-[#2AA198]/10 text-[#2AA198] border-[#2AA198]/20'
                        : 'bg-amber-50 text-amber-600 border-amber-200'
                    }`}
                  >
                    {asset.status === 'active' ? (
                      <CheckCircle2 size={10} />
                    ) : (
                      <Clock size={10} />
                    )}
                    {asset.status === 'active' ? 'Active' : 'Pending Verification'}
                  </span>
                </div>

                {/* Key figures */}
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400">Quantity</p>
                    <p className="text-sm font-bold text-[#1B2A4A]">
                      {asset.quantity}{' '}
                      <span className="text-[10px] font-normal text-gray-400">{asset.unit}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Est. Value</p>
                    <p className="text-sm font-bold text-[#2AA198]">
                      {formatCurrency(asset.estimatedValue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Tokenized</p>
                    <p className="text-xs font-semibold text-[#1B2A4A] leading-tight">
                      {formatDate(asset.dateTokenized)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* ================================================================= */}
      {/* NEW TOKENIZATION FORM                                             */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-[#1B2A4A]/5 to-[#2AA198]/5 px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2AA198]/10 flex items-center justify-center">
                <Package size={18} className="text-[#2AA198]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1B2A4A]">New Tokenization Request</h3>
                <p className="text-[11px] text-gray-500">
                  Submit your harvest details for verification and tokenization
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Commodity Type */}
            <div>
              <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                Commodity Type
              </label>
              <div className="relative">
                <select
                  value={commodity}
                  onChange={(e) => {
                    setCommodity(e.target.value);
                    if (formErrors.commodity) setFormErrors((p) => ({ ...p, commodity: '' }));
                  }}
                  className={`w-full appearance-none bg-gray-50 border rounded-xl px-4 py-3 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all ${
                    formErrors.commodity ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select a commodity...</option>
                  {commodityOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {formErrors.commodity && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.commodity}</p>
              )}
            </div>

            {/* Quantity + Unit */}
            <div>
              <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                Quantity
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                    if (formErrors.quantity) setFormErrors((p) => ({ ...p, quantity: '' }));
                  }}
                  placeholder="e.g. 50"
                  className={`flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all ${
                    formErrors.quantity ? 'border-red-300' : 'border-gray-200'
                  }`}
                />
                <div className="relative">
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-8 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all"
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
              {formErrors.quantity && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.quantity}</p>
              )}
            </div>

            {/* Harvest Date */}
            <div>
              <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                Harvest Date
              </label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => {
                  setHarvestDate(e.target.value);
                  if (formErrors.harvestDate) setFormErrors((p) => ({ ...p, harvestDate: '' }));
                }}
                className={`w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all ${
                  formErrors.harvestDate ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {formErrors.harvestDate && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.harvestDate}</p>
              )}
            </div>

            {/* Farm Plot */}
            <div>
              <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                Farm Plot
              </label>
              <div className="relative">
                <select
                  value={plot}
                  onChange={(e) => {
                    setPlot(e.target.value);
                    if (formErrors.plot) setFormErrors((p) => ({ ...p, plot: '' }));
                  }}
                  className={`w-full appearance-none bg-gray-50 border rounded-xl px-4 py-3 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all ${
                    formErrors.plot ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Select a plot...</option>
                  {plotOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {formErrors.plot && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.plot}</p>
              )}
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-semibold text-[#1B2A4A] mb-1.5">
                Quality Grade
              </label>
              <div className="flex gap-2">
                {gradeOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      setGrade(g);
                      if (formErrors.grade) setFormErrors((p) => ({ ...p, grade: '' }));
                    }}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                      grade === g
                        ? 'bg-[#1B2A4A] text-white border-[#1B2A4A]'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
              {formErrors.grade && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.grade}</p>
              )}
            </div>

            {/* Verification Documents Info */}
            <div className="bg-amber-50/60 border border-amber-200/50 rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <Shield size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-amber-800">
                    Verification Documents Required
                  </p>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                    After submitting your tokenization request, an AFU administrator will review your
                    records. You may be asked to provide additional documentation such as harvest
                    receipts, field photos, or cooperative certifications to complete the verification
                    process.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#1B2A4A] to-[#2AA198] text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 min-h-[48px]"
            >
              <Coins size={16} />
              Request Tokenization
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* HOW IT WORKS                                                      */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 space-y-3">
        <h3 className="text-sm font-bold text-[#1B2A4A] uppercase tracking-wider">
          How It Works
        </h3>

        <div className="space-y-3">
          {howItWorksSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              variants={itemVariants}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cream to-gray-100 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <div className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-[#1B2A4A] text-white text-[10px] font-bold flex items-center justify-center">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-[#1B2A4A]">{step.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
              {idx < howItWorksSteps.length - 1 && (
                <div className="ml-5 mt-2 border-l-2 border-dashed border-gray-200 h-3" />
              )}
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* BENEFITS (Gradient Card)                                          */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-[#1B2A4A] to-[#2AA198] rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
        >
          {/* Decorative */}
          <div className="absolute -top-8 -right-8 w-28 h-28 bg-white/5 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/5 rounded-full" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-[#D4A843]" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Benefits of Tokenization</h3>
                <p className="text-xs text-white/70">Why tokenize your harvest on EDMA L2</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  icon: <Landmark size={16} />,
                  title: 'Loan Collateral',
                  desc: 'Use your commodity tokens as collateral to access instant DeFi loans.',
                },
                {
                  icon: <Globe size={16} />,
                  title: 'Decentralized Marketplace',
                  desc: 'Trade tokenized commodities on the open marketplace with global buyers.',
                },
                {
                  icon: <BarChart3 size={16} />,
                  title: 'Transparent Price Discovery',
                  desc: 'Real-time pricing based on verified supply and market demand.',
                },
                {
                  icon: <Lock size={16} />,
                  title: 'Immutable Proof of Production',
                  desc: 'On-chain records that can never be altered, building trust with buyers.',
                },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-3.5 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 text-[#D4A843]">
                      {benefit.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{benefit.title}</p>
                      <p className="text-[11px] text-white/75 mt-0.5 leading-relaxed">
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.section>

      {/* ================================================================= */}
      {/* SUCCESS MODAL                                                     */}
      {/* ================================================================= */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowSuccess(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-5 shadow-xl"
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-[#2AA198]/10 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 size={32} className="text-[#2AA198]" />
                </div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">
                  Tokenization Request Submitted
                </h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Your harvest record has been submitted for verification. An AFU administrator will
                  review your submission and may request additional documentation.
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock size={12} className="text-amber-500" />
                  <span>Verification typically takes 2-5 business days</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={12} className="text-[#2AA198]" />
                  <span>You will be notified once your token is minted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Coins size={12} className="text-[#D4A843]" />
                  <span>ERC-1155 token will appear in your wallet on EDMA L2</span>
                </div>
              </div>

              <button
                onClick={() => setShowSuccess(false)}
                className="w-full py-3 rounded-xl bg-[#1B2A4A] text-white text-sm font-semibold hover:bg-[#1B2A4A]/90 active:scale-[0.98] transition-all"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
