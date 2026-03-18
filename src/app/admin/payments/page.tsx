'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  DollarSign,
  Clock,
  XCircle,
  RotateCcw,
  Search,
  Filter,
  Download,
  CreditCard,
  Smartphone,
  Building2,
  Banknote,
  Hash,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from 'lucide-react';
import { payments, type PaymentRecord } from '@/lib/data/payments';
import { createClient } from '@/lib/supabase/client';

// ── Animation variants ──────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 260,
      damping: 24,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Color / label maps ──────────────────────────────────────────────────────

const typeColors: Record<string, string> = {
  'loan-repayment': 'bg-blue-100 text-blue-700',
  'membership-fee': 'bg-purple-100 text-purple-700',
  'input-purchase': 'bg-green-100 text-green-700',
  'insurance-premium': 'bg-amber-100 text-amber-700',
  'equipment-rental': 'bg-orange-100 text-orange-700',
  'transport': 'bg-cyan-100 text-cyan-700',
  'commission-payout': 'bg-rose-100 text-rose-700',
  'subscription': 'bg-indigo-100 text-indigo-700',
};

const typeLabels: Record<string, string> = {
  'loan-repayment': 'Loan Repayment',
  'membership-fee': 'Membership',
  'input-purchase': 'Input Purchase',
  'insurance-premium': 'Insurance',
  'equipment-rental': 'Equipment Rental',
  'transport': 'Transport',
  'commission-payout': 'Commission',
  'subscription': 'Subscription',
};

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
  reversed: 'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  completed: 'Completed',
  pending: 'Pending',
  failed: 'Failed',
  reversed: 'Reversed',
};

const methodIcons: Record<string, React.ReactNode> = {
  'mobile-money': <Smartphone className="w-3.5 h-3.5" />,
  'bank-transfer': <Building2 className="w-3.5 h-3.5" />,
  card: <CreditCard className="w-3.5 h-3.5" />,
  cash: <Banknote className="w-3.5 h-3.5" />,
  ussd: <Hash className="w-3.5 h-3.5" />,
};

const methodLabels: Record<string, string> = {
  'mobile-money': 'Mobile Money',
  'bank-transfer': 'Bank Transfer',
  card: 'Card',
  cash: 'Cash',
  ussd: 'USSD',
};

const methodChartColors: Record<string, string> = {
  'mobile-money': '#2AA198',
  'bank-transfer': '#1B2A4A',
  card: '#D4A843',
  cash: '#6366F1',
  ussd: '#F97316',
};

// ── Monthly revenue mock data (6 months) ────────────────────────────────────

const monthlyRevenueData = [
  { month: 'Oct', revenue: 42500, transactions: 28 },
  { month: 'Nov', revenue: 55800, transactions: 35 },
  { month: 'Dec', revenue: 48200, transactions: 31 },
  { month: 'Jan', revenue: 61300, transactions: 38 },
  { month: 'Feb', revenue: 58900, transactions: 42 },
  { month: 'Mar', revenue: 67400, transactions: 45 },
];

