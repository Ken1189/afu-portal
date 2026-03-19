'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  LayoutTemplate,
  Target,
  Palette,
  DollarSign,
  ClipboardCheck,
  Upload,
  X,
  Star,
  Eye,
  MousePointerClick,
  Calendar,
  Globe,
  Users,
  LayoutDashboard,
  ShoppingBag,
  Sprout,
  GraduationCap,
  Megaphone,
} from 'lucide-react';

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
    transition: { duration: 0.25 },
  }),
};

// ── Types ───────────────────────────────────────────────────────────────────

interface FormData {
  campaignType: string;
  placements: string[];
  countries: string[];
  memberTiers: string[];
  title: string;
  description: string;
  hasImage: boolean;
  budget: number;
  dailyBudgetEnabled: boolean;
  dailyBudget: number;
  startDate: string;
  endDate: string;
}

// ── Step definitions ────────────────────────────────────────────────────────

const steps = [
  { id: 1, label: 'Campaign Type', icon: <LayoutTemplate className="w-4 h-4" /> },
  { id: 2, label: 'Targeting', icon: <Target className="w-4 h-4" /> },
  { id: 3, label: 'Creative', icon: <Palette className="w-4 h-4" /> },
  { id: 4, label: 'Budget & Schedule', icon: <DollarSign className="w-4 h-4" /> },
  { id: 5, label: 'Review', icon: <ClipboardCheck className="w-4 h-4" /> },
];

// ── Campaign types ──────────────────────────────────────────────────────────

const campaignTypes = [
  {
    id: 'banner',
    label: 'Banner Ad',
    description: 'Full-width banner displayed at the top of portal pages. High visibility, ideal for brand awareness and seasonal promotions.',
    recommended: '$500 - $5,000',
    icon: <LayoutTemplate className="w-6 h-6" />,
  },
  {
    id: 'featured-product',
    label: 'Featured Product',
    description: 'Highlight a specific product in marketplace listings with a "Featured" badge. Drives product-level conversions and visibility.',
    recommended: '$200 - $2,000',
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: 'sponsored-content',
    label: 'Sponsored Content',
    description: 'Native content placement in training modules and resource sections. Great for educational marketing and building authority.',
    recommended: '$300 - $3,000',
    icon: <Megaphone className="w-6 h-6" />,
  },
  {
    id: 'sidebar',
    label: 'Sidebar Ad',
    description: 'Compact sidebar placements across portal pages. Cost-effective with sustained visibility across browsing sessions.',
    recommended: '$100 - $1,500',
    icon: <ImageIcon className="w-6 h-6" />,
  },
];

// ── Placement options ───────────────────────────────────────────────────────

const placementOptions = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, reach: '~3,200 daily views' },
  { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-5 h-5" />, reach: '~5,800 daily views' },
  { id: 'farm-portal', label: 'Farm Portal', icon: <Sprout className="w-5 h-5" />, reach: '~2,100 daily views' },
  { id: 'training', label: 'Training', icon: <GraduationCap className="w-5 h-5" />, reach: '~1,400 daily views' },
];

const countryOptions = ['Botswana', 'Kenya', 'Mozambique', 'Nigeria', 'Sierra Leone', 'South Africa', 'Tanzania', 'Zambia', 'Zimbabwe'];

