'use client';

import { useState, useMemo, useEffect } from 'react';
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
// ── Inline types & fallback data (formerly from @/lib/data/payments) ────────

interface PaymentRecord {
  id: string;
  memberId: string;
  memberName: string;
  type: 'loan-repayment' | 'membership-fee' | 'input-purchase' | 'insurance-premium' | 'equipment-rental' | 'transport' | 'commission-payout' | 'subscription';
  method: 'mobile-money' | 'bank-transfer' | 'cash' | 'card' | 'ussd';
  provider: string;
  amount: number;
  currency: string;
  reference: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  date: string;
  relatedId: string;
  description: string;
}

const FALLBACK_PAYMENTS: PaymentRecord[] = [
  { id: 'PAY-001', memberId: 'AFU-2024-001', memberName: 'Kgosi Mosweu', type: 'loan-repayment', method: 'mobile-money', provider: 'Orange Money', amount: 2200, currency: 'USD', reference: 'OM-BW-20250915-7823', status: 'completed', date: '2025-09-15', relatedId: 'FIN-2024-003', description: 'Monthly loan repayment for input bundle financing - maize season 2025' },
  { id: 'PAY-002', memberId: 'AFU-2024-003', memberName: 'Tendai Moyo', type: 'input-purchase', method: 'mobile-money', provider: 'Mobile Money', amount: 960, currency: 'USD', reference: 'EC-ZW-20251002-4512', status: 'completed', date: '2025-10-02', relatedId: 'ORD-2025-0489', description: 'Purchase of Hybrid Maize Seed (PAN 4M-21) x 20 bags from Kalahari Seeds' },
  { id: 'PAY-003', memberId: 'AFU-2024-036', memberName: 'Thabo Molefe', type: 'loan-repayment', method: 'bank-transfer', provider: 'FNB', amount: 14800, currency: 'USD', reference: 'FNB-BW-20251015-9034', status: 'completed', date: '2025-10-15', relatedId: 'FIN-2024-001', description: 'Working capital loan monthly instalment - blueberry farming operations' },
  { id: 'PAY-004', memberId: 'AFU-2024-005', memberName: 'Baraka Mfaume', type: 'membership-fee', method: 'mobile-money', provider: 'M-Pesa', amount: 50, currency: 'USD', reference: 'MP-TZ-20251101-2234', status: 'completed', date: '2025-11-01', relatedId: 'MEM-2025-ANNUAL', description: 'Annual AFU membership renewal - commercial tier' },
  { id: 'PAY-005', memberId: 'AFU-2024-002', memberName: 'Naledi Sekgoma', type: 'insurance-premium', method: 'mobile-money', provider: 'Orange Money', amount: 85, currency: 'USD', reference: 'OM-BW-20251112-5567', status: 'completed', date: '2025-11-12', relatedId: 'INS-2025-0234', description: 'Seasonal crop insurance premium - sorghum and groundnut coverage' },
  { id: 'PAY-006', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', type: 'loan-repayment', method: 'bank-transfer', provider: 'Stanbic', amount: 18500, currency: 'USD', reference: 'STB-ZW-20251120-7891', status: 'completed', date: '2025-11-20', relatedId: 'FIN-2024-002', description: 'Invoice finance repayment - tobacco export proceeds' },
  { id: 'PAY-007', memberId: 'AFU-2024-008', memberName: 'Grace Kimaro', type: 'input-purchase', method: 'mobile-money', provider: 'M-Pesa', amount: 3600, currency: 'USD', reference: 'MP-TZ-20251201-3345', status: 'completed', date: '2025-12-01', relatedId: 'ORD-2025-0678', description: 'Organic Compost Blend (Kilimanjaro Mix) x 200 bags for cooperative' },
  { id: 'PAY-008', memberId: 'SUP-001', memberName: 'Zambezi Agri-Supplies', type: 'commission-payout', method: 'bank-transfer', provider: 'Stanbic', amount: 312, currency: 'USD', reference: 'STB-ZW-20251015-CP01', status: 'completed', date: '2025-10-15', relatedId: 'COM-001', description: 'Commission payout for groundnut seed order - Kgosi Mosweu' },
  { id: 'PAY-009', memberId: 'SUP-002', memberName: 'Kalahari Seeds Co.', type: 'commission-payout', method: 'bank-transfer', provider: 'FNB', amount: 67.20, currency: 'USD', reference: 'FNB-BW-20251102-CP02', status: 'completed', date: '2025-11-02', relatedId: 'COM-002', description: 'Commission payout for hybrid maize seed order - Tendai Moyo' },
  { id: 'PAY-010', memberId: 'AFU-2024-010', memberName: 'Sipho Dlamini', type: 'equipment-rental', method: 'mobile-money', provider: 'Mobile Money', amount: 450, currency: 'USD', reference: 'EC-ZW-20251210-8901', status: 'completed', date: '2025-12-10', relatedId: 'RENT-2025-0067', description: 'Walk-behind tractor rental - 2 week hire for land preparation' },
  { id: 'PAY-024', memberId: 'AFU-2024-001', memberName: 'Kgosi Mosweu', type: 'loan-repayment', method: 'mobile-money', provider: 'Orange Money', amount: 2200, currency: 'USD', reference: 'OM-BW-20260310-2234', status: 'completed', date: '2026-03-10', relatedId: 'FIN-2024-003', description: 'Monthly loan repayment for input bundle financing - instalment 4 of 6' },
  { id: 'PAY-029', memberId: 'AFU-2024-036', memberName: 'Thabo Molefe', type: 'loan-repayment', method: 'bank-transfer', provider: 'FNB', amount: 14800, currency: 'USD', reference: 'FNB-BW-20260315-9901', status: 'pending', date: '2026-03-15', relatedId: 'FIN-2024-001', description: 'Working capital loan instalment - due today, processing via bank transfer' },
  { id: 'PAY-030', memberId: 'AFU-2024-003', memberName: 'Tendai Moyo', type: 'input-purchase', method: 'mobile-money', provider: 'Mobile Money', amount: 1500, currency: 'USD', reference: 'EC-ZW-20260312-3345', status: 'pending', date: '2026-03-12', relatedId: 'ORD-2026-0156', description: 'Export-Grade Produce Cartons x 20 packs from Ngorongoro Packaging' },
  { id: 'PAY-035', memberId: 'AFU-2024-009', memberName: 'Rumbidzai Maphosa', type: 'loan-repayment', method: 'mobile-money', provider: 'Mobile Money', amount: 4500, currency: 'USD', reference: 'EC-ZW-20260228-5534', status: 'failed', date: '2026-02-28', relatedId: 'FIN-2024-008', description: 'Loan repayment failed - insufficient Mobile Money balance. Retry scheduled.' },
  { id: 'PAY-036', memberId: 'AFU-2024-016', memberName: 'Sibongile Ncube', type: 'input-purchase', method: 'mobile-money', provider: 'Mobile Money', amount: 780, currency: 'USD', reference: 'EC-ZW-20260305-6601', status: 'failed', date: '2026-03-05', relatedId: 'ORD-2026-0167', description: 'Seed purchase failed - mobile money network timeout. Customer notified.' },
  { id: 'PAY-037', memberId: 'AFU-2024-028', memberName: 'Kelebogile Setlhare', type: 'insurance-premium', method: 'ussd', provider: 'Orange Money', amount: 65, currency: 'USD', reference: 'USSD-BW-20260310-7745', status: 'failed', date: '2026-03-10', relatedId: 'INS-2026-0089', description: 'Insurance premium payment failed - USSD session expired. Pending retry.' },
  { id: 'PAY-038', memberId: 'AFU-2024-037', memberName: 'Rudo Chidyamakono', type: 'loan-repayment', method: 'bank-transfer', provider: 'Stanbic', amount: 18500, currency: 'USD', reference: 'STB-ZW-20260220-REV1', status: 'reversed', date: '2026-02-20', relatedId: 'FIN-2024-002', description: 'Bank transfer reversed - duplicate payment detected. Refund processed.' },
  { id: 'PAY-039', memberId: 'AFU-2024-001', memberName: 'Kgosi Mosweu', type: 'input-purchase', method: 'cash', provider: 'FNB', amount: 225, currency: 'USD', reference: 'CASH-BW-20260312-0012', status: 'completed', date: '2026-03-12', relatedId: 'ORD-2026-0265', description: 'Cash deposit at FNB branch for fertilizer order collection at depot' },
  { id: 'PAY-040', memberId: 'SUP-019', memberName: 'Mmegi Digital Agriculture', type: 'commission-payout', method: 'bank-transfer', provider: 'FNB', amount: 840, currency: 'USD', reference: 'FNB-BW-20260315-CP26', status: 'pending', date: '2026-03-15', relatedId: 'COM-026', description: 'Commission payout for FarmTrack Pro bulk license order - AFU Botswana Chapter' },
];

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
  'mobile-money': '#8CB89C',
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

// ── DB → UI mappers ───────────────────────────────────────────────────────

function mapMethod(raw: string): PaymentRecord['method'] {
  const m = raw.toLowerCase().replace(/[\s_]+/g, '-');
  if (['mobile-money', 'bank-transfer', 'cash', 'card', 'ussd'].includes(m))
    return m as PaymentRecord['method'];
  if (m.includes('mobile') || m.includes('mpesa') || m.includes('mobile_money') || m.includes('orange'))
    return 'mobile-money';
  if (m.includes('bank')) return 'bank-transfer';
  return 'mobile-money';
}

function mapStatus(raw: string): PaymentRecord['status'] {
  const s = raw.toLowerCase();
  if (['completed', 'pending', 'failed', 'reversed'].includes(s))
    return s as PaymentRecord['status'];
  if (s === 'success' || s === 'paid') return 'completed';
  if (s === 'refunded') return 'reversed';
  return 'pending';
}

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
  const [payments, setPayments] = useState<PaymentRecord[]>(FALLBACK_PAYMENTS);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live payments from Supabase
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('id, order_id, member_id, amount, currency, method, status, reference, created_at, profiles:member_id(full_name)')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setPayments(FALLBACK_PAYMENTS);
        } else {
          const mapped: PaymentRecord[] = data.map((row: Record<string, unknown>) => {
            const profile = row.profiles as Record<string, unknown> | null;
            return {
              id: String(row.id ?? ''),
              memberId: String(row.member_id ?? ''),
              memberName: String(profile?.full_name ?? 'Unknown'),
              type: (String(row.method ?? 'subscription')) as PaymentRecord['type'],
              method: mapMethod(String(row.method ?? '')),
              provider: String(row.method ?? ''),
              amount: Number(row.amount ?? 0),
              currency: String(row.currency ?? 'USD'),
              reference: String(row.reference ?? ''),
              status: mapStatus(String(row.status ?? '')),
              date: row.created_at ? new Date(String(row.created_at)).toISOString().slice(0, 10) : '',
              relatedId: String(row.order_id ?? ''),
              description: '',
            };
          });
          setPayments(mapped);
        }
      } catch {
        setPayments(FALLBACK_PAYMENTS);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Update payment status in Supabase (approve / refund)
  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from('payments')
      .update({ status: newStatus })
      .eq('id', paymentId);
    if (!error) {
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus as PaymentRecord['status'] } : p))
      );
    }
  };

  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handlePaymentAction = async (paymentId: string, action: 'refunded' | 'verified') => {
    setActionLoading(paymentId);
    await updatePaymentStatus(paymentId, action === 'verified' ? 'completed' : 'reversed');
    setActionLoading(null);
  };

  // ── Computed stats ────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () => payments.filter((p) => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const pendingTotal = useMemo(
    () => payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const failedTotal = useMemo(
    () => payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const reversedTotal = useMemo(
    () => payments.filter((p) => p.status === 'reversed').reduce((sum, p) => sum + p.amount, 0),
    [payments]
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
  }, [payments]);

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
          onClick={() => {
            const headers = ['ID', 'Member', 'Type', 'Method', 'Provider', 'Amount', 'Currency', 'Reference', 'Status', 'Date', 'Description'];
            const rows = filteredPayments.map(p => [
              p.id, p.memberName, p.type, p.method, p.provider,
              p.amount.toFixed(2), p.currency, p.reference, p.status, p.date, p.description
            ]);
            const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `afu-payments-${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
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
                  stroke="#8CB89C"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  name="Revenue"
                  dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                  activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
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
                <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
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
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {payment.status === 'pending' && (
                          <button
                            onClick={() => handlePaymentAction(payment.id, 'verified')}
                            disabled={actionLoading === payment.id}
                            className="px-2 py-1 text-[11px] font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === payment.id ? 'Processing...' : 'Verify'}
                          </button>
                        )}
                        {(payment.status === 'completed' || payment.status === 'pending') && (
                          <button
                            onClick={() => handlePaymentAction(payment.id, 'refunded')}
                            disabled={actionLoading === payment.id}
                            className="px-2 py-1 text-[11px] font-medium bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === payment.id ? 'Processing...' : 'Refund'}
                          </button>
                        )}
                      </div>
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
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
