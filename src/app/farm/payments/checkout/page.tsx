'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
  Phone,
  Globe,
  Banknote,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { usePaymentGateways, type PaymentGatewayRow } from '@/lib/supabase/use-payments';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
type PaymentStep = 'method' | 'details' | 'confirm' | 'processing' | 'result';

interface PaymentFormData {
  method: 'card' | 'mobile-money' | 'bank-transfer' | null;
  provider: string | null;
  phoneNumber: string;
  amount: number;
  currency: string;
  purpose: string;
  description: string;
}

/* ------------------------------------------------------------------ */
/* Country config (provider display names + icons)                     */
/* ------------------------------------------------------------------ */
const PROVIDER_INFO: Record<string, { label: string; icon: string; color: string }> = {
  stripe: { label: 'Card Payment', icon: '💳', color: 'bg-indigo-50 border-indigo-200' },
  mpesa: { label: 'M-Pesa', icon: '📱', color: 'bg-green-50 border-green-200' },
  ecocash: { label: 'EcoCash', icon: '📱', color: 'bg-blue-50 border-blue-200' },
  'orange-money': { label: 'Orange Money', icon: '📱', color: 'bg-orange-50 border-orange-200' },
  'mtn-momo': { label: 'MTN Mobile Money', icon: '📱', color: 'bg-yellow-50 border-yellow-200' },
  'airtel-money': { label: 'Airtel Money', icon: '📱', color: 'bg-red-50 border-red-200' },
  'bank-transfer': { label: 'Bank Transfer', icon: '🏦', color: 'bg-gray-50 border-gray-200' },
};

const METHOD_ICONS = {
  card: CreditCard,
  'mobile-money': Smartphone,
  'bank-transfer': Building2,
};

const COUNTRY_CURRENCIES: Record<string, string> = {
  BW: 'BWP', ZW: 'USD', TZ: 'TZS', KE: 'KES', ZA: 'ZAR',
  NG: 'NGN', ZM: 'ZMW', MZ: 'MZN', SL: 'SLE',
};

const COUNTRY_NAMES: Record<string, string> = {
  BW: 'Botswana', ZW: 'Zimbabwe', TZ: 'Tanzania', KE: 'Kenya', ZA: 'South Africa',
  NG: 'Nigeria', ZM: 'Zambia', MZ: 'Mozambique', SL: 'Sierra Leone',
};

