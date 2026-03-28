'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Clock,
  CheckCircle,
  Calendar,
  Filter,
  Search,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '@/lib/supabase/auth-context';
import { createClient } from '@/lib/supabase/client';

// ── Types ────────────────────────────────────────────────────────────────────

interface CommissionEntry {
  id: string;
  commission_type: string;
  source_amount: number;
  rate: number;
  commission_amount: number;
  status: string;
  created_at: string;
  description: string;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

const demoEntries: CommissionEntry[] = [
  { id: '1', commission_type: 'membership', source_amount: 250, rate: 0.10, commission_amount: 25, status: 'paid', created_at: '2026-03-25T10:00:00Z', description: 'John Mwangi membership signup' },
  { id: '2', commission_type: 'fundraising', source_amount: 5000, rate: 0.05, commission_amount: 250, status: 'paid', created_at: '2026-03-22T14:00:00Z', description: 'Community fundraiser - Kampala' },
  { id: '3', commission_type: 'advertising', source_amount: 1200, rate: 0.10, commission_amount: 120, status: 'pending', created_at: '2026-03-20T09:00:00Z', description: 'AgriTech Co. ad placement' },
  { id: '4', commission_type: 'membership', source_amount: 250, rate: 0.10, commission_amount: 25, status: 'paid', created_at: '2026-03-18T16:00:00Z', description: 'Sarah Kimani membership signup' },
  { id: '5', commission_type: 'membership', source_amount: 500, rate: 0.10, commission_amount: 50, status: 'pending', created_at: '2026-03-15T11:00:00Z', description: 'Cooperative Premium membership' },
  { id: '6', commission_type: 'fundraising', source_amount: 2000, rate: 0.05, commission_amount: 100, status: 'paid', created_at: '2026-03-12T08:00:00Z', description: 'Water project fundraiser' },
  { id: '7', commission_type: 'advertising', source_amount: 800, rate: 0.10, commission_amount: 80, status: 'paid', created_at: '2026-03-10T13:00:00Z', description: 'Farm Supplies Ltd. ad' },
  { id: '8', commission_type: 'membership', source_amount: 250, rate: 0.10, commission_amount: 25, status: 'pending', created_at: '2026-03-08T15:00:00Z', description: 'Peter Obi membership signup' },
  { id: '9', commission_type: 'fundraising', source_amount: 10000, rate: 0.07, commission_amount: 700, status: 'paid', created_at: '2026-03-05T10:00:00Z', description: 'Large-scale irrigation fundraiser' },
  { id: '10', commission_type: 'membership', source_amount: 250, rate: 0.10, commission_amount: 25, status: 'paid', created_at: '2026-03-01T09:00:00Z', description: 'Grace Achieng membership signup' },
  { id: '11', commission_type: 'supplier', source_amount: 15000, rate: 0.05, commission_amount: 750, status: 'paid', created_at: '2026-02-25T10:00:00Z', description: 'Seed supplier partnership' },
  { id: '12', commission_type: 'advertising', source_amount: 2500, rate: 0.10, commission_amount: 250, status: 'paid', created_at: '2026-02-20T14:00:00Z', description: 'Equipment dealer ad campaign' },
  { id: '13', commission_type: 'fundraising', source_amount: 8000, rate: 0.07, commission_amount: 560, status: 'paid', created_at: '2026-02-15T09:00:00Z', description: 'Solar pump fundraiser' },
  { id: '14', commission_type: 'membership', source_amount: 250, rate: 0.10, commission_amount: 25, status: 'paid', created_at: '2026-02-10T16:00:00Z', description: 'Moses Okello membership signup' },
  { id: '15', commission_type: 'membership', source_amount: 250, rate: 0.10, commission_amount: 25, status: 'paid', created_at: '2026-02-05T11:00:00Z', description: 'Fatima Diallo membership signup' },
];

// ── Component ────────────────────────────────────────────────────────────────

export default function CommissionsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<CommissionEntry[]>(demoEntries);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    async function fetchCommissions() {
      try {
        const { data: ambassador } = await supabase
          .from('ambassadors')
          .select('id')
          .eq('user_id', user!.id)
          .single();

        if (ambassador) {
          const { data } = await supabase
            .from('commission_entries')
            .select('*')
            .eq('ambassador_id', ambassador.id)
            .order('created_at', { ascending: false });

          if (data && data.length > 0) {
            setEntries(data);
          }
        }
      } catch {
        // Keep demo data
      } finally {
        setLoading(false);
      }
    }

    fetchCommissions();
  }, [user]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const filtered = entries.filter((e) => {
    const matchesType = typeFilter === 'all' || e.commission_type === typeFilter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesType && matchesStatus;
  });

  const now = new Date();
  const thisMonth = entries.filter((e) => {
    const d = new Date(e.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const totalEarned = entries.reduce((s, e) => e.status === 'paid' ? s + e.commission_amount : s, 0);
  const totalPending = entries.reduce((s, e) => e.status === 'pending' ? s + e.commission_amount : s, 0);
  const thisMonthTotal = thisMonth.reduce((s, e) => s + e.commission_amount, 0);

  const summaryCards = [
    { label: 'Total Earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { label: 'Pending', value: formatCurrency(totalPending), icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Paid Out', value: formatCurrency(totalEarned), icon: CheckCircle, color: 'bg-blue-50 text-blue-600' },
    { label: 'This Month', value: formatCurrency(thisMonthTotal), icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  ];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-50 text-green-700',
      pending: 'bg-amber-50 text-amber-700',
      cancelled: 'bg-red-50 text-red-600',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const typeBadge = (type: string) => {
    const styles: Record<string, string> = {
      membership: 'bg-blue-50 text-blue-700',
      fundraising: 'bg-purple-50 text-purple-700',
      advertising: 'bg-orange-50 text-orange-700',
      supplier: 'bg-teal-50 text-teal-700',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[type] || 'bg-gray-100 text-gray-600'}`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-[#5DB347]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1B2A4A]">Commission History</h1>
        <p className="text-gray-500 text-sm mt-1">View all your earned commissions and their statuses.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs text-gray-500 mb-1">{card.label}</p>
              <p className="text-xl font-bold text-[#1B2A4A]">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white appearance-none"
          >
            <option value="all">All Types</option>
            <option value="membership">Membership</option>
            <option value="fundraising">Fundraising</option>
            <option value="advertising">Advertising</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#5DB347]/30 focus:border-[#5DB347] bg-white appearance-none"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Commission Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Date</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Type</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Description</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Source Amount</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Rate</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">Commission</th>
                <th className="text-left px-5 py-3 font-semibold text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No commission entries found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((e) => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(e.created_at)}</td>
                    <td className="px-5 py-3">{typeBadge(e.commission_type)}</td>
                    <td className="px-5 py-3 font-medium text-[#1B2A4A] max-w-[200px] truncate">{e.description}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{formatCurrency(e.source_amount)}</td>
                    <td className="px-5 py-3 text-right text-gray-600">{(e.rate * 100).toFixed(0)}%</td>
                    <td className="px-5 py-3 text-right font-bold text-[#5DB347]">{formatCurrency(e.commission_amount)}</td>
                    <td className="px-5 py-3">{statusBadge(e.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filtered.length} of {entries.length} entries
        </div>
      </motion.div>
    </div>
  );
}
