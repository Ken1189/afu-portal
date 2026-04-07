'use client';

import { useEffect, useState, useMemo } from 'react';
import { CreditCard, TrendingUp, AlertCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SubRow {
  id: string;
  supplier_id: string;
  plan_slug: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  created_at: string;
  suppliers: {
    company_name: string | null;
    email: string | null;
  } | null;
}

interface PlanRow {
  slug: string;
  price_monthly: number;
  name: string;
}

const TABS = ['all', 'active', 'past_due', 'canceled'] as const;
type TabKey = (typeof TABS)[number];

export default function AdminSubscriptionsPage() {
  const [subs, setSubs] = useState<SubRow[]>([]);
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClient();
        const { data: planRows } = await supabase
          .from('supplier_subscription_plans')
          .select('slug, name, price_monthly');
        setPlans((planRows || []) as PlanRow[]);

        const { data: subRows, error: subErr } = await supabase
          .from('supplier_subscriptions')
          .select(
            'id, supplier_id, plan_slug, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, stripe_subscription_id, stripe_customer_id, created_at, suppliers(company_name, email)'
          )
          .order('created_at', { ascending: false });

        if (subErr) throw subErr;
        setSubs((subRows || []) as unknown as SubRow[]);
      } catch (e) {
        console.error('[admin subs] load error', e);
        setError('Failed to load subscriptions.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const planPrice = (slug: string): number => {
    const plan = plans.find((p) => p.slug === slug);
    return plan ? Number(plan.price_monthly) : 0;
  };

  const stats = useMemo(() => {
    const active = subs.filter((s) => ['active', 'trialing'].includes(s.status));
    const pastDue = subs.filter((s) => s.status === 'past_due');
    const mrr = active.reduce((sum, s) => sum + planPrice(s.plan_slug), 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const cancelsThisMonth = subs.filter(
      (s) => s.canceled_at && new Date(s.canceled_at) >= monthStart
    ).length;

    return {
      activeCount: active.length,
      mrr,
      pastDueCount: pastDue.length,
      cancelsThisMonth,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subs, plans]);

  const filtered = useMemo(() => {
    if (tab === 'all') return subs;
    if (tab === 'active') return subs.filter((s) => ['active', 'trialing'].includes(s.status));
    if (tab === 'past_due') return subs.filter((s) => s.status === 'past_due');
    if (tab === 'canceled') return subs.filter((s) => s.status === 'canceled');
    return subs;
  }, [subs, tab]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#5DB347]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#5DB347]/10 flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-[#5DB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Supplier Subscriptions</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor MRR and supplier billing health</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Active Subscriptions" value={stats.activeCount.toString()} icon={<CreditCard className="w-5 h-5" />} accent="green" />
        <SummaryCard title="Monthly Recurring Revenue" value={`$${stats.mrr.toFixed(0)}`} icon={<TrendingUp className="w-5 h-5" />} accent="navy" />
        <SummaryCard title="Past Due" value={stats.pastDueCount.toString()} icon={<AlertCircle className="w-5 h-5" />} accent="orange" />
        <SummaryCard title="Cancels This Month" value={stats.cancelsThisMonth.toString()} icon={<XCircle className="w-5 h-5" />} accent="red" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-[#5DB347] text-[#5DB347]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'all' ? 'All' : t === 'past_due' ? 'Past Due' : t.charAt(0).toUpperCase() + t.slice(1)}
            <span className="ml-2 text-xs text-gray-400">
              ({t === 'all' ? subs.length : t === 'active' ? stats.activeCount : t === 'past_due' ? stats.pastDueCount : subs.filter((s) => s.status === 'canceled').length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-500">No subscriptions in this view.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase">
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Started</th>
                  <th className="px-4 py-3">Next Renewal</th>
                  <th className="px-4 py-3">MRR</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#1B2A4A]">{s.suppliers?.company_name || '—'}</div>
                      <div className="text-xs text-gray-500">{s.suppliers?.email || ''}</div>
                    </td>
                    <td className="px-4 py-3 capitalize font-medium">{s.plan_slug}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : s.status === 'past_due'
                              ? 'bg-orange-100 text-orange-700'
                              : s.status === 'canceled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {s.status.toUpperCase()}
                      </span>
                      {s.cancel_at_period_end && (
                        <span className="ml-1 text-[10px] text-orange-600">(cancelling)</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {s.current_period_start ? new Date(s.current_period_start).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                      ${planPrice(s.plan_slug).toFixed(0)}
                    </td>
                    <td className="px-4 py-3">
                      {s.stripe_subscription_id && (
                        <a
                          href={`https://dashboard.stripe.com/subscriptions/${s.stripe_subscription_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#5DB347] hover:underline inline-flex items-center gap-1 text-xs"
                        >
                          Stripe <ExternalLink className="w-3 h-3" />
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
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent: 'green' | 'navy' | 'orange' | 'red';
}) {
  const colors = {
    green: 'bg-green-100 text-green-700',
    navy: 'bg-blue-100 text-blue-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[accent]}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-[#1B2A4A]">{value}</p>
        </div>
      </div>
    </div>
  );
}
