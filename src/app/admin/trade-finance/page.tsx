'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import FilterBar, { LOAN_STATUS_FILTER, COUNTRY_FILTER } from '@/components/admin/FilterBar';
import type { FilterValues } from '@/components/admin/FilterBar';
import {
  Ship,
  DollarSign,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  TrendingUp,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Eye,
} from 'lucide-react';
import type { LoanRow } from '@/lib/supabase/use-loans';

/* ------------------------------------------------------------------ */
/* Animation variants                                                   */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 },
  },
};

/* ------------------------------------------------------------------ */
/* Status helpers                                                       */
/* ------------------------------------------------------------------ */

const statusBadge: Record<string, string> = {
  submitted: 'bg-yellow-100 text-yellow-700',
  pending: 'bg-yellow-100 text-yellow-700',
  under_review: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  disbursed: 'bg-teal/10 text-teal',
  repaying: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-gray-100 text-gray-600',
};

/* ------------------------------------------------------------------ */
/* Page                                                                 */
/* ------------------------------------------------------------------ */

export default function AdminTradeFinancePage() {
  const [loans, setLoans] = useState<LoanRow[]>([]);
  const [_loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    status: 'all',
    country: 'all',
  });

  /* ── Fetch trade finance loans from Supabase ── */
  const fetchLoans = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();

    const { data, error } = await supabase
      .from('loans')
      .select('*, members(full_name, country)')
      .eq('loan_type', 'tradeFinance')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLoans(data as unknown as LoanRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  /* ── Approve / Reject handlers ── */
  const handleAction = async (loanId: string, action: 'approved' | 'rejected') => {
    setActionLoading(loanId);
    const supabase = createClient();

    await supabase
      .from('loans')
      .update({
        status: action,
        ...(action === 'approved' ? { approved_at: new Date().toISOString() } : {}),
      })
      .eq('id', loanId);

    await fetchLoans();
    setActionLoading(null);
  };

  /* ── Filter logic ── */
  const filtered = loans.filter((loan) => {
    const rec = loan as LoanRow & { members?: { full_name?: string; country?: string } };
    const memberName = rec.members?.full_name || '';
    const memberCountry = rec.members?.country || '';

    if (filters.status !== 'all' && loan.status !== filters.status) return false;
    if (filters.country !== 'all' && memberCountry !== filters.country) return false;
    if (
      filters.search &&
      !memberName.toLowerCase().includes(filters.search.toLowerCase()) &&
      !loan.loan_number.toLowerCase().includes(filters.search.toLowerCase()) &&
      !(loan.purpose || '').toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  /* ── Stats ── */
  const stats = {
    active: loans.filter((l) => ['approved', 'disbursed', 'repaying'].includes(l.status)).length,
    totalValue: loans.reduce((s, l) => s + Number(l.amount), 0),
    pending: loans.filter((l) => ['submitted', 'pending', 'under_review'].includes(l.status)).length,
    countries: new Set(
      loans.map((l) => {
        const rec = l as LoanRow & { members?: { country?: string } };
        return rec.members?.country;
      }).filter(Boolean)
    ).size,
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ── */}
      <motion.div variants={cardVariants}>
        <h1 className="text-xl sm:text-2xl font-bold text-navy flex items-center gap-2">
          <Ship className="w-6 h-6 text-teal" />
          Trade Finance Management
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage SBLCs, Letters of Credit, and export finance applications
        </p>
      </motion.div>

      {/* ── Stats cards ── */}
      <motion.div variants={cardVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Instruments', value: String(stats.active), icon: CheckCircle, color: 'bg-green-50 text-green-600' },
          { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: 'bg-teal/10 text-teal' },
          { label: 'Pending Applications', value: String(stats.pending), icon: Clock, color: 'bg-yellow-50 text-yellow-600' },
          { label: 'Countries', value: String(stats.countries), icon: Globe, color: 'bg-blue-50 text-blue-600' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-xl font-bold text-navy">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* ── Filters ── */}
      <motion.div variants={cardVariants}>
        <FilterBar
          filters={[LOAN_STATUS_FILTER, COUNTRY_FILTER]}
          values={filters}
          onChange={setFilters}
          searchPlaceholder="Search by name, loan number, or purpose..."
          resultCount={filtered.length}
        />
      </motion.div>

      {/* ── Table ── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Loading trade finance applications...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Ship className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No trade finance applications found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Applicant</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Instrument</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Counterparty</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Country</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((loan) => {
                  const rec = loan as LoanRow & { members?: { full_name?: string; country?: string } };
                  const memberName = rec.members?.full_name || 'Unknown';
                  const memberCountry = rec.members?.country || '-';
                  // Parse instrument type and counterparty from purpose field
                  const purposeParts = (loan.purpose || '').split(' — ');
                  const instrumentLabel = purposeParts[0] || 'Trade Finance';
                  const counterpartyParts = (purposeParts[1] || '').split(' to ');
                  const commodity = counterpartyParts[0] || '-';
                  const counterparty = counterpartyParts[1]?.split(' (')[0] || '-';
                  const isPending = ['submitted', 'pending', 'under_review'].includes(loan.status);

                  return (
                    <tr key={loan.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-navy">{memberName}</td>
                      <td className="px-4 py-3 text-gray-600">{instrumentLabel}</td>
                      <td className="px-4 py-3 font-semibold text-navy">${Number(loan.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-gray-600">{counterparty !== '-' ? counterparty : commodity}</td>
                      <td className="px-4 py-3 text-gray-600">{memberCountry}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge[loan.status] || 'bg-gray-100 text-gray-600'}`}>
                          {loan.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(loan.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {isPending && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAction(loan.id, 'approved')}
                              disabled={actionLoading === loan.id}
                              className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === loan.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <ThumbsUp className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleAction(loan.id, 'rejected')}
                              disabled={actionLoading === loan.id}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Reject"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
