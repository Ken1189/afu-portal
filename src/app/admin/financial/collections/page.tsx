'use client';

import { useState, useMemo, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Banknote,
  AlertTriangle,
  Clock,
  AlertCircle,
  XCircle,
  Search,
  ArrowUpDown,
  Phone,
  Mail,
  ChevronUp,
  ChevronDown,
  TriangleAlert,
  ArrowUpRight,
  Filter,
  Download,
  RefreshCw,
  Bell,
  PhoneCall,
  Send,
  ArrowRightLeft,
  TrendingUp,
  DollarSign,
  Target,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

// ── Animation variants ──────────────────────────────────────────────────────

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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

interface OverdueLoan {
  id: string;
  memberId: string;
  memberName: string;
  loanId: string;
  amount: number;
  outstandingAmount: number;
  daysOverdue: number;
  lastPaymentDate: string;
  lastPaymentAmount: number;
  status: 'reminder-sent' | 'escalated' | 'restructured' | 'no-contact' | 'promise-to-pay';
  country: string;
  phone: string;
  email: string;
  crop: string;
  loanType: string;
}

const overdueLoans: OverdueLoan[] = [
  { id: 'COL-001', memberId: 'AFU-2024-009', memberName: 'Tapiwa Ncube', loanId: 'FIN-2024-010', amount: 15000, outstandingAmount: 17250, daysOverdue: 98, lastPaymentDate: '2025-11-15', lastPaymentAmount: 0, status: 'escalated', country: 'Zimbabwe', phone: '+263 78 345 6789', email: 'tapiwa.ncube@email.com', crop: 'Cotton', loanType: 'Working Capital' },
  { id: 'COL-002', memberId: 'AFU-2024-015', memberName: 'Chenai Dziva', loanId: 'FIN-2024-021', amount: 5500, outstandingAmount: 6050, daysOverdue: 106, lastPaymentDate: '2025-10-25', lastPaymentAmount: 0, status: 'escalated', country: 'Zimbabwe', phone: '+263 77 567 8901', email: 'chenai.dziva@email.com', crop: 'Maize', loanType: 'Input Bundle' },
  { id: 'COL-003', memberId: 'AFU-2024-014', memberName: 'Onalenna Tshosa', loanId: 'FIN-2024-030', amount: 8200, outstandingAmount: 9430, daysOverdue: 67, lastPaymentDate: '2025-12-20', lastPaymentAmount: 1200, status: 'reminder-sent', country: 'Botswana', phone: '+267 76 789 012', email: 'onalenna.tshosa@email.com', crop: 'Sorghum', loanType: 'Working Capital' },
  { id: 'COL-004', memberId: 'AFU-2024-027', memberName: 'Nyasha Manyika', loanId: 'FIN-2024-031', amount: 6800, outstandingAmount: 7820, daysOverdue: 45, lastPaymentDate: '2026-01-10', lastPaymentAmount: 800, status: 'promise-to-pay', country: 'Zimbabwe', phone: '+263 77 901 2345', email: 'nyasha.manyika@email.com', crop: 'Tobacco', loanType: 'Input Bundle' },
  { id: 'COL-005', memberId: 'AFU-2024-034', memberName: 'Asha Mwambola', loanId: 'FIN-2024-032', amount: 4500, outstandingAmount: 5175, daysOverdue: 38, lastPaymentDate: '2026-01-25', lastPaymentAmount: 600, status: 'reminder-sent', country: 'Tanzania', phone: '+255 713 234 567', email: 'asha.mwambola@email.com', crop: 'Blueberries', loanType: 'Working Capital' },
  { id: 'COL-006', memberId: 'AFU-2024-007', memberName: 'Juma Omari', loanId: 'FIN-2024-033', amount: 3200, outstandingAmount: 3680, daysOverdue: 22, lastPaymentDate: '2026-02-05', lastPaymentAmount: 450, status: 'reminder-sent', country: 'Tanzania', phone: '+255 712 345 678', email: 'juma.omari@email.com', crop: 'Sorghum', loanType: 'Input Bundle' },
  { id: 'COL-007', memberId: 'AFU-2024-012', memberName: 'Farai Mutasa', loanId: 'FIN-2024-034', amount: 7600, outstandingAmount: 8740, daysOverdue: 55, lastPaymentDate: '2026-01-02', lastPaymentAmount: 950, status: 'no-contact', country: 'Zimbabwe', phone: '+263 73 456 7890', email: 'farai.mutasa@email.com', crop: 'Tobacco', loanType: 'Working Capital' },
  { id: 'COL-008', memberId: 'AFU-2024-018', memberName: 'Tinashe Gumbo', loanId: 'FIN-2024-035', amount: 5800, outstandingAmount: 6670, daysOverdue: 31, lastPaymentDate: '2026-02-01', lastPaymentAmount: 700, status: 'promise-to-pay', country: 'Zimbabwe', phone: '+263 71 678 9012', email: 'tinashe.gumbo@email.com', crop: 'Maize', loanType: 'Working Capital' },
  { id: 'COL-009', memberId: 'AFU-2024-020', memberName: 'Gorata Otsile', loanId: 'FIN-2024-036', amount: 2800, outstandingAmount: 3220, daysOverdue: 15, lastPaymentDate: '2026-02-18', lastPaymentAmount: 350, status: 'reminder-sent', country: 'Botswana', phone: '+267 71 901 234', email: 'gorata.otsile@email.com', crop: 'Sorghum', loanType: 'Input Bundle' },
  { id: 'COL-010', memberId: 'AFU-2024-031', memberName: 'Mwanaisha Bakari', loanId: 'FIN-2024-037', amount: 4100, outstandingAmount: 4715, daysOverdue: 28, lastPaymentDate: '2026-02-10', lastPaymentAmount: 500, status: 'restructured', country: 'Tanzania', phone: '+255 758 123 456', email: 'mwanaisha.bakari@email.com', crop: 'Cassava', loanType: 'Working Capital' },
  { id: 'COL-011', memberId: 'AFU-2024-024', memberName: 'Kudakwashe Sibanda', loanId: 'FIN-2024-038', amount: 9200, outstandingAmount: 10580, daysOverdue: 72, lastPaymentDate: '2025-12-15', lastPaymentAmount: 1100, status: 'escalated', country: 'Zimbabwe', phone: '+263 73 890 1234', email: 'kudakwashe.sibanda@email.com', crop: 'Cotton', loanType: 'Equipment' },
  { id: 'COL-012', memberId: 'AFU-2024-016', memberName: 'Salim Mwinyi', loanId: 'FIN-2024-039', amount: 3600, outstandingAmount: 4140, daysOverdue: 19, lastPaymentDate: '2026-02-15', lastPaymentAmount: 400, status: 'reminder-sent', country: 'Tanzania', phone: '+255 753 678 901', email: 'salim.mwinyi@email.com', crop: 'Cassava', loanType: 'Input Bundle' },
];

const collectionTrendData = [
  { month: 'Oct', collected: 42000, target: 50000 },
  { month: 'Nov', collected: 48000, target: 52000 },
  { month: 'Dec', collected: 38000, target: 55000 },
  { month: 'Jan', collected: 55000, target: 58000 },
  { month: 'Feb', collected: 62000, target: 60000 },
  { month: 'Mar', collected: 45000, target: 65000 },
];

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  'reminder-sent': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Reminder Sent' },
  'escalated': { bg: 'bg-red-100', text: 'text-red-700', label: 'Escalated' },
  'restructured': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Restructured' },
  'no-contact': { bg: 'bg-gray-100', text: 'text-gray-700', label: 'No Contact' },
  'promise-to-pay': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Promise to Pay' },
};