// ── Custom tooltip ──────────────────────────────────────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 px-3 py-2 text-xs">
      <p className="font-semibold text-navy mb-1">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-600">{entry.name}:</span>
          <span className="font-medium text-navy">
            {entry.name === 'Transactions' ? entry.value : formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Items per page ──────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10;

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Computed stats ────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    []
  );

  const pendingTotal = useMemo(
    () => payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    []
  );

  const failedTotal = useMemo(
    () => payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
    []
  );

  const reversedTotal = useMemo(
    () => payments.filter((p) => p.status === 'reversed').reduce((sum, p) => sum + p.amount, 0),
    []
  );

  const pendingCount = payments.filter((p) => p.status === 'pending').length;
  const failedCount = payments.filter((p) => p.status === 'failed').length;
  const reversedCount = payments.filter((p) => p.status === 'reversed').length;

  // ── Revenue by method (donut data) ────────────────────────────────────

  const revenueByMethod = useMemo(() => {
    const map: Record<string, number> = {};
    payments
      .filter((p) => p.status === 'completed')
      .forEach((p) => {
        map[p.method] = (map[p.method] || 0) + p.amount;
      });
    return Object.entries(map).map(([method, amount]) => ({
      name: methodLabels[method] || method,
      value: amount,
      color: methodChartColors[method] || '#9CA3AF',
    }));
  }, []);

  // ── Filtered payments ─────────────────────────────────────────────────

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          p.memberName.toLowerCase().includes(q) ||
          p.reference.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q);
        if (!matchesSearch) return false;
      }
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (methodFilter !== 'all' && p.method !== methodFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (dateFrom && p.date < dateFrom) return false;
      if (dateTo && p.date > dateTo) return false;
      return true;
    });
  }, [searchQuery, typeFilter, methodFilter, statusFilter, dateFrom, dateTo]);

  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  // ── Stat cards ────────────────────────────────────────────────────────

  const statCards = [
    {
      label: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      subtitle: `${payments.filter((p) => p.status === 'completed').length} completed`,
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Pending Payments',
      value: formatCurrency(pendingTotal),
      subtitle: `${pendingCount} pending`,
      icon: <Clock className="w-5 h-5" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      label: 'Failed Payments',
      value: formatCurrency(failedTotal),
      subtitle: `${failedCount} failed`,
      icon: <XCircle className="w-5 h-5" />,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      label: 'Reversed',
      value: formatCurrency(reversedTotal),
      subtitle: `${reversedCount} reversed`,
      icon: <RotateCcw className="w-5 h-5" />,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  // ── Unique types and methods for dropdowns ────────────────────────────

  const uniqueTypes = [...new Set(payments.map((p) => p.type))];
  const uniqueMethods = [...new Set(payments.map((p) => p.method))];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payment Tracking</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Monitor all payments across the AFU platform
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-sm font-medium rounded-lg hover:bg-navy/90 transition-colors"
          onClick={() => alert('Export functionality coming soon')}
        >
          <Download className="w-4 h-4" />
          Export CSV
        </motion.button>
      </motion.div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            variants={cardVariants}
            whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
            className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Revenue by Method Donut */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Revenue by Payment Method</h3>
          <div className="h-64 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueByMethod}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {revenueByMethod.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px' }}
                  formatter={(value: string) => <span className="text-gray-600">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Monthly Revenue Trend */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <h3 className="font-semibold text-navy text-sm mb-4">Monthly Revenue Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2AA198" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2AA198" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => formatCurrency(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2AA198"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                  dot={{ fill: '#2AA198', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#2AA198', r: 5, strokeWidth: 2, stroke: '#fff' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-navy">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, reference, ID..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
            />
          </div>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => handleFilterChange(setTypeFilter)(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>{typeLabels[t] || t}</option>
            ))}
          </select>

          {/* Method */}
          <select
            value={methodFilter}
            onChange={(e) => handleFilterChange(setMethodFilter)(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Methods</option>
            {uniqueMethods.map((m) => (
              <option key={m} value={m}>{methodLabels[m] || m}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => handleFilterChange(setStatusFilter)(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="reversed">Reversed</option>
          </select>

          {/* Date range toggle */}
          <button
            onClick={() => {
              if (dateFrom || dateTo) {
                setDateFrom('');
                setDateTo('');
                setCurrentPage(1);
              }
            }}
            className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-lg text-sm px-3 py-2 hover:bg-gray-50 transition-colors text-gray-600"
          >
            <CalendarDays className="w-4 h-4" />
            {dateFrom || dateTo ? 'Clear Dates' : 'Date Range'}
          </button>
        </div>

        {/* Date range inputs */}
        <AnimatePresence>
          {(dateFrom !== '' || dateTo !== '' || true) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                <label className="text-xs text-gray-500">From:</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                />
                <label className="text-xs text-gray-500">To:</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  className="border border-gray-200 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal text-gray-700"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Payments Table ───────────────────────────────────────────────── */}
      <motion.div
        variants={fadeUp}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy text-sm">
            All Payments
            <span className="text-gray-400 font-normal ml-2">({filteredPayments.length} records)</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Method</th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-center py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Currency</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {paginatedPayments.map((payment) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-cream/50 transition-colors cursor-default"
                  >
                    <td className="py-2.5 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(payment.date)}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-navy text-sm">{payment.memberName}</span>
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${typeColors[payment.type] || 'bg-gray-100 text-gray-600'}`}>
                        {typeLabels[payment.type] || payment.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="text-gray-400">{methodIcons[payment.method]}</span>
                        <span className="whitespace-nowrap">{payment.provider}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-navy text-sm tabular-nums">
                      ${payment.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 text-center text-xs text-gray-500 font-mono">
                      {payment.currency}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[payment.status] || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[payment.status] || payment.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-xs font-mono text-gray-400 whitespace-nowrap">
                      {payment.reference.length > 20
                        ? payment.reference.slice(0, 20) + '...'
                        : payment.reference}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredPayments.length)} of {filteredPayments.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-navy text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
