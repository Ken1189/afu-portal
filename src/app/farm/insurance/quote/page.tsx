'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle2,
  ChevronDown,
  MapPin,
  Ruler,
  Sprout,
  Star,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  Calculator,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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

const mockInsuranceProducts: InsuranceProduct[] = [
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
/* Constants                                                           */
/* ------------------------------------------------------------------ */
const cropTypes = [
  'Maize',
  'Groundnuts',
  'Sorghum',
  'Soya',
  'Sunflower',
  'Tobacco',
  'Cotton',
  'Vegetables',
];

const livestockTypes = [
  { key: 'cattle', label: 'Cattle', emoji: '\u{1F404}' },
  { key: 'goats', label: 'Goats', emoji: '\u{1F410}' },
  { key: 'sheep', label: 'Sheep', emoji: '\u{1F411}' },
  { key: 'poultry', label: 'Poultry', emoji: '\u{1F414}' },
];

const regions = {
  Botswana: ['North-West', 'Central', 'Southern'],
  Zimbabwe: ['Mashonaland', 'Manicaland', 'Matabeleland'],
  Tanzania: ['Kilimanjaro', 'Dodoma', 'Mbeya'],
};

/* ── Rate table for premium calculation ── */
const typeRates: Record<InsuranceType, number> = {
  crop: 0.035,
  livestock: 0.045,
  equipment: 0.03,
  'weather-index': 0.025,
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function QuotePage() {
  const { t } = useLanguage();
  const ti = t.insurance;

  const insuranceProducts: InsuranceProduct[] = mockInsuranceProducts;

  /* ── Form state ── */
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [farmSize, setFarmSize] = useState<number>(2);
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  const [livestock, setLivestock] = useState<Record<string, number>>({
    cattle: 0,
    goats: 0,
    sheep: 0,
    poultry: 0,
  });
  const [equipmentValue, setEquipmentValue] = useState<number>(0);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [coverageAmount, setCoverageAmount] = useState<number>(0);
  const [showEstimate, setShowEstimate] = useState(false);

  const selectedProduct = useMemo(
    () => insuranceProducts.find((p) => p.id === selectedProductId) ?? null,
    [selectedProductId],
  );

  /* ── When a product is selected, set default coverage to midpoint ── */
  const handleSelectProduct = useCallback(
    (product: InsuranceProduct) => {
      setSelectedProductId(product.id);
      const mid = Math.round((product.coverageRange.min + product.coverageRange.max) / 2);
      setCoverageAmount(mid);
      setShowEstimate(false);
    },
    [],
  );

  /* ── Toggle crop selection ── */
  const toggleCrop = (crop: string) => {
    setSelectedCrops((prev) =>
      prev.includes(crop) ? prev.filter((c) => c !== crop) : [...prev, crop],
    );
  };

  /* ── Premium calculation ── */
  const premiumEstimate = useMemo(() => {
    if (!selectedProduct) return null;

    const rate = typeRates[selectedProduct.type];
    let baseValue = 0;

    if (selectedProduct.type === 'crop' || selectedProduct.type === 'weather-index') {
      // farmSize * coverage per hectare
      const coveragePerHa = coverageAmount / Math.max(farmSize, 0.5);
      baseValue = farmSize * coveragePerHa * rate;
    } else if (selectedProduct.type === 'livestock') {
      const totalHead =
        livestock.cattle * 250 +
        livestock.goats * 80 +
        livestock.sheep * 100 +
        livestock.poultry * 15;
      baseValue = Math.max(totalHead, coverageAmount) * rate;
    } else if (selectedProduct.type === 'equipment') {
      baseValue = Math.max(equipmentValue, coverageAmount) * rate;
    }

    // Clamp monthly premium to the product's premium range
    const monthlyRaw = baseValue / 12;
    const monthly = Math.max(
      selectedProduct.premiumRange.min,
      Math.min(monthlyRaw, selectedProduct.premiumRange.max * 1.2),
    );
    const annual = monthly * 12;
    const deductibleAmount = coverageAmount * (selectedProduct.deductible / 100);

    return {
      monthly: Math.round(monthly * 100) / 100,
      annual: Math.round(annual * 100) / 100,
      coverage: coverageAmount,
      deductible: Math.round(deductibleAmount * 100) / 100,
      deductiblePercent: selectedProduct.deductible,
    };
  }, [selectedProduct, farmSize, coverageAmount, livestock, equipmentValue]);

  const canCalculate = selectedProduct !== null && (selectedCountry !== '' || true);

  const handleCalculate = () => {
    setShowEstimate(true);
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
        <h1 className="text-xl sm:text-2xl font-bold text-navy">{ti.getQuote}</h1>
        <p className="text-sm text-gray-500 mt-1">{ti.calculatePremium}</p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ────────────────────────────────────────────────────────────── */}
        {/* SECTION 1 — Insurance Type                                    */}
        {/* ────────────────────────────────────────────────────────────── */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">
              1
            </div>
            <h2 className="text-base font-bold text-navy">Select Insurance Type</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {insuranceProducts.map((product) => {
              const isSelected = selectedProductId === product.id;
              return (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all min-h-[44px] ${
                    isSelected
                      ? 'border-teal bg-teal/5 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200 active:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${
                        isSelected
                          ? 'bg-teal/10'
                          : 'bg-gray-50'
                      }`}
                    >
                      {product.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate ${
                            isSelected ? 'text-teal' : 'text-navy'
                          }`}
                        >
                          {product.name}
                        </p>
                        {product.popular && (
                          <Star className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">
                        {product.description}
                      </p>
                      <p className="text-xs font-medium text-gray-500 mt-1">
                        ${product.premiumRange.min} - ${product.premiumRange.max}{ti.perMonth}
                      </p>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-teal flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* SECTION 2 — Farm Details                                      */}
        {/* ────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.section
              key="farm-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h2 className="text-base font-bold text-navy">{ti.farmDetails}</h2>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-5">
                {/* Farm Size Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-navy flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-gray-400" />
                      {ti.farmSize}
                    </label>
                    <span className="text-sm font-bold text-teal">{farmSize} ha</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="50"
                    step="0.5"
                    value={farmSize}
                    onChange={(e) => {
                      setFarmSize(parseFloat(e.target.value));
                      setShowEstimate(false);
                    }}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>0.5 ha</span>
                    <span>25 ha</span>
                    <span>50 ha</span>
                  </div>
                </div>

                {/* Crop Type Multi-Select (for crop / weather-index types) */}
                {(selectedProduct.type === 'crop' || selectedProduct.type === 'weather-index') && (
                  <div>
                    <label className="text-sm font-medium text-navy flex items-center gap-2 mb-3">
                      <Sprout className="w-4 h-4 text-gray-400" />
                      {ti.cropType}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {cropTypes.map((crop) => {
                        const selected = selectedCrops.includes(crop);
                        return (
                          <button
                            key={crop}
                            onClick={() => {
                              toggleCrop(crop);
                              setShowEstimate(false);
                            }}
                            className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] ${
                              selected
                                ? 'bg-teal text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 active:bg-gray-200'
                            }`}
                          >
                            {crop}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Livestock Count (for livestock type) */}
                {selectedProduct.type === 'livestock' && (
                  <div>
                    <label className="text-sm font-medium text-navy mb-3 block">
                      Livestock Count
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {livestockTypes.map((lt) => (
                        <div
                          key={lt.key}
                          className="bg-gray-50 rounded-xl p-3 flex items-center gap-3"
                        >
                          <span className="text-xl">{lt.emoji}</span>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-navy">{lt.label}</p>
                            <input
                              type="number"
                              inputMode="numeric"
                              min="0"
                              value={livestock[lt.key]}
                              onChange={(e) => {
                                setLivestock((prev) => ({
                                  ...prev,
                                  [lt.key]: Math.max(0, parseInt(e.target.value) || 0),
                                }));
                                setShowEstimate(false);
                              }}
                              className="w-full mt-1 px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none bg-white"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Equipment Value (for equipment type) */}
                {selectedProduct.type === 'equipment' && (
                  <div>
                    <label className="text-sm font-medium text-navy mb-2 block">
                      Equipment Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={equipmentValue || ''}
                        onChange={(e) => {
                          setEquipmentValue(Math.max(0, parseInt(e.target.value) || 0));
                          setShowEstimate(false);
                        }}
                        placeholder="e.g. 5000"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Region */}
                <div>
                  <label className="text-sm font-medium text-navy flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    Region
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <select
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setSelectedRegion('');
                          setShowEstimate(false);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none appearance-none bg-white min-h-[44px]"
                      >
                        <option value="">Select Country</option>
                        {Object.keys(regions).map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    {selectedCountry && (
                      <div className="relative">
                        <select
                          value={selectedRegion}
                          onChange={(e) => {
                            setSelectedRegion(e.target.value);
                            setShowEstimate(false);
                          }}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none appearance-none bg-white min-h-[44px]"
                        >
                          <option value="">Select Region</option>
                          {regions[selectedCountry as keyof typeof regions]?.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* SECTION 3 — Coverage Selection                                */}
        {/* ────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.section
              key="coverage-selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h2 className="text-base font-bold text-navy">{ti.coverageAmount}</h2>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500">{ti.coverage}</span>
                  <span className="text-lg font-bold text-teal">
                    ${coverageAmount.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={selectedProduct.coverageRange.min}
                  max={selectedProduct.coverageRange.max}
                  step={Math.max(50, Math.round((selectedProduct.coverageRange.max - selectedProduct.coverageRange.min) / 50) * 10)}
                  value={coverageAmount}
                  onChange={(e) => {
                    setCoverageAmount(parseInt(e.target.value));
                    setShowEstimate(false);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal"
                />
                <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                  <span>${selectedProduct.coverageRange.min.toLocaleString()}</span>
                  <span>${selectedProduct.coverageRange.max.toLocaleString()}</span>
                </div>

                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  disabled={!canCalculate}
                  className={`w-full mt-5 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 min-h-[48px] ${
                    canCalculate
                      ? 'bg-navy hover:bg-navy/90 active:bg-navy/80 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                  {ti.calculatePremium}
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ────────────────────────────────────────────────────────────── */}
        {/* SECTION 4 — Premium Estimate                                  */}
        {/* ────────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {showEstimate && premiumEstimate && selectedProduct && (
            <motion.section
              key="premium-estimate"
              initial={{ opacity: 0, y: 30, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <h2 className="text-base font-bold text-navy">{ti.estimatedPremium}</h2>
              </div>

              <div className="bg-gradient-to-br from-navy via-navy to-[#8CB89C] rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden relative">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />

                <div className="relative z-10">
                  {/* Main premium display */}
                  <div className="text-center mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                      className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-3"
                    >
                      <Sparkles className="w-4 h-4 text-gold" />
                      <span className="text-xs font-medium opacity-90">Your Estimate</span>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="flex items-baseline justify-center gap-1 mb-1">
                        <span className="text-sm opacity-70">$</span>
                        <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                          {premiumEstimate.monthly.toFixed(2)}
                        </span>
                        <span className="text-sm opacity-70">{ti.perMonth}</span>
                      </div>
                      <p className="text-sm opacity-70">
                        ${premiumEstimate.annual.toFixed(2)} / year
                      </p>
                    </motion.div>
                  </div>

                  {/* Estimate details */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-2 gap-3 mb-5"
                  >
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">
                        {ti.coverageAmount}
                      </p>
                      <p className="text-base font-bold">
                        ${premiumEstimate.coverage.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">
                        {ti.deductible}
                      </p>
                      <p className="text-base font-bold">
                        ${premiumEstimate.deductible.toLocaleString()} ({premiumEstimate.deductiblePercent}%)
                      </p>
                    </div>
                  </motion.div>

                  {/* What's covered */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white/10 rounded-xl p-4 mb-5"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-2">
                      What{'\u2019'}s Covered
                    </p>
                    <ul className="space-y-1.5">
                      {selectedProduct.coverageDetails.slice(0, 4).map((detail, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm opacity-90"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-300 flex-shrink-0 mt-0.5" />
                          {detail}
                        </li>
                      ))}
                      {selectedProduct.coverageDetails.length > 4 && (
                        <li className="text-xs opacity-60 pl-6">
                          +{selectedProduct.coverageDetails.length - 4} more covered items
                        </li>
                      )}
                    </ul>
                  </motion.div>

                  {/* Product summary row */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center gap-2 mb-5 bg-white/10 rounded-xl p-3"
                  >
                    <span className="text-xl">{selectedProduct.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{selectedProduct.name}</p>
                      <p className="text-[11px] opacity-60">
                        {ti.waitingPeriod}: {selectedProduct.waitingPeriod}
                      </p>
                    </div>
                  </motion.div>

                  {/* CTA Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <button className="w-full bg-gold hover:bg-gold/90 active:bg-gold/80 text-navy py-4 rounded-xl text-base font-bold transition-colors flex items-center justify-center gap-2 min-h-[52px] shadow-lg">
                      <Shield className="w-5 h-5" />
                      {ti.getInsured}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-[11px] text-center opacity-50 mt-2">
                      This is an estimate. Final premium may vary after verification.
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
