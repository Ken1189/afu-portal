'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  Sprout,
  TrendingUp,
  Calendar,
  Star,
  Send,
  Info,
  X,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useLoans } from '@/lib/supabase/use-loans';

/* ------------------------------------------------------------------ */
/* Interest rates by loan type (used in application form)              */
/* ------------------------------------------------------------------ */
const INTEREST_RATES: Record<string, number> = {
  workingCapital: 14.0,
  inputFinance: 8.5,
  equipmentLease: 12.0,
  tradeFinance: 10.0,
};

const TERM_MONTHS: Record<string, number> = {
  workingCapital: 12,
  inputFinance: 6,
  equipmentLease: 24,
  tradeFinance: 3,
};

const loanTypeIcons: Record<string, typeof Wallet> = {
  workingCapital: DollarSign,
  inputFinance: Sprout,
  equipmentLease: FileText,
  tradeFinance: TrendingUp,
};

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  approved: 'bg-gold/20 text-gold',
};

/* ------------------------------------------------------------------ */
/* Application Form Steps                                              */
/* ------------------------------------------------------------------ */
const loanTypeKeys = ['workingCapital', 'inputFinance', 'equipmentLease', 'tradeFinance'] as const;
const amountOptions = [500, 1000, 2500, 5000, 10000, 25000];
const seasonOptions = ['2024/2025 Rain', '2025 Dry', '2025/2026 Rain'];

