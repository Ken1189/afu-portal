'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  DollarSign, Search, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, Clock, XCircle, RotateCcw, CreditCard,
  AlertTriangle, Banknote, TrendingUp,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Pagination from '@/components/admin/Pagination';
import { motion } from 'framer-motion';

interface PaymentRow {
  id: string;
  created_at: string;
  updated_at: string | null;
  amount: number | null;
  currency: string | null;
  status: string | null;
  method: string | null;
  description: string | null;
  order_id: string | null;
  loan_id: string | null;
  member_id: string | null;
  reference: string | null;
  member?: {
    profile?: {
      full_name: string | null;
    } | null;
  } | null;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  completed: { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle2 className="w-3 h-3" /> },
  pending:   { label: 'Pending',   bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-3 h-3" /> },
  failed:    { label: 'Failed',    bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-3 h-3" /> },
  refunded:  { label: 'Refunded',  bg: 'bg-gray-100', text: 'text-gray-600', icon: <RotateCcw className="w-3 h-3" /> },
};

function StatusBadge({ status }: { status: string | null }) {
  const s = statusConfig[status || ''] || { label: status || 'Unknown', bg: 'bg-gray-100', text: 'text-gray-600', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon}
      {s.label}
    </span>
  );
}

function formatCurrency(amount: number | null, currency?: string | null) {
  if (amount == null) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function formatDateTime(iso: string | null) {
  if (!iso) return '--';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function inferType(p: PaymentRow): string {
  if (p.order_id) return 'Order';
  if (p.loan_id) return 'Loan';
  if (p.description?.toLowerCase().includes('subscription')) return 'Subscription';
  if (p.description?.toLowerCase().includes('donat')) return 'Donation';
  return p.description || 'Payment';
}

export default function ReconciliationPage() {
  const supabase = useMemo(() => createClient(), []);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 25;
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stats
  const [statsTotal, setStatsTotal] = useState(0);
  const [statsCollected, setStatsCollected] = useState(0);
  const [statsPending, setStatsPending] = useState(0);
  const [statsFailed, setStatsFailed] = useState(0);

  const fetchStats = useCallback(async () => {
    try {
      // Total count
      const { count: total } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });
      setStatsTotal(total ?? 0);

      // Completed sum
      const { data: completedData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      const sum = (completedData || []).reduce((acc, r) => acc + (r.amount || 0), 0);
      setStatsCollected(sum);

      // Pending count
      const { count: pending } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      setStatsPending(pending ?? 0);

      // Failed count
      const { count: failed } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');
      setStatsFailed(failed ?? 0);
    } catch (err) {
      console.error('[reconciliation] stats error', err);
    }
  }, [supabase]);

  const fetchPayments = useCallback(async (pg: number = 1) => {
    setLoading(true);
    const from = (pg - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    try {
      let query = supabase
        .from('payments')
        .select('*, member:members(profile:profiles(full_name))', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) {
        console.error('[reconciliation] fetch error', error);
        setErrorMsg(error.message);
        setTimeout(() => setErrorMsg(null), 4000);
        setPayments([]);
      } else {
        setPayments((data || []) as PaymentRow[]);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      console.error('[reconciliation] exception', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); }, [statusFilter]);
  useEffect(() => { fetchPayments(page); }, [fetchPayments, page]);

  const filtered = useMemo(() => {
    if (!searchQuery) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter(p =>
      p.id?.toLowerCase().includes(q) ||
      p.reference?.toLowerCase().includes(q) ||
      p.member?.profile?.full_name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  const statCards = [
    { label: 'Total Payments', value: statsTotal.toLocaleString(), icon: <CreditCard className="w-5 h-5" />, color: 'text-[#1B2A4A]', bg: 'bg-[#1B2A4A]/5' },
    { label: 'Total Collected', value: formatCurrency(statsCollected), icon: <TrendingUp className="w-5 h-5" />, color: 'text-[#5DB347]', bg: 'bg-[#5DB347]/10' },
    { label: 'Pending', value: statsPending.toLocaleString(), icon: <Clock className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Failed', value: statsFailed.toLocaleString(), icon: <AlertTriangle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2.5 rounded-xl bg-[#5DB347]/10">
          <DollarSign className="w-6 h-6 text-[#5DB347]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">Payment Reconciliation</h1>
          <p className="text-sm text-gray-500">Trace payments, match to orders and loans</p>
        </div>
      </motion.div>

      {/* Error */}
      {errorMsg && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{errorMsg}</div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3"
          >
            <div className={`p-2 rounded-lg ${s.bg}`}>
              <span className={s.color}>{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, member, or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347]"
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#5DB347]" />
            <span className="ml-2 text-sm text-gray-500">Loading payments...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Banknote className="w-12 h-12 mb-3 opacity-40" />
            <p className="font-medium text-gray-500">No payments found</p>
            <p className="text-sm">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Payments will appear here once transactions are recorded'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Member</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(p => (
                    <>
                      <tr
                        key={p.id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                      >
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(p.created_at)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                          {p.reference || p.id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{inferType(p)}</td>
                        <td className="px-4 py-3 font-medium text-[#1B2A4A] whitespace-nowrap">
                          {formatCurrency(p.amount, p.currency)}
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 text-gray-600">
                          {p.member?.profile?.full_name || '--'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-gray-400 hover:text-[#5DB347] transition-colors">
                            {expandedId === p.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                      </tr>
                      {expandedId === p.id && (
                        <tr key={`${p.id}-details`}>
                          <td colSpan={7} className="px-4 py-4 bg-gray-50/50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Full Reference</p>
                                <p className="font-mono text-xs text-gray-700 break-all">{p.reference || p.id}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Amount</p>
                                <p className="font-medium text-[#1B2A4A]">{formatCurrency(p.amount, p.currency)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Method</p>
                                <p className="text-gray-700">{p.method || '--'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                                <StatusBadge status={p.status} />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                                <p className="font-mono text-xs text-gray-700">{p.order_id || '--'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Loan ID</p>
                                <p className="font-mono text-xs text-gray-700">{p.loan_id || '--'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Description</p>
                                <p className="text-gray-700">{p.description || '--'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Member</p>
                                <p className="text-gray-700">{p.member?.profile?.full_name || '--'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Created</p>
                                <p className="text-gray-700">{formatDateTime(p.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-400 mb-0.5">Updated</p>
                                <p className="text-gray-700">{formatDateTime(p.updated_at)}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(p => (
                <div key={p.id}>
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#1B2A4A]">
                          {formatCurrency(p.amount, p.currency)}
                        </span>
                        <StatusBadge status={p.status} />
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {inferType(p)} -- {p.member?.profile?.full_name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(p.created_at)}</p>
                    </div>
                    <button className="text-gray-400 ml-2">
                      {expandedId === p.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {expandedId === p.id && (
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-xs text-gray-400">Reference</p>
                          <p className="font-mono text-xs text-gray-700 break-all">{p.reference || p.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Method</p>
                          <p className="text-gray-700">{p.method || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Order ID</p>
                          <p className="font-mono text-xs text-gray-700">{p.order_id || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Loan ID</p>
                          <p className="font-mono text-xs text-gray-700">{p.loan_id || '--'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400">Description</p>
                          <p className="text-gray-700">{p.description || '--'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Created</p>
                          <p className="text-gray-700">{formatDateTime(p.created_at)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Updated</p>
                          <p className="text-gray-700">{formatDateTime(p.updated_at)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              totalCount={totalCount}
              onPageChange={setPage}
            />
          </>
        )}
      </motion.div>
    </div>
  );
}
