'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoans } from '@/lib/supabase/use-loans';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  DollarSign,
  FileText,
  User,
  Upload,
  Banknote,
  Building2,
  Wheat,
  Clock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

/* ─── Types ─── */
interface FormData {
  type: string;
  amount: string;
  purpose: string;
  tenor: string;
  cropType: string;
  hectares: string;
  yieldEstimate: string;
  buyerName: string;
  buyerCountry: string;
  contractValue: string;
  hasContract: string;
  collateral: string;
  collateralValue: string;
  bankName: string;
  accountHolder: string;
  notes: string;
}

interface FieldError {
  [key: string]: string;
}

const STEPS = [
  { id: 1, label: 'Finance Type', icon: Banknote },
  { id: 2, label: 'Crop Details', icon: Wheat },
  { id: 3, label: 'Buyer Info', icon: Building2 },
  { id: 4, label: 'Documents', icon: Upload },
  { id: 5, label: 'Review', icon: ShieldCheck },
];

const initialFormData: FormData = {
  type: '',
  amount: '',
  purpose: '',
  tenor: '',
  cropType: '',
  hectares: '',
  yieldEstimate: '',
  buyerName: '',
  buyerCountry: '',
  contractValue: '',
  hasContract: '',
  collateral: '',
  collateralValue: '',
  bankName: '',
  accountHolder: '',
  notes: '',
};

/* ─── Shared input styles ─── */
const inputCls =
  'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8CB89C]/50 focus:border-[#8CB89C] transition-colors bg-white text-navy placeholder:text-gray-400';
const labelCls = 'block text-sm font-medium text-navy mb-2';
const errorCls = 'text-red-500 text-xs mt-1 flex items-center gap-1';

