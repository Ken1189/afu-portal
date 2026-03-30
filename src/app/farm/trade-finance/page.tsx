'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Ship,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  Globe,
  ArrowRight,
  Send,
  Loader2,
  Shield,
  Landmark,
  Package,
  Warehouse,
  Info,
} from 'lucide-react';
import { useLoans } from '@/lib/supabase/use-loans';

/* ------------------------------------------------------------------ */
/* Mock active instruments                                              */
/* ------------------------------------------------------------------ */

interface TradeInstrument {
  id: string;
  type: 'SBLC' | 'Documentary LC' | 'Export Pre-Finance' | 'Warehouse Receipt Finance';
  title: string;
  counterparty: string;
  amount: number;
  currency: string;
  status: string;
  detail: string;
  bank?: string;
}

const FALLBACK_INSTRUMENTS: TradeInstrument[] = [
  {
    id: 'TF-001',
    type: 'SBLC',
    title: 'Blueberry Export',
    counterparty: 'FreshBerry GmbH',
    amount: 45000,
    currency: 'USD',
    status: 'Active',
    detail: 'Expires Dec 2026',
    bank: 'AFU Banking Partner',
  },
  {
    id: 'TF-002',
    type: 'Documentary LC',
    title: 'Sesame Shipment',
    counterparty: 'Istanbul Trading',
    amount: 28000,
    currency: 'USD',
    status: 'Active',
    detail: '90 days',
  },
  {
    id: 'TF-003',
    type: 'Export Pre-Finance',
    title: 'Maize Harvest Working Capital',
    counterparty: '',
    amount: 15000,
    currency: 'USD',
    status: 'Disbursed',
    detail: 'Repay on harvest',
  },
];

const instrumentIcons: Record<string, typeof Ship> = {
  SBLC: Shield,
  'Documentary LC': FileText,
  'Export Pre-Finance': DollarSign,
  'Warehouse Receipt Finance': Warehouse,
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-100 text-green-700',
  Disbursed: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Expired: 'bg-gray-100 text-gray-600',
};

/* ------------------------------------------------------------------ */
/* Instrument type dropdown options                                     */
/* ------------------------------------------------------------------ */

const instrumentTypes = [
  { value: 'sblc', label: 'SBLC (Standby Letter of Credit)' },
  { value: 'documentary_lc', label: 'Documentary Letter of Credit' },
  { value: 'export_pre_finance', label: 'Export Pre-Finance' },
  { value: 'warehouse_receipt', label: 'Warehouse Receipt Finance' },
];