type SortField = 'memberName' | 'outstandingAmount' | 'daysOverdue' | 'lastPaymentDate';
type SortOrder = 'asc' | 'desc';

// ── Custom Tooltip ──────────────────────────────────────────────────────────

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
          <span className="font-medium text-navy">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function CollectionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('daysOverdue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dbLoans, setDbLoans] = useState<OverdueLoan[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{message: string, onConfirm: () => void}|null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(null), 3000); };

  const handleCollectionAction = async (loan: OverdueLoan, action: 'reminder' | 'escalate' | 'restructure' | 'collected') => {
    setActionLoading(loan.id);
    const supabase = createClient();
    try {
      const statusMap = { reminder: 'reminder-sent', escalate: 'escalated', restructure: 'restructured', collected: 'completed' } as const;
      const newStatus = statusMap[action];
      // Update the payment/loan in DB if it's a DB record
      if (loan.loanId) {
        await supabase.from('loans').update({
          status: action === 'collected' ? 'completed' : loan.loanId ? 'overdue' : undefined,
          ...(action === 'collected' ? { amount_repaid: loan.amount } : {}),
        }).eq('loan_number', loan.loanId);
      }
      // Update local state
      const updateFn = (loans: OverdueLoan[]) =>
        action === 'collected'
          ? loans.filter(l => l.id !== loan.id)
          : loans.map(l => l.id === loan.id ? { ...l, status: newStatus as OverdueLoan['status'] } : l);
      setDbLoans(updateFn);
      const actionLabels = { reminder: 'Reminder sent', escalate: 'Loan escalated', restructure: 'Loan restructured', collected: 'Marked as collected' };
      showSuccess(`${actionLabels[action]} for ${loan.memberName}.`);
    } catch {
      setSuccessMsg(null);
      setErrorMsg('Action failed. Please try again.');
      setTimeout(() => setErrorMsg(null), 3000);
    }
    setActionLoading(null);
  };

  const handleExportReport = () => {
    const headers = ['ID', 'Member', 'Loan ID', 'Outstanding', 'Days Overdue', 'Status', 'Country', 'Last Payment'];
    const rows = filteredAndSorted.map(l => [l.id, l.memberName, l.loanId, l.outstandingAmount, l.daysOverdue, l.status, l.country, l.lastPaymentDate]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `afu-collections-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const supabase = createClient();
    async function fetchOverduePayments() {
      try {
        const { data } = await supabase
          .from('payments')
          .select('*')
          .in('purpose', ['loan_repayment', 'collection', 'repayment'])
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          const mapped: OverdueLoan[] = data.map((p: Record<string, unknown>, idx: number) => ({
            id: `COL-DB-${idx + 1}`,
            memberId: (p.member_id as string) || '',
            memberName: (p.member_id as string) || 'Unknown',
            loanId: (p.related_entity_id as string) || '',
            amount: (p.amount as number) || 0,
            outstandingAmount: (p.amount as number) || 0,
            daysOverdue: Math.floor((Date.now() - new Date((p.created_at as string) || '').getTime()) / 86400000),
            lastPaymentDate: ((p.completed_at as string) || (p.created_at as string) || '').slice(0, 10),
            lastPaymentAmount: 0,
            status: 'reminder-sent' as const,
            country: '',
            phone: (p.phone_number as string) || '',
            email: '',
            crop: '',
            loanType: (p.purpose as string) || '',
          }));
          setDbLoans(mapped);
        }
      } catch {
        // keep fallback
      } finally {
        setDbLoading(false);
      }
    }
    fetchOverduePayments();
  }, []);

  // Use DB data if available, otherwise fallback
  const activeLoans = dbLoans.length > 0 ? dbLoans : overdueLoans;

  const totalOverdue = activeLoans.reduce((s, l) => s + l.outstandingAmount, 0);
  const thirtyDayOverdue = activeLoans.filter((l) => l.daysOverdue <= 30);
  const sixtyDayOverdue = activeLoans.filter((l) => l.daysOverdue > 30 && l.daysOverdue <= 60);
  const ninetyPlusOverdue = activeLoans.filter((l) => l.daysOverdue > 60);

  const filteredAndSorted = useMemo(() => {
    let result = [...activeLoans];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.memberName.toLowerCase().includes(q) ||
          l.loanId.toLowerCase().includes(q) ||
          l.country.toLowerCase().includes(q) ||
          l.crop.toLowerCase().includes(q)
      );
    }

    // Filter
    if (filterStatus !== 'all') {
      result = result.filter((l) => l.status === filterStatus);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'memberName':
          comparison = a.memberName.localeCompare(b.memberName);
          break;
        case 'outstandingAmount':
          comparison = a.outstandingAmount - b.outstandingAmount;
          break;
        case 'daysOverdue':
          comparison = a.daysOverdue - b.daysOverdue;
          break;
        case 'lastPaymentDate':
          comparison = new Date(a.lastPaymentDate).getTime() - new Date(b.lastPaymentDate).getTime();
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [searchQuery, filterStatus, sortField, sortOrder, activeLoans]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  function sortIcon(field: SortField) {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
    return sortOrder === 'asc' ? <ChevronUp className="w-3 h-3 text-teal" /> : <ChevronDown className="w-3 h-3 text-teal" />;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Link
          href="/admin/financial"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-navy transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Financial Management
        </Link>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Collections</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage overdue loans and recovery actions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Overdue',
            value: formatCurrency(totalOverdue),
            count: activeLoans.length,
            icon: <AlertTriangle className="w-5 h-5" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
          },
          {
            label: '1-30 Day Overdue',
            value: formatCurrency(thirtyDayOverdue.reduce((s, l) => s + l.outstandingAmount, 0)),
            count: thirtyDayOverdue.length,
            icon: <Clock className="w-5 h-5" />,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
          },
          {
            label: '31-60 Day Overdue',
            value: formatCurrency(sixtyDayOverdue.reduce((s, l) => s + l.outstandingAmount, 0)),
            count: sixtyDayOverdue.length,
            icon: <AlertCircle className="w-5 h-5" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
          },
          {
            label: '60+ Day Overdue',
            value: formatCurrency(ninetyPlusOverdue.reduce((s, l) => s + l.outstandingAmount, 0)),
            count: ninetyPlusOverdue.length,
            icon: <XCircle className="w-5 h-5" />,
            color: 'text-red-700',
            bgColor: 'bg-red-50',
          },
        ].map((stat, i) => (
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
              <span className="text-xs font-medium bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full">
                {stat.count} loans
              </span>
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Search & Filters ─────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, loan ID, country, or crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
        >
          <option value="all">All Statuses</option>
          <option value="reminder-sent">Reminder Sent</option>
          <option value="promise-to-pay">Promise to Pay</option>
          <option value="escalated">Escalated</option>
          <option value="no-contact">No Contact</option>
          <option value="restructured">Restructured</option>
        </select>
      </motion.div>

      {/* ── Overdue Loans Table ──────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy text-sm">
            Overdue Loans ({filteredAndSorted.length})
          </h3>
          <span className="text-xs text-gray-400">Click column headers to sort</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-cream/50">
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                  onClick={() => toggleSort('memberName')}
                >
                  <div className="flex items-center gap-1">
                    Member {sortIcon("memberName")}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Loan ID</th>
                <th
                  className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                  onClick={() => toggleSort('outstandingAmount')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Outstanding {sortIcon("outstandingAmount")}
                  </div>
                </th>
                <th
                  className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                  onClick={() => toggleSort('daysOverdue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Days Overdue {sortIcon("daysOverdue")}
                  </div>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-navy transition-colors"
                  onClick={() => toggleSort('lastPaymentDate')}
                >
                  <div className="flex items-center gap-1">
                    Last Payment {sortIcon("lastPaymentDate")}
                  </div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredAndSorted.map((loan, i) => {
                const cfg = statusConfig[loan.status] || statusConfig['reminder-sent'];
                return (
                  <motion.tr
                    key={loan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-cream/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <Link href={`/admin/members/${loan.memberId}`} className="font-medium text-navy hover:text-teal transition-colors">
                          {loan.memberName}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-gray-400">{loan.country}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] text-gray-400">{loan.crop}</span>
                          <span className="text-[10px] text-gray-300">|</span>
                          <span className="text-[10px] text-gray-400">{loan.loanType}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-gray-500">{loan.loanId}</td>
                    <td className="py-3 px-4 text-right font-medium text-navy tabular-nums">${loan.outstandingAmount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-xs font-bold tabular-nums ${
                        loan.daysOverdue > 90 ? 'text-red-700' :
                        loan.daysOverdue > 60 ? 'text-red-500' :
                        loan.daysOverdue > 30 ? 'text-orange-500' :
                        'text-amber-500'
                      }`}>
                        {loan.daysOverdue}d
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-xs text-gray-600">{loan.lastPaymentDate}</span>
                        {loan.lastPaymentAmount > 0 && (
                          <p className="text-[10px] text-gray-400 mt-0.5">${loan.lastPaymentAmount.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleCollectionAction(loan, 'reminder')}
                          disabled={actionLoading === loan.id}
                          className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors group disabled:opacity-50"
                          title="Send Reminder"
                        >
                          <Send className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleCollectionAction(loan, 'collected')}
                          disabled={actionLoading === loan.id}
                          className="p-1.5 hover:bg-green-50 rounded-lg transition-colors group disabled:opacity-50"
                          title="Mark as Collected"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600" />
                        </button>
                        <button
                          onClick={() => { setConfirmAction({ message: `Escalate ${loan.memberName}'s loan?`, onConfirm: () => handleCollectionAction(loan, 'escalate') }); }}
                          disabled={actionLoading === loan.id}
                          className="p-1.5 hover:bg-red-50 rounded-lg transition-colors group disabled:opacity-50"
                          title="Escalate"
                        >
                          <TriangleAlert className="w-3.5 h-3.5 text-gray-400 group-hover:text-red-600" />
                        </button>
                        <button
                          onClick={() => { setConfirmAction({ message: `Restructure ${loan.memberName}'s loan?`, onConfirm: () => handleCollectionAction(loan, 'restructure') }); }}
                          disabled={actionLoading === loan.id}
                          className="p-1.5 hover:bg-purple-50 rounded-lg transition-colors group disabled:opacity-50"
                          title="Restructure"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 text-gray-400 group-hover:text-purple-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredAndSorted.length === 0 && (
          <div className="p-12 text-center">
            <Search className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No overdue loans match your search criteria.</p>
          </div>
        )}
      </motion.div>

      {/* ── Collection Trend Chart ────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 p-5">
        <h3 className="font-semibold text-navy text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-teal" />
          Collections vs Targets (6 Months)
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={collectionTrendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="collectedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8CB89C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8CB89C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => formatCurrency(v)} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="target" stroke="#D4A843" strokeWidth={2} fill="none" strokeDasharray="6 4" name="Target" />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#8CB89C"
                strokeWidth={2.5}
                fill="url(#collectedGradient)"
                name="Collected"
                dot={{ fill: '#8CB89C', r: 3, strokeWidth: 0 }}
                activeDot={{ fill: '#8CB89C', r: 5, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-teal rounded-full" />
            <span className="text-xs text-gray-500">Collected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gold rounded-full" style={{ borderTop: '2px dashed #D4A843', height: 0 }} />
            <span className="text-xs text-gray-500">Target</span>
          </div>
        </div>
      </motion.div>

      {/* Toast */}
      {successMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-green-600">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-white text-sm font-medium bg-red-600">
          {errorMsg}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-[#1B2A4A] mb-2">Confirm Action</h3>
            <p className="text-gray-600 mb-6">{confirmAction.message}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmAction(null)} className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={() => { confirmAction.onConfirm(); setConfirmAction(null); }} className="px-4 py-2 text-sm font-medium text-white bg-[#5DB347] rounded-lg hover:bg-[#4ea03c]">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