export default function FinancingPage() {
  const { t } = useLanguage();
  const tf = t.financing;
  const { loans, loading, stats, applyForLoan } = useLoans();

  const [tab, setTab] = useState<'loans' | 'apply'>('loans');
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Application form state
  const [formData, setFormData] = useState({
    loanType: '' as string,
    amount: 0,
    season: '',
    farmSize: '',
    experience: '',
    notes: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleApply = () => {
    setTab('apply');
    setStep(0);
    setSubmitted(false);
    setSubmitError(null);
    setFormData({ loanType: '', amount: 0, season: '', farmSize: '', experience: '', notes: '' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await applyForLoan({
      loan_type: formData.loanType,
      amount: formData.amount,
      interest_rate: INTEREST_RATES[formData.loanType] || 10.0,
      term_months: TERM_MONTHS[formData.loanType] || 12,
      purpose: `${formData.season} season — Farm: ${formData.farmSize}ha, ${formData.experience} years experience`,
      collateral: formData.notes || undefined,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message || "Failed to submit application. Please try again.");
    } else {
      setSubmitted(true);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return formData.loanType !== '';
      case 1: return formData.amount > 0;
      case 2: return formData.season !== '' && formData.farmSize !== '';
      default: return true;
    }
  };

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy">{tf.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{tf.subtitle}</p>
        </div>
        {tab === 'loans' && (
          <button
            onClick={handleApply}
            className="bg-teal hover:bg-teal-dark active:bg-teal-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <Wallet className="w-4 h-4" />
            {tf.applyNow}
          </button>
        )}
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
        <button
          onClick={() => setTab('loans')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'loans' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
          }`}
        >
          {tf.myLoans}
        </button>
        <button
          onClick={handleApply}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            tab === 'apply' ? 'bg-white text-navy shadow-sm' : 'text-gray-500'
          }`}
        >
          {tf.applyNow}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {tab === 'loans' ? (
          <motion.div
            key="loans"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Loan Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: tf.active, value: String(stats.active), color: 'bg-green-50 text-green-600', icon: CheckCircle2 },
                { label: tf.completed, value: String(stats.completed), color: 'bg-blue-50 text-blue-600', icon: Star },
                { label: tf.outstanding, value: `P ${(stats.totalAmount - stats.totalRepaid).toLocaleString()}`, color: 'bg-gold/10 text-gold', icon: Clock },
                { label: tf.repaid, value: `P ${stats.totalRepaid.toLocaleString()}`, color: 'bg-teal/10 text-teal', icon: TrendingUp },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="bg-white rounded-xl p-3 sm:p-4 border border-gray-100">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-lg sm:text-xl font-bold text-navy">{stat.value}</p>
                    <p className="text-[11px] sm:text-xs text-gray-500">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Loan List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading your loans...</span>
              </div>
            ) : loans.length > 0 ? (
              <div className="space-y-3">
                {loans.map((loan) => {
                  const Icon = loanTypeIcons[loan.loan_type] || Wallet;
                  const repaidPercent = loan.amount > 0 ? Math.round((loan.amount_repaid / loan.amount) * 100) : 0;
                  const outstanding = loan.amount - loan.amount_repaid;
                  return (
                    <div key={loan.id} className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-navy text-sm">
                              {(tf.loanTypes as Record<string, string>)[loan.loan_type] || loan.loan_type}
                            </p>
                            <p className="text-xs text-gray-400">{loan.loan_number || loan.id.slice(0, 12)}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                          {(tf as unknown as Record<string, string>)[loan.status] || loan.status}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{tf.repaid}</span>
                          <span className="font-medium text-navy">{repaidPercent}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              repaidPercent >= 100 ? 'bg-blue-500' : 'bg-teal'
                            }`}
                            style={{ width: `${Math.min(repaidPercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Loan Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-[11px] text-gray-400">{tf.loanAmount}</p>
                          <p className="font-semibold text-navy">P {Number(loan.amount).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400">{tf.outstanding}</p>
                          <p className="font-semibold text-navy">P {outstanding.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400">{tf.interestRate}</p>
                          <p className="font-semibold text-navy">{loan.interest_rate}%</p>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400">{tf.nextPayment}</p>
                          <p className="font-semibold text-navy">
                            {loan.due_date ? new Date(loan.due_date).toLocaleDateString() : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="font-semibold text-navy text-lg mb-2">{tf.noLoans}</h3>
                <p className="text-sm text-gray-500 mb-4">{tf.noLoansDesc}</p>
                <button
                  onClick={handleApply}
                  className="bg-teal text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  {tf.applyNow}
                </button>
              </div>
            )}

            {/* AFU Benefits */}
            <div className="bg-gradient-to-br from-navy to-[#8CB89C] rounded-xl p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">{tf.benefits}</h3>
                  <ul className="text-sm opacity-90 space-y-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {tf.benefit1}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {tf.benefit2}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      {tf.benefit3}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="apply"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {submitted ? (
              /* ── Success Screen ── */
              <div className="bg-white rounded-xl border border-gray-100 p-5 sm:p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' as const, stiffness: 200, damping: 15 }}
                  className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-navy mb-2">{tf.applicationSent}</h3>
                <p className="text-sm text-gray-500 mb-1">{tf.applicationSentDesc}</p>
                <p className="text-sm text-gray-400 mb-6">{tf.referenceNumber}: AFU-2024-{Math.floor(Math.random() * 9000 + 1000)}</p>
                <div className="bg-teal/5 rounded-xl p-4 mb-6 text-left">
                  <h4 className="text-sm font-semibold text-navy mb-2">{tf.whatHappensNext}</h4>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                      {tf.step1}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                      {tf.step2}
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                      {tf.step3}
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setTab('loans')}
                  className="bg-teal text-white px-6 py-2.5 rounded-xl text-sm font-semibold"
                >
                  {tf.myLoans}
                </button>
              </div>
            ) : (
              /* ── Application Form ── */
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Form Header */}
                <div className="bg-gradient-to-r from-[#8CB89C] to-navy p-5 text-white">
                  <h2 className="font-bold text-lg">{tf.applyTitle}</h2>
                  <p className="text-sm opacity-80 mt-1">{tf.applySubtitle}</p>
                  {/* Step indicator */}
                  <div className="flex gap-2 mt-4">
                    {[0, 1, 2].map((s) => (
                      <div
                        key={s}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          s <= step ? 'bg-white' : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  <AnimatePresence mode="wait">
                    {step === 0 && (
                      <motion.div
                        key="step0"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="font-semibold text-navy">{tf.whatFor}</h3>
                        <div className="grid grid-cols-2 gap-3">
                          {loanTypeKeys.map((key) => {
                            const Icon = loanTypeIcons[key] || Wallet;
                            const selected = formData.loanType === key;
                            return (
                              <button
                                key={key}
                                onClick={() => setFormData({ ...formData, loanType: key })}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  selected
                                    ? 'border-teal bg-teal/5'
                                    : 'border-gray-100 hover:border-gray-200 active:border-gray-300'
                                }`}
                              >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
                                  selected ? 'bg-teal text-white' : 'bg-gray-100 text-gray-500'
                                }`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <p className={`text-sm font-medium ${selected ? 'text-teal' : 'text-navy'}`}>
                                  {tf.loanTypes[key]}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {step === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <h3 className="font-semibold text-navy">{tf.howMuch}</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {amountOptions.map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setFormData({ ...formData, amount: amt })}
                              className={`py-3 min-h-[44px] rounded-xl text-sm font-medium border-2 transition-all ${
                                formData.amount === amt
                                  ? 'border-teal bg-teal/5 text-teal'
                                  : 'border-gray-100 text-gray-600 hover:border-gray-200 active:border-gray-300'
                              }`}
                            >
                              P {amt.toLocaleString()}
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <p className="text-xs text-blue-600">{tf.repaymentNote}</p>
                        </div>
                      </motion.div>
                    )}

                    {step === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-sm font-medium text-navy block mb-2">{tf.cropSeason}</label>
                          <div className="flex flex-col gap-2">
                            {seasonOptions.map((s) => (
                              <button
                                key={s}
                                onClick={() => setFormData({ ...formData, season: s })}
                                className={`py-3 px-4 rounded-xl text-sm font-medium border-2 text-left transition-all flex items-center gap-2 ${
                                  formData.season === s
                                    ? 'border-teal bg-teal/5 text-teal'
                                    : 'border-gray-100 text-gray-600'
                                }`}
                              >
                                <Calendar className="w-4 h-4" />
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-navy block mb-2">{tf.farmSize}</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={formData.farmSize}
                            onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                            placeholder="e.g. 5.3"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-navy block mb-2">{tf.yearsExperience}</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            placeholder="e.g. 5"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Navigation buttons */}
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                    {step > 0 && (
                      <button
                        onClick={() => setStep(step - 1)}
                        className="px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        {t.common.back}
                      </button>
                    )}
                    {step < 2 ? (
                      <button
                        onClick={() => canProceed() && setStep(step + 1)}
                        disabled={!canProceed()}
                        className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          canProceed()
                            ? 'bg-teal text-white hover:bg-teal-dark active:bg-teal-dark'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {t.common.next}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmit}
                        disabled={!canProceed() || submitting}
                        className={`flex-1 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                          canProceed() && !submitting
                            ? 'bg-teal text-white hover:bg-teal-dark active:bg-teal-dark'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            {t.common.submit}
                          </>
                        )}
                      </button>
                    )}
                    {submitError && (
                      <p className="text-xs text-red-500 mt-2 text-center">{submitError}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
