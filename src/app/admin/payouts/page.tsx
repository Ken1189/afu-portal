'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Wallet,
  CheckCircle2,
  Clock,
  DollarSign,
  RefreshCw,
  Search,
  XCircle,
  Loader2,
  AlertCircle,
  Users,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface Payout {
  id: string;
  supplier_id: string;
  amount: number;
  currency: string;
  status: string;
  payout_method: string | null;
  payout_reference: string | null;
  notes: string | null;
  requested_at: string;
  processed_at: string | null;
  supplier?: { company_name: string; email: string } | null;
}

type FilterKey = 'all' | 'pending' | 'processing' | 'paid' | 'failed';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'processing', label: 'Processing' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
];

// In the DB, the "paid" UI state corresponds to status='completed'
const statusMatches = (payoutStatus: string, filter: FilterKey): boolean => {
  if (filter === 'all') return true;
  if (filter === 'paid') return payoutStatus === 'completed' || payoutStatus === 'paid';
  return payoutStatus === filter;
};

const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'completed' || s === 'paid')
    return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
  if (s === 'processing') return 'bg-blue-50 text-blue-700 border border-blue-100';
  if (s === 'failed') return 'bg-red-50 text-red-700 border border-red-100';
  return 'bg-amber-50 text-amber-700 border border-amber-100';
};

export default function AdminPayoutsPage() {
  const supabase = createClient();
  const toast = useToast();

  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: qErr } = await supabase
        .from('payouts')
        .select('*, supplier:suppliers(company_name, email)')
        .order('requested_at', { ascending: false });
      if (qErr) throw qErr;
      setPayouts((data as unknown as Payout[]) || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load payouts';
      setError(msg);
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const callProcess = async (
    payoutId: string,
    action: 'process' | 'complete' | 'fail',
    successMsg: string
  ) => {
    setBusyId(payoutId);
    try {
      const res = await fetch('/api/admin/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, action }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error || 'Action failed');
      } else {
        toast.success(successMsg);
        await load();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  // ── Stats ──
  const stats = useMemo(() => {
    const totalPending = payouts
      .filter((p) => p.status === 'pending' || p.status === 'processing')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const totalPaidThisMonth = payouts
      .filter(
        (p) =>
          (p.status === 'completed' || p.status === 'paid') &&
          p.processed_at &&
          new Date(p.processed_at) >= monthStart
      )
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    const awaitingSuppliers = new Set(
      payouts
        .filter((p) => p.status === 'pending' || p.status === 'processing')
        .map((p) => p.supplier_id)
    ).size;

    return { totalPending, totalPaidThisMonth, awaitingSuppliers };
  }, [payouts]);

  // ── Filtered + searched rows ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payouts.filter((p) => {
      if (!statusMatches(p.status, filter)) return false;
      if (!q) return true;
      const name = (p.supplier?.company_name || '').toLowerCase();
      return name.includes(q);
    });
  }, [payouts, filter, search]);

  // Counts for filter tabs
  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = {
      all: payouts.length,
      pending: 0,
      processing: 0,
      paid: 0,
      failed: 0,
    };
    payouts.forEach((p) => {
      if (p.status === 'pending') c.pending++;
      else if (p.status === 'processing') c.processing++;
      else if (p.status === 'completed' || p.status === 'paid') c.paid++;
      else if (p.status === 'failed') c.failed++;
    });
    return c;
  }, [payouts]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A] flex items-center gap-2">
              <Wallet className="w-6 h-6 text-[#5DB347]" /> Supplier Payouts
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Process supplier commission payouts and review payout history.
            </p>
          </div>
          <button
            onClick={load}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-white"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Pending</p>
                <p className="text-xl font-bold text-[#1B2A4A]">
                  ${stats.totalPending.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Paid This Month</p>
                <p className="text-xl font-bold text-[#1B2A4A]">
                  ${stats.totalPaidThisMonth.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Suppliers Awaiting Payout
                </p>
                <p className="text-xl font-bold text-[#1B2A4A]">{stats.awaitingSuppliers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs + Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4">
          <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active
                        ? 'bg-[#5DB347] text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {f.label}
                    <span
                      className={`ml-1.5 inline-block px-1.5 rounded ${
                        active ? 'bg-white/20' : 'bg-white text-gray-500'
                      }`}
                    >
                      {counts[f.key]}
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by supplier name..."
                className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-gray-50 w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* Payouts table */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Supplier</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Requested</th>
                  <th className="px-4 py-3 text-left">Method</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin inline-block text-[#5DB347]" />
                      <p className="mt-2 text-sm">Loading payouts...</p>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <AlertCircle className="w-6 h-6 inline-block text-red-500" />
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                      <button
                        onClick={load}
                        className="mt-3 px-3 py-1.5 rounded-lg bg-[#5DB347] text-white text-xs font-semibold hover:bg-[#449933]"
                      >
                        Retry
                      </button>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                      No payouts match your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isPending = p.status === 'pending';
                    const isProcessing = p.status === 'processing';
                    const isPaid = p.status === 'completed' || p.status === 'paid';
                    const isFailed = p.status === 'failed';
                    return (
                      <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50/50">
                        <td className="px-4 py-3 font-medium text-[#1B2A4A]">
                          {p.supplier?.company_name || (
                            <span className="text-gray-400 italic">Unknown</span>
                          )}
                          {p.supplier?.email && (
                            <p className="text-xs text-gray-400 font-normal">
                              {p.supplier.email}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-[#1B2A4A] font-semibold">
                          ${Number(p.amount).toFixed(2)}{' '}
                          <span className="text-xs text-gray-400 font-normal">
                            {p.currency || 'USD'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${statusBadge(
                              p.status
                            )}`}
                          >
                            {isPaid ? 'paid' : p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(p.requested_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.payout_method || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-2">
                            {isPending && (
                              <button
                                onClick={() =>
                                  callProcess(p.id, 'process', 'Payout marked processing')
                                }
                                disabled={busyId === p.id}
                                className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
                              >
                                Approve
                              </button>
                            )}
                            {(isPending || isProcessing) && (
                              <>
                                <button
                                  onClick={() =>
                                    callProcess(p.id, 'complete', 'Payout marked as paid')
                                  }
                                  disabled={busyId === p.id}
                                  className="px-3 py-1.5 rounded-lg bg-[#5DB347] text-white text-xs font-semibold hover:bg-[#449933] disabled:opacity-50"
                                >
                                  {busyId === p.id ? 'Working…' : 'Mark Paid'}
                                </button>
                                <button
                                  onClick={() =>
                                    callProcess(p.id, 'fail', 'Payout marked as failed')
                                  }
                                  disabled={busyId === p.id}
                                  className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 disabled:opacity-50"
                                  title="Mark as failed"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                            {isPaid && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                                <CheckCircle2 className="w-4 h-4" /> Done
                              </span>
                            )}
                            {isFailed && (
                              <span className="inline-flex items-center gap-1 text-red-500 text-xs font-medium">
                                <XCircle className="w-4 h-4" /> Failed
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
