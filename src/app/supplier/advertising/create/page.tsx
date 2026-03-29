'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/supabase/auth-context';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Image as ImageIcon,
  LayoutTemplate,
  Target,
  DollarSign,
  ClipboardCheck,
  Upload,
  X,
  Star,
  Eye,
  MousePointerClick,
  Globe,
  Megaphone,
  Loader2,
  AlertCircle,
  Link as LinkIcon,
  FileText,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
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

interface AdPackage {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_cents: number;
  max_impressions: number;
  allowed_types: string[];
  max_placements: number;
  duration_days: number;
  includes_newsletter: boolean;
  includes_push_notification: boolean;
  sort_order: number;
}

interface CountryTier {
  country_code: string;
  country_name: string;
  tier: string;
  banner_price_cents: number;
  featured_price_cents: number;
  directory_price_cents: number;
  newsletter_price_cents: number;
  is_active: boolean;
}

interface FormData {
  packageId: string;
  countries: string[];
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  placementType: string;
}

// ── Step definitions ────────────────────────────────────────────────────────

const steps = [
  { id: 1, label: 'Choose Package', icon: <DollarSign className="w-4 h-4" /> },
  { id: 2, label: 'Select Countries', icon: <Globe className="w-4 h-4" /> },
  { id: 3, label: 'Upload Creative', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 4, label: 'Review & Submit', icon: <ClipboardCheck className="w-4 h-4" /> },
];

