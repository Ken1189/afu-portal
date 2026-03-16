'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowDownToLine,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  Check,
  X,
  Eye,
  FileText,
  AlertTriangle,
  ChevronDown,
  SquareCheck,
  Square,
  MinusSquare,
  Download,
  Filter,
  ShieldCheck,
  TrendingUp,
  User,
} from 'lucide-react';
import { applications } from '@/lib/data/applications';

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

// ── Data ────────────────────────────────────────────────────────────────────

// Pending approvals from applications data that are approved and waiting for disbursement
interface PendingDisbursement {
  id: string;
  appId: string;
  memberName: string;
  memberId: string;
  amount: number;
  loanType: string;
  riskGrade: 'A' | 'B' | 'C' | 'D';
  officer: string;
  country: string;
  crop: string;
  submittedDate: string;
  approvedDate: string;
  notes: string;
}

const pendingDisbursements: PendingDisbursement[] = [
  { id: 'DIS-001', appId: 'APP-2026-004', memberName: 'John Maseko', memberId: 'AFU-2024-003', amount: 8000, loanType: 'Working Capital', riskGrade: 'B', officer: 'Lebo Molefe', country: 'Botswana', crop: 'Sorghum', submittedDate: '2026-02-28', approvedDate: '2026-03-07', notes: 'Approved at 15% APR' },
  { id: 'DIS-002', appId: 'APP-2026-007', memberName: 'Kago Setshedi', memberId: 'AFU-2024-009', amount: 2200, loanType: 'Input Bundle', riskGrade: 'A', officer: 'Lebo Molefe', country: 'Botswana', crop: 'Groundnuts', submittedDate: '2026-03-01', approvedDate: '2026-03-06', notes: 'Seasonal input bundle' },
  { id: 'DIS-003', appId: 'APP-2026-014', memberName: 'Rehema Kimaro', memberId: 'AFU-2024-044', amount: 1800, loanType: 'Input Bundle', riskGrade: 'A', officer: 'David Nkomo', country: 'Tanzania', crop: 'Sesame', submittedDate: '2026-03-02', approvedDate: '2026-03-08', notes: 'Awaiting delivery confirmation' },
  { id: 'DIS-004', appId: 'APP-2026-016', memberName: 'Grace Moyo', memberId: 'AFU-2024-005', amount: 45000, loanType: 'Working Capital', riskGrade: 'B', officer: 'David Nkomo', country: 'Zimbabwe', crop: 'Blueberries', submittedDate: '2026-03-11', approvedDate: '2026-03-14', notes: 'First loan from this member - monitor closely' },
  { id: 'DIS-005', appId: 'APP-2026-017', memberName: 'Baraka Mushi', memberId: 'AFU-2024-041', amount: 52000, loanType: 'Invoice Finance', riskGrade: 'B', officer: 'Lebo Molefe', country: 'Tanzania', crop: 'Sesame', submittedDate: '2026-03-07', approvedDate: '2026-03-13', notes: 'Dubai Fresh Markets invoice verified' },
  { id: 'DIS-006', appId: 'APP-2026-018', memberName: 'Tatenda Hove', memberId: 'AFU-2024-020', amount: 7200, loanType: 'Working Capital', riskGrade: 'C', officer: 'Lebo Molefe', country: 'Zimbabwe', crop: 'Blueberries', submittedDate: '2026-03-09', approvedDate: '2026-03-14', notes: 'First loan - good training record' },
  { id: 'DIS-007', appId: 'APP-2026-019', memberName: 'Amina Salim', memberId: 'AFU-2024-018', amount: 78000, loanType: 'Invoice Finance', riskGrade: 'A', officer: 'David Nkomo', country: 'Tanzania', crop: 'Sesame', submittedDate: '2026-03-05', approvedDate: '2026-03-14', notes: 'Strong buyer contract - EuroFruit GmbH' },
  { id: 'DIS-008', appId: 'APP-2026-020', memberName: 'Halima Mwanga', memberId: 'AFU-2024-031', amount: 95000, loanType: 'Working Capital', riskGrade: 'B', officer: 'David Nkomo', country: 'Tanzania', crop: 'Cassava', submittedDate: '2026-03-06', approvedDate: '2026-03-15', notes: 'Large-scale cassava processing' },
];