const currencies = ['USD', 'EUR', 'GBP'];

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function TradeFinancePage() {
  const { applyForLoan } = useLoans();

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [form, setForm] = useState({
    instrumentType: '',
    amount: '',
    currency: 'USD',
    counterparty: '',
    buyerCountry: '',
    commodity: '',
    shipmentDate: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await applyForLoan({
      loan_type: 'tradeFinance',
      amount: Number(form.amount),
      interest_rate: 10.0,
      term_months: 3,
      purpose: `${form.instrumentType} — ${form.commodity} to ${form.counterparty} (${form.buyerCountry}), ship ${form.shipmentDate}`,
      collateral: form.notes || undefined,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError(error.message || 'Failed to submit application. Please try again.');
    } else {
      setSubmitted(true);
      setShowForm(false);
      setForm({ instrumentType: '', amount: '', currency: 'USD', counterparty: '', buyerCountry: '', commodity: '', shipmentDate: '', notes: '' });
    }
  };

  const isFormValid =
    form.instrumentType !== '' &&
    Number(form.amount) > 0 &&
    form.counterparty !== '' &&
    form.buyerCountry !== '' &&
    form.commodity !== '';

  return (
    <div className="px-4 py-5 sm:px-6 lg:px-8 space-y-8">
      {/* ── A) Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy flex items-center gap-2">
            <Ship className="w-6 h-6 text-teal" />
            Trade Finance
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            SBLCs, Letters of Credit, and export financing to unlock international markets
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setSubmitted(false); }}
          className="bg-teal hover:bg-teal-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          Apply for Trade Finance
        </button>
      </div>

      {/* ── Success toast ── */}
      {submitted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-green-800">Application Submitted</p>
            <p className="text-xs text-green-600">Your trade finance application is under review. We will notify you once it is processed.</p>
          </div>
        </motion.div>
      )}

      {/* ── B) Active Instruments ── */}
      <section>
        <h2 className="text-lg font-bold text-navy mb-4">Active Instruments</h2>
        <div className="space-y-3">
          {FALLBACK_INSTRUMENTS.map((inst) => {
            const Icon = instrumentIcons[inst.type] || Ship;
            return (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-100 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-navy text-sm">{inst.type}</p>
                      <p className="text-xs text-gray-400">
                        {inst.title}{inst.counterparty ? ` — ${inst.counterparty}` : ''}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColors[inst.status] || 'bg-gray-100 text-gray-600'}`}>
                    {inst.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] text-gray-400">Amount</p>
                    <p className="font-semibold text-navy">${inst.amount.toLocaleString()} {inst.currency}</p>
                  </div>
                  <div>
                    <p className="text-[11px] text-gray-400">Detail</p>
                    <p className="font-semibold text-navy">{inst.detail}</p>
                  </div>
                  {inst.bank && (
                    <div className="col-span-2 sm:col-span-2">
                      <p className="text-[11px] text-gray-400">Issuing Bank</p>
                      <p className="font-semibold text-navy flex items-center gap-1">
                        <Landmark className="w-3.5 h-3.5 text-gray-400" />
                        {inst.bank}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── C) Application Form ── */}
      {showForm && (
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal to-navy p-5 text-white">
              <h2 className="font-bold text-lg">Apply for Trade Finance</h2>
              <p className="text-sm opacity-80 mt-1">Complete the form below and our team will process your application</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Instrument type */}
              <div>
                <label className="text-sm font-medium text-navy block mb-1.5">Instrument Type *</label>
                <select
                  value={form.instrumentType}
                  onChange={(e) => setForm({ ...form, instrumentType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none bg-white"
                >
                  <option value="">Select instrument type</option>
                  {instrumentTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Currency row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-navy block mb-1.5">Amount *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="e.g. 25000"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-navy block mb-1.5">Currency</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none bg-white"
                  >
                    {currencies.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Buyer / Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-navy block mb-1.5">Buyer / Counterparty *</label>
                  <input
                    type="text"
                    value={form.counterparty}
                    onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
                    placeholder="e.g. FreshBerry GmbH"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-navy block mb-1.5">Buyer Country *</label>
                  <input
                    type="text"
                    value={form.buyerCountry}
                    onChange={(e) => setForm({ ...form, buyerCountry: e.target.value })}
                    placeholder="e.g. Germany"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
              </div>

              {/* Commodity / Shipment date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-navy block mb-1.5">Commodity / Product *</label>
                  <input
                    type="text"
                    value={form.commodity}
                    onChange={(e) => setForm({ ...form, commodity: e.target.value })}
                    placeholder="e.g. Blueberries, Grade A"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-navy block mb-1.5">Expected Shipment Date</label>
                  <input
                    type="date"
                    value={form.shipmentDate}
                    onChange={(e) => setForm({ ...form, shipmentDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-navy block mb-1.5">Description / Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional details about this trade finance request..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal/30 focus:border-teal outline-none resize-none"
                />
              </div>

              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{submitError}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isFormValid && !submitting
                      ? 'bg-teal text-white hover:bg-teal-dark'
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
                      Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.section>
      )}

      {/* ── D) How It Works ── */}
      <section>
        <h2 className="text-lg font-bold text-navy mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: 1, icon: FileText, title: 'Apply through AFU', desc: 'Submit your trade finance application with buyer details and shipment information.' },
            { step: 2, icon: Landmark, title: 'Our banking partner issues the instrument', desc: 'Our banking partner issues the SBLC, LC, or pre-finance arrangement.' },
            { step: 3, icon: Package, title: 'Ship your goods with confidence', desc: 'Export your products knowing payment is secured by the instrument.' },
            { step: 4, icon: DollarSign, title: 'Buyer pays on delivery, you get paid', desc: 'Funds are released upon confirmed delivery, and you receive your payment.' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="bg-white rounded-xl border border-gray-100 p-5 relative">
                <div className="w-8 h-8 bg-teal text-white rounded-full flex items-center justify-center text-sm font-bold mb-3">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal/10 text-teal flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-navy text-sm mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
                {item.step < 4 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 w-5 h-5 text-gray-300 -translate-y-1/2" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── E) Requirements ── */}
      <section className="bg-gradient-to-br from-navy to-[#8CB89C] rounded-xl p-5 text-white">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Eligibility Requirements</h3>
            <p className="text-sm opacity-90">
              Trade finance is available to Commercial Gold and Platinum members with at least one completed harvest cycle on the platform.
            </p>
            <ul className="text-sm opacity-80 mt-3 space-y-1.5">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                Active Commercial Gold or Platinum membership
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                At least one completed harvest cycle recorded
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                Valid KYC documentation on file
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                Confirmed buyer or offtake agreement
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