const placementTypes = [
  { id: 'banner', label: 'Banner Ad', icon: <LayoutTemplate className="w-5 h-5" />, desc: 'Full-width banner on portal pages' },
  { id: 'featured-product', label: 'Featured Product', icon: <Star className="w-5 h-5" />, desc: 'Highlighted in marketplace listings' },
  { id: 'sponsored-content', label: 'Sponsored Content', icon: <Megaphone className="w-5 h-5" />, desc: 'Native content in training/resources' },
  { id: 'sidebar', label: 'Sidebar Ad', icon: <ImageIcon className="w-5 h-5" />, desc: 'Compact sidebar placement' },
];

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CreateCampaign() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Data from API
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [countryTiers, setCountryTiers] = useState<CountryTier[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [supplierId, setSupplierId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    packageId: '',
    countries: [],
    title: '',
    description: '',
    imageUrl: '',
    targetUrl: '',
    placementType: 'banner',
  });

  // ── Fetch packages and country tiers ────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/ads/packages');
        if (res.ok) {
          const data = await res.json();
          if (data.packages) setPackages(data.packages);
          if (data.countryTiers) setCountryTiers(data.countryTiers);
        }
      } catch {
        // Will show fallback
      }

      // Also fallback to direct Supabase query
      if (packages.length === 0) {
        try {
          const supabase = createClient();
          const { data: pkgs } = await supabase
            .from('ad_packages')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
          if (pkgs && pkgs.length > 0) setPackages(pkgs);

          const { data: tiers } = await supabase
            .from('ad_country_tiers')
            .select('*')
            .eq('is_active', true)
            .order('tier', { ascending: true });
          if (tiers && tiers.length > 0) setCountryTiers(tiers);
        } catch {
          // Use empty arrays
        }
      }

      setLoadingPackages(false);
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Get supplier ID ─────────────────────────────────────────────────────
  useEffect(() => {
    async function getSupplierId() {
      try {
        const supabase = createClient();
        const { data: supplier } = await supabase
          .from('suppliers')
          .select('id')
          .eq('email', user?.email ?? '')
          .single();
        if (supplier) setSupplierId(supplier.id);
      } catch {
        // Fallback
      }
    }
    if (user) getSupplierId();
  }, [user]);

  const goNext = () => {
    if (currentStep < 4) {
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

  const toggleCountry = (code: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: prev.countries.includes(code)
        ? prev.countries.filter((c) => c !== code)
        : [...prev.countries, code],
    }));
  };

  // ── Selected package ────────────────────────────────────────────────────
  const selectedPackage = packages.find((p) => p.id === formData.packageId);

  // ── Total cost calculation ──────────────────────────────────────────────
  const calculateTotalCost = (): number => {
    let total = 0;
    if (selectedPackage) {
      total += selectedPackage.price_cents;
    }
    // Add per-country pricing
    formData.countries.forEach((code) => {
      const tier = countryTiers.find((t) => t.country_code === code);
      if (tier) {
        if (formData.placementType === 'banner') total += tier.banner_price_cents;
        else if (formData.placementType === 'featured-product') total += tier.featured_price_cents;
        else total += tier.banner_price_cents; // default
      }
    });
    return total;
  };

  const totalCostCents = calculateTotalCost();
  const totalCostFormatted = `$${(totalCostCents / 100).toFixed(2)}`;

  // ── Step validation ─────────────────────────────────────────────────────
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.packageId;
      case 2:
        return formData.countries.length > 0;
      case 3:
        return !!formData.title && !!formData.placementType;
      default:
        return true;
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();

      if (!supplierId) {
        throw new Error('Supplier account not found. Please contact support.');
      }

      const { error } = await supabase.from('advertisements').insert({
        supplier_id: supplierId,
        title: formData.title,
        description: formData.description,
        image_url: formData.imageUrl || null,
        target_url: formData.targetUrl || null,
        target_countries: formData.countries,
        package_id: formData.packageId || null,
        placement_type: formData.placementType,
        creative_type: 'image',
        status: 'pending',
        budget: totalCostCents / 100,
        spent: 0,
        impressions: 0,
        clicks: 0,
      });

      if (error) throw error;
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit ad. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ───────────────────────────────────────────────────────
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
            className="w-16 h-16 rounded-full bg-[#8CB89C]/10 flex items-center justify-center mx-auto mb-5"
          >
            <Check className="w-8 h-8 text-[#8CB89C]" />
          </motion.div>
          <h2 className="text-xl font-bold text-[#1B2A4A] mb-2">Ad Submitted for Review!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your ad &ldquo;{formData.title || 'Untitled'}&rdquo; has been submitted.
            Our team will review and approve it within 24 hours. You&apos;ll receive a notification once it&apos;s live.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Link
              href="/supplier/advertising"
              className="px-5 py-2.5 rounded-lg text-sm font-medium bg-[#8CB89C] text-white hover:bg-[#729E82] transition-colors"
            >
              Back to Advertising
            </Link>
            <button
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
                setFormData({
                  packageId: '',
                  countries: [],
                  title: '',
                  description: '',
                  imageUrl: '',
                  targetUrl: '',
                  placementType: 'banner',
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
      {/* HEADER */}
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <Link href="/supplier/advertising" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Create New Ad</h1>
          <p className="text-sm text-gray-500 mt-0.5">Set up a new advertisement in 4 simple steps</p>
        </div>
      </motion.div>

      {/* STEP INDICATOR */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-shrink-0">
                <motion.div
                  animate={{
                    backgroundColor: currentStep > step.id ? '#8CB89C' : currentStep === step.id ? '#8CB89C' : '#E5E7EB',
                    color: currentStep >= step.id ? '#FFFFFF' : '#9CA3AF',
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </motion.div>
                <span className={`text-[10px] mt-1.5 font-medium text-center hidden sm:block ${currentStep >= step.id ? 'text-[#8CB89C]' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 mt-[-18px] sm:mt-[-6px]">
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ backgroundColor: currentStep > step.id ? '#8CB89C' : '#E5E7EB' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* STEP CONTENT */}
      <div className="relative overflow-hidden min-h-[420px]">
        <AnimatePresence mode="wait" custom={direction}>
          {/* ── STEP 1: Choose Package ──────────────────────────────────── */}
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
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Choose an Ad Package</h2>
              <p className="text-sm text-gray-500">Select the package that best fits your advertising goals and budget.</p>

              {loadingPackages ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-[#8CB89C] animate-spin" />
                </div>
              ) : packages.length === 0 ? (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-500">No ad packages available at this time. Please check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <motion.button
                      key={pkg.id}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setFormData((prev) => ({ ...prev, packageId: pkg.id }))}
                      className={`relative text-left p-5 rounded-xl border-2 transition-all ${
                        formData.packageId === pkg.id
                          ? 'border-[#8CB89C] bg-[#8CB89C]/5 shadow-sm'
                          : 'border-gray-100 bg-white hover:border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-[#1B2A4A]">{pkg.name}</h3>
                        <span className="text-lg font-bold text-[#D4A843]">
                          ${(pkg.price_cents / 100).toFixed(0)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">{pkg.description || 'Standard advertising package'}</p>
                      <div className="space-y-1 text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <Eye className="w-3 h-3" />
                          Up to {pkg.max_impressions.toLocaleString()} impressions
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Target className="w-3 h-3" />
                          {pkg.duration_days} days duration
                        </div>
                        <div className="flex items-center gap-1.5">
                          <LayoutTemplate className="w-3 h-3" />
                          {pkg.max_placements} placement{pkg.max_placements > 1 ? 's' : ''}
                        </div>
                        {pkg.includes_newsletter && (
                          <div className="flex items-center gap-1.5 text-[#8CB89C]">
                            <Check className="w-3 h-3" /> Newsletter inclusion
                          </div>
                        )}
                        {pkg.includes_push_notification && (
                          <div className="flex items-center gap-1.5 text-[#8CB89C]">
                            <Check className="w-3 h-3" /> Push notifications
                          </div>
                        )}
                      </div>
                      {formData.packageId === pkg.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#8CB89C] flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: Select Countries ───────────────────────────────── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-4"
            >
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Select Target Countries</h2>
              <p className="text-sm text-gray-500">Choose which countries to show your ad in. Pricing varies by market.</p>

              {/* Tier groups */}
              {['tier_1', 'tier_2', 'tier_3'].map((tier) => {
                const tierCountries = countryTiers.filter((c) => c.tier === tier);
                if (tierCountries.length === 0) return null;
                const tierLabel = tier === 'tier_1' ? 'Tier 1 — Large Markets' : tier === 'tier_2' ? 'Tier 2 — Medium Markets' : 'Tier 3 — Emerging Markets';
                return (
                  <div key={tier} className="bg-white rounded-xl border border-gray-100 p-5">
                    <h3 className="font-medium text-[#1B2A4A] text-sm mb-3 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#8CB89C]" />
                      {tierLabel}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {tierCountries.map((country) => {
                        const price = formData.placementType === 'featured-product'
                          ? country.featured_price_cents
                          : country.banner_price_cents;
                        return (
                          <label
                            key={country.country_code}
                            className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              formData.countries.includes(country.country_code)
                                ? 'border-[#8CB89C] bg-[#8CB89C]/5'
                                : 'border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.countries.includes(country.country_code)}
                                onChange={() => toggleCountry(country.country_code)}
                                className="w-4 h-4 rounded border-gray-300 text-[#8CB89C] focus:ring-[#8CB89C]"
                              />
                              <div>
                                <span className="text-sm font-medium text-[#1B2A4A]">{country.country_name}</span>
                                <span className="text-xs text-gray-400 ml-1">({country.country_code})</span>
                              </div>
                            </div>
                            <span className="text-xs font-medium text-[#D4A843]">
                              +${(price / 100).toFixed(0)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {countryTiers.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <p className="text-sm text-gray-500">Country pricing information not available. Your ad will target all countries by default.</p>
                </div>
              )}

              {/* Selected summary */}
              {formData.countries.length > 0 && (
                <div className="bg-[#8CB89C]/5 border border-[#8CB89C]/20 rounded-xl p-4">
                  <p className="text-sm text-[#1B2A4A] font-medium">
                    {formData.countries.length} countries selected
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {formData.countries.map((code) => {
                      const c = countryTiers.find((t) => t.country_code === code);
                      return (
                        <span key={code} className="text-[10px] px-2 py-0.5 rounded-full bg-[#8CB89C]/10 text-[#8CB89C] font-medium">
                          {c?.country_name || code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Upload Creative ────────────────────────────────── */}
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
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Ad Creative</h2>

              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
                {/* Placement type */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-2">Placement Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {placementTypes.map((pt) => (
                      <button
                        key={pt.id}
                        onClick={() => setFormData((prev) => ({ ...prev, placementType: pt.id }))}
                        className={`text-left p-3 rounded-lg border-2 transition-all ${
                          formData.placementType === pt.id
                            ? 'border-[#8CB89C] bg-[#8CB89C]/5'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className={`mb-2 ${formData.placementType === pt.id ? 'text-[#8CB89C]' : 'text-gray-400'}`}>
                          {pt.icon}
                        </div>
                        <p className="text-xs font-medium text-[#1B2A4A]">{pt.label}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{pt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Ad Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Season Opening Sale - 20% Off All Seeds"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-all"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your offer, product, or message..."
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-all resize-none"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">
                    <ImageIcon className="w-4 h-4 inline mr-1" />
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://example.com/your-ad-image.jpg"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Recommended: 800x400px, PNG or JPG</p>
                </div>

                {/* Target URL */}
                <div>
                  <label className="block text-sm font-medium text-[#1B2A4A] mb-1.5">
                    <LinkIcon className="w-4 h-4 inline mr-1" />
                    Target URL *
                  </label>
                  <input
                    type="url"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData((prev) => ({ ...prev, targetUrl: e.target.value }))}
                    placeholder="https://your-website.com/landing-page"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm text-[#1B2A4A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/30 focus:border-[#8CB89C] transition-all"
                  />
                </div>
              </div>

              {/* Ad preview */}
              {formData.title && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h3 className="font-medium text-[#1B2A4A] text-sm mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-[#8CB89C]" />
                    Preview
                  </h3>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#8CB89C]/10 to-[#1B2A4A]/5 p-6">
                      <div className="flex items-start gap-4">
                        {formData.imageUrl ? (
                          <img
                            src={formData.imageUrl}
                            alt="Ad preview"
                            className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-24 h-16 bg-[#8CB89C]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <ImageIcon className="w-6 h-6 text-[#8CB89C]" />
                          </div>
                        )}
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

          {/* ── STEP 4: Review & Submit ─────────────────────────────────── */}
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
              <h2 className="text-lg font-semibold text-[#1B2A4A]">Review & Submit</h2>

              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Package</p>
                      <p className="text-sm font-medium text-[#1B2A4A]">
                        {selectedPackage?.name || 'Not selected'}
                        {selectedPackage && <span className="text-[#D4A843] ml-1">(${(selectedPackage.price_cents / 100).toFixed(0)})</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Ad Title</p>
                      <p className="text-sm font-medium text-[#1B2A4A]">{formData.title || 'Untitled'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Placement Type</p>
                      <p className="text-sm text-[#1B2A4A]">
                        {placementTypes.find((t) => t.id === formData.placementType)?.label || formData.placementType}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Target Countries ({formData.countries.length})</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.countries.length > 0 ? (
                          formData.countries.map((code) => {
                            const c = countryTiers.find((t) => t.country_code === code);
                            return (
                              <span key={code} className="text-[10px] px-2 py-0.5 rounded-full bg-[#8CB89C]/10 text-[#8CB89C] font-medium">
                                {c?.country_name || code}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-gray-400">None selected</span>
                        )}
                      </div>
                    </div>
                    {formData.description && (
                      <div>
                        <p className="text-xs text-gray-500">Description</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
                      </div>
                    )}
                    {formData.targetUrl && (
                      <div>
                        <p className="text-xs text-gray-500">Target URL</p>
                        <p className="text-sm text-blue-600 truncate">{formData.targetUrl}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total cost */}
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[#1B2A4A]">Total Cost</p>
                      <p className="text-xs text-gray-400">Package + country targeting fees</p>
                    </div>
                    <p className="text-2xl font-bold text-[#D4A843]">{totalCostFormatted}</p>
                  </div>
                </div>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-700">{submitError}</p>
                </div>
              )}

              {/* Notice */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs text-blue-700">
                  <FileText className="w-3.5 h-3.5 inline mr-1" />
                  Your ad will be reviewed by our team before going live. Typical review time is within 24 hours.
                  You will be notified when your ad is approved or if changes are needed.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* NAVIGATION BUTTONS */}
      <motion.div variants={cardVariants} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-4">
        <button
          onClick={goBack}
          disabled={currentStep === 1}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStep === 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="text-xs text-gray-400">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < 4 ? (
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              canProceed()
                ? 'bg-[#8CB89C] text-white hover:bg-[#729E82] shadow-sm'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !formData.title}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
              submitting || !formData.title
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'text-white shadow-sm hover:shadow-md'
            }`}
            style={!submitting && formData.title ? { background: 'linear-gradient(135deg, #D4A843 0%, #B8912E 100%)' } : {}}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Submit Ad for Review
              </>
            )}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
