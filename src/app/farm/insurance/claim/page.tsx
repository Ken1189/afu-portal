'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  Camera,
  Upload,
  Image as ImageIcon,
  Info,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lightbulb,
  X,
} from 'lucide-react';
import {
  insurancePolicies,
  type InsuranceType,
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

const stepTransition = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 28,
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

const incidentTypes = [
  { value: 'drought', label: 'Drought / Water Shortage' },
  { value: 'flood', label: 'Flood / Waterlogging' },
  { value: 'pest', label: 'Pest Infestation' },
  { value: 'disease', label: 'Crop / Livestock Disease' },
  { value: 'theft', label: 'Theft' },
  { value: 'fire', label: 'Fire / Lightning' },
  { value: 'hail', label: 'Hail Damage' },
  { value: 'predator', label: 'Predator Attack' },
  { value: 'equipment-failure', label: 'Equipment Breakdown' },
  { value: 'other', label: 'Other' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FileClaimPage() {
  const { t } = useLanguage();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Form state
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [incidentDate, setIncidentDate] = useState('');
  const [incidentType, setIncidentType] = useState('');
  const [description, setDescription] = useState('');
  const [photoCount, setPhotoCount] = useState(0);

  // Active policies only
  const activePolicies = useMemo(
    () => insurancePolicies.filter((p) => p.status === 'active'),
    []
  );

  const selectedPolicy = activePolicies.find((p) => p.id === selectedPolicyId);

  const steps = [
    { label: t.insurance.selectPolicy, icon: Shield },
    { label: t.insurance.incidentDate, icon: Calendar },
    { label: t.insurance.uploadPhotos, icon: Camera },
    { label: t.insurance.submitClaim, icon: FileText },
  ];

  const canGoNext = (): boolean => {
    switch (currentStep) {
      case 0:
        return !!selectedPolicyId;
      case 1:
        return !!incidentDate && !!incidentType && description.length > 10;
      case 2:
        return true; // Photos are optional
      case 3:
        return true;
      default:
        return false;
    }
  };

  const goNext = () => {
    if (currentStep < 3) {
      setCurrentStep((s) => s + 1);
    } else {
      // Submit
      setSubmitted(true);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  // Generate fake claim reference
  const claimRef = useMemo(
    () => `CLM-${String(Math.floor(Math.random() * 900) + 100)}`,
    []
  );

  // ─── SUCCESS STATE ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="py-4 px-4"
      >
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-white border border-gray-100 p-6 text-center"
        >
          {/* Success icon */}
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-500" />
          </div>

          <h2 className="text-xl font-bold text-navy mb-1">Claim Submitted!</h2>
          <p className="text-sm text-gray-500 mb-4">
            Your claim has been received and is being processed.
          </p>

          {/* Reference */}
          <div className="rounded-xl bg-teal/5 border border-teal/20 p-3 mb-5">
            <p className="text-[10px] text-gray-400 uppercase tracking-wide">
              Claim Reference Number
            </p>
            <p className="text-lg font-bold text-teal mt-0.5">{claimRef}</p>
          </div>

          {/* What happens next timeline */}
          <div className="text-left">
            <h3 className="text-sm font-bold text-navy mb-3">What Happens Next</h3>
            <div className="space-y-0">
              {[
                {
                  step: '1',
                  title: 'Claim Received',
                  desc: 'Our team will review your claim within 24-48 hours.',
                  active: true,
                },
                {
                  step: '2',
                  title: 'Assessment',
                  desc: 'A claims officer may contact you for additional details or schedule a field visit.',
                  active: false,
                },
                {
                  step: '3',
                  title: 'Decision',
                  desc: 'You will receive a decision notification via SMS and in-app.',
                  active: false,
                },
                {
                  step: '4',
                  title: 'Payout',
                  desc: 'If approved, payment is sent to your registered mobile wallet within 7 days.',
                  active: false,
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        item.active
                          ? 'bg-teal text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {item.step}
                    </div>
                    {idx < 3 && (
                      <div className="w-0.5 h-8 bg-gray-100 my-1" />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-4 flex-1">
                    <p className="text-sm font-semibold text-navy">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4">
            <Link
              href="/farm/insurance"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal text-white text-sm font-medium active:bg-teal-dark transition-colors min-h-[44px]"
            >
              <ShieldCheck size={16} />
              Back to Insurance
            </Link>
            <Link
              href="/farm/insurance/policies"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium active:bg-gray-100 transition-colors min-h-[44px]"
            >
              {t.insurance.myPolicies}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  // ─── WIZARD ──────────────────────────────────────────────────────────
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
        <div className="flex items-center gap-3">
          <Link
            href="/farm/insurance"
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 text-navy active:bg-gray-100 transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-navy">{t.insurance.fileClaim}</h2>
            <p className="text-xs text-gray-400">Step {currentStep + 1} of 4</p>
          </div>
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* PROGRESS INDICATOR                                                */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4">
        <div className="flex items-center gap-1">
          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;

            return (
              <div key={idx} className="flex items-center flex-1">
                {/* Step circle */}
                <button
                  onClick={() => {
                    if (isCompleted) goToStep(idx);
                  }}
                  disabled={!isCompleted}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? 'bg-teal text-white cursor-pointer'
                      : isCurrent
                        ? 'bg-teal/15 text-teal border-2 border-teal'
                        : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <StepIcon size={14} />
                  )}
                </button>
                {/* Connector line */}
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 rounded-full transition-colors ${
                      isCompleted ? 'bg-teal' : 'bg-gray-100'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
        {/* Step labels (below) */}
        <div className="flex mt-1.5">
          {steps.map((step, idx) => (
            <div key={idx} className="flex-1 text-center">
              <p
                className={`text-[10px] leading-tight ${
                  idx === currentStep
                    ? 'text-teal font-semibold'
                    : idx < currentStep
                      ? 'text-teal/60 font-medium'
                      : 'text-gray-300'
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ================================================================= */}
      {/* STEP CONTENT                                                      */}
      {/* ================================================================= */}
      <AnimatePresence mode="wait">
        {/* ── STEP 1: Select Policy ─────────────────────────────────── */}
        {currentStep === 0 && (
          <motion.section
            key="step-0"
            {...stepTransition}
            className="px-4 space-y-3"
          >
            <div className="rounded-xl bg-teal/5 border border-teal/15 p-3 flex items-start gap-2">
              <Info size={14} className="text-teal shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Select an active policy to file your claim against. Only policies with active status are eligible for claims.
              </p>
            </div>

            <div className="space-y-2.5">
              {activePolicies.map((policy) => {
                const isSelected = selectedPolicyId === policy.id;
                return (
                  <button
                    key={policy.id}
                    onClick={() => setSelectedPolicyId(policy.id)}
                    className={`w-full rounded-2xl p-4 text-left transition-all min-h-[44px] ${
                      isSelected
                        ? 'bg-teal/5 border-2 border-teal shadow-sm'
                        : 'bg-white border border-gray-100 active:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isSelected ? 'bg-teal/10' : 'bg-gray-50'
                        }`}
                      >
                        {typeIcons[policy.type]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-navy">{policy.productName}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{policy.id}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-gray-500">
                            {t.insurance.coverage}: <b className="text-green-600">{formatCurrency(policy.coverageAmount)}</b>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {policy.coveredItems.map((item, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Checkmark */}
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'bg-teal border-teal'
                            : 'border-gray-200'
                        }`}
                      >
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.section>
        )}

        {/* ── STEP 2: Incident Details ──────────────────────────────── */}
        {currentStep === 1 && (
          <motion.section
            key="step-1"
            {...stepTransition}
            className="px-4 space-y-4"
          >
            {/* Selected policy summary */}
            {selectedPolicy && (
              <div className="rounded-xl bg-gray-50 p-3 flex items-center gap-3">
                <span className="text-xl">{typeIcons[selectedPolicy.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-navy truncate">
                    {selectedPolicy.productName}
                  </p>
                  <p className="text-[10px] text-gray-400">{selectedPolicy.id}</p>
                </div>
                <button
                  onClick={() => goToStep(0)}
                  className="text-[10px] text-teal font-medium"
                >
                  Change
                </button>
              </div>
            )}

            {/* Incident Date */}
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {t.insurance.incidentDate} *
              </label>
              <div className="relative">
                <Calendar
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300"
                />
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all min-h-[44px]"
                />
              </div>
            </div>

            {/* Incident Type */}
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                Incident Type *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all min-h-[44px] appearance-none"
              >
                <option value="" disabled>
                  Select incident type...
                </option>
                {incidentTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-navy mb-1.5">
                {t.insurance.describeIncident} *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what happened in detail. Include the affected area, estimated damage, and any actions taken..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-all resize-none placeholder:text-gray-300"
              />
              <p className="text-[10px] text-gray-300 mt-1 text-right">
                {description.length} characters
                {description.length > 0 && description.length <= 10 && (
                  <span className="text-amber-500 ml-1">(min 10 characters)</span>
                )}
              </p>
            </div>
          </motion.section>
        )}

        {/* ── STEP 3: Upload Evidence ───────────────────────────────── */}
        {currentStep === 2 && (
          <motion.section
            key="step-2"
            {...stepTransition}
            className="px-4 space-y-4"
          >
            {/* Upload Zone */}
            <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-3">
                <Upload size={24} className="text-teal" />
              </div>
              <p className="text-sm font-semibold text-navy mb-1">
                {t.insurance.uploadPhotos}
              </p>
              <p className="text-xs text-gray-400 mb-4">
                Tap to take a photo or upload from gallery
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setPhotoCount((c) => c + 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal text-white text-sm font-medium active:bg-teal-dark transition-colors min-h-[44px]"
                >
                  <Camera size={16} />
                  Take Photo
                </button>
                <button
                  onClick={() => setPhotoCount((c) => c + 1)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium active:bg-gray-100 transition-colors min-h-[44px]"
                >
                  <ImageIcon size={16} />
                  Gallery
                </button>
              </div>
            </div>

            {/* Photo counter */}
            {photoCount > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl bg-green-50 border border-green-200 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <p className="text-sm font-medium text-green-700">
                    {photoCount} photo{photoCount !== 1 ? 's' : ''} added
                  </p>
                </div>
                <button
                  onClick={() => setPhotoCount(0)}
                  className="w-7 h-7 flex items-center justify-center rounded-full active:bg-green-100 transition-colors"
                >
                  <X size={14} className="text-green-500" />
                </button>
              </motion.div>
            )}

            {/* Mock thumbnails */}
            {photoCount > 0 && (
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: photoCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200"
                  >
                    <ImageIcon size={20} className="text-gray-300" />
                  </div>
                ))}
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-amber-600" />
                <p className="text-xs font-semibold text-amber-700">
                  Tips for Good Evidence Photos
                </p>
              </div>
              <ul className="space-y-1.5">
                {[
                  'Take clear, well-lit photos showing the damage',
                  'Include wide shots showing the affected area',
                  'Take close-up photos of specific damage',
                  'Include photos of surrounding healthy areas for comparison',
                  'Add photos of any relevant documents (vet reports, receipts)',
                ].map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-amber-700">
                    <span className="w-1 h-1 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </motion.section>
        )}

        {/* ── STEP 4: Review & Submit ───────────────────────────────── */}
        {currentStep === 3 && (
          <motion.section
            key="step-3"
            {...stepTransition}
            className="px-4 space-y-4"
          >
            <div className="rounded-xl bg-teal/5 border border-teal/15 p-3 flex items-start gap-2">
              <Info size={14} className="text-teal shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Please review all details below before submitting your claim. You can go back to any step to make changes.
              </p>
            </div>

            {/* Review Card: Policy */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  {t.insurance.selectPolicy}
                </h4>
                <button
                  onClick={() => goToStep(0)}
                  className="text-[11px] text-teal font-medium active:underline"
                >
                  Edit
                </button>
              </div>
              {selectedPolicy && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl">
                    {typeIcons[selectedPolicy.type]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">
                      {selectedPolicy.productName}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {selectedPolicy.id} &middot;{' '}
                      {t.insurance.coverage}:{' '}
                      <b className="text-green-600">
                        {formatCurrency(selectedPolicy.coverageAmount)}
                      </b>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Review Card: Incident Details */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Incident Details
                </h4>
                <button
                  onClick={() => goToStep(1)}
                  className="text-[11px] text-teal font-medium active:underline"
                >
                  Edit
                </button>
              </div>
              <div className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] text-gray-400">{t.insurance.incidentDate}</p>
                    <p className="text-xs font-semibold text-navy mt-0.5">
                      {incidentDate ? formatDate(incidentDate) : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400">Incident Type</p>
                    <p className="text-xs font-semibold text-navy mt-0.5 capitalize">
                      {incidentTypes.find((t) => t.value === incidentType)?.label || '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400">{t.insurance.describeIncident}</p>
                  <p className="text-xs text-navy mt-0.5 leading-relaxed">
                    {description || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Review Card: Evidence */}
            <div className="rounded-2xl bg-white border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                  Evidence
                </h4>
                <button
                  onClick={() => goToStep(2)}
                  className="text-[11px] text-teal font-medium active:underline"
                >
                  Edit
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-gray-400" />
                <p className="text-xs text-navy font-medium">
                  {photoCount > 0
                    ? `${photoCount} photo${photoCount !== 1 ? 's' : ''} attached`
                    : 'No photos attached'}
                </p>
              </div>
              {photoCount > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {Array.from({ length: Math.min(photoCount, 5) }).map((_, idx) => (
                    <div
                      key={idx}
                      className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200"
                    >
                      <ImageIcon size={16} className="text-gray-300" />
                    </div>
                  ))}
                  {photoCount > 5 && (
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                      <span className="text-[10px] font-bold text-gray-400">
                        +{photoCount - 5}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                By submitting this claim, I confirm that all information provided is accurate and truthful. Fraudulent claims may result in policy cancellation.
              </p>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ================================================================= */}
      {/* NAVIGATION BUTTONS                                                */}
      {/* ================================================================= */}
      <motion.section variants={itemVariants} className="px-4 pb-4">
        <div className="flex gap-3">
          {/* Back Button */}
          {currentStep > 0 && (
            <button
              onClick={goBack}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-50 text-gray-600 text-sm font-medium active:bg-gray-100 transition-colors min-h-[48px]"
            >
              <ChevronLeft size={16} />
              {t.common.back}
            </button>
          )}

          {/* Next / Submit Button */}
          <button
            onClick={goNext}
            disabled={!canGoNext()}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
              canGoNext()
                ? currentStep === 3
                  ? 'bg-green-600 text-white active:bg-green-700 shadow-sm'
                  : 'bg-teal text-white active:bg-teal-dark shadow-sm'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            {currentStep === 3 ? (
              <>
                <CheckCircle2 size={16} />
                {t.insurance.submitClaim}
              </>
            ) : (
              <>
                {t.common.next}
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </motion.section>
    </motion.div>
  );
}
