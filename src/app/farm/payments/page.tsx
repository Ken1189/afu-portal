'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Download,
  FileText,
  Receipt,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  Hash,
  ShoppingCart,
  Shield,
  Landmark,
  Wrench,
  Users,
  Truck,
  Leaf,
  Sprout,
  Gift,
  CircleDollarSign,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  Plus,
  Minus,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// ---------------------------------------------------------------------------
// Brand Colors
// ---------------------------------------------------------------------------
const COLORS = {
  navy: '#1B2A4A',
  teal: '#2AA198',
  tealDark: '#1A7A72',
  gold: '#D4A843',
  cream: '#F9FAFB',
};

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, ease: 'easeOut' as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring' as const, stiffness: 200, damping: 20 },
  },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type TransactionType = 'debit' | 'credit';
type TransactionStatus = 'completed' | 'pending' | 'failed';
type TransactionCategory =
  | 'Marketplace'
  | 'Insurance Premium'
  | 'Loan Repayment'
  | 'Equipment Rental'
  | 'Cooperative'
  | 'Transport'
  | 'Input Purchase'
  | 'Harvest Sale'
  | 'Subsidy';
type PaymentMethod = 'EcoCash' | 'M-Pesa' | 'Bank Transfer' | 'Card' | 'Cash' | 'USSD';
type TimePeriod = 'This Month' | 'Last 3 Months' | 'This Year' | 'All Time';
type FilterTab = 'All' | 'Credits' | 'Debits' | 'Pending';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  reference: string;
}

// ---------------------------------------------------------------------------
// Category Config
// ---------------------------------------------------------------------------
const categoryConfig: Record<
  TransactionCategory,
  { icon: typeof Wallet; color: string; bg: string }