/* ------------------------------------------------------------------ */
/* Animation                                                           */
/* ------------------------------------------------------------------ */
const stepVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  exit: { opacity: 0, x: -20 },
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<PaymentStep>('method');
  const [selectedCountry, setSelectedCountry] = useState('BW');
  const [form, setForm] = useState<PaymentFormData>({
    method: null,
    provider: null,
    phoneNumber: '',
    amount: 0,
    currency: 'USD',
    purpose: 'other',
    description: '',
  });
  const [result, setResult] = useState<{ success: boolean; message: string; reference?: string } | null>(null);

  // Pre-fill from URL params
  useEffect(() => {
    const amount = searchParams.get('amount');
    const purpose = searchParams.get('purpose');
    const description = searchParams.get('description');
    const country = searchParams.get('country');
    if (amount) setForm((f) => ({ ...f, amount: parseFloat(amount) }));
    if (purpose) setForm((f) => ({ ...f, purpose }));
    if (description) setForm((f) => ({ ...f, description }));
    if (country) setSelectedCountry(country);
  }, [searchParams]);

  // Auto-set currency from country
  useEffect(() => {
    setForm((f) => ({ ...f, currency: COUNTRY_CURRENCIES[selectedCountry] || 'USD' }));
  }, [selectedCountry]);

  const { gateways, loading: gatewaysLoading } = usePaymentGateways(selectedCountry);

  // Group gateways by method type
  const methodGroups = useMemo(() => {
    const groups: Record<string, PaymentGatewayRow[]> = {
      'mobile-money': [],
      card: [],
      'bank-transfer': [],
    };
    gateways.forEach((gw) => {
      if (gw.provider === 'stripe') groups.card.push(gw);
      else if (gw.provider === 'bank_transfer') groups['bank-transfer'].push(gw);
      else groups['mobile-money'].push(gw);
    });
    return groups;
  }, [gateways]);

  const handleSelectMethod = (method: 'card' | 'mobile-money' | 'bank-transfer') => {
    setForm((f) => ({ ...f, method }));
    // If only one provider for this method, auto-select it
    const providers = methodGroups[method];
    if (providers.length === 1) {
      setForm((f) => ({ ...f, method, provider: providers[0].provider }));
    }
  };

  const handleSelectProvider = (provider: string) => {
    setForm((f) => ({ ...f, provider }));
  };

  const handleSubmitPayment = async () => {
    if (!form.method || !form.provider || form.amount <= 0) return;

    setStep('processing');

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: form.amount,
          currency: form.currency,
          method: form.method,
          provider: form.provider.replace('_', '-'),
          purpose: form.purpose.replace('-', '_'),
          description: form.description,
          phoneNumber: form.phoneNumber || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setResult({ success: false, message: data.error || 'Payment failed' });
        setStep('result');
        return;
      }

      // Handle redirect (Stripe)
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }

      setResult({
        success: true,
        message: data.message || 'Payment initiated successfully. Please check your phone to complete the transaction.',
        reference: data.payment?.id,
      });
      setStep('result');
    } catch {
      setResult({ success: false, message: 'Network error. Please try again.' });
      setStep('result');
    }
  };

  const canProceedToDetails = form.method !== null && form.provider !== null;
  const canProceedToConfirm = form.amount > 0 && (form.method !== 'mobile-money' || form.phoneNumber.length >= 8);

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 max-w-2xl mx-auto space-y-6">
      {/* Back link */}
      <Link
        href="/farm/payments"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-navy transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Payments
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-navy">Make a Payment</h1>
        <p className="text-sm text-gray-500 mt-1">
          Secure payments via mobile money, card, or bank transfer
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {(['method', 'details', 'confirm'] as const).map((s, i) => {
          const labels = ['Payment Method', 'Details', 'Confirm'];
          const stepIndex = ['method', 'details', 'confirm'].indexOf(step);
          const isActive = step === s;
          const isDone = stepIndex > i || step === 'processing' || step === 'result';

          return (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isDone ? 'bg-teal text-white' : isActive ? 'bg-navy text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-navy' : 'text-gray-400'}`}>
                {labels[i]}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 ${isDone ? 'bg-teal' : 'bg-gray-100'}`} />}
            </div>
          );
        })}
      </div>

      {/* Country Selector */}
      {step === 'method' && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <label className="text-xs font-semibold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Your Country
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full mt-1 p-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
          >
            {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* ── Step 1: Payment Method ── */}
        {step === 'method' && (
          <motion.div key="method" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            {gatewaysLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-teal" />
              </div>
            ) : (
              <>
                {/* Method selection */}
                <div className="space-y-3">
                  {(Object.entries(methodGroups) as [string, PaymentGatewayRow[]][]).map(([method, providers]) => {
                    if (providers.length === 0) return null;
                    const Icon = METHOD_ICONS[method as keyof typeof METHOD_ICONS] || CreditCard;
                    const isSelected = form.method === method;

                    return (
                      <div key={method}>
                        <button
                          onClick={() => handleSelectMethod(method as 'card' | 'mobile-money' | 'bank-transfer')}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all min-h-[56px] flex items-center gap-3 ${
                            isSelected
                              ? 'border-teal bg-teal/5 shadow-sm'
                              : 'border-gray-100 bg-white hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-teal text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-navy capitalize">
                              {method.replace('-', ' ')}
                            </p>
                            <p className="text-xs text-gray-400">
                              {providers.map((p) => PROVIDER_INFO[p.provider.replace('_', '-')]?.label || p.name).join(', ')}
                            </p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-teal" />}
                        </button>

                        {/* Provider sub-selection for mobile money */}
                        {isSelected && method === 'mobile-money' && providers.length > 1 && (
                          <div className="mt-2 ml-13 space-y-2 pl-4 border-l-2 border-teal/20">
                            {providers.map((gw) => {
                              const providerKey = gw.provider.replace('_', '-');
                              const info = PROVIDER_INFO[providerKey] || { label: gw.name, icon: '📱', color: 'bg-gray-50' };
                              const isProviderSelected = form.provider === gw.provider;

                              return (
                                <button
                                  key={gw.id}
                                  onClick={() => handleSelectProvider(gw.provider)}
                                  className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 text-sm ${
                                    isProviderSelected
                                      ? `${info.color} border-teal shadow-sm`
                                      : 'bg-white border-gray-100 hover:border-gray-200'
                                  }`}
                                >
                                  <span className="text-lg">{info.icon}</span>
                                  <span className="font-medium text-navy">{info.label}</span>
                                  {isProviderSelected && <CheckCircle2 className="w-4 h-4 text-teal ml-auto" />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* No gateways */}
                {gateways.length === 0 && !gatewaysLoading && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No payment methods available for {COUNTRY_NAMES[selectedCountry]}</p>
                  </div>
                )}

                <button
                  onClick={() => setStep('details')}
                  disabled={!canProceedToDetails}
                  className="w-full bg-teal hover:bg-teal-dark disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-h-[48px]"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* ── Step 2: Payment Details ── */}
        {step === 'details' && (
          <motion.div key="details" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
              {/* Amount */}
              <div>
                <label className="text-xs font-semibold text-navy uppercase tracking-wider mb-1.5 block">
                  Amount ({form.currency})
                </label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount || ''}
                    onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
              </div>

              {/* Phone number (mobile money) */}
              {form.method === 'mobile-money' && (
                <div>
                  <label className="text-xs font-semibold text-navy uppercase tracking-wider mb-1.5 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phoneNumber}
                      onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                      placeholder="+267 71 234 567"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Enter the mobile money registered number</p>
                </div>
              )}

              {/* Purpose */}
              <div>
                <label className="text-xs font-semibold text-navy uppercase tracking-wider mb-1.5 block">
                  Payment Purpose
                </label>
                <select
                  value={form.purpose}
                  onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                >
                  <option value="membership_fee">Membership Fee</option>
                  <option value="loan_repayment">Loan Repayment</option>
                  <option value="input_purchase">Input Purchase</option>
                  <option value="insurance_premium">Insurance Premium</option>
                  <option value="equipment_rental">Equipment Rental</option>
                  <option value="subscription">Subscription</option>
                  <option value="marketplace_purchase">Marketplace Purchase</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-navy uppercase tracking-wider mb-1.5 block">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="What is this payment for?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('method')}
                className="px-5 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors min-h-[48px]"
              >
                Back
              </button>
              <button
                onClick={() => setStep('confirm')}
                disabled={!canProceedToConfirm}
                className="flex-1 bg-teal hover:bg-teal-dark disabled:bg-gray-200 disabled:text-gray-400 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                Review Payment
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: Confirmation ── */}
        {step === 'confirm' && (
          <motion.div key="confirm" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h3 className="font-bold text-navy text-base">Payment Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-navy text-lg">
                    {form.currency} {form.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Method</span>
                  <span className="font-medium text-navy capitalize">{form.method?.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Provider</span>
                  <span className="font-medium text-navy">
                    {PROVIDER_INFO[form.provider?.replace('_', '-') || '']?.label || form.provider}
                  </span>
                </div>
                {form.phoneNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-medium text-navy">{form.phoneNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Purpose</span>
                  <span className="font-medium text-navy capitalize">{form.purpose.replace(/_/g, ' ')}</span>
                </div>
                {form.description && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Description</span>
                    <span className="font-medium text-navy text-right max-w-[60%]">{form.description}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 bg-teal/5 rounded-xl p-4">
              <Shield className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-navy">Secure Payment</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your payment is encrypted and processed securely. You will receive a confirmation once complete.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('details')}
                className="px-5 py-3 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:border-gray-300 transition-colors min-h-[48px]"
              >
                Back
              </button>
              <button
                onClick={handleSubmitPayment}
                className="flex-1 bg-navy hover:bg-navy/90 text-white py-3.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 min-h-[48px]"
              >
                Pay {form.currency} {form.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Processing ── */}
        {step === 'processing' && (
          <motion.div key="processing" variants={stepVariants} initial="initial" animate="animate" exit="exit"
            className="flex flex-col items-center justify-center py-16 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-teal/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal" />
            </div>
            <h3 className="font-bold text-navy text-lg">Processing Payment</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              {form.method === 'mobile-money'
                ? 'Please check your phone and enter your PIN to complete the payment.'
                : 'Please wait while we process your payment...'}
            </p>
          </motion.div>
        )}

        {/* ── Step 5: Result ── */}
        {step === 'result' && result && (
          <motion.div key="result" variants={stepVariants} initial="initial" animate="animate" exit="exit"
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
              result.success ? 'bg-teal/10' : 'bg-red-50'
            }`}>
              {result.success ? (
                <CheckCircle2 className="w-8 h-8 text-teal" />
              ) : (
                <AlertCircle className="w-8 h-8 text-red-500" />
              )}
            </div>
            <h3 className={`font-bold text-lg ${result.success ? 'text-navy' : 'text-red-600'}`}>
              {result.success ? 'Payment Initiated' : 'Payment Failed'}
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">{result.message}</p>
            {result.reference && (
              <p className="text-xs text-gray-400">Reference: {result.reference}</p>
            )}

            <div className="flex gap-3 w-full max-w-sm pt-4">
              {!result.success && (
                <button
                  onClick={() => { setStep('confirm'); setResult(null); }}
                  className="flex-1 bg-teal hover:bg-teal-dark text-white py-3 rounded-xl text-sm font-semibold transition-colors min-h-[48px]"
                >
                  Try Again
                </button>
              )}
              <Link
                href="/farm/payments"
                className="flex-1 bg-navy hover:bg-navy/90 text-white py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center min-h-[48px]"
              >
                View Payments
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