interface RecentDisbursement {
  id: string;
  memberName: string;
  amount: number;
  loanType: string;
  status: 'completed' | 'processing' | 'failed';
  disbursedAt: string;
  processedBy: string;
  country: string;
}

const recentDisbursements: RecentDisbursement[] = [
  { id: 'RD-001', memberName: 'Mpho Kgathi', amount: 4800, loanType: 'Equipment', status: 'completed', disbursedAt: '2026-03-15T14:30:00Z', processedBy: 'Lebo Molefe', country: 'Botswana' },
  { id: 'RD-002', memberName: 'Tendai Chirwa', amount: 3500, loanType: 'Input Bundle', status: 'completed', disbursedAt: '2026-03-15T11:15:00Z', processedBy: 'David Nkomo', country: 'Zimbabwe' },
  { id: 'RD-003', memberName: 'Nyasha Mutasa', amount: 38000, loanType: 'Working Capital', status: 'completed', disbursedAt: '2026-03-14T16:45:00Z', processedBy: 'David Nkomo', country: 'Zimbabwe' },
  { id: 'RD-004', memberName: 'Juma Abdallah', amount: 185000, loanType: 'Working Capital', status: 'completed', disbursedAt: '2026-03-14T10:20:00Z', processedBy: 'Lebo Molefe', country: 'Tanzania' },
  { id: 'RD-005', memberName: 'Farai Ndlovu', amount: 12000, loanType: 'Equipment', status: 'completed', disbursedAt: '2026-03-13T15:00:00Z', processedBy: 'Lebo Molefe', country: 'Zimbabwe' },
  { id: 'RD-006', memberName: 'Rumbidzai Chikore', amount: 6500, loanType: 'Working Capital', status: 'processing', disbursedAt: '2026-03-13T13:30:00Z', processedBy: 'David Nkomo', country: 'Zimbabwe' },
  { id: 'RD-007', memberName: 'Keletso Moroka', amount: 15000, loanType: 'Working Capital', status: 'completed', disbursedAt: '2026-03-12T09:45:00Z', processedBy: 'Lebo Molefe', country: 'Botswana' },
  { id: 'RD-008', memberName: 'Lorato Seretse', amount: 22000, loanType: 'Equipment', status: 'completed', disbursedAt: '2026-03-11T14:10:00Z', processedBy: 'David Nkomo', country: 'Botswana' },
  { id: 'RD-009', memberName: 'Emmanuel Massawe', amount: 65000, loanType: 'Equipment', status: 'completed', disbursedAt: '2026-03-10T11:30:00Z', processedBy: 'Lebo Molefe', country: 'Tanzania' },
  { id: 'RD-010', memberName: 'Phenyo Kebonye', amount: 55000, loanType: 'Invoice Finance', status: 'completed', disbursedAt: '2026-03-09T16:00:00Z', processedBy: 'David Nkomo', country: 'Botswana' },
];

const riskGradeColors: Record<string, { bg: string; text: string }> = {
  A: { bg: 'bg-green-100', text: 'text-green-700' },
  B: { bg: 'bg-teal/10', text: 'text-teal-dark' },
  C: { bg: 'bg-amber-100', text: 'text-amber-700' },
  D: { bg: 'bg-red-100', text: 'text-red-700' },
};

const disbursementStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  completed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' },
  processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
  failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Failed' },
};

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function DisbursementsPage() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showApproveModal, setShowApproveModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const pendingValue = pendingDisbursements.reduce((s, d) => s + d.amount, 0);
  const todaysApproved = recentDisbursements.filter((d) => {
    const date = new Date(d.disbursedAt);
    return date.toDateString() === new Date('2026-03-15').toDateString() && d.status === 'completed';
  });
  const todaysApprovedValue = todaysApproved.reduce((s, d) => s + d.amount, 0);

  const visiblePending = useMemo(() => {
    let result = pendingDisbursements.filter(
      (d) => !approvedIds.has(d.id) && !rejectedIds.has(d.id)
    );
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.memberName.toLowerCase().includes(q) ||
          d.appId.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.crop.toLowerCase().includes(q)
      );
    }
    return result;
  }, [searchQuery, approvedIds, rejectedIds]);

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === visiblePending.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(visiblePending.map((d) => d.id)));
    }
  };

  const handleApprove = (id: string) => {
    setApprovedIds((prev) => new Set(prev).add(id));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setShowApproveModal(null);
  };

  const handleReject = (id: string) => {
    setRejectedIds((prev) => new Set(prev).add(id));
    setSelectedRows((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setShowRejectModal(null);
  };

  const handleBatchApprove = () => {
    setApprovedIds((prev) => {
      const next = new Set(prev);
      selectedRows.forEach((id) => next.add(id));
      return next;
    });
    setSelectedRows(new Set());
  };

  const handleBatchReject = () => {
    setRejectedIds((prev) => {
      const next = new Set(prev);
      selectedRows.forEach((id) => next.add(id));
      return next;
    });
    setSelectedRows(new Set());
  };

  const isAllSelected = visiblePending.length > 0 && selectedRows.size === visiblePending.length;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < visiblePending.length;

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
            <h1 className="text-2xl font-bold text-navy">Disbursements</h1>
            <p className="text-sm text-gray-500 mt-0.5">Pending approval queue and disbursement log</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-navy bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <motion.div variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Pending Count',
            value: visiblePending.length.toString(),
            icon: <Clock className="w-5 h-5" />,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
          },
          {
            label: 'Pending Value',
            value: formatCurrency(visiblePending.reduce((s, d) => s + d.amount, 0)),
            icon: <DollarSign className="w-5 h-5" />,
            color: 'text-navy',
            bgColor: 'bg-blue-50',
          },
          {
            label: "Today's Approved",
            value: todaysApproved.length.toString(),
            subValue: formatCurrency(todaysApprovedValue),
            icon: <CheckCircle2 className="w-5 h-5" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
          },
          {
            label: "Today's Rejected",
            value: rejectedIds.size.toString(),
            icon: <XCircle className="w-5 h-5" />,
            color: 'text-red-600',
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
            </div>
            <p className="text-2xl font-bold text-navy">{stat.value}</p>
            {'subValue' in stat && stat.subValue && (
              <p className="text-xs font-medium text-gray-500 mt-0.5">{stat.subValue}</p>
            )}
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Batch Actions Toolbar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-navy rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <SquareCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-white">
                  {selectedRows.size} disbursement{selectedRows.size > 1 ? 's' : ''} selected
                </span>
                <span className="text-xs text-white/60">
                  ({formatCurrency(
                    visiblePending
                      .filter((d) => selectedRows.has(d.id))
                      .reduce((s, d) => s + d.amount, 0)
                  )} total)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBatchApprove}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Selected
                </button>
                <button
                  onClick={handleBatchReject}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Reject Selected
                </button>
                <button
                  onClick={() => setSelectedRows(new Set())}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white rounded-lg transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search ───────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp} className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pending disbursements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:border-teal"
          />
        </div>
      </motion.div>

      {/* ── Approval Queue Table ──────────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-500" />
            Approval Queue ({visiblePending.length})
          </h3>
          <span className="text-xs text-gray-400">Approved applications awaiting disbursement</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-cream/50">
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={toggleAll}
                    className="flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-gray-200"
                  >
                    {isAllSelected ? (
                      <SquareCheck className="w-4 h-4 text-teal" />
                    ) : isSomeSelected ? (
                      <MinusSquare className="w-4 h-4 text-teal" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-300" />
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Application</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Loan Type</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Grade</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Officer</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visiblePending.map((disb, i) => {
                const gradeConfig = riskGradeColors[disb.riskGrade] || riskGradeColors.B;
                const isSelected = selectedRows.has(disb.id);
                return (
                  <motion.tr
                    key={disb.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`transition-colors ${isSelected ? 'bg-teal/5' : 'hover:bg-cream/50'}`}
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleRow(disb.id)}
                        className="flex items-center justify-center w-5 h-5 rounded transition-colors hover:bg-gray-200"
                      >
                        {isSelected ? (
                          <SquareCheck className="w-4 h-4 text-teal" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs text-gray-500">{disb.appId}</span>
                      <p className="text-[10px] text-gray-400 mt-0.5">Approved: {disb.approvedDate}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/members/${disb.memberId}`} className="font-medium text-navy hover:text-teal transition-colors text-sm">
                        {disb.memberName}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] text-gray-400">{disb.country}</span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400">{disb.crop}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-navy tabular-nums">
                      ${disb.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-gray-600">{disb.loanType}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${gradeConfig.bg} ${gradeConfig.text}`}>
                        {disb.riskGrade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">{disb.officer}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleApprove(disb.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                          title="Approve & Disburse"
                        >
                          <Check className="w-3 h-3" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(disb.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <X className="w-3 h-3" />
                          Reject
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {visiblePending.length === 0 && (
          <div className="p-12 text-center">
            <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500 font-medium">All clear!</p>
            <p className="text-xs text-gray-400 mt-1">No pending disbursements in the queue.</p>
          </div>
        )}
      </motion.div>

      {/* ── Recent Disbursements Log ──────────────────────────────────────── */}
      <motion.div variants={cardVariants} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-navy text-sm flex items-center gap-2">
            <ArrowDownToLine className="w-4 h-4 text-teal" />
            Recent Disbursements
          </h3>
          <span className="text-xs text-gray-400">Last 10 completed disbursements</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 bg-cream/50">
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Member</th>
                <th className="text-right py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Disbursed</th>
                <th className="text-left py-3 px-5 text-xs font-medium text-gray-400 uppercase tracking-wider">Processed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentDisbursements.map((disb, i) => {
                const cfg = disbursementStatusConfig[disb.status] || disbursementStatusConfig.completed;
                const date = new Date(disb.disbursedAt);
                return (
                  <motion.tr
                    key={disb.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-cream/50 transition-colors"
                  >
                    <td className="py-3 px-5 font-mono text-xs text-gray-500">{disb.id}</td>
                    <td className="py-3 px-5">
                      <div>
                        <span className="font-medium text-navy text-sm">{disb.memberName}</span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{disb.country}</p>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-right font-medium text-navy tabular-nums">
                      ${disb.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-5 text-xs text-gray-600">{disb.loanType}</td>
                    <td className="py-3 px-5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <div>
                        <span className="text-xs text-gray-600">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-5 text-xs text-gray-500">{disb.processedBy}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── Approved/Rejected feedback (inline) ──────────────────────────── */}
      <AnimatePresence>
        {(approvedIds.size > 0 || rejectedIds.size > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white rounded-xl border border-gray-100 p-5"
          >
            <h3 className="font-semibold text-navy text-sm mb-3">Session Actions</h3>
            <div className="flex flex-wrap gap-3">
              {approvedIds.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">
                    {approvedIds.size} disbursement{approvedIds.size > 1 ? 's' : ''} approved
                  </span>
                </div>
              )}
              {rejectedIds.size > 0 && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">
                    {rejectedIds.size} disbursement{rejectedIds.size > 1 ? 's' : ''} rejected
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