> = {
  Marketplace: { icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
  'Insurance Premium': { icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100' },
  'Loan Repayment': { icon: Landmark, color: 'text-orange-600', bg: 'bg-orange-100' },
  'Equipment Rental': { icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100' },
  Cooperative: { icon: Users, color: 'text-teal-600', bg: 'bg-teal-100' },
  Transport: { icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  'Input Purchase': { icon: Sprout, color: 'text-green-600', bg: 'bg-green-100' },
  'Harvest Sale': { icon: Leaf, color: 'text-amber-600', bg: 'bg-amber-100' },
  Subsidy: { icon: Gift, color: 'text-rose-600', bg: 'bg-rose-100' },
};

const paymentMethodIcons: Record<PaymentMethod, typeof Wallet> = {
  EcoCash: Smartphone,
  'M-Pesa': Smartphone,
  'Bank Transfer': Building2,
  Card: CreditCard,
  Cash: Banknote,
  USSD: Hash,
};

const statusConfig: Record<TransactionStatus, { label: string; class: string }> = {
  completed: { label: 'Completed', class: 'bg-green-100 text-green-700' },
  pending: { label: 'Pending', class: 'bg-yellow-100 text-yellow-700' },
  failed: { label: 'Failed', class: 'bg-red-100 text-red-700' },
};

// ---------------------------------------------------------------------------
// Mock Transactions (25+)
// ---------------------------------------------------------------------------
const mockTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2026-03-15', description: 'Maize seeds — 50kg bag x3', amount: 245, type: 'debit', category: 'Input Purchase', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-EC-90312' },
  { id: 'TXN-002', date: '2026-03-14', description: 'Tomato harvest sold to Harare Fresh Market', amount: 1820, type: 'credit', category: 'Harvest Sale', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-BK-44201' },
  { id: 'TXN-003', date: '2026-03-13', description: 'Monthly crop insurance premium', amount: 68, type: 'debit', category: 'Insurance Premium', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-IN-55930' },
  { id: 'TXN-004', date: '2026-03-12', description: 'Tractor rental — land preparation (2 ha)', amount: 320, type: 'debit', category: 'Equipment Rental', paymentMethod: 'M-Pesa', status: 'completed', reference: 'REF-EQ-77812' },
  { id: 'TXN-005', date: '2026-03-11', description: 'Cooperative monthly contribution', amount: 50, type: 'debit', category: 'Cooperative', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-CO-33109' },
  { id: 'TXN-006', date: '2026-03-10', description: 'Loan repayment — Input Finance #L-2024-001', amount: 375, type: 'debit', category: 'Loan Repayment', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-LN-22014' },
  { id: 'TXN-007', date: '2026-03-09', description: 'Transport — 2 tonnes maize to Bulawayo depot', amount: 180, type: 'debit', category: 'Transport', paymentMethod: 'Cash', status: 'completed', reference: 'REF-TR-66482' },
  { id: 'TXN-008', date: '2026-03-08', description: 'Sold onions via AFU Marketplace', amount: 540, type: 'credit', category: 'Marketplace', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-MK-11294' },
  { id: 'TXN-009', date: '2026-03-07', description: 'Government input subsidy received', amount: 400, type: 'credit', category: 'Subsidy', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-SB-88023' },
  { id: 'TXN-010', date: '2026-03-06', description: 'Fertilizer purchase — NPK 50kg x5', amount: 310, type: 'debit', category: 'Input Purchase', paymentMethod: 'USSD', status: 'completed', reference: 'REF-IP-44190' },
  { id: 'TXN-011', date: '2026-03-05', description: 'Livestock insurance premium — cattle', amount: 95, type: 'debit', category: 'Insurance Premium', paymentMethod: 'M-Pesa', status: 'pending', reference: 'REF-IN-55931' },
  { id: 'TXN-012', date: '2026-03-04', description: 'Cooperative dividend payout — Q1', amount: 230, type: 'credit', category: 'Cooperative', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-CO-33210' },
  { id: 'TXN-013', date: '2026-03-03', description: 'Irrigation pump rental — 1 week', amount: 150, type: 'debit', category: 'Equipment Rental', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-EQ-77900' },
  { id: 'TXN-014', date: '2026-03-02', description: 'Groundnut sale to processing plant', amount: 960, type: 'credit', category: 'Harvest Sale', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-HS-20193' },
  { id: 'TXN-015', date: '2026-03-01', description: 'Transport — fresh produce to Mutare market', amount: 120, type: 'debit', category: 'Transport', paymentMethod: 'M-Pesa', status: 'failed', reference: 'REF-TR-66510' },
  { id: 'TXN-016', date: '2026-02-28', description: 'Marketplace order — drip irrigation kit', amount: 480, type: 'debit', category: 'Marketplace', paymentMethod: 'Card', status: 'completed', reference: 'REF-MK-11305' },
  { id: 'TXN-017', date: '2026-02-26', description: 'Soybean harvest sold — 4 tonnes', amount: 2400, type: 'credit', category: 'Harvest Sale', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-HS-20210' },
  { id: 'TXN-018', date: '2026-02-24', description: 'Loan repayment — Working Capital #L-2023-014', amount: 250, type: 'debit', category: 'Loan Repayment', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-LN-22030' },
  { id: 'TXN-019', date: '2026-02-22', description: 'Pesticide spray service', amount: 85, type: 'debit', category: 'Input Purchase', paymentMethod: 'Cash', status: 'completed', reference: 'REF-IP-44220' },
  { id: 'TXN-020', date: '2026-02-20', description: 'Monthly crop insurance premium', amount: 68, type: 'debit', category: 'Insurance Premium', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-IN-55920' },
  { id: 'TXN-021', date: '2026-02-18', description: 'Sold vegetables at farm gate', amount: 310, type: 'credit', category: 'Marketplace', paymentMethod: 'Cash', status: 'completed', reference: 'REF-MK-11320' },
  { id: 'TXN-022', date: '2026-02-15', description: 'Cooperative emergency levy', amount: 25, type: 'debit', category: 'Cooperative', paymentMethod: 'USSD', status: 'completed', reference: 'REF-CO-33250' },
  { id: 'TXN-023', date: '2026-02-12', description: 'Combine harvester hire — wheat', amount: 550, type: 'debit', category: 'Equipment Rental', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-EQ-78001' },
  { id: 'TXN-024', date: '2026-02-10', description: 'Wheat sale — 6 tonnes to GMB', amount: 3600, type: 'credit', category: 'Harvest Sale', paymentMethod: 'Bank Transfer', status: 'pending', reference: 'REF-HS-20240' },
  { id: 'TXN-025', date: '2026-02-08', description: 'Transport — livestock to auction', amount: 200, type: 'debit', category: 'Transport', paymentMethod: 'EcoCash', status: 'completed', reference: 'REF-TR-66550' },
  { id: 'TXN-026', date: '2026-01-30', description: 'Seed potato purchase — 200kg', amount: 340, type: 'debit', category: 'Input Purchase', paymentMethod: 'M-Pesa', status: 'completed', reference: 'REF-IP-44280' },
  { id: 'TXN-027', date: '2026-01-25', description: 'Government drought relief subsidy', amount: 750, type: 'credit', category: 'Subsidy', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-SB-88040' },
  { id: 'TXN-028', date: '2026-01-20', description: 'Marketplace order — solar panel for borehole', amount: 890, type: 'debit', category: 'Marketplace', paymentMethod: 'Card', status: 'completed', reference: 'REF-MK-11340' },
  { id: 'TXN-029', date: '2026-01-15', description: 'Loan repayment — Equipment Lease #L-2025-003', amount: 420, type: 'debit', category: 'Loan Repayment', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-LN-22055' },
  { id: 'TXN-030', date: '2026-01-10', description: 'Tobacco sale — grade A leaf', amount: 4200, type: 'credit', category: 'Harvest Sale', paymentMethod: 'Bank Transfer', status: 'completed', reference: 'REF-HS-20300' },
];

// ---------------------------------------------------------------------------
// Monthly Spending Chart Data (last 6 months)
// ---------------------------------------------------------------------------
const monthlyChartData = [
  { month: 'Oct', Marketplace: 420, Insurance: 68, Loans: 375, Equipment: 200, Transport: 150, Inputs: 280, Cooperative: 50 },
  { month: 'Nov', Marketplace: 310, Insurance: 68, Loans: 375, Equipment: 350, Transport: 220, Inputs: 190, Cooperative: 50 },
  { month: 'Dec', Marketplace: 580, Insurance: 136, Loans: 625, Equipment: 150, Transport: 180, Inputs: 400, Cooperative: 75 },
  { month: 'Jan', Marketplace: 890, Insurance: 68, Loans: 420, Equipment: 0, Transport: 200, Inputs: 340, Cooperative: 50 },
  { month: 'Feb', Marketplace: 480, Insurance: 68, Loans: 250, Equipment: 550, Transport: 200, Inputs: 85, Cooperative: 25 },
  { month: 'Mar', Marketplace: 245, Insurance: 163, Loans: 375, Equipment: 470, Transport: 300, Inputs: 555, Cooperative: 50 },
];

const barColors = [COLORS.navy, '#7C3AED', COLORS.gold, '#64748B', '#6366F1', COLORS.teal, '#F59E0B'];

// ---------------------------------------------------------------------------
// Payment Methods Data
// ---------------------------------------------------------------------------
const paymentMethods = [
  { name: 'EcoCash', icon: Smartphone, balance: '$1,240', lastUsed: 'Today', gradient: 'from-green-500 to-green-700' },
  { name: 'M-Pesa', icon: Smartphone, balance: '$860', lastUsed: '2 days ago', gradient: 'from-emerald-500 to-teal-600' },
  { name: 'Bank Transfer', icon: Building2, balance: '$4,320', lastUsed: 'Yesterday', gradient: 'from-blue-500 to-blue-700' },
  { name: 'Card', icon: CreditCard, balance: '****4821', lastUsed: '5 days ago', gradient: 'from-purple-500 to-purple-700' },
  { name: 'Cash', icon: Banknote, balance: '-', lastUsed: '3 days ago', gradient: 'from-amber-500 to-orange-600' },
  { name: 'USSD', icon: Hash, balance: '-', lastUsed: '1 week ago', gradient: 'from-slate-500 to-slate-700' },
];

// ---------------------------------------------------------------------------
// EcoCash Recent Transactions
// ---------------------------------------------------------------------------
const ecocashRecent = [
  { id: 'EC-1', desc: 'Seeds purchase — Agrimark', amount: -245, time: '2h ago' },
  { id: 'EC-2', desc: 'Marketplace sale received', amount: 540, time: '5h ago' },
  { id: 'EC-3', desc: 'Insurance premium auto-debit', amount: -68, time: '1d ago' },
  { id: 'EC-4', desc: 'Cooperative dividend received', amount: 230, time: '2d ago' },
  { id: 'EC-5', desc: 'Loan repayment', amount: -375, time: '4d ago' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function PaymentHistoryPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('All Time');
  const [filterTab, setFilterTab] = useState<FilterTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Filter transactions based on time, tab, and search
  const filteredTransactions = useMemo(() => {
    let txns = [...mockTransactions];

    // Time period filter
    const now = new Date('2026-03-16');
    if (timePeriod === 'This Month') {
      txns = txns.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (timePeriod === 'Last 3 Months') {
      const cutoff = new Date(now);
      cutoff.setMonth(cutoff.getMonth() - 3);
      txns = txns.filter((t) => new Date(t.date) >= cutoff);
    } else if (timePeriod === 'This Year') {
      txns = txns.filter((t) => new Date(t.date).getFullYear() === now.getFullYear());
    }

    // Tab filter
    if (filterTab === 'Credits') txns = txns.filter((t) => t.type === 'credit');
    else if (filterTab === 'Debits') txns = txns.filter((t) => t.type === 'debit');
    else if (filterTab === 'Pending') txns = txns.filter((t) => t.status === 'pending');

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      txns = txns.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.reference.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    return txns;
  }, [timePeriod, filterTab, searchQuery]);

  // Summary KPIs
  const summary = useMemo(() => {
    const all = mockTransactions;
    const totalSpent = all.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
    const totalReceived = all.filter((t) => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
    const pending = all.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0);
    return { totalSpent, totalReceived, pending, net: totalReceived - totalSpent };
  }, []);

  const timePeriods: TimePeriod[] = ['This Month', 'Last 3 Months', 'This Year', 'All Time'];
  const filterTabs: FilterTab[] = ['All', 'Credits', 'Debits', 'Pending'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#F0FDFA]">
      <motion.div
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                           */}
        {/* ---------------------------------------------------------------- */}
        <motion.div variants={cardVariants} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl shadow-lg"
                style={{ background: `linear-gradient(135deg, ${COLORS.navy}, ${COLORS.teal})` }}
              >
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ color: COLORS.navy }}>
                  Payment History
                </h1>
                <p className="text-sm text-gray-500">Track all your transactions across AFU services</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <a
                href="/farm/payments/checkout"
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md min-h-[44px]"
                style={{ backgroundColor: COLORS.teal }}
              >
                <Plus className="h-4 w-4" />
                Make Payment
              </a>

            {/* Time period selector */}
            <div className="relative">
              <button
                onClick={() => setShowTimePicker(!showTimePicker)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:border-[#2AA198] hover:shadow-md"
                style={{ color: COLORS.navy }}
              >
                <Clock className="h-4 w-4 text-gray-400" />
                {timePeriod}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              <AnimatePresence>
                {showTimePicker && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ type: 'spring' as const, stiffness: 300, damping: 25 }}
                    className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl"
                  >
                    {timePeriods.map((tp) => (
                      <button
                        key={tp}
                        onClick={() => { setTimePeriod(tp); setShowTimePicker(false); }}
                        className={`block w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          timePeriod === tp
                            ? 'bg-[#2AA198]/10 font-semibold text-[#1A7A72]'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {tp}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Summary KPI Cards                                                */}
        {/* ---------------------------------------------------------------- */}
        <motion.div variants={cardVariants} className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Spent */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-red-50 opacity-60 transition-transform group-hover:scale-125" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Total Spent</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                  <ArrowDownRight className="h-5 w-5 text-red-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalSpent)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                <TrendingDown className="h-3 w-3" /> Across all debits
              </p>
            </div>
          </motion.div>

          {/* Total Received */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-green-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-green-50 opacity-60 transition-transform group-hover:scale-125" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-500">Total Received</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                  <ArrowUpRight className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalReceived)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-green-500">
                <TrendingUp className="h-3 w-3" /> Across all credits
              </p>
            </div>
          </motion.div>

          {/* Pending */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-yellow-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-yellow-50 opacity-60 transition-transform group-hover:scale-125" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500">Pending</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(summary.pending)}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-yellow-500">
                <RefreshCw className="h-3 w-3" /> Awaiting confirmation
              </p>
            </div>
          </motion.div>

          {/* Net Balance */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group relative overflow-hidden rounded-2xl border border-teal-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg"
          >
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-teal-50 opacity-60 transition-transform group-hover:scale-125" />
            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-500">Net Balance</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100">
                  <CircleDollarSign className="h-5 w-5 text-teal-600" />
                </div>
              </div>
              <p className="text-2xl font-bold" style={{ color: COLORS.tealDark }}>
                {formatCurrency(summary.net)}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-teal-500">
                <TrendingUp className="h-3 w-3" /> Credits minus debits
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Payment Methods                                                  */}
        {/* ---------------------------------------------------------------- */}
        <motion.div variants={cardVariants} className="mb-8">
          <h2 className="mb-4 text-lg font-bold" style={{ color: COLORS.navy }}>
            Payment Methods
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {paymentMethods.map((pm, i) => {
              const Icon = pm.icon;
              return (
                <motion.div
                  key={pm.name}
                  variants={cardVariants}
                  whileHover={{ y: -4, scale: 1.03, transition: { duration: 0.2 } }}
                  className="cursor-pointer overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100 transition-shadow hover:shadow-lg"
                >
                  <div className={`bg-gradient-to-br ${pm.gradient} px-3 py-2.5`}>
                    <Icon className="h-5 w-5 text-white/90" />
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="text-xs font-bold text-gray-800 truncate">{pm.name}</p>
                    <p className="text-[11px] font-semibold text-gray-600">{pm.balance}</p>
                    <p className="text-[10px] text-gray-400">{pm.lastUsed}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Transaction List                                                  */}
        {/* ---------------------------------------------------------------- */}
        <motion.div variants={cardVariants} className="mb-8">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Filter tabs */}
              <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilterTab(tab)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                      filterTab === tab
                        ? 'bg-white text-[#1B2A4A] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:border-[#2AA198] focus:bg-white focus:ring-2 focus:ring-[#2AA198]/20 sm:w-64"
                />
              </div>
            </div>

            {/* Transaction items */}
            <div className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredTransactions.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 text-gray-400"
                  >
                    <Search className="mb-3 h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium">No transactions found</p>
                    <p className="text-xs">Try adjusting your filters or search query</p>
                  </motion.div>
                ) : (
                  filteredTransactions.map((txn) => {
                    const catCfg = categoryConfig[txn.category];
                    const CatIcon = catCfg.icon;
                    const PmIcon = paymentMethodIcons[txn.paymentMethod];
                    const sCfg = statusConfig[txn.status];
                    const isCredit = txn.type === 'credit';

                    return (
                      <motion.div
                        key={txn.id}
                        layout
                        variants={listItemVariants}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, x: 12, transition: { duration: 0.15 } }}
                        className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/80 sm:gap-4 sm:px-5"
                      >
                        {/* Category icon */}
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${catCfg.bg}`}>
                          <CatIcon className={`h-5 w-5 ${catCfg.color}`} />
                        </div>

                        {/* Description */}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-[#1B2A4A]">
                            {txn.description}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-gray-400">
                            <span>{formatDate(txn.date)}</span>
                            <span className="hidden sm:inline">|</span>
                            <span className="hidden sm:inline">{txn.reference}</span>
                            <span className="hidden sm:inline">|</span>
                            <span className="hidden items-center gap-1 sm:inline-flex">
                              <PmIcon className="h-3 w-3" />
                              {txn.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="hidden sm:block">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${sCfg.class}`}>
                            {txn.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                            {txn.status === 'pending' && <Clock className="h-3 w-3" />}
                            {txn.status === 'failed' && <XCircle className="h-3 w-3" />}
                            {sCfg.label}
                          </span>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <p className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
                            {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                          </p>
                          <span
                            className={`sm:hidden inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${sCfg.class}`}
                          >
                            {sCfg.label}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Footer count */}
            <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-400">
              Showing {filteredTransactions.length} of {mockTransactions.length} transactions
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Monthly Spending Chart                                           */}
        {/* ---------------------------------------------------------------- */}
        <motion.div variants={cardVariants} className="mb-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="mb-1 text-lg font-bold" style={{ color: COLORS.navy }}>
              Monthly Spending by Category
            </h2>
            <p className="mb-5 text-xs text-gray-400">Last 6 months of expenditure breakdown</p>
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value: string | number) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                      fontSize: '12px',
                    }}
                    formatter={(value) => `$${value}`}
                    cursor={{ fill: 'rgba(42,161,152,0.06)' }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  />
                  <Bar dataKey="Marketplace" stackId="a" fill={barColors[0]} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Insurance" stackId="a" fill={barColors[1]} />
                  <Bar dataKey="Loans" stackId="a" fill={barColors[2]} />
                  <Bar dataKey="Equipment" stackId="a" fill={barColors[3]} />
                  <Bar dataKey="Transport" stackId="a" fill={barColors[4]} />
                  <Bar dataKey="Inputs" stackId="a" fill={barColors[5]} />
                  <Bar dataKey="Cooperative" stackId="a" fill={barColors[6]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Quick Actions + EcoCash — Two-column layout                      */}
        {/* ---------------------------------------------------------------- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Quick Actions */}
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-4 text-lg font-bold" style={{ color: COLORS.navy }}>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Pay Premium', icon: Shield, gradient: 'from-purple-500 to-purple-700', desc: 'Insurance payment' },
                  { label: 'Repay Loan', icon: Landmark, gradient: 'from-orange-500 to-red-500', desc: 'Loan installment' },
                  { label: 'Download Statement', icon: Download, gradient: 'from-blue-500 to-indigo-600', desc: 'PDF / CSV export' },
                  { label: 'Request Receipt', icon: Receipt, gradient: 'from-teal-500 to-emerald-600', desc: 'Transaction proof' },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="group flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-4 text-center transition-all hover:border-gray-200 hover:bg-white hover:shadow-md"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{action.label}</p>
                        <p className="text-[10px] text-gray-400">{action.desc}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* EcoCash Mobile Money Section */}
          <motion.div variants={cardVariants} className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              {/* EcoCash balance card */}
              <div className="relative overflow-hidden bg-gradient-to-br from-green-500 via-green-600 to-emerald-700 px-5 py-5 sm:px-6">
                {/* Decorative circles */}
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
                <div className="absolute right-12 bottom-2 h-16 w-16 rounded-full bg-white/5" />

                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                      <Smartphone className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-bold text-white/90">EcoCash</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-green-100/80 tracking-wide uppercase">Available Balance</p>
                  <p className="mt-0.5 text-3xl font-extrabold text-white tracking-tight">$1,240.00</p>
                  <p className="mt-1 text-[11px] text-green-100/70">+263 77 *** **89</p>
                </div>
              </div>

              {/* Recent mobile money transactions */}
              <div className="px-5 py-4 sm:px-6">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-700">Recent Activity</h3>
                  <span className="text-[10px] font-medium text-gray-400">Last 5</span>
                </div>
                <div className="space-y-2.5">
                  {ecocashRecent.map((tx) => (
                    <motion.div
                      key={tx.id}
                      variants={listItemVariants}
                      className="flex items-center justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                            tx.amount > 0 ? 'bg-green-100' : 'bg-red-50'
                          }`}
                        >
                          {tx.amount > 0 ? (
                            <Plus className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Minus className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-700">{tx.desc}</p>
                          <p className="text-[10px] text-gray-400">{tx.time}</p>
                        </div>
                      </div>
                      <p className={`text-xs font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Top Up / Withdraw buttons */}
                <div className="mt-4 flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white shadow-md transition-shadow hover:shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.tealDark})` }}
                  >
                    <Plus className="h-4 w-4" />
                    Top Up
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white py-2.5 text-xs font-bold text-gray-700 transition-all hover:border-gray-300 hover:shadow-md"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom spacing */}
        <div className="h-8" />
      </motion.div>
    </div>
  );
}
