'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Globe, Building2, Hash, BarChart3,
  TrendingUp, Wheat, MapPin, Banknote, FileCheck, ChevronRight,
  ChevronLeft, CheckCircle2, AlertCircle, Loader2, Send,
  ArrowRight, ShieldCheck, Scale,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

/* ─── Constants ─── */
const AFU_COUNTRIES = [
  'Zimbabwe', 'Botswana', 'Tanzania', 'Kenya', 'Uganda',
  'South Africa', 'Zambia', 'Malawi', 'Mozambique', 'Namibia',
  'Ethiopia', 'Ghana', 'Nigeria', 'Senegal', 'Ivory Coast',
  'Rwanda', 'Lesotho', 'Eswatini', 'Angola', 'Chad',
];

const FALLBACK_COMMODITIES = [
  'Maize', 'Wheat', 'Sorghum', 'Rice', 'Coffee', 'Tea', 'Cocoa',
  'Tobacco', 'Cashew Nuts', 'Sesame', 'Soybean', 'Groundnuts',
  'Sunflower', 'Macadamia', 'Blueberries', 'Avocado', 'Cotton',
  'Sugarcane', 'Beef Cattle',
];

const EXPERIENCE_LEVELS = [
  'New to trading',
  '1-3 years',
  '3-5 years',
  '5+ years',
  'Institutional/Corporate',
];

const VOLUME_TIERS = [
  'Under 100 MT',
  '100-500 MT',
  '500-1,000 MT',
  '1,000-5,000 MT',
  '5,000+ MT',
];

const CURRENCIES = [
  'USD', 'ZAR', 'KES', 'TZS', 'BWP',
  'GHS', 'NGN', 'MZN', 'ETB', 'ZMW',
];

const REFERRAL_SOURCES = [
  'Referral',
  'Social Media',
  'Partner/Supplier',
  'Event/Conference',
  'Web Search',
  'Other',
];

const STEP_LABELS = [
  'Personal Details',
  'Business Details',
  'Trading Preferences',
  'Compliance & Submit',
];

/* ─── Types ─── */
interface FormData {
  /* Step 1 */
  fullName: string;
  email: string;
  phone: string;
  country: string;
  /* Step 2 */
  businessName: string;
  registrationNumber: string;
  tradingType: 'Buyer' | 'Seller' | 'Both' | '';
  experienceLevel: string;
  annualVolume: string;
  /* Step 3 */
  commodities: string[];
  tradingCountries: string[];
  settlementCurrency: string;
  /* Step 4 */
  bankName: string;
  bankAccountNumber: string;
  hasExportLicence: boolean;
  exportLicenceNumber: string;
  referralSource: string;
  tradeDescription: string;
  agreeTerms: boolean;
  /* Anti-spam */
  honeypot: string;
}

const initialForm: FormData = {
  fullName: '',
  email: '',
  phone: '',
  country: '',
  businessName: '',
  registrationNumber: '',
  tradingType: '',
  experienceLevel: '',
  annualVolume: '',
  commodities: [],
  tradingCountries: [],
  settlementCurrency: '',
  bankName: '',
  bankAccountNumber: '',
  hasExportLicence: false,
  exportLicenceNumber: '',
  referralSource: '',
  tradeDescription: '',
  agreeTerms: false,
  honeypot: '',
};