/* ─── Slide animation ─── */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export default function FinancingApplyPage() {
  const router = useRouter();
  const { applyForLoan } = useLoans();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FieldError>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [applicationRef, setApplicationRef] = useState('');
  const [autoSaved, setAutoSaved] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clean up redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  /* ─── Updater ─── */
  const update = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      // Auto-save indicator
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 1500);
    },
    []
  );

  /* ─── Validation per step ─── */
  const validateStep = (s: number): boolean => {
    const errs: FieldError = {};
    if (s === 1) {
      if (!formData.type) errs.type = 'Please select a financing type';
      if (!formData.amount) errs.amount = 'Amount is required';
      else if (isNaN(Number(formData.amount.replace(/,/g, ''))) || Number(formData.amount.replace(/,/g, '')) <= 0)
        errs.amount = 'Enter a valid amount';
      if (!formData.purpose) errs.purpose = 'Purpose is required';
      if (!formData.tenor) errs.tenor = 'Select a preferred tenor';
    }
    if (s === 2) {
      if (!formData.cropType) errs.cropType = 'Select a crop type';
      if (!formData.hectares) errs.hectares = 'Enter farm size';
    }
    if (s === 3) {
      // Buyer info is optional but if contract exists, name is required
      if (formData.hasContract === 'yes' && !formData.buyerName) {
        errs.buyerName = 'Buyer name required when contract exists';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, 5));
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    // Map tenor string to months
    const tenorDays = Number(formData.tenor) || 90;
    const termMonths = Math.max(1, Math.round(tenorDays / 30));

    // Parse amount
    const amount = Number(formData.amount.replace(/,/g, '')) || 0;

    const result = await applyForLoan({
      loan_type: formData.type || 'working-capital',
      amount,
      interest_rate: 0, // Determined by credit team
      term_months: termMonths,
      purpose: [
        formData.purpose,
        formData.cropType ? `Crop: ${formData.cropType}` : '',
        formData.hectares ? `Farm size: ${formData.hectares} ha` : '',
        formData.buyerName ? `Buyer: ${formData.buyerName}` : '',
        formData.buyerCountry ? `Buyer country: ${formData.buyerCountry}` : '',
        formData.contractValue ? `Contract value: $${formData.contractValue}` : '',
        formData.yieldEstimate ? `Expected yield: ${formData.yieldEstimate} tons` : '',
        formData.notes || '',
      ].filter(Boolean).join(' | '),
      collateral: formData.collateral || undefined,
    });

    setSubmitting(false);

    if (result.error) {
      setSubmitError(
        typeof result.error === 'object' && 'message' in result.error
          ? (result.error as { message: string }).message
          : 'Failed to submit application. Please try again.'
      );
      return;
    }

    // Generate reference from the returned loan data
    const loanData = result.data as { loan_number?: string; id?: string } | undefined;
    const refNumber = loanData?.loan_number || `APP-${Date.now().toString(36).toUpperCase()}`;
    setApplicationRef(refNumber);
    setSubmitted(true);

    // Redirect after 3 seconds
    redirectTimerRef.current = setTimeout(() => {
      router.push('/dashboard/financing');
    }, 3000);
  };

  /* ─── Format amount display ─── */
  const fmtAmt = (val: string) => {
    const num = Number(val.replace(/,/g, ''));
    if (isNaN(num) || num === 0) return '';
    return `$${num.toLocaleString()}`;
  };

  /* ─── SUBMITTED STATE ─── */
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-[#EDF4EF] to-white rounded-2xl p-12 border border-[#8CB89C]/20"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' as const, stiffness: 200 }}
          >
            <CheckCircle2 className="w-20 h-20 text-teal mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold text-navy mb-3">Application Submitted!</h2>
          <p className="text-gray-600 mb-2">
            Your {formData.type.replace(/-/g, ' ')} application for {fmtAmt(formData.amount)} has been received.
          </p>
          <p className="text-gray-500 text-sm mb-2">
            Reference: <span className="font-semibold text-navy">{applicationRef}</span>
            <br />Our credit team will review it within 3-5 business days.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            Redirecting to financing dashboard in a few seconds...
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard/financing"
              className="bg-teal hover:bg-teal-dark text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Back to Financing
            </Link>
            <Link
              href="/dashboard"
              className="border border-gray-200 hover:border-teal/30 text-navy px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─── MULTI-STEP FORM ─── */
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/financing"
          className="inline-flex items-center gap-1.5 text-teal hover:text-teal-dark text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Financing
        </Link>
        <div className="flex items-center justify-between mt-3">
          <div>
            <h1 className="text-2xl font-bold text-navy">New Financing Application</h1>
            <p className="text-gray-500 text-sm mt-1">Complete all steps to submit your application</p>
          </div>
          {/* Auto-save badge */}
          <AnimatePresence>
            {autoSaved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Auto-saved
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isComplete = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? 'bg-teal text-white'
                        : isActive
                        ? 'bg-teal/10 text-teal ring-2 ring-teal'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-2 font-medium hidden sm:block ${
                      isActive ? 'text-teal' : isComplete ? 'text-navy' : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${
                      step > s.id ? 'bg-teal' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-3xl overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
          >
            {/* Step 1: Finance Type */}
            {step === 1 && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-lg">Financing Details</h3>
                    <p className="text-gray-500 text-xs">Select your financing type and amount</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>
                      Financing Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`${inputCls} ${errors.type ? 'border-red-300 ring-red-100' : ''}`}
                      value={formData.type}
                      onChange={(e) => update('type', e.target.value)}
                    >
                      <option value="">Select type</option>
                      <option value="working-capital">Pre-export Working Capital</option>
                      <option value="invoice-finance">Export Invoice Finance</option>
                      <option value="equipment">Equipment Finance</option>
                      <option value="input-bundle">Input Bundle Finance</option>
                    </select>
                    {errors.type && (
                      <p className={errorCls}>
                        <AlertCircle className="w-3 h-3" /> {errors.type}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>
                      Amount Requested (USD) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        className={`${inputCls} pl-9 ${errors.amount ? 'border-red-300 ring-red-100' : ''}`}
                        placeholder="e.g., 50,000"
                        value={formData.amount}
                        onChange={(e) => update('amount', e.target.value)}
                      />
                    </div>
                    {errors.amount && (
                      <p className={errorCls}>
                        <AlertCircle className="w-3 h-3" /> {errors.amount}
                      </p>
                    )}
                    {formData.amount && !errors.amount && (
                      <p className="text-teal text-xs mt-1 font-medium">{fmtAmt(formData.amount)}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>
                      Preferred Tenor <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`${inputCls} ${errors.tenor ? 'border-red-300 ring-red-100' : ''}`}
                      value={formData.tenor}
                      onChange={(e) => update('tenor', e.target.value)}
                    >
                      <option value="">Select tenor</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="180">180 days</option>
                      <option value="365">12 months</option>
                    </select>
                    {errors.tenor && (
                      <p className={errorCls}>
                        <AlertCircle className="w-3 h-3" /> {errors.tenor}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>Collateral Offered</label>
                    <select
                      className={inputCls}
                      value={formData.collateral}
                      onChange={(e) => update('collateral', e.target.value)}
                    >
                      <option value="">None / Not applicable</option>
                      <option value="land">Land title</option>
                      <option value="equipment">Farm equipment</option>
                      <option value="inventory">Crop inventory</option>
                      <option value="invoice">Confirmed purchase order</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Purpose / Use of Funds <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-none ${errors.purpose ? 'border-red-300 ring-red-100' : ''}`}
                    placeholder="Describe how the funds will be used..."
                    value={formData.purpose}
                    onChange={(e) => update('purpose', e.target.value)}
                  />
                  {errors.purpose && (
                    <p className={errorCls}>
                      <AlertCircle className="w-3 h-3" /> {errors.purpose}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Crop Details */}
            {step === 2 && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <Wheat className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-lg">Crop &amp; Farm Details</h3>
                    <p className="text-gray-500 text-xs">Tell us about your crop and farm size</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelCls}>
                      Primary Crop <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`${inputCls} ${errors.cropType ? 'border-red-300 ring-red-100' : ''}`}
                      value={formData.cropType}
                      onChange={(e) => update('cropType', e.target.value)}
                    >
                      <option value="">Select crop</option>
                      <option value="blueberries">Blueberries</option>
                      <option value="cassava">Cassava</option>
                      <option value="sesame">Sesame</option>
                      <option value="maize">Maize</option>
                      <option value="sorghum">Sorghum</option>
                      <option value="groundnuts">Groundnuts</option>
                      <option value="macadamia">Macadamia</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.cropType && (
                      <p className={errorCls}>
                        <AlertCircle className="w-3 h-3" /> {errors.cropType}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelCls}>
                      Farm Size (hectares) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`${inputCls} ${errors.hectares ? 'border-red-300 ring-red-100' : ''}`}
                      placeholder="e.g., 25"
                      value={formData.hectares}
                      onChange={(e) => update('hectares', e.target.value)}
                    />
                    {errors.hectares && (
                      <p className={errorCls}>
                        <AlertCircle className="w-3 h-3" /> {errors.hectares}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Expected Yield (tons)</label>
                  <input
                    type="text"
                    className={inputCls}
                    placeholder="e.g., 12.5"
                    value={formData.yieldEstimate}
                    onChange={(e) => update('yieldEstimate', e.target.value)}
                  />
                  <p className="text-gray-400 text-xs mt-1">Helps our team assess the application faster</p>
                </div>

                {/* AI Tip */}
                <div className="bg-teal-light/50 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-teal shrink-0 mt-0.5" />
                  <div>
                    <p className="text-navy text-sm font-medium">AI Insight</p>
                    <p className="text-gray-600 text-xs mt-0.5">
                      {formData.cropType === 'blueberries'
                        ? 'Blueberry financing typically gets approved faster with confirmed EU buyer contracts. Average yield: 4-8 tons/ha.'
                        : formData.cropType === 'cassava'
                        ? 'Cassava loans have strong approval rates. Consider value-addition (chipping/drying) for higher loan amounts.'
                        : 'Select a crop above to get personalized financing insights from Mkulima AI.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Buyer Info */}
            {step === 3 && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-lg">Buyer &amp; Offtake Details</h3>
                    <p className="text-gray-500 text-xs">Confirmed buyers strengthen your application</p>
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Do you have a confirmed buyer/contract?</label>
                  <div className="flex gap-4">
                    {['yes', 'no', 'pending'].map((val) => (
                      <label
                        key={val}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                          formData.hasContract === val
                            ? 'border-teal bg-teal/5 text-teal font-semibold'
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasContract"
                          value={val}
                          checked={formData.hasContract === val}
                          onChange={(e) => update('hasContract', e.target.value)}
                          className="sr-only"
                        />
                        {val === 'yes' ? 'Yes' : val === 'no' ? 'No' : 'In Progress'}
                      </label>
                    ))}
                  </div>
                </div>

                {(formData.hasContract === 'yes' || formData.hasContract === 'pending') && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className={labelCls}>Buyer Name</label>
                        <input
                          type="text"
                          className={`${inputCls} ${errors.buyerName ? 'border-red-300' : ''}`}
                          placeholder="e.g., Berry Fresh UK"
                          value={formData.buyerName}
                          onChange={(e) => update('buyerName', e.target.value)}
                        />
                        {errors.buyerName && (
                          <p className={errorCls}>
                            <AlertCircle className="w-3 h-3" /> {errors.buyerName}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className={labelCls}>Buyer Country</label>
                        <input
                          type="text"
                          className={inputCls}
                          placeholder="e.g., United Kingdom"
                          value={formData.buyerCountry}
                          onChange={(e) => update('buyerCountry', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Contract Value (USD)</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          className={`${inputCls} pl-9`}
                          placeholder="e.g., 120,000"
                          value={formData.contractValue}
                          onChange={(e) => update('contractValue', e.target.value)}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div>
                  <label className={labelCls}>Additional Notes</label>
                  <textarea
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Anything else we should know..."
                    value={formData.notes}
                    onChange={(e) => update('notes', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Documents */}
            {step === 4 && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Upload className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-lg">Supporting Documents</h3>
                    <p className="text-gray-500 text-xs">Upload documents to speed up your application</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'ID / Passport', required: true, desc: 'Government-issued identification' },
                    { label: 'Bank Statement (3 months)', required: true, desc: 'Most recent 3 months' },
                    { label: 'Farm Registration / Land Title', required: false, desc: 'Proof of farm ownership or lease' },
                    { label: 'Purchase Order / Contract', required: false, desc: 'Confirmed buyer contract if available' },
                  ].map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 border border-dashed border-gray-200 rounded-xl hover:border-teal/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-navy">
                            {doc.label}
                            {doc.required && <span className="text-red-500 ml-1">*</span>}
                          </p>
                          <p className="text-xs text-gray-400">{doc.desc}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-teal font-medium hover:text-teal-dark transition-colors px-4 py-2 rounded-lg hover:bg-teal/5"
                      >
                        Upload
                      </button>
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-blue-700 text-xs">
                    Documents can also be uploaded after submission from your Documents page. Required documents must be submitted before your application can be processed.
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {step === 5 && (
              <div className="bg-white rounded-xl p-8 border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-teal/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-teal" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy text-lg">Review Your Application</h3>
                    <p className="text-gray-500 text-xs">Please confirm all details before submitting</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { label: 'Financing Type', value: formData.type.replace(/-/g, ' ') || '—', icon: Banknote },
                    { label: 'Amount Requested', value: fmtAmt(formData.amount) || '—', icon: DollarSign },
                    { label: 'Tenor', value: formData.tenor ? `${formData.tenor} days` : '—', icon: Clock },
                    { label: 'Primary Crop', value: formData.cropType || '—', icon: Wheat },
                    { label: 'Farm Size', value: formData.hectares ? `${formData.hectares} hectares` : '—', icon: Wheat },
                    { label: 'Buyer', value: formData.buyerName || 'Not specified', icon: Building2 },
                    { label: 'Buyer Country', value: formData.buyerCountry || 'Not specified', icon: Building2 },
                    { label: 'Collateral', value: formData.collateral || 'None', icon: ShieldCheck },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0"
                      >
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Icon className="w-4 h-4" />
                          {item.label}
                        </div>
                        <span className="text-navy font-medium text-sm capitalize">{item.value}</span>
                      </div>
                    );
                  })}
                </div>

                {formData.purpose && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Purpose</p>
                    <p className="text-navy text-sm bg-cream rounded-lg p-3">{formData.purpose}</p>
                  </div>
                )}

                <div className="bg-amber-50 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-amber-700 text-xs">
                    By submitting this application, you confirm that all information provided is accurate. False information may result in rejection or membership termination.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="max-w-3xl flex items-center justify-between mt-6">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-navy hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            Step {step} of {STEPS.length}
          </span>
          {submitError && (
            <p className="text-red-500 text-sm flex items-center gap-1.5 mr-2">
              <AlertCircle className="w-4 h-4" />
              {submitError}
            </p>
          )}
          {step < 5 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-teal hover:bg-teal-dark text-white px-10 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-[#8CB89C]/25 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
