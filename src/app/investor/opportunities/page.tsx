'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  DollarSign,
  Clock,
  Target,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Calendar,
  Send,
  X,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';

// ── Types ─────────────────────────────────────────────────────────────────────

type OpportunityType = 'Debt Fund' | 'Equity' | 'Insurance' | 'Debt';
type OpportunityStatus = 'Open' | 'Fully Subscribed';

interface Opportunity {
  id: string;
  name: string;
  type: OpportunityType;
  target: number;
  minInvestment: number;
  targetIRR: string;
  term: string;
  subscribed: number;
  subscribedAmount: number;
  status: OpportunityStatus;
  description: string;
}

interface EOIFormData {
  amount: string;
  entityName: string;
  email: string;
  phone: string;
  notes: string;
}

// ── Data ──────────────────────────────────────────────────────────────────────

const opportunities: Opportunity[] = [
  {
    id: 'afu-debt-fund-ii',
    name: 'AFU Agricultural Debt Fund II',
    type: 'Debt Fund',
    target: 5000000,
    minInvestment: 100000,
    targetIRR: '18-22%',
    term: '3 years',
    subscribed: 62,
    subscribedAmount: 3100000,
    status: 'Open',
    description:
      'Senior secured lending to verified African farmers. Portfolio diversified across 20 countries, 15+ crop types. All loans backed by crop insurance and guaranteed offtake agreements.',
  },
  {
    id: 'zim-blueberry',
    name: 'Zimbabwe Blueberry Expansion',
    type: 'Equity',
    target: 2000000,
    minInvestment: 250000,
    targetIRR: '24-30%',
    term: '5 years',
    subscribed: 45,
    subscribedAmount: 900000,
    status: 'Open',
    description:
      'Expand the Watson & Fine blueberry operation from 25ha to 100ha. EU export contracts secured. $18/kg farm-gate price. First commercial harvest delivered January 2026.',
  },
  {
    id: 'ea-crop-insurance',
    name: 'East Africa Crop Insurance Pool',
    type: 'Insurance',
    target: 3000000,
    minInvestment: 150000,
    targetIRR: '15-20%',
    term: '2 years (renewable)',
    subscribed: 78,
    subscribedAmount: 2340000,
    status: 'Open',
    description:
      "Participate in Lloyd's of London coverholder insurance premiums. Parametric weather-triggered products with 38% historical claims ratio. Covers 12,000+ farmers across Kenya, Uganda, Tanzania.",
  },
  {
    id: 'trade-finance',
    name: 'Trade Finance Facility',
    type: 'Debt',
    target: 10000000,
    minInvestment: 500000,
    targetIRR: '16-20%',
    term: '1 year (revolving)',
    subscribed: 35,
    subscribedAmount: 3500000,
    status: 'Open',
    description:
      'Fund SBLCs, Letters of Credit, and export pre-financing for agricultural commodity exports. Short duration, high turnover. Average deal tenor: 90 days.',
  },
  {
    id: 'macadamia-orchard',
    name: 'Macadamia Orchard Development',
    type: 'Equity',
    target: 2500000,
    minInvestment: 200000,
    targetIRR: '20-28%',
    term: '7 years',
    subscribed: 15,
    subscribedAmount: 375000,
    status: 'Open',
    description:
      'Greenfield macadamia orchard development in Zimbabwe and Mozambique. Premium nut commanding $5,000+/tonne. Trees productive for 40+ years. Carbon credit eligible.',
  },
  {
    id: 'uganda-smallholder',
    name: 'Uganda Smallholder Lending',
    type: 'Debt',
    target: 1500000,
    minInvestment: 50000,
    targetIRR: '20-24%',
    term: '2 years',
    subscribed: 100,
    subscribedAmount: 1500000,
    status: 'Fully Subscribed',
    description:
      'Fully subscribed. 19,000 pre-identified farmers. MTN MoMo disbursement. 94% repayment rate on existing Zimbabwe portfolio.',
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString()}`;
}

const typeBadgeStyles: Record<OpportunityType, string> = {
  'Debt Fund': 'bg-blue-100 text-blue-700',
  Debt: 'bg-blue-100 text-blue-700',
  Equity: 'bg-purple-100 text-purple-700',
  Insurance: 'bg-teal-100 text-teal-700',
};

// ── Animation Variants ────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0, 0, 0.2, 1] as const },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function InvestorOpportunities() {
  const { user, profile } = useAuth();
  const [filter, setFilter] = useState<'open' | 'subscribed'>('open');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [submittedIds, setSubmittedIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Record<string, EOIFormData>>({});

  const displayEmail = user?.email || '';

  const filtered = opportunities.filter((o) =>
    filter === 'open' ? o.status === 'Open' : o.status === 'Fully Subscribed'
  );

  function getFormData(opp: Opportunity): EOIFormData {
    return (
      formData[opp.id] || {
        amount: opp.minInvestment.toString(),
        entityName: profile?.full_name || '',
        email: displayEmail,
        phone: '',
        notes: '',
      }
    );
  }

  function updateFormField(oppId: string, field: keyof EOIFormData, value: string) {
    setFormData((prev) => ({
      ...prev,
      [oppId]: {
        ...(prev[oppId] || {
          amount: '',
          entityName: '',
          email: displayEmail,
          phone: '',
          notes: '',
        }),
        [field]: value,
      },
    }));
  }

  async function handleSubmitEOI(oppId: string) {
    const opp = opportunities.find((o) => o.id === oppId);
    const form = getFormData(opp!);

    // S2.14: Check response status instead of always showing success
    try {
      const res = await fetch('/api/investor/express-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: oppId,
          opportunityName: opp?.name,
          amount: form.amount,
          entityName: form.entityName,
          email: form.email,
          phone: form.phone,
          notes: form.notes,
          investorName: profile?.full_name || user?.email,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to submit interest' }));
        alert(errData.error || 'Failed to submit expression of interest. Please try again.');
        return;
      }
    } catch {
      alert('Network error. Please check your connection and try again.');
      return;
    }

    setSubmittedIds((prev) => new Set(prev).add(oppId));
    setExpandedId(null);
  }

  function toggleExpand(oppId: string) {
    setExpandedId((prev) => (prev === oppId ? null : oppId));
  }

  return (
    <div className="space-y-8">
      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1B2A4A] tracking-tight">
          Investment Opportunities
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Deploy capital into Africa&apos;s agricultural transformation. All opportunities are
          backed by real assets, insured by Lloyd&apos;s, with guaranteed offtake.
        </p>

        {/* Filter Pills */}
        <div className="flex gap-2 mt-5">
          <button
            onClick={() => setFilter('open')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'open'
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Open Opportunities
          </button>
          <button
            onClick={() => setFilter('subscribed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'subscribed'
                ? 'bg-[#1B2A4A] text-white shadow-sm'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            Fully Subscribed
          </button>
        </div>
      </motion.div>

      {/* ── Opportunity Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {filtered.map((opp, i) => {
            const isExpanded = expandedId === opp.id;
            const isSubmitted = submittedIds.has(opp.id);
            const isFullySubscribed = opp.status === 'Fully Subscribed';
            const form = getFormData(opp);

            return (
              <motion.div
                key={opp.id}
                custom={i}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={fadeUp}
                layout
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                  isFullySubscribed ? 'border-gray-200 opacity-75' : 'border-gray-100 hover:shadow-md'
                }`}
              >
                <div className="p-6">
                  {/* Header: Name + Type Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#1B2A4A] leading-tight">
                        {opp.name}
                      </h3>
                      <span
                        className={`inline-block mt-2 text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeBadgeStyles[opp.type]}`}
                      >
                        {opp.type}
                      </span>
                    </div>
                    {isFullySubscribed && (
                      <div className="flex-shrink-0 ml-3">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 mb-5 leading-relaxed">{opp.description}</p>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Target Raise</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">
                          {formatCurrency(opp.target)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Min Investment</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">
                          {formatCurrency(opp.minInvestment)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Target IRR</p>
                        <p className="text-sm font-semibold text-[#5DB347]">{opp.targetIRR}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">Term</p>
                        <p className="text-sm font-semibold text-[#1B2A4A]">{opp.term}</p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Progress Bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500">
                        {opp.subscribed}% subscribed
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatCurrencyFull(opp.subscribedAmount)} of{' '}
                        {formatCurrencyFull(opp.target)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isFullySubscribed
                            ? 'bg-gray-400'
                            : 'bg-[#5DB347]'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${opp.subscribed}%` }}
                        transition={{
                          delay: 0.3 + i * 0.1,
                          duration: 0.6,
                          ease: [0, 0, 0.2, 1] as const,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Button */}
                  {!isFullySubscribed && (
                    <>
                      {isSubmitted ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-2 p-3 bg-[#EBF7E5] rounded-xl"
                        >
                          <CheckCircle2 className="w-5 h-5 text-[#5DB347]" />
                          <p className="text-sm font-medium text-[#1B2A4A]">
                            Thank you. Our team will reach out within 48 hours.
                          </p>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => toggleExpand(opp.id)}
                          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                            isExpanded
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-[#5DB347] text-white hover:bg-[#4A9A38] shadow-sm'
                          }`}
                        >
                          {isExpanded ? (
                            <>
                              Close <ChevronUp className="w-4 h-4" />
                            </>
                          ) : (
                            <>
                              Express Interest <ChevronDown className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      )}
                    </>
                  )}

                  {isFullySubscribed && (
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <p className="text-sm text-gray-400 font-medium">Fully Subscribed</p>
                    </div>
                  )}
                </div>

                {/* ── Express Interest Form ─────────────────────────────────── */}
                <AnimatePresence>
                  {isExpanded && !isFullySubscribed && !isSubmitted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] as const }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-[#1B2A4A]">
                            Expression of Interest
                          </h4>
                          <button
                            onClick={() => setExpandedId(null)}
                            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {/* Investment Amount */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Investment Amount (USD)
                            </label>
                            <input
                              type="text"
                              value={form.amount}
                              onChange={(e) =>
                                updateFormField(opp.id, 'amount', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]"
                              placeholder={formatCurrencyFull(opp.minInvestment)}
                            />
                          </div>

                          {/* Investment Entity Name */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Investment Entity Name
                            </label>
                            <input
                              type="text"
                              value={form.entityName}
                              onChange={(e) =>
                                updateFormField(opp.id, 'entityName', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]"
                              placeholder="Entity or individual name"
                            />
                          </div>

                          {/* Contact Email */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Contact Email
                            </label>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(e) =>
                                updateFormField(opp.id, 'email', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]"
                              placeholder="you@example.com"
                            />
                          </div>

                          {/* Contact Phone */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Contact Phone
                            </label>
                            <input
                              type="tel"
                              value={form.phone}
                              onChange={(e) =>
                                updateFormField(opp.id, 'phone', e.target.value)
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A]"
                              placeholder="+1 (555) 000-0000"
                            />
                          </div>

                          {/* Notes / Questions */}
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Notes / Questions
                            </label>
                            <textarea
                              value={form.notes}
                              onChange={(e) =>
                                updateFormField(opp.id, 'notes', e.target.value)
                              }
                              rows={3}
                              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] text-[#1B2A4A] resize-none"
                              placeholder="Any questions or specific requirements..."
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            onClick={() => handleSubmitEOI(opp.id)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#4A9A38] transition-colors shadow-sm"
                          >
                            <Send className="w-4 h-4" />
                            Submit Expression of Interest
                          </button>

                          {/* Disclaimer */}
                          <p className="text-xs text-gray-400 leading-relaxed">
                            This is a non-binding expression of interest. AFU&apos;s investment
                            team will contact you within 48 hours with subscription documents and
                            next steps.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0}
          variants={fadeIn}
          className="text-center py-16"
        >
          <p className="text-gray-400 text-sm">
            No {filter === 'open' ? 'open' : 'fully subscribed'} opportunities at this time.
          </p>
        </motion.div>
      )}

      {/* ── Bottom CTA Section ──────────────────────────────────────────────── */}
      <motion.div
        initial="hidden"
        animate="visible"
        custom={6}
        variants={fadeIn}
        className="bg-[#1B2A4A] rounded-2xl p-8 text-center"
      >
        <h2 className="text-xl font-bold text-white mb-2">
          Looking for a custom allocation?
        </h2>
        <p className="text-gray-300 text-sm mb-6 max-w-lg mx-auto">
          We structure bespoke investment vehicles for institutional investors, family offices,
          and development finance institutions.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="w-4 h-4 text-[#5DB347]" />
            <a
              href="mailto:peter@africanfarmersunion.org"
              className="text-sm hover:text-white transition-colors"
            >
              peter@africanfarmersunion.org
            </a>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Phone className="w-4 h-4 text-[#5DB347]" />
            <a href="tel:+263772000000" className="text-sm hover:text-white transition-colors">
              +263 772 000 000
            </a>
          </div>
        </div>
        <a
          href="mailto:peter@africanfarmersunion.org?subject=Meeting%20Request%20-%20Custom%20Allocation"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#5DB347] text-white rounded-xl text-sm font-semibold hover:bg-[#4A9A38] transition-colors shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          Schedule a Meeting with Peter Watson, CEO
        </a>
      </motion.div>

      {/* S3.9: Investment disclaimer — required for financial compliance */}
      <div className="mt-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Important Investment Disclaimer</h3>
        <p className="text-xs text-amber-700 leading-relaxed">
          All target IRR figures shown are projections based on financial models and historical
          data, and are not guaranteed. Past performance is not indicative of future results.
          Investing in agriculture and emerging markets involves significant risks, including
          but not limited to: currency risk, political risk, weather and climate risk, crop
          failure, market price volatility, and liquidity risk. Capital invested may be at risk
          and you may receive back less than your original investment. These opportunities are
          available only to qualified/accredited investors as defined by applicable securities
          regulations. This does not constitute an offer to sell or a solicitation of an offer
          to buy any securities. Prospective investors should consult their own legal, tax, and
          financial advisors before making any investment decision. AFU is not a registered
          investment adviser or broker-dealer.
        </p>
      </div>
    </div>
  );
}