const tierOptions = [
  { id: 'smallholder', label: 'Smallholder', count: 834 },
  { id: 'commercial', label: 'Commercial', count: 287 },
  { id: 'enterprise', label: 'Enterprise', count: 89 },
  { id: 'partner', label: 'Partner', count: 30 },
];

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CreateCampaign() {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    campaignType: '',
    placements: [],
    countries: ['Botswana', 'Zimbabwe', 'Tanzania'],
    memberTiers: ['smallholder', 'commercial', 'enterprise', 'partner'],
    title: '',
    description: '',
    hasImage: false,
    budget: 1000,
    dailyBudgetEnabled: false,
    dailyBudget: 50,
    startDate: '2026-04-01',
    endDate: '2026-06-30',
  });

  const goNext = () => {
    if (currentStep < 5) {
      setDirection(1);
      setCurrentStep((s) => s + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setDirection(-1);
      setCurrentStep((s) => s - 1);
    }
  };

  const toggleArrayItem = (field: 'placements' | 'countries' | 'memberTiers', item: string) => {
    setFormData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      };
    });
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // ── Estimated reach calculation ─────────────────────────────────────────
  const estimatedDailyReach =
    formData.placements.reduce((sum, p) => {
      const opt = placementOptions.find((o) => o.id === p);
      if (!opt) return sum;
      const num = parseInt(opt.reach.replace(/[^0-9]/g, ''));
      return sum + num;
    }, 0) * (formData.countries.length / 3);

  const estimatedTotalImpressions = Math.round(estimatedDailyReach * 90 * 0.4);
  const estimatedClicks = Math.round(estimatedTotalImpressions * 0.055);

  // ── Campaign type label ─────────────────────────────────────────────────
  const selectedType = campaignTypes.find((t) => t.id === formData.campaignType);

  if (submitted) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center min-h-[60vh]"
      >
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl border border-gray-100 p-10 text-center max-w-md mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
            className="w-16 h-16 rounded-full bg-[#2AA198]/10 flex items-center justify-center mx-auto mb-5"
          >
            <Check className="w-8 h-8 text-[#2AA198]" />
          </motion.div>
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Campaign Submitted!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your campaign &ldquo;{formData.title || 'Untitled'}&rdquo; has been submitted for review.
            Our team will review and approve it within 24 hours.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Link
              href="/supplier/advertising"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#2AA198] text-white hover:bg-[#1A7A72] transition-colors"
            >
              Back to Advertising
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  campaignType: '',
                  placements: [],
                  countries: ['Botswana', 'Zimbabwe', 'Tanzania'],
                  memberTiers: ['smallholder', 'commercial', 'enterprise', 'partner'],
                  title: '',
                  description: '',
                  hasImage: false,
                  budget: 1000,
                  dailyBudgetEnabled: false,
                  dailyBudget: 50,
                  startDate: '2026-04-01',
                  endDate: '2026-06-30',
                });
              }}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Create Another
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-4xl mx-auto"
    >
      {/* ══════════════════════════════════════════════════════════════════
          HEADER
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link
          href="/supplier/advertising"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Create Campaign</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up a new advertising campaign in 5 simple steps</p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          STEP INDICATOR
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.div
                  animate={{
                    backgroundColor:
                      currentStep > step.id
                        ? '#2AA198'
                        : currentStep === step.id
                          ? '#2AA198'
                          : '#E5E7EB',
                    color:
                      currentStep >= step.id ? '#FFFFFF' : '#9CA3AF',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                >
                  {currentStep > step.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    step.id
                  )}
                </motion.div>
                <span
                  className={`text-[10px] mt-1.5 font-medium text-center hidden sm:block ${
                    currentStep >= step.id ? 'text-[#2AA198]' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-18px] sm:mt-[-6px]">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{
                      backgroundColor: currentStep > step.id ? '#2AA198' : '#E5E7EB',
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════
          STEP CONTENT
      ═════════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── STEP 1: Campaign Type ──────────────────────────────────── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Choose Campaign Type</h2>
              <p className="text-sm text-gray-500">Select the type of advertisement you want to create.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {campaignTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData((prev) => ({ ...prev, campaignType: type.id }))}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      formData.campaignType === type.id
                        ? 'border-[#2AA198] bg-[#2AA198]/5 shadow-sm'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          formData.campaignType === type.id
                            ? 'bg-[#2AA198]/10 text-[#2AA198]'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {type.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-[#1B2A4A] text-sm">{type.label}</h3>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{type.description}</p>
                        <p className="text-xs font-medium text-[#D4A843] mt-2">
                          Recommended: {type.recommended}
                        </p>
                      </div>
                    </div>
                    {formData.campaignType === type.id && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2AA198] flex items-center justify-center"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Targeting ──────────────────────────────────────── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Targeting Options</h2>

              {/* Placement */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-medium text-[#1B2A4A] text-sm mb-3 flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-[#2AA198]" />
                  Placement
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {placementOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        formData.placements.includes(opt.id)
                          ? 'border-[#2AA198] bg-[#2AA198]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.placements.includes(opt.id)}
                        onChange={() => toggleArrayItem('placements', opt.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2AA198] focus:ring-[#2AA198]"
                      />
                      <div className={`${formData.placements.includes(opt.id) ? 'text-[#2AA198]' : 'text-gray-400'}`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1B2A4A]">{opt.label}</p>
                        <p className="text-[10px] text-gray-400">{opt.reach}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Country targeting */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-medium text-[#1B2A4A] text-sm mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#2AA198]" />
                  Country Targeting
                </h3>
                <div className="flex flex-wrap gap-3">
                  {countryOptions.map((country) => (
                    <label
                      key={country}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                        formData.countries.includes(country)
                          ? 'border-[#2AA198] bg-[#2AA198]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.countries.includes(country)}
                        onChange={() => toggleArrayItem('countries', country)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2AA198] focus:ring-[#2AA198]"
                      />
                      <span className="text-sm text-[#1B2A4A]">{country}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Member tier targeting */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <h3 className="font-medium text-[#1B2A4A] text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2AA198]" />
                  Member Tier Targeting
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tierOptions.map((tier) => (
                    <label
                      key={tier.id}
                      className={`flex flex-col items-center p-3 rounded-lg border cursor-pointer transition-all text-center ${
                        formData.memberTiers.includes(tier.id)
                          ? 'border-[#2AA198] bg-[#2AA198]/5'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.memberTiers.includes(tier.id)}
                        onChange={() => toggleArrayItem('memberTiers', tier.id)}
                        className="w-4 h-4 rounded border-gray-300 text-[#2AA198] focus:ring-[#2AA198] mb-2"
                      />
                      <span className="text-sm font-medium text-[#1B2A4A]">{tier.label}</span>
                      <span className="text-[10px] text-gray-400">{tier.count.toLocaleString()} members</span>
                    </label>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Creative ──────────────────────────────────────── */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Campaign Creative</h2>

              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Campaign Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Season Opening Sale - 20% Off All Seeds"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your campaign offer, product, or message..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198] transition-all resize-none"
                  />
                </div>

                {/* Image upload area */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Campaign Image</label>
                  {!formData.hasImage ? (
                    <button
                      onClick={() => setFormData((prev) => ({ ...prev, hasImage: true }))}
                      className="w-full border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center gap-3 hover:border-[#2AA198]/40 hover:bg-[#2AA198]/5 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-[#2AA198]/10 flex items-center justify-center transition-colors">
                        <Upload className="w-5 h-5 text-gray-400 group-hover:text-[#2AA198] transition-colors" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">
                          Drag & drop your image here or <span className="text-[#2AA198]">browse</span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB. Recommended: 800x400px</p>
                      </div>
                    </button>
                  ) : (
                    <div className="relative border border-gray-200 rounded-xl p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-10 bg-[#2AA198]/20 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-[#2AA198]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#1B2A4A]">campaign-banner.jpg</p>
                          <p className="text-xs text-gray-400">800 x 400px &bull; 342 KB</p>
                        </div>
                        <button
                          onClick={() => setFormData((prev) => ({ ...prev, hasImage: false }))}
                          className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ad preview */}
              {formData.title && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-medium text-[#1B2A4A] text-sm mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#2AA198]" />
                    Preview
                  </h3>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#2AA198]/10 to-[#1B2A4A]/5 p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-16 bg-[#2AA198]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-6 h-6 text-[#2AA198]" />
                        </div>
                        <div>
                          <span className="inline-block text-[9px] px-2 py-0.5 rounded-full bg-[#D4A843]/20 text-[#D4A843] font-semibold uppercase tracking-wider mb-1">
                            Sponsored
                          </span>
                          <h4 className="font-semibold text-[#1B2A4A] text-sm">{formData.title}</h4>
                          {formData.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{formData.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: Budget & Schedule ──────────────────────────────── */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Budget & Schedule</h2>

              {/* Budget */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-medium text-[#1B2A4A] text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#2AA198]" />
                  Total Budget
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-[#1B2A4A] tabular-nums">
                    ${formData.budget.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={10000}
                  step={100}
                  value={formData.budget}
                  onChange={(e) => setFormData((prev) => ({ ...prev, budget: parseInt(e.target.value) }))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #2AA198 ${((formData.budget - 100) / 9900) * 100}%, #E5E7EB ${((formData.budget - 100) / 9900) * 100}%)`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>$100</span>
                  <span>$10,000</span>
                </div>
              </div>

              {/* Schedule */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <h3 className="font-medium text-[#1B2A4A] text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#2AA198]" />
                  Schedule
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198]"
                    />
                  </div>
                </div>
              </div>

              {/* Daily budget toggle */}
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-[#1B2A4A] text-sm">Daily Budget Limit</h3>
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyBudgetEnabled: !prev.dailyBudgetEnabled,
                      }))
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      formData.dailyBudgetEnabled ? 'bg-[#2AA198]' : 'bg-gray-200'
                    }`}
                  >
                    <motion.div
                      animate={{ x: formData.dailyBudgetEnabled ? 20 : 2 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                    />
                  </button>
                </div>
                {formData.dailyBudgetEnabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-600">Max</span>
                      <input
                        type="number"
                        value={formData.dailyBudget}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dailyBudget: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-28 px-3 py-2 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] focus:outline-none focus:ring-2 focus:ring-[#2AA198]/30 focus:border-[#2AA198]"
                      />
                      <span className="text-sm text-gray-600">per day</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      Campaign will pause automatically when the daily limit is reached.
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 5: Review ─────────────────────────────────────────── */}
          {currentStep === 5 && (
            <motion.div
              key="step5"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Review Your Campaign</h2>

              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
                {/* Summary rows */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Campaign Type</p>
                      <p className="text-sm font-medium text-[#1B2A4A]">
                        {selectedType?.label || 'Not selected'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Campaign Title</p>
                      <p className="text-sm font-medium text-[#1B2A4A]">{formData.title || 'Untitled'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Placements</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.placements.length > 0 ? (
                          formData.placements.map((p) => (
                            <span
                              key={p}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#2AA198]/10 text-[#2AA198] font-medium"
                            >
                              {placementOptions.find((o) => o.id === p)?.label || p}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No placements selected</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Countries</p>
                      <p className="text-sm text-[#1B2A4A]">{formData.countries.join(', ') || 'None'}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Member Tiers</p>
                      <p className="text-sm text-[#1B2A4A]">
                        {formData.memberTiers
                          .map((t) => tierOptions.find((o) => o.id === t)?.label || t)
                          .join(', ') || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total Budget</p>
                      <p className="text-sm font-semibold text-[#1B2A4A]">${formData.budget.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Schedule</p>
                      <p className="text-sm text-[#1B2A4A]">
                        {formData.startDate} to {formData.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Daily Budget</p>
                      <p className="text-sm text-[#1B2A4A]">
                        {formData.dailyBudgetEnabled ? `$${formData.dailyBudget}/day` : 'No limit'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Estimated reach */}
                <div className="border-t border-gray-100 pt-4">
                  <h3 className="text-sm font-medium text-[#1B2A4A] mb-3">Estimated Performance</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#2AA198]/5 rounded-lg p-3 text-center">
                      <Eye className="w-4 h-4 text-[#2AA198] mx-auto mb-1" />
                      <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                        {estimatedTotalImpressions > 0 ? `${(estimatedTotalImpressions / 1000).toFixed(0)}K` : '--'}
                      </p>
                      <p className="text-[10px] text-gray-500">Est. Impressions</p>
                    </div>
                    <div className="bg-[#D4A843]/5 rounded-lg p-3 text-center">
                      <MousePointerClick className="w-4 h-4 text-[#D4A843] mx-auto mb-1" />
                      <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                        {estimatedClicks > 0 ? `${(estimatedClicks / 1000).toFixed(1)}K` : '--'}
                      </p>
                      <p className="text-[10px] text-gray-500">Est. Clicks</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                      <p className="text-lg font-bold text-[#1B2A4A] tabular-nums">
                        {estimatedDailyReach > 0 ? `${(estimatedDailyReach / 1000).toFixed(1)}K` : '--'}
                      </p>
                      <p className="text-[10px] text-gray-500">Daily Reach</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          NAVIGATION BUTTONS
      ═════════════════════════════════════════════════════════════════ */}
      <motion.div variants={fadeUp} className="flex items-center justify-between pt-2">
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            currentStep === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {currentStep < 5 ? (
          <button
            onClick={goNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium bg-[#2AA198] text-white hover:bg-[#1A7A72] transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:shadow-lg"
            style={{ background: 'linear-gradient(135deg, #D4A843 0%, #B8912E 100%)' }}
          >
            <ClipboardCheck className="w-4 h-4" />
            Submit for Review
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
