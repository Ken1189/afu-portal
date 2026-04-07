'use client';

import { useState } from 'react';
import { Calendar, X, CheckCircle2, Loader2 } from 'lucide-react';

interface Props {
  className?: string;
  label?: string;
}

const INVESTOR_TYPES = [
  'Family Office',
  'DFI / Multilateral',
  'VC / Private Equity',
  'Impact Fund',
  'Foundation / Endowment',
  'Angel / HNWI',
  'Corporate / Strategic',
  'Other',
];

export default function ScheduleDemoButton({ className, label = 'Book a Demo' }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    organization: '',
    investorType: INVESTOR_TYPES[0],
    preferredTime: '',
    notes: '',
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/investor/express-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          opportunityId: 'demo_request',
          opportunityName: 'Investor Demo Request',
          amount: 0,
          entityName: form.organization || form.fullName,
          email: form.email,
          phone: '',
          investorName: form.fullName,
          notes: `Demo request\nInvestor type: ${form.investorType}\nPreferred time: ${form.preferredTime || 'Flexible'}\n\n${form.notes}`.trim(),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    // Reset after a short delay so the closing animation isn't jarring
    setTimeout(() => {
      setDone(false);
      setError(null);
      setForm({
        fullName: '',
        email: '',
        organization: '',
        investorType: INVESTOR_TYPES[0],
        preferredTime: '',
        notes: '',
      });
    }, 300);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          className ||
          'group bg-gradient-to-r from-gold to-amber-500 hover:from-gold hover:to-amber-400 text-navy-dark px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/30 hover:scale-105'
        }
      >
        <Calendar className="w-5 h-5" />
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {done ? (
              <div className="p-10 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#EBF7E5] flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-9 h-9 text-[#5DB347]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1B2A4A] mb-2">Thank you!</h3>
                <p className="text-gray-600 leading-relaxed">
                  We&apos;ll be in touch within 24 hours to schedule your demo.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 px-6 py-3 bg-[#5DB347] hover:bg-[#449933] text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#1B2A4A]">Schedule an Investor Demo</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    A 30-minute walkthrough with the AFU team. We&apos;ll confirm your slot within 24 hours.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => update('fullName', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      placeholder="Jane Smith"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      placeholder="jane@fund.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.organization}
                      onChange={(e) => update('organization', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      placeholder="Acme Capital"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Investor Type
                    </label>
                    <select
                      value={form.investorType}
                      onChange={(e) => update('investorType', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white"
                    >
                      {INVESTOR_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Preferred Meeting Time
                    </label>
                    <input
                      type="text"
                      value={form.preferredTime}
                      onChange={(e) => update('preferredTime', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
                      placeholder="e.g. Weekday mornings, GMT"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Notes (optional)
                    </label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] resize-none"
                      placeholder="Specific topics you'd like to cover..."
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-6 w-full bg-gradient-to-r from-[#5DB347] to-[#449933] hover:from-[#449933] hover:to-[#3a8329] text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Request Demo'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
