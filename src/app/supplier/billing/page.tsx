'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle2, AlertTriangle, ExternalLink, Loader2, XCircle, Wallet } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Plan {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_monthly: number;
  product_limit: number;
  commission_rate: number;
  features: string[];
  display_order: number;
}

interface Subscription {
  id: string;
  plan_slug: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export default function SupplierBillingPage() {
  const params = useSearchParams();
  const successFlag = params.get('success');
  const canceledFlag = params.get('canceled');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [sub, setSub] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not signed in.');
        setLoading(false);
        return;
      }

      const { data: supplier } = await supabase
        .from('suppliers')
        .select('id')
        .eq('profile_id', user.id)
        .maybeSingle();

      const { data: planRows } = await supabase
        .from('supplier_subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      setPlans(
        (planRows || []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          slug: p.slug as string,
          name: p.name as string,
          description: (p.description as string) || null,
          price_monthly: Number(p.price_monthly),
          product_limit: Number(p.product_limit),
          commission_rate: Number(p.commission_rate),
          features: Array.isArray(p.features) ? (p.features as string[]) : [],
          display_order: Number(p.display_order),
        }))
      );

      if (supplier) {
        const { data: subRow } = await supabase
          .from('supplier_subscriptions')
          .select('id, plan_slug, status, current_period_start, current_period_end, cancel_at_period_end')
          .eq('supplier_id', supplier.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (subRow) setSub(subRow as Subscription);

        const { data: invRows } = await supabase
          .from('supplier_invoices')
          .select('id, amount, currency, status, hosted_invoice_url, invoice_pdf, period_start, period_end, created_at')
          .eq('supplier_id', supplier.id)
          .order('created_at', { ascending: false })
          .limit(12);
        setInvoices((invRows || []) as Invoice[]);
      }
    } catch (e) {
      console.error('[billing] load error', e);
      setError('Failed to load billing information.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (successFlag === '1') {
      setToast('Subscription activated! Welcome aboard.');
      setTimeout(() => setToast(null), 5000);
    } else if (canceledFlag === '1') {
      setToast('Checkout canceled. You can subscribe any time.');
      setTimeout(() => setToast(null), 5000);
    }
  }, [successFlag, canceledFlag]);

  const handleSubscribe = async (slug: string) => {
    setActionLoading(`sub-${slug}`);
    try {
      const res = await fetch('/api/supplier/subscriptions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Checkout failed';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handlePortal = async () => {
    setActionLoading('portal');
    try {
      const res = await fetch('/api/supplier/subscriptions/portal', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Portal failed');
      if (data.url) window.location.href = data.url;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Portal failed';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    setActionLoading('cancel');
    try {
      const res = await fetch('/api/supplier/subscriptions/cancel', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancel failed');
      setShowCancelModal(false);
      setToast('Subscription will end at the current period.');
      setTimeout(() => setToast(null), 5000);
      await loadData();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Cancel failed';
      setError(message);
    } finally {
      setActionLoading(null);
    }
  };

  const isActive = sub && ['active', 'trialing', 'past_due'].includes(sub.status);
  const currentPlan = isActive ? plans.find((p) => p.slug === sub?.plan_slug) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-[#5DB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Billing & Subscription</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your AFU supplier plan and view invoices</p>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{toast}</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Current Plan</h2>
        {isActive && currentPlan ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-[#1B2A4A]">{currentPlan.name}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    sub?.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : sub?.status === 'past_due'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {sub?.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-3xl font-bold text-[#5DB347]">
                ${currentPlan.price_monthly}
                <span className="text-sm font-normal text-gray-500">/month</span>
              </p>
              {sub?.current_period_end && (
                <p className="text-xs text-gray-500 mt-2">
                  {sub.cancel_at_period_end ? 'Ends' : 'Renews'}: {new Date(sub.current_period_end).toLocaleDateString()}
                </p>
              )}
              {sub?.cancel_at_period_end && (
                <p className="text-xs text-orange-600 mt-1 font-medium">
                  Subscription will not renew.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handlePortal}
                disabled={actionLoading === 'portal'}
                className="inline-flex items-center justify-center gap-2 bg-[#1B2A4A] hover:bg-[#0f1a30] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading === 'portal' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Manage Billing
              </button>
              {!sub?.cancel_at_period_end && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-600 mb-1 font-medium">You&apos;re on the free trial.</p>
            <p className="text-sm text-gray-500">Subscribe below to unlock full marketplace access.</p>
          </div>
        )}
      </div>

      {/* Plan Picker */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((plan) => {
            const isCurrent = isActive && sub?.plan_slug === plan.slug;
            const isPro = plan.slug === 'pro';
            return (
              <div
                key={plan.id}
                className={`bg-white border-2 rounded-2xl p-5 ${
                  isCurrent
                    ? 'border-[#5DB347] shadow-md'
                    : isPro
                      ? 'border-[#1B2A4A]'
                      : 'border-gray-100'
                } shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-[#1B2A4A]">{plan.name}</h3>
                    {plan.description && <p className="text-xs text-gray-500 mt-1">{plan.description}</p>}
                  </div>
                  {isCurrent && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#5DB347] text-white">
                      CURRENT
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-[#1B2A4A] mb-3">
                  ${plan.price_monthly}
                  <span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
                <ul className="space-y-2 mb-5 min-h-[140px]">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-[#5DB347] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(plan.slug)}
                  disabled={isCurrent || actionLoading === `sub-${plan.slug}`}
                  className={`w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 ${
                    isCurrent
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'bg-[#5DB347] hover:bg-[#449933] text-white'
                  }`}
                >
                  {actionLoading === `sub-${plan.slug}` ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : isActive ? (
                    'Switch to this plan'
                  ) : (
                    'Subscribe'
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Recent Invoices
        </h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-gray-50">
                    <td className="py-3 pr-4 text-gray-700">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 pr-4 font-medium text-[#1B2A4A]">
                      ${Number(inv.amount).toFixed(2)} {inv.currency.toUpperCase()}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          inv.status === 'paid'
                            ? 'bg-green-100 text-green-700'
                            : inv.status === 'open'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 pr-4 flex gap-3">
                      {inv.hosted_invoice_url && (
                        <a
                          href={inv.hosted_invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5DB347] hover:underline inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {inv.invoice_pdf && (
                        <a
                          href={inv.invoice_pdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1B2A4A] hover:underline"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B2A4A]">Cancel Subscription?</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Your subscription will remain active until the end of the current billing period. After that, you&apos;ll lose access to your plan benefits.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading === 'cancel'}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 inline-flex items-center gap-2"
              >
                {actionLoading === 'cancel' && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