/* ─── Validation ─── */
function validateStep(step: number, form: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (step === 0) {
    if (!form.fullName.trim()) errors.fullName = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Enter a valid email address';
    if (!form.country) errors.country = 'Please select your country';
  }
  if (step === 1) {
    if (!form.tradingType) errors.tradingType = 'Select a trading type';
    if (!form.experienceLevel) errors.experienceLevel = 'Select your experience level';
    if (!form.annualVolume) errors.annualVolume = 'Select expected trading volume';
  }
  if (step === 2) {
    if (form.commodities.length === 0)
      errors.commodities = 'Select at least one commodity';
    if (form.tradingCountries.length === 0)
      errors.tradingCountries = 'Select at least one country';
    if (!form.settlementCurrency)
      errors.settlementCurrency = 'Select a settlement currency';
  }
  if (step === 3) {
    if (!form.bankName.trim()) errors.bankName = 'Bank name is required';
    if (!form.bankAccountNumber.trim())
      errors.bankAccountNumber = 'Account number is required';
    if (form.hasExportLicence && !form.exportLicenceNumber.trim())
      errors.exportLicenceNumber = 'Enter your licence number';
    if (!form.agreeTerms)
      errors.agreeTerms = 'You must agree to the terms';
  }
  return errors;
}

/* ─── Page Component ─── */
export default function TraderSignupPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [commodityList, setCommodityList] = useState<string[]>(FALLBACK_COMMODITIES);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const formLoadedAt = useRef(Date.now());

  /* Fetch commodities from Supabase site_config */
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('site_config')
      .select('value')
      .eq('key', 'trading_commodities')
      .single()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
            if (Array.isArray(parsed) && parsed.length > 0) setCommodityList(parsed);
          } catch {
            /* fallback stays */
          }
        }
      });
  }, []);

  /* Helpers */
  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleArray = (key: 'commodities' | 'tradingCountries', value: string) => {
    setForm((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  /* Navigation */
  const goNext = () => {
    const errs = validateStep(step, form);
    setErrors(errs);
    if (Object.keys(errs).length === 0 && step < 3) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) {
      setErrors({});
      setStep(step - 1);
    }
  };

  /* Submit */
  const handleSubmit = async () => {
    const errs = validateStep(3, form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    /* Anti-spam checks */
    if (form.honeypot) return;
    if (Date.now() - formLoadedAt.current < 3000) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/service-providers/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: 'trader',
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          business_name: form.businessName,
          motivation: form.tradeDescription,
          referral_source: form.referralSource,
          agreed_to_terms: true,
          provider_details: {
            trading_type: form.tradingType,
            experience_level: form.experienceLevel,
            annual_volume: form.annualVolume,
            preferred_commodities: form.commodities,
            preferred_countries: form.tradingCountries,
            settlement_currency: form.settlementCurrency,
            bank_name: form.bankName,
            bank_account: form.bankAccountNumber,
            has_export_license: form.hasExportLicence,
            export_license_number: form.exportLicenceNumber,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Success screen ─── */
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1B2A4A] to-[#0f1b33] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center"
        >
          <div className="mx-auto w-20 h-20 bg-[#5DB347]/10 rounded-full flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-[#5DB347]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B2A4A] mb-3">
            Application Received!
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            We&apos;ll review your application and get back to you within 3-5
            business days. Keep an eye on your inbox for updates.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-[#5DB347] font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Your data is secure with AFU</span>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((step + 1) / 4) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero ─── */}
      <section className="relative bg-[#1B2A4A] overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-[#5DB347] rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-[#5DB347] rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#5DB347]/20 text-[#5DB347] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              Commodity Trading Platform
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Trade Commodities with AFU
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8">
              Join Africa&apos;s largest agricultural commodity trading platform.
              Buy, sell, and trade across 20 countries.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1.5">
                <Wheat className="w-4 h-4 text-[#5DB347]" />
                20+ Commodities
              </span>
              <span className="text-gray-500">|</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-[#5DB347]" />
                20 Countries
              </span>
              <span className="text-gray-500">|</span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#5DB347]" />
                Competitive Commissions
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Form Area ─── */}
      <div className="max-w-3xl mx-auto px-4 -mt-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Step indicator */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[#1B2A4A]">
                Step {step + 1} of 4
              </span>
              <span className="text-sm text-gray-500">{STEP_LABELS[step]}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#5DB347] rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {/* Step dots */}
            <div className="flex items-center justify-between mt-3">
              {STEP_LABELS.map((label, i) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      i < step
                        ? 'bg-[#5DB347] text-white'
                        : i === step
                        ? 'bg-[#1B2A4A] text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs text-gray-500">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Anti-spam honeypot (hidden) */}
          <div className="absolute opacity-0 pointer-events-none" aria-hidden="true">
            <input
              tabIndex={-1}
              autoComplete="off"
              name="website_url"
              value={form.honeypot}
              onChange={(e) => set('honeypot', e.target.value)}
            />
          </div>

          {/* Step Content */}
          <div className="px-6 py-6 min-h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <Step1
                    form={form}
                    errors={errors}
                    set={set}
                  />
                )}
                {step === 1 && (
                  <Step2
                    form={form}
                    errors={errors}
                    set={set}
                  />
                )}
                {step === 2 && (
                  <Step3
                    form={form}
                    errors={errors}
                    commodityList={commodityList}
                    toggleArray={toggleArray}
                    set={set}
                  />
                )}
                {step === 3 && (
                  <Step4
                    form={form}
                    errors={errors}
                    set={set}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error toast */}
          {submitError && (
            <div className="mx-6 mb-4 flex items-center gap-2 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 pb-6 flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#4ea03c] text-white px-6 py-2.5 rounded-xl transition-colors text-sm font-medium shadow-lg shadow-[#5DB347]/20"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-[#5DB347] hover:bg-[#4ea03c] disabled:opacity-60 text-white px-6 py-2.5 rounded-xl transition-colors text-sm font-medium shadow-lg shadow-[#5DB347]/20"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Step Components
   ──────────────────────────────────────────────────────────────── */

function FieldLabel({
  children,
  required,
  icon: Icon,
}: {
  children: React.ReactNode;
  required?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm font-medium text-[#1B2A4A] mb-1.5">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      {children}
      {required && <span className="text-red-400">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
      <AlertCircle className="w-3 h-3" />
      {msg}
    </p>
  );
}

const inputClass =
  'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] transition-colors';
const selectClass = `${inputClass} appearance-none bg-white`;
const errorInputClass =
  'w-full px-4 py-2.5 border border-red-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-colors';

/* ─── Step 1: Personal Details ─── */
function Step1({
  form,
  errors,
  set,
}: {
  form: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2">
        <User className="w-5 h-5 text-[#5DB347]" />
        Personal Details
      </h3>

      <div>
        <FieldLabel required icon={User}>Full Name</FieldLabel>
        <input
          type="text"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          placeholder="Enter your full name"
          className={errors.fullName ? errorInputClass : inputClass}
        />
        <FieldError msg={errors.fullName} />
      </div>

      <div>
        <FieldLabel required icon={Mail}>Email</FieldLabel>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder="you@example.com"
          className={errors.email ? errorInputClass : inputClass}
        />
        <FieldError msg={errors.email} />
      </div>

      <div>
        <FieldLabel icon={Phone}>Phone</FieldLabel>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="+263 7XX XXX XXX"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel required icon={Globe}>Country</FieldLabel>
        <select
          value={form.country}
          onChange={(e) => set('country', e.target.value)}
          className={errors.country ? errorInputClass : selectClass}
        >
          <option value="">Select your country</option>
          {AFU_COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError msg={errors.country} />
      </div>
    </div>
  );
}

/* ─── Step 2: Business Details ─── */
function Step2({
  form,
  errors,
  set,
}: {
  form: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2">
        <Building2 className="w-5 h-5 text-[#5DB347]" />
        Business Details
      </h3>

      <div>
        <FieldLabel icon={Building2}>Business / Company Name</FieldLabel>
        <input
          type="text"
          value={form.businessName}
          onChange={(e) => set('businessName', e.target.value)}
          placeholder="Leave blank if trading as individual"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel icon={Hash}>Business Registration Number</FieldLabel>
        <input
          type="text"
          value={form.registrationNumber}
          onChange={(e) => set('registrationNumber', e.target.value)}
          placeholder="Optional"
          className={inputClass}
        />
      </div>

      <div>
        <FieldLabel required>Trading Type</FieldLabel>
        <div className="flex flex-wrap gap-3 mt-1">
          {(['Buyer', 'Seller', 'Both'] as const).map((type) => (
            <label
              key={type}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all text-sm font-medium ${
                form.tradingType === type
                  ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347]'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="tradingType"
                value={type}
                checked={form.tradingType === type}
                onChange={() => set('tradingType', type)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  form.tradingType === type
                    ? 'border-[#5DB347]'
                    : 'border-gray-300'
                }`}
              >
                {form.tradingType === type && (
                  <div className="w-2 h-2 rounded-full bg-[#5DB347]" />
                )}
              </div>
              {type}
            </label>
          ))}
        </div>
        <FieldError msg={errors.tradingType} />
      </div>

      <div>
        <FieldLabel required icon={BarChart3}>Experience Level</FieldLabel>
        <select
          value={form.experienceLevel}
          onChange={(e) => set('experienceLevel', e.target.value)}
          className={errors.experienceLevel ? errorInputClass : selectClass}
        >
          <option value="">Select experience level</option>
          {EXPERIENCE_LEVELS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <FieldError msg={errors.experienceLevel} />
      </div>

      <div>
        <FieldLabel required icon={TrendingUp}>Expected Annual Trading Volume</FieldLabel>
        <select
          value={form.annualVolume}
          onChange={(e) => set('annualVolume', e.target.value)}
          className={errors.annualVolume ? errorInputClass : selectClass}
        >
          <option value="">Select volume tier</option>
          {VOLUME_TIERS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <FieldError msg={errors.annualVolume} />
      </div>
    </div>
  );
}

/* ─── Step 3: Trading Preferences ─── */
function Step3({
  form,
  errors,
  commodityList,
  toggleArray,
  set,
}: {
  form: FormData;
  errors: Record<string, string>;
  commodityList: string[];
  toggleArray: (key: 'commodities' | 'tradingCountries', value: string) => void;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2">
        <Wheat className="w-5 h-5 text-[#5DB347]" />
        Trading Preferences
      </h3>

      {/* Commodities */}
      <div>
        <FieldLabel required>
          Select Commodities ({form.commodities.length} selected)
        </FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5 max-h-52 overflow-y-auto pr-1">
          {commodityList.map((c) => (
            <label
              key={c}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                form.commodities.includes(c)
                  ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347] font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={form.commodities.includes(c)}
                onChange={() => toggleArray('commodities', c)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  form.commodities.includes(c)
                    ? 'border-[#5DB347] bg-[#5DB347]'
                    : 'border-gray-300'
                }`}
              >
                {form.commodities.includes(c) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {c}
            </label>
          ))}
        </div>
        <FieldError msg={errors.commodities} />
      </div>

      {/* Countries */}
      <div>
        <FieldLabel required>
          Countries to Trade In ({form.tradingCountries.length} selected)
        </FieldLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1.5 max-h-52 overflow-y-auto pr-1">
          {AFU_COUNTRIES.map((c) => (
            <label
              key={c}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all text-sm ${
                form.tradingCountries.includes(c)
                  ? 'border-[#5DB347] bg-[#5DB347]/5 text-[#5DB347] font-medium'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={form.tradingCountries.includes(c)}
                onChange={() => toggleArray('tradingCountries', c)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                  form.tradingCountries.includes(c)
                    ? 'border-[#5DB347] bg-[#5DB347]'
                    : 'border-gray-300'
                }`}
              >
                {form.tradingCountries.includes(c) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {c}
            </label>
          ))}
        </div>
        <FieldError msg={errors.tradingCountries} />
      </div>

      {/* Settlement Currency */}
      <div>
        <FieldLabel required icon={Banknote}>Settlement Currency</FieldLabel>
        <select
          value={form.settlementCurrency}
          onChange={(e) => set('settlementCurrency', e.target.value)}
          className={errors.settlementCurrency ? errorInputClass : selectClass}
        >
          <option value="">Select currency</option>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <FieldError msg={errors.settlementCurrency} />
      </div>
    </div>
  );
}

/* ─── Step 4: Compliance & Submit ─── */
function Step4({
  form,
  errors,
  set,
}: {
  form: FormData;
  errors: Record<string, string>;
  set: <K extends keyof FormData>(key: K, value: FormData[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-[#1B2A4A] flex items-center gap-2">
        <FileCheck className="w-5 h-5 text-[#5DB347]" />
        Compliance &amp; Submit
      </h3>

      <div>
        <FieldLabel required icon={Banknote}>Bank Name</FieldLabel>
        <input
          type="text"
          value={form.bankName}
          onChange={(e) => set('bankName', e.target.value)}
          placeholder="e.g. Standard Bank, Stanbic, Ecobank"
          className={errors.bankName ? errorInputClass : inputClass}
        />
        <FieldError msg={errors.bankName} />
      </div>

      <div>
        <FieldLabel required icon={Hash}>Bank Account Number</FieldLabel>
        <input
          type="text"
          value={form.bankAccountNumber}
          onChange={(e) => set('bankAccountNumber', e.target.value)}
          placeholder="Your bank account number"
          className={errors.bankAccountNumber ? errorInputClass : inputClass}
        />
        <FieldError msg={errors.bankAccountNumber} />
      </div>

      {/* Export licence toggle */}
      <div>
        <div className="flex items-center justify-between">
          <FieldLabel icon={FileCheck}>Do you hold an export licence?</FieldLabel>
          <button
            type="button"
            onClick={() => set('hasExportLicence', !form.hasExportLicence)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              form.hasExportLicence ? 'bg-[#5DB347]' : 'bg-gray-200'
            }`}
          >
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                form.hasExportLicence ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        {form.hasExportLicence && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <input
              type="text"
              value={form.exportLicenceNumber}
              onChange={(e) => set('exportLicenceNumber', e.target.value)}
              placeholder="Enter your licence number"
              className={
                errors.exportLicenceNumber ? errorInputClass : inputClass
              }
            />
            <FieldError msg={errors.exportLicenceNumber} />
          </motion.div>
        )}
      </div>

      <div>
        <FieldLabel>How did you hear about AFU?</FieldLabel>
        <select
          value={form.referralSource}
          onChange={(e) => set('referralSource', e.target.value)}
          className={selectClass}
        >
          <option value="">Select an option</option>
          {REFERRAL_SOURCES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div>
        <FieldLabel>Brief description of what you want to trade</FieldLabel>
        <textarea
          rows={3}
          value={form.tradeDescription}
          onChange={(e) => set('tradeDescription', e.target.value)}
          placeholder="e.g. Looking to buy 500 MT of maize from Zambia for export to Zimbabwe..."
          className={inputClass}
        />
      </div>

      {/* Terms */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              form.agreeTerms
                ? 'border-[#5DB347] bg-[#5DB347]'
                : errors.agreeTerms
                ? 'border-red-300'
                : 'border-gray-300 group-hover:border-gray-400'
            }`}
            onClick={() => set('agreeTerms', !form.agreeTerms)}
          >
            {form.agreeTerms && (
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          <span className="text-sm text-gray-600 leading-relaxed">
            I agree to the{' '}
            <a
              href="/legal/terms"
              target="_blank"
              className="text-[#5DB347] hover:underline font-medium"
            >
              AFU Trading Terms &amp; Conditions
            </a>
          </span>
        </label>
        <FieldError msg={errors.agreeTerms} />
      </div>
    </div>
  );
}
