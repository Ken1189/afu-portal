'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import FilterBar, { LOAN_STATUS_FILTER, COUNTRY_FILTER, DATE_RANGE_FILTER } from '@/components/admin/FilterBar';
import type { FilterValues } from '@/components/admin/FilterBar';
import {
  ChevronLeft,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Smartphone,
  Building2,
  Zap,
  Activity,
  BarChart3,
  ArrowUpRight,
  Send,
  Loader2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

// ── Animation variants ─────────────────────────────────────────────────────

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

// ── Types ──────────────────────────────────────────────────────────────────

type ApplicationStatus = 'pending' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed' | 'repaying' | 'completed';
type LoanPurpose = 'working capital' | 'equipment' | 'inputs' | 'trade finance';
type PaymentMethod = 'M-Pesa' | 'EcoCash' | 'Bank Transfer';

interface LoanApplication {
  id: string;
  memberName: string;
  amountRequested: number;
  purpose: LoanPurpose;
  creditScore: number;
  country: string;
  appliedDate: string;
  status: ApplicationStatus;
}

interface DisbursementEntry {
  loanId: string;
  member: string;
  amount: number;
  method: PaymentMethod;
  country: string;
  approvedDate: string;
}

interface RecentActivity {
  id: string;
  description: string;
  timestamp: string;
  type: 'disbursed' | 'approved' | 'repaid' | 'applied' | 'rejected';
}

// ── Mock data ──────────────────────────────────────────────────────────────

const mockApplications: LoanApplication[] = [
  {
    id: 'APP-2026-001',
    memberName: 'Amara Diallo',
    amountRequested: 12000,
    purpose: 'working capital',
    creditScore: 742,
    country: 'Senegal',
    appliedDate: '2026-03-15',
    status: 'pending',
  },
  {
    id: 'APP-2026-002',
    memberName: 'Fatima Al-Rashid',
    amountRequested: 35000,
    purpose: 'equipment',
    creditScore: 815,
    country: 'Kenya',
    appliedDate: '2026-03-14',
    status: 'pending',
  },
  {
    id: 'APP-2026-003',
    memberName: 'Kofi Mensah',
    amountRequested: 8500,
    purpose: 'inputs',
    creditScore: 621,
    country: 'Ghana',
    appliedDate: '2026-03-13',
    status: 'pending',
  },
  {
    id: 'APP-2026-004',
    memberName: 'Ngozi Okonkwo',
    amountRequested: 22000,
    purpose: 'trade finance',
    creditScore: 768,
    country: 'Nigeria',
    appliedDate: '2026-03-12',
    status: 'approved',
  },
  {
    id: 'APP-2026-005',
    memberName: 'Tendai Murewa',
    amountRequested: 5500,
    purpose: 'working capital',
    creditScore: 589,
    country: 'Zimbabwe',
    appliedDate: '2026-03-11',
    status: 'rejected',
  },
  {
    id: 'APP-2026-006',
    memberName: 'Abebe Girma',
    amountRequested: 85000,
    purpose: 'equipment',
    creditScore: 831,
    country: 'Ethiopia',
    appliedDate: '2026-03-10',
    status: 'disbursed',
  },
  {
    id: 'APP-2026-007',
    memberName: 'Mariam Coulibaly',
    amountRequested: 2000,
    purpose: 'inputs',
    creditScore: 554,
    country: 'Mali',
    appliedDate: '2026-03-09',
    status: 'pending',
  },
  {
    id: 'APP-2026-008',
    memberName: 'Samuel Nkrumah',
    amountRequested: 18500,
    purpose: 'trade finance',
    creditScore: 703,
    country: 'Ghana',
    appliedDate: '2026-03-08',
    status: 'approved',
  },
];

const disbursementQueue: DisbursementEntry[] = [
  {
    loanId: 'LN-2026-043',
    member: 'Ngozi Okonkwo',
    amount: 22000,
    method: 'Bank Transfer',
    country: 'Nigeria',
    approvedDate: '2026-03-12',
  },
  {
    loanId: 'LN-2026-044',
    member: 'Samuel Nkrumah',
    amount: 18500,
    method: 'M-Pesa',
    country: 'Ghana',
    approvedDate: '2026-03-08',
  },
  {
    loanId: 'LN-2026-045',
    member: 'Grace Moyo',
    amount: 15000,
    method: 'EcoCash',
    country: 'Zimbabwe',
    approvedDate: '2026-03-07',
  },
];

const recentActivity: RecentActivity[] = [
  {
    id: '1',
    description: 'Loan LN-2026-045 disbursed to Grace Moyo — $15,000 via M-Pesa',
    timestamp: '2 hours ago',
    type: 'disbursed',
  },
  {
    id: '2',
    description: 'Application APP-2026-002 approved for Fatima Al-Rashid — $35,000',
    timestamp: '4 hours ago',
    type: 'approved',
  },
  {
    id: '3',
    description: 'Loan LN-2026-038 repayment received from Kofi Mensah — $1,200',
    timestamp: '6 hours ago',
    type: 'repaid',
  },
  {
    id: '4',
    description: 'New application APP-2026-001 submitted by Amara Diallo — $12,000',
    timestamp: '8 hours ago',
    type: 'applied',
  },
  {
    id: '5',
    description: 'Application APP-2026-005 rejected for Tendai Murewa — insufficient credit score',
    timestamp: '1 day ago',
    type: 'rejected',
  },
  {
    id: '6',
    description: 'Loan LN-2026-041 disbursed to Abebe Girma — $85,000 via Bank Transfer',
    timestamp: '1 day ago',
    type: 'disbursed',
  },
];

// ── Pipeline data ──────────────────────────────────────────────────────────

const pipelineColumns = [
  { label: 'Applied', count: 12, color: 'bg-blue-500', lightColor: 'bg-blue-50', textColor: 'text-blue-700' },
  { label: 'Under Review', count: 5, color: 'bg-amber-500', lightColor: 'bg-amber-50', textColor: 'text-amber-700' },
  { label: 'Approved', count: 3, color: 'bg-[#8CB89C]', lightColor: 'bg-[#EDF4EF]', textColor: 'text-teal-700' },
  { label: 'Disbursed', count: 187, color: 'bg-navy', lightColor: 'bg-navy/5', textColor: 'text-navy' },
];

// ── Credit score distribution ──────────────────────────────────────────────

const creditDistribution = [
  { label: 'Excellent', range: '800–1000', pct: 34, color: 'bg-green-500' },
  { label: 'Good', range: '600–799', pct: 41, color: 'bg-[#8CB89C]' },
  { label: 'Fair', range: '400–599', pct: 18, color: 'bg-amber-400' },
  { label: 'Poor', range: '<400', pct: 7, color: 'bg-red-400' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;
  return `$${value.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getCreditScoreColor(score: number): string {
  if (score >= 800) return 'text-green-600 bg-green-50';
  if (score >= 600) return 'text-[#729E82] bg-[#EDF4EF]';
  if (score >= 400) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

function getCreditScoreLabel(score: number): string {
  if (score >= 800) return 'Excellent';
  if (score >= 600) return 'Good';
  if (score >= 400) return 'Fair';
  return 'Poor';
}

const purposeColors: Record<LoanPurpose, string> = {
  'working capital': 'bg-blue-100 text-blue-700',
  equipment: 'bg-purple-100 text-purple-700',
  inputs: 'bg-green-100 text-green-700',
  'trade finance': 'bg-orange-100 text-orange-700',
};

const statusConfig: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  disbursed: { label: 'Disbursed', color: 'bg-navy/10 text-navy' },
  repaying: { label: 'Repaying', color: 'bg-teal-100 text-teal-700' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-600' },
};

const activityTypeConfig: Record<RecentActivity['type'], { icon: React.ReactNode; color: string }> = {
  disbursed: { icon: <Send className="w-3.5 h-3.5" />, color: 'bg-teal-100 text-[#729E82]' },
  approved: { icon: <CheckCircle className="w-3.5 h-3.5" />, color: 'bg-green-100 text-green-600' },
  repaid: { icon: <DollarSign className="w-3.5 h-3.5" />, color: 'bg-blue-100 text-blue-600' },
  applied: { icon: <ArrowUpRight className="w-3.5 h-3.5" />, color: 'bg-purple-100 text-purple-600' },
  rejected: { icon: <XCircle className="w-3.5 h-3.5" />, color: 'bg-red-100 text-red-600' },
};

const methodIcons: Record<PaymentMethod, React.ReactNode> = {
  'M-Pesa': <Smartphone className="w-3.5 h-3.5" />,
  EcoCash: <Zap className="w-3.5 h-3.5" />,
  'Bank Transfer': <Building2 className="w-3.5 h-3.5" />,
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LoansPage() {
  const [activeTab, setActiveTab] = useState<'all' | ApplicationStatus>('all');
  const [disbursedIds, setDisbursedIds] = useState<Set<string>>(new Set());
  const [realLoans, setRealLoans] = useState<LoanApplication[]>([]);
  const [dbLoading, setDbLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterValues, setFilterValues] = useState<FilterValues>({
    search: '',
    status: 'all',
    country: 'all',
    dateRange: 'all',
  });

  // Fetch real loans from Supabase
  const fetchLoans = useCallback(async () => {
    setDbLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('loans')
      .select('*, members!inner(id, profile_id, profiles!inner(full_name, email))')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      setRealLoans(data.map((loan: Record<string, unknown>) => {
        const members = loan.members as Record<string, unknown> | null;
        const profiles = members?.profiles as Record<string, unknown> | null;
        return {
          id: String(loan.id),
          memberName: String(profiles?.full_name || 'Unknown'),
          amountRequested: Number(loan.amount),
          purpose: (String(loan.loan_type || loan.purpose || 'working capital')) as LoanPurpose,
          creditScore: 650, // Will be replaced when credit scoring is wired
          country: '-',
          appliedDate: String(loan.created_at),
          status: String(loan.status) as ApplicationStatus,
        };
      }));
    }
    setDbLoading(false);
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  // Use real data if available, fall back to mock for demo
  const applications = realLoans.length > 0 ? realLoans : mockApplications;

  const tabs: { key: 'all' | ApplicationStatus; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'disbursed', label: 'Disbursed' },
  ];

  const filteredApplications = applications.filter((a) => {
    // Tab filter
    if (activeTab !== 'all' && a.status !== activeTab) return false;
    // Search filter
    if (filterValues.search) {
      const q = filterValues.search.toLowerCase();
      if (!a.memberName.toLowerCase().includes(q) && !a.id.toLowerCase().includes(q)) return false;
    }
    // Country filter
    if (filterValues.country && filterValues.country !== 'all' && a.country !== filterValues.country) return false;
    // Date range
    if (filterValues.dateRange && filterValues.dateRange !== 'all') {
      const daysMap: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90, '365d': 365 };
      const days = daysMap[filterValues.dateRange as string];
      if (days) {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        if (new Date(a.appliedDate) < cutoff) return false;
      }
    }
    return true;
  });

  const handleDisburse = (loanId: string) => {
    setDisbursedIds((prev) => new Set([...prev, loanId]));
  };

  // Approve or reject a loan via the real API
  const handleLoanAction = async (loanId: string, action: 'approve' | 'reject') => {
    setActionLoading(loanId);
    try {
      const res = await fetch('/api/admin/loans/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId, action }),
      });
      if (res.ok) {
        // Refresh the list
        await fetchLoans();
      }
    } catch {
      // Silently fail — real error handling in Sprint 4
    }
    setActionLoading(null);
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-navy">Loan Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Origination, disbursement & portfolio oversight
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <Activity className="w-3 h-3" />
            Portfolio Active
          </span>
        </div>
      </motion.div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <motion.div
        variants={containerVariants}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        {/* Portfolio Outstanding */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-4 border border-gray-100 cursor-default lg:col-span-1"
        >
          <div className="w-9 h-9 rounded-lg bg-navy/10 flex items-center justify-center text-navy mb-3">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-navy">$2.4M</p>
          <p className="text-xs text-gray-500 mt-0.5">Portfolio Outstanding</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Active loan book</p>
        </motion.div>

        {/* Active Loans */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
        >
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-navy">187</p>
          <p className="text-xs text-gray-500 mt-0.5">Active Loans</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Across 10 countries</p>
        </motion.div>

        {/* Repayment Rate */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
        >
          <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-navy">96.2%</p>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Good
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Repayment Rate</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Last 90 days</p>
        </motion.div>

        {/* PAR30 */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-navy">3.8%</p>
            <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
              Watch
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">PAR30</p>
          <p className="text-[10px] text-gray-400 mt-0.5">30+ days overdue</p>
        </motion.div>

        {/* Pending Applications */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -2, boxShadow: '0 8px 25px rgba(27,42,74,0.08)' }}
          className="bg-white rounded-xl p-4 border border-gray-100 cursor-default"
        >
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-navy">12</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending Applications</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Awaiting review</p>
        </motion.div>
      </motion.div>

      {/* ── Loan Pipeline (Kanban) ───────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-navy" />
          <h3 className="font-semibold text-navy text-sm">Loan Pipeline</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {pipelineColumns.map((col, i) => (
            <motion.div
              key={col.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-xl p-4 ${col.lightColor} border border-white/80`}
            >
              {/* Colored top bar */}
              <div className={`h-1 w-full rounded-full ${col.color} mb-3`} />
              <p className={`text-3xl font-bold ${col.textColor}`}>{col.count}</p>
              <p className={`text-xs font-medium mt-1 ${col.textColor} opacity-80`}>{col.label}</p>
              {i < pipelineColumns.length - 1 && (
                <div className="mt-3 pt-3 border-t border-white/50">
                  <p className="text-[10px] text-gray-400">
                    {i === 0 ? 'Submitted applications' : i === 1 ? 'Credit assessment' : 'Ready to disburse'}
                  </p>
                </div>
              )}
              {i === pipelineColumns.length - 1 && (
                <div className="mt-3 pt-3 border-t border-white/50">
                  <p className="text-[10px] text-gray-400">Active borrowers</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        {/* Flow arrow indicators */}
        <div className="hidden lg:flex items-center justify-between px-4 mt-3">
          {['Applied → Under Review', 'Under Review → Approved', 'Approved → Disbursed'].map((label, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
              <div className="h-px w-8 bg-gray-200" />
              <span>{label}</span>
              <div className="h-px w-8 bg-gray-200" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Filter Bar ──────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <FilterBar
          filters={[LOAN_STATUS_FILTER, COUNTRY_FILTER, DATE_RANGE_FILTER]}
          values={filterValues}
          onChange={(v) => {
            setFilterValues(v);
            // Sync status filter with tab
            if (v.status && v.status !== filterValues.status) {
              setActiveTab(v.status as 'all' | ApplicationStatus);
            }
          }}
          searchPlaceholder="Search by name or loan ID..."
          resultCount={filteredApplications.length}
        />
      </motion.div>

      {/* ── Applications Table ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy text-sm">
              Applications
              <span className="text-gray-400 font-normal ml-2">({filteredApplications.length})</span>
            </h3>
          </div>
          {/* Filter tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {tabs.map((tab) => {
              const count =
                tab.key === 'all'
                  ? applications.length
                  : applications.filter((a) => a.status === tab.key).length;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-navy text-white'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Application ID
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Member Name
                </th>
                <th className="text-right py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="text-center py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Credit Score
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Country
                </th>
                <th className="text-left py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Applied Date
                </th>
                <th className="text-center py-2.5 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <AnimatePresence mode="popLayout">
                {filteredApplications.map((app) => (
                  <motion.tr
                    key={app.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-500">{app.id}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-navy text-sm">{app.memberName}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-navy tabular-nums">
                      {formatCurrency(app.amountRequested)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium capitalize ${purposeColors[app.purpose]}`}
                      >
                        {app.purpose}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${getCreditScoreColor(app.creditScore)}`}
                      >
                        {app.creditScore}
                        <span className="opacity-60 text-[9px]">{getCreditScoreLabel(app.creditScore)}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{app.country}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(app.appliedDate)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        {app.status === 'pending' || app.status === 'submitted' ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleLoanAction(app.id, 'approve')}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-green-500 text-white text-[11px] font-medium rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                              Approve
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleLoanAction(app.id, 'reject')}
                              disabled={actionLoading === app.id}
                              className="flex items-center gap-1 px-2.5 py-1 bg-red-500 text-white text-[11px] font-medium rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                            >
                              {actionLoading === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsDown className="w-3 h-3" />}
                              Reject
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 text-gray-600 text-[11px] font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <Eye className="w-3 h-3" />
                              Review
                            </motion.button>
                          </>
                        ) : (
                          <span
                            className={`inline-block text-xs px-2.5 py-1 rounded-lg font-medium ${statusConfig[app.status].color}`}
                          >
                            {statusConfig[app.status].label}
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Bottom Grid: Credit Score Distribution + Disbursement Queue ──── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credit Score Distribution */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-navy" />
            <h3 className="font-semibold text-navy text-sm">Credit Score Distribution</h3>
          </div>
          <div className="space-y-4">
            {creditDistribution.map((band, i) => (
              <div key={band.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="text-sm font-medium text-navy">{band.label}</span>
                    <span className="text-xs text-gray-400 ml-2">({band.range})</span>
                  </div>
                  <span className="text-sm font-bold text-navy">{band.pct}%</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${band.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${band.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-navy">693</p>
              <p className="text-xs text-gray-400">Average Score</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-navy">75%</p>
              <p className="text-xs text-gray-400">Excellent + Good</p>
            </div>
          </div>
        </motion.div>

        {/* Disbursement Queue */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Send className="w-4 h-4 text-navy" />
            <h3 className="font-semibold text-navy text-sm">Disbursement Queue</h3>
            <span className="ml-auto text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
              {disbursementQueue.filter((d) => !disbursedIds.has(d.loanId)).length} pending
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Loan ID
                  </th>
                  <th className="text-left pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="text-right pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="text-left pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="text-center pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {disbursementQueue.map((entry) => {
                  const isDisbursed = disbursedIds.has(entry.loanId);
                  return (
                    <tr key={entry.loanId} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3">
                        <span className="font-mono text-xs text-gray-500">{entry.loanId}</span>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-navy text-xs">{entry.member}</p>
                          <p className="text-[10px] text-gray-400">{entry.country}</p>
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold text-navy text-xs tabular-nums">
                        {formatCurrency(entry.amount)}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <span className="text-gray-400">{methodIcons[entry.method]}</span>
                          {entry.method}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        {isDisbursed ? (
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">
                            Sent
                          </span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDisburse(entry.loanId)}
                            className="flex items-center gap-1 mx-auto px-3 py-1 bg-[#8CB89C] text-white text-[11px] font-medium rounded-lg hover:bg-[#729E82] transition-colors"
                          >
                            <Send className="w-3 h-3" />
                            Disburse
                          </motion.button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Bottom Grid: Portfolio Health + Recent Activity ──────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Health */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-navy" />
            <h3 className="font-semibold text-navy text-sm">Portfolio Health</h3>
          </div>
          <div className="space-y-0 divide-y divide-gray-50">
            {[
              { label: 'Total Disbursed All Time', value: '$4.8M', color: 'text-navy' },
              { label: 'Total Repaid', value: '$2.4M', color: 'text-green-600' },
              { label: 'Write-offs', value: '$45K', sub: '0.9%', color: 'text-red-500' },
              { label: 'Average Loan Size', value: '$12,800', color: 'text-navy' },
              { label: 'Average Loan Term', value: '8 months', color: 'text-navy' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  {item.sub && (
                    <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">
                      {item.sub} of portfolio
                    </span>
                  )}
                  <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Mini repayment progress bar */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Repayment Progress (All Time)</span>
              <span className="text-xs font-semibold text-green-600">50%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#8CB89C] to-green-500"
                initial={{ width: 0 }}
                animate={{ width: '50%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">$2.4M repaid of $4.8M total disbursed</p>
          </div>
        </motion.div>

        {/* Recent Loan Activity */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-xl border border-gray-100 p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-navy" />
            <h3 className="font-semibold text-navy text-sm">Recent Loan Activity</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.map((event, i) => {
              const config = activityTypeConfig[event.type];
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${config.color}`}
                  >
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-relaxed">{event.description}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{event.timestamp}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full text-xs text-center text-[#729E82] hover:text-teal-700 font-medium transition-colors">
              View all activity &rarr;
            </button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
